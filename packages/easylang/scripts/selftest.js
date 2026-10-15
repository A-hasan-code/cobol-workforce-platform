import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { transpile } from "../src/index.js";
import { tryCobolSource } from "../../runtime-kit/src/try.js";
import { defaultSampleDir } from "../../runtime-kit/src/paths.js";

const sample = defaultSampleDir();
const srcDir = path.join(sample, "src");

function mustRun(easy, expectSubstr, opts = {}) {
  const t = transpile(easy, { programId: "SELFTEST", basedir: srcDir, ...opts });
  assert.equal(t.ok, true, JSON.stringify(t.diagnostics) + "\n" + (t.cobol || ""));
  const r = tryCobolSource(sample, t.cobol, { programId: "SELFTEST" });
  assert.equal(r.ok, true, (r.stderr || "") + "\n" + t.cobol);
  if (expectSubstr) assert.match(r.stdout, new RegExp(expectSubstr));
  return r.stdout;
}

mustRun(`msg = "HELLO, EASY"\nprint(msg)\n`, "HELLO, EASY");
mustRun(
  `balance = 1250.00\nrate = 5.00\ninterest = balance * rate / 100\nprint("INTEREST=", interest)\n`,
  "62\\.50"
);
mustRun(`x = 10\nif x = 10:\n    print("yes")\nelse:\n    print("no")\n`, "yes");
mustRun(`i = 0\nwhile i < 3:\n    print("w", i)\n    i = i + 1\n`, "w");
mustRun(`for i in range(3):\n    print("f", i)\n`, "f");
mustRun(`scores = [10, 20, 30]\nprint(scores[1])\nscores[0] = 99\nprint(scores[0])\n`, "20");
mustRun(`a = "Ali"\nb = "Hasan"\nfull = a + " " + b\nprint(full)\n`, "Ali Hasan");
mustRun(`x = 5\nif x > 0 and x < 10:\n    print("mid")\n`, "mid");
mustRun(`msg = "HELLO"\na = 3\nb = 2\nprint(a + b, msg)\n`, "5\\.00 HELLO");

// v2 functions
mustRun(
  `def add(a, b):
    return a + b

r = add(3, 2)
print(r)
`,
  "5\\.00"
);

mustRun(
  `def greet(name):
    print("hi", name)

greet("Ali")
`,
  "hi Ali"
);

mustRun(
  `def say_hi():
    print("yo")

say_hi()
`,
  "yo"
);

mustRun(`def add(a, b):\n    return a + b\nprint(add(3, 2))\n`, "5\\.00");

mustRun(
  `const RATE = 5
bal = 100
interest = bal * RATE / 100
print(interest)
`,
  "5\\.00"
);

// v3 files + assert
const demoPath = "easydemo.txt";
mustRun(
  `f = open("${demoPath}", "w")
write(f, "hello-v3")
close(f)

f = open("${demoPath}", "r")
line = read(f)
close(f)
print(line)
assert line = "hello-v3"
`,
  "hello-v3"
);

const written = fs.readFileSync(path.join(sample, demoPath), "utf8");
assert.match(written, /hello-v3/);

// assert fail path
{
  const t = transpile(`x = 1\nassert x = 2\nprint("no")\n`, { programId: "AFAIL", basedir: srcDir });
  assert.equal(t.ok, true, JSON.stringify(t.diagnostics));
  const r = tryCobolSource(sample, t.cobol, { programId: "AFAIL" });
  assert.match(r.stdout || "", /ASSERT FAIL/);
}

// v3 import (defs-only module)
fs.writeFileSync(
  path.join(srcDir, "_selftest_math.easy"),
  `def add(a, b):\n    return a + b\n`,
  "utf8"
);
mustRun(
  `import _selftest_math
print(add(6, 4))
`,
  "10\\.00"
);

const bad = transpile(`import os\nprint(1)\n`, { basedir: srcDir });
assert.equal(bad.ok, false);

// v4 records
mustRun(
  `record Account:
    id: str
    balance: num

acct = Account()
acct.id = "ACCT0001"
acct.balance = 1250.00
print(acct.id)
print(acct.balance)
assert acct.balance = 1250.00
`,
  "ACCT0001"
);

mustRun(
  `record Account:
    balance: num
    rate: num

acct = Account()
acct.balance = 100
acct.rate = 5
interest = acct.balance * acct.rate / 100
print(interest)
`,
  "5\\.00"
);

// v5 typed def + stubs
mustRun(
  `def add(a: num, b: num) -> num:
    return a + b

print(add(2, 3))
`,
  "5\\.00"
);

mustRun(
  `bal = stub_sql("balance", "ACCT0001")
name = stub_sql("name", "ACCT0001")
print(name)
print(bal)
`,
  "Ali Hasan"
);

mustRun(
  `rate = stub_http("/rates/default")
print(rate)
`,
  "5\\.00"
);

mustRun(
  `record Account:
    id: str
    name: str
    balance: num
    rate: num

acct = Account()
stub_load(acct, "ACCT0001")
print(acct.name)
print(acct.balance)
assert acct.id = "ACCT0001"
`,
  "Ali Hasan"
);

// plan v3 leftovers — load_table + try/raise
fs.writeFileSync(
  path.join(sample, "selftest-rates.csv"),
  "ACCT0001,5.00\nACCT0002,4.50\n",
  "utf8"
);
mustRun(
  `rows = load_table("selftest-rates.csv")
print(rows[0])
print(rows[1])
`,
  "ACCT0001"
);

mustRun(
  `try:
    raise "boom"
except:
    print("caught")
`,
  "caught"
);

{
  const t = transpile(`raise "nope"\nprint("no")\n`, {
    programId: "RAISE1",
    basedir: srcDir,
  });
  assert.equal(t.ok, true, JSON.stringify(t.diagnostics));
  const r = tryCobolSource(sample, t.cobol, { programId: "RAISE1" });
  assert.match(r.stdout || "", /RAISE/);
  assert.ok(!/^\s*no\s*$/m.test(r.stdout || ""), "raise should stop before print");
}

console.log("easylang selftest OK (v0..v5 + load_table/try)");
