# Interest sample — plain English

## Easy Mode (recommended)
Open `src/interest.easy` — Python-easy syntax. Studio **Generate**s real COBOL, then **Run** / **Test**.

```
balance = 1250.00
interest = balance * rate / 100
print("INTEREST=", interest)
```

Ladder (loops, files, functions): see Docs → Easy Mode.

## What the COBOL does
1. (File-based classic path) Opens fake account file — or EasyLang v0 uses explicit values.
2. Calculates simple interest: `balance * rate / 100`.
3. Prints balance, interest, and new balance.
4. Stops. No real bank, no network, no prod data.

## Why it looks “bank-like”
- Uses a **copybook** (`acctrec.cpy`) for the shared record layout.
- Checks **FILE STATUS** when opening the file.
- Uses a **line-sequential** file like a simple batch input.

## Safe playground rules
- Change code freely here.
- If something breaks, only this laptop sandbox fails — not a real bank.
- Run **Test** after edits. Red = fix locally before any “production” talk.

## Try next
- Change the rate in `testdata/accounts.in` and re-run.
- Change a field length in `acctrec.cpy` and see compile/read break (impact lesson).
