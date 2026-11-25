"use client";

import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import styles from "./Projects.module.css";
import ProjectShot from "./ProjectShot";
import { projects, type PipelineStep } from "./projectsData";
import { TECH_NAMES, TECH_SELECT_EVENT, type TechId } from "../techs";

export default function ProjectList() {
  const [filter, setFilter] = useState<TechId | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onSelect = (event: Event) => setFilter((event as CustomEvent<TechId>).detail);
    window.addEventListener(TECH_SELECT_EVENT, onSelect);
    return () => window.removeEventListener(TECH_SELECT_EVENT, onSelect);
  }, []);

  const matches = filter ? projects.filter((project) => project.techs.includes(filter)) : projects;

  return (
    <>
      {filter && (
        <div className={styles.filterBar} role="status">
          <span>
            {matches.length > 0
              ? `${matches.length === 1 ? "One project uses" : `${matches.length} projects use`} ${TECH_NAMES[filter]}.`
              : `None of these three use ${TECH_NAMES[filter]} — ask me about it.`}
          </span>
          <button type="button" onClick={() => setFilter(null)}>
            Show all
          </button>
        </div>
      )}

      <div className={styles.list}>
        {projects.map((project) => {
          const dimmed = filter !== null && !project.techs.includes(filter);
          const isFlipped = !!flipped[project.name];
          return (
            <article
              key={project.name}
              className={styles.row}
              data-dimmed={dimmed}
              style={{ "--glow": project.glow } as React.CSSProperties}
              aria-labelledby={`project-${project.name}`}
            >
              <div className={styles.media}>
                <div className={styles.flipper} data-flipped={isFlipped}>
                  <div className={styles.front} aria-hidden={isFlipped}>
                    <ProjectShot
                      href={project.demo}
                      address={new URL(project.demo).host}
                      tabIndex={isFlipped ? -1 : 0}
                      {...project.image}
                    />
                  </div>
                  <div className={styles.back} aria-hidden={!isFlipped}>
                    <Pipeline name={project.name} steps={project.pipeline} active={isFlipped} />
                  </div>
                </div>
              </div>

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
                  {project.stack.map((item) => (
                    <li key={item.label} data-active={filter !== null && item.tech === filter}>
                      {item.label}
                    </li>
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
                  <button
                    type="button"
                    className={styles.flipButton}
                    aria-pressed={isFlipped}
                    onClick={() => setFlipped((state) => ({ ...state, [project.name]: !isFlipped }))}
                  >
                    {isFlipped ? "Show screenshot" : "How it works"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Pipeline({ name, steps, active }: { name: string; steps: PipelineStep[]; active: boolean }) {
  return (
    <div className={styles.pipeline} data-active={active}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.address}>How {name} works</span>
      </div>
      <div className={styles.steps} style={{ "--steps": steps.length } as React.CSSProperties}>
        <span className={styles.signal} aria-hidden="true" />
        <ol>
          {steps.map((step, index) => (
            <li key={step.title} style={{ "--i": index } as React.CSSProperties}>
              <strong>{step.title}</strong>
              <span>{step.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
