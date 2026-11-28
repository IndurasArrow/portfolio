import type { DomainId } from "./work";

/* ----------------------------------------------------------------- Method */

export type Stage = {
  id: string;
  title: string;
  text: string;
  /** Who does the step. */
  actor: "me" | "agent";
};

export const method = {
  title: "Sub-agent-driven development",
  intro:
    "Every feature starts as a written design spec and a task-by-task plan. A fresh coding sub-agent builds each task test-first in its own context, and review sub-agents check it before it is accepted. I keep scope, architecture and merge decisions.",
  tools: ["Claude Code", "Coding and review sub-agents", "Git worktrees"],
  before: [
    {
      id: "spec",
      title: "Design spec",
      text: "What is being built, in writing.",
      actor: "me",
    },
    {
      id: "plan",
      title: "Task plan",
      text: "The spec, broken down task by task.",
      actor: "me",
    },
  ] satisfies Stage[],
  loopLabel: "Repeated for every task",
  loop: [
    {
      id: "code",
      title: "Coding sub-agent",
      text: "One task, a fresh context, built test-first.",
      actor: "agent",
    },
    {
      id: "spec-review",
      title: "Spec review",
      text: "Checks the task for spec compliance.",
      actor: "agent",
    },
    {
      id: "quality-review",
      title: "Quality review",
      text: "Checks the task for code quality.",
      actor: "agent",
    },
  ] satisfies Stage[],
  loopNote: "A task is accepted only after both reviews.",
  after: [
    {
      id: "branch-review",
      title: "Branch review",
      text: "The whole branch, before the pull request.",
      actor: "agent",
    },
    {
      id: "merge",
      title: "Pull request",
      text: "The merge decision stays with me.",
      actor: "me",
    },
  ] satisfies Stage[],
  facts: [
    {
      value: "23",
      label: "Design specs on the food-delivery API alone",
    },
    {
      value: "18",
      label: "Task-by-task plans on the same API",
    },
    {
      value: "2",
      label:
        "Products built this way, in parallel Git worktrees: the food-delivery platform and the speech-translation app",
    },
  ],
};

/* ------------------------------------------------------------- Experience */

export type Role = {
  title: string;
  company: string;
  place: string;
  period: string;
  /** The same dates as `period`, as "YYYY-MM", for working out the length. */
  start: string;
  /** `null` while the role is current. */
  end: string | null;
  current: boolean;
  /** What the role was about, in a few words each: shown as tags. */
  focus: string[];
  points: string[];
  /** Projects on this site that were done in the role, by id, as workstreams. */
  projects?: string[];
};

export const roles: Role[] = [
  {
    title: "Lead AI Deployment Engineer",
    company: "Super AI Polaris",
    place: "New Delhi",
    period: "Dec 2025 to present",
    start: "2025-12",
    end: null,
    current: true,
    focus: [
      "Tech lead",
      "Forward-deployed",
      "Client-facing",
      "Build, deployment and audit",
      "Demo to production cut-over",
    ],
    // In the order the CV lists them.
    projects: [
      "food-delivery",
      "crm",
      "speech-translation",
      "education",
      "lc-checker",
      "vision",
      "ops",
      "demos",
    ],
    points: [
      "Tech lead on most client and internal projects; hands-on in build, deployment and audit.",
      "Client-facing from demo and proof of concept through production cut-over.",
    ],
  },
  {
    title: "Developer and Tech Lead",
    company: "Local Hearts",
    place: "Pune",
    period: "Feb 2024 to Jan 2025",
    start: "2024-02",
    end: "2025-01",
    current: false,
    focus: [
      "Technical lead",
      "Website build",
      "Integrations",
      "Technical reports",
      "Investor reports",
    ],
    points: [
      "Led technical development of the company, from building the website to integrations.",
      "Authored technical and investor reports for data-driven solutions.",
    ],
  },
  {
    title: "Developer",
    company: "Angle.Services",
    place: "Pune",
    period: "Jan 2023 to Feb 2024",
    start: "2023-01",
    end: "2024-02",
    current: false,
    focus: ["Responsive web", "Client platforms", "Design to deployment"],
    points: [
      "Designed and deployed responsive web platforms for a range of clients.",
    ],
  },
];

/**
 * The year as a chart. Months are 1 to 12; `end: null` means still running.
 * Only projects with month-level dates get a bar; the rest are listed as
 * undated. Titles come from the project list by id.
 */
export const timeline = {
  year: 2026,
  /** The month the site was last updated, where the "now" line is drawn. */
  now: 11,
  rows: [
    { id: "demos", start: 1, end: 6, personal: false },
    { id: "rag-assistant", start: 1, end: 6, personal: true },
    { id: "chess", start: 1, end: 1, personal: true },
    { id: "speech-translation", start: 6, end: 9, personal: false },
    { id: "ops", start: 7, end: 9, personal: false },
    { id: "crm", start: 7, end: null, personal: false },
    { id: "food-delivery", start: 9, end: null, personal: false },
  ] as { id: string; start: number; end: number | null; personal: boolean }[],
  undated: ["vision", "education", "lc-checker"],
};

/* ------------------------------------------------------ Domains and stack */

export type Domain = {
  id: DomainId;
  title: string;
  text: string;
  /** Tools most tied to this domain. */
  stack: string[];
};

/** The domains I work in. Projects are matched through `Project.domains`. */
export const domains: Domain[] = [
  {
    id: "agentic",
    title: "Agentic AI",
    text: "Sub-agent-driven development with coding agents and review sub-agents; multi-agent tool calling with AutoGen.",
    stack: ["Claude Code", "Sub-agents", "Skills", "MCP tool servers", "AutoGen", "Git worktrees"],
  },
  {
    id: "llm",
    title: "LLMs and RAG",
    text: "Hybrid-ranked retrieval, cited answers and schema-bound extraction.",
    stack: ["Claude API", "OpenAI", "Azure OpenAI", "Gemini", "LangChain", "pgvector", "FAISS", "ChromaDB"],
  },
  {
    id: "speech",
    title: "Speech AI",
    text: "Real-time Hindi–English speech translation at a 0.85 s median.",
    stack: ["Azure Speech", "WebRTC", "LiveKit", "FastAPI"],
  },
  {
    id: "vision",
    title: "Vision AI",
    text: "YOLO and ArcFace camera analytics; OCR on Apple's Vision framework; Gemini vision.",
    stack: ["YOLO", "ArcFace", "ONNX Runtime", "PyTorch", "OCR pipelines", "Gemini vision"],
  },
  {
    id: "image",
    title: "Generative image",
    text: "Gemini writes a prompt from a webcam photo and FLUX.1 renders it.",
    stack: ["Gemini", "FLUX.1"],
  },
  {
    id: "platforms",
    title: "Platforms and cloud",
    text: "The apps, backends, integrations and cloud around the AI: production cut-overs, data migration, access control, audit logging and deploy runbooks.",
    stack: ["Azure Container Apps", "Bicep", "GitHub Actions", "Docker", "NestJS", "Spring Boot", "FastAPI", "Flutter", "Next.js", "PostgreSQL", "MongoDB"],
  },
  {
    id: "embedded",
    title: "Embedded Linux",
    text: "Display bring-up in progress on a Radxa ROCK 3C (RK3566).",
    stack: ["Radxa ROCK 3C", "RK3566", "Linux", "C/C++"],
  },
  {
    id: "design",
    title: "Product design",
    text: "Where I started: a B.Des in UX and UI, and the product-design case studies from that time.",
    stack: ["User research", "Interface design"],
  },
];

export const skills = [
  {
    group: "Languages",
    items: [
      "Python",
      "TypeScript",
      "JavaScript",
      "Dart",
      "Java",
      "SQL",
      "Bash",
      "C/C++",
    ],
  },
  {
    group: "AI and ML",
    items: [
      "RAG",
      "Hybrid search and ranking",
      "Structured extraction",
      "Agents and tool calling",
      "Claude Code (sub-agents, skills, MCP tool servers)",
      "Prompt design",
      "Claude, OpenAI, Azure OpenAI and Gemini APIs",
      "LangChain",
      "AutoGen",
      "pgvector",
      "FAISS",
      "ChromaDB",
      "Azure Speech",
      "LiveKit",
      "OCR pipelines",
      "Hugging Face",
      "PyTorch",
    ],
  },
  {
    group: "Delivery and integration",
    items: [
      "Client demos and proofs of concept",
      "Production cut-over",
      "Data migration",
      "Service-to-service integration (HMAC-signed sync)",
      "Role-based access control",
      "Audit logging",
      "Workflow and test automation",
      "Technical audits",
      "Deploy runbooks",
    ],
  },
  {
    group: "Backend and data",
    items: [
      "FastAPI",
      "NestJS",
      "Spring Boot",
      "Express",
      "Flask",
      "Node.js",
      "REST APIs",
      "JWT authentication",
      "Socket.IO",
      "WebRTC",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Supabase",
      "Oracle",
      "Hadoop",
    ],
  },
  {
    group: "Web and mobile",
    items: ["React", "Next.js", "Flutter"],
  },
  {
    group: "Cloud and DevOps",
    items: [
      "Azure Container Apps",
      "Azure Pipelines",
      "Azure Blob Storage",
      "Azure Front Door",
      "Bicep (infrastructure-as-code)",
      "GitHub Actions",
      "Docker",
      "Docker Compose",
      "Vercel",
      "Linux",
      "Git",
    ],
  },
];

/* ------------------------------------------------------------- Background */

export const education = [
  {
    title: "Credit-Linked Program in Data Science",
    school: "Daksh Gurukul × IIT Guwahati",
    note: "Online programme. Module III score 91.4%.",
    year: "",
    figure: { value: "91.4%", label: "Module III score" },
    focus: ["Data science", "Online programme", "Credit-linked"],
  },
  {
    title: "B.Des, UX/UI",
    school: "MIT Pune",
    note: "8.4 CGPA.",
    year: "2023",
    figure: { value: "8.4", label: "CGPA" },
    focus: ["User research", "Interface design", "Product-design case studies"],
  },
];
