# Playground guide

## What you are looking at
A **local bank-shaped sandbox**: editor + compile/run/test + docs.  
COBOL runs via GnuCOBOL on your machine. Real bank prod is never touched.

## Layout
UI direction: JetBrains Fleet–style **islands** on a light canvas + IBM Plex typography (enterprise-readable, not “AI dark glow”).

| Area | Purpose |
|------|---------|
| Brand lockup | Logo mark (column/ledger motif) + COBOL Studio |
| Explorer | Sample programs, copybooks, testdata |
| Editor | Edit COBOL — errors appear **on the line** after Compile |
| Explain | Plain English for the sample |
| Docs | Install, cheatsheet, language pages |
| Console | stdout / stderr / test pass-fail |

## Separate Docs page (simple language)
Open **http://localhost:8787/docs** (or the **Docs** button in the top bar).

Full beginner path in plain words: overview → setup → structure → PIC → verbs → if/loops → strings → tables → files → CALL → FAQ → practice.

Topic list aligns with common COBOL curricula (e.g. [TutorialsPoint COBOL](https://www.tutorialspoint.com/cobol/index.htm)) but **content is original** — we do not copy that site’s text (copyright). Their link appears under **More links**.

## Buttons
- **Doctor** — is `cobc` installed?
- **Compile** — `cobc -x …` ; markers jump to failing lines
- **Run** — compile then execute
- **Test** — run + compare to `expected/interest.out`

## If something breaks
1. Read the red line marker in the editor.
2. Read Console.
3. Open Docs → Cheatsheet / File I/O / Copybooks.
4. Fix locally → Test green → only then think about any later “production” path.

## Mental model
```
Install cobc → Doctor OK → Edit → Compile (line errors) → Run → Test
```
Weak deploy fear goes away because failure is local and obvious.
