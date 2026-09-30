"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./popup.module.css";
import { createPortal } from "react-dom";

type Props = {
  buttonLabel?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const Social = [
  {
    id: "1",
    label: "LinkedIn",
    Logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Linkedin_icon.svg",
    href: "https://www.linkedin.com/in/vladyslav-yuzevych-7a43a8361/",
  },
  {
    id: "2",
    label: "Telegram",
    Logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    href: "https://t.me/vladik_heek",
  },
  {
    id: "3",
    label: "Email",
    Logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    href: "mailto:vladyuzevuts@gmail.com",
  },
  {
    id: "4",
    label: "Github",
    Logo: "/svg/github-svgrepo-com.svg",
    href: "https://github.com/Heek1",
  },
];

export default function PopupButton({ buttonLabel = "Contact me", children, className }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    function updatePos() {
      const btn = btnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const top = rect.bottom + 8;
      const left = rect.left;
      const width = rect.width;
      setPos({ top, left, width });
    }

    if (open) updatePos();

    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className={`${styles.trigger} ${className ?? ""}`}
        aria-expanded={open}
        aria-controls="popup-panel"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {buttonLabel}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              id="popup-panel"
              role="dialog"
              aria-modal="false"
              className={styles.panel}
              style={{
                position: "fixed",
                top: pos.top,
                left: Math.max(8, pos.left),
                minWidth: Math.max(200, pos.width),
                zIndex: 9999,
              }}
            >   
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection:"column" }}>
                {Social.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.buttons}
                  >
                    <img
                      src={item.Logo}
                      alt={item.label}
                      width={30}
                      height={30}
                      style={{ borderRadius: 8, display: "block" }}
                    />
                    <span style={{ fontSize: 12, marginTop: 6 }}>{item.label}</span>
                  </a>
                ))}
              </div>

              {children ? <div style={{ marginTop: 12 }}>{children}</div> : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}