import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Backdrop from "@/components/backdrop";
import Navbar from "@/components/navbar";
import ParticlesBackground from "@/components/particles-background";
import ThemeProvider from "@/components/theme-provider";
import { ViewerProvider } from "@/components/viewer";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    site.name,
    site.role,
    "Forward-deployed engineer",
    "AI deployment engineer",
    "Agentic AI",
    "LLM applications",
    "RAG",
    "Speech AI",
    "Vision AI",
    "Claude Code",
    "Sub-agent-driven development",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_IN",
    firstName: "Divyansh",
    lastName: "Maewal",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  description: site.description,
  worksFor: { "@type": "Organization", name: site.employer },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kanpur",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "MIT Pune" },
    { "@type": "CollegeOrUniversity", name: "IIT Guwahati" },
  ],
  knowsAbout: site.focus,
  sameAs: [site.linkedin],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      id="top"
      data-scroll-behavior="smooth"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="fixed left-4 top-[-4rem] z-[60] rounded-md bg-foreground px-3 py-2 text-sm text-background transition-[top] focus:top-4"
          >
            Skip to content
          </a>
          <Navbar />
          <ViewerProvider>{children}</ViewerProvider>
          <Backdrop />
          <ParticlesBackground />
        </ThemeProvider>
      </body>
    </html>
  );
}
