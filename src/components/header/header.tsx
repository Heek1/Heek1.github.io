"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import PopupButton from "../popup/PoputButton";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Main", href: "#main" },
  { label: "Who im", href: "#whoim" },
  { label: "My projects", href: "#projects" },
];

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 3);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span className={styles.brand}>Vladyslav Yuzevych</span>
          </div>
        </div>

        <nav className={`${styles.centerNav} ${scrolled ? styles.scrolled : ""}`} aria-label="Primary">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href} className={`${styles.navItem} ${active ? styles.active : ""}`}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <PopupButton />
      </div>
    </header>
  );
}