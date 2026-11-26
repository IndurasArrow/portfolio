# Divyansh Maewal · portfolio

Personal site of Divyansh Maewal, Lead AI Deployment Engineer.
Live at <https://portfolio-five-mauve-38.vercel.app>.

The second version of the site. It keeps the first version's look (the
particle field, the floating card navbar, the very large light type, the
nested cards and the full-screen viewer) and extends it to cover the
engineering work.

## What is on the page

- **Hero**: the large headline over the particle field. The particles drift at
  different depths, shift with the pointer, and link to it with faint lines.
  The headline's letters thicken as the pointer comes near. A soft pointer
  light and a film grain sit behind everything.
- **Numbers**: four headline figures that count up, each with its own small
  graphic (a dot per pull request, the cut-over steps, before/after bars, the
  share of flagged records).
- **Work**: thirteen cards, filterable by domain. Engineering projects have an
  animated line-art visual; design studies keep their cover image. A card opens
  the full-screen viewer, with previous/next and keyboard support
  (`←` `→` `Esc`). Case studies carry their own diagrams there. Design studies
  open their embedded document, as before.
- **Domains**: the domains in large type; selecting one shows what it covers,
  its projects and its tools. Then a coverage matrix of every project against
  every domain, and the full stack in tabs.
- **Method**: the sub-agent-driven development workflow as a diagram.
- **About**: a paragraph that lights up as it is read, the year as a timeline
  chart, experience and education.
- **Contact**.

## Stack

- Next.js 16 (App Router, fully static output) and React 19
- TypeScript, strict
- Tailwind CSS 3 with the shadcn/ui "new-york" theme (stone palette) the site
  started with; components in `src/components/ui`
- `next-themes` for light, dark and system themes
- tsParticles (slim) for the background
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
  components/     navbar, particle background, work grid, viewer, project
                  visuals, domain explorer, workflow diagram, small effects
  components/ui/  shadcn/ui components (card, button, badge, tabs, dropdown)
  content/        all site copy, typed
  lib/            class-name helper and the social preview renderer
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
