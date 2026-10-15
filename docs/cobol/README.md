# COBOL reference library

Internal knowledge base for the COBOL Workforce Platform.  
Built from standards history + vendor docs (GnuCOBOL, IBM, Rocket/Micro Focus) + bank-stack topics (JCL, CICS, Db2, VSAM).

**Not a substitute for vendor manuals.** Where behavior is vendor-specific, follow the linked official source. We do **not** paste copyrighted IBM/ISO text; we summarize and cite.

## Learners first (Studio Docs)

Prefer the in-app guide at **Studio → Docs** (`http://localhost:8787/docs`): short words, live Run boxes, EasyLang + COBOL side by side.

Suggested path: Welcome → Easy Mode → Functions → Files → Records → **Adapters (stubs)** → Subroutines → Practice → Playground (`interest`, `functions`, `fileio`, `account`, `adapters` .easy).

Ladder notes: [../EASY-MODE.md](../EASY-MODE.md). Nested CALL mapping: [10-SUBPROGRAMS.md](./10-SUBPROGRAMS.md).

## Read order (new engineer — deep notes)

1. [Sources catalog](./00-SOURCES.md)  
2. [History & standards](./01-HISTORY-AND-STANDARDS.md)  
3. [Program structure](./02-PROGRAM-STRUCTURE.md)  
4. [Source format](./03-SOURCE-FORMAT.md)  
5. [Data Division](./04-DATA-DIVISION.md) + [PIC & USAGE](./05-PICTURE-AND-USAGE.md)  
6. [Procedure Division](./06-PROCEDURE-DIVISION.md) + [Control flow](./07-CONTROL-FLOW.md)  
7. [File I/O](./08-FILE-IO.md) + [Copybooks](./09-COPYBOOKS.md)  
8. [Subprograms / CALL](./10-SUBPROGRAMS.md) ← EasyLang v2 bridge  
9. [GnuCOBOL](./13-GNUCOBOL.md) ← Phase 1 runtime  
10. Bank stack: [JCL](./16-JCL-BATCH.md) · [CICS](./17-CICS.md) · [Db2](./18-DB2-SQL.md) · [VSAM](./19-VSAM-AND-DATASETS.md)  
11. [Platform mapping](./24-PLATFORM-MAPPING.md)  

## Full index

| # | Doc | Covers |
|---|-----|--------|
| 00 | [SOURCES](./00-SOURCES.md) | Official links, what we trust |
| 01 | [HISTORY-AND-STANDARDS](./01-HISTORY-AND-STANDARDS.md) | COBOL-68 → 2023 timeline |
| 02 | [PROGRAM-STRUCTURE](./02-PROGRAM-STRUCTURE.md) | 4 divisions, compilation group |
| 03 | [SOURCE-FORMAT](./03-SOURCE-FORMAT.md) | Fixed / free, areas, comments |
| 04 | [DATA-DIVISION](./04-DATA-DIVISION.md) | Sections, levels, REDEFINES, OCCURS |
| 05 | [PICTURE-AND-USAGE](./05-PICTURE-AND-USAGE.md) | PIC symbols, COMP, edited fields |
| 06 | [PROCEDURE-DIVISION](./06-PROCEDURE-DIVISION.md) | Statements catalog |
| 07 | [CONTROL-FLOW](./07-CONTROL-FLOW.md) | IF, EVALUATE, PERFORM, GO TO |
| 08 | [FILE-IO](./08-FILE-IO.md) | SELECT, FD, OPEN/READ/WRITE |
| 09 | [COPYBOOKS](./09-COPYBOOKS.md) | COPY, REPLACING, libraries |
| 10 | [SUBPROGRAMS](./10-SUBPROGRAMS.md) | CALL, LINKAGE, nested programs |
| 11 | [INTRINSICS](./11-INTRINSICS-AND-FUNCTIONS.md) | Intrinsic functions, special registers |
| 12 | [ERROR-HANDLING](./12-ERROR-HANDLING.md) | File status, declaratives, SQLCODE |
| 13 | [GNUCOBOL](./13-GNUCOBOL.md) | cobc, dialects, install, run |
| 14 | [IBM-ENTERPRISE](./14-IBM-ENTERPRISE.md) | z/OS Enterprise COBOL |
| 15 | [MICRO-FOCUS](./15-MICRO-FOCUS.md) | Visual COBOL / dialects |
| 16 | [JCL-BATCH](./16-JCL-BATCH.md) | JOB/EXEC/DD, compile-link-go |
| 17 | [CICS](./17-CICS.md) | EXEC CICS, restrictions |
| 18 | [DB2-SQL](./18-DB2-SQL.md) | Embedded SQL, host vars |
| 19 | [VSAM-AND-DATASETS](./19-VSAM-AND-DATASETS.md) | QSAM/VSAM, datasets |
| 20 | [MODERNIZATION](./20-MODERNIZATION.md) | Safe change patterns |
| 21 | [TESTING-AND-DEVOPS](./21-TESTING-AND-DEVOPS.md) | Local/CI/staging mindset |
| 22 | [GLOSSARY](./22-GLOSSARY.md) | Terms |
| 23 | [CHEATSHEET](./23-CHEATSHEET.md) | Fast lookup |
| 24 | [PLATFORM-MAPPING](./24-PLATFORM-MAPPING.md) | How docs feed our product |

## Completeness checklist (coverage targets)

- [x] Language standards timeline  
- [x] Divisions / sections / source format  
- [x] Data description (PIC, USAGE, OCCURS, REDEFINES)  
- [x] Procedure verbs & control flow  
- [x] Files + copybooks + subprograms  
- [x] GnuCOBOL toolchain (Phase 1)  
- [x] IBM Enterprise COBOL pointers  
- [x] Micro Focus / Rocket dialects  
- [x] JCL batch  
- [x] CICS online  
- [x] Db2 embedded SQL  
- [x] VSAM / dataset concepts  
- [x] Modernization + test/DevOps mapping  
- [x] Glossary + cheatsheet + source catalog  

Last researched: **2026-10-15**.

## External tutorials (reference only)
Beginner web tutorials such as [TutorialsPoint COBOL](https://www.tutorialspoint.com/cobol/index.htm) are useful extras.  
**Do not paste their pages into this repo** — copyright. Our Studio Docs (`/docs`) and these `docs/cobol/*` notes are original summaries with citations to vendor/standards sources.
