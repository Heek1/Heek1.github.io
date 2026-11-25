import styles from "./About.module.css";
import TextLink from "@/components/text-link/TextLink";
import Watcher from "./Watcher";

export default function About() {
  return (
    <div className={styles.page}>
      <Watcher />
      <div className={styles.AboutMe}>
        <h2 id="about-title">About me</h2>
        <p>
          Full-stack developer with a backend focus. I&apos;m in my second year of Artificial Intelligence at{" "}
          <TextLink href="https://www.tuke.sk">TUKE</TextLink> in Košice, and I graduated from{" "}
          <TextLink href="https://itstep.org">IT-Step Academy</TextLink> in Software Development with honours.
        </p>
        <p>
          I design APIs, data models and services on ASP.NET Core and Node.js, and build the interfaces in React
          and Angular. Lately my work is about putting LLMs inside real backend systems — with evaluations, tests
          and checks in code, so a model&apos;s answer is something you can verify.
        </p>
        <p>
          In 2026 I took part in two hackathons: Magna Hackathon, where I led the team and built the backend, and{" "}
          <TextLink href="https://hackkosice.com">HackKosice</TextLink>. In team projects I keep one rule: build
          exactly what the spec asks for, with minimal, predictable code that&apos;s easy to review.
        </p>
        <p>
          Cisco certified in C, C++ and Python Essentials. Coursework and smaller projects are collected in{" "}
          <TextLink href="https://github.com/Heek1/learning">one repository</TextLink>.
        </p>
      </div>
    </div>
  );
}
