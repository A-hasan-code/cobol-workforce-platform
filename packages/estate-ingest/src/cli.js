import fs from "node:fs";
import path from "node:path";
import {
  ingestEstate,
  writeEstateFixture,
  defaultSampleRoot,
  defaultFixturePath,
} from "./ingest.js";
import { impactAnalysis } from "./impact.js";
import { suggestRefactors, writeRefactorTests } from "./refactor.js";
import { evaluateRiskGate, loadRiskAcks } from "./riskGate.js";
import { ingestFromZip } from "./zipIngest.js";

function argValue(args, key) {
  const hit = args.find((a) => a.startsWith(`${key}=`));
  return hit ? hit.slice(key.length + 1) : null;
}

function hasFlag(args, name) {
  return args.includes(name);
}

export function main(argv) {
  const cmd = argv[0] || "help";
  const sample = argValue(argv, "--sample") || defaultSampleRoot();

  if (cmd === "ingest") {
    const estate = ingestEstate(sample);
    const out = argValue(argv, "--out") || defaultFixturePath();
    writeEstateFixture(estate, out);
    const g = estate.ghosts?.length || 0;
    const r = estate.rules?.length || 0;
    console.log(
      `Ingest OK → ${out}\n` +
        `  programs=${estate.programs.length} copybooks=${estate.copybooks.length} ` +
        `jobs=${estate.jobs.length} deps=${estate.dependencies.length} ghosts=${g} ` +
        `rules=${r} refactors=${estate.refactors?.length || 0}`
    );
    process.exit(0);
  }

  if (cmd === "ghosts") {
    const estate = ingestEstate(sample);
    console.log(`Ghosts (${estate.ghosts.length}):`);
    for (const g of estate.ghosts) {
      console.log(`  [${g.kind}] ${g.programId} — ${g.evidence}`);
    }
    if (!estate.ghosts.length) console.log("  (none)");
    process.exit(0);
  }

  if (cmd === "impact") {
    const estate = ingestEstate(sample);
    const target = argValue(argv, "--target");
    const field = argValue(argv, "--field");
    const report = impactAnalysis(estate, { target, field });
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.ok ? 0 : 1);
  }

  if (cmd === "rules") {
    const estate = ingestEstate(sample);
    const rules = estate.rules || [];
    console.log(`Rules (${rules.length}):`);
    for (const r of rules.slice(0, 40)) {
      console.log(`  [${r.kind}] ${r.programId} L${r.line}: ${r.summary}`);
    }
    if (rules.length > 40) console.log(`  … +${rules.length - 40} more`);
    process.exit(0);
  }

  if (cmd === "refactor") {
    const estate = ingestEstate(sample);
    const suggestions = estate.refactors?.length
      ? estate.refactors
      : suggestRefactors(estate);
    console.log(`Refactor suggestions (${suggestions.length}):`);
    for (const s of suggestions) {
      console.log(`  [${s.severity}] ${s.title}`);
      console.log(`    ${s.rationale}`);
    }
    const writeDir = argValue(argv, "--write-tests");
    if (writeDir) {
      const written = writeRefactorTests(suggestions, writeDir, { fs, path });
      console.log(`Wrote ${written.length} test stub(s) → ${writeDir}`);
    }
    process.exit(0);
  }

  if (cmd === "risk-gate") {
    const estate = ingestEstate(sample);
    const ackPath =
      argValue(argv, "--ack") ||
      path.join(sample, "inventory", "risk-ack.json");
    const acks = loadRiskAcks(ackPath, fs);
    if (hasFlag(argv, "--ack-high-risk")) {
      acks.push({ field: "ACCT-BAL-TEXT", reason: "CLI --ack-high-risk" });
    }
    const fields = (argValue(argv, "--fields") || "ACCT-BAL-TEXT")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const gate = evaluateRiskGate(estate, { fields, acks });
    console.log(JSON.stringify(gate, null, 2));
    process.exit(gate.ok ? 0 : 2);
  }

  if (cmd === "zip") {
    const zipPath = argValue(argv, "--zip");
    if (!zipPath) {
      console.error("zip requires --zip=path/to/export.zip");
      process.exit(1);
    }
    const { estate } = ingestFromZip(zipPath, { keepWorkDir: false });
    const out =
      argValue(argv, "--out") ||
      path.join(path.dirname(zipPath), "customer.estate.json");
    writeEstateFixture(estate, out);
    console.log(
      `Zip ingest OK → ${out}\n` +
        `  programs=${estate.programs.length} ghosts=${estate.ghosts.length} ` +
        `rules=${estate.rules?.length || 0} connector=${estate.ingestRun?.connector}`
    );
    process.exit(0);
  }

  console.log(`estate-ingest <ingest|ghosts|impact|rules|refactor|risk-gate|zip>
  [--sample=path] [--out=path]
  impact --target=ACCTREC|prog:interest|cpy:acctrec
  impact --field=ACCT-BAL-TEXT
  refactor [--write-tests=dir]
  risk-gate [--fields=ACCT-BAL-TEXT] [--ack=path] [--ack-high-risk]
  zip --zip=export.zip [--out=customer.estate.json]`);
  process.exit(cmd === "help" ? 0 : 1);
}
