# Modernization patterns (safe change)

Aligned with product vision: **modernize the work layer**, not reckless rewrite.

## Strategies banks actually use

| Strategy | Risk | Our support |
|----------|------|-------------|
| Understand + document | Low | Studio explainer |
| Strangle / wrap with API | Medium | adapters later |
| Incremental refactor + tests | Medium | Pipeline + impact |
| Replatform (MF/cloud COBOL) | Medium–High | dialect adapters |
| Full rewrite in Java/etc. | Highest | out of scope as default pitch |

## Safe change checklist
1. Locate program + copybooks + callers  
2. Impact analysis on field/PIC/LINKAGE  
3. Characterize with tests (golden output / file diffs)  
4. Change in branch  
5. Prove on GnuCOBOL or equivalent sandbox  
6. Promote via gated environments  
7. Watch Sense for blast radius  

## Refactors that are usually safe (with tests)
- Add `END-IF` / structured PERFORM (behavior-preserving)  
- Rename local WS fields (not file/copybook layouts)  
- Extract paragraph to subprogram **with identical LINKAGE**  
- Add logging behind flag  

## Refactors that are high risk
- PIC length / COMP usage changes on shared copybooks  
- REDEFINES overlays  
- COMMAREA / channel contract changes  
- SQL host var type mismatch  
- Truncation option differences across compilers  

## Code → COBOL (Phase 3 feature)
Allowed only for **controlled subsets** with:

- Idiomatic readable COBOL output  
- Generated tests  
- Human review  
- Dialect pin  

Never market as perfect universal transpilation.

## Anti-patterns
- AI chat without runnable proof  
- Big-bang rewrite of core ledger  
- Editing prod copybooks without dependents report  
