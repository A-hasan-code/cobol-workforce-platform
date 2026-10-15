# History and standards

## Why this matters for banks
Estates often mix **COBOL-74/85 style** code with newer compiler features. “Language upgraded” ≠ “codebase upgraded.” Our product must understand old idioms while targeting modern compilers.

## Timeline (informal → standard)

| Era | Informal name | Notes |
|-----|---------------|--------|
| 1959–65 | Early COBOL | CODASYL; FLOW-MATIC influence (Grace Hopper lineage) |
| 1968 | COBOL-68 | First ANSI standard |
| 1974 | COBOL-74 | Widely still visible in bank style |
| 1985 | COBOL-85 | Structured programming: `END-IF`, `END-PERFORM`, `EVALUATE`, nested IF |
| 1989/93 | Amendments | Intrinsic functions family growth |
| 2002 | COBOL-2002 | OO, free format expansion, national/Unicode direction, nested programs improvements |
| 2014 | COBOL-2014 | Dynamic-capacity tables, more modern numeric/float support, continued modernization |
| 2023 | COBOL-2023 | Current ISO/IEC 1989:2023 (2014 withdrawn as ISO edition) |

Sources: ISO pages for 1989:2014 / 1989:2023; community timelines (Wikipedia overview).

## What vendors actually ship
Banks rarely run “pure ISO only.” They run:

1. **IBM Enterprise COBOL for z/OS** — standard core + IBM extensions; Language Environment runtime  
2. **Micro Focus / Rocket Visual COBOL** — many dialects via `DIALECT`  
3. **GnuCOBOL** — free; dialects via `cobc -std=...` — our Phase 1 learn/demo target  

## Dialect reality for our platform
| Target order | Role |
|--------------|------|
| GnuCOBOL | Local Runtime Kit, CI demos, student path |
| IBM Enterprise COBOL | Real bank money / mainframe |
| Micro Focus | Secondary enterprise lock-in markets |

## Product implication
- Parser / explainer must tolerate 74/85-style and modern structured style.  
- Generator should emit **readable idiomatic COBOL-85+** unless targeting a specific dialect profile.  
- Never claim one binary runs everywhere without dialect adapters.
