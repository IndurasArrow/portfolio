"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

/**
 * The floating particle field behind the whole page.
 *
 * Same idea as the original (drifting dots that scatter from the cursor and
 * multiply on click), with three additions: the dots sit at different depths
 * and shift with the pointer, they twinkle, and the ones near the cursor are
 * joined to it by faint lines.
 */
export default function ParticlesBackground() {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo<ISourceOptions>(() => {
    const color = resolvedTheme === "light" ? "#000000" : "#ffffff";
    return {
      fullScreen: { enable: true, zIndex: -1 },
      background: { color: { value: "transparent" } },
      fpsLimit: 120,
      detectRetina: true,
      interactivity: {
        events: {
          onClick: { enable: true, mode: "push" },
          onHover: {
            enable: true,
            mode: ["grab", "repulse"],
            parallax: { enable: true, force: 70, smooth: 14 },
          },
          resize: { enable: true },
        },
        modes: {
          push: { quantity: 4 },
          repulse: { distance: 110, duration: 0.4 },
          grab: { distance: 190, links: { opacity: 0.35, color } },
        },
      },
      particles: {
        color: { value: color },
        links: { enable: false },
        move: {
          direction: "none",
          enable: true,
          outModes: { default: "bounce" },
          random: false,
          speed: { min: 0.3, max: 1.4 },
          straight: false,
        },
        number: {
          density: { enable: true, width: 1200, height: 800 },
          value: 90,
          limit: { mode: "delete", value: 160 },
        },
        opacity: {
          value: { min: 0.15, max: 0.6 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      // Honour the visitor's reduced-motion setting: slow right down.
      motion: { disable: false, reduce: { factor: 6, value: true } },
    };
  }, [resolvedTheme]);

  if (!ready) return null;

  return (
    <div aria-hidden="true">
      <Particles id="tsparticles" options={options} />
    </div>
  );
}
