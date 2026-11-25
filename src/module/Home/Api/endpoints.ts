// What the console "API" answers. Everything here is real information from the site and GitHub.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface Endpoint {
  method: "GET" | "POST";
  path: string;
  label: string;
  status: number;
  statusText: string;
  body: Json;
}

export const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/vlad",
    label: "Who I am",
    status: 200,
    statusText: "OK",
    body: {
      name: "Vlad Yuzevych",
      role: "Full-stack developer, backend focus",
      studying: "Artificial Intelligence at TUKE, Košice, 2nd year",
      graduated: "IT-Step Academy, Software Development, with honours",
      focus: "LLMs inside real backend systems",
      rule: "Build exactly what the spec asks for",
    },
  },
  {
    method: "GET",
    path: "/vlad/stack",
    label: "What I work with",
    status: 200,
    statusText: "OK",
    body: {
      backend: ["ASP.NET Core", "EF Core", "Node.js", "Express", "FastAPI"],
      frontend: ["React", "Angular", "RxJS", "TypeScript"],
      data: ["PostgreSQL", "SQLite"],
      devops: ["Docker", "GitLab CI", "GitHub Actions"],
      ai: ["Gemini", "Claude", "evals", "OpenTelemetry"],
      learning: ["Kubernetes", "Kafka", "Redis", "Java", "Spring", "Rust", "gRPC"],
    },
  },
  {
    method: "GET",
    path: "/vlad/projects",
    label: "What I've built",
    status: 200,
    statusText: "OK",
    body: [
      { name: "ProofFit", what: "Resume vs job posting, every verdict backed by evidence", demo: "https://prooffit.onrender.com" },
      { name: "Prompt Manager", what: "Versioned AI prompts, gated by evals", demo: "https://prompt-manager-bt5r.onrender.com" },
      { name: "OEE Engine", what: "Finds repeating losses on an assembly line", demo: "https://oee-engine.onrender.com" },
      { name: "learning", what: "49 coursework projects in one place", source: "https://github.com/Heek1/learning" },
    ],
  },
  {
    method: "GET",
    path: "/vlad/hackathons",
    label: "Where I've competed",
    status: 200,
    statusText: "OK",
    body: [
      { event: "HackKosice 2026", month: "2026-04", project: "SplitPay, shared money jars" },
      { event: "Magna Hackathon 2026", month: "2026-11", role: "team lead", project: "OEE Engine" },
    ],
  },
  {
    method: "POST",
    path: "/vlad/hire",
    label: "Get my contacts",
    status: 201,
    statusText: "Created",
    body: {
      status: "Let's talk",
      email: "vladyuzevuts@gmail.com",
      linkedin: "https://www.linkedin.com/in/vladyslav-yuzevych-7a43a8361/",
      telegram: "https://t.me/vladik_heek",
      github: "https://github.com/Heek1",
    },
  },
  {
    method: "GET",
    path: "/vlad/coffee",
    label: "Just try it",
    status: 418,
    statusText: "I'm a teapot",
    body: {
      error: "I'm a teapot",
      hint: "Try POST /vlad/hire instead.",
    },
  },
];
