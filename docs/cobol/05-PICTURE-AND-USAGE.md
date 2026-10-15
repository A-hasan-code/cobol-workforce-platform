# PICTURE and USAGE

`PIC` / `PICTURE` defines category, size, and editing for elementary items.  
`USAGE` defines internal representation (display vs binary vs packed, etc.).

## Core PIC symbols (must know)

| Symbol | Meaning |
|--------|---------|
| `9` | Digit |
| `X` | Alphanumeric character |
| `A` | Alphabetic |
| `S` | Sign (leading, for numerics) |
| `V` | Assumed decimal point |
| `P` | Scaling position (rare in app code) |
| `Z` | Zero suppress (edited) |
| `*` | Check protect / zero suppress (edited) |
| `$` / currency | Currency insertion (edited) |
| `+` `-` `CR` `DB` | Sign editing |
| `B` `0` `/` `,` `.` | Insertion editing |

Repeat count: `9(5)` ≡ `99999`, `X(20)` ≡ twenty characters.

## Common patterns in banks

```cobol
01 WS-NAME     PIC X(30).
01 WS-AGE      PIC 9(3).
01 WS-BALANCE  PIC S9(9)V99.
01 WS-BALANCE-E PIC $$$,$$9.99.
01 WS-FLAG     PIC X VALUE "N".
```

## Categories (conceptual)
- Alphabetic / alphanumeric / national  
- Numeric / numeric-edited / alphanumeric-edited  
Edited items are for **display**, not usually for arithmetic.

## USAGE (internal form)

| USAGE | Idea |
|-------|------|
| `DISPLAY` (default) | Character form |
| `COMP` / `COMPUTATIONAL` | Binary (implementation-defined width) |
| `COMP-3` / `PACKED-DECIMAL` | Packed decimal — very common in IBM banks |
| `COMP-5` | Native binary (often used with Db2 host vars) |
| `INDEX` | Index data item |
| `POINTER` / `PROCEDURE-POINTER` | Address-like (dialect/platform) |
| `NATIONAL` | National character set |

**Never assume COMP size is portable** across IBM vs GnuCOBOL vs MF without checking dialect rules.

## SIGN SEPARATE / TRAILING
Numeric display signs can be leading/trailing, separate or not — matters for file layouts and EBCDIC/ASCII boundaries.

## Product implication
- Explainer must decode PIC → modern type guess (`string`, `decimal`, `int`).  
- Impact engine: changing `PIC` length is a **high-risk** layout break.  
- Generator: prefer clear `PIC X(n)` / `PIC S9(n)V99` over clever edited forms in business logic.
