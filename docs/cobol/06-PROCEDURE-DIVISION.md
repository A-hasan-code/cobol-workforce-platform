# Procedure Division — statements map

Not every verb exists on every dialect. This is the **working catalog** for Studio explain/generate.

## Data movement & init
| Statement | Use |
|-----------|-----|
| `MOVE` | Assign / convert between items |
| `INITIALIZE` | Reset groups/elementary to defaults |
| `SET` | Indexes, condition names, pointers |
| `ACCEPT` | Input from device/date (restricted under CICS) |
| `DISPLAY` | Output (restricted variants under CICS) |

## Arithmetic
| Statement | Use |
|-----------|-----|
| `ADD` `SUBTRACT` `MULTIPLY` `DIVIDE` | Classic verbs; `GIVING` / `ROUNDED` / `ON SIZE ERROR` |
| `COMPUTE` | Expression form |

Always consider `ON SIZE ERROR` for money math.

## Control (see also control-flow doc)
`IF` / `EVALUATE` / `PERFORM` / `GO TO` / `CONTINUE` / `EXIT` / `STOP RUN` / `GOBACK` / `EXIT PROGRAM`

## Files
`OPEN` `CLOSE` `READ` `WRITE` `REWRITE` `DELETE` `START`  
(+ `FILE STATUS` checks — critical)

## String handling
`STRING` `UNSTRING` `INSPECT` `REFERENCE MODIFICATION` (e.g. `WS-NAME(1:10)`)

## Tables
`SEARCH` `SEARCH ALL` (binary search needs ordered key)  
`PERFORM VARYING` for loops over OCCURS

## Sort/merge
`SORT` `MERGE` — batch heavy; needs SD descriptions / files

## Subprograms
`CALL` `CANCEL` — see [10-SUBPROGRAMS](./10-SUBPROGRAMS.md)

## Embedded / external APIs (not pure COBOL)
| Form | Domain |
|------|--------|
| `EXEC SQL … END-EXEC` | Db2 / SQL |
| `EXEC CICS … END-EXEC` | CICS |
| JSON/XML verbs | Vendor extensions (IBM JSON PARSE/GENERATE, etc.) |

## Intrinsic functions
`FUNCTION LENGTH` `FUNCTION NUMVAL` `FUNCTION CURRENT-DATE` …  
See [11-INTRINSICS](./11-INTRINSICS-AND-FUNCTIONS.md).

## Generator allow-list (Phase 1)
Safe subset for intent→COBOL:

`DISPLAY`, `MOVE`, `ACCEPT` (local), `IF/END-IF`, `EVALUATE`, `PERFORM … TIMES/UNTIL/VARYING`, `COMPUTE`/`ADD`, sequential `OPEN/READ/WRITE/CLOSE`, `STOP RUN`.

Defer: CICS, SQL, SORT, POINTER tricks, ALTER (obsolete/dangerous).
