import styles from "./page.module.css";
import { FaGithub } from 'react-icons/fa';

interface ProjectLink {
  icon: React.ReactElement;
  href: string;
  label: string;
}

interface Project {
  name: string;
  description: string;
  links: ProjectLink[];
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.title}>{project.name}</h3>
          <p className={styles.description}>{project.description}</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.ProgresAndLinks}>
          <div className={styles.linksContainer}>
            {project.links.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                {link.icon}<span className={styles.linkText}>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Three() {
  const projects: Project[] = [
    {
      name: "MoodboardAI",
      description: "Team backend project built on ASP.NET Core Web API (.NET 10). I handled the backend: scaffolded the project architecture, built the auth DTOs, the JWT token service, and the entity relationships. Database is PostgreSQL with EF Core; authentication is JWT with Argon2 password hashing. Also coordinated the team's work through GitHub issues.",
      links: [{ icon: <FaGithub />, href: "https://github.com/Svyatoslav02/ItStepRepo", label: "GitHub" }],
    },
    {
      name: "Kitchen Battle",
      description: "Team project — a cooking-competition platform built on ASP.NET Core (.NET 8) MVC. Chefs publish recipes, judges score them on three criteria (taste, presentation, creativity, 1–10), the average score recalculates automatically, and the leaderboard updates instantly through Redis cache invalidation. Authentication via Keycloak (OpenID Connect), database PostgreSQL/SQL Server. Includes a full admin panel for managing battles, categories, recipe moderation, and users.",
      links: [{ icon: <FaGithub />, href: "https://github.com/leonstar228/KitchenBattle", label: "GitHub" }],
    },
    {
      name: "CityAlert",
      description: "Team project — a city alert platform built on ASP.NET Core (.NET 10) MVC. Residents subscribe to districts and see events on a map with severity levels and categories; admins manage districts and events through a dedicated panel. Authentication via Keycloak/OpenID Connect, caching with Redis, database SQLite with EF Core. I was team lead on this project.",
      links: [{ icon: <FaGithub />, href: "https://github.com/Heek1/CityAlert", label: "GitHub" }],
    },
    {
      name: "University test system",
      description: "Team project — a knowledge-testing platform for a university, built on ASP.NET Core MVC. Students take subject tests with a limited number of attempts, view their test history, and see a per-subject leaderboard. Admins create/edit/delete tests and questions, open/close test access, and manage user accounts. I was team lead on this project.",
      links: [{ icon: <FaGithub />, href: "https://github.com/Heek1/University-test-system", label: "GitHub" }],
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {projects.map((project) => <ProjectCard key={project.name} project={project} />)}
      </div>
    </div>
  );
}