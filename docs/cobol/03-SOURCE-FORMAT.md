# Source format

## Fixed format (classic / mainframe default)
Historically punched-card columns:

| Columns | Name | Use |
|---------|------|-----|
| 1–6 | Sequence | Often ignored today; line numbers historically |
| 7 | Indicator | `*` or `/` comment; `-` continuation; `D` debugging line |
| 8–11 | Area A | Division/section/paragraph names, level 01/77, `FD` |
| 12–72 | Area B | Statements, level 02–49 items |
| 73–80 | Identification | Often unused / ignored |

**Period (`.`)** ends sentences — missing period is a top beginner (and bank) bug class.

## Free format
Modern compilers (GnuCOBOL, newer IBM options) support freer layout. Indicators and Area A/B rules relax. Still: many bank repos are fixed-format.

## Comments
- Fixed: `*` in column 7  
- Inline comments: many dialects support `*>` (check dialect)  
- Never put executable code in comment columns by accident  

## Case and reserved words
COBOL is historically case-insensitive for keywords. Style in banks: often **UPPERCASE keywords**, mixed user names. Our generator should pick one house style and stick to it (recommend: uppercase verbs, readable data names).

## Line continuation
Long literals/strings may need continuation rules (indicator `-` in fixed format). Prefer shorter lines in generated code for readability.

## Product implication
- Studio must show **column ruler** for fixed-format files.  
- Explainer should flag Area A/B mistakes.  
- Runtime Kit default samples: free or fixed — document which; GnuCOBOL accepts both with flags.
