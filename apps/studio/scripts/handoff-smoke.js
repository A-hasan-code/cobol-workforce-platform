import fs from "node:fs";
import path from "node:path";
import { buildHandoffPack } from "../server/handoff.js";
import { resetLabSandbox } from "../server/labReset.js";
import { defaultSampleDir } from "../../../packages/runtime-kit/src/paths.js";

const sample = defaultSampleDir();
const r = buildHandoffPack(sample, {
  mode: "easy",
  source: `msg = "HI"\nprint(msg)\n`,
  programId: "PACKTEST",
});
if (!r.ok) {
  console.error(r);
  process.exit(1);
}
const out = path.join(sample, "bin", "_packtest.zip");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, r.zip);
console.log("handoff OK", r.filename, r.zip.length, "bytes →", out);

const reset = resetLabSandbox(sample);
console.log("lab reset", reset);
