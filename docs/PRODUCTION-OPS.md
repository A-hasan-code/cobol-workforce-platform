# Production ops — real estate errors (not learner Docs)

**Audience:** bank / IT-services on-call, change leads, COBOL production support.  
**Not for:** Studio Easy Mode / Playground first-run learners — that path stays in Studio → Docs and [EASY-MODE.md](./EASY-MODE.md).

This is the **bank revolution** playbook: how we expect humans (and later Sense) to handle real production pain without ripping out COBOL.

| Surface | Doc |
|---------|-----|
| Observe / blast / suggest | [SENSE.md](./SENSE.md) |
| Promote / approve / rollback | [CONTROL-PLANE.md](./CONTROL-PLANE.md) |
| Local → CI proof | [cobol/21-TESTING-AND-DEVOPS.md](./cobol/21-TESTING-AND-DEVOPS.md) |
| Error verbs / codes | [cobol/12-ERROR-HANDLING.md](./cobol/12-ERROR-HANDLING.md) |
| Pain IDs | [PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md) OPS / ENV / BAT / ONL |

---

## North star

```
Signal → Blast radius → Safe action → Prove → Approve → Watch / rollback
```

Replace: **“call the one expert at 2am”** (OPS-06).

---

## Learner vs production (same platform, different face)

| | Learner / fame | Production / revenue |
|--|----------------|----------------------|
| Modules | Studio, Runtime Kit | Pipeline, Control Plane, Sense |
| Data | Fake samples | Estate graph + staged artifacts (no silent prod data theft) |
| Success | Run / Test green locally | Incident closed with audit + Sense quiet |
| AI | Explain + EasyLang with cobc proof | Suggest only; human gate; no auto-prod |

See [REVELATIONS.md](./REVELATIONS.md) R2, R7 and [VISION.md](./VISION.md).

---

## Error classes (first triage)

| Class | Look for | First move |
|-------|----------|------------|
| **Loud fail** | Abend, non-zero RC, JCL COND | Incident card; stop cascading promotes |
| **Silent wrong** | Unchecked SQLCODE / FILE STATUS / RESP | Contain; compare golden / balances; do not “rerun until green” blindly |
| **Slow** | Duration ≫ baseline, window risk | Sense baseline; kill non-critical load; do not random-tune mid-window |
| **Contract** | Copybook PIC change, COMMAREA, bind drift | Dependents report before hotfix; recompile set |
| **Cascade** | Bad dataset → CICS sees partial day | Batch↔online timing; blast map before restart order |

Bank stack pointers: [cobol/16-JCL-BATCH.md](./cobol/16-JCL-BATCH.md) · [cobol/17-CICS.md](./cobol/17-CICS.md) · [cobol/18-DB2-SQL.md](./cobol/18-DB2-SQL.md) · [cobol/19-VSAM-AND-DATASETS.md](./cobol/19-VSAM-AND-DATASETS.md).

---

## First 15 minutes

1. **Capture evidence** — job/tx name, program, RC, FILE STATUS, SQLCODE, RESP, start/end time.  
2. **Open incident card** — fields in [SENSE.md](./SENSE.md).  
3. **Blast map** — program → copybooks → datasets → downstream jobs (flag uncertain CALL edges).  
4. **Choose containment** — rollback pointer, freeze promote, degrade non-critical — **not** random source edit in prod.  
5. **Only then** plan fix-forward with tests.

If evidence is missing, **fix the observability gap** (OPS-04) before guessing code.

---

## Safe actions vs high-risk actions

### Usually safer (with recorded approval)

- Rollback to previous **artifact** ([CONTROL-PLANE.md](./CONTROL-PLANE.md))  
- Restart from known **checkpoint / step** when runbook exists (BAT-06)  
- Rebind / correct package when bind drift proven (ONL-03)  
- Turn off non-critical adapter / batch feeder (fail soft)  
- Re-run **identical** artifact after data fix (not a new untested binary)

### High risk (need impact + tests + dual eyes)

- Shared copybook PIC / COMP / length change (CHG-02)  
- LINKAGE / COMMAREA contract change (CHG-03)  
- REDEFINES overlays (CHG- / UND-09)  
- Prod dataset disposition / GDG mistakes (BAT-04)  
- Parallel-run / dual-write toggles (CHG-08)  
- AI-generated patch applied without golden tests (ANT-01, SEC-05)

Modernization patterns: [cobol/20-MODERNIZATION.md](./cobol/20-MODERNIZATION.md).

---

## Two pipelines (ops view)

| Pipeline | When | Gate |
|----------|------|------|
| **A — Build / prove** | Every PR | Compile + tests + secrets + risk ack |
| **B — Promote** | Staging → prod | Same artifact + human approval + Sense watch |

Ops on-call lives mostly on **B** and Sense; developers live on **A**. Mixing them causes “CI green but prod tribal edit.” Full policy: [CONTROL-PLANE.md](./CONTROL-PLANE.md).

---

## Db2 / CICS / files — production gotchas

| Symptom | Likely cause | Doc |
|---------|--------------|-----|
| Compile OK, SQL fails at run | Missing / drifted bind | [18-DB2-SQL](./cobol/18-DB2-SQL.md) |
| Wrong / null balance | Host var / NULL indicator | same |
| Online crash after batch | Timing / partial dataset | BAT-05, Sense |
| File “OK” but bad data | FILE STATUS ignored | [12-ERROR-HANDLING](./cobol/12-ERROR-HANDLING.md) |
| CICS unexpected | Invalid verbs / RESP ignored | [17-CICS](./cobol/17-CICS.md) |

---

## AI in production incidents

| Allowed | Forbidden |
|---------|-----------|
| Explain dump / JCL / SQLCODE in plain language | Apply untested patch to prod |
| Draft runbook / blast hypotheses from estate graph | Auto-approve promote |
| Suggest tests for a suspected fix | Commit as Cursor / AI git author |
| EasyLang / Studio experiments on **fake** data | Pull real customer datasets into chat |

Proof rule: **runnable tests + human approval** or it did not happen ([PROBLEM.md](./PROBLEM.md) traps).

---

## Definition of done — production fix

1. Incident card closed with root signal recorded  
2. Blast radius reviewed (known + uncertain edges)  
3. Action was rollback **or** fix-forward with local + CI green  
4. Control Plane approval / audit row exists  
5. Sense quiet or known delta accepted  
6. Follow-up ticket if observability or contract test was missing  

---

## Microservices / adapters (ops stance)

Do **not** treat “split the ledger into microservices” as the incident fix.

Safe pattern: **wrap / strangle** with adapters; keep COBOL core; watch contracts (copybook-as-schema). Integration pains: INT-01…05 in the catalog. Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## What is shipped vs designed

| Shipped (Phase 1–2) | Designed here (Phase 3) |
|---------------------|-------------------------|
| Local Runtime + CI prove loop | Live Sense dashboards |
| Estate ingest + ghosts + impact | Control Plane promote UI |
| Error-handling language docs | Unified JES/CICS/Db2 ingest |
| This playbook | Ops console UX |

Phase gates: [ROADMAP.md](./ROADMAP.md). Do not claim live bank connectors until Phase 3 approval.

---

## Related entry points

- Problem summary: [PROBLEM.md](./PROBLEM.md) (pain #2 env, #3 visibility)  
- Modules: [MODULES.md](./MODULES.md)  
- Safety / deploy ask: [SAFETY.md](./SAFETY.md)  
