# Copybooks (COPY)

Copybooks are the **shared contract** of bank estates. Missing copybook graphs = missing impact analysis.

## COPY statement
```cobol
COPY CUSTREC.
COPY CUSTREC REPLACING ==CUST-== BY ==EMP-==.
```

- Preprocessor/compiler inserts library text in place of `COPY … .`  
- Nested COPY allowed (with rules about REPLACING chains)  
- Library search path is compiler-specific (`SYSLIB` DD on z/OS; `-I` on GnuCOBOL)

Official IBM topic: COPY statement in Enterprise COBOL Language Reference / Docs.

## What lives in copybooks
- Record layouts (`01` groups)  
- Shared constants / 88-levels  
- SQL INCLUDE members (`EXEC SQL INCLUDE …`) in Db2 shops  
- Sometimes procedure snippets (less ideal, still happens)

## Naming & physical files
| World | Typical |
|-------|---------|
| z/OS | Members in PDS/PDSE libraries |
| GnuCOBOL | `.cpy` / `.cbl` / no extension — controlled by `-ext` / search path |
| MF | Project copybook paths / directives |

## REPLACING
Textual substitution at copy time — powerful and dangerous. Impact engine must expand REPLACING to know real field names.

## Product data model
```
Program --uses--> Copybook --defines--> Fields
Program --uses--> Copybook (REPLACING map)
```

Phase 1 stubs should already include `programs[]`, `copybooks[]`, `dependencies[]` even if UI is tiny.

## Explainer UX
- “Show expanded source” (after COPY)  
- “Where is this field defined?” → jump to copybook  
- “Who includes this copybook?” → reverse dependents  
