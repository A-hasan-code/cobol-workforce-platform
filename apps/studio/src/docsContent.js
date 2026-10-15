/**
 * COBOL Studio Docs — original beginner lessons.
 * Topic outline inspired by common COBOL curricula (e.g. TutorialsPoint TOC).
 * We do NOT copy third-party tutorial text (copyright). External links are references only.
 */

export const DOCS_SECTIONS = [
  { id: "welcome", nav: "Welcome" },
  { id: "studio", nav: "What we are building" },
  { id: "lab", nav: "Converter · Compiler · Lab" },
  { id: "easy", nav: "Easy Mode" },
  { id: "overview", nav: "COBOL overview" },
  { id: "setup", nav: "Environment setup" },
  { id: "structure", nav: "Program structure" },
  { id: "syntax", nav: "Basic syntax" },
  { id: "datatypes", nav: "Data types (PIC)" },
  { id: "verbs", nav: "Basic verbs" },
  { id: "layout", nav: "Data layout" },
  { id: "conditions", nav: "If / Evaluate" },
  { id: "loops", nav: "Loops (PERFORM)" },
  { id: "strings", nav: "String handling" },
  { id: "tables", nav: "Tables (OCCURS)" },
  { id: "functions", nav: "Functions (def)" },
  { id: "easyfiles", nav: "Files (EasyLang)" },
  { id: "records", nav: "Records (bank shape)" },
  { id: "adapters", nav: "Adapters (stubs)" },
  { id: "files", nav: "File handling" },
  { id: "file-org", nav: "File organization" },
  { id: "file-access", nav: "File access mode" },
  { id: "file-verbs", nav: "File verbs" },
  { id: "subroutines", nav: "Subroutines (CALL)" },
  { id: "sort", nav: "Sort (idea)" },
  { id: "database", nav: "Database (idea)" },
  { id: "faq", nav: "Easy FAQ" },
  { id: "quick", nav: "Quick guide" },
  { id: "practice", nav: "Practice here" },
  { id: "references", nav: "More links" },
];

function section(title, blocks) {
  return { title, blocks };
}

/** Live Run box — EasyLang (default) or COBOL */
function tryEasy(title, easy, note) {
  return {
    type: "try",
    mode: "easy",
    title,
    easy,
    note,
    programId: "DOCTRY",
  };
}

function tryCobol(title, cobol, note) {
  return {
    type: "try",
    mode: "cobol",
    title,
    cobol,
    note,
    programId: "DOCTRY",
  };
}

export function renderSection(id) {
  switch (id) {
    case "welcome":
      return section("Hello — learn and try COBOL here", [
        {
          type: "lead",
          text: "Short words. Real examples. Every important topic has a live Run box that uses your local GnuCOBOL compiler — change the code, press Run, see output.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Two ways to write",
          text: "Easy Mode = Python-style EasyLang (print, if, while, def…). COBOL Mode = classic COBOL. Both compile to real GnuCOBOL behind the scenes.",
        },
        tryEasy(
          "Your first Run (EasyLang)",
          `msg = "HELLO FROM DOCS"
print(msg)
`,
          "Edit the message, press Run. This does not touch the bank sample file."
        ),
        {
          type: "steps",
          title: "Suggested order",
          items: [
            "What we are building → Easy Mode",
            "Environment setup (once)",
            "Converter · Compiler · Lab (Easy → COBOL door)",
            "Functions → Files → Records → Adapters → Practice",
            "Playground samples: interest, functions, fileio, loadtable, account, adapters",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "About other websites",
          text: "We teach in our own words. We do not copy other sites’ lessons. Links at the end are extra reading only.",
        },
      ]);

    case "studio":
      return section("What we are building", [
        {
          type: "lead",
          text: "COBOL Workforce Platform — make more developers able to work on COBOL safely, without rewriting bank systems overnight.",
        },
        {
          type: "cards",
          items: [
            {
              title: "Studio",
              text: "Editor, Easy Mode, Docs with live Run, Estate ghosts/impact.",
            },
            {
              title: "Runtime Kit",
              text: "Local GnuCOBOL: doctor / compile / run / test + cobol.toml.",
            },
            {
              title: "EasyLang ladder",
              text: "v0→v5 shipped: basics → loops → def → files → records → stub SQL/HTTP adapters. Each rung has Docs steps + Run.",
            },
            {
              title: "Converter",
              text: "/converter — EasyLang left → COBOL right → Run / Download pack.",
            },
            {
              title: "Compiler",
              text: "/compiler — pure COBOL Compile+Run. No EasyLang.",
            },
            {
              title: "Later",
              text: "Pipeline gates, Control Plane, Sense, real bank connectors (approved).",
            },
          ],
        },
        {
          type: "bullets",
          items: [
            "Converter — EasyLang in → COBOL out (what most learners want first)",
            "Playground — Easy or COBOL, Generate, Run, Test, Download pack",
            "Compiler — paste COBOL only, no EasyLang",
            "Docs — lessons + live Run boxes",
            "Estate — ghosts, impact, business rules, safe refactors, risk ack",
            "Not a real bank — lab / sandbox only",
          ],
        },
        {
          type: "analogy",
          title: "Training wheels",
          text: "A real bank is a busy highway. This Studio is a quiet park path. You can fall here; production stays safe.",
        },
        tryEasy(
          "Smoke test your toolchain",
          `a = 2
b = 3
c = a + b
print("2+3=", c)
`,
          "If Run fails with cobc missing, open Environment setup."
        ),
      ]);

    case "lab":
      return section("Converter · Compiler · Lab", [
        {
          type: "lead",
          text: "One engine (Runtime Kit + GnuCOBOL). Clear doors: write EasyLang → get COBOL, or paste COBOL only, or use the full Playground.",
        },
        {
          type: "cards",
          items: [
            {
              title: "Converter (Easy → COBOL)",
              text: "Top nav → Converter. Left EasyLang, right COBOL. Convert → Run → Download pack.",
            },
            {
              title: "Compiler (COBOL only)",
              text: "/compiler — paste COBOL → Compile + Run. No EasyLang.",
            },
            {
              title: "Playground",
              text: "Full sample estate, files, Easy/COBOL modes, Estate, Test.",
            },
          ],
        },
        {
          type: "steps",
          title: "Converter — what you asked for",
          items: [
            "Open Converter (top nav)",
            "Write EasyLang on the left",
            "Click Convert — COBOL appears on the right",
            "Convert + Run to prove it",
            "Download COBOL pack — ZIP for the bank developer",
          ],
        },
        tryEasy(
          "Same EasyLang (Docs try)",
          `msg = "READY FOR CONVERT"
print(msg)
`,
          "For side-by-side converter UI: top nav → Converter."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Remember",
          text: "Converter = Easy → COBOL. Compiler = COBOL only.",
        },
      ]);

    case "easy":
      return section("Easy Mode — write like Python, run COBOL", [
        {
          type: "lead",
          text: "EasyLang is a small modern language. You write short familiar code. Studio generates idiomatic GnuCOBOL and runs it with cobc.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Ladder v0→v5 (all in Docs)",
          text: "v0 basics · v1 loops/lists · v2 def · v3 files/assert/import · v4 records · v5 typed def + stub_sql/stub_http/stub_load. Open each nav page — every step has a Run box.",
        },
        {
          type: "steps",
          title: "In the Playground",
          items: [
            "Toggle Easy (top bar)",
            "Try interest.easy, functions.easy, fileio.easy, loadtable.easy, account.easy, adapters.easy",
            "Generate or just Run (auto-generates)",
            "Always click Show COBOL after Run",
          ],
        },
        {
          type: "bullets",
          items: [
            "Functions (def) — step-by-step functions",
            "Files (EasyLang) — open/write/read/close/assert/import/load_table/try",
            "Records (bank shape) — record Account / fields",
            "Adapters (stubs) — stub_sql / stub_http / typed def (not real Db2 yet)",
          ],
        },
        tryEasy(
          "Interest math (EasyLang)",
          `balance = 1250.00
rate = 5.00
interest = balance * rate / 100
new_bal = balance + interest
print("BALANCE=", balance)
print("INTEREST=", interest)
print("NEW_BAL=", new_bal)
`,
          "Same idea as the bank playground sample. Press Show COBOL after Run to see generated code."
        ),
        tryEasy(
          "If / else",
          `age = 20
if age >= 18:
    print("adult")
else:
    print("minor")
`,
          "Indent with 4 spaces under if/else."
        ),
        tryEasy(
          "v1 — for + list",
          `scores = [10, 20, 30]
for i in range(3):
    print("score", scores[i])
`,
          "Lists are 0-based in EasyLang; COBOL OCCURS is 1-based underneath."
        ),
        tryEasy(
          "v1 — while + and",
          `i = 1
while i <= 3:
    if i = 2 or i = 3:
        print("hit", i)
    i = i + 1
`,
          "while → PERFORM UNTIL NOT (...)."
        ),
        tryEasy(
          "v1 — string concat",
          `first = "Ali"
last = "Hasan"
full = first + " " + last
print(full)
`,
          "Uses FUNCTION CONCATENATE in generated COBOL."
        ),
        tryEasy(
          "v2 — def + return (also on Functions page)",
          `def add(a, b):
    return a + b

print(add(3, 2))
`,
          "Full lesson: sidebar → Functions (def)."
        ),
        tryEasy(
          "v3 — file write/read (also on Files page)",
          `f = open("easydemo.txt", "w")
write(f, "from-easy-mode")
close(f)
f = open("easydemo.txt", "r")
line = read(f)
close(f)
print(line)
`,
          "Full lesson: sidebar → Files (EasyLang)."
        ),
        tryEasy(
          "v4 — record (also on Records page)",
          `record Account:
    id: str
    balance: num

acct = Account()
acct.id = "ACCT0001"
acct.balance = 100
print(acct.id)
print(acct.balance)
`,
          "Full lesson: sidebar → Records (bank shape)."
        ),
        tryEasy(
          "v5 — stub_sql (also on Adapters page)",
          `bal = stub_sql("balance", "ACCT0001")
name = stub_sql("name", "ACCT0001")
print(name)
print(bal)
`,
          "Local stub — NOT real Db2. Full lesson: sidebar → Adapters (stubs)."
        ),
        {
          type: "callout",
          tone: "accent",
          title: "Full ladder",
          text: "Open each sidebar lesson (Functions, Files, Records, Adapters). Repo notes: docs/EASY-MODE.md.",
        },
      ]);

    case "overview":
      return section("COBOL overview", [
        {
          type: "lead",
          text: "COBOL means Common Business-Oriented Language. People built it so computers could do everyday business work — money, names, reports — with words that look a bit like English.",
        },
        {
          type: "cards",
          items: [
            {
              title: "Born for business",
              text: "It is great at reading records, doing careful number work, and writing results to files or screens.",
            },
            {
              title: "Still used today",
              text: "Banks, insurance, and governments still run a lot of COBOL. That is why learning it still matters.",
            },
            {
              title: "Not for building an operating system",
              text: "COBOL is for application programs (business jobs), not for writing the computer’s core system software.",
            },
          ],
        },
        {
          type: "bullets",
          items: [
            "Readable style — verbs like DISPLAY, MOVE, ADD",
            "Strong file and data handling",
            "Runs on mainframes and also on PCs with tools like GnuCOBOL",
            "Can work with modern systems later (APIs, databases) through adapters and shops’ tools",
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Do you need experience?",
          text: "Helpful, but not required. If you know any programming, you will move faster. If not, start here anyway.",
        },
      ]);

    case "setup":
      return section("Environment setup", [
        {
          type: "p",
          text: "To practice here you need two tools once.",
        },
        {
          type: "cards",
          items: [
            {
              title: "Node.js",
              text: "Runs COBOL Studio (the website on your laptop).",
            },
            {
              title: "GnuCOBOL (cobc)",
              text: "Free compiler. Turns COBOL text into a program your computer can run.",
            },
          ],
        },
        {
          type: "steps",
          title: "Windows",
          items: [
            "Install Node.js 20+ from nodejs.org",
            "Install GnuCOBOL so cobc works in a new terminal",
            "In this project: npm install",
            "npm run doctor  → should say GnuCOBOL OK",
            "npm run studio  → open the printed link",
          ],
        },
        {
          type: "steps",
          title: "Mac",
          items: [
            "Install Node.js",
            "brew install gnucobol",
            "npm install && npm run doctor && npm run studio",
          ],
        },
        {
          type: "steps",
          title: "Linux (Ubuntu/Debian)",
          items: [
            "sudo apt update && sudo apt install -y gnucobol",
            "npm install && npm run doctor && npm run studio",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Doctor says cobc missing?",
          text: "Windows (no Admin): powershell -ExecutionPolicy Bypass -File scripts\\setup-gnucobol-windows.ps1 — installs portable GnuCOBOL into tools/gnucobol/dist. Then Doctor again. Docs Run boxes need cobc too.",
        },
        tryEasy(
          "Check compiler from Docs",
          `print("cobc is ready if you see this")
`,
          "If this fails, finish setup above first."
        ),
      ]);

    case "structure":
      return section("Program structure — four big rooms", [
        {
          type: "lead",
          text: "Almost every COBOL program has four divisions. Think of four rooms in a house. You visit them in order.",
        },
        {
          type: "cards",
          items: [
            {
              title: "1) IDENTIFICATION",
              text: "Name tag. PROGRAM-ID says the program’s name.",
            },
            {
              title: "2) ENVIRONMENT",
              text: "How this program connects to the outside world — often files.",
            },
            {
              title: "3) DATA",
              text: "Boxes for information — numbers, names, records, file layouts.",
            },
            {
              title: "4) PROCEDURE",
              text: "The actions — the real work steps.",
            },
          ],
        },
        {
          type: "mini",
          title: "Tiny skeleton",
          code: `IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NAME PIC X(10) VALUE "Ali".
PROCEDURE DIVISION.
    DISPLAY "Hello " WS-NAME
    STOP RUN.`,
          note: "Room 2 (ENVIRONMENT) can be empty when you have no files yet.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Functions = extra PROGRAM-ID rooms",
          text: "EasyLang v2 def becomes a nested program inside the same source (PROGRAM-ID … IS COMMON). See Subroutines when you are ready.",
        },
        tryEasy(
          "Same idea in EasyLang",
          `name = "Ali"
print("Hello ", name)
`,
          "Easy Mode fills IDENTIFICATION / DATA / PROCEDURE for you."
        ),
        tryCobol(
          "Same idea in COBOL (live)",
          `IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NAME PIC X(10) VALUE "Ali".
PROCEDURE DIVISION.
    DISPLAY "Hello " WS-NAME
    STOP RUN.
`,
          "Edit WS-NAME and Run again."
        ),
      ]);

    case "syntax":
      return section("Basic syntax rules", [
        {
          type: "p",
          text: "COBOL is picky about small marks. That is okay — the compiler will tell you.",
        },
        {
          type: "bullets",
          items: [
            "A period (.) often ends a sentence. Missing periods cause many errors.",
            "Keywords are usually written in CAPITALS in bank code (not always required).",
            "Names you invent should be clear: WS-BALANCE, ACCT-ID.",
            "Old “fixed” format uses columns (Area A / Area B). Our sample uses free format for learning.",
            "Comments can start with *> in free format (EasyLang uses #).",
          ],
        },
        {
          type: "analogy",
          title: "Like school notebook rules",
          text: "Teachers care about full stops. COBOL does too. Put the period where the thought ends.",
        },
        tryEasy(
          "Comments + print",
          `# This is a comment
print("syntax ok")
`,
          "Break it on purpose (remove a quote) and see the error."
        ),
      ]);

    case "datatypes":
      return section("Data types — the PIC picture", [
        {
          type: "lead",
          text: "In COBOL you draw a picture of each box with PIC (or PICTURE). The picture says what fits inside. EasyLang picks PIC for you from how you assign values.",
        },
        {
          type: "glossary",
          items: [
            {
              term: "PIC X(n)",
              def: "Letters and characters. PIC X(10) = up to 10 characters.",
            },
            {
              term: "PIC 9(n)",
              def: "Digits only. PIC 9(3) = up to 3 digits (like 025).",
            },
            {
              term: "PIC S9(n)",
              def: "Signed number — can be negative.",
            },
            {
              term: "V",
              def: "Assumed decimal point. PIC 9(5)V99 = money-style with two decimals.",
            },
            {
              term: "VALUE",
              def: "Starting value in the box when the program begins (for working storage).",
            },
          ],
        },
        {
          type: "mini",
          title: "COBOL examples",
          code: `01 WS-NAME    PIC X(20).
01 WS-AGE     PIC 9(3) VALUE 0.
01 WS-BALANCE PIC S9(7)V99.`,
          note: "Edited pictures (like ZZZ9.99) are for pretty printing, not usually for hard math.",
        },
        tryEasy(
          "String vs number",
          `name = "Ali"
age = 21
balance = 100.50
print("NAME=", name)
print("AGE=", age)
print("BAL=", balance)
`,
          "Change the numbers and Run. EasyLang maps strings → PIC X, numbers → PIC S9…V99."
        ),
      ]);

    case "verbs":
      return section("Basic verbs — action words", [
        {
          type: "p",
          text: "Verbs tell the computer what to do. EasyLang print → DISPLAY, = → MOVE/COMPUTE, def/return → CALL / GOBACK.",
        },
        {
          type: "glossary",
          items: [
            { term: "MOVE", def: "Copy a value into a box. MOVE 10 TO WS-AGE." },
            { term: "DISPLAY", def: "Show something on the screen/console." },
            { term: "ACCEPT", def: "Read simple input (not always allowed in every bank environment)." },
            { term: "ADD / SUBTRACT / MULTIPLY / DIVIDE", def: "Classic math verbs." },
            { term: "COMPUTE", def: "Math with a formula: COMPUTE X = A + B." },
            { term: "CALL", def: "Run another program (EasyLang: calling a def)." },
            { term: "INITIALIZE", def: "Reset boxes to safe empty/zero defaults." },
            { term: "STOP RUN", def: "End the whole run (main program)." },
            { term: "GOBACK", def: "Return to the caller — used inside EasyLang functions." },
          ],
        },
        tryEasy(
          "MOVE + COMPUTE via EasyLang",
          `price = 40
qty = 3
total = price * qty
print("TOTAL=", total)
`,
          "After Run, click Show COBOL to see COMPUTE."
        ),
        tryEasy(
          "CALL / GOBACK via EasyLang def",
          `def double(n):
    return n * 2

print(double(21))
`,
          "Show COBOL: CALL \"DOUBLE\" … and GOBACK inside the nested program."
        ),
        {
          type: "callout",
          tone: "accent",
          title: "Money tip",
          text: "For important math, think about ON SIZE ERROR — “what if the number is too big for the box?”",
        },
      ]);

    case "layout":
      return section("Data layout — groups and levels", [
        {
          type: "p",
          text: "Data can be a single box or a group of boxes (like a form). EasyLang record → this COBOL shape.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Learn records first",
          text: "Docs → Records (bank shape) teaches the EasyLang side. This page is the COBOL vocabulary (01 / 05).",
        },
        {
          type: "mini",
          title: "Group example",
          code: `01 WS-CUSTOMER.
   05 WS-ID    PIC X(8).
   05 WS-NAME  PIC X(20).
   05 WS-CITY  PIC X(15).`,
          note: "01 is the whole form. 05 lines are fields inside it.",
        },
        tryEasy(
          "Same idea in EasyLang record",
          `record Customer:
    id: str
    name: str

c = Customer()
c.id = "C001"
c.name = "Ali"
print(c.id)
print(c.name)
`,
          "Show COBOL — compare to the 01 / 05 mini above."
        ),
        {
          type: "bullets",
          items: [
            "Level numbers (01, 05, 10…) show nesting.",
            "88-levels are nicknames for values (flags): easier IF checks.",
            "REDEFINES means two views of the same memory — powerful and dangerous.",
            "FILLER is padding space with no useful name.",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Copybooks",
          text: "Shared layouts often live in copybooks. Change one shared form and many programs may feel it. Practice that carefully in the playground.",
        },
      ]);

    case "conditions":
      return section("Conditional statements — choices", [
        {
          type: "p",
          text: "Sometimes the program must choose. COBOL uses IF and EVALUATE.",
        },
        {
          type: "mini",
          title: "IF (COBOL)",
          code: `IF WS-AGE >= 18
   DISPLAY "adult"
ELSE
   DISPLAY "minor"
END-IF.`,
          note: "Prefer END-IF. It is clearer than old period-only style.",
        },
        tryEasy(
          "Try IF live",
          `score = 72
if score >= 50:
    print("pass")
else:
    print("retry")
`,
          "Change score to 40 and Run again."
        ),
        {
          type: "mini",
          title: "EVALUATE (like a switch)",
          code: `EVALUATE WS-STATUS
   WHEN "A"
      DISPLAY "active"
   WHEN "C"
      DISPLAY "closed"
   WHEN OTHER
      DISPLAY "unknown"
END-EVALUATE.`,
          note: "EVALUATE is COBOL Mode for now (EasyLang v0 uses if/else). Coming on the ladder.",
        },
      ]);

    case "loops":
      return section("Loops — PERFORM / EasyLang while & for", [
        {
          type: "lead",
          text: "PERFORM means “go do that work.” EasyLang v1 gives you while and for-range; Studio generates PERFORM UNTIL / VARYING.",
        },
        {
          type: "glossary",
          items: [
            {
              term: "PERFORM para",
              def: "Run a named paragraph once.",
            },
            {
              term: "PERFORM n TIMES",
              def: "Repeat n times.",
            },
            {
              term: "PERFORM UNTIL …",
              def: "Keep going until a condition is true (EasyLang while).",
            },
            {
              term: "PERFORM VARYING …",
              def: "Loop with a counter (EasyLang for i in range).",
            },
            {
              term: "Inline PERFORM … END-PERFORM",
              def: "Loop without jumping far away — nice for new code.",
            },
          ],
        },
        tryEasy(
          "EasyLang for-range",
          `for i in range(1, 4):
    print("tick", i)
`,
          "range(1, 4) → i = 1, 2, 3."
        ),
        tryEasy(
          "EasyLang while",
          `n = 3
while n > 0:
    print("n=", n)
    n = n - 1
`,
          "Stops when the condition is no longer true."
        ),
        tryCobol(
          "PERFORM TIMES (raw COBOL)",
          `IDENTIFICATION DIVISION.
PROGRAM-ID. LOOPY.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-I PIC 9 VALUE 0.
PROCEDURE DIVISION.
    PERFORM 3 TIMES
       ADD 1 TO WS-I
       DISPLAY "tick " WS-I
    END-PERFORM
    STOP RUN.
`,
          "Change 3 TIMES to 5 and Run."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "GO TO?",
          text: "Old code uses GO TO a lot. For new learning, prefer PERFORM and clear IF/EVALUATE. Spaghetti jumps are hard to read.",
        },
      ]);

    case "strings":
      return section("String handling", [
        {
          type: "p",
          text: "Business data is full of text: names, ids, messages.",
        },
        {
          type: "glossary",
          items: [
            {
              term: "STRING",
              def: "Glue pieces of text together into one box.",
            },
            {
              term: "UNSTRING",
              def: "Split one text into pieces.",
            },
            {
              term: "INSPECT",
              def: "Count, replace, or convert characters.",
            },
            {
              term: "Reference modification",
              def: "Take a slice: WS-NAME(1:4) means first 4 characters.",
            },
            {
              term: "FUNCTION TRIM / NUMVAL",
              def: "Helpers — trim spaces, turn text into a number (when your compiler supports them).",
            },
          ],
        },
        tryEasy(
          "Print several pieces",
          `first = "Ali"
last = "Hasan"
print("Hello ", first, " ", last)
`,
          "EasyLang print joins args like DISPLAY with many items."
        ),
        {
          type: "p",
          text: "Our interest sample uses FUNCTION NUMVAL and TRIM so file text becomes numbers cleanly.",
        },
      ]);

    case "tables":
      return section("Table processing — OCCURS", [
        {
          type: "p",
          text: "A table is many slots of the same shape — like a list of 100 rates.",
        },
        {
          type: "mini",
          title: "OCCURS",
          code: `01 WS-TABLE.
   05 WS-RATE OCCURS 10 TIMES PIC 9(2)V9.`,
          note: "Then you loop with PERFORM VARYING I FROM 1 BY 1 UNTIL I > 10.",
        },
        tryEasy(
          "EasyLang list → OCCURS",
          `rates = [5, 6, 7]
for i in range(3):
    print("rate", rates[i])
rates[1] = 9
print("updated", rates[1])
`,
          "Fixed-length lists only in v1. Show COBOL after Run to see OCCURS."
        ),
        {
          type: "bullets",
          items: [
            "SEARCH / SEARCH ALL can find items (ALL needs ordered data).",
            "OCCURS DEPENDING ON means the count can change — be careful.",
            "In CICS or tight memory settings, variable tables need extra care.",
          ],
        },
      ]);

    case "easyfiles":
      return section("Files — EasyLang one step at a time", [
        {
          type: "lead",
          text: "v3 lets you write and read simple text files (line-sequential). Each step below is one idea. Studio checks FILE STATUS for you after every open/read/write/close.",
        },
        {
          type: "steps",
          title: "How to study this page",
          items: [
            "Run Step 1, then Step 2 — do not skip ahead",
            "Files land in the sample folder (cwd) — safe playground data",
            "Show COBOL after a Run to see SELECT / FD / OPEN / WRITE",
            "Classic bank file vocabulary stays on File handling (next pages)",
          ],
        },
        {
          type: "callout",
          tone: "ok",
          title: "Step 1 — open for write + write + close",
          text: "f = open(\"name.txt\", \"w\") creates/overwrites a text file. write(f, value) writes one line. close(f) finishes.",
        },
        tryEasy(
          "Step 1 — write a file",
          `f = open("easydemo.txt", "w")
write(f, "hello-docs")
close(f)
print("wrote ok")
`,
          "Change the text inside write. Mode \"w\" = OUTPUT."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 2 — open for read + read + close",
          text: "open(..., \"r\") then line = read(f) pulls one line into a string. Always close.",
        },
        tryEasy(
          "Step 2 — read it back",
          `f = open("easydemo.txt", "r")
line = read(f)
close(f)
print(line)
`,
          "Run Step 1 first in this session so the file exists."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 3 — assert (prove a fact)",
          text: "assert condition stops with ASSERT FAIL if the condition is false. Use it like a tiny test.",
        },
        tryEasy(
          "Step 3 — assert",
          `x = 10
assert x = 10
print("assert passed")
`,
          "Change to assert x = 11 and Run — you should see ASSERT FAIL."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 4 — write + read + assert together",
          text: "Full mini proof: write a known line, read it, assert it matches.",
        },
        tryEasy(
          "Step 4 — round trip",
          `f = open("easydemo.txt", "w")
write(f, "round-trip")
close(f)

f = open("easydemo.txt", "r")
line = read(f)
close(f)

print(line)
assert line = "round-trip"
`,
          "This is the heart of v3 file learning."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 5 — import (defs from another .easy)",
          text: "import mathlib loads mathlib.easy from the sample src folder and brings in its def functions only (no top-level run code in the module).",
        },
        tryEasy(
          "Step 5 — import mathlib",
          `import mathlib
print(add(2, 3))
print(double(7))
`,
          "Playground file src/mathlib.easy must exist (it does in the bank sample)."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 6 — load_table (CSV lines)",
          text: "rows = load_table(\"rates.csv\") reads up to 20 lines into a table. Use rows[0], rows[1], … like a list.",
        },
        tryEasy(
          "Step 6 — load_table",
          `rows = load_table("rates.csv")
print(rows[0])
print(rows[1])
`,
          "Sample file rates.csv lives in the bank-playground folder. Show COBOL for OCCURS + READ."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 7 — try / except / raise",
          text: "raise \"msg\" inside try jumps to except. Outside try, raise stops the program (DISPLAY + STOP RUN).",
        },
        tryEasy(
          "Step 7 — try / raise",
          `try:
    raise "demo"
except:
    print("caught")
`,
          "Change the raise message, Run, then Show COBOL."
        ),
        {
          type: "do-dont",
          dos: [
            "Use \"w\" or \"r\" only for now",
            "close every open",
            "assert important results",
            "Keep import modules defs-only",
          ],
          donts: [
            "Forget close",
            "Expect full Python pathlib / with blocks yet",
            "Put print/run code inside an imported .easy module",
            "Expect load_table to parse CSV columns — it loads whole lines (max 20)",
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Practice file",
          text: "Playground → src/fileio.easy and loadtable.easy. Next: Records (bank shape), then classic COBOL file words.",
        },
      ]);

    case "records":
      return section("Records — bank-shaped data, one step at a time", [
        {
          type: "lead",
          text: "Banks think in records: one account = many fields together. EasyLang v4 lets you write that as a record type. Studio turns it into a COBOL group item (01 + 05) — like a tiny copybook.",
        },
        {
          type: "analogy",
          title: "A form on paper",
          text: "A record is one form. Fields are the boxes on the form (id, name, balance). You fill boxes; you do not invent a new form every line.",
        },
        {
          type: "steps",
          title: "How to study this page",
          items: [
            "Step 1 define the shape → Step 2 create → Step 3 set fields → Step 4 read/math",
            "Always Show COBOL once — find 01 group and 05 fields",
            "This is not SQL yet — honest bank *shape* before adapters",
          ],
        },
        {
          type: "callout",
          tone: "ok",
          title: "Step 1 — define a record type",
          text: "record Name: then indented fields. Types: str (text) or num (number).",
        },
        tryEasy(
          "Step 1 — record shape (then create)",
          `record Account:
    id: str
    balance: num

acct = Account()
print("created")
`,
          "Show COBOL: look for 01 WS-ACCT and 05 WS-ACCT-ID / WS-ACCT-BALANCE."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 2 — set fields with dot",
          text: "acct.id = \"…\" and acct.balance = 100 fill the boxes. Dot means “field of this record.”",
        },
        tryEasy(
          "Step 2 — set fields",
          `record Account:
    id: str
    balance: num

acct = Account()
acct.id = "ACCT0001"
acct.balance = 1250.00
print(acct.id)
print(acct.balance)
`,
          "Change the id or balance and Run again."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 3 — use fields in math",
          text: "Fields work in expressions like normal variables: acct.balance * acct.rate / 100.",
        },
        tryEasy(
          "Step 3 — interest from fields",
          `record Account:
    balance: num
    rate: num

acct = Account()
acct.balance = 1250.00
acct.rate = 5.00
interest = acct.balance * acct.rate / 100
print(interest)
assert interest = 62.50
`,
          "Same numbers as the bank playground interest sample."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 4 — full account printout",
          text: "Name, id, balance, interest — one record drives the report.",
        },
        tryEasy(
          "Step 4 — mini bank print",
          `record Account:
    id: str
    name: str
    balance: num
    rate: num

acct = Account()
acct.id = "ACCT0001"
acct.name = "Ali Hasan"
acct.balance = 1250.00
acct.rate = 5.00
interest = acct.balance * acct.rate / 100
print("ACCOUNT=", acct.id)
print("NAME=", acct.name)
print("INTEREST=", interest)
`,
          "Playground file: src/account.easy"
        ),
        {
          type: "do-dont",
          dos: [
            "Define record before Account()",
            "Use str or num field types only (for now)",
            "Show COBOL to connect to copybook thinking",
          ],
          donts: [
            "Expect real Db2 SELECT here — that is later (adapters)",
            "Forget Account() before setting fields",
            "Put run/print code inside an imported types module (defs/records only)",
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Next",
          text: "Adapters (stubs) load demo bank rows into records. Then Data layout / Subroutines for classic COBOL words.",
        },
      ]);

    case "adapters":
      return section("Adapters — stubs (not real bank yet)", [
        {
          type: "lead",
          text: "Real banks use Db2 and HTTP services. We do not fake a live mainframe here. v5 gives honest local stubs so you learn the shape: typed functions, SQL-like fetch, HTTP-like rate — Show COBOL marks them as STUB.",
        },
        {
          type: "callout",
          tone: "warn",
          title: "Honesty first",
          text: "stub_sql / stub_http / stub_load use a tiny built-in demo table (ACCT0001, ACCT0002). Phase 3 will swap stubs for real connectors. Until then: learn safely.",
        },
        {
          type: "steps",
          title: "How to study this page",
          items: [
            "Run each step in order",
            "Click Show COBOL — find the *> STUB comments",
            "Then open Playground src/adapters.easy",
          ],
        },
        {
          type: "callout",
          tone: "ok",
          title: "Step 1 — typed def (contract)",
          text: "Write types on parameters and return: def add(a: num, b: num) -> num: — this becomes clear LINKAGE PIC choices.",
        },
        tryEasy(
          "Step 1 — typed def",
          `def add(a: num, b: num) -> num:
    return a + b

print(add(10, 5))
`,
          "Show COBOL: LINKAGE fields match num → PIC S9…V99."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 2 — stub_sql one field",
          text: "bal = stub_sql(\"balance\", \"ACCT0001\") reads from the local demo table. Fields: id, name, balance, rate.",
        },
        tryEasy(
          "Step 2 — stub_sql balance",
          `bal = stub_sql("balance", "ACCT0001")
print(bal)
assert bal = 1250.00
`,
          "Try ACCT0002 — balance is 800.00."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 3 — stub_sql name",
          text: "Same stub, text field.",
        },
        tryEasy(
          "Step 3 — stub_sql name",
          `name = stub_sql("name", "ACCT0001")
print(name)
`,
          "Show COBOL: MOVE \"Ali Hasan\" with a STUB SQL comment."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 4 — stub_http rate",
          text: "rate = stub_http(\"/rates/default\") simulates an API. Also try \"rate\" or \"/rates/promo\".",
        },
        tryEasy(
          "Step 4 — stub_http",
          `rate = stub_http("/rates/default")
print(rate)
`,
          "Not a real network call — local stub only."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 5 — stub_load into a record",
          text: "Create a record, then stub_load(acct, \"ACCT0001\") fills matching fields from the demo table.",
        },
        tryEasy(
          "Step 5 — stub_load record",
          `record Account:
    id: str
    name: str
    balance: num
    rate: num

acct = Account()
stub_load(acct, "ACCT0001")
print(acct.name)
print(acct.balance)
`,
          "This is the bank-shaped path: record + stub load."
        ),
        {
          type: "callout",
          tone: "ok",
          title: "Step 6 — typed interest + stub data",
          text: "Combine typed def with stub-loaded account — mini bank story.",
        },
        tryEasy(
          "Step 6 — full stub story",
          `def interest(bal: num, rate: num) -> num:
    return bal * rate / 100

record Account:
    id: str
    name: str
    balance: num
    rate: num

acct = Account()
stub_load(acct, "ACCT0001")
earned = interest(acct.balance, acct.rate)
print(acct.name)
print(earned)
assert acct.id = "ACCT0001"
`,
          "Playground file: src/adapters.easy"
        ),
        {
          type: "glossary",
          items: [
            {
              term: "stub_sql(field, acct)",
              def: "Local demo lookup. Fields: id, name, balance, rate. Accounts: ACCT0001, ACCT0002.",
            },
            {
              term: "stub_http(path)",
              def: "Local demo rate. Paths: /rates/default, /rates/promo, rate.",
            },
            {
              term: "stub_load(rec, acct)",
              def: "Fills a record’s fields from the demo table.",
            },
            {
              term: "def ...(x: num) -> num",
              def: "Typed contract for LINKAGE PIC — still allow-listed EasyLang.",
            },
          ],
        },
        {
          type: "do-dont",
          dos: [
            "Read STUB comments in Show COBOL",
            "Use only demo account ids listed above",
            "Keep learning records + stubs before real connectors",
          ],
          donts: [
            "Think this is connected to a real bank Db2",
            "Expect arbitrary SQL strings to run",
            "Skip Show COBOL — stubs are meant to be visible",
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Classic Db2 page",
          text: "Sidebar → Database (idea) shows EXEC SQL shape. Adapters here are the EasyLang practice path.",
        },
      ]);

    case "files":
      return section("File handling — the big picture", [
        {
          type: "lead",
          text: "A file is a collection of records. Your program opens it, reads or writes, then closes it.",
        },
        {
          type: "steps",
          title: "Mental steps",
          items: [
            "Describe the file in ENVIRONMENT (SELECT … ASSIGN …)",
            "Describe the record shape in DATA (FD + fields or COPY)",
            "OPEN the file",
            "READ / WRITE / REWRITE / DELETE as needed",
            "Always think about errors (FILE STATUS, AT END)",
            "CLOSE the file",
          ],
        },
        {
          type: "analogy",
          title: "Like a notebook",
          text: "OPEN = open the notebook. READ = look at the next page. WRITE = add a page. CLOSE = put it away.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Start in EasyLang first",
          text: "New to files? Open Docs → Files (EasyLang) for open/write/read/close step by step. This page is the classic COBOL vocabulary.",
        },
        tryEasy(
          "EasyLang file peek",
          `f = open("easydemo.txt", "w")
write(f, "from-cobol-docs")
close(f)
print("wrote")
`,
          "Show COBOL to see SELECT / FD / OPEN OUTPUT."
        ),
      ]);

    case "file-org":
      return section("File organization", [
        {
          type: "p",
          text: "Organization means how records are arranged.",
        },
        {
          type: "cards",
          items: [
            {
              title: "SEQUENTIAL",
              text: "One after another — like a queue. Simple and common for batch.",
            },
            {
              title: "LINE SEQUENTIAL",
              text: "Text lines — friendly on Windows/Linux learning (our sample uses this).",
            },
            {
              title: "INDEXED",
              text: "Find by a key (like account id). On mainframes often VSAM KSDS.",
            },
            {
              title: "RELATIVE",
              text: "Find by record number (1st, 2nd, 10th…).",
            },
          ],
        },
      ]);

    case "file-access":
      return section("File access mode", [
        {
          type: "glossary",
          items: [
            {
              term: "SEQUENTIAL access",
              def: "Read/write in order.",
            },
            {
              term: "RANDOM access",
              def: "Jump to a key or relative number when you want.",
            },
            {
              term: "DYNAMIC access",
              def: "Mix sequential and random in one open file (when organization allows).",
            },
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Rule of thumb",
          text: "Not every organization allows every access mode. Sequential files do not suddenly become random magicians.",
        },
      ]);

    case "file-verbs":
      return section("File handling verbs", [
        {
          type: "glossary",
          items: [
            { term: "OPEN", def: "Start using the file (INPUT, OUTPUT, I-O, EXTEND…)." },
            { term: "READ", def: "Get the next (or keyed) record. Watch AT END." },
            { term: "WRITE", def: "Add a record." },
            { term: "REWRITE", def: "Replace a record you are updating (needs correct open mode)." },
            { term: "DELETE", def: "Remove a record (indexed/relative styles)." },
            { term: "START", def: "Position for keyed reading." },
            { term: "CLOSE", def: "Finish and release the file." },
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Always check success",
          text: "Use FILE STATUS. After OPEN/READ, ask: did it work? Silent file errors cause silent money bugs.",
        },
      ]);

    case "functions":
      return section("Functions — one idea at a time", [
        {
          type: "lead",
          text: "A function is a small helper with a name. You teach it once, then call it whenever you need that work. EasyLang uses def — like Python. Take each step below slowly.",
        },
        {
          type: "analogy",
          title: "Recipe card",
          text: "You write a recipe once (def). Later you say “make that recipe” (call). Sometimes the recipe gives you a finished dish back (return).",
        },
        {
          type: "steps",
          title: "How to study this page",
          items: [
            "Read one step → Run its box → change one number/name → Run again",
            "Only then open the next step",
            "At the end, press Show COBOL once to peek under the hood",
            "Then open Subroutines (CALL) for the bank / COBOL vocabulary",
          ],
        },

        {
          type: "callout",
          tone: "ok",
          title: "Step 1 — What is def?",
          text: "def starts a function. The name comes next. The body is indented under it (4 spaces). This first helper has no inputs and no return — it only prints.",
        },
        {
          type: "p",
          text: "After you define it, you must call it by writing its name with (). Defining alone does nothing.",
        },
        tryEasy(
          "Step 1 — def + call (no inputs)",
          `def say_hi():
    print("hi")

say_hi()
`,
          "Change the message inside print. Keep the empty () for now."
        ),

        {
          type: "callout",
          tone: "ok",
          title: "Step 2 — One input (parameter)",
          text: "Put a name inside the parentheses: def greet(name). That name is a local box the function receives when you call it.",
        },
        {
          type: "p",
          text: "When you write greet(\"Ali\"), the text Ali is copied into name for that run.",
        },
        tryEasy(
          "Step 2 — one parameter",
          `def greet(name):
    print("hello", name)

greet("Ali")
`,
          "Try greet(\"Sara\") on the last line. Only change the argument."
        ),

        {
          type: "callout",
          tone: "ok",
          title: "Step 3 — Two inputs",
          text: "List more parameters with commas: def add(a, b). Call with the same number of values: add(3, 2).",
        },
        {
          type: "p",
          text: "Order matters: first value goes to a, second to b.",
        },
        tryEasy(
          "Step 3 — two parameters (still no return)",
          `def show_sum(a, b):
    print("sum is", a + b)

show_sum(3, 2)
`,
          "Try show_sum(10, 5). Still no return — the function only prints."
        ),

        {
          type: "callout",
          tone: "ok",
          title: "Step 4 — return (give a value back)",
          text: "return sends a result back to the caller. The function stops there. The caller can store it in a variable.",
        },
        {
          type: "p",
          text: "Pattern: result = add(3, 2) then print(result). Without return, there is nothing useful to store.",
        },
        tryEasy(
          "Step 4 — return a number",
          `def add(a, b):
    return a + b

total = add(40, 2)
print(total)
`,
          "Change 40 or 2. Notice print is outside the function — it uses the returned value."
        ),

        {
          type: "callout",
          tone: "ok",
          title: "Step 5 — Use the result in more math",
          text: "Once you have a returned number, treat it like any other variable.",
        },
        tryEasy(
          "Step 5 — reuse the result",
          `def add(a, b):
    return a + b

total = add(10, 5)
double = total * 2
print("total", total)
print("double", double)
`,
          "This is how bank samples chain interest → new balance later."
        ),

        {
          type: "callout",
          tone: "ok",
          title: "Step 6 — const (fixed name)",
          text: "const RATE = 5 means RATE should stay a fixed value in the main program. It is not a function — it is a named constant.",
        },
        {
          type: "p",
          text: "If a function needs that number, pass it in as an argument. Do not expect the function to magically see outer const by name yet.",
        },
        tryEasy(
          "Step 6 — const alone",
          `const RATE = 5
bal = 100
interest = bal * RATE / 100
print(interest)
`,
          "Change RATE to 10 and Run. Only this idea — no def yet."
        ),
        tryEasy(
          "Step 6b — const + function (pass it in)",
          `const RATE = 5

def interest(bal, rate):
    return bal * rate / 100

print(interest(200, RATE))
`,
          "RATE is passed as the second argument. That matches COBOL USING later."
        ),

        {
          type: "callout",
          tone: "accent",
          title: "Step 7 — What COBOL looks like (peek)",
          text: "After any Run above, click Show COBOL. You will see a nested PROGRAM-ID … IS COMMON, LINKAGE boxes, CALL … USING, and GOBACK. Full bank vocabulary is on the next page: Subroutines (CALL).",
        },
        {
          type: "do-dont",
          dos: [
            "Indent the body under def with 4 spaces",
            "Call the function with () after defining it",
            "Match argument count to parameter count",
            "Use return when you need a value in the caller",
          ],
          donts: [
            "Forget to call the function (def alone does nothing)",
            "Mix STOP RUN inside a small helper (use return / natural end)",
            "Expect const inside a function without passing it",
            "Skip Show COBOL forever — peek once per day",
          ],
        },
        {
          type: "callout",
          tone: "ok",
          title: "Practice file",
          text: "Playground → src/functions.easy. Docs Run boxes never overwrite your sample.",
        },
      ]);

    case "subroutines":
      return section("Subroutines — COBOL CALL (after Functions)", [
        {
          type: "lead",
          text: "Banks say CALL, LINKAGE, GOBACK. EasyLang said def and return. Same idea — different words. Finish Functions (def) first if this page feels dense.",
        },
        {
          type: "analogy",
          title: "A helper desk",
          text: "You hand a slip of paper (arguments) to a helper. They do the work, maybe write an answer on the slip (return), and bring it back (GOBACK).",
        },
        {
          type: "glossary",
          items: [
            {
              term: "def name(...):",
              def: "EasyLang function → nested PROGRAM-ID … IS COMMON.",
            },
            {
              term: "return expr",
              def: "EasyLang result → MOVE/COMPUTE into LK-RET, then GOBACK.",
            },
            {
              term: "CALL … USING",
              def: "COBOL: run another program and pass data boxes.",
            },
            {
              term: "LINKAGE SECTION",
              def: "Where the called program sees those boxes (LK-A, LK-RET, …).",
            },
            {
              term: "GOBACK",
              def: "Return to the caller (not STOP RUN — that ends the whole job).",
            },
          ],
        },
        tryEasy(
          "Bridge — EasyLang you already know",
          `def add(a, b):
    return a + b

print(add(7, 3))
`,
          "Show COBOL. Find: PROGRAM-ID. ADD, LINKAGE, CALL \"ADD\" USING, GOBACK."
        ),
        {
          type: "bullets",
          items: [
            "USING passes data boxes to the other program",
            "LINKAGE SECTION is where the called program sees those boxes",
            "BY REFERENCE / BY CONTENT / BY VALUE change how data is shared (COBOL mode / later)",
            "Dynamic CALL (name in a variable) is harder to track — be careful",
          ],
        },
        {
          type: "callout",
          tone: "accent",
          title: "Why banks care",
          text: "If two programs disagree about the size of a shared box, bad data can appear. That is a classic blast-radius problem.",
        },
      ]);

    case "sort":
      return section("Internal sort — idea only", [
        {
          type: "p",
          text: "COBOL can SORT records using SORT / MERGE ideas and special file descriptions (SD).",
        },
        {
          type: "p",
          text: "Batch jobs often sort huge files before reports. For Phase 1 learning, know the word exists. Practice later with a focused sample.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Keep it light for now",
          text: "Master READ/WRITE and IF/PERFORM first. Sort is a power tool for later.",
        },
      ]);

    case "database":
      return section("Database interface — idea + EasyLang stubs", [
        {
          type: "lead",
          text: "Many bank programs talk to Db2 with embedded SQL. In Docs, practice first with EasyLang stubs — then learn the EXEC SQL shape you will see in real estates.",
        },
        {
          type: "callout",
          tone: "ok",
          title: "Practice path (do this)",
          text: "Open Adapters (stubs) → run stub_sql / stub_load steps. That is the safe learner path today.",
        },
        tryEasy(
          "EasyLang stub (today)",
          `bal = stub_sql("balance", "ACCT0001")
print(bal)
`,
          "Show COBOL: *> STUB SQL comment. Not real Db2."
        ),
        {
          type: "mini",
          title: "Shape you will see later in banks",
          code: `EXEC SQL
   SELECT BALANCE
     INTO :WS-BAL
     FROM ACCOUNTS
    WHERE ACCT_ID = :WS-ID
END-EXEC.
IF SQLCODE NOT = 0
   ... handle error ...
END-IF.`,
          note: "Host variables are COBOL boxes inside SQL. Always check SQLCODE. Real connectors = Phase 3.",
        },
        {
          type: "p",
          text: "Our playground does not attach to a live database on purpose. Stubs teach the workflow; connectors come when the product is ready.",
        },
      ]);

    case "faq":
      return section("Easy FAQ", [
        {
          type: "glossary",
          items: [
            {
              term: "What is PIC?",
              def: "The picture of a data box — letters (X) or digits (9), and how big.",
            },
            {
              term: "Where do I define variables?",
              def: "Usually WORKING-STORAGE in the DATA DIVISION (or LINKAGE when called).",
            },
            {
              term: "What is a paragraph?",
              def: "A named chunk of steps in PROCEDURE DIVISION. PERFORM can run it.",
            },
            {
              term: "How do I do math?",
              def: "ADD, SUBTRACT, MULTIPLY, DIVIDE, or COMPUTE.",
            },
            {
              term: "What is a copybook?",
              def: "Reusable COBOL text — often a shared data form — pulled in with COPY.",
            },
            {
              term: "How do I loop?",
              def: "EasyLang: while / for i in range. COBOL: PERFORM … TIMES / UNTIL / VARYING.",
            },
            {
              term: "How do I write a function?",
              def: "EasyLang: def name(a, b): … return …. See Docs → Functions (def), then Subroutines for CALL words.",
            },
            {
              term: "What is const?",
              def: "EasyLang fixed value (const RATE = 5) → WORKING-STORAGE with VALUE.",
            },
            {
              term: "How do I write a text file?",
              def: "EasyLang v3: open/write/read/close, load_table(\"x.csv\"), try/except/raise. See Files (EasyLang).",
            },
            {
              term: "How do I read a text file?",
              def: "open(..., \"r\") then line = read(f) then close(f). FILE STATUS is checked for you.",
            },
            {
              term: "What is assert?",
              def: "assert condition — if false, prints ASSERT FAIL and stops. Tiny built-in proof.",
            },
            {
              term: "What is import?",
              def: "import mathlib loads mathlib.easy defs/records into this program. Module = record/def only.",
            },
            {
              term: "What is a record?",
              def: "EasyLang v4: record Account: with fields (str/num). Becomes COBOL 01 group + 05 items. See Records (bank shape).",
            },
            {
              term: "How do I set a field?",
              def: "acct = Account() then acct.balance = 100. Dot = field of that record.",
            },
            {
              term: "What is stub_sql?",
              def: "Local demo lookup (not Db2): stub_sql(\"balance\", \"ACCT0001\"). See Adapters (stubs).",
            },
            {
              term: "What is stub_http?",
              def: "Local demo rate (not network): stub_http(\"/rates/default\"). See Adapters (stubs).",
            },
            {
              term: "What is stub_load?",
              def: "stub_load(acct, \"ACCT0001\") fills a record from the demo table.",
            },
            {
              term: "What are typed defs?",
              def: "def add(a: num, b: num) -> num: — types guide LINKAGE PIC. See Adapters Step 1.",
            },
            {
              term: "How do I handle file errors?",
              def: "EasyLang checks FILE STATUS after I/O. Classic COBOL: FILE STATUS, AT END, IF checks — see File handling.",
            },
            {
              term: "Can COBOL do websites?",
              def: "Not as a front-end page builder. It can sit behind modern APIs in real architectures.",
            },
          ],
        },
      ]);

    case "quick":
      return section("Quick guide — cheat sheet", [
        {
          type: "mini",
          title: "Skeleton",
          code: `IDENTIFICATION DIVISION.
PROGRAM-ID. DEMO.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-MSG PIC X(20) VALUE "Hi".
PROCEDURE DIVISION.
    DISPLAY WS-MSG
    STOP RUN.`,
          note: "Add ENVIRONMENT + files when you need them.",
        },
        {
          type: "bullets",
          items: [
            "String → PIC X(n)",
            "Number → PIC 9(n) or S9(n)V99",
            "Show → DISPLAY / EasyLang print",
            "Copy → MOVE / EasyLang =",
            "Choose → IF / EVALUATE / EasyLang if",
            "Repeat → PERFORM / EasyLang while & for",
            "Function → CALL / EasyLang def + return",
            "Const → VALUE clause / EasyLang const",
            "Files → EasyLang open/write/read/close (or COBOL OPEN/READ/WRITE + FILE STATUS)",
            "Assert → assert x = 1",
            "Import → import mathlib (record/def .easy)",
            "Record → record Account: / acct.field",
            "Stub SQL → stub_sql(\"balance\", \"ACCT0001\")",
            "Stub HTTP → stub_http(\"/rates/default\")",
            "Stub load → stub_load(acct, \"ACCT0001\")",
            "Typed def → def f(a: num) -> num:",
          ],
        },
        {
          type: "mini",
          title: "EasyLang v2 shape",
          code: `def add(a, b):
    return a + b

const N = 2
print(add(3, N))
`,
          note: "Maps to nested PROGRAM-ID + CALL … USING (+ LK-RET).",
        },
        {
          type: "mini",
          title: "EasyLang v3 shape",
          code: `rows = load_table("rates.csv")
print(rows[0])
try:
    raise "x"
except:
    print("ok")
`,
          note: "Also open/write/read/close/assert/import. See Files (EasyLang).",
        },
        {
          type: "mini",
          title: "EasyLang v4 shape",
          code: `record Account:
    id: str
    balance: num

acct = Account()
acct.id = "ACCT0001"
acct.balance = 100
print(acct.balance)
`,
          note: "COBOL 01 group + 05 fields. See Records (bank shape).",
        },
        {
          type: "mini",
          title: "EasyLang v5 shape",
          code: `def interest(bal: num, rate: num) -> num:
    return bal * rate / 100

bal = stub_sql("balance", "ACCT0001")
rate = stub_http("/rates/default")
print(interest(bal, rate))
`,
          note: "Stubs only — Show COBOL for *> STUB comments. See Adapters (stubs).",
        },
        {
          type: "p",
          text: "In Studio: Easy → Generate → Run → Test. Or COBOL mode: Compile → Run → Test.",
        },
        tryEasy(
          "Cheat-sheet live (stub + typed def)",
          `def interest(bal: num, rate: num) -> num:
    return bal * rate / 100

bal = stub_sql("balance", "ACCT0001")
rate = stub_http("rate")
print(interest(bal, rate))
`,
          "Keep this pattern in muscle memory."
        ),
      ]);

    case "practice":
      return section("Practice here in the Playground", [
        {
          type: "steps",
          title: "Do this today",
          items: [
            "Docs: Functions → Files → Records → Adapters — finish every Run box",
            "Docs: Subroutines — Show COBOL and learn CALL words",
            "Playground → interest + functions + fileio + loadtable + account + adapters .easy",
            "Estate tab: ghosts + impact + rules + refactor hints",
            "Break something on purpose — read line errors",
          ],
        },
        tryEasy(
          "Warm-up before Playground",
          `bal = stub_sql("balance", "ACCT0001")
print("bal=", bal)
`,
          "Then open adapters.easy and account.easy in the Playground."
        ),
        {
          type: "do-dont",
          dos: [
            "Break the sample on purpose",
            "Read line errors after Compile",
            "Keep tests green before calling a change “done”",
            "Use Show COBOL after every EasyLang Run — learn the mapping",
            "Read Easy Mode ladder; every new rung must appear in Docs the same day",
          ],
          donts: [
            "Treat this as a real bank",
            "Skip FILE STATUS thinking (when you do files)",
            "Panic — red is a teacher",
          ],
        },
      ]);

    case "references":
      return section("More links (outside this app)", [
        {
          type: "lead",
          text: "Want another website’s lessons too? Use these as extra reading. Their words belong to them — we do not paste their books here.",
        },
        {
          type: "cards",
          items: [
            {
              title: "TutorialsPoint — COBOL Tutorial",
              text: "Popular free web tutorial with a long topic list (overview → files → FAQ). Open: https://www.tutorialspoint.com/cobol/index.htm",
            },
            {
              title: "GnuCOBOL guides",
              text: "Official free compiler docs for cobc — see docs/cobol/13-GNUCOBOL.md in this repo.",
            },
            {
              title: "Our deep notes",
              text: "Engineer notes live in docs/cobol/ (PIC, JCL, CICS, Db2…). Written for this product, not copied from tutorial sites.",
            },
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Copyright note",
          text: "Copying another site’s full lessons into our product would be wrong. We cover the same learning path in our own simple words, and we link out for more.",
        },
        {
          type: "p",
          text: "Ready? Open the Playground and press Doctor.",
        },
      ]);

    default:
      return section("Pick a topic", [
        { type: "p", text: "Choose a lesson from the left menu." },
      ]);
  }
}
