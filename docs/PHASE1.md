# Phase 1 — Complete

**Closed:** 2026-10-15  
**Goal met:** local COBOL run/test loop + tiny Studio + CI + estate stubs — without touching a live bank.

## Delivered

| Slice | Where |
|-------|--------|
| Runtime Kit (`doctor` / `compile` / `run` / `test`) | `packages/runtime-kit` |
| Bank sample + `cobol.toml` | `samples/bank-playground` |
| Studio (Monaco, line errors, Explain/Docs, Run/Test) | `apps/studio` → http://localhost:8787 |
| Beginner docs site | http://localhost:8787/docs |
| Estate schema + fixture | `packages/estate-model` |
| CI (Ubuntu GnuCOBOL) | `.github/workflows/ci.yml` |
| Windows install helper | `scripts/setup-gnucobol-windows.ps1` |
| Completion gate | `npm run phase1:check` |

## Verify locally

```bash
npm install
npm run estate:validate
npm run phase1:check -- --allow-demo   # if cobc not installed yet
npm run studio
```

With GnuCOBOL on PATH:

```bash
npm run doctor
npm run test:sample
npm run phase1:check
```

## What is *not* Phase 1

- Full estate ingest / ghost scanners (Phase 2)
- IBM / Micro Focus adapters (Phase 3)
- Any-language → perfect COBOL
- Deploy / Control Plane / Sense production ops

## Next

Start Phase 2 only with explicit approval — see [ROADMAP.md](./ROADMAP.md) and [ESTATE-INGEST.md](./ESTATE-INGEST.md).
