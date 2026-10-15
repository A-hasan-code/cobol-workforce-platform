import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestEstate, defaultSampleRoot, writeEstateFixture } from "../src/ingest.js";
import { impactAnalysis } from "../src/impact.js";
import { detectGhosts } from "../src/ghosts.js";
import { extractRulesFromSource } from "../src/rules.js";
import { suggestRefactors } from "../src/refactor.js";
import { evaluateRiskGate } from "../src/riskGate.js";
import { ingestFromZip } from "../src/zipIngest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const estate = ingestEstate(defaultSampleRoot());

assert.ok(estate.programs.some((p) => p.name === "INTEREST"));
assert.ok(estate.programs.some((p) => p.name === "DEADPROG"));
assert.ok(estate.programs.some((p) => p.name === "ACCTPRINT"));
assert.ok(estate.copybooks.some((c) => c.name === "acctrec.cpy"));
assert.ok(estate.jobs.some((j) => j.name === "DAILYINT"));
assert.ok(
  estate.dependencies.some((d) => d.type === "COPY"),
  "ACCTPRINT (or other) should COPY a copybook"
);
assert.ok(estate.dependencies.some((d) => d.type === "CALL"));
assert.ok(estate.dependencies.some((d) => d.type === "EXEC"));
assert.ok(
  !estate.programs.some((p) => p.name === "CONVERT" && p.sourcePath?.includes("_try")),
  "scratch _try.cob must not pollute estate"
);

const kinds = new Set(estate.ghosts.map((g) => g.kind));
assert.ok(kinds.has("orphan-source"), "expected orphan-source (DEADPROG)");
assert.ok(kinds.has("orphan-load") || kinds.has("ghost-load"), "expected OLDUTIL ghost/orphan-load");
assert.ok(kinds.has("undocumented-run"), "expected undocumented-run (OLDUTIL in JCL)");
assert.ok(kinds.has("dynamic-uncertain"), "expected dynamic-uncertain");

const impact = impactAnalysis(estate, { field: "ACCT-BAL-TEXT" });
assert.equal(impact.ok, true);
assert.ok(impact.riskScore > 0, "field impact should score > 0");
assert.ok(
  impact.dependents.programs.some((p) => p.name === "ACCTPRINT") ||
    impact.changeReport.programs.includes("ACCTPRINT") ||
    impact.riskScore >= 15,
  "ACCTPRINT (COPY ACCTREC) should be impacted by ACCT-BAL-TEXT"
);
assert.ok(
  impact.riskBand === "high" || impact.riskBand === "medium" || impact.riskScore >= 15,
  "field impact should be meaningful for risk gate demos"
);

const unit = detectGhosts({
  sourceNames: ["A"],
  loadNames: ["B"],
  jclNames: ["B"],
  callNames: [],
  dynamicNames: [],
  docNames: ["A"],
});
assert.ok(unit.ghosts.some((g) => g.kind === "orphan-load"));

// --- slice 2: rules ---
assert.ok(Array.isArray(estate.rules) && estate.rules.length > 0, "expected extracted rules");
assert.ok(
  estate.rules.some((r) => r.kind === "tagged" && /Interest/i.test(r.summary)),
  "expected tagged RULE from RATECALC"
);
assert.ok(
  estate.rules.some((r) => r.kind === "if" && /LK-BALANCE/i.test(r.summary)),
  "expected IF rule from RATECALC"
);
assert.ok(
  estate.rules.some((r) => r.kind === "compute"),
  "expected COMPUTE formula rule"
);

const mini = extractRulesFromSource(
  `*> RULE: demo\nIF X > 0\n   MOVE 1 TO Y\nEND-IF\nCOMPUTE Z = X + 1\n`,
  "DEMO"
);
assert.ok(mini.some((r) => r.kind === "tagged"));
assert.ok(mini.some((r) => r.kind === "if"));
assert.ok(mini.some((r) => r.kind === "compute"));

// --- slice 2: refactors ---
assert.ok(Array.isArray(estate.refactors) && estate.refactors.length > 0);
assert.ok(
  estate.refactors.some((s) => s.kind === "archive-orphan-source"),
  "expected archive suggestion for DEADPROG"
);
assert.ok(
  estate.refactors.some((s) => s.kind === "prefer-static-call"),
  "expected static-call suggestion for dynamic ghost"
);
const sug = suggestRefactors(estate);
assert.ok(sug.length >= estate.refactors.length - 1);

// --- slice 2: risk gate ---
const blocked = evaluateRiskGate(estate, { fields: ["ACCT-BAL-TEXT"], acks: [] });
assert.equal(blocked.ok, false, "high impact without ack should fail");
const passed = evaluateRiskGate(estate, {
  fields: ["ACCT-BAL-TEXT"],
  acks: [{ field: "ACCT-BAL-TEXT", reason: "test" }],
});
assert.equal(passed.ok, true, "ack should pass gate");

// --- slice 2: zip ingest ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "estate-zip-self-"));
const bundle = path.join(tmp, "bundle");
fs.mkdirSync(path.join(bundle, "src"), { recursive: true });
fs.mkdirSync(path.join(bundle, "copybooks"), { recursive: true });
fs.mkdirSync(path.join(bundle, "jcl"), { recursive: true });
fs.mkdirSync(path.join(bundle, "inventory"), { recursive: true });
fs.writeFileSync(
  path.join(bundle, "src", "tiny.cob"),
  `IDENTIFICATION DIVISION.
PROGRAM-ID. TINY.
PROCEDURE DIVISION.
    IF 1 = 1
       DISPLAY "OK"
    END-IF
    STOP RUN.
`
);
fs.writeFileSync(
  path.join(bundle, "inventory", "documented.json"),
  JSON.stringify({ programs: ["TINY"] })
);
fs.writeFileSync(
  path.join(bundle, "inventory", "loadlib.json"),
  JSON.stringify({ members: ["TINY"] })
);
const zipPath = path.join(tmp, "export.zip");
execFileSync("tar", ["-a", "-cf", zipPath, "-C", bundle, "."], { stdio: "pipe" });
const zipped = ingestFromZip(zipPath);
assert.ok(zipped.estate.programs.some((p) => p.name === "TINY"));
assert.equal(zipped.estate.ingestRun.connector, "customer-zip");
assert.ok(zipped.estate.rules.some((r) => r.kind === "if"));
writeEstateFixture(zipped.estate, path.join(tmp, "out.estate.json"));
assert.ok(fs.existsSync(path.join(tmp, "out.estate.json")));
fs.rmSync(tmp, { recursive: true, force: true });

console.log(
  `estate-ingest selftest OK — programs=${estate.programs.length} ghosts=${estate.ghosts.length} ` +
    `rules=${estate.rules.length} refactors=${estate.refactors.length} impactRisk=${impact.riskScore}`
);
