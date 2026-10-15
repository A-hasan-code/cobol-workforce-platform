# Intrinsic functions and special registers

## Intrinsic functions (COBOL-85 amendments → modern)
Called as `FUNCTION name(...)`.

Commonly used:

| Function | Use |
|----------|-----|
| `LENGTH` / `LENGTH-AN` | Size |
| `NUMVAL` / `NUMVAL-C` | String → number |
| `TRIM` / `UPPER-CASE` / `LOWER-CASE` | String normalize (availability varies by standard/vendor) |
| `CURRENT-DATE` | Timestamp-like alphanumeric |
| `WHEN-COMPILED` | Compile-time stamp |
| `INTEGER` `INTEGER-OF-DATE` `DATE-OF-INTEGER` | Date math |
| `RANDOM` | Random (careful in banking) |
| `ABS` `MOD` `REM` `SQRT` | Numeric |

Exact list depends on dialect (`cobc --list-intrinsic`, IBM Language Reference).

## Special registers (examples)
Vendor/runtime provides registers such as:

- `RETURN-CODE`  
- `FILE-STATUS` related concepts via user items  
- IBM LE / CICS related special registers and fields (EIB in CICS copybooks)  

Always verify against target dialect docs.

## Product note
Studio “modern view” can render `FUNCTION NUMVAL(WS-X)` as `Number(wsX)`-like pseudocode — but round-trip generation must stay dialect-safe.
