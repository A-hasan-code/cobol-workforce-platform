import fs from "node:fs";
import path from "node:path";
import { runSample } from "./run.js";
import { findCobc } from "./doctor.js";
import { readTomlLite } from "./paths.js";
import { compileSample } from "./compile.js";

function normalize(text) {
  return (text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "\n");
}

export function testSample(sampleDir) {
  const cfg = readTomlLite(sampleDir);
  const expectedPath = path.join(sampleDir, cfg.expectStdout);
  if (!fs.existsSync(expectedPath)) {
    return {
      ok: false,
      message: `Expected file missing: ${expectedPath}`,
      run: null,
    };
  }

  const expected = normalize(fs.readFileSync(expectedPath, "utf8"));

  if (!findCobc()) {
    const compile = compileSample(sampleDir);
    return {
      ok: false,
      demoBlocked: true,
      message:
        "TEST blocked — cobc missing.\n" +
        "Install GnuCOBOL and click Doctor first.\n" +
        "Tip: click Run for DEMO output while you install.",
      run: {
        ok: false,
        demo: true,
        stage: "demo",
        compile,
        stdout: "",
        stderr: compile.stderr,
        code: 127,
      },
      expected,
      actual: "",
    };
  }

  const run = runSample(sampleDir);
  if (!run.ok && run.stage === "compile") {
    return {
      ok: false,
      message: "Compile failed",
      run,
      expected,
      actual: "",
    };
  }

  const actual = normalize(run.stdout);
  const ok = expected === actual && run.code === 0;

  return {
    ok,
    message: ok
      ? "PASS — stdout matches expected/interest.out"
      : "FAIL — stdout does not match expected output (or non-zero exit)",
    run,
    expected,
    actual,
  };
}
