# CICS (online transactions)

CICS runs interactive / service-style programs. COBOL under CICS uses `EXEC CICS` APIs instead of many classic COBOL I/O verbs.

## Command shape
```cobol
EXEC CICS READ
     FILE('FILEA')
     INTO(WS-REC)
     RIDFLD(WS-KEY)
     RESP(WS-RESP)
END-EXEC.
```

- Keywords separated by spaces (not commas)  
- COBOL terminator: `END-EXEC`  
- Translator turns commands into calls (e.g. `DFHEI1`)  

Refs:
- https://www.ibm.com/docs/en/cobol-zos/6.3?topic=cics-coding-cobol-programs-run-under  
- https://www.ibm.com/docs/en/cics-ts/6.x?topic=reference-exec-cics-command-format-programming-considerations  

## Major restriction (know by heart)
For CICS COBOL apps, **do not** use classic file I/O verbs (`OPEN` `CLOSE` `READ` `WRITE` `REWRITE` `DELETE` `START`) or many `ACCEPT`/`DISPLAY` forms — use CICS commands instead.  
Also avoid OO Java-interop COBOL syntax under CICS per IBM notes.

`FILE SECTION` / `FILE-CONTROL` generally not used except limited cases (e.g. SORT-related exceptions documented by IBM).

## Common command groups (conceptual)
| Area | Examples |
|------|----------|
| Program control | `LINK` `XCTL` `RETURN` `ABEND` |
| Terminal / map | `SEND` `RECEIVE` (BMS maps) |
| Files / VSAM | `READ` `WRITE` `REWRITE` `DELETE` `STARTBR` `READNEXT` |
| TS / TD queues | `WRITEQ TS` `READQ` `DELETEQ` |
| Temp storage / channels | containers/channels (modern) |
| Interval control | `START` `DELAY` |

Full list: CICS API Reference.

## COMMAREA / channels
Classic pattern: pass data via DFHCOMMAREA on LINK/XCTL/RETURN. Newer apps use channels/containers. LINKAGE and copybooks define the contract — high impact risk.

## EIB
Execute Interface Block fields (via CICS copybooks) expose task data (transid, response, etc.). Explainer should recognize DFH* names.

## Error handling
`RESP` / `RESP2` preferred in modern style; older `HANDLE CONDITION` still exists in estates.

## Product implication
- Phase 1: **stub awareness** only (parse/explain EXEC CICS, don’t run real CICS).  
- Phase 3: CICS stub simulator for local tests (subset of commands).  
- Impact: COMMAREA layout changes = critical risk.
