import { transpile } from "../src/index.js";
import { tryCobolSource } from "../../runtime-kit/src/try.js";
import { defaultSampleDir } from "../../runtime-kit/src/paths.js";

const easy = `msg = "DOCS-OK"
print(msg)
`;
const t = transpile(easy, { programId: "DOCTRY" });
if (!t.ok) {
  console.error(t.diagnostics);
  process.exit(1);
}
const r = tryCobolSource(defaultSampleDir(), t.cobol, { programId: "DOCTRY" });
console.log(r.stdout.trim());
if (!r.ok) {
  console.error(r.stderr);
  process.exit(1);
}
