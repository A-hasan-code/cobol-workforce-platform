# Db2 embedded SQL in COBOL

Banks store core data in **Db2 for z/OS** (and sometimes LUW). COBOL talks SQL via embedded statements and a precompiler / coprocessor.

## Statement shape
```cobol
EXEC SQL
     SELECT BALANCE
       INTO :WS-BALANCE
       FROM ACCOUNTS
      WHERE ACCT_ID = :WS-ACCT
END-EXEC.
```

Host variables use a leading colon in SQL text.

## Declare section
With `STDSQL(YES)`, wrap host vars:

```cobol
EXEC SQL BEGIN DECLARE SECTION END-EXEC.
01 WS-ACCT     PIC X(10).
01 WS-BALANCE  PIC S9(9)V99 COMP-3.
EXEC SQL END DECLARE SECTION END-EXEC.
```

IBM docs: declaring host variables / indicator variables in COBOL (Db2 for z/OS).

## Host variable rules (summary)
- Declare in WORKING-STORAGE or LINKAGE before use  
- Names unique for precompiler scope  
- Indicator variables for NULL  
- Only certain COBOL declarations are valid host vars  
- `SQLCODE` / `SQLSTATE` checking after statements  

## Cursors
```cobol
EXEC SQL DECLARE C1 CURSOR FOR
     SELECT ...
END-EXEC.
EXEC SQL OPEN C1 END-EXEC.
EXEC SQL FETCH C1 INTO :WS-ROW END-EXEC.
EXEC SQL CLOSE C1 END-EXEC.
```

## Build pipeline (conceptual)
1. Precompile / SQL coprocessor → modified COBOL + DBRM/package artifacts  
2. Compile COBOL  
3. Bind package/plan to Db2  
4. Run under correct plan  

Missing bind = runtime SQL errors even if compile succeeded.

## INCLUDE
`EXEC SQL INCLUDE copyname` pulls SQLCOBOL copybooks — treat as copybook dependency.

## Product implication
- Explainer: show SQL + host var mapping in modern view.  
- Impact: table/column renames and host PIC mismatches.  
- Runtime Kit Phase 1: **no real Db2** — optional SQLite/stub later; don’t fake bank Db2 early.  
- Sense: SQLCODE spikes, slow queries (Phase 3+ with connectors).
