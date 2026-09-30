import MainPage from "@/module/Home/One/MainPage";
import styles from "./page.module.css";
import Two from "../module/Home/Two/page";
import Three from "@/module/Home/Three/page";

export default function Home() {
  return (
    <main className={styles.page}>
      <div id="main" className={styles.one}>
        <div className={styles.title}>
          <h1>Hi there, I&apos;m <span className={styles.accent}>Vlad.</span></h1>
          <h3>Here&apos;s a bit about me and my work.</h3>
        </div>
        <div className={styles.MainPage}>
          <MainPage/>
        </div>
      </div>

      <section id="whoim">
        <Two />
      </section>

      <section id="projects">
        <Three />
      </section>
    </main>
  );
}

