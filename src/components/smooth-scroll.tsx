"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/**
 * Smooth, inertial scrolling with Lenis. It still scrolls the real document,
 * so the scroll-linked CSS animations, the navbar's section tracking and
 * in-page links keep working as they are.
 *
 * It also publishes the scroll speed as `--sv` (-1 to 1) on the root element,
 * which the marquees lean into.
 *
 * Skipped for visitors who prefer reduced motion. Touch screens keep their
 * native scrolling either way.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.12 });
    let rest = 0;
    const off = lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      const speed = Math.max(-1, Math.min(1, velocity / 45));
      root.style.setProperty("--sv", speed.toFixed(3));
      window.clearTimeout(rest);
      rest = window.setTimeout(() => root.style.setProperty("--sv", "0"), 120);
    });

    return () => {
      off();
      window.clearTimeout(rest);
      root.style.removeProperty("--sv");
      lenis.destroy();
    };
  }, []);

  return null;
}
