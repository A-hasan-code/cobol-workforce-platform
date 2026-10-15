/**
 * Phase 1 completion gate (local).
 * - Always: estate fixture validate, sample files present, studio entrypoints exist
 * - If cobc present: real compile + test
 * - If cobc missing: warn + exit 0 only when --allow-demo (Windows prep); else exit 2
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowDemo = process.argv.includes("--allow-demo");

function ok(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const required = [
  "samples/bank-playground/cobol.toml",
  "samples/bank-playground/src/interest.cob",
  "samples/bank-playground/copybooks/acctrec.cpy",
  "samples/bank-playground/testdata/accounts.in",
  "samples/bank-playground/expected/interest.out",
  "packages/runtime-kit/src/index.js",
  "packages/estate-model/schema/estate.schema.json",
  "packages/estate-model/fixtures/bank-playground.estate.json",
  "apps/studio/src/App.jsx",
  "apps/studio/src/DocsPage.jsx",
  ".github/workflows/ci.yml",
  "docs/INSTALL.md",
  "docs/PLAYGROUND.md",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing ${rel}`);
}
ok(`required files (${required.length})`);

const estate = spawnSync("npm", ["run", "estate:validate"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (estate.status !== 0) {
  console.error(estate.stdout || estate.stderr);
  fail("estate fixture validation");
}
ok("estate model fixture");

const which = process.platform === "win32" ? "where" : "which";
const cobc = spawnSync(which, ["cobc"], { encoding: "utf8", shell: true });
const hasCobc = cobc.status === 0;

if (!hasCobc) {
  console.warn("! cobc not on PATH");
  console.warn("  Windows: run scripts\\setup-gnucobol-windows.ps1 (Admin) or SuperBOL user MSI");
  console.warn("  Then: npm run doctor && npm run test:sample");
  if (allowDemo) {
    ok("Phase 1 structure complete (demo mode — install cobc for real Run/Test)");
    process.exit(0);
  }
  process.exit(2);
}

const doctor = spawnSync("npm", ["run", "doctor"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (doctor.status !== 0) {
  console.error(doctor.stdout || doctor.stderr);
  fail("doctor");
}
ok("doctor");

const test = spawnSync("npm", ["run", "test:sample"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (test.status !== 0) {
  console.error(test.stdout || test.stderr);
  fail("sample test");
}
ok("sample compile + test");

console.log("\nPhase 1 COMPLETE — local Runtime Kit + Studio + estate stubs + CI ready.");
process.exit(0);
