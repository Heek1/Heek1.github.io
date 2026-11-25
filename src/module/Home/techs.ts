// The technologies shown in the hero orbit. Projects reference them by `id`.

export type TechId =
  | "dotnet"
  | "csharp"
  | "python"
  | "fastapi"
  | "typescript"
  | "react"
  | "angular"
  | "node"
  | "postgresql"
  | "docker"
  | "gemini"
  | "claude"
  | "opentelemetry";

export const TECH_NAMES: Record<TechId, string> = {
  dotnet: ".NET",
  csharp: "C#",
  python: "Python",
  fastapi: "FastAPI",
  typescript: "TypeScript",
  react: "React",
  angular: "Angular",
  node: "Node.js",
  postgresql: "PostgreSQL",
  docker: "Docker",
  gemini: "Gemini",
  claude: "Claude",
  opentelemetry: "OpenTelemetry",
};

// Fired by the orbit, handled by the project list.
export const TECH_SELECT_EVENT = "tech:select";
