# Decisions (ADR-style)

Status values: `proposed` | `accepted` | `superseded` | `rejected`

---

## D1 — Product category
**Status:** accepted (2026-10-15)  
**Decision:** Build a workforce / control-plane layer on COBOL, not a mainframe OS replacement.  
**Why:** Banks buy risk reduction and talent access; OS replacement is decades + politics.  
**See:** [REVELATIONS.md](./REVELATIONS.md) R3  

---

## D2 — Audience sequence
**Status:** accepted (2026-10-15)  
**Decision:** Serve students + IT services + banks eventually; ship public playground first, bank intelligence next.  
**Why:** Avoid Day-1 dilution; fame builds trust; banks pay for Phase 2+.  
**See:** R2, R8  

---

## D3 — First build slice
**Status:** accepted (2026-10-15); Phase 1 closed  
**Decision:** Phase 1 = Runtime Kit + tiny Studio + basic CI + estate-model stubs (local run/test first).  
**Why:** Technical #1 pain is weak environment; local proof creates trust.  
**Proof:** `npm run phase1:check` (local); Ubuntu CI with apt GnuCOBOL for real cobc. Windows may use DEMO Run until cobc installed.  
**See:** R4, R6, R13, R14, [PHASE1.md](./PHASE1.md)  

---

## D4 — Runtime target order
**Status:** accepted (2026-10-15)  
**Decision:** GnuCOBOL → IBM Enterprise COBOL → Micro Focus.  
**Why:** Learn/demo/open path first; bank money on IBM; MF secondary.  

---

## D5 — Code → COBOL scope
**Status:** accepted (2026-10-15)  
**Decision:** Controlled subset only in Phase 3; no Day-1 “any language → perfect COBOL.”  
**Why:** Enterprise correctness and trust; wow feature must not undermine bank sales.  
**See:** R5  

---

## D6 — Data model early
**Status:** accepted (2026-10-15); stubs shipped; Phase 2 ingest fills fixture  
**Decision:** Model programs, copybooks, dependencies from Phase 1 even if UI is simple.  
**Why:** Avoid playground-only architecture that cannot grow to bank estates.  
**Where:** `packages/estate-model` + `packages/estate-ingest` (git-folder parsers, ghosts, impact); Studio Estate tab.  
**See:** R8, R15, [ESTATE-INGEST.md](./ESTATE-INGEST.md), [PHASE2.md](./PHASE2.md)  

---

## D7 — Working repo name
**Status:** proposed (2026-10-15)  
**Decision:** Provisional working name `cobol-runtime-kit` until product name is locked.  
**Why:** Matches Phase 1 slice; rename later with user approval.  

---

## D8 — Git & deploy governance
**Status:** accepted (2026-10-15)  
**Decision:** No deploy without explicit ask/yes; no git push without explicit ask/yes; git author never Cursor/AI; human identity only.  
**Why:** Owner control + clean history for bank-facing work.  
**See:** [SAFETY.md](./SAFETY.md), R9  

---

## D9 — Senior engineering standard
**Status:** accepted (2026-10-15)  
**Decision:** Follow senior-dev workflow: small diffs, local proof, reversible change, clear failures.  
**Why:** Bank-grade trust requires discipline, not demo-only hacks.  
**See:** `.cursor/rules/senior-dev-workflow.mdc`  

---

## D10 — In-repo COBOL reference library
**Status:** accepted (2026-10-15)  
**Decision:** Keep a complete `docs/cobol/` reference (language, GnuCOBOL, IBM, MF, JCL, CICS, Db2, VSAM, DevOps) with citations; do not vendor copyrighted manuals into git.  
**Why:** Nothing critical should live only in chat memory; Studio/Runtime must build on shared truth.  
**See:** [cobol/README.md](./cobol/README.md), R10  

---

## D11 — Problems tracked as an ID catalog
**Status:** accepted (2026-10-15)  
**Decision:** Maintain [PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md) with severity + module mapping; [PROBLEM.md](./PROBLEM.md) stays the short summary.  
**Why:** Product scope stays honest; nothing important lives only as a pitch line.  
**See:** R11  

---

## D12 — Estate ingest includes ghost discovery
**Status:** accepted (2026-10-15)  
**Decision:** Platform must lift scoped estate artifacts and classify ghosts via source∪load∪JCL∪CALL sets; connectors read-only + approved.  
**Why:** Understanding fails if only documented programs are visible.  
**See:** [ESTATE-INGEST.md](./ESTATE-INGEST.md), R12  

---

## How to add a decision
1. New `D#` with status + date  
2. Decision / Why / links to revelations  
3. If replacing an old decision, mark old one `superseded` and link to the new id  
