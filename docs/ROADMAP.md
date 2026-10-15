# Roadmap

Do not skip phases without explicit user approval.

## Phase 1 — Credibility wedge (ship first)
**Goal:** local test environment that does not break a live bank system + tiny Studio wow.

- [x] Repo scaffold (`cobol-runtime-kit` provisional)  
- [x] Sample COBOL project + `cobol.toml`  
- [x] Scripts: `compile` / `run` / `test` (GnuCOBOL) via Runtime Kit  
- [x] Tiny Studio shell (Monaco editor + explain/docs + run/test + line errors)  
- [x] Basic CI (compile + test + estate validate + Studio build)  
- [x] README with real local setup commands  
- [x] Bank-scale data model stubs (`packages/estate-model` schema + fixture + validate)  
- [x] Windows GnuCOBOL setup helper (`scripts/setup-gnucobol-windows.ps1`)  
- [x] Phase 1 gate (`npm run phase1:check`; use `--allow-demo` if cobc not installed yet)  

**Status:** Phase 1 complete (2026-10-15). Real `cobc` proven on Ubuntu CI; Windows may use DEMO Run until GnuCOBOL is installed locally.

**Success:** a new developer runs a COBOL sample locally in minutes.

## Phase 2 — Bank wedge (revolution starts)
**Goal:** legacy intelligence — understand and prove change.

**Slices 1–2 (shipped):** see [PHASE2.md](./PHASE2.md)

- [x] Full estate ingest for git-folder sample (source, copybooks, JCL) — `packages/estate-ingest`  
- [x] Ghost detection (orphan load/source, undocumented runs, dynamic-uncertain)  
- [x] Lineage edges (program ↔ copybook ↔ dataset ↔ job) + Studio Estate panel  
- [x] Impact analysis (“if this field changes, what breaks?”) + change report JSON  
- [x] Business-rule extraction (IF / COMPUTE / EVALUATE / `*> RULE:`)  
- [x] Safe refactor suggestions + generated test stubs  
- [x] Stronger CI risk gates (block/ack on high impact) — `npm run risk:gate`  
- [x] Customer zip / export ingest beyond in-repo fixture  

**Status:** Phase 2 complete (2026-10-15) for bank-playground + zip connector. Enterprise read-only connectors remain Phase 3.

**Success:** a team can explain and risk-score a change without tribal knowledge; inventory includes ghosts, not only wiki lists.

## Phase 3 — Controlled code→COBOL + enterprise
**Goal:** modern expression → idiomatic COBOL; real bank runtimes.

**Early bridge (started):** EasyLang ladder — see [EASY-MODE.md](./EASY-MODE.md)

- [x] EasyLang v0 (vars, print, math, if/else) → GnuCOBOL + Studio Easy mode  
- [x] EasyLang v1 (while, for-range, lists/OCCURS, and/or/not, string concat)  
- [x] EasyLang v2 (`def` / `return` / calls / `const` → nested COBOL programs)  
- [x] EasyLang v3 (line-seq files + FILE STATUS, `assert`, `import`, `load_table`, `try`/`raise`)  
- [x] EasyLang v4 (bank-shaped `record` / field access → COBOL group items)  
- [x] EasyLang v5 (typed `def` + `stub_sql` / `stub_http` / `stub_load` — local stubs)  
- [ ] EasyLang v6 / real enterprise connectors — Phase 3  
- [ ] Controlled language subset → COBOL (full Phase 3; not “any language perfect”)  
- [ ] IBM Enterprise COBOL adapters  
- [ ] Micro Focus adapters (secondary)  
- [ ] Control Plane envs + approvals  
- [ ] Sense dashboards (slow / break / blast radius)  
- [ ] Network / API / file / queue adapters  

**Success:** modern developers contribute safely; ops can see and contain failures.

## Explicit non-goals (near term)
- Replacing IBM mainframe OS  
- Day-1 promise of any language → any COBOL dialect perfectly  
- AI chat without runnable / testable COBOL  
- Deploying to real bank prod without human approval gates  
