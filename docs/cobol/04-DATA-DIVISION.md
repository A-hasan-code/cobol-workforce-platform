# Data Division

## Main sections

| Section | Purpose |
|---------|---------|
| **FILE SECTION** | `FD` / record layouts for files |
| **WORKING-STORAGE SECTION** | Persistent data for the program run |
| **LOCAL-STORAGE SECTION** | Per-invocation storage (reentrant-friendly) |
| **LINKAGE SECTION** | Parameters from caller / CICS COMMAREA patterns |
| **REPORT SECTION** | Report Writer (less common in new code) |
| **SCREEN SECTION** | Some dialects (display terminals) |

## Level numbers

| Level | Meaning |
|-------|---------|
| `01` | Record / top group |
| `02`–`49` | Group or elementary subordinate items |
| `66` | `RENAMES` (rare in new code; still in estates) |
| `77` | Independent elementary item (legacy style) |
| `88` | Condition name (boolean-like flag on a value) |

Example:

```cobol
01 WS-CUSTOMER.
   05 WS-CUST-ID    PIC X(10).
   05 WS-CUST-NAME  PIC X(30).
   05 WS-STATUS     PIC X.
      88 WS-STATUS-ACTIVE   VALUE "A".
      88 WS-STATUS-CLOSED   VALUE "C".
```

## Group vs elementary
- **Group**: no `PIC`; contains children  
- **Elementary**: has `PIC` (or certain `USAGE` forms)  

## REDEFINES
Same storage, different views (union-like). Critical in bank record overlays. Impact analysis must treat REDEFINES as shared storage.

```cobol
01 WS-AMOUNT-X     PIC X(7).
01 WS-AMOUNT-9 REDEFINES WS-AMOUNT-X PIC 9(5)V99.
```

## OCCURS / tables
```cobol
01 WS-TABLE.
   05 WS-ENTRY OCCURS 100 TIMES.
      10 WS-CODE PIC X(3).
```

- `OCCURS DEPENDING ON` → variable length (careful in CICS/working-storage)  
- COBOL-2014 dynamic-capacity tables → newer compilers  

## VALUE clause
Initializes WORKING-STORAGE items. Not a substitute for runtime `INITIALIZE` in all cases.

## FILLER
Unnamed bytes / padding in records. Extremely common in copybooks.

## Product data model mapping
| COBOL concept | Platform entity |
|---------------|-----------------|
| Program | `Program` |
| Copybook layouts | `Copybook` |
| Level items | fields in dependency graph |
| REDEFINES / OCCURS | impact edges (shared / indexed storage) |
