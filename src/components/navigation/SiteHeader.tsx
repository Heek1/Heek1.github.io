"use client";

import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";
import ContactPopup from "../contact/ContactPopup";

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "About me", id: "about" },
  { label: "Projects", id: "projects" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(NAV_ITEMS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 3);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highlight the section that currently crosses the middle of the viewport.
  useEffect(() => {
    const sections = NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 600) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const links = (onClick?: () => void) =>
    NAV_ITEMS.map((item) => {
      const active = activeId === item.id;
      return (
        <li key={item.id} className={`${styles.navItem} ${active ? styles.active : ""}`}>
          <a
            href={`#${item.id}`}
            className={styles.navLink}
            aria-current={active ? "true" : undefined}
            onClick={onClick}
          >
            {item.label}
          </a>
        </li>
      );
    });

  return (
    <header
      className={`${styles.header} ${scrolled || menuOpen ? styles.scrolled : ""} ${menuOpen ? styles.menuOpen : ""}`}
    >
      <div className={styles.inner}>
        <a href="#home" className={styles.brand} aria-label="Vladyslav Yuzevych, back to top">
          <span className={styles.brandFull}>Vladyslav Yuzevych</span>
          <span className={styles.brandShort} aria-hidden="true">Vlad Y.</span>
        </a>

        <nav className={`${styles.centerNav} ${scrolled ? styles.scrolled : ""}`} aria-label="Primary">
          <ul className={styles.navList}>{links()}</ul>
        </nav>

        <div className={styles.right}>
          <ContactPopup />
          <button
            type="button"
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-menu" className={styles.mobileNav} aria-label="Mobile">
          <ul className={styles.mobileList}>{links(() => setMenuOpen(false))}</ul>
        </nav>
      ) : null}
    </header>
  );
}
