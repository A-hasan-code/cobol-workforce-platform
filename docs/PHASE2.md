# Phase 2 — Bank wedge

**Started:** 2026-10-15  
**Goal:** legacy intelligence — understand and prove change.

## Slice 1 — ingest / ghosts / impact (shipped)

| Piece | Where |
|-------|--------|
| Expanded sample estate (JCL, loads, planted ghosts) | `samples/bank-playground/` |
| Ingest parsers (PROGRAM-ID, COPY, CALL, JCL EXEC/DD) | `packages/estate-ingest` |
| Ghost set-math | `packages/estate-ingest/src/ghosts.js` |
| Impact + change report | `packages/estate-ingest/src/impact.js` |
| Studio **Estate** panel | `apps/studio` side tab |
| Gate | `npm run phase2:check` |

## Slice 2 — rules / refactor / risk / zip (shipped)

| Piece | Where |
|-------|--------|
| Business-rule extraction (IF / COMPUTE / EVALUATE / `*> RULE:`) | `packages/estate-ingest/src/rules.js` |
| Safe refactor suggestions + generated test stubs | `packages/estate-ingest/src/refactor.js` |
| CI risk gate (high impact needs ack) | `packages/estate-ingest/src/riskGate.js` + `npm run risk:gate` |
| Customer zip / export ingest | `packages/estate-ingest/src/zipIngest.js` |
| Ack file (sample) | `samples/bank-playground/inventory/risk-ack.json` |
| Studio Estate: rules + refactors | `apps/studio` Estate tab |

## Commands

```bash
npm run estate:ingest      # scan sample → write fixture
npm run estate:ghosts      # print ghost board
npm run estate:rules       # print extracted business rules
npm run estate:refactor    # print safe refactor suggestions
npm run estate:refactor -- --write-tests=samples/bank-playground/tests/suggested
npm run risk:gate          # fail CI if high impact without ack
npm run estate:test        # selftest (incl. zip ingest)
npm run phase2:check       # full Phase 2 gate
npm run studio             # Estate tab → rules / refactors / impact
```

Zip ingest CLI:
```bash
npm run zip -w @cobol/estate-ingest -- --zip=path/to/export.zip --out=customer.estate.json
```

Impact CLI:
```bash
npm run impact -w @cobol/estate-ingest -- --field=ACCT-BAL-TEXT
npm run impact -w @cobol/estate-ingest -- --target=OLDUTIL
```

## Planted ghosts (bank-playground)

| Name | Kind |
|------|------|
| DEADPROG | orphan-source (source, no JCL/CALL/load) |
| OLDUTIL | orphan-load + ghost-load + undocumented-run |
| DYNUTIL | dynamic-uncertain (CALL by variable) |
| ACCTPRINT | documented COPY ACCTREC — impact seed for `ACCT-BAL-TEXT` |

## Risk ack

Watched fields (default `ACCT-BAL-TEXT`) with **medium or high** impact fail `npm run risk:gate` unless:

1. `samples/bank-playground/inventory/risk-ack.json` lists the field, or  
2. CLI `--ack-high-risk` / env `RISK_ACK_HIGH=1` (emergency bypass — logged)

## Success

Team can open Studio → Estate, see ghosts, rules, refactor hints, and get an auditor-style impact report — and CI blocks unacked high-risk field changes.
