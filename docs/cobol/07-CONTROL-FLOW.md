# Control flow

## IF / ELSE
```cobol
IF WS-AGE >= 18
   DISPLAY "adult"
ELSE
   DISPLAY "minor"
END-IF.
```

Prefer explicit `END-IF` (COBOL-85+) over period-terminated dangling ELSE (74-style footguns).

## EVALUATE (switch)
```cobol
EVALUATE WS-STATUS
   WHEN "A"
      PERFORM PROC-ACTIVE
   WHEN "C"
      PERFORM PROC-CLOSED
   WHEN OTHER
      PERFORM PROC-UNKNOWN
END-EVALUATE.
```

Also: `EVALUATE TRUE` with condition WHENs — common bank pattern.

## PERFORM
| Form | Meaning |
|------|---------|
| `PERFORM para` | Do paragraph/section once |
| `PERFORM para THRU para-2` | Range |
| `PERFORM n TIMES` | Counted loop |
| `PERFORM UNTIL cond` | Pre-test loop |
| `PERFORM WITH TEST AFTER UNTIL` | Do-while style |
| `PERFORM VARYING i FROM 1 BY 1 UNTIL i > n` | Indexed loop |
| `PERFORM para OF section` | Qualification |

Inline `PERFORM … END-PERFORM` (85+) is preferred for new code.

## GO TO
Exists everywhere in old code. **Discourage in generated code.** Explainer should map spaghetti GO TO to structured flow where possible.

## Paragraph vs section
- Paragraph: label for PERFORM  
- Section: group of paragraphs; `PERFORM section` runs all paragraphs in section  

## Ending a program
| Verb | Typical use |
|------|-------------|
| `STOP RUN` | End run unit (main) |
| `GOBACK` | Return to caller (preferred modern style in many shops) |
| `EXIT PROGRAM` | Return from called program |

## Product rules
- Generator: structured `END-*` only; no `ALTER`; no `GO TO` unless user opts in.  
- Explainer: draw CFG (control-flow graph) from PERFORM/IF/EVALUATE first-class.
