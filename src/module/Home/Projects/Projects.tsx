import styles from "./Projects.module.css";
import ProjectShot from "./ProjectShot";
import { FaGithub } from "react-icons/fa";
import TextLink from "@/components/text-link/TextLink";

interface Project {
  name: string;
  context: string;
  summary: string;
  facts: string[];
  stack: string[];
  demo: string;
  source: string;
  image: { src: string; alt: string; width: number; height: number };
  glow: string;
}

const projects: Project[] = [
  {
    name: "ProofFit",
    context: "Solo project, 2026",
    summary:
      "Checks whether a resume proves what a job posting asks for. Every verdict points at a line of the resume or a file in the candidate's public GitHub.",
    facts: [
      "The language model only proposes; plain code checks each citation and computes the score.",
      "Works without a model too: a keyword engine finishes the job when Gemini is unavailable.",
      "CI, test coverage and CodeQL on every push, traces with OpenTelemetry.",
    ],
    stack: [".NET 10", "React 19", "TypeScript", "PostgreSQL", "Gemini", "OpenTelemetry"],
    demo: "https://prooffit.onrender.com",
    source: "https://github.com/Heek1/prooffit",
    image: {
      src: "/projects/prooffit.webp",
      alt: "ProofFit start page with the resume and vacancy upload form",
      width: 1280,
      height: 860,
    },
    glow: "rgba(88, 132, 255, 0.55)",
  },
  {
    name: "Prompt Manager",
    context: "Solo project, 2026",
    summary:
      "A self-hosted home for a team's AI prompts: write a prompt once, improve it in versions, and let applications fetch the version that passed its tests.",
    facts: [
      "Evals gate every release: a version that scores worse than production can't be promoted.",
      "Word-level diffs between versions, and suggested fixes reviewed as a diff.",
      "End-to-end tests with Playwright, traces and metrics with OpenTelemetry.",
    ],
    stack: ["ASP.NET Core 10", "EF Core", "PostgreSQL", "Claude", "Docker", "Playwright"],
    demo: "https://prompt-manager-bt5r.onrender.com",
    source: "https://github.com/Heek1/AI-Prompt-Management-System",
    image: {
      src: "/projects/prompt-manager.webp",
      alt: "Prompt Manager prompt page with numbered text, highlighted variables and the release track",
      width: 1280,
      height: 800,
    },
    glow: "rgba(140, 92, 255, 0.55)",
  },
  {
    name: "OEE Engine",
    context: "Magna Hackathon 2026, team lead",
    summary:
      "A phone-first app for an electric-drive assembly line: it finds the losses that repeat, predicts the next stop and names the fix.",
    facts: [
      "Built in a few days by a team of four; I led the team and built the backend core and deployment.",
      "Shows that fixing two recurring stops adds 253 drives a month with no new equipment.",
      "A Gemini assistant answers only from the line's data, in English, Slovak or Ukrainian.",
    ],
    stack: ["Python", "FastAPI", "React", "TypeScript", "Gemini", "PWA"],
    demo: "https://oee-engine.onrender.com",
    source: "https://github.com/Heek1/magna-hackathon-2026",
    image: {
      src: "/projects/oee-engine.webp",
      alt: "OEE Engine desktop layout: line status, top errors and the detail of station ST-038",
      width: 1280,
      height: 800,
    },
    glow: "rgba(229, 36, 59, 0.45)",
  },
];

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

      <div className={styles.list}>
        {projects.map((project) => (
          <article
            key={project.name}
            className={styles.row}
            style={{ "--glow": project.glow } as React.CSSProperties}
            aria-labelledby={`project-${project.name}`}
          >
            <ProjectShot
              href={project.demo}
              address={new URL(project.demo).host}
              {...project.image}
            />
            <div className={styles.body}>
              <p className={styles.context}>{project.context}</p>
              <h3 id={`project-${project.name}`} className={styles.title}>
                {project.name}
              </h3>
              <p className={styles.summary}>{project.summary}</p>
              <ul className={styles.facts}>
                {project.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <ul className={styles.stack} aria-label="Tech stack">
                {project.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              <div className={styles.actions}>
                <a className={styles.primary} href={project.demo} target="_blank" rel="noopener noreferrer">
                  Open live demo
                </a>
                <a className={styles.secondary} href={project.source} target="_blank" rel="noopener noreferrer">
                  <FaGithub aria-hidden="true" />
                  Source code
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className={styles.note}>The demos run on free hosting, so the first load can take up to a minute.</p>
    </div>
  );
}
