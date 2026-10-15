# Easy Mode — modern languages → COBOL (step by step)

**Goal:** Write like today’s languages; run **real COBOL** via Runtime Kit.  
Not Day-1 full Python — a **ladder**. Each rung = allow-list + idiomatic COBOL + tests.

## How it works

```
EasyLang (.easy)  →  transpile  →  GnuCOBOL (.cob)  →  Compile / Run / Test
```

Studio toggle: **Easy** | **COBOL**. Docs pages have live **Run** boxes too.

**Four doors (same engine):**
- **Converter** (`/converter`) — EasyLang left → COBOL right → Download pack  
- **Compiler** (`/compiler`) — pure COBOL Compile+Run (no EasyLang)  
- **Playground** (`/`) — full sample estate + Easy/COBOL modes  
- **Docs** (`/docs`) — learner guide with Run boxes

## Learner path (Studio Docs)

Use **Docs** as the guide — not a dump of manuals:

1. **Welcome** → first Run  
2. **Easy Mode** → v0 / v1 try boxes  
3. **Loops** → `while` / `for`  
4. **Functions (def)** → Steps 1→6 one idea each (`def` → params → `return` → `const`)  
5. **Files (EasyLang)** → `open` / `write` / `read` / `close` / `assert` / `import` / `load_table` / `try`  
6. **Records (bank shape)** → `record Account:` / `acct.field` → COBOL group items  
7. **Adapters (stubs)** → typed `def` + `stub_sql` / `stub_http` / `stub_load`  
8. **Subroutines (CALL)** → bank COBOL words + Show COBOL  
9. **Practice** → Playground: `interest`, `functions`, `fileio`, `loadtable`, `account`, `adapters` .easy  

Deep engineer notes stay in [`docs/cobol/`](./cobol/README.md). Learners stay in the app Docs until comfortable.

## Ladder

### v0 — Basics (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| Comment | `# ...` | `*>` |
| Variable | `x = 1` / `s = "hi"` | WORKING-STORAGE + MOVE |
| Math | `+ - * /` | `COMPUTE` |
| Print | `print(...)` | `DISPLAY` |
| If / else | `if` / `else` | `IF` / `ELSE` / `END-IF` |
| Stop | `stop` | `STOP RUN` |

### v1 — Control + tables (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| While | `while cond:` | `PERFORM UNTIL NOT (cond)` |
| For-range | `for i in range(n):` / `range(a, b)` | `PERFORM VARYING` |
| Booleans | `and` / `or` / `not` | `AND` / `OR` / `NOT` |
| Fixed list | `scores = [10, 20, 30]` | `OCCURS` table |
| Index | `scores[0]`, `scores[i] = 9` | 0-based Easy → 1-based COBOL |
| String concat | `a + " " + b` | `FUNCTION CONCATENATE` + `TRIM` |

### v2 — Structure (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| Function | `def add(a, b):` … `return a + b` | Nested `PROGRAM-ID … IS COMMON` + `CALL … USING` |
| Call | `r = add(3, 2)` / `greet("Ali")` | Linkage params + optional `LK-RET` |
| Const | `const RATE = 5` | WORKING-STORAGE with VALUE + MOVE |

### v3 — I/O + assert + import (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| Open write/read | `f = open("x.txt", "w"\|"r")` | `OPEN OUTPUT/INPUT` + line-sequential SELECT |
| Write line | `write(f, value)` | `WRITE` record |
| Read line | `line = read(f)` | `READ … INTO` + AT END |
| Close | `close(f)` | `CLOSE` |
| Status | (automatic) | `FILE STATUS` check after I/O |
| Assert | `assert x = 5` | `IF NOT (…) DISPLAY … STOP RUN` |
| Import defs | `import mathlib` | merge `mathlib.easy` defs → nested CALL |
| Load CSV lines | `rows = load_table("rates.csv")` | line-seq READ into `OCCURS` (max 20) |
| Try / raise | `try:` / `except:` / `raise "msg"` | flag + `GO TO` end / else `STOP RUN` |

Sample: `src/loadtable.easy` + `rates.csv`.

### v4 — Bank-shaped records (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| Record type | `record Account:` + `id: str` / `balance: num` | `01` group + `05` fields (PIC X / S9V99) |
| Create | `acct = Account()` | `INITIALIZE` group |
| Field set | `acct.balance = 1250` | `MOVE` / `COMPUTE` to `05` item |
| Field get | `print(acct.id)` / math on `acct.balance` | use field name in DISPLAY / COMPUTE |
| Import types | `import accttypes` (record + def only) | merge into caller |

**Honesty:** this is the bank *data shape* rung — not real Db2/CICS/HTTP yet.

### v5 — Typed contracts + stub adapters (shipped)
| Modern idea | EasyLang | COBOL |
|-------------|----------|--------|
| Typed params | `def f(a: num, b: num) -> num:` | LINKAGE PIC from types |
| Stub SQL field | `stub_sql("balance", "ACCT0001")` | `MOVE` demo value + `*> STUB SQL` |
| Stub HTTP | `stub_http("/rates/default")` | `MOVE` demo rate + `*> STUB HTTP` |
| Stub load record | `stub_load(acct, "ACCT0001")` | fill `05` fields from demo table |

Demo accounts: `ACCT0001`, `ACCT0002`. **Not real Db2/network.** Phase 3 replaces stubs with connectors.

### v6 — Real enterprise connectors (later)
IBM / Micro Focus adapters, live SQL/HTTP, Control Plane approvals.

## Commands

```bash
npm run easy:build -- samples/bank-playground/src/interest.easy
npm run easy:test
```

## Honesty
Unsupported syntax → **diagnostics**, no silent wrong COBOL.  
Expand only by ladder rung + proof.
