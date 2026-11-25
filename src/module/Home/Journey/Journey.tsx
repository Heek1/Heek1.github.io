"use client";

import { useEffect, useRef } from "react";
import styles from "./Journey.module.css";

interface Milestone {
  date: string;
  title: string;
  detail: string;
  href?: string;
}

// Oldest first. Dates come from certificates, GitHub history and Vlad's own account of his studies.
const MILESTONES: Milestone[] = [
  {
    date: "June 2024",
    title: "Started at IT-Step Academy",
    detail: "Software Development. The first homework went to GitHub the same month.",
  },
  {
    date: "April 2025",
    title: "C++ Essentials 1",
    detail: "First Cisco Networking Academy certificate.",
  },
  {
    date: "May 2025",
    title: "C Essentials 1 and Python Essentials 1",
    detail: "Two more Cisco certificates in one month.",
  },
  {
    date: "September 2025",
    title: "Started Artificial Intelligence at TUKE",
    detail: "Technical University of Košice. Now in my second year.",
    href: "https://www.tuke.sk",
  },
  {
    date: "September 2025",
    title: "C++ Essentials 2 and Python Essentials 2",
    detail: "The second level of both courses.",
  },
  {
    date: "April 2026",
    title: "HackKosice 2026",
    detail: "First hackathon: SplitPay, an app for personal and shared money jars, built with a team.",
  },
  {
    date: "May 2026",
    title: "Prompt Manager",
    detail: "Started a self-hosted tool for versioning and testing AI prompts.",
    href: "https://github.com/Heek1/AI-Prompt-Management-System",
  },
  {
    date: "September 2026",
    title: "Graduated from IT-Step Academy with honours",
    detail: "Two years and three months of Software Development, finished with top marks.",
  },
  {
    date: "November 2026",
    title: "Magna Hackathon 2026",
    detail: "Led a team of four and built the backend of OEE Engine in a few days.",
    href: "https://github.com/Heek1/magna-hackathon-2026",
  },
  {
    date: "November 2026",
    title: "ProofFit",
    detail: "A resume checker where every verdict has to point at evidence.",
    href: "https://github.com/Heek1/prooffit",
  },
];

export default function Journey() {
  const listRef = useRef<HTMLOListElement>(null);

  // Fill the rail as the list scrolls past the middle of the screen, and light up the milestones it reaches.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("li"));
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const rect = list.getBoundingClientRect();
      const line = window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, (line - rect.top) / (rect.height || 1)));
      list.style.setProperty("--progress", progress.toFixed(4));
      items.forEach((item) => {
        const top = item.getBoundingClientRect().top;
        item.dataset.reached = String(top < line);
      });
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h2 id="journey-title" className={styles.heading}>
          Journey
        </h2>
        <p className={styles.lead}>From the first homework to my own products, in order.</p>
      </header>

      <ol className={styles.list} ref={listRef}>
        {MILESTONES.map((milestone) => (
          <li key={`${milestone.date}-${milestone.title}`} className={styles.item}>
            <time className={styles.date}>{milestone.date}</time>
            <div className={styles.card}>
              <h3 className={styles.title}>
                {milestone.href ? (
                  <a href={milestone.href} target="_blank" rel="noopener noreferrer">
                    {milestone.title}
                  </a>
                ) : (
                  milestone.title
                )}
              </h3>
              <p className={styles.detail}>{milestone.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
