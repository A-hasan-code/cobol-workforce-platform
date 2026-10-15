# COBOL Workforce Platform

Make every developer a COBOL-capable engineer — without rewriting bank COBOL systems.

Working name (provisional): **cobol-runtime-kit**

## Status

- **Phase 1:** complete — [docs/PHASE1.md](./docs/PHASE1.md)  
- **Phase 2 slice 1:** ingest + ghosts + impact — [docs/PHASE2.md](./docs/PHASE2.md)  
- **EasyLang v0:** write Python-easy → real COBOL — [docs/EASY-MODE.md](./docs/EASY-MODE.md)  
- Roadmap: [docs/ROADMAP.md](./docs/ROADMAP.md)

| Piece | Path |
|-------|------|
| Runtime Kit CLI | `packages/runtime-kit` — doctor / compile / run / test |
| Bank-shaped sample | `samples/bank-playground` (+ JCL, inventory, planted ghosts) |
| Studio playground | `apps/studio` — Monaco, Explain / **Estate** / Docs, Run/Test |
| Estate model | `packages/estate-model` — schema + fixture |
| Estate ingest | `packages/estate-ingest` — parsers, ghosts, impact |
| EasyLang | `packages/easylang` — modern subset → GnuCOBOL |
| CI pipeline | `.github/workflows/ci.yml` (Ubuntu + real `cobc`) |
| Product + COBOL docs | `docs/` |

## Quick start

### 1) Install prerequisites
- Node.js 20+
- GnuCOBOL (`cobc` on PATH) — optional for DEMO Run; required for real Test

Full steps: [docs/INSTALL.md](./docs/INSTALL.md)  
Windows helper: `powershell -ExecutionPolicy Bypass -File scripts\setup-gnucobol-windows.ps1` (Admin for Chocolatey)

### 2) Install deps + verify
```bash
npm install
npm run estate:ingest
npm run estate:validate
npm run phase2:check
npm run doctor
npm run phase1:check -- --allow-demo
```

### 3) CLI loop (no UI)
```bash
npm run compile
npm run run:sample
npm run test:sample
```

### 4) Studio playground
```bash
npm run studio
```
Open **http://localhost:8787**

- Toggle **Easy** | **COBOL** — EasyLang (`interest.easy`) → **Generate** → Compile / Run / Test  
- Side panel **Easy** (allow-list) + **Estate** (ghosts / impact)  
- Beginner Docs: **http://localhost:8787/docs**  
- CLI: `npm run easy:build -- samples/bank-playground/src/interest.easy`  
- If `cobc` missing: DEMO Run + Install strip (CI still proves real compile on Ubuntu)

## Safety
- Sample uses **fake** account data only
- No deploy / no git push unless you explicitly ask (see [docs/SAFETY.md](./docs/SAFETY.md))
- Breaking the playground cannot take down a real bank

## Docs index
Start at [docs/README.md](./docs/README.md)

| Doc | What |
|-----|------|
| [Phase 1](./docs/PHASE1.md) | Credibility wedge — complete |
| [Phase 2](./docs/PHASE2.md) | Bank wedge slice 1 — ingest / ghosts / impact |
| [Easy Mode](./docs/EASY-MODE.md) | Modern → COBOL ladder (v0 shipped) |
| [Install](./docs/INSTALL.md) | Node + GnuCOBOL setup |
| [Render](./docs/RENDER.md) | Cloud deploy (Docker + real cobc) |
| [Playground](./docs/PLAYGROUND.md) | How to use Studio |
| [Vision](./docs/VISION.md) | Promise and audiences |
| [Problems](./docs/PROBLEMS-CATALOG.md) | Pain catalog |
| [Architecture](./docs/ARCHITECTURE.md) | System design |
| [Estate ingest](./docs/ESTATE-INGEST.md) | Ghost code / full lift (Phase 2) |
| [COBOL reference](./docs/cobol/README.md) | Language + bank stack |

## Cursor rules
`.cursor/rules/` — vision, git/deploy safety, senior-dev workflow.

## Owner
Git identity (when configured): `A-hasan-code` / `alihasan12soft786@gmail.com`
