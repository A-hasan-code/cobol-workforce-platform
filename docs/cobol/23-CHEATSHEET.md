# COBOL cheatsheet

## Skeleton
```cobol
IDENTIFICATION DIVISION.
PROGRAM-ID. DEMO.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NAME PIC X(20) VALUE "Ali".
01 WS-AGE  PIC 9(3)  VALUE 25.
PROCEDURE DIVISION.
    DISPLAY "Hello " WS-NAME
    IF WS-AGE >= 18
       DISPLAY "adult"
    END-IF
    STOP RUN.
```

## PIC quick
| Need | PIC |
|------|-----|
| String 10 | `X(10)` |
| Int 5 | `9(5)` |
| Signed money | `S9(9)V99` |
| Packed (IBM style) | `S9(9)V99 COMP-3` |

## Control quick
```cobol
IF ... END-IF
EVALUATE ... WHEN ... WHEN OTHER ... END-EVALUATE
PERFORM 10 TIMES ... END-PERFORM
PERFORM UNTIL WS-EOF ... END-PERFORM
PERFORM VARYING I FROM 1 BY 1 UNTIL I > 10 ... END-PERFORM
```

## File quick
```cobol
SELECT F ASSIGN TO "f.dat"
  ORGANIZATION IS LINE SEQUENTIAL
  FILE STATUS IS WS-FS.
FD F. 01 F-REC PIC X(80).
OPEN INPUT F
READ F AT END SET WS-EOF TO TRUE END-READ
CLOSE F
```

## GnuCOBOL quick
```bash
cobc -x prog.cob -o prog
./prog
cobc -x -free prog.cob -I ./cpy -o prog
```

## EXEC SQL quick
```cobol
EXEC SQL SELECT A INTO :WS-A FROM T WHERE ID = :WS-ID END-EXEC
IF SQLCODE NOT = 0 ...
```

## EXEC CICS quick
```cobol
EXEC CICS READ FILE('F') INTO(WS) RIDFLD(WS-KEY) RESP(WS-RESP) END-EXEC
```

## JCL big three
`JOB` → `EXEC` → `DD`

## Never forget
1. Periods end sentences  
2. Check FILE STATUS / SQLCODE / RESP  
3. Copybook change = estate impact  
4. Local prove before prod  
