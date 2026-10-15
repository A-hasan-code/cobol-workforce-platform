# Problems catalog — COBOL / banking / workforce

Complete inventory of related pains our platform must see.  
Summary pitch stays in [PROBLEM.md](./PROBLEM.md). This file is the deep list.

**Sources (2025–2026 industry signal):** Kyndryl mainframe modernization surveys (banking focus), Thoughtworks / Accenture / Deloitte modernization notes, mainframe dependency analysis literature (copybooks, JCL, batch windows). Internal product revelations: [REVELATIONS.md](./REVELATIONS.md).

Severity: `P0` = blocks bank trust / revenue · `P1` = slows delivery hard · `P2` = painful but workable · `P3` = niche / later.

Product columns: Studio · Runtime · Pipeline · Control · Sense

---

## 1) People & skills

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| PPL-01 | COBOL / mainframe experts retiring | P0 | Knowledge walks out; no owner for critical jobs | Studio explain, docs gen |
| PPL-02 | New graduates lack mainframe skills | P0 | Hiring funnel empty | Studio learn + Runtime local |
| PPL-03 | Staff resist learning “old” stack | P1 | Training ROI fails | Modern UX / familiar loop |
| PPL-04 | Skills gap broader than COBOL (security, cloud, integration, AI) | P1 | Modernization needs hybrid talent | Control + adapters + Studio |
| PPL-05 | Global developers cannot join bank work | P0 | Capacity stuck in rare geographies | Browser/local sandbox path |
| PPL-06 | Expensive contractors / body shop dependency | P1 | Cost ↑, knowledge still tribal | Tooling reduces rare-skill hours |
| PPL-07 | Knowledge transfer is oral / undocumented | P0 | Bus factor = 1–2 people | Business-rule extraction |
| PPL-08 | IT services struggle to staff delivery | P1 | Partners cannot scale | Same workforce layer |

---

## 2) Understanding & documentation

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| UND-01 | Poor / missing documentation | P0 | Nobody knows what code does | Studio explainer |
| UND-02 | Business rules buried in code/copybooks | P0 | Change without meaning | Rule extraction |
| UND-03 | Incomplete program inventory | P0 | Ghost programs in loadlibs | Estate ingest |
| UND-04 | Copybook coupling invisible | P0 | One PIC change breaks many | Impact graph |
| UND-05 | Dynamic CALL hides edges | P1 | Static analysis incomplete | Flag uncertain edges |
| UND-06 | JCL / scheduler logic not in COBOL | P0 | “Program OK” but job wrong | Job graph |
| UND-07 | Assembler / Easytrieve / BMS / procs beside COBOL | P1 | Partial reverse-engineering lies | Multi-artifact ingest (later) |
| UND-08 | Data lineage unknown (who writes/reads dataset) | P0 | Silent corruption risk | Lineage map |
| UND-09 | REDEFINES / overlays confuse meaning | P1 | Wrong modern-type mapping | PIC/REDEFINES decoder |
| UND-10 | EBCDIC vs ASCII mental mismatch | P1 | Local tests lie | Encoding adapters |
| UND-11 | GenAI docs without proof / completeness | P1 | Confident wrong summaries | Proof + cite + tests |

---

## 3) Change risk & technical debt

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| CHG-01 | Fear: one change breaks production | P0 | Freeze / ticket hell | Impact + risk score |
| CHG-02 | Shared copybook binary mismatch | P0 | Recompile-one → estate skew | Dependents report |
| CHG-03 | LINKAGE / COMMAREA contract drift | P0 | Online/batch crashes | Contract tests |
| CHG-04 | COMP-3 / PIC length / truncation option bugs | P1 | Money wrong silently | Dialect-aware checks |
| CHG-05 | Spaghetti GO TO / ALTER legacy | P2 | Hard to refactor safely | CFG explain |
| CHG-06 | Dead code vs critical path unclear | P1 | Wrong modernization priority | Usage / job heat |
| CHG-07 | Big-bang rewrite cost/risk extreme | P0 | Multi-year / $100M+ failure stories | Incremental path pitch |
| CHG-08 | Parallel-run / dual-write complexity | P1 | Migration instability | Control + Sense |
| CHG-09 | No golden tests for batch outputs | P0 | Regressions undetected | Runtime fixtures |
| CHG-10 | “Works on my listing” ≠ prod options | P1 | Compiler option drift | Pin options in Pipeline |

---

## 4) Environment, deploy & DevOps gap

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| ENV-01 | No local-first test loop | P0 | Devs blocked on mainframe access | Runtime Kit |
| ENV-02 | Weak CI for COBOL estates | P0 | Breakages found late | Pipeline |
| ENV-03 | No staging fidelity | P1 | Prod is the first real test | Control Plane envs |
| ENV-04 | Manual promote / tribal deploy | P0 | Audit + error prone | Control Plane |
| ENV-05 | Rollback unclear | P0 | Incidents last longer | Control + Sense |
| ENV-06 | Secrets in JCL / scripts | P0 | Compliance & breach | Secret scan gates |
| ENV-07 | Tooling UX alien to modern devs | P1 | Adoption fails | Studio UX |
| ENV-08 | Laptop ≠ mainframe (CICS/Db2/VSAM absent) | P1 | False confidence | Stubs + later connectors |
| ENV-09 | Multi-dialect (IBM / MF / gnu) mismatch | P1 | Portability myths | Dialect pin + adapters |
| ENV-10 | No `package.json`-like project manifest | P2 | Onboarding friction | `cobol.toml` |

---

## 5) Batch, JCL & windows

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| BAT-01 | Batch window already tight | P0 | Any slowdown = business miss | Sense baselines |
| BAT-02 | Job dependency chains opaque | P0 | Wrong restart order | Job graph |
| BAT-03 | COND / RC handling tribal | P1 | Bad reruns | Pipeline + docs |
| BAT-04 | GDG / dataset disposition mistakes | P1 | Data loss / overwrite | Dataset contracts |
| BAT-05 | Batch ↔ online timing coupling | P0 | Partial data visible to CICS | Sense + schedule awareness |
| BAT-06 | Restart / checkpoint knowledge rare | P1 | Long recovery | Runbooks from Sense |
| BAT-07 | Scheduler (Control-M etc.) outside code | P1 | Incomplete estate model | Ingest later |
| BAT-08 | Month-end / holiday calendar jobs | P2 | Edge failures | Calendar fixtures |

---

## 6) Online (CICS) & data (Db2 / VSAM)

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| ONL-01 | CICS restrictions surprise COBOL devs | P1 | Invalid verbs in prod path | Studio linter rules |
| ONL-02 | RESP/SQLCODE not checked | P0 | Silent wrong answers | Generators + gates |
| ONL-03 | Db2 bind/package drift | P0 | Runtime SQL fail after “compile OK” | Pipeline bind awareness |
| ONL-04 | Host variable / NULL indicator bugs | P1 | Wrong balances | Contract checks |
| ONL-05 | VSAM key / alternate index complexity | P1 | Access path bugs | File intelligence |
| ONL-06 | Queue / TD / TS misuse | P2 | Lost messages | Later adapters |
| ONL-07 | BMS maps / screen coupling | P2 | UI+logic tangle | Later ingest |

---

## 7) Observability, resilience & ops

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| OPS-01 | Slowdown detected late | P0 | Window breach | Sense |
| OPS-02 | Blast radius unknown during incident | P0 | Panic changes | Impact map live |
| OPS-03 | No graceful degradation story | P1 | Total outage culture | Fail-soft design |
| OPS-04 | Logs fragmented (JES, CICS, Db2) | P1 | MTTR ↑ | Sense unify (later) |
| OPS-05 | No SLO mindset on batch jobs | P1 | Only “abend or not” | Duration/error SLOs |
| OPS-06 | Fix path = call the one expert | P0 | Night pager hell | Suggested safe fix / rollback |

---

## 8) Integration & “network” reality

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| INT-01 | Files are the API (no schema registry) | P0 | Break contracts silently | Copybook-as-schema |
| INT-02 | Modern APIs bolted with fragile bridges | P1 | Dual worlds | Adapters |
| INT-03 | MQ / events / REST around COBOL unclear | P1 | Partial visibility | Integration map |
| INT-04 | No local stubs for partner systems | P1 | Can’t test offline | Runtime stubs |
| INT-05 | Backpressure / load shedding missing | P1 | Cascade failures | Sense + Control |

---

## 9) Security, compliance & audit

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| SEC-01 | Regulators drive / block change (banks ~99% say compliance influences mod decisions — Kyndryl banking focus) | P0 | Must prove change | Change reports |
| SEC-02 | Security is #1 modernization decision factor | P0 | Tools must be audit-ready | Control Plane audit |
| SEC-03 | Prod data in “test” copies | P0 | Leak risk | Fake datasets only |
| SEC-04 | Privilege / dataset access sprawl | P1 | Insider + accident risk | Env isolation |
| SEC-05 | AI tools without governance | P1 | Hallucinated unsafe patches | Human gates + proof |
| SEC-06 | Incomplete audit trail of who changed what | P0 | Failed audits | Control Plane |

---

## 10) Money, strategy & org

| ID | Problem | Sev | Why it hurts | Product |
|----|---------|-----|--------------|---------|
| BUS-01 | Mainframe still critical but talent strategy lagging | P0 | Strategic risk | Workforce layer pitch |
| BUS-02 | Modernization projects overrun / fail | P0 | Leadership distrust | Incremental + proof |
| BUS-03 | Cost of delay (features months late) | P1 | Compete with fintechs | Faster safe change |
| BUS-04 | Vendor lock-in fear (IBM/MF) | P2 | Political friction | Gnu path + adapters |
| BUS-05 | “Replace COBOL” fantasy vs coexist reality | P0 | Wrong RFP / wasted years | Bridge positioning |
| BUS-06 | Students have no credible path into bank COBOL | P1 | Funnel dry | Playground fame path |

---

## 11) Product-anti-problems (traps we must not create)

| ID | Trap | Sev | Avoid by |
|----|------|-----|----------|
| ANT-01 | AI chat without runnable COBOL | P0 | Runtime Kit always |
| ANT-02 | Promise any-language → perfect COBOL Day 1 | P0 | Phase 3 controlled subset |
| ANT-03 | Playground that cannot grow to estate graph | P0 | Bank-scale data model early |
| ANT-04 | Auto-deploy to prod | P0 | Ask + approvals ([SAFETY](./SAFETY.md)) |
| ANT-05 | Ignoring JCL/copybooks (COBOL-only view) | P0 | Multi-artifact model |
| ANT-06 | Silent “helpful” PIC/layout changes | P0 | Risk gates |

---

## Priority map (what we attack first)

```
P0 people + understand + local env + impact + audit
        ↓
P0/P1 batch window + Sense + deploy gates
        ↓
P1 CICS/Db2 stubs + integration contracts
        ↓
P2/P3 exotic dialects, BMS, full scheduler ingest
```

Locked build order still: Runtime Kit → intelligence/impact → Control/Sense → code→COBOL  
See [ROADMAP.md](./ROADMAP.md).

---

## Counts

| Category | IDs |
|----------|-----|
| People & skills | 8 |
| Understanding | 11 |
| Change risk | 10 |
| Env / DevOps | 10 |
| Batch / JCL | 8 |
| Online / data | 7 |
| Ops / resilience | 6 |
| Integration | 5 |
| Security / compliance | 6 |
| Business / strategy | 6 |
| Anti-problems (traps) | 6 |
| **Total tracked** | **83** |

When a new pain appears in customer calls, add an ID here and link a revelation.
