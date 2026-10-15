# Control Plane — envs, promote, approvals, audit

**Audience:** bank change managers, release owners, IT-services delivery leads.  
**Phase:** env model + policy design now; full promote UI / connectors in **Phase 3**.  
**Pays for:** audited change without tribal “edit prod and pray.” Pairs with [SENSE.md](./SENSE.md).

Public face remains Studio + Runtime. **Revenue / revolution path includes Control Plane** ([REVELATIONS.md](./REVELATIONS.md) R2, R6).

---

## North star

```
local → ci → staging → prod
```

Same mental model as modern stacks. COBOL is the dialect under the loop ([ARCHITECTURE.md](./ARCHITECTURE.md)).

**Promote artifact versions — never edit production source or copybooks in place.**

---

## Environments

| Env | Purpose | Risk to bank |
|-----|---------|--------------|
| `local` | Write, unit-style tests, fake datasets | None |
| `ci` | Compile, test, secret scan, risk gates | Ephemeral |
| `staging` | Integration with bank-like adapters | Controlled |
| `prod` | Controlled release + approvals + audit | Highest — gated |

Sandbox / samples: **no prod bank credentials**, no real customer data ([SAFETY.md](./SAFETY.md), SEC-03).

---

## Two pipelines

Banks need **two** distinct pipelines — not one blurry “deploy job.”

### Pipeline A — Build / prove (every PR)

1. Compile (dialect pinned)  
2. Tests (golden out, file fixtures, later contracts)  
3. Secret scan  
4. Impact / risk score (Phase 2 gates)  
5. Store **immutable artifacts** (listing, binary/package refs, change report)  
6. Gate merge on red tests or unacked high risk  

Owned primarily by **Pipeline** module; Control Plane records the artifact identity.

### Pipeline B — Promote (staging → prod)

1. Select **same** artifact that passed A  
2. Staging verification recorded  
3. **Human approval** (who / why / when)  
4. Promote pointer (prod runs version N)  
5. Sense watch window (quiet or known deltas accepted)  
6. Rollback pointer stays one step behind  

Maps: ENV-04 (manual tribal deploy), ENV-05 (rollback unclear), SEC-06 (audit trail).

Detail for CI mechanics: [cobol/21-TESTING-AND-DEVOPS.md](./cobol/21-TESTING-AND-DEVOPS.md).  
Incident side after promote: [PRODUCTION-OPS.md](./PRODUCTION-OPS.md), [SENSE.md](./SENSE.md).

---

## Approval model

| Rule | Why |
|------|-----|
| No auto-prod | ANT-04; regulators and bank trust |
| Named human approver | Audit; SEC-01 / SEC-02 |
| Change report attached | Impact + tests + risk score |
| Dual-control optional | High-risk copybook / money path changes |
| Cursor / AI never “approves” | [SAFETY.md](./SAFETY.md); SEC-05 |

Before any real deploy / hosting / production-like push: **stop and ask the owner** — encoded in `.cursor/rules/git-deploy-safety.mdc`.

---

## Rollback

Every successful promote records:

- **Current** artifact pointer  
- **Previous** artifact pointer (rollback target)  
- Time window Sense should watch  

Rollback is a Control Plane action that Sense can **suggest**; it is not silent auto-revert unless the bank policy explicitly allows it (default: human ack).

---

## Bind / dialect / options pin

Compile-OK ≠ run-OK on bank stacks:

- Db2 **bind** / package must travel with the COBOL artifact story ([cobol/18-DB2-SQL.md](./cobol/18-DB2-SQL.md)) — ONL-03  
- Compiler options pinned in Pipeline (CHG-10)  
- Dialect: GnuCOBOL first → IBM / Micro Focus adapters later  

Control Plane stores **what was approved to run**, not only git SHA of prose.

---

## Audit trail (minimum)

| Event | Record |
|-------|--------|
| Ingest / estate refresh | Who, scope, when ([ESTATE-INGEST.md](./ESTATE-INGEST.md)) |
| Merge gate ack | Risk id, acknowledger |
| Promote request | Artifact id, from→to env |
| Approval | Approver identity (human git identity, not AI) |
| Rollback | From version → to version, reason |

Incomplete audit = failed bank sale (SEC-06).

---

## Problem IDs Control Plane owns

| ID | Pain |
|----|------|
| ENV-03 | No staging fidelity |
| ENV-04 | Manual / tribal promote |
| ENV-05 | Rollback unclear |
| ENV-06 | Secrets in JCL / scripts (gate + scan) |
| CHG-08 | Parallel-run / dual-write complexity |
| SEC-01 / SEC-02 / SEC-06 | Compliance, security, audit trail |
| ANT-04 | Auto-deploy trap |

---

## Ship order

| Now | Later (Phase 3) |
|-----|-----------------|
| Document two-pipeline policy | Env UI + approval workflow |
| CI artifact storage (Phase 1/2) | Staging connectors (IBM/MF) |
| Safety rules + human ask-before-deploy | Prod promote with dual-control |
| Risk ack in Pipeline | Full audit export for regulators |

**Non-goals:** replace IBM/z/OS; silent credential use; AI-authored git identity.

---

## Related docs

- Observe / blast / suggest: [SENSE.md](./SENSE.md)  
- On-call playbook: [PRODUCTION-OPS.md](./PRODUCTION-OPS.md)  
- DevOps loop: [cobol/21-TESTING-AND-DEVOPS.md](./cobol/21-TESTING-AND-DEVOPS.md)  
- Modules: [MODULES.md](./MODULES.md)  
