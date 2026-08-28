# Tabletop Command Center

An offline-first Windows application for moderating cybersecurity tabletop exercises with a separate room display.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/tabletop-command run dev` — run the moderator and room-display web preview
- `pnpm --filter @workspace/tabletop-command run typecheck` — typecheck the tabletop app
- `pnpm --filter @workspace/tabletop-command run package:windows` — create the portable Windows application folder
- `pnpm --filter @workspace/tabletop-command run package:windows:installer` — create an NSIS installer (run on Windows)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Tabletop UI: React, Vite, Tailwind CSS, Wouter
- Desktop packaging: Electron and electron-builder

## Where things live

- `artifacts/tabletop-command/src/pages/console.tsx` — private moderator console
- `artifacts/tabletop-command/src/pages/display.tsx` — participant-facing room display
- `artifacts/tabletop-command/src/store/exercise.ts` — local exercise state and sample scenario
- `artifacts/tabletop-command/electron/main.cjs` — Windows dual-display desktop shell
- `artifacts/tabletop-command/DESKTOP.md` — packaging and exercise-room setup

## Architecture decisions

- The live exercise must run without internet, accounts, a database, APIs, or a local web server.
- The moderator window is private; the participant window only renders public injects and room effects.
- Team-private injects are delivered verbally in the MVP because teams do not use separate devices.
- Browser local storage powers the web preview and is shared by both Electron windows for autosave and recovery.

## Product

- Scenario title, objective, phase, timer, pause/reset controls, and moderator notes
- Editable pending injects with public/private release controls and random event draws
- Large participant timer, initial briefing, public injects, red alert, and wrong-assumption effects
- Team-tagged hot wash observations and local HTML report export
- Automatic dual-window placement for a Windows laptop with an extended projector display

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do not introduce CDN assets, remote fonts, cloud services, or server-only runtime dependencies.
- The portable Windows build can be produced on Replit; the optional NSIS installer should be finalized on Windows.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
