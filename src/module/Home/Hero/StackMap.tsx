"use client";

import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  SiAngular,
  SiClaude,
  SiDocker,
  SiDotnet,
  SiGooglegemini,
  SiNodedotjs,
  SiOpentelemetry,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import styles from "./StackMap.module.css";
import { TECH_NAMES, TECH_SELECT_EVENT, type TechId } from "../techs";

/*
 * My stack drawn as a running system: the interface calls services, services call AI models and data.
 * Dotted wires connect the parts, "requests" travel along them, and the dot field behind reacts to the cursor.
 */

type Node = { id: TechId; Icon: IconType; color: string; label?: string };
type Group = { label: string; nodes: Node[] };

const COLUMNS: Group[][] = [
  [
    {
      label: "Interface",
      nodes: [
        { id: "react", Icon: SiReact, color: "#61dafb" },
        { id: "angular", Icon: SiAngular, color: "#ff3d5f" },
        { id: "typescript", Icon: SiTypescript, color: "#4a9be0" },
      ],
    },
  ],
  [
    {
      label: "Services",
      nodes: [
        { id: "dotnet", Icon: SiDotnet, color: "#9b7bff", label: "ASP.NET Core" },
        { id: "node", Icon: SiNodedotjs, color: "#6cc24a" },
        { id: "python", Icon: SiPython, color: "#ffd43b" },
      ],
    },
  ],
  [
    {
      label: "AI",
      nodes: [
        { id: "gemini", Icon: SiGooglegemini, color: "#a58cf0" },
        { id: "claude", Icon: SiClaude, color: "#e08a6a" },
      ],
    },
    {
      label: "Data and ops",
      nodes: [
        { id: "postgresql", Icon: SiPostgresql, color: "#6d8eff" },
        { id: "docker", Icon: SiDocker, color: "#2496ed" },
        { id: "opentelemetry", Icon: SiOpentelemetry, color: "#f5a800" },
      ],
    },
  ],
];

// Wires, from left to right. Each one exists in at least one of my projects.
const EDGES: [TechId, TechId][] = [
  ["react", "dotnet"],
  ["react", "python"],
  ["typescript", "python"],
  ["typescript", "node"],
  ["angular", "dotnet"],
  ["angular", "node"],
  ["dotnet", "gemini"],
  ["dotnet", "claude"],
  ["python", "gemini"],
  ["dotnet", "postgresql"],
  ["node", "postgresql"],
  ["dotnet", "docker"],
  ["python", "docker"],
  ["dotnet", "opentelemetry"],
];

// A request goes interface → service → AI or data.
const ROUTES: TechId[][] = [
  ["react", "dotnet", "gemini"],
  ["react", "dotnet", "postgresql"],
  ["angular", "dotnet", "claude"],
  ["angular", "node", "postgresql"],
  ["typescript", "python", "gemini"],
  ["react", "python", "docker"],
  ["typescript", "node", "postgresql"],
  ["react", "dotnet", "opentelemetry"],
  ["angular", "dotnet", "docker"],
];

type Point = { x: number; y: number };
type Packet = { route: TechId[]; leg: number; t: number; speed: number };

export default function StackMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<TechId | null>(null);
  const [hovered, setHovered] = useState<TechId | null>(null);

  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    // Wire geometry: sampled points along a curve, per edge key "a>b".
    const wires = new Map<string, Point[]>();
    // Background dot field on springs.
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let posX = new Float32Array(0);
    let posY = new Float32Array(0);
    let velX = new Float32Array(0);
    let velY = new Float32Array(0);
    let count = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    const packets: Packet[] = [];
    let nextSpawn = 0;
    let rafId: number | null = null;
    let visible = true;

    const nodeEl = (id: TechId) => root.querySelector<HTMLElement>(`[data-node="${id}"]`);

    const layout = () => {
      const rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      wires.clear();
      for (const [from, to] of EDGES) {
        const a = nodeEl(from)?.getBoundingClientRect();
        const b = nodeEl(to)?.getBoundingClientRect();
        if (!a || !b) continue;
        const start = { x: a.right - rect.left + 4, y: a.top + a.height / 2 - rect.top };
        const end = { x: b.left - rect.left - 4, y: b.top + b.height / 2 - rect.top };
        wires.set(`${from}>${to}`, sampleCurve(start, end, 7));
      }

      const gap = 16;
      const xs: number[] = [];
      const ys: number[] = [];
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          xs.push(x);
          ys.push(y);
        }
      }
      count = xs.length;
      homeX = Float32Array.from(xs);
      homeY = Float32Array.from(ys);
      posX = Float32Array.from(xs);
      posY = Float32Array.from(ys);
      velX = new Float32Array(count);
      velY = new Float32Array(count);
    };

    const pulse = (id: TechId) => {
      const el = nodeEl(id);
      if (!el) return;
      el.dataset.pulse = "false";
      void el.offsetWidth; // restart the animation
      el.dataset.pulse = "true";
    };

    const spawn = (now: number) => {
      if (now < nextSpawn || packets.length > 7) return;
      const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
      packets.push({ route, leg: 0, t: 0, speed: 0.9 + Math.random() * 0.5 });
      nextSpawn = now + 380 + Math.random() * 520;
    };

    const draw = (now: number, dt: number) => {
      ctx.clearRect(0, 0, width, height);
      const hover = hoverRef.current;

      // Dot field: pushed away from the cursor, springs back.
      const pushR = 90;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        if (!reduced.matches) {
          let fx = (homeX[i] - posX[i]) * 0.08;
          let fy = (homeY[i] - posY[i]) * 0.08;
          const dx = posX[i] - pointerX;
          const dy = posY[i] - pointerY;
          const d = Math.hypot(dx, dy);
          if (d < pushR && d > 0.1) {
            const f = (1 - d / pushR) ** 2 * 5;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
          velX[i] = (velX[i] + fx) * 0.78;
          velY[i] = (velY[i] + fy) * 0.78;
          posX[i] += velX[i];
          posY[i] += velY[i];
        }
        ctx.moveTo(posX[i] + 1, posY[i]);
        ctx.arc(posX[i], posY[i], 1, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(150, 165, 155, 0.16)";
      ctx.fill();

      // Wires as dotted curves; the ones touching the hovered part light up.
      for (const lit of [false, true]) {
        ctx.beginPath();
        for (const [key, points] of wires) {
          const [from, to] = key.split(">");
          const isLit = hover !== null && (from === hover || to === hover);
          if (isLit !== lit) continue;
          for (const p of points) {
            ctx.moveTo(p.x + 1.3, p.y);
            ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
          }
        }
        ctx.fillStyle = lit ? "rgba(48, 209, 88, 0.75)" : hover ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.26)";
        ctx.fill();
      }

      if (reduced.matches) return;

      // Requests travelling along the wires.
      spawn(now);
      for (let k = packets.length - 1; k >= 0; k--) {
        const packet = packets[k];
        const points = wires.get(`${packet.route[packet.leg]}>${packet.route[packet.leg + 1]}`);
        if (!points || points.length < 2) {
          packets.splice(k, 1);
          continue;
        }
        packet.t += (dt / 1000) * packet.speed * (220 / (points.length * 7));
        if (packet.t >= 1) {
          pulse(packet.route[packet.leg + 1]);
          packet.leg++;
          packet.t = 0;
          if (packet.leg >= packet.route.length - 1) {
            packets.splice(k, 1);
          }
          continue;
        }
        const head = packet.t * (points.length - 1);
        for (let trail = 0; trail < 6; trail++) {
          const index = Math.floor(head) - trail;
          if (index < 0) break;
          const p = points[index];
          const alpha = 1 - trail / 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, trail === 0 ? 3.2 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${trail === 0 ? "190, 255, 205" : "48, 209, 88"}, ${alpha})`;
          if (trail === 0) {
            ctx.shadowColor = "rgba(48, 209, 88, 0.9)";
            ctx.shadowBlur = 12;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      draw(now, dt);
      rafId = visible && !reduced.matches ? requestAnimationFrame(frame) : null;
    };

    const start = () => {
      if (rafId === null && visible) {
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    };

    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (reduced.matches) start();
    };

    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });

    const resize = new ResizeObserver(() => {
      layout();
      start();
    });

    layout();
    observer.observe(root);
    resize.observe(root);
    // Fonts change the size of the labels, so measure again once they arrive.
    document.fonts?.ready.then(() => layout());
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    const onMotionChange = () => start();
    reduced.addEventListener("change", onMotionChange);
    start();

    return () => {
      stop();
      observer.disconnect();
      resize.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  // Redraw once on hover changes when motion is reduced (no running loop then).
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rootRef.current?.dispatchEvent(new PointerEvent("pointermove"));
  }, [hovered]);

  const select = (id: TechId) => {
    window.dispatchEvent(new CustomEvent(TECH_SELECT_EVENT, { detail: id }));
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const connected = (id: TechId) =>
    hovered !== null && (id === hovered || EDGES.some(([a, b]) => (a === hovered && b === id) || (b === hovered && a === id)));

  return (
    <div className={styles.map} ref={rootRef} role="group" aria-label="My stack as a running system">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {COLUMNS.map((groups, column) => (
        <div key={column} className={styles.column}>
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.nodes.map(({ id, Icon, color, label }) => (
                <button
                  key={id}
                  type="button"
                  data-node={id}
                  className={styles.node}
                  data-dim={hovered !== null && !connected(id)}
                  style={{ "--brand": color } as React.CSSProperties}
                  aria-label={`Show projects that use ${TECH_NAMES[id]}`}
                  onClick={() => select(id)}
                  onPointerEnter={() => setHovered(id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                >
                  <Icon aria-hidden="true" className={styles.icon} />
                  <span>{label ?? TECH_NAMES[id]}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function sampleCurve(a: Point, b: Point, spacing: number): Point[] {
  const dx = (b.x - a.x) * 0.5;
  const c1 = { x: a.x + dx, y: a.y };
  const c2 = { x: b.x - dx, y: b.y };
  const at = (t: number): Point => {
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
      y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
    };
  };
  // Rough length, then evenly spaced samples.
  let length = 0;
  let prev = a;
  for (let i = 1; i <= 24; i++) {
    const p = at(i / 24);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const steps = Math.max(2, Math.round(length / spacing));
  return Array.from({ length: steps + 1 }, (_, i) => at(i / steps));
}
