"use client";

import { useEffect, useRef, useState } from "react";
import type { Readout } from "@/lib/swarm";

/**
 * The particle swarm behind the page, and the small readout that names the
 * form it is in. The engine and three.js are loaded after the page is
 * interactive, so they never hold up the first paint.
 *
 * Where the browser has neither WebGPU nor WebGL 2 nothing is drawn and the
 * page reads as it does without it: the headline figures stay as text (see
 * `.stage-fallback` in globals.css).
 *
 * Add `?renderer=webgl` to the address to run the WebGL 2 fallback on a
 * browser that has WebGPU.
 */
export default function Swarm() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [readout, setReadout] = useState<Readout | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    let destroy = () => {};

    (async () => {
      document.documentElement.dataset.scene = "loading";
      const [{ createSwarm }] = await Promise.all([
        import("@/lib/swarm"),
        // The figures are drawn in the page's typeface, so wait for it.
        document.fonts.ready,
      ]);
      if (cancelled) return;
      try {
        const swarm = await createSwarm(el, {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
          font: getComputedStyle(document.body).fontFamily,
          forceWebGL:
            new URLSearchParams(window.location.search).get("renderer") ===
            "webgl",
          onReadout: setReadout,
        });
        if (cancelled) {
          swarm.destroy();
          return;
        }
        destroy = swarm.destroy;
        document.documentElement.dataset.scene = "on";
      } catch {
        // No usable GPU here. The page is complete without the swarm.
        document.documentElement.dataset.scene = "off";
      }
    })();

    return () => {
      cancelled = true;
      destroy();
      delete document.documentElement.dataset.scene;
    };
  }, []);

  return (
    <div aria-hidden="true">
      <canvas ref={canvas} className="swarm" />
      {readout && (
        <p className="swarm-readout">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          {readout.count.toLocaleString("en-US")} points
          <span className="opacity-40">/</span>
          {readout.backend}
          {readout.label && (
            <>
              <span className="opacity-40">/</span>
              {readout.label}
            </>
          )}
        </p>
      )}
    </div>
  );
}
