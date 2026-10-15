/**
 * Phase 2 gate: slice 1 (ingest/ghosts/impact) + slice 2 (rules/refactor/risk/zip).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function ok(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const required = [
  "packages/estate-ingest/src/ingest.js",
  "packages/estate-ingest/src/rules.js",
  "packages/estate-ingest/src/refactor.js",
  "packages/estate-ingest/src/riskGate.js",
  "packages/estate-ingest/src/zipIngest.js",
  "samples/bank-playground/jcl/DAILYINT.jcl",
  "samples/bank-playground/src/deadprog.cob",
  "samples/bank-playground/src/ratecalc.cob",
  "samples/bank-playground/src/acctprint.cob",
  "samples/bank-playground/inventory/loadlib.json",
  "samples/bank-playground/inventory/documented.json",
  "samples/bank-playground/inventory/risk-ack.json",
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing ${rel}`);
}
ok(`required files (${required.length})`);

const ingest = spawnSync("npm", ["run", "estate:ingest"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (ingest.status !== 0) {
  console.error(ingest.stdout || ingest.stderr);
  fail("estate:ingest");
}
ok("estate ingest");

const test = spawnSync("npm", ["run", "estate:test"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (test.status !== 0) {
  console.error(test.stdout || test.stderr);
  fail("estate-ingest selftest");
}
ok("estate-ingest selftest");

const validate = spawnSync("npm", ["run", "estate:validate"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (validate.status !== 0) {
  console.error(validate.stdout || validate.stderr);
  fail("estate validate");
}
ok("estate fixture validate");

const fixture = JSON.parse(
  fs.readFileSync(
    path.join(root, "packages/estate-model/fixtures/bank-playground.estate.json"),
    "utf8"
  )
);
if (!fixture.ghosts?.length) fail("fixture has no ghosts");
if (!fixture.jobs?.length) fail("fixture has no jobs");
if (!fixture.rules?.length) fail("fixture has no business rules");
if (!fixture.refactors?.length) fail("fixture has no refactor suggestions");
ok(
  `fixture ghosts=${fixture.ghosts.length} jobs=${fixture.jobs.length} ` +
    `rules=${fixture.rules.length} refactors=${fixture.refactors.length}`
);

const gate = spawnSync("npm", ["run", "risk:gate"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
if (gate.status !== 0) {
  console.error(gate.stdout || gate.stderr);
  fail("risk:gate (add inventory/risk-ack.json entry or --ack-high-risk)");
}
ok("risk gate (acked)");

console.log(
  "\nPhase 2 COMPLETE — ingest + ghosts + impact + rules + refactor + risk gate + zip ingest."
);
process.exit(0);
