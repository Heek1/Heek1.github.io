"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import ThreeModel from "./ThreeModel";

type Tech = {
  name: string;
  icon: string;
  url: string;
  /** Dark logos get a light tint so they stay visible on the dark background. */
  tint?: "light" | "invert";
};

const TECH: Tech[] = [
  { name: "C#", icon: "csharp.webp", url: "https://learn.microsoft.com/dotnet/csharp/" },
  { name: "Angular", icon: "angular.webp", url: "https://angular.dev/" },
  { name: "Apache Kafka", icon: "kafka.webp", url: "https://kafka.apache.org/", tint: "light" },
  { name: "PostgreSQL", icon: "postgresql.webp", url: "https://www.postgresql.org/" },
  { name: "Redis", icon: "redis.webp", url: "https://redis.io/" },
  { name: "Spring", icon: "spring.webp", url: "https://spring.io/" },
  { name: "C++", icon: "cpp.webp", url: "https://isocpp.org/" },
  { name: "Docker", icon: "docker.webp", url: "https://www.docker.com/" },
  { name: "gRPC", icon: "grpc.webp", url: "https://grpc.io/", tint: "light" },
  { name: "Next.js", icon: "nextjs.webp", url: "https://nextjs.org/", tint: "invert" },
  { name: "Java", icon: "java.webp", url: "https://www.oracle.com/java/" },
  { name: "React", icon: "react.webp", url: "https://react.dev/" },
  { name: "Rust", icon: "rust.webp", url: "https://www.rust-lang.org/", tint: "light" },
];

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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId: number | null = null;
    let lastFrameTime = performance.now() / 1000;
    let visible = true;

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
        const x = centerX + Math.cos(angles[i]) * radius * chaos - half;
        const y = centerY + Math.sin(angles[i]) * radius * chaos * 0.7 - half;
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

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  const renderTech = (tech: Tech, index: number) => (
    <a
      key={tech.name}
      href={tech.url}
      target="_blank"
      rel="noopener noreferrer"
      title={tech.name}
      className={styles.techLink}
      onMouseEnter={() => (pausedIndexRef.current = index)}
      onMouseLeave={() => (pausedIndexRef.current = null)}
      onFocus={() => (pausedIndexRef.current = index)}
      onBlur={() => (pausedIndexRef.current = null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, images are pre-optimized WebP */}
      <img
        src={`/Language_it/${tech.icon}`}
        alt={tech.name}
        width={64}
        height={64}
        loading="eager"
        decoding="async"
        className={tech.tint ? styles[tech.tint] : undefined}
      />
    </a>
  );

  return (
    <div className={styles.main}>
      <div ref={containerRef} className={styles.iconsContainer}>
        <ThreeModel className={styles.threed} />
        {TECH.map(renderTech)}
      </div>
    </div>
  );
}
