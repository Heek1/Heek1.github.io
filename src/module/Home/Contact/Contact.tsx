"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa";
import Watcher from "../About/Watcher";
import styles from "./Contact.module.css";

const EMAIL = "vladyuzevuts@gmail.com";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard is blocked (old browser, insecure context): open the mail app instead.
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.text}>
        <h2 id="contact-title" className={styles.heading}>
          Let&apos;s build something.
        </h2>
        <p className={styles.lead}>Got a project, an idea or a question? I&apos;m one message away.</p>

        <div className={styles.emailRow}>
          <button type="button" id="copy-email" className={styles.copy} onClick={copyEmail}>
            {copied ? "Copied" : "Copy email"}
          </button>
          <a className={styles.email} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <span className={styles.srOnly} role="status">
            {copied ? "Email address copied" : ""}
          </span>
        </div>

        <ul className={styles.links}>
          <li>
            <a href="https://www.linkedin.com/in/vladyslav-yuzevych-7a43a8361/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" />
              LinkedIn
            </a>
          </li>
          <li>
            <a href="https://t.me/vladik_heek" target="_blank" rel="noopener noreferrer">
              <FaTelegram aria-hidden="true" />
              Telegram
            </a>
          </li>
          <li>
            <a href="https://github.com/Heek1" target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" />
              GitHub
            </a>
          </li>
        </ul>
      </div>

      <Watcher className={styles.eyes} idleTarget="#copy-email" hint={null} />
    </div>
  );
}
