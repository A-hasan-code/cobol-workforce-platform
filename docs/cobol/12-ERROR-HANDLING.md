# Error handling

Banks fear silent wrong answers more than loud crashes. Our platform must prefer **fail loud + fail soft**.

## File errors
```cobol
READ CUST-FILE
    AT END ...
    NOT AT END ...
END-READ
IF WS-FILE-STATUS NOT = "00"
   PERFORM PROC-FILE-ERROR
END-IF
```

Use `FILE STATUS` clause on SELECT. Map codes per runtime in Runtime Kit docs.

## Arithmetic errors
```cobol
ADD WS-A TO WS-B
    ON SIZE ERROR PERFORM PROC-OVERFLOW
END-ADD
```

Money paths should almost always consider overflow / size error.

## Declaratives / USE
```cobol
DECLARATIVES.
FILE-ERROR SECTION.
    USE AFTER ERROR PROCEDURE ON CUST-FILE.
    ...
END DECLARATIVES.
```

Powerful; harder to read — explainer should surface these early.

## SQL errors
After `EXEC SQL`, check `SQLCODE` / `SQLSTATE` (and Db2 diagnostic patterns). `"0"` success; positive/negative meanings per Db2 docs.

## CICS errors
Prefer `RESP` / `RESP2` on `EXEC CICS` rather than classic HANDLE in new code (shop standards vary).

```cobol
EXEC CICS READ FILE('FILEA')
     INTO(WS-REC)
     RIDFLD(WS-KEY)
     RESP(WS-RESP)
END-EXEC
IF WS-RESP NOT = DFHRESP(NORMAL)
   ...
END-IF
```

## Program return
`MOVE 12 TO RETURN-CODE` (or dialect equivalent) before ending — CI/Runtime Kit should surface non-zero returns.

## Platform mapping
| Concern | Module |
|---------|--------|
| Local assert on status/SQLCODE | Runtime Kit tests |
| Gate on failing tests | Pipeline |
| Prod job abend / slow | Sense |
| Safe retry / rollback | Control Plane + Sense |
