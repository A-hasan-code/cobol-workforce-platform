# Problem — summary

Full inventory (83 tracked): **[PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md)**

## Top 4 (product north stars)

| # | Pain | One-line |
|---|------|----------|
| 1 | **Developers scarce** | Experts retire; modern engineers cannot safely work on COBOL estates |
| 2 | **Weak test/deploy env** | No local → CI → staging → prod loop; fear of breaking production |
| 3 | **Weak visibility / fix path** | Slowdowns and blast radius unclear; fix = call the expert |
| 4 | **Any-language → COBOL** | Growth *feature* (Phase 3), not the foundation |

## Category map

| Category | Examples | Primary modules |
|----------|----------|-----------------|
| People & skills | Retirement, no graduates, global access | Studio, Runtime |
| Understanding | No docs, hidden rules, ghost programs, lineage | Studio + [estate ingest](./ESTATE-INGEST.md) |
| Change risk | Copybook blast, COMMAREA drift | Impact + tests |
| Env / DevOps | No local/CI/staging | Runtime, Pipeline, Control |
| Batch / JCL | Windows, job chains, GDG | Pipeline, Sense |
| Online / data | CICS/Db2/VSAM pitfalls | Later connectors + linters |
| Ops | Late slowdown detect, no rollback story | Sense, Control |
| Integration | Files-as-API, no stubs | Adapters |
| Security / audit | Compliance, secrets, AI governance | Control, Safety rules |
| Strategy | Rewrite fantasy, failed mega-programs | Positioning (bridge, not rip-out) |

## Priority order (locked)

1. Safe test environment (Runtime Kit)  
2. Understand + impact (Studio)  
3. Deploy + Sense (Pipeline / Control / Sense)  
4. Controlled code → COBOL (Phase 3)  

## Production / ops docs (bank face)

Learner Studio Docs are separate. For **real production** error handling, promote, and visibility:

| Doc | Covers |
|-----|--------|
| [PRODUCTION-OPS.md](./PRODUCTION-OPS.md) | On-call playbook — signal → blast → safe fix |
| [CONTROL-PLANE.md](./CONTROL-PLANE.md) | Two pipelines, promote, approvals, audit |
| [SENSE.md](./SENSE.md) | Observe, baselines, blast radius, rollback signals |

Pains #2 and #3 above map here.

## Traps we refuse

- AI chat without runnable proof  
- Day-1 “any language → perfect COBOL”  
- COBOL-only view that ignores JCL/copybooks  
- Auto prod deploy without human approval  

Details + IDs (PPL-01 … ANT-06): [PROBLEMS-CATALOG.md](./PROBLEMS-CATALOG.md).
