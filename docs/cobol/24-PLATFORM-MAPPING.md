# Platform mapping — docs → product

How this COBOL reference feeds the workforce platform.

## Module coverage

| Module | Uses these docs |
|--------|-----------------|
| **Studio** | 02–12, 22–23 (explain, modern view, generate subset) |
| **Runtime Kit** | 13, 08, 21, 23 (GnuCOBOL compile/run/test) |
| **Pipeline** | 14–16, 21 (CI, JCL awareness, gates) |
| **Control Plane** | 16, 19, 21 (envs, promote, datasets) |
| **Sense** | 12, 17–19, 21 (status codes, blast radius) |

## Phase gates vs documentation depth

| Phase | Must be accurate in product | Doc depth required |
|-------|----------------------------|--------------------|
| 1 | GnuCOBOL + core language + files + COPY | 01–13, 21–24 |
| 2 | Impact across programs/copybooks/CALL | +09, 10, 20 |
| 3 | IBM/CICS/Db2/MF connectors | +14–19 |

## Problem stack → doc answer

| Banking pain | Doc | Product answer |
|--------------|-----|----------------|
| Developers scarce | 01–07, 23 | Studio learning + explain |
| Any-language → COBOL (feature) | 06–07, 10, 20 | EasyLang ladder (v0–v5 stubs; connectors Phase 3) |
| Weak deploy/env | 13, 21 + [../CONTROL-PLANE.md](../CONTROL-PLANE.md) | Runtime Kit + Pipeline + promote policy |
| System break / slow | 12, 21, 19 + [../SENSE.md](../SENSE.md) | Sense + fail-soft |
| Prod on-call / expert pager | [../PRODUCTION-OPS.md](../PRODUCTION-OPS.md) | Incident playbook (not learner Docs) |
| Network/integration blind | 16–19 | adapters + contracts |

## Parser / intelligence backlog (from docs)
- [ ] Fixed/free format lexer  
- [ ] Division/section/paragraph AST  
- [ ] PIC decoder → modern types  
- [ ] COPY expansion + REPLACING  
- [ ] CALL / LINKAGE graph  
- [ ] EXEC SQL / EXEC CICS token regions  
- [ ] FILE STATUS / SQLCODE / RESP checkers in tests  

## Source of truth policy
1. Behavior conflict → vendor doc in [00-SOURCES](./00-SOURCES.md) wins  
2. Update these summaries when connectors pin a compiler version  
3. Log product-shaping insights in [../REVELATIONS.md](../REVELATIONS.md)  
