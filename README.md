# Divyansh Maewal · portfolio

Personal site of Divyansh Maewal, Lead AI Deployment Engineer.
Live at <https://portfolio-five-mauve-38.vercel.app>.

The second version of the site. It keeps the first version's look (a
particle field, the floating card navbar, the very large light type, the
nested cards and the full-screen viewer) and extends it to cover the
engineering work.

## What is on the page

- **The swarm**: one particle system behind the whole page, simulated on the
  GPU. It goes to whichever stage (an element with `data-shape`) the visitor
  is scrolling towards and takes the form that stage names: what "Lately" is
  naming in the hero, each headline figure, a glyph per domain, the workflow,
  the year's workstreams, a globe. Each particle is pulled to its place on a
  damped spring whose pull builds up after each change, so a change of form is
  one eased flight of a little under a second. Anything moving fast is drawn
  as a short streak along its path, the way a camera would blur it. Particles
  in motion are lit in the signal colour and, on the dark theme, glow through
  a bloom pass. Forms tip with the scroll,
  particles off the focal plane blur, they part around the pointer, and a
  click sends a ripple through them.
  - It runs on WebGPU (120,000 particles, 40,000 on small screens) and falls
    back to WebGL 2 (60,000 and 24,000); three.js picks, and the same code
    drives both. `?renderer=webgl` forces the fallback.
  - It watches its own frame time and steps quality down if a device cannot
    keep up: resolution, then bloom, then particle count.
  - It stops drawing behind the project viewer and when its stage is far off
    screen. With reduced motion, forms change without flight. With no usable
    GPU the page reads the same, with the figures as text.
  - Forms live in `src/lib/shapes.ts`, the engine in `src/lib/swarm.ts`.
- **Scrolling**: smooth and inertial, through Lenis. Off for visitors who
  prefer reduced motion; touch screens keep native scrolling.
- **Hero**: the large headline with the swarm above it, in the room the text
  leaves (it is never behind the words). The swarm draws whatever
  "Lately: …" is naming; the rail under the headline shows how long the
  current item has left and lets a visitor pick one. Also the current role
  with a live marker, the local time in IST, and two actions: see the work,
  download the CV. Until the swarm is running, a small seed holds its place:
  there is no loading screen, because the page is readable well before the
  swarm's code has arrived.
- **Numbers**: four headline figures, each drawn by the swarm, with its own
  small graphic (a dot per pull request, the cut-over steps, before/after
  bars, the share of flagged records).
- **Work**: thirteen cards, filterable by domain, that stand up out of the
  page in 3D as they scroll in. Design studies show their cover on a tablet
  built in CSS 3D that turns with the pointer. Opening a card is a view
  transition: its visual grows into the viewer and shrinks back on close. A
  design study opens as a brief (the cover, what it is, what the document
  shows, in order) beside the document itself. Engineering projects have an
  animated line-art visual; design studies keep their cover image. A card opens
  the full-screen viewer, with previous/next and keyboard support
  (`←` `→` `Esc`). Case studies carry their own diagrams there. Design studies
  open their embedded document, as before.
- **Domains**: the domains in large type; selecting one shows what it covers,
  its projects and its tools, and has the swarm draw it. Then a coverage matrix of every project against
  every domain, and the full stack in tabs.
- **Method**: the sub-agent-driven development workflow as a diagram.
- **About**: a paragraph that lights up as it is read, and the year as a
  timeline chart. Experience is a line through time, one card per role with
  its focus, its length and (for a role with projects on this page) its
  workstreams, each opening its case study. Education is a card per course
  with its headline figure.
- **Contact**.

## Accessibility

Audited against WCAG 2.2 AA with axe-core and by hand, in both themes, from
320px to 2560px wide.

- **Motion**: "Pause animations" in the display menu (beside the theme)
  stops everything that moves by itself, and is remembered. The system
  setting for reduced motion is honoured too.
- **Contrast**: all text meets 4.5:1, or 3:1 where it is large, in both
  themes. The swarm is laid out so it is never behind text.
- **Keyboard**: everything is reachable and has a visible focus ring; the
  domain list takes arrow keys; the viewer closes on `Esc`.
- **Touch**: controls are at least 44px on touch screens, and nothing
  scrolls sideways at any width.

## Stack

- Next.js 16 (App Router, fully static output) and React 19
- TypeScript, strict
- Tailwind CSS 3 with the shadcn/ui "new-york" theme (stone palette) the site
  started with; components in `src/components/ui`
- `next-themes` for light, dark and system themes
- three.js (WebGPU renderer, TSL shaders and compute, bloom) for the particle
  swarm, loaded after the page is interactive
- Lenis for smooth scrolling
- Inter through `next/font`

## Run it

Requires Node 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
npm run typecheck
```

## Editing the content

All copy lives in `src/content/`. The components only lay it out.

| File | Holds |
| --- | --- |
| `src/content/site.ts` | Name, role, links, hero copy, headline figures, nav, the About paragraph |
| `src/content/work.ts` | Every card in the Work grid, and what the viewer shows for it |
| `src/content/profile.ts` | Domains, workflow steps, experience, skills, education |

To add a project, append an object to `projects` in `work.ts`. Give it a
`visual` (one of the line-art animations in
`src/components/project-visual.tsx`) or an `image`, and list its `domains`;
it then appears in the grid, the filters and the domain explorer on its own.
On the unfiltered grid the first card is the wide one and the next six are
half-width, so order the list by importance.

Diagrams are data too. A project's `figures` (flow, growth, share, matrix,
dots, tiles, facts) are drawn in the viewer by `src/components/figures.tsx`;
the graphics under the headline numbers come from `ledger` in `site.ts`; the
timeline chart reads `timeline` in `profile.ts`.

## Structure

```
src/
  app/            layout, page, global styles, metadata routes (sitemap,
                  robots, manifest, icons, social preview images), 404
  components/     navbar, particle swarm, work grid, viewer, project
                  visuals, domain explorer, workflow diagram, small effects
  components/ui/  shadcn/ui components (card, button, badge, tabs, dropdown)
  content/        all site copy, typed
  lib/            the swarm engine and its forms, class-name helper, social
                  preview renderer
  assets/         design covers and the font used by the preview image
```

More shadcn/ui components can be added with `npx shadcn@latest add <name>`;
`components.json` is set up for it.

## Deployment

Deployed on Vercel from `main`; every push builds and goes live.

Canonical links, the sitemap and the social preview image use
`https://portfolio-five-mauve-38.vercel.app` unless `NEXT_PUBLIC_SITE_URL` is
set. Once the custom domain is serving again, set
`NEXT_PUBLIC_SITE_URL=https://www.divyanshmaewal.com` in the Vercel project's
environment variables and redeploy.

## Licences

Inter is licensed under the SIL Open Font License 1.1.
