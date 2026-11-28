"use client";

import { DownloadIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nav, site } from "@/content/site";
import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Navbar() {
  const { setTheme } = useTheme();
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const paused = useSyncExternalStore(
    motion.subscribe,
    motion.paused,
    motion.pausedOnServer,
  );

  // Pick up "Pause animations" from an earlier visit.
  useEffect(() => motion.restore(), []);

  // Which section is under the navbar right now.
  useEffect(() => {
    const ids = nav.map((item) => item.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive([...ids].reverse().find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-25% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Slide the highlight under the active link.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const link = listRef.current?.querySelector<HTMLElement>(
        `[data-nav="${active}"]`,
      );
      setPill(
        link && link.offsetParent !== null
          ? { left: link.offsetLeft, width: link.offsetWidth }
          : null,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <header className="navbar fixed top-4 z-50 flex w-full justify-center">
      <Card className="relative z-20 flex max-h-12 w-11/12 max-w-[83rem] sm:w-[calc(91.666667%+3rem)] items-center justify-between bg-card/70 px-3 py-6 shadow-none backdrop-blur-xl backdrop-saturate-150 sm:pl-6 sm:pr-4">
        {/* The words on screen are part of the link's name, so it can be
            asked for by voice as it reads. */}
        <a
          href="#top"
          className="tap inline-flex cursor-pointer items-center py-2 pl-1.5 text-sm sm:pl-0"
        >
          <span className="hidden md:block">
            {site.name}
            <span className="sr-only">, back to top</span>
          </span>
          <span className="block md:hidden">
            {site.initials}
            <span className="sr-only">, {site.name}, back to top</span>
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <nav aria-label="Sections">
            <div ref={listRef} className="relative flex items-center">
              {pill && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 h-8 -translate-y-1/2 rounded-md bg-accent transition-[left,width] duration-300 ease-out"
                  style={{ left: pill.left, width: pill.width }}
                />
              )}
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  data-nav={item.id}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "tap relative inline-flex items-center justify-center rounded-md px-1.5 py-1.5 text-sm transition-colors min-[360px]:px-2 sm:px-2.5 md:px-3",
                    active === item.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    !item.mobile && "hidden md:inline-flex",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden h-9 gap-1.5 bg-transparent md:inline-flex"
          >
            <a href={site.cv} download aria-label="Download CV">
              <DownloadIcon />
              CV
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="tap bg-transparent">
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Display: theme and animation</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Stops everything that moves by itself: the particle swarm,
                  the cycling phrase, the marquees and the looping diagrams. */}
              <DropdownMenuCheckboxItem
                checked={paused}
                onCheckedChange={(checked) => motion.set(checked === true)}
              >
                Pause animations
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="nav-progress" aria-hidden="true" />
      </Card>
    </header>
  );
}
