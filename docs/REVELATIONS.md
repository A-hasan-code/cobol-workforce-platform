# Revelations

Living log of product insights from discovery. Newest entries at the bottom of each section. Do not delete history — mark superseded items.

---

## R1 — COBOL did not stop evolving; estates did
**Date:** 2026-10-15  

Language upgrades exist (COBOL-85 → 2002 → 2014; vendors add JSON/XML/REST/Java interop). The “no upgrade” feeling comes from banks still running old-style codebases because rewrite risk/cost is high.

**Implication:** sell safe change and workforce access, not “COBOL is dead / rewrite everything.”

---

## R2 — Fame and bank money need different faces of one product
**Date:** 2026-10-15  

- Students / indie → demos, playground, learning → fame + talent  
- IT services → delivery partners  
- Banks → pay for trust, risk reduction, audit  

**Implication:** public face = Studio + Runtime Kit; revolution = Pipeline + Control Plane + Sense. Same platform, different surfaces.

---

## R3 — The OS pain is a bridge problem, not a delete-COBOL problem
**Date:** 2026-10-15  

Banks are stuck because the world cannot work on their COBOL. Revolution = global workforce layer on top of COBOL, not ripping out the mainframe on Day 1.

**Positioning line:** *Make every developer a COBOL-capable engineer.*

---

## R4 — Developers scarce is the business #1; weak deploy is the technical #1
**Date:** 2026-10-15  

- Business pain: too few COBOL-capable engineers  
- Weakest technical gap: no safe local/CI/staging/prod loop + weak visibility when things break  

**Implication:** build test environment + Sense path before betting the company on any-language→COBOL.

---

## R5 — Any-language → COBOL is a feature, not the foundation
**Date:** 2026-10-15  

Wow factor is high; bank trust is low if promised as perfect Day 1. Controlled subset + tests + review only.

**Implication:** Phase 3 feature; Phase 1 = Runtime Kit + tiny Studio.

---

## R6 — Modern languages’ environment is the missing product
**Date:** 2026-10-15  

Other stacks assume: local test → CI → networking/adapters → graceful failure → observe/fix. COBOL banks lack this. Platform must feel like a normal engineering OS above COBOL.

**Implication:** Runtime Kit + Pipeline + Control Plane + Sense are not “nice extras” — they are the product.

---

## R7 — Fail soft + blast radius beats silent crash
**Date:** 2026-10-15  

Banks need: timeouts, safe retries, backpressure, graceful degradation, observability, rollback, clear blast radius.

**Implication:** Sense is part of the revolutionary story, not a later dashboard add-on only for marketing.

---

## R8 — Sequence audiences; don’t dilute Day 1
**Date:** 2026-10-15  

Serve all three audiences eventually, but ship in sequence: playground credibility first, bank intelligence next, enterprise connectors after.

**Implication:** A publicly + B architecture privately — playground UI, bank-scale data model underneath.

---

## R9 — Cursor governance is part of delivery discipline
**Date:** 2026-10-15  

Hard rules: ask before deploy; ask before git push; never let Cursor/AI appear as git author; identity = human (`A-hasan-code` / `alihasan12soft786@gmail.com` when configured).

**Implication:** encoded in `.cursor/rules/` and [SAFETY.md](./SAFETY.md).

---

## R10 — COBOL knowledge must be a first-class repo asset
**Date:** 2026-10-15  

Language + bank stack (JCL, CICS, Db2, VSAM) + three compiler families must live in-repo with official source links. ISO/IBM manuals are not copied wholesale (copyright); we summarize and cite.

**Implication:** maintain [cobol/](./cobol/README.md) as the engineering knowledge base feeding Studio/Runtime/Sense. Researched 2026-10-15 against ISO, GnuCOBOL, IBM, Rocket/MF docs.

---

## R11 — Related problems are a catalog, not a slogan
**Date:** 2026-10-15  

Beyond “developers kam” and “deploy weak,” estates fail on copybook blast radius, JCL/job graphs, batch windows, CICS/Db2 contracts, audit/compliance, and AI-without-proof traps. Industry surveys (e.g. Kyndryl 2025) reinforce talent + security/compliance pressure.

**Implication:** track pains as IDs in [PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md); map each to Studio / Runtime / Pipeline / Control / Sense.

---

## R12 — Full estate lift must include ghost code
**Date:** 2026-10-15  

“Sab kuch uthao” = source + copybooks + load members + JCL + lineage, then set-math for ghosts (orphan load/source, undocumented runs). Wiki-only inventory is a lie. Read-only, scoped, audited ingest — not silent prod data theft.

**Implication:** [ESTATE-INGEST.md](./ESTATE-INGEST.md) is the Phase 2 spine for Understanding problems (UND-03, UND-06, UND-08…).

---

## R13 — Playground ships before pipeline fame
**Date:** 2026-10-15  

Phase 1 delivered: Runtime Kit + Studio (Monaco, line diagnostics from cobc, Explain/Docs, Doctor/Install) + GitHub CI + estate-model stubs. Local proof removes prod fear; pipeline re-runs the same compile/test gate.

**Implication:** next human step on Windows = install GnuCOBOL so Run/Test go green; Phase 2 starts with full estate ingest + ghosts.

---

## R14 — Phase 1 closed with dual proof paths
**Date:** 2026-10-15  

CI (Ubuntu + apt `gnucobol`) is the authoritative green path for compile/test. Local Windows without `cobc` still ships DEMO Run + blocked Test so the Studio loop is teachable immediately. Estate schema/fixture validates in both environments.

**Implication:** do not block Phase 1 on admin rights for Chocolatey; document install script and keep CI as the hard gate.

---

## R15 — Phase 2 starts with set-math, not connectors
**Date:** 2026-10-15  

First bank value is inventory truth: S/L/J/C/D/Doc sets → ghost board + COPY/CALL/EXEC lineage + field impact. Git-folder ingest ships before z/OS connectors so demos stay safe and local.

**Implication:** Studio Estate panel + `estate-ingest` CLI are the Phase 2 wedge; enterprise connectors stay gated (R12).

---

## R16 — Modern → COBOL is a ladder, not a flip
**Date:** 2026-10-15  

Users want Python-level ease, not a Python costume over COBOL. Ship EasyLang v0 (print/vars/if) with real `cobc` proof, then add loops → functions → files → bank adapters rung by rung.

**Implication:** Studio Easy mode is the front door; `packages/easylang` owns allow-list honesty; Phase 3 expands the ladder, never “any Python perfect.”

---

## R17 — EasyLang v1 closes the “no loops” gap
**Date:** 2026-10-15  

After v0 basics, learners hit a wall without while/for/lists. v1 maps those to PERFORM / OCCURS with 0-based indexes and CONCATENATE for strings — still allow-listed, still cobc-proven.

**Implication:** Docs Run boxes and Studio Easy mode teach loops without jumping straight to raw PERFORM syntax.

---

## R18 — EasyLang v2 functions are nested COBOL, not fake sections
**Date:** 2026-10-15  

`def` / `return` / calls map to nested `PROGRAM-ID … IS COMMON` + `CALL … USING` (with `LK-RET` when needed). Periods inside IF/PERFORM must stay off so END-IF / END-PERFORM stay valid.

**Implication:** Learners get Python-shaped functions that still compile as real GnuCOBOL structure — next rung is files/asserts, not “any Python.”

---

## R19 — EasyLang v3 files are line-seq + FILE STATUS, not Python pathlib
**Date:** 2026-10-15  

`open` / `write` / `read` / `close` map to SELECT LINE SEQUENTIAL + OPEN/WRITE/READ/CLOSE with automatic FILE STATUS checks. `assert` fails loud. `import name` merges defs-only `name.easy` from the project folder.

**Implication:** Docs teach files one step at a time before classic FD vocabulary; no Day-1 promise of full Python I/O.

---

## R20 — EasyLang v4 is records first, not fake SQL
**Date:** 2026-10-15  

Bank work starts with *shapes* (account id/name/balance), not Day-1 Db2. `record Account:` → COBOL `01`/`05` group items; field access is real MOVE/COMPUTE. SQL/HTTP stay Phase 3 adapters.

**Implication:** Docs teach Records before promising enterprise connectors; learners see copybook-like layouts in Show COBOL.

---

## R21 — EasyLang v5 stubs beat fake “live bank”
**Date:** 2026-10-15  

Learners need SQL/HTTP *shape* without lying about connectivity. `stub_sql` / `stub_http` / `stub_load` + typed `def` emit real COBOL with `*> STUB` markers. Docs Adapters page is the front door.

**Implication:** Phase 3 connectors replace stubs; Docs never claim Db2 is online.

---

## R22 — Phase 2 closes with proof gates, not vibes
**Date:** 2026-10-15  

Ghosts + impact alone do not change bank behavior. Slice 2 adds extractable rules, advisory refactors with test stubs, ack-backed CI risk gates, and customer-zip ingest — same estate model, stronger Pipeline story.

**Implication:** Phase 2 checklist is complete for the sample estate; Phase 3 starts only with explicit approval (connectors / Control Plane / Sense).

---

## R23 — Plan v3 leftovers: load_table + try/raise
**Date:** 2026-10-15  

The Easy Mode plan’s v3 rung listed CSV `load_table` and `try`/`raise` beside files/assert. Shipping them keeps the ladder honest: line-seq OCCURS load (max 20) and flag+GO TO except — not Python pathlib or full exceptions.

**Implication:** Studio Easy panel lists Supported vs Coming (Phase 3); Docs Files steps 6–7 teach the new forms with Run boxes.

---

## R24 — Ops docs are first-class (not only learner Docs)
**Date:** 2026-10-15  

Studio Easy Mode / Docs teach the fame funnel. Bank revenue and the “production error fix” revolution need a separate written face: on-call playbook, two-pipeline Control Plane policy, and Sense incident/blast design — before Phase 3 UI ships.

**Implication:** maintain [PRODUCTION-OPS.md](./PRODUCTION-OPS.md), [CONTROL-PLANE.md](./CONTROL-PLANE.md), and [SENSE.md](./SENSE.md); index them from [README.md](./README.md) / [PROBLEM.md](./PROBLEM.md) / [MODULES.md](./MODULES.md). Do not dump ops playbooks into learner `docsContent.js`.

---

## How to add a revelation
1. Add `R#` with date  
2. One insight + one implication  
3. If it changes a locked decision, update [DECISIONS.md](./DECISIONS.md) and link back here  
