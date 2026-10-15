# Estate ingest — “sab kuch uthao,” including ghost code

**Goal:** bank ke poore COBOL system se inventory + source + links uthana — sirf “jo wiki pe likha hai” nahi, **jo asal mein chalta / pada hai**, ghost programs samet.

Yeh Phase 2+ bank wedge hai. Phase 1 stubs ship in `packages/estate-model` (schema + bank-playground fixture); real mainframe connectors Phase 3 ke paas mature hote hain.

---

## “Ghost code” kya hai?

Cheez jo **official list mein nahi**, lekin system mein maujood / callable hai:

| Ghost type | Example |
|------------|---------|
| Undocumented load module | Loadlib mein member hai, CMDB/docs mein nahi |
| Orphan source | Source lib mein hai, koi JCL `EXEC PGM=` nahi |
| Orphan executable | JCL call karta hai, source missing / alag lib |
| Forgotten utility | Decades-old tool ab bhi prod job se call |
| Test-became-prod | `TEST*` program jo schedule mein aa gaya |
| Dynamic CALL target | Runtime pe name resolve — static list miss |
| Dead-but-present | Kabhi call nahi, phir bhi lib mein (risk / noise) |

**Product rule:** ghost = first-class citizen with status  
`documented | ghost | orphan-source | orphan-load | dynamic-uncertain | unused-candidate`

---

## “Sab kuch” ka matlab (artifact classes)

Poori estate uthani ho to yeh layers chahiye — sirf `.cbl` files kaafi nahi:

```
1. Source programs          (.cbl / .cob / PDS members)
2. Copybooks                (.cpy / COPY libs / SQL INCLUDE)
3. Load modules / objects   (what actually can run)
4. JCL + PROCs              (who runs what, DD → datasets)
5. Scheduler definitions    (Control-M / CA-7 … later)
6. Db2 artifacts            (DBRM, packages, plans, DDL refs)
7. CICS defs                (PPT/PCT/FCT-ish exports, maps later)
8. Dataset / VSAM catalog   (names, keys — metadata, not prod data)
9. Compiler option records  (listings / build parms when available)
10. Runtime evidence        (SMF / job history — what really ran)
```

Jo miss hoga, samajh **incomplete** hogi — yeh hi UND-03 / UND-06 / UND-07 / UND-08 hai.

---

## Lift architecture (how we uthate hain)

```
                    ┌──────────────────┐
                    │  Ingest Control  │  (connectors, creds, scope, audit)
                    └────────┬─────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
     Source libs        Load libraries      JCL / sched
     Copy libs          (members list)      PROCs
           │                 │                 │
           └────────────┬────┴────────────────┘
                        ▼
              ┌──────────────────┐
              │ Normalize + ID   │  Program, Copybook, Job, Dataset…
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Graph build      │  CALL, COPY, EXEC PGM, DD lineage
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Ghost detection  │  set operations + dynamic flags
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Studio / Sense   │  inventory UI, impact, heat from runs
              └──────────────────┘
```

**Never:** prod business data dump by default.  
**Yes:** metadata + source + job defs + (optional) sanitized samples.

---

## Ghost detection (set math)

| Set | Source |
|-----|--------|
| `S` | Programs found in **source** libraries |
| `L` | Members found in **load** libraries |
| `J` | Programs referenced by **JCL** `EXEC PGM=` / PROCs |
| `C` | Targets of static **CALL** `'NAME'` |
| `D` | Names only seen via **dynamic** CALL / variables |
| `Doc` | Names in CMDB / Excel / “official” inventory |

### Rules
```
ghost-load     = L − Doc          (runs/exists, not documented)
orphan-source  = S − L − J        (source with no obvious run path)
orphan-load    = L − S            (executable, source missing — critical)
undocumented-run = J − Doc        (scheduled but not in docs)
unused-candidate = L − J − C      (no job/static call — verify via SMF before delete)
dynamic-uncertain = D             (must not pretend certainty)
```

Studio shows these buckets clearly — “utha lao” ke baad pehli value yahi inventory truth hai.

---

## Connectors (phased)

| Phase | What we can lift | How |
|-------|------------------|-----|
| **1** | Sample repo + fake estate fixture | Git folders: `programs/`, `copybooks/`, `jcl/` |
| **2** | Customer Git / export zip | Same parsers; ghost rules on exported trees |
| **2–3** | z/OS source & JCL exports | Secure drop / FTP / API approved by bank |
| **3** | Loadlib member lists, catalog metadata | IBM connectors (read-only first) |
| **3+** | SMF / job history heat | Prove what actually ran (kill false “unused”) |

Day-1 claim **nahi:** “live prod LPAR pe agent install karke chupke sab nikaal liya.”  
Day-1 claim **haan:** model + parsers + ghost math; connectors gated, audited, read-only.

---

## Data model (bank-scale — already required early)

```
Estate
  Program { id, name, source_path?, load_present?, status, dialect }
  Copybook { id, name, path, fields[] }
  Dependency { from, to, type: COPY|CALL|EXEC|DD|SQL|CICS }
  Job { id, name, jcl_path, steps[] }
  DatasetRef { ddname, dsn_pattern, producers[], consumers[] }
  IngestRun { when, connector, scope, stats, errors }
  GhostFlag { program_id, kind, evidence }
```

Phase 1 stubs in Runtime Kit repo; real fill from Phase 2 ingest.

---

## Safety & bank trust (non-negotiable)

1. **Read-only ingest** first; no write to prod libs.  
2. **Explicit scope** — which libs/jobs (not “whole sysplex” by accident).  
3. **Audit log** — who ingested what, when ([SAFETY](./SAFETY.md) + Control Plane).  
4. **No prod customer data** in SaaS without contract; prefer metadata + masked samples.  
5. **Human approval** before any connector enable / deploy.  
6. Secrets in JCL detected → flag, don’t store raw passwords.

---

## What “sab kuch utha lao” delivers in product UX

1. **Inventory truth** — counts: source / load / jobs / ghosts  
2. **Ghost board** — orphan-load, undocumented-run, …  
3. **Lineage** — program ↔ copybook ↔ dataset ↔ job  
4. **Impact** — “is field / program pe kaun depend karta hai?”  
5. **Heat** — (later) last-run from SMF so unused ≠ guess  
6. **Export** — auditor pack: what exists vs what docs claimed  

Yeh seedha UND-01…UND-08 aur PPL-07 ko attack karta hai.

---

## Honest limits

| Can lift | Cannot pretend Day 1 |
|----------|----------------------|
| All source you’re given access to | Hidden encrypted libs without access |
| All JCL in scoped libraries | Business meaning 100% without human review |
| Load member **names** | Perfect decompile of every load to source |
| Static CALL/COPY graphs | 100% dynamic CALL resolution |
| Job→DD→DSN patterns | Full production data contents |

Ghost discovery = **evidence-based inventory**, not magic omniscience.

---

## MVP path (when we build this)

1. Fixture estate in-repo (includes planted ghosts)  
2. Parsers: COBOL PROGRAM-ID, COPY, CALL; JCL JOB/EXEC/DD  
3. Ghost set reports in CLI + Studio  
4. Customer zip/git ingest  
5. Read-only enterprise connectors  

Roadmap: Phase 2 checklist item “Repo / job ingest” expands to this doc.
