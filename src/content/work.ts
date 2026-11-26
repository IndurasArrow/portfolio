import type { StaticImageData } from "next/image";
import healthCare from "@/assets/design/health-care.jpg";
import pillo from "@/assets/design/pillo.jpg";
import plantCare from "@/assets/design/plant-care.jpg";
import type { Metric } from "./site";

/** Domain ids. Labels and descriptions live in `profile.ts`. */
export type DomainId =
  | "agentic"
  | "llm"
  | "speech"
  | "vision"
  | "image"
  | "platforms"
  | "embedded"
  | "design";

/** Which line-art animation a card shows. See `project-visual.tsx`. */
export type VisualKey =
  | "dispatch"
  | "cutover"
  | "speech"
  | "rag"
  | "vision"
  | "document"
  | "sync"
  | "vectors"
  | "chess"
  | "grid";

export type Point = { tag: string; text: string };

export type Latency = {
  title: string;
  max: number;
  before: { low: number; high: number; note: string };
  after: { median: number; p90: number; note: string };
};

/** Diagrams shown in the viewer, between the figures and the breakdown. */
export type Figure =
  | { kind: "flow"; title: string; steps: { title: string; text?: string }[]; note?: string }
  | {
      kind: "growth";
      title: string;
      note?: string;
      rows: { label: string; from: number; to: number; toLabel?: string }[];
    }
  | {
      kind: "share";
      title: string;
      part: number;
      whole: number;
      partLabel: string;
      wholeLabel: string;
      note?: string;
    }
  | {
      kind: "matrix";
      title: string;
      rows: number;
      cols: number;
      rowLabel: string;
      colLabel: string;
      note?: string;
    }
  | { kind: "dots"; title: string; count: number; columns: number; note?: string }
  | { kind: "tiles"; title: string; count: number; named: string[]; note?: string }
  | {
      kind: "facts";
      title: string;
      items: { value: string; unit: string }[];
      note?: string;
    };

export type Project = {
  id: string;
  title: string;
  /** One line under the title on the card. */
  summary: string;
  /** First entry is the label shown on the card. */
  domains: DomainId[];
  period: string;
  /** Short figure shown on the card's visual. */
  highlight?: string;
  visual?: VisualKey;
  /** Design studies use a cover image and open an embedded document. */
  image?: StaticImageData;
  embed?: string;
  lead?: string;
  metrics?: Metric[];
  points?: Point[];
  latency?: Latency;
  figures?: Figure[];
  stack?: string[];
  link?: { href: string; label: string };
};

const drive = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

/**
 * Order matters: the first card is the wide one, the next six are half-width,
 * the rest are thirds.
 */
export const projects: Project[] = [
  {
    id: "food-delivery",
    title: "Food-delivery platform",
    summary: "A pre-launch multi-vendor platform, taken over and carried solo.",
    domains: ["platforms", "agentic"],
    period: "Sep 2026 to present",
    highlight: "438 pull requests in ten weeks",
    visual: "dispatch",
    lead: "I took over a pre-launch multi-vendor platform (customer, restaurant and rider apps, the API and the admin panel) and have carried all of its engineering since October.",
    metrics: [
      { value: "438", label: "Pull requests merged in ten weeks" },
      { value: "1,090", label: "Commits, AI-assisted and test-first" },
      { value: "8,200+", label: "Backend test cases, after adding 314 test files" },
      { value: "8,800+", label: "App test cases, after adding 193 test files" },
    ],
    points: [
      {
        tag: "Money",
        text: "Made order money reconcile to the paisa: per-unit GST rounding, commission and tax charged exactly once, and reports that foot to wallet movements.",
      },
      {
        tag: "Refunds",
        text: "Extended the refund engine with a review queue, refunds to wallet or to source, and rule-driven item refunds.",
      },
      {
        tag: "Dispatch",
        text: "Replaced zone-wide rider broadcast with expanding-radius dispatch, and built live order tracking that makes no routing-API calls after an order is placed.",
      },
      {
        tag: "Access",
        text: "Built per-page, per-action admin permissions: role-based access control across 132 pages and six actions, with a server-side write gate and an HMAC-signed, insert-only staff audit log.",
      },
      {
        tag: "Method",
        text: "Delivered through sub-agent-driven development, with 23 design specs and 18 plans on the API alone.",
      },
    ],
    figures: [
      {
        kind: "dots",
        title: "438 merged pull requests",
        count: 438,
        columns: 40,
        note: "One dot each. Over ten weeks that is about 44 a week.",
      },
      {
        kind: "matrix",
        title: "Admin permissions",
        rows: 6,
        cols: 132,
        rowLabel: "6 actions",
        colLabel: "132 pages",
        note: "Every page-and-action pair is its own switch, enforced by a server-side write gate.",
      },
    ],
    stack: ["Flutter", "NestJS", "MongoDB", "Next.js"],
  },
  {
    id: "crm",
    title: "Sales and accounting CRM",
    summary: "A production finance CRM, re-platformed and cut over to Azure.",
    domains: ["platforms", "vision"],
    period: "Jul 2026 to present",
    highlight: "140k+ quotations cut over",
    visual: "cutover",
    lead: "I re-platformed a vendor-built CRM for an education-services client onto Azure and ran the production cut-over for 5,300+ clients and 140k+ quotations.",
    metrics: [
      { value: "140k+", label: "Quotations cut over, for 5,300+ clients" },
      {
        value: "12.4",
        unit: "min",
        label: "To copy 242k objects (52 GiB) from S3 to Azure Blob",
      },
      {
        value: "352k",
        label: "Payment records checked by OCR; 5,440 flagged for review",
      },
      {
        value: "287/287",
        label: "End-to-end checks passed on the voucher workflow",
      },
    ],
    points: [
      {
        tag: "Cut-over",
        text: "Ran it as a staged restore, a schema migration, then a database swap with rollback kept.",
      },
      {
        tag: "Documents",
        text: "Copied the document store from S3 to Azure Blob and verified it by recount and hash checks.",
      },
      {
        tag: "Audit",
        text: "Built a read-only OCR pipeline that checked payment records against their proof documents.",
      },
      {
        tag: "Money",
        text: "Fixed production money logic: split wallet balances, missing commission credits and tax-deduction corrections.",
      },
      {
        tag: "Vouchers",
        text: "Built a voucher-replacement workflow end to end, live since November 2026.",
      },
    ],
    figures: [
      {
        kind: "flow",
        title: "The cut-over",
        steps: [
          { title: "Staged restore" },
          { title: "Schema migration" },
          { title: "Database swap" },
        ],
        note: "Rollback kept.",
      },
      {
        kind: "facts",
        title: "Document store, S3 to Azure Blob",
        items: [
          { value: "≈325", unit: "objects per second" },
          { value: "≈70", unit: "MiB per second" },
        ],
        note: "Worked out from 242k objects and 52 GiB in 12.4 minutes, then verified by recount and hash checks.",
      },
      {
        kind: "share",
        title: "OCR check of payment records",
        part: 5440,
        whole: 352000,
        partLabel: "5,440 flagged for review",
        wholeLabel: "352k records checked against their proof documents",
      },
    ],
    stack: ["Spring Boot", "PostgreSQL", "Flutter", "Azure"],
  },
  {
    id: "speech-translation",
    title: "Live speech translation",
    summary: "Hindi–English, live, between a website visitor and a support agent.",
    domains: ["speech", "platforms", "agentic"],
    period: "Jun to Sep 2026",
    highlight: "5–6 s down to 0.85 s",
    visual: "speech",
    lead: "Live Hindi–English translation for customer support, between a website visitor and a human agent. The client reported a 5–6 s lag. I traced it to the batch speech pipeline and rebuilt the path.",
    metrics: [
      {
        value: "0.85",
        unit: "s",
        label: "Median delay, end of speech to translated voice",
      },
      { value: "1.4", unit: "s", label: "90th percentile, over 26 test phrases" },
      { value: "536", label: "Backend test cases, up from 263" },
      { value: "800+", label: "Frontend test cases, up from 94, in six days" },
    ],
    latency: {
      title: "Delay from end of speech to translated voice",
      max: 6,
      before: {
        low: 5,
        high: 6,
        note: "Batch speech pipeline, as reported by the client",
      },
      after: {
        median: 0.85,
        p90: 1.4,
        note: "Direct speech-translation path, measured over 26 test phrases",
      },
    },
    points: [
      {
        tag: "Latency",
        text: "Moved recognition from batch to streaming, then built a direct speech-translation path.",
      },
      {
        tag: "Deployment",
        text: "Took the app to Azure Container Apps with Bicep, a MySQL-to-PostgreSQL migration, GitHub Actions CI and deploy runbooks.",
      },
      {
        tag: "Routing",
        text: "Hardened call routing with delivery acknowledgement, away detection and link-loss recovery.",
      },
    ],
    figures: [
      {
        kind: "growth",
        title: "Test cases, in six days",
        rows: [
          { label: "Backend", from: 263, to: 536 },
          { label: "Frontend", from: 94, to: 800, toLabel: "800+" },
        ],
      },
    ],
    stack: ["FastAPI", "React", "WebRTC", "Azure Speech"],
  },
  {
    id: "vision",
    title: "Vision analytics platform",
    summary: "NeuraEagle-i: camera analytics with 20 detection plug-ins.",
    domains: ["vision"],
    period: "2026",
    highlight: "20 detection plug-ins",
    visual: "vision",
    lead: "Co-developed and completed NeuraEagle-i, a camera analytics platform that runs detection plug-ins over live RTSP feeds.",
    metrics: [
      { value: "20", label: "Detection plug-ins on YOLO models" },
    ],
    points: [
      {
        tag: "Detection",
        text: "20 detection plug-ins (PPE, fire, fall, crowd, intrusion) on YOLO models, with multi-object tracking over RTSP feeds.",
      },
      {
        tag: "Faces",
        text: "Face recognition on ArcFace for attendance and door access.",
      },
      { tag: "Runtime", text: "Models quantised for GPUs." },
    ],
    figures: [
      {
        kind: "tiles",
        title: "Detection plug-ins",
        count: 20,
        named: ["PPE", "Fire", "Fall", "Crowd", "Intrusion"],
        note: "Twenty plug-ins; these five are the ones named here.",
      },
    ],
    stack: ["YOLO", "ArcFace", "ONNX Runtime", "PyTorch"],
  },
  {
    id: "education",
    title: "AI education platform",
    summary: "An AI tutoring platform; I lead the team building it.",
    domains: ["llm"],
    period: "2026",
    highlight: "Tech lead",
    visual: "rag",
    lead: "Tech lead for the team building an AI tutoring platform.",
    points: [
      {
        tag: "Q&A",
        text: "Retrieval-augmented Q&A over books, websites and video.",
      },
      { tag: "Tests", text: "AI mock tests for competitive exams." },
      { tag: "Guidance", text: "Career and scholarship matching." },
    ],
    stack: ["FastAPI", "React", "FAISS", "Azure AI Foundry"],
  },
  {
    id: "lc-checker",
    title: "Letter-of-credit checker",
    summary: "A banking proof of concept, prototyped in about a day.",
    domains: ["llm"],
    period: "2026",
    highlight: "Built in about a day",
    visual: "document",
    lead: "A proof of concept for a banking demo, prototyped in about a day.",
    metrics: [
      { value: "59", label: "Tests" },
      { value: "1", unit: "day", label: "Roughly, to prototype it" },
    ],
    points: [
      {
        tag: "Extract",
        text: "An LLM extracts the fields against a strict JSON schema.",
      },
      {
        tag: "Check",
        text: "Deterministic UCP 600 rules flag discrepancies and cite the article.",
      },
    ],
    figures: [
      {
        kind: "flow",
        title: "How a document is checked",
        steps: [
          { title: "Letter of credit", text: "The document comes in." },
          { title: "LLM extraction", text: "Fields, against a strict JSON schema." },
          { title: "UCP 600 rules", text: "Deterministic checks." },
          { title: "Discrepancies", text: "Each cites its article." },
        ],
      },
    ],
    stack: ["LLM extraction", "JSON schema", "UCP 600 rules"],
  },
  {
    id: "ops",
    title: "Internal operations platform",
    summary: "Signed sync between internal apps, and an audit of a five-app bundle.",
    domains: ["platforms", "llm"],
    period: "Jul to Sep 2026",
    highlight: "About 150 issues found, 18 critical",
    visual: "sync",
    lead: "Integration and audit work on the company's internal tools.",
    metrics: [
      { value: "150", label: "Confirmed issues in the audit, roughly" },
      { value: "18", label: "Of them critical" },
      { value: "11", label: "Services in the packaged Docker Compose deployment" },
    ],
    points: [
      {
        tag: "Sync",
        text: "Built HMAC-signed sync between three internal apps, with a daily digest generated through the Claude API using structured output.",
      },
      {
        tag: "Audit",
        text: "Audited a five-app bundle, then fixed the critical, high and medium findings, bar those the owner deferred.",
      },
      {
        tag: "Deploy",
        text: "Packaged its 11-service Docker Compose deployment.",
      },
    ],
    figures: [
      {
        kind: "share",
        title: "The audit",
        part: 18,
        whole: 150,
        partLabel: "18 critical",
        wholeLabel: "About 150 confirmed issues",
      },
    ],
    stack: ["Next.js", "Express", "Claude API", "Docker"],
  },
  {
    id: "rag-assistant",
    title: "Product-catalogue RAG assistant",
    summary: "Hybrid search with cited, streaming answers. A personal project.",
    domains: ["llm"],
    period: "Jan to Jun 2026",
    visual: "vectors",
    lead: "A personal project: a catalogue assistant that searches with meaning and keywords together, and cites what it answers from.",
    points: [
      {
        tag: "Search",
        text: "Ranks results with a blend of pgvector similarity and Postgres full-text rank in one SQL function, after LLM query rewriting.",
      },
      { tag: "Answers", text: "Answers stream with linked citations." },
      {
        tag: "Ingestion",
        text: "A vision LLM turns PDFs and images into typed, de-duplicated chunks.",
      },
      {
        tag: "Models",
        text: "Moved generation from Gemini to GPT-4o-mini without re-embedding.",
      },
    ],
    figures: [
      {
        kind: "flow",
        title: "From question to answer",
        steps: [
          { title: "Question" },
          { title: "LLM rewrite", text: "The query is rewritten." },
          { title: "Hybrid rank", text: "pgvector similarity blended with Postgres full-text rank, in one SQL function." },
          { title: "Cited answer", text: "Streamed, with linked citations." },
        ],
      },
    ],
    stack: ["Next.js", "pgvector", "OpenRouter"],
  },
  {
    id: "chess",
    title: "Two-agent chess",
    summary: "Two LLM agents play each other through tool calls.",
    domains: ["agentic"],
    period: "Jan 2026",
    visual: "chess",
    lead: "A personal project, adapted from an open-source example: two LLM agents play chess against each other through tool calls.",
    points: [
      { tag: "Rules", text: "Legal-move validation on every turn." },
      { tag: "Turns", text: "Custom speaker selection between the agents." },
      { tag: "Replay", text: "Move replay for the finished game." },
    ],
    figures: [
      {
        kind: "flow",
        title: "One turn",
        steps: [
          { title: "Tool call", text: "An agent proposes a move." },
          { title: "Validation", text: "The move must be legal." },
          { title: "Speaker selection", text: "The turn passes to the other agent." },
        ],
      },
    ],
    stack: ["Gemini", "AutoGen", "python-chess"],
    link: {
      href: "https://github.com/IndurasArrow/chess-agent",
      label: "Source on GitHub",
    },
  },
  {
    id: "demos",
    title: "Client demos and proofs of concept",
    summary: "Smaller builds from the first half of 2026.",
    domains: ["llm", "image", "speech", "vision"],
    period: "Jan to Jun 2026",
    visual: "grid",
    lead: "Earlier builds and client demos from my first months at Super AI Polaris.",
    points: [
      {
        tag: "Documents",
        text: "Document Q&A for a state mining corporation, on LangChain and ChromaDB.",
      },
      {
        tag: "Verification",
        text: "Marksheet verification on Gemini structured output.",
      },
      {
        tag: "Image",
        text: "A Gemini-plus-FLUX.1 pipeline: Gemini writes a prompt from a webcam photo and FLUX.1 renders it.",
      },
      {
        tag: "Procurement",
        text: "An assistant that answers from a spreadsheet and emails confirmed requests through the Gmail API.",
      },
      {
        tag: "Voice",
        text: "A LiveKit web client for a real-time voice agent.",
      },
      {
        tag: "Government",
        text: "Solutions for government CMS and PGMS projects.",
      },
    ],
    stack: ["LangChain", "ChromaDB", "Gemini", "FLUX.1", "LiveKit", "Gmail API"],
  },
  {
    id: "plant-care",
    title: "Plant Care",
    summary: "Product design: a remote plant-watering app.",
    domains: ["design"],
    period: "Design study",
    image: plantCare,
    embed: drive("1-BUgz7JD6IXPZVvAfpzeGbkj4bR3e6-S"),
  },
  {
    id: "health-care",
    title: "Health Care",
    summary: "Product design: a hospital admin dashboard.",
    domains: ["design"],
    period: "Design study",
    image: healthCare,
    embed: drive("10Vad8qUQWH35hss8drF-Awajn-hrx-Pd"),
  },
  {
    id: "pillo",
    title: "Pillo",
    summary: "Product design: a medication reminder app.",
    domains: ["design"],
    period: "Design study",
    image: pillo,
    embed: drive("1tUntOUP5qq2kJ1w14QuydhCiFkTFFHI7"),
  },
];
