import type { TechId } from "../techs";

export interface StackItem {
  label: string;
  tech?: TechId;
}

export interface PipelineStep {
  title: string;
  detail: string;
}

export interface Project {
  name: string;
  context: string;
  summary: string;
  facts: string[];
  stack: StackItem[];
  /** Technologies from the hero orbit used here, including ones not shown as chips. */
  techs: TechId[];
  demo: string;
  source: string;
  image: { src: string; alt: string; width: number; height: number };
  glow: string;
  pipeline: PipelineStep[];
}

export const projects: Project[] = [
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
    stack: [
      { label: ".NET 10", tech: "dotnet" },
      { label: "React 19", tech: "react" },
      { label: "TypeScript", tech: "typescript" },
      { label: "PostgreSQL", tech: "postgresql" },
      { label: "Gemini", tech: "gemini" },
      { label: "OpenTelemetry", tech: "opentelemetry" },
    ],
    techs: ["dotnet", "csharp", "react", "typescript", "postgresql", "gemini", "opentelemetry", "docker"],
    demo: "https://prooffit.onrender.com",
    source: "https://github.com/Heek1/prooffit",
    image: {
      src: "/projects/prooffit.webp",
      alt: "ProofFit start page with the resume and vacancy upload form",
      width: 1280,
      height: 860,
    },
    glow: "rgba(88, 132, 255, 0.55)",
    pipeline: [
      { title: "Read the vacancy", detail: "Requirements are extracted and split into must-haves and nice-to-haves." },
      { title: "Read the resume", detail: "The PDF becomes numbered lines, so evidence can be cited exactly." },
      { title: "Scan GitHub", detail: "Fixed rules detect skills from files and manifests, with no model involved." },
      { title: "Match", detail: "Gemini or the keyword engine proposes a verdict and evidence for each requirement." },
      { title: "Check in code", detail: "Citations that don't exist are dropped; a verdict left without evidence fails." },
      { title: "Score", detail: "0 to 100, computed from the verdicts, with must-haves counting double." },
    ],
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
    stack: [
      { label: "ASP.NET Core 10", tech: "dotnet" },
      { label: "EF Core", tech: "dotnet" },
      { label: "PostgreSQL", tech: "postgresql" },
      { label: "Claude", tech: "claude" },
      { label: "Docker", tech: "docker" },
      { label: "Playwright" },
    ],
    techs: ["dotnet", "csharp", "postgresql", "claude", "docker", "opentelemetry"],
    demo: "https://prompt-manager-bt5r.onrender.com",
    source: "https://github.com/Heek1/AI-Prompt-Management-System",
    image: {
      src: "/projects/prompt-manager.webp",
      alt: "Prompt Manager prompt page with numbered text, highlighted variables and the release track",
      width: 1280,
      height: 800,
    },
    glow: "rgba(140, 92, 255, 0.55)",
    pipeline: [
      { title: "Write a version", detail: "Each change of the text is a new numbered version with a change note." },
      { title: "Run it", detail: "Variables become fields; the prompt runs on a model and the result is saved." },
      { title: "Evaluate", detail: "Test cases and checks run against the version, one cell per case." },
      { title: "Fix if it fails", detail: "A suggested fix arrives as a diff to review, and becomes a new draft." },
      { title: "Promote", detail: "Only a version that does at least as well as production can ship." },
      { title: "Serve over the API", detail: "Applications read the tested version with an API key." },
    ],
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
    stack: [
      { label: "Python", tech: "python" },
      { label: "FastAPI", tech: "fastapi" },
      { label: "React", tech: "react" },
      { label: "TypeScript", tech: "typescript" },
      { label: "Gemini", tech: "gemini" },
      { label: "PWA" },
    ],
    techs: ["python", "fastapi", "react", "typescript", "gemini", "docker"],
    demo: "https://oee-engine.onrender.com",
    source: "https://github.com/Heek1/magna-hackathon-2026",
    image: {
      src: "/projects/oee-engine.webp",
      alt: "OEE Engine desktop layout: line status, top errors and the detail of station ST-038",
      width: 1280,
      height: 800,
    },
    glow: "rgba(229, 36, 59, 0.45)",
    pipeline: [
      { title: "Replay the line", detail: "A simulator plays the line's data in real time, at any speed." },
      { title: "Compute OEE", detail: "Availability, performance and quality, always from sums." },
      { title: "Detect patterns", detail: "Stops that repeat on the same weekday and hour, slow shift hours, scrap Pareto." },
      { title: "Predict and price", detail: "When the next stop is due, and what fixing it is worth in pieces." },
      { title: "Explain", detail: "The Gemini assistant answers questions using only the line's data." },
      { title: "Act", detail: "82 countermeasures with owners; fixes are assigned in one tap." },
    ],
  },
];
