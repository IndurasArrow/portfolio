"use client";

import { useEffect, useState } from "react";

/** Shows one phrase at a time, cross-fading to the next. */
export function Rotator({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap = 0;
    const timer = window.setInterval(() => {
      setShown(false);
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setShown(true);
      }, 350);
    }, 2400);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(swap);
    };
  }, [words.length]);

  return (
    <span
      className="inline-block text-foreground transition-all duration-300"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(6px)",
      }}
    >
      {words[index]}
    </span>
  );
}
