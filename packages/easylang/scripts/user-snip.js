import { transpile } from "../src/index.js";
import { tryCobolSource } from "../../runtime-kit/src/try.js";
import { defaultSampleDir } from "../../runtime-kit/src/paths.js";

const easy = `msg = "HELLO FROM DOCS"
a=3
b=2
print(a+b, msg)
`;

const t = transpile(easy, { programId: "T" });
console.log("ok=", t.ok);
if (!t.ok) console.log(t.diagnostics);
else {
  console.log(t.cobol);
  const r = tryCobolSource(defaultSampleDir(), t.cobol, { programId: "T" });
  console.log("run ok=", r.ok);
  console.log("stdout:", JSON.stringify(r.stdout));
  if (!r.ok) console.log("stderr:", r.stderr);
}
