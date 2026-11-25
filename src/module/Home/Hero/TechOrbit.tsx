"use client";

import { useEffect, useRef } from "react";
import type { IconType } from "react-icons";
import {
  SiAngular,
  SiClaude,
  SiDocker,
  SiDotnet,
  SiFastapi,
  SiGooglegemini,
  SiNodedotjs,
  SiOpentelemetry,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import styles from "./Hero.module.css";
import ThreeModel from "./ThreeModel";
import { TECH_NAMES, TECH_SELECT_EVENT, type TechId } from "../techs";

type Tech = { id: TechId; Icon: IconType; color: string };

// Brand colours, lightened where the original is too dark for the background.
const TECH: Tech[] = [
  { id: "dotnet", Icon: SiDotnet, color: "#9b7bff" },
  { id: "postgresql", Icon: SiPostgresql, color: "#6d8eff" },
  { id: "react", Icon: SiReact, color: "#61dafb" },
  { id: "python", Icon: SiPython, color: "#ffd43b" },
  { id: "docker", Icon: SiDocker, color: "#2496ed" },
  { id: "csharp", Icon: TbBrandCSharp, color: "#b48cf2" },
  { id: "gemini", Icon: SiGooglegemini, color: "#a58cf0" },
  { id: "typescript", Icon: SiTypescript, color: "#4a9be0" },
  { id: "fastapi", Icon: SiFastapi, color: "#1fbfa9" },
  { id: "angular", Icon: SiAngular, color: "#ff3d5f" },
  { id: "claude", Icon: SiClaude, color: "#e08a6a" },
  { id: "node", Icon: SiNodedotjs, color: "#6cc24a" },
  { id: "opentelemetry", Icon: SiOpentelemetry, color: "#f5a800" },
];

const PUSH_RADIUS = 120;

export default function TechOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const icons = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.techLink}`));

    const angles = icons.map(() => Math.random() * Math.PI * 2);
    const speeds = icons.map(() => Math.random() * 0.5 + 0.2);
    const zWaves = icons.map(() => Math.random() * 2);
    const localTimes = icons.map(() => Math.random() * 10);
    // Extra offset from the cursor pushing an icon, on a spring back to zero.
    const offsetX = icons.map(() => 0);
    const offsetY = icons.map(() => 0);
    const velX = icons.map(() => 0);
    const velY = icons.map(() => 0);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId: number | null = null;
    let lastFrameTime = performance.now() / 1000;
    let visible = true;
    let pointerX = -9999;
    let pointerY = -9999;

    function place(delta: number) {
      const width = container!.clientWidth || 800;
      const height = container!.clientHeight || width;
      const radius = width * 0.4;
      const centerX = width / 2;
      const centerY = height / 2;

      icons.forEach((icon, i) => {
        if (pausedIndexRef.current !== i) {
          localTimes[i] += delta;
          angles[i] += speeds[i] * delta;
        }
        const t = localTimes[i];
        const chaos = Math.sin(t + i) * 0.3 + 1;
        const half = icon.offsetWidth / 2;
        const baseX = centerX + Math.cos(angles[i]) * radius * chaos;
        const baseY = centerY + Math.sin(angles[i]) * radius * chaos * 0.7;

        if (!reducedMotion.matches) {
          const dx = baseX + offsetX[i] - pointerX;
          const dy = baseY + offsetY[i] - pointerY;
          const dist = Math.hypot(dx, dy);
          let fx = -offsetX[i] * 0.06;
          let fy = -offsetY[i] * 0.06;
          if (dist < PUSH_RADIUS && dist > 0.1 && pausedIndexRef.current !== i) {
            const f = (1 - dist / PUSH_RADIUS) ** 2 * 9;
            fx += (dx / dist) * f;
            fy += (dy / dist) * f;
          }
          velX[i] = (velX[i] + fx) * 0.8;
          velY[i] = (velY[i] + fy) * 0.8;
          offsetX[i] += velX[i];
          offsetY[i] += velY[i];
        }

        const x = baseX + offsetX[i] - half;
        const y = baseY + offsetY[i] - half;
        const z = Math.sin(t * 0.5 + zWaves[i]) * 100;
        icon.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotate(${angles[i] * 20}deg)`;
      });
    }

    function frame() {
      const now = performance.now() / 1000;
      const delta = Math.min(0.1, Math.max(0, now - lastFrameTime));
      lastFrameTime = now;
      place(delta);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId !== null || !visible || reducedMotion.matches) return;
      lastFrameTime = performance.now() / 1000;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function onMotionChange() {
      if (reducedMotion.matches) {
        stop();
        place(0);
      } else {
        start();
      }
    }

    function onPointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    }

    function onPointerLeave() {
      pointerX = -9999;
      pointerY = -9999;
    }

    // Stop animating when the hero is scrolled out of view.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => place(0));
    resizeObserver.observe(container);

    place(0);
    start();
    reducedMotion.addEventListener("change", onMotionChange);
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const select = (id: TechId) => {
    window.dispatchEvent(new CustomEvent(TECH_SELECT_EVENT, { detail: id }));
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.main}>
      <div className={styles.iconsContainer} ref={containerRef}>
        <ThreeModel className={styles.threed} />
        {TECH.map(({ id, Icon, color }, index) => (
          <button
            key={id}
            type="button"
            className={styles.techLink}
            style={{ color }}
            title={TECH_NAMES[id]}
            aria-label={`Show projects that use ${TECH_NAMES[id]}`}
            onClick={() => select(id)}
            onMouseEnter={() => (pausedIndexRef.current = index)}
            onMouseLeave={() => (pausedIndexRef.current = null)}
            onFocus={() => (pausedIndexRef.current = index)}
            onBlur={() => (pausedIndexRef.current = null)}
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
