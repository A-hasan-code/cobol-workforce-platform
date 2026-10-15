# Architecture

## Mental model

```
Developer laptop              Platform                         Bank / runtime
─────────────────             ──────────────                   ──────────────
Editor + AI assist   →        Analyze / test / build   →       GnuCOBOL sandbox
Local run / tests    →        CI pipelines             →       Staging (IBM/MF later)
Git PR               →        Impact + risk gates      →       Prod (controlled)
```

COBOL remains below. The modern DevOps loop runs above.

## System context

```
                    ┌─────────────────────────────────────┐
                    │         COBOL Workforce Layer       │
                    │                                     │
  Developers ──────►│  Studio  │ Runtime Kit │ Pipeline   │
                    │     │           │            │      │
                    │     └─────┬─────┴────────────┘      │
                    │           │                         │
                    │    Control Plane ──── Sense         │
                    └───────────┬─────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
         GnuCOBOL          IBM Enterprise    Micro Focus
         (learn/demo)      COBOL (banks)     (later)
```

## Environment progression

| Env | Purpose | Risk |
|-----|---------|------|
| `local` | Write, run, unit-style tests, fake datasets | None to bank prod |
| `ci` | Compile, test, lint, secret scan, risk gates | Ephemeral |
| `staging` | Integration with bank-like adapters | Controlled |
| `prod` | Controlled release + approvals + audit | Highest — gated |

Ops policy (two pipelines, promote, Sense): [CONTROL-PLANE.md](./CONTROL-PLANE.md) · [SENSE.md](./SENSE.md) · [PRODUCTION-OPS.md](./PRODUCTION-OPS.md).

## Resilience design (fail soft)

Banks need failure that is loud and soft, not silent and total:

- Health checks, timeouts, safe retries  
- Circuit breakers / bulkheads  
- Backpressure (queue / slow down under load)  
- Graceful degradation (non-critical off, core path alive)  
- Observability: logs, metrics, traces (job duration, error rate)  
- Rollback + blast-radius map  

## Integration / networking layer

Modern apps speak HTTP/queues; COBOL estates often speak files and batch.

Platform provides:

- File adapters + queue adapters  
- Optional API gateway (REST in/out)  
- Service contracts (input/output schemas)  
- Local stubs for DB2/CICS-like calls (real connectors later)  

## Core data model (bank-scale early)

Even if Phase 1 UI is a playground, persist concepts for estate scale:

- **Program** — COBOL source unit  
- **Copybook** — shared data definitions  
- **Dependency** — program → copybook / program → program  
- **Job** — batch / schedule unit (later)  
- **Change** — proposed edit + tests + risk + audit trail  
- **Environment** — local / ci / staging / prod  
- **GhostFlag** — orphan/undocumented inventory status  

Full “sab kuch uthao” (source + load + JCL + lineage + ghosts): [ESTATE-INGEST.md](./ESTATE-INGEST.md).

## Project manifest (Runtime Kit)

`cobol.toml` (name TBD) acts like `package.json`:

- Program entrypoints  
- Copybook paths  
- Compile / run / test commands  
- Target dialect (GnuCOBOL first)  

## Security boundaries

- No prod bank credentials in samples  
- Sandbox data only in local/ci  
- Secrets never in git  
- Deploy / push only with human approval (see [SAFETY.md](./SAFETY.md))  

## Design principle (every decision)

> Modern developer workflow first. COBOL is the runtime dialect, not the prison.

If a feature feels unnatural to a modern JS/Java team, redesign it.
