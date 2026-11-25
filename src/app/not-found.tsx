import type { Metadata } from "next";
import Link from "next/link";
import Watcher from "@/module/Home/About/Watcher";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | Vladyslav Yuzevych",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Watcher className={styles.eyes} restless hint={null} />
      <h1 className={styles.heading}>This page doesn&apos;t exist.</h1>
      <p className={styles.text}>The eyes have looked everywhere. The link may be old or mistyped.</p>
      <Link className={styles.back} href="/">
        Back to the homepage
      </Link>
    </main>
  );
}
