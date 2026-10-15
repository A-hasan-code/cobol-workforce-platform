# Program structure

## Compilation unit shape
A classic COBOL program has **four divisions** (order matters):

```cobol
IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO.

ENVIRONMENT DIVISION.
CONFIGURATION SECTION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.

DATA DIVISION.
FILE SECTION.
WORKING-STORAGE SECTION.
LOCAL-STORAGE SECTION.
LINKAGE SECTION.

PROCEDURE DIVISION.
    DISPLAY "Hello".
    STOP RUN.
```

| Division | Job |
|----------|-----|
| **IDENTIFICATION** | Program name (`PROGRAM-ID`), metadata |
| **ENVIRONMENT** | Machine / file bindings (`SELECT` … `ASSIGN`) |
| **DATA** | Variables, records, file descriptions |
| **PROCEDURE** | Executable logic |

Beginner / many GnuCOBOL samples leave ENVIRONMENT nearly empty when no files are used.

## Hierarchy inside PROCEDURE DIVISION
- **Sections** (optional named blocks)  
- **Paragraphs** (named entry points for `PERFORM`)  
- **Sentences** (one or more statements ending with `.`)  
- **Statements** (`MOVE`, `IF`, `PERFORM`, …)  

## Nested programs / OO (newer standards)
COBOL-2002+ adds nested programs and object-oriented features. Bank batch code often still looks procedural 85-style. Studio should explain both, generate procedural first.

## Run unit concept
A **run unit** is one or more programs activated together (main + called subprograms). `CALL` / `CANCEL` / `STOP RUN` / `GOBACK` control life cycle (details in [10-SUBPROGRAMS](./10-SUBPROGRAMS.md)).

## Minimal mental model for Studio
```
PROGRAM-ID
  → data items (WORKING-STORAGE / LINKAGE)
  → paragraphs of logic
  → optional files / SQL / CICS APIs
```
