"use client";

import { useEffect, useRef } from "react";
import styles from "./About.module.css";
import TextLink from "@/components/text-link/TextLink";

export default function About() {
  const eyesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eyes = eyesRef.current;
    if (!eyes) return;
    let frame: number | null = null;
    const moveEyes = (event: PointerEvent) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateEyes(event);
      });
    };
    const updateEyes = (event: PointerEvent) => {
      const bounds = eyes.getBoundingClientRect();
      const x = event.clientX - (bounds.left + bounds.width / 2);
      const y = event.clientY - (bounds.top + bounds.height / 2);
      const angle = Math.atan2(y, x);
      const distance = Math.min(12, Math.hypot(x, y) / 30);
      eyes.style.setProperty("--pupil-x", `${Math.cos(angle) * distance}px`);
      eyes.style.setProperty("--pupil-y", `${Math.sin(angle) * distance}px`);
    };
    window.addEventListener("pointermove", moveEyes, { passive: true });
    return () => {
      window.removeEventListener("pointermove", moveEyes);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.eyeArtwork} role="img" aria-label="Illustration: a pair of eyes following your cursor">
        <div className={`${styles.orbit} ${styles.orbitOne}`} />
        <div className={`${styles.orbit} ${styles.orbitTwo}`} />
        <div className={styles.eyePair} ref={eyesRef}>
          <div className={styles.eye}><span className={styles.pupil} /></div>
          <div className={styles.eye}><span className={styles.pupil} /></div>
        </div>
      </div>
      <div className={styles.AboutMe}>
          <h2 id="about-title">About me</h2>
          <p>Full-stack developer with a backend focus. Currently studying Artificial Intelligence at <TextLink href="https://www.tuke.sk">TUKE</TextLink> (Košice). Previously graduated from <TextLink href="https://itstep.org">IT-Step Academy</TextLink> with a degree in Software Development. Took part in a <TextLink href="https://hackkosice.com">hackathon</TextLink> in 2026.</p>
          <p>I work on both individual assignments and team projects — and have led several of those teams. In every case, I follow the same rule: build exactly what the spec asks for, nothing extra. Minimal, predictable code that&apos;s easy to review isn&apos;t a compromise — it&apos;s a deliberate way of working.</p>
          <p>On the backend I write ASP.NET Core, Node.js/Express, and Nest.js; on the frontend, React and Angular with RxJS. I don&apos;t shy away from infrastructure either: Docker, Kubernetes, GitLab CI, deployment on AWS/GCP. Lately I&apos;ve been adding AI/LLM integrations to projects — I&apos;m interested in how AI fits into real backend systems, not as a bolt-on feature.</p>
      </div>
    </div>
  );
}