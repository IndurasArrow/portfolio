import { ArrowTopRightIcon, DownloadIcon } from "@radix-ui/react-icons";
import type { CSSProperties, ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CountUp } from "@/components/count-up";
import { CoverageMatrix } from "@/components/coverage-matrix";
import { DomainExplorer } from "@/components/domain-explorer";
import { StatGraphicView } from "@/components/figures";
import { HeroTitle } from "@/components/hero-title";
import { Pipeline } from "@/components/pipeline";
import { Rotator } from "@/components/rotator";
import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkGrid } from "@/components/work-grid";
import {
  domains,
  education,
  method,
  roles,
  skills,
  timeline,
} from "@/content/profile";
import { about, hero, ledger, site } from "@/content/site";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** A page section in the original rhythm: a rule, a large light heading, content. */
function Block({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex w-full flex-col items-center"
    >
      <div className="flex w-11/12 max-w-7xl py-2">
        <hr className="w-full bg-input" />
      </div>
      <div className="w-11/12 max-w-7xl flex-col pb-16 pt-12 md:pb-24">
        <div className="reveal flex items-end justify-between gap-6">
          <h2
            id={`${id}-title`}
            className="min-w-0 text-5xl font-light tracking-tight"
          >
            {title}
          </h2>
          <span
            aria-hidden="true"
            className="outline-num shrink-0 text-6xl font-light leading-[0.8] tracking-tighter sm:text-7xl md:text-8xl"
          >
            {index}
          </span>
        </div>
        {intro && (
          <p className="reveal mt-5 max-w-2xl text-muted-foreground">{intro}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Marquee({
  items,
  reverse = false,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className: string;
}) {
  // The list is rendered twice so the loop has no seam.
  return (
    <div className="marquee-wrap">
      <div
        className="marquee"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className={`flex shrink-0 items-center ${className}`}
          >
            {items.map((item) => (
              <li key={item} className="flex items-center whitespace-nowrap">
                {item}
                <span aria-hidden="true" className="mx-[0.6em] opacity-40">
                  /
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const tools = [...new Set(domains.flatMap((domain) => domain.stack))];

  return (
    <main id="main" className="mt-20 flex w-full flex-col items-center">
      {/* ------------------------------------------------------------ Hero */}
      <section
        aria-labelledby="hero-title"
        className="flex min-h-[max(calc(100svh-5rem),26rem)] w-11/12 max-w-7xl flex-col justify-end pb-10 pt-10"
      >
        <div
          className="fade-up mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
          style={delay(500)}
        >
          <p className="text-sm text-muted-foreground">{hero.eyebrow}</p>
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href={site.cv} download>
              <DownloadIcon />
              Download CV
            </a>
          </Button>
        </div>
        <div className="relative">
          <HeroTitle
            id="hero-title"
            lines={hero.headline}
            prefix={`${site.name},`}
          />
          <div
            className="fade-up mt-5 max-w-sm text-sm text-muted-foreground lg:absolute lg:bottom-[calc(var(--hero)*0.17)] lg:left-[calc(var(--hero)*4.62)] lg:mt-0 lg:max-w-[21rem] xl:max-w-[19rem]"
            style={delay(650)}
          >
            <p>{hero.body}</p>
            <p className="mt-3">
              Lately: <Rotator words={hero.rotating} />
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Numbers */}
      <section
        aria-label="In numbers"
        className="flex w-full flex-col items-center"
      >
        <div className="flex w-11/12 max-w-7xl py-2">
          <hr className="w-full bg-input" />
        </div>
        <dl className="grid w-11/12 max-w-7xl grid-cols-1 gap-x-6 gap-y-14 py-16 min-[520px]:grid-cols-2 md:py-24 lg:grid-cols-4">
          {ledger.map((metric, i) => (
            <div
              key={metric.label}
              className="reveal flex flex-col gap-3"
              style={delay(i * 80)}
            >
              <dt className="order-2">{metric.label}</dt>
              <dd className="order-1 text-6xl font-light tracking-tighter lg:text-7xl xl:text-8xl">
                <CountUp value={metric.value} />
                {metric.unit && (
                  <span className="ml-2 text-3xl text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
              </dd>
              <dd className="order-3 mt-3">
                {metric.graphic && <StatGraphicView graphic={metric.graphic} />}
                <p className="mt-4 max-w-[17rem] text-sm text-muted-foreground">
                  {metric.detail}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------ Work */}
      <Block
        id="work"
        index="01"
        title="Work"
        intro="Client work, internal platforms, personal projects and the design studies I started with. Filter by domain; open any card for the full story."
      >
        <WorkGrid />
      </Block>

      {/* ---------------------------------------------------------- Domains */}
      <div className="w-full py-10 md:py-16" aria-hidden="true">
        <Marquee
          items={domains.map((domain) => domain.title)}
          className="text-7xl font-light tracking-tight text-foreground/20 md:text-9xl"
        />
      </div>

      <Block
        id="domains"
        index="02"
        title="Domains"
        intro="I work across several kinds of AI and the engineering around them. Pick one to see what I have built in it."
      >
        <DomainExplorer />

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          Coverage
        </h3>
        <p className="reveal mt-3 max-w-2xl text-muted-foreground">
          Every project against every domain. Most of them sit in more than
          one.
        </p>
        <div className="mt-8">
          <CoverageMatrix />
        </div>

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          The full stack
        </h3>
        <Tabs defaultValue={skills[0]?.group} className="reveal mt-6">
          <TabsList className="h-auto flex-wrap justify-start gap-1">
            {skills.map((skill) => (
              <TabsTrigger key={skill.group} value={skill.group}>
                {skill.group}
              </TabsTrigger>
            ))}
          </TabsList>
          {skills.map((skill) => (
            <TabsContent key={skill.group} value={skill.group} className="mt-5">
              <ul className="fade-up flex flex-wrap gap-2">
                {skill.items.map((item) => (
                  <li key={item}>
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 text-sm font-normal"
                    >
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </Block>

      {/* ---------------------------------------------------------- Method */}
      <Block id="method" index="03" title="Method" intro={method.intro}>
        <div className="reveal">
          <Pipeline />
        </div>
        <dl className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {method.facts.map((fact) => (
            <div
              key={fact.label}
              className="reveal flex flex-col-reverse justify-end gap-3"
            >
              <dt className="max-w-xs text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="text-6xl font-light tracking-tight md:text-7xl">
                <CountUp value={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      {/* ----------------------------------------------------------- About */}
      <Block id="about" index="04" title="About">
        <p className="max-w-4xl text-2xl font-light leading-snug tracking-tight md:text-4xl md:leading-[1.2]">
          {about.split(" ").map((word, i) => (
            <span key={i} className="word">
              {word}{" "}
            </span>
          ))}
        </p>

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          {timeline.year}, in parallel
        </h3>
        <p className="reveal mt-3 max-w-2xl text-muted-foreground">
          {timeline.rows.length} workstreams with month-level dates, and{" "}
          {timeline.undated.length} more dated to the year. Select one to open
          it.
        </p>
        <div className="mt-8">
          <Timeline />
        </div>

        <div className="mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="reveal text-3xl font-light tracking-tight">
              Experience
            </h3>
            <ol className="mt-6 border-t">
              {roles.map((role) => (
                <li key={role.company} className="reveal border-b py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h4 className="text-xl font-medium">{role.title}</h4>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {role.current && (
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground"
                        />
                      )}
                      {role.period}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {role.company}, {role.place}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5">
            <h3 className="reveal text-3xl font-light tracking-tight">
              Education
            </h3>
            <ul className="mt-6 border-t">
              {education.map((item) => (
                <li key={item.title} className="reveal border-b py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h4 className="text-xl font-medium">{item.title}</h4>
                    {item.year && (
                      <span className="text-sm text-muted-foreground">{item.year}</span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{item.school}</p>
                  <p className="mt-3">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      {/* --------------------------------------------------------- Contact */}
      <div className="w-full pb-4 pt-10" aria-hidden="true">
        <Marquee
          items={tools}
          reverse
          className="text-2xl font-light text-foreground/30 md:text-3xl"
        />
      </div>

      <Block id="contact" index="05" title="Contact">
        <p className="reveal text-muted-foreground">Email</p>
        <a
          href={`mailto:${site.email}`}
          className="reveal group mt-2 inline-block max-w-full text-[clamp(1.1rem,5.6vw,5rem)] font-light leading-tight tracking-tight"
        >
          <span className="bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
            {site.email}
          </span>
        </a>

        <div className="reveal mt-8 flex flex-wrap gap-3">
          <CopyEmail email={site.email} />
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href={site.linkedin} target="_blank" rel="noreferrer me">
              LinkedIn
              <ArrowTopRightIcon />
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href={site.cv} download>
              <DownloadIcon />
              Download CV
            </a>
          </Button>
        </div>

        <dl className="reveal mt-16 grid gap-x-10 gap-y-6 border-t pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="mt-1">
              {site.role}, {site.employer}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Based in</dt>
            <dd className="mt-1">{site.location}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Time zone</dt>
            <dd className="mt-1">{site.timezone}</dd>
          </div>
        </dl>
      </Block>

      <footer className="flex w-11/12 max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t py-6 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <a href="#top" className="transition-colors hover:text-foreground">
          Back to top
        </a>
      </footer>
    </main>
  );
}
