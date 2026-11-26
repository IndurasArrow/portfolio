"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nav, site } from "@/content/site";
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
    <div className="fixed top-4 z-50 flex w-full justify-center">
      <Card className="relative z-20 flex max-h-12 w-11/12 max-w-[83rem] sm:w-[calc(91.666667%+3rem)] items-center justify-between bg-card/70 px-3 py-6 shadow-none backdrop-blur-xl backdrop-saturate-150 sm:pl-6 sm:pr-4">
        <a
          href="#top"
          className="cursor-pointer pl-1.5 text-sm sm:pl-0"
          aria-label={`${site.name}, back to top`}
        >
          <span className="hidden md:block">{site.name}</span>
          <span className="block md:hidden">{site.initials}</span>
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
                    "relative rounded-md px-2 py-1.5 text-sm transition-colors sm:px-2.5 md:px-3",
                    active === item.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    !item.mobile && "hidden md:block",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-transparent">
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="nav-progress" aria-hidden="true" />
      </Card>
    </div>
  );
}
