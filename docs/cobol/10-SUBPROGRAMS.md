# Subprograms and CALL

## Why banks are CALL-heavy
Business logic is split across hundreds/thousands of programs. Changing a LINKAGE layout can break callers silently.

## CALL
```cobol
CALL "SUBPROG" USING WS-PARAM-1 WS-PARAM-2.
CALL WS-PROG-NAME USING BY REFERENCE WS-REC
                         BY CONTENT WS-LEN
                         BY VALUE WS-FLAG.
```

| Phrase | Meaning |
|--------|---------|
| `BY REFERENCE` | Caller/callee share storage (default often) |
| `BY CONTENT` | Callee gets a copy |
| `BY VALUE` | Pass value (dialect/rules matter) |

Dynamic CALL (variable program name) complicates static impact — Sense/impact must flag dynamic edges as uncertain.

## LINKAGE SECTION
Callee declares parameters in LINKAGE; addresses come from caller / runtime.

```cobol
LINKAGE SECTION.
01 LK-REQUEST.
   05 LK-OP-CODE PIC X.
PROCEDURE DIVISION USING LK-REQUEST.
```

## GOBACK / EXIT PROGRAM / CANCEL
- `GOBACK` — return  
- `CANCEL` — remove resident module (stateful care)  
- Nested programs (2002+) — contained programs with special visibility rules  

## Entry points
`ENTRY` (extensions) and multiple entry patterns appear in estates — treat as first-class in graph later.

## EasyLang v2 → nested COBOL (learner bridge)

Studio Docs teach this with live Run boxes (Subroutines + Easy Mode). Mapping:

| EasyLang | GnuCOBOL |
|----------|----------|
| `def add(a, b):` … `return a + b` | Nested `PROGRAM-ID. ADD IS COMMON PROGRAM.` + `LINKAGE` / `LK-RET` |
| `r = add(3, 2)` | `CALL "ADD" USING … WS-R` |
| `greet("Ali")` (no return) | Nested program + `GOBACK` (no `LK-RET`) |
| `const RATE = 5` | WORKING-STORAGE `VALUE` (pass into functions as args) |

Sample: `samples/bank-playground/src/functions.easy`.  
Ladder honesty: not full Python modules yet — allow-listed `def` only (see [../EASY-MODE.md](../EASY-MODE.md)).

## Product implication
- Dependency graph: `CALL` edges + copybook edges = MVP impact.  
- Risk score ↑ when LINKAGE / copybook length changes.  
- Tests: contract tests on USING parameters.  
- EasyLang v2 feeds the same CALL/LINKAGE story learners will see in estates.
