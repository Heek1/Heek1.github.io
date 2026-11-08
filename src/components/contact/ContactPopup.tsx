"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import styles from "./ContactPopup.module.css";

type Props = {
  buttonLabel?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

type SocialLink = {
  label: string;
  href: string;
  Icon: IconType;
  color: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/vladyslav-yuzevych-7a43a8361/",
    Icon: FaLinkedin,
    color: "#0A66C2",
  },
  { label: "Telegram", href: "https://t.me/vladik_heek", Icon: FaTelegram, color: "#26A5E4" },
  { label: "Email", href: "mailto:vladyuzevuts@gmail.com", Icon: SiGmail, color: "#EA4335" },
  { label: "GitHub", href: "https://github.com/Heek1", Icon: FaGithub, color: "#ffffff" },
];

const PANEL_ID = "contact-panel";
const VIEWPORT_GAP = 8;

export default function ContactPopup({ buttonLabel = "Contact me", children, className }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, right: VIEWPORT_GAP });

  // Align the panel's right edge with the button so it never overflows the screen.
  useLayoutEffect(() => {
    if (!open) return;

    function updatePos() {
      const btn = btnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: Math.max(VIEWPORT_GAP, window.innerWidth - rect.right),
      });
    }

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, { capture: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className={`${styles.trigger} ${className ?? ""}`}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {buttonLabel}
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={PANEL_ID}
              className={styles.panel}
              style={{ top: pos.top, right: pos.right }}
            >
              <ul className={styles.list}>
                {SOCIAL_LINKS.map(({ label, href, Icon, color }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      <Icon className={styles.icon} style={{ color }} aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>

              {children ? <div className={styles.extra}>{children}</div> : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
