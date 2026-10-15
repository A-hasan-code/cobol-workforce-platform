# JCL and batch jobs

JCL (Job Control Language) tells **z/OS** what to run, with which datasets, and where output goes. COBOL batch estates are inseparable from JCL.

IBM overview: https://www.ibm.com/docs/en/zos-basic-skills?topic=sdsf-what-is-jcl

## The big three statements

| Statement | Role |
|-----------|------|
| `JOB` | Names the job; accounting; job-wide limits |
| `EXEC` | A step: program (`PGM=`) or procedure |
| `DD` | Data definition: datasets, sysout, paths |

```jcl
//PAYROLL  JOB (ACCT),'TEAM',CLASS=A,MSGCLASS=X
//STEP01   EXEC PGM=PAYCALC
//STEPLIB  DD  DSN=APP.LOAD.LIB,DISP=SHR
//INFILE   DD  DSN=APP.PAY.INPUT,DISP=SHR
//OUTFILE  DD  DSN=APP.PAY.OUTPUT,DISP=OLD
//SYSOUT   DD  SYSOUT=*
```

## How this connects to COBOL
- DD name in JCL ↔ `ASSIGN` / system-name in COBOL `SELECT`  
- `STEPLIB`/`JOBLIB` locate load modules  
- Conditional steps (`COND`) implement crude pipelines  

## Compile-link-go pattern
Typical training flow uses cataloged procedure (e.g. `IGYWCLG`):

1. Compile with `IGYCRCTL`  
2. Link-edit  
3. Execute  

Custom JCL appears when procs are too rigid (IBM “Writing JCL to compile programs”).

## Production control reality
Production analysts own JCL at scale: reruns, restarts, GDGs (generation data groups), scheduling (e.g. Control-M — outside core language but in estate graph later).

## Product mapping
| JCL concept | Platform |
|-------------|----------|
| Job / step | `Job` entity (Phase 2+) |
| DD → dataset | File adapter + contracts |
| COND / RC | Pipeline gates + Sense |
| Promote JCL+load | Control Plane |

## Local substitute (Phase 1)
No real JCL on laptop. Runtime Kit uses **scripts + cobol.toml** as the developer-facing equivalent of “how to run this job.”
