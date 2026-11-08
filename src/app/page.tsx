import TechOrbit from "@/module/Home/Hero/TechOrbit";
import About from "@/module/Home/About/About";
import Projects from "@/module/Home/Projects/Projects";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section id="home" className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.title}>
          <h1 id="hero-title">Hi there, I&apos;m <span className={styles.accent}>Vlad.</span></h1>
          <p className={styles.subtitle}>Here&apos;s a bit about me and my work.</p>
        </div>
        <div className={styles.scene}>
          <TechOrbit />
        </div>
      </section>

      <section id="about" className={styles.section} aria-labelledby="about-title">
        <About />
      </section>

      <section id="projects" className={styles.section} aria-labelledby="projects-title">
        <Projects />
      </section>
    </main>
  );
}
