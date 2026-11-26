/**
 * Identity, links and site-wide copy.
 * Everything a visitor reads on the site lives in `src/content/`; the
 * components only lay it out.
 */

/**
 * The address used for canonical links, the sitemap and social preview
 * images. It has to be one that resolves, or link previews come up empty.
 *
 * The custom domain (www.divyanshmaewal.com) is down for now, so this falls
 * back to the Vercel address. When the domain is back, set
 * NEXT_PUBLIC_SITE_URL=https://www.divyanshmaewal.com in the Vercel project
 * settings and redeploy; nothing here needs to change.
 */
const fallbackUrl = "https://portfolio-five-mauve-38.vercel.app";

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl,
  name: "Divyansh Maewal",
  initials: "DM",
  role: "Lead AI Deployment Engineer",
  employer: "Super AI Polaris",
  employerLocation: "New Delhi",
  location: "Kanpur, Uttar Pradesh, India",
  timezone: "IST, UTC+5:30",
  email: "maewal.divyansh@gmail.com",
  linkedin: "https://www.linkedin.com/in/divyansh-maewal-aa711b1a6",
  linkedinLabel: "linkedin.com/in/divyansh-maewal",
  /** The PDF in /public. Replace the file to update the CV; keep the name. */
  cv: "/Divyansh_Maewal_CV.pdf",
  title: "Divyansh Maewal · Lead AI Deployment Engineer",
  description:
    "Tech lead and forward-deployed AI engineer who takes products from handover to production: LLM and agentic AI features, speech AI, and the apps, backends, integrations and cloud around them.",
  focus: [
    "Forward-deployed engineering",
    "Agentic AI",
    "LLM applications",
    "Speech AI",
    "Production delivery",
  ],
  updated: "November 2026",
} as const;

export const nav = [
  { id: "work", label: "Work", mobile: true },
  { id: "domains", label: "Domains", mobile: false },
  { id: "method", label: "Method", mobile: false },
  { id: "about", label: "About", mobile: true },
  { id: "contact", label: "Contact", mobile: true },
] as const;

export const hero = {
  eyebrow: `${site.role} at ${site.employer}, ${site.employerLocation}`,
  headline: ["Forward Deployed", "Engineer"],
  body: "I take AI products from handover to production: the LLM, agent, speech and vision features, and the apps, backends and cloud around them.",
  /** Cycled in the hero, one at a time. */
  rotating: [
    "agentic AI",
    "LLM apps and RAG",
    "live speech translation",
    "vision analytics",
    "cloud cut-overs",
    "full-stack platforms",
  ],
};

export const about =
  "I am a tech lead and AI deployment engineer, forward-deployed on client projects. I take products from handover to production, and I stay hands-on while doing it: every feature goes through a written spec and plan, a fresh coding sub-agent per task, and review sub-agents that check each task before it is accepted. I trained as a UX and UI designer before I moved into engineering.";

/** The small graphic drawn under a headline figure. */
export type StatGraphic =
  | { kind: "dots"; count: number; columns: number }
  | { kind: "steps"; steps: string[]; note: string }
  | {
      kind: "bars";
      unit: string;
      max: number;
      before: { label: string; low: number; high: number };
      after: { label: string; value: number };
    }
  | { kind: "share"; part: number; whole: number; cells: number; columns: number };

export type Metric = {
  value: string;
  unit?: string;
  label: string;
  detail?: string;
  graphic?: StatGraphic;
};

/** The four numbers the page leads with. Each is repeated in its case study. */
export const ledger: Metric[] = [
  {
    value: "438",
    label: "Pull requests merged in ten weeks",
    detail: "One dot per pull request, on a food-delivery platform I took over before launch.",
    graphic: { kind: "dots", count: 438, columns: 30 },
  },
  {
    value: "140k+",
    label: "Quotations cut over to Azure",
    detail: "A client's production finance CRM, moved in three steps.",
    graphic: {
      kind: "steps",
      steps: ["Staged restore", "Schema migration", "Database swap"],
      note: "Rollback kept",
    },
  },
  {
    value: "0.85",
    unit: "s",
    label: "Median speech-translation delay",
    detail: "Down from a client-reported 5 to 6 seconds.",
    graphic: {
      kind: "bars",
      unit: "s",
      max: 6,
      before: { label: "Before", low: 5, high: 6 },
      after: { label: "After", value: 0.85 },
    },
  },
  {
    value: "352k",
    label: "Payment records verified by OCR",
    detail: "5,440 flagged for review: about 1.5%, the three lit dots in 200.",
    graphic: { kind: "share", part: 5440, whole: 352000, cells: 200, columns: 25 },
  },
];
