# VSAM, QSAM, and datasets

## Why developers get stuck
On laptop, a file is a path. On z/OS, a **dataset** has catalog entries, disposition, space, record format, and often VSAM clusters. COBOL `SELECT/ASSIGN` is only half the story; JCL DD is the other half.

## Access methods (IBM Enterprise COBOL view)
| Method | Role |
|--------|------|
| **QSAM** | Queued sequential access — common sequential files |
| **VSAM** | Clusters for sequential (ESDS), indexed (KSDS), relative (RRDS) |
| **z/OS UNIX files** | Path-based; line sequential friendly |

IBM: “File organization and input-output devices” in Enterprise COBOL docs.

## VSAM cluster types (conceptual)

| Type | COBOL organization | Access |
|------|-------------------|--------|
| ESDS | Sequential | Seq |
| KSDS | Indexed | Seq / random / dynamic via key |
| RRDS | Relative | Via relative record number |

Alternate indexes on KSDS appear in banks for secondary keys.

## Dataset basics (JCL side)
- `DSN=` name  
- `DISP=` (NEW, OLD, SHR, MOD…) — sharing & lifecycle  
- `SPACE=`, `DCB=` / SMS attributes — record length, block, RECFM  
- GDG — versioned generations for batch cycles  

## REWRITE / DELETE rules
Indexed/relative support update patterns; sequential rewrite length rules are strict. Always check FILE STATUS. IBM topics cover replacing records in VSAM files.

## Local fake strategy (Runtime Kit)
Phase 1:
- Use **line sequential** flat files as stand-ins  
- Document field layouts via copybooks  
- Do **not** claim VSAM fidelity  

Later:
- VSAM-like stub with key lookup in a local store  
- Contract tests on record length / key uniqueness  

## Sense signals
- File status ≠ 00 rates  
- Empty input / zero-byte outputs  
- Job elapsed time vs baseline (batch window risk)
