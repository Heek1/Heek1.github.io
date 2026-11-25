import styles from "./Contact.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© 2026 Vladyslav Yuzevych</span>
      <span>
        Built with Next.js and three.js.{" "}
        <a href="https://github.com/Heek1/Heek1.github.io" target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
      </span>
    </footer>
  );
}
