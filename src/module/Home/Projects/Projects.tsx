import styles from "./Projects.module.css";
import ProjectList from "./ProjectList";
import TextLink from "@/components/text-link/TextLink";

export default function Projects() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h2 id="projects-title" className={styles.pageTitle}>
          Selected projects
        </h2>
        <p className={styles.lead}>
          The three I&apos;d show first. Smaller coursework lives in the{" "}
          <TextLink href="https://github.com/Heek1/learning">learning</TextLink> repository.
        </p>
      </header>

      <ProjectList />

      <p className={styles.note}>The demos run on free hosting, so the first load can take up to a minute.</p>
    </div>
  );
}
