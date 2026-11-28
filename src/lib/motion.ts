/**
 * The visitor's own switch for animation: "Pause animations" in the display
 * menu. It is kept across visits, and is separate from the system setting
 * for reduced motion, which the page also honours.
 *
 * The switch is a `data-motion="off"` attribute on the root element. CSS
 * pauses the looping animations from it (globals.css), and the particle
 * swarm and the hero's cycling phrase read it directly.
 */
const KEY = "motion";
const listeners = new Set<() => void>();

export const motion = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  paused() {
    return document.documentElement.dataset.motion === "off";
  },
  /** For server rendering, where nothing is paused yet. */
  pausedOnServer() {
    return false;
  },
  set(paused: boolean) {
    if (paused) document.documentElement.dataset.motion = "off";
    else delete document.documentElement.dataset.motion;
    try {
      if (paused) localStorage.setItem(KEY, "off");
      else localStorage.removeItem(KEY);
    } catch {
      // Storage is unavailable (private window): the switch still works for this visit.
    }
    listeners.forEach((listener) => listener());
  },
  /** Applies the choice kept from an earlier visit. */
  restore() {
    try {
      if (localStorage.getItem(KEY) === "off") motion.set(true);
    } catch {
      // Nothing kept.
    }
  },
};
