#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { transpile } from "../src/index.js";

const [cmd, ...rest] = process.argv.slice(2);

function usage() {
  console.log(`easylang build <file.easy> [--out=file.cob] [--program=NAME]
easylang check <file.easy>`);
}

if (!cmd || cmd === "help") {
  usage();
  process.exit(0);
}

const file = rest.find((a) => !a.startsWith("--"));
const outArg = rest.find((a) => a.startsWith("--out="));
const progArg = rest.find((a) => a.startsWith("--program="));

if (!file) {
  usage();
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
const programId =
  (progArg && progArg.slice("--program=".length)) ||
  path.basename(file, path.extname(file)).replace(/[^A-Za-z0-9-]/g, "").toUpperCase() ||
  "EASYPROG";

const result = transpile(source, {
  programId,
  sourcePath: path.resolve(file),
  basedir: path.dirname(path.resolve(file)),
});

if (cmd === "check") {
  if (!result.ok) {
    for (const d of result.diagnostics) {
      console.error(`${file}:${d.line}:${d.column} ${d.severity}: ${d.message}`);
    }
    process.exit(1);
  }
  console.log("EasyLang OK");
  process.exit(0);
}

if (cmd === "build") {
  if (!result.ok) {
    for (const d of result.diagnostics) {
      console.error(`${file}:${d.line}:${d.column} ${d.severity}: ${d.message}`);
    }
    process.exit(1);
  }
  const out =
    (outArg && outArg.slice("--out=".length)) ||
    file.replace(/\.easy$/i, ".cob");
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, result.cobol, "utf8");
  console.log(`Wrote ${out}`);
  process.exit(0);
}

usage();
process.exit(1);
