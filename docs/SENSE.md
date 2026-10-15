# Sense — observe, contain, suggest safe fix

**Audience:** bank ops, on-call COBOL, IT-services SRE — not Studio Easy Mode learners.  
**Phase:** design + estate foundation now (Phase 2 graphs); dashboards / live connectors ship in **Phase 3**.  
**Pays for:** shorter time-to-detect and time-to-safe-fix. Pairs with [CONTROL-PLANE.md](./CONTROL-PLANE.md).

Learner / fame surface stays Studio + Runtime Kit. **Bank revolution surface includes Sense** ([REVELATIONS.md](./REVELATIONS.md) R2, R6, R7).

---

## North star

```
Signal → Correlate → Blast radius → Safe options → Prove → Audit
```

Today’s trap: **fix path = call the one expert** (OPS-06). Sense replaces tribal pager heroics with a shared incident card + estate graph.

---

## What Sense watches

| Signal class | Examples | Why it matters |
|--------------|----------|----------------|
| Loud fail | Job abend, non-zero RC / RETURN-CODE | Window stop, cascade |
| Status codes | FILE STATUS, SQLCODE / SQLSTATE, CICS RESP/RESP2 | Silent wrong money risk if ignored |
| Slow | Job duration vs baseline, batch window risk | BAT-01 — business miss without “abend” |
| Contract | Copybook / COMMAREA / bind package drift | Compile-OK, runtime-wrong |
| Cascade | Dataset wrong → online sees partial data | BAT-05 batch↔online coupling |

Deep language notes: [cobol/12-ERROR-HANDLING.md](./cobol/12-ERROR-HANDLING.md), [cobol/17-CICS.md](./cobol/17-CICS.md), [cobol/18-DB2-SQL.md](./cobol/18-DB2-SQL.md).

---

## Incident card (minimum fields)

Every production-like alert should produce one card:

| Field | Purpose |
|-------|---------|
| Job / transaction id | What failed or slowed |
| Program + load member | Where logic lives |
| RC / FILE STATUS / SQLCODE / RESP | Loud evidence |
| Duration vs baseline | Slow path |
| Artifact version | What is running (Control Plane) |
| Blast edges | Programs, copybooks, datasets, downstream jobs |
| Suggested actions | Rerun from step, rollback version, degrade non-critical |
| Do-not-touch | High-risk shared copybooks / dual-write paths |
| Owner / approver | Human gate — never auto-prod |

---

## Blast radius

Sense does **not** invent topology. It consumes the estate model from [ESTATE-INGEST.md](./ESTATE-INGEST.md):

```
program → copybooks → CALL edges (flag dynamic as uncertain)
       → datasets / DD patterns
       → jobs / JCL steps
       → online txs (later CICS connectors)
```

Rules:

- Prefer **known edges** over guesswork  
- Dynamic CALL / incomplete ingest → mark **uncertain** (never silent omit)  
- Ghost / orphan load members stay visible — wiki-only inventory is a lie  

Maps: OPS-02 (blast unknown), UND-03/05/06/08, CHG-01/02.

---

## Suggested safe actions (ordered)

1. **Contain** — stop bad promote; freeze dual-write if active  
2. **Rollback** — previous artifact pointer via Control Plane (ENV-05)  
3. **Restart with knowledge** — checkpoint / step restart when documented (BAT-06)  
4. **Degrade** — non-critical path off; core ledger path alive (OPS-03, fail soft)  
5. **Fix forward** — only after local/CI proof + impact score + approval  

Never: edit prod copybook in place; AI patch without tests; “works on my listing” options drift.

---

## SLOs (beyond abend-or-not)

| SLO idea | Metric |
|----------|--------|
| Batch window | p95 duration vs window end (OPS-05, BAT-01) |
| Error rate | FILE STATUS / SQLCODE spikes per job family |
| MTTR | Card open → safe action recorded |
| Blast clarity | % incidents with complete known edges |

Sense baselines start empty; populate from staging/prod-like runs — never require live bank credentials in samples ([SAFETY.md](./SAFETY.md)).

---

## Fail soft (platform implication)

Banks need failure that is **loud and soft**, not silent and total ([ARCHITECTURE.md](./ARCHITECTURE.md)):

- Timeouts, safe retries, backpressure  
- Circuit / bulkhead around adapters  
- Graceful degradation signals into the incident card  
- Rollback + blast map always one click from the alert  

---

## Problem IDs Sense owns

| ID | Pain |
|----|------|
| OPS-01 | Slowdown detected late |
| OPS-02 | Blast radius unknown in incident |
| OPS-03 | No graceful degradation story |
| OPS-04 | Logs fragmented (unify later) |
| OPS-05 | No batch SLO mindset |
| OPS-06 | Fix = call the one expert |
| BAT-01 / BAT-05 / BAT-06 | Window, online coupling, restart knowledge |
| ENV-05 | Rollback unclear |
| INT-05 | Cascade under load |

Full catalog: [PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md).

---

## Ship order

| Now | Later (Phase 3) |
|-----|-----------------|
| Estate graph + impact JSON as Sense input | Live job duration / error ingest |
| Fixture incident cards on sample estate | JES / CICS / Db2 log unify |
| Docs + playbook ([PRODUCTION-OPS.md](./PRODUCTION-OPS.md)) | Ops UI dashboards |
| CI risk gates hand off “promote only if…” | Auto-suggest with human ack |

**Non-goal:** auto-deploy or auto-remediate production without human approval (ANT-04).

---

## Related docs

- Ops playbook: [PRODUCTION-OPS.md](./PRODUCTION-OPS.md)  
- Promote / approve / rollback: [CONTROL-PLANE.md](./CONTROL-PLANE.md)  
- CI / local loop: [cobol/21-TESTING-AND-DEVOPS.md](./cobol/21-TESTING-AND-DEVOPS.md)  
- Modules overview: [MODULES.md](./MODULES.md)  
