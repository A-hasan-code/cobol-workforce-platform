# Modules

## Studio
Modern developer surface.

- Editor (VS Code–like experience)  
- Explain COBOL → plain English / modern view  
- Side-by-side modern syntax ↔ COBOL  
- Generate from simple intent (forms, file I/O, reports)  
- Later: controlled code → COBOL from a familiar language subset  

**Audience:** students, indie hackers, bank engineers learning the estate.

## Runtime Kit
Local-first COBOL engineering loop.

- Project template + `cobol.toml`  
- Compile / run / test via GnuCOBOL (`cobc`)  
- Fake files / mock datasets (no prod data)  
- Clear exit codes and logs  
- Cloud sandbox later for shareable demos  

**Audience:** every developer; foundation of trust.

## Pipeline
DevOps for COBOL estates.

- Git-based branch / PR workflow  
- CI: compile + tests + lint/style + secret scan  
- Artifacts + versioning  
- Risk / impact gates before merge or promote  

**Audience:** IT services + bank engineering teams.

## Control Plane
Environments, deploy, approvals, audit.

- Env model: local → ci → staging → prod  
- **Two pipelines:** Build/prove (PR) vs Promote (staging→prod)  
- Controlled promote + approval gates  
- Audit trail for who changed what  
- Rollback hooks  

**Audience:** banks (paying path).  
**Deep doc:** [CONTROL-PLANE.md](./CONTROL-PLANE.md).

## Sense
Watch the estate; shorten time-to-detect and time-to-safe-fix.

- Health checks, job duration, error rates  
- Slowdown detection  
- Blast-radius map (which programs/jobs affected)  
- Alerts + suggested safe fix / rollback path  
- Graceful degradation signals  

**Audience:** banks ops + delivery partners.  
**Deep doc:** [SENSE.md](./SENSE.md).

## Production ops (cross-cutting)

On-call playbook for real estate errors — separate from Studio learner Docs:

→ **[PRODUCTION-OPS.md](./PRODUCTION-OPS.md)**

## How modules ship together

| Phase | Ship |
|-------|------|
| 1 | Runtime Kit + tiny Studio + basic Pipeline |
| 2 | Studio intelligence (impact, rules) + stronger Pipeline |
| 3 | Control Plane + Sense + controlled code→COBOL + enterprise connectors |

Fame path: Studio + Runtime Kit demos.  
Revenue path: Pipeline + Control Plane + Sense.
