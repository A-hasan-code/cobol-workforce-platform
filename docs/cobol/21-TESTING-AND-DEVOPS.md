# Testing and DevOps for COBOL estates

This is the technical answer to “deploy system weak hai.”

## Target loop
```
local → ci → staging → prod
```

Same expectation as Java/TS teams; COBOL is the dialect underneath.

## Test types

| Type | Phase 1 | Later |
|------|---------|-------|
| Compile smoke | Yes (`cobc`) | IBM/MF compile |
| Golden stdout | Yes | Yes |
| File in/out fixtures | Yes (line seq) | VSAM stubs |
| Copybook contract tests | Stub | Yes |
| CALL interface tests | Stub | Yes |
| SQL/CICS integration | No | Stubs → real connectors |
| Performance / batch window | No | Sense baselines |

## Local (Runtime Kit)
- `cobol.toml` defines programs, copy paths, dialect  
- `compile` / `run` / `test` scripts  
- Fake datasets under `testdata/`  
- Non-zero exit on failure  

## Two pipelines (do not blur)

| Pipeline | Trigger | Owns |
|----------|---------|------|
| **A — Build / prove** | Every PR | Compile, tests, secret scan, risk/impact gate, immutable artifacts |
| **B — Promote** | Human release | Same artifact → staging → prod, approvals, rollback pointer, Sense watch |

Policy detail: [../CONTROL-PLANE.md](../CONTROL-PLANE.md).  
On-call after promote: [../PRODUCTION-OPS.md](../PRODUCTION-OPS.md).

## CI (Pipeline A)
- On PR: compile + tests + secret scan  
- Optional: dialect matrix (gnu first)  
- Store artifacts (listing, executable, reports)  
- Gate merge on red tests / high risk score  

## Staging / prod (Pipeline B — Control Plane)
- Approval records  
- Promote artifact versions (not “edit in place”)  
- Rollback pointer  
- Audit who approved  

Deep doc: [../CONTROL-PLANE.md](../CONTROL-PLANE.md).

## Observability (Sense)
- Job duration, fail rate, FILE STATUS / SQLCODE  
- Slowdown vs baseline  
- Blast radius graph (program → jobs → downstream files)  
- Incident card + suggested safe fix / rollback  

Deep doc: [../SENSE.md](../SENSE.md). Real incident playbook: [../PRODUCTION-OPS.md](../PRODUCTION-OPS.md).

## Networking / integration testing
Modern services need contracts:

- REST/queue adapters with schema  
- Record layout schemas derived from copybooks  
- Local stubs so developers don’t need full mainframe  

## Definition of done for a COBOL change
1. Explained impact  
2. Tests green locally  
3. CI green (Pipeline A)  
4. Staging verification  
5. Approval recorded (Pipeline B)  
6. Sense quiet (or known deltas accepted)  
