import styles from "./ApiConsole.module.css";
import ApiConsole from "./ApiConsole";

export default function ApiSection() {
  return (
    <div className={styles.section}>
      <header className={styles.intro}>
        <h2 id="api-title" className={styles.heading}>
          Try my API
        </h2>
        <p className={styles.lead}>I&apos;m a backend developer, so here is me as an API. Pick a request and send it.</p>
      </header>
      <ApiConsole />
    </div>
  );
}
