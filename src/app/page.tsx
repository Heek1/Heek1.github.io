import StackMap from "@/module/Home/Hero/StackMap";
import About from "@/module/Home/About/About";
import Projects from "@/module/Home/Projects/Projects";
import Journey from "@/module/Home/Journey/Journey";
import ApiSection from "@/module/Home/Api/ApiSection";
import Contact from "@/module/Home/Contact/Contact";
import Footer from "@/module/Home/Contact/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section id="home" className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.title}>
          <p className={styles.hello}>Hi, I&apos;m Vlad.</p>
          <h1 id="hero-title">I build backends that put AI to work.</h1>
          <p className={styles.subtitle}>
            Full-stack developer studying AI at TUKE in Košice. ASP.NET Core and Node.js on the server, React and
            Angular on the screen.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#projects">
              See my projects
            </a>
            <a className={styles.secondary} href="#contact">
              Get in touch
            </a>
          </div>
        </div>
        <div className={styles.scene}>
          <StackMap />
          <p className={styles.orbitHint}>Click a technology to see where I used it.</p>
        </div>
      </section>

      <section id="about" className={styles.section} aria-labelledby="about-title">
        <About />
      </section>

      <section id="projects" className={styles.section} aria-labelledby="projects-title">
        <Projects />
      </section>

      <section id="journey" className={styles.section} aria-labelledby="journey-title">
        <Journey />
      </section>

      <section id="api" className={styles.section} aria-labelledby="api-title">
        <ApiSection />
      </section>

      <section id="contact" className={styles.section} aria-labelledby="contact-title">
        <Contact />
      </section>

      <Footer />
    </main>
  );
}
