# File I/O

## ENVIRONMENT: SELECT / ASSIGN
```cobol
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT CUST-FILE ASSIGN TO "CUST.DAT"
        ORGANIZATION IS SEQUENTIAL
        ACCESS MODE IS SEQUENTIAL
        FILE STATUS IS WS-FILE-STATUS.
```

`ASSIGN` maps to DD name on z/OS, file path on GnuCOBOL/Windows/Linux — **platform adapter territory**.

## Organizations

| ORGANIZATION | Access idea | z/OS typical |
|--------------|-------------|--------------|
| `SEQUENTIAL` | One after another | QSAM / VSAM ESDS |
| `LINE SEQUENTIAL` | Text lines | Unix/PC files (GnuCOBOL friendly) |
| `INDEXED` | By key | VSAM KSDS |
| `RELATIVE` | By relative record # | VSAM RRDS |

Access modes: `SEQUENTIAL`, `RANDOM`, `DYNAMIC` (allowed set depends on organization).

## DATA: FD + record
```cobol
DATA DIVISION.
FILE SECTION.
FD  CUST-FILE.
01  CUST-RECORD.
    05 CUST-ID   PIC X(10).
    05 CUST-NAME PIC X(30).
```

## PROCEDURE verbs
```cobol
OPEN INPUT CUST-FILE
READ CUST-FILE
    AT END SET WS-EOF TO TRUE
END-READ
WRITE CUST-RECORD
REWRITE CUST-RECORD
DELETE CUST-FILE
START CUST-FILE KEY IS EQUAL TO CUST-ID
CLOSE CUST-FILE
```

## FILE STATUS (non-negotiable quality bar)
Always check status after I/O in generated/production code. `"00"` = OK; other codes are dialect/system defined — document a table in Runtime Kit later per target.

## Batch mental model
```
JCL DD / local path → ASSIGN → FD layout → OPEN/READ loop → CLOSE
```

## CICS note
Under CICS, classic COBOL file I/O is largely **replaced by EXEC CICS** file commands. See [17-CICS](./17-CICS.md).

## Product implication
- Runtime Kit: ship **line sequential** samples first (portable).  
- Adapters later: DD name mapping, VSAM stubs, fake datasets.  
- Sense: job duration + file error rates.
