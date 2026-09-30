"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useRef } from "react";
import ThreeModel from "./ThreeModel";

const imagesBack = ["Csharp.png", "angular.png", "kafka.png", "PostgreSQL.png", "redis.png", "spring.png"];
const imagesTop = ["cpp2.png", "docker.png", "grpc.png", "next.png", "java.png", "react.png", "Rust.png"];

export default function MainPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const anglesRef = useRef<number[]>([]);
  const speedsRef = useRef<number[]>([]);
  const zWavesRef = useRef<number[]>([]);
  const localTimesRef = useRef<number[]>([]);
  const lastPositionsRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);


  useEffect(() => {
    if (!containerRef.current) return;

    const icons = Array.from(
      containerRef.current.querySelectorAll(`.${styles.floating}`)
    ) as HTMLElement[];
    const count = icons.length;

    if (anglesRef.current.length === 0 || anglesRef.current.length !== count) {
      anglesRef.current = Array.from({ length: count }, () => Math.random() * Math.PI * 2);
      speedsRef.current = Array.from({ length: count }, () => Math.random() * 0.5 + 0.2);
      zWavesRef.current = Array.from({ length: count }, () => Math.random() * 2);
      localTimesRef.current = Array.from({ length: count }, () => Math.random() * 10);
      lastPositionsRef.current = Array.from({ length: count }, () => ({
        x: 0,
        y: 0,
        z: 0,
      }));
    }

    lastFrameTimeRef.current = performance.now() / 1000;

    function animate() {
      const now = performance.now() / 1000;
      const delta = Math.max(0, now - lastFrameTimeRef.current);
      lastFrameTimeRef.current = now;

      const rect = containerRef.current?.getBoundingClientRect();
      const currentSize = rect ? rect.width : 900;
      
      const dynamicRadius = currentSize * 0.4; 
      const centerX = currentSize / 2;
      const centerY = currentSize / 2;

      icons.forEach((icon, i) => {
        const isHovered = hoveredIndexRef.current === i;

        if (!isHovered) {
          localTimesRef.current[i] += delta;
          anglesRef.current[i] += speedsRef.current[i] * delta;
        }

        const t = localTimesRef.current[i];
        const chaos = Math.sin(t + i) * 0.3 + 1;
        
        const orbitX = Math.cos(anglesRef.current[i]) * dynamicRadius * chaos;
        const orbitY = Math.sin(anglesRef.current[i]) * dynamicRadius * chaos * 0.7;
        const z = Math.sin(t * 0.5 + zWavesRef.current[i]) * 100;

        const x = centerX + orbitX;
        const y = centerY + orbitY;

        lastPositionsRef.current[i] = { x, y, z };

        icon.style.transform = `
          translate3d(${x}px, ${y}px, ${z}px)
          rotate(${anglesRef.current[i] * 20}deg)
        `;
      });

      rafIdRef.current = requestAnimationFrame(animate);
    }

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleMouseEnter = (i: number) => {
    hoveredIndexRef.current = i;
  };

  const handleMouseLeave = () => {
    hoveredIndexRef.current = null;
  };

  const getOfficialUrl = (index: number) => {
    const backUrls = [
      "https://learn.microsoft.com/dotnet/csharp/", 
      "https://angular.io/", 
      "https://kafka.apache.org/", 
      "https://www.postgresql.org/",
      "https://redis.io/", 
      "https://spring.io/",
    ];

    const topUrls = [
      "https://isocpp.org/", 
      "https://www.docker.com/", 
      "https://grpc.io/", 
      "https://nextjs.org/", 
      "https://www.oracle.com/java/",
      "https://react.dev/",
      "https://www.rust-lang.org/",
    ];

    if (index < backUrls.length) return backUrls[index];
    const topIndex = index - backUrls.length;
    return topUrls[topIndex] ?? "";
  };

  const GoToWeb = (index: number) => {
    const url = getOfficialUrl(index);
    if (!url) {
      console.warn("No URL mapped for index", index);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.main}>
      <div className={styles.centerWrapper}>
        <div ref={containerRef} className={styles.iconsContainer}>
          {imagesBack.map((img, i) => (
            <a
              className={styles.clickBack}
              key={i}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => GoToWeb(i)}
            >
              <Image
                src={`/Language_it/${img}`}
                alt={`lang-${i}`}
                width={60}
                height={60}
                className={styles.floating}
              />
            </a>
          ))}

          <div className={styles.threed}>
            <ThreeModel />
          </div>

          {imagesTop.map((img, i) => (
            <a
              className={styles.clickTop}
              key={i + imagesBack.length}
              onMouseEnter={() => handleMouseEnter(i + imagesBack.length)}
              onMouseLeave={handleMouseLeave}
              onClick={() => GoToWeb(i + imagesBack.length)}
            >
              <Image
                src={`/Language_it/${img}`}
                alt={`lang-${i}`}
                width={60}
                height={60}
                className={styles.floating}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}