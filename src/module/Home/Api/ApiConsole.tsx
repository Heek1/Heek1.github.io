"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ApiConsole.module.css";
import { ENDPOINTS, type Endpoint, type Json } from "./endpoints";

type TokenKind = "key" | "string" | "number" | "literal" | "punct";
type Token = { text: string; kind: TokenKind; href?: string };
type Line = Token[];

const LINE_MS = 32;

export default function ApiConsole() {
  const [active, setActive] = useState<Endpoint | null>(null);
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  const [latency, setLatency] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const send = useCallback((endpoint: Endpoint) => {
    clearTimers();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = Math.round(70 + Math.random() * 170);
    const body = toLines(endpoint.body);
    setActive(endpoint);
    setLatency(ms);
    setLines(body);
    setShown(0);
    setPhase("sending");
    if (reduced) {
      setPhase("done");
      setShown(body.length);
      return;
    }
    timers.current.push(
      window.setTimeout(() => {
        setPhase("done");
        body.forEach((_, index) => {
          timers.current.push(window.setTimeout(() => setShown(index + 1), (index + 1) * LINE_MS));
        });
      }, ms + 260)
    );
  }, []);

  // Run the first request when the console first scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          send(ENDPOINTS[0]);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [send]);

  const statusClass = !active
    ? ""
    : active.status >= 400
      ? styles.statusWarn
      : styles.statusOk;

  return (
    <div className={styles.console} ref={rootRef}>
      <ul className={styles.endpoints} aria-label="Requests">
        {ENDPOINTS.map((endpoint) => {
          const isActive = active?.path === endpoint.path && active.method === endpoint.method;
          return (
            <li key={`${endpoint.method} ${endpoint.path}`}>
              <button
                type="button"
                className={styles.endpoint}
                aria-pressed={isActive}
                onClick={() => send(endpoint)}
              >
                <span className={styles.method} data-method={endpoint.method}>
                  {endpoint.method}
                </span>
                <code className={styles.path}>{endpoint.path}</code>
                <span className={styles.label}>{endpoint.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.terminal}>
        <div className={styles.bar} aria-hidden="true">
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.title}>vlad-api</span>
        </div>
        <div className={styles.screen} aria-live="polite">
          {!active && <p className={styles.placeholder}>Pick a request to send it.</p>}
          {active && (
            <>
              <p className={styles.request}>
                <span className={styles.prompt} aria-hidden="true">
                  &gt;
                </span>{" "}
                <span data-method={active.method} className={styles.requestMethod}>
                  {active.method}
                </span>{" "}
                {active.path} HTTP/1.1
              </p>
              {phase === "sending" && (
                <p className={styles.sending}>
                  Sending<span className={styles.ellipsis} aria-hidden="true" />
                </p>
              )}
              {phase === "done" && (
                <>
                  <p className={styles.statusLine}>
                    <span className={statusClass}>
                      {active.status} {active.statusText}
                    </span>
                    <span className={styles.meta}>{latency} ms</span>
                    <span className={styles.meta}>application/json</span>
                  </p>
                  <pre className={styles.json}>
                    {lines.slice(0, shown).map((line, index) => (
                      <span key={index} className={styles.line}>
                        {line.map((token, t) =>
                          token.href ? (
                            <a
                              key={t}
                              className={styles[token.kind]}
                              href={token.href}
                              target={token.href.startsWith("mailto:") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                            >
                              {token.text}
                            </a>
                          ) : (
                            <span key={t} className={styles[token.kind]}>
                              {token.text}
                            </span>
                          )
                        )}
                        {"\n"}
                      </span>
                    ))}
                    {shown < lines.length && <span className={styles.cursor} aria-hidden="true" />}
                  </pre>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function linkFor(value: string): string | undefined {
  if (/^https?:\/\//.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[a-z]+$/i.test(value)) return `mailto:${value}`;
  return undefined;
}

function valueTokens(value: Json): Token[] {
  if (typeof value === "string") return [{ text: JSON.stringify(value), kind: "string", href: linkFor(value) }];
  if (typeof value === "number") return [{ text: String(value), kind: "number" }];
  return [{ text: String(value), kind: "literal" }];
}

// Turn a JSON value into pretty-printed lines of coloured tokens.
function toLines(value: Json, indent = 0, key?: string, comma = false): Line[] {
  const pad: Token = { text: " ".repeat(indent), kind: "punct" };
  const head: Token[] = key === undefined ? [pad] : [pad, { text: JSON.stringify(key), kind: "key" }, { text: ": ", kind: "punct" }];
  const tail: Token[] = comma ? [{ text: ",", kind: "punct" }] : [];

  if (Array.isArray(value) || (value !== null && typeof value === "object")) {
    const entries: [string | undefined, Json][] = Array.isArray(value)
      ? value.map((item) => [undefined, item])
      : Object.entries(value);
    const [open, close] = Array.isArray(value) ? ["[", "]"] : ["{", "}"];

    // Short arrays of plain values fit on one line.
    if (Array.isArray(value) && value.every((item) => typeof item !== "object" || item === null)) {
      const inline: Token[] = [{ text: open, kind: "punct" }];
      value.forEach((item, index) => {
        inline.push(...valueTokens(item));
        if (index < value.length - 1) inline.push({ text: ", ", kind: "punct" });
      });
      inline.push({ text: close, kind: "punct" });
      return [[...head, ...inline, ...tail]];
    }

    const lines: Line[] = [[...head, { text: open, kind: "punct" }]];
    entries.forEach(([childKey, child], index) => {
      lines.push(...toLines(child, indent + 2, childKey, index < entries.length - 1));
    });
    lines.push([{ text: " ".repeat(indent), kind: "punct" }, { text: close, kind: "punct" }, ...tail]);
    return lines;
  }

  return [[...head, ...valueTokens(value), ...tail]];
}
