# GnuCOBOL (Phase 1 runtime)

Official hub: https://gnucobol.sourceforge.io/guides.html  
Manual: https://gnucobol.sourceforge.io/doc/gnucobol.html  
Programmer’s Guide: https://gnucobol.sourceforge.io/HTML/gnucobpg.html  
FAQ: https://gnucobol.sourceforge.io/faq/gcfaq.html  

## What it is
Free COBOL compiler (`cobc`) that translates COBOL → C → native binary/module. Best **local-first** target for Runtime Kit and student demos.

## Install (typical)
```bash
# Debian/Ubuntu
sudo apt install gnucobol

# Verify
cobc --version
```

Windows: community MinGW builds / package managers — document exact path in Runtime Kit README when scaffold lands (Arnold Trembley / FAQ resources).

## Compile & run mental model
```
hello.cob  →  cobc  →  executable/module  →  run
```

### Common cobc flags
| Flag | Meaning |
|------|---------|
| `-x` | Build executable (main included) |
| `-m` | Dynamically loadable module (default often) |
| `-b` | Combine into one module |
| `-o name` | Output name |
| `-I dir` | Copybook search path |
| `-E` | Preprocess only (COPY expanded) |
| `-C` | Translate to C only |
| `-free` / `-fixed` | Source format |
| `-std=dialect` | Dialect profile |
| `-j` / `-job` | Run after compile |
| `-Wall` / warnings | Quality gates |

Examples:
```bash
cobc -x hello.cob -o hello
./hello

cobc -x -free prog.cob -I ./copybooks -o prog
```

Modules may use `cobcrun` depending on build mode — see official manual.

## Dialects
GnuCOBOL supports multiple `-std` profiles (IBM-ish, MF-ish, COBOL85, etc.). List with compiler help / FAQ (“What dialects are supported?”).  
**Platform rule:** pin a dialect in `cobol.toml` per project.

## Copybooks
```bash
cobc -x main.cob -I ./cpy -o main
```
Extensions controlled via options (`-ext`) — see FAQ.

## Runtime environment variables
Programmer’s Guide documents compile/runtime env vars (library paths, file assign mapping). Runtime Kit should wrap these so developers don’t memorize them Day 1.

## Testing approach for our kit
1. Sample program with known output  
2. `cobc -x` compile in CI  
3. Run + compare stdout / return code  
4. Fail CI on non-zero or mismatch  

## Limits vs IBM mainframe
GnuCOBOL is **not** a full z/OS substitute (no real CICS/Db2/JCL). Use it for:

- Learn / explain / unit-style logic  
- Portable business rules without mainframe  
- CI smoke tests  

IBM/MF adapters come in Phase 3.

## Product ownership
Runtime Kit owns: install docs, `cobol.toml`, scripts `compile`/`run`/`test`, CI workflow, dialect pin.
