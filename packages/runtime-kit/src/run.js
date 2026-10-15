import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { compileSample } from "./compile.js";
import { findCobc, gnuCobolEnv } from "./doctor.js";
import { readTomlLite } from "./paths.js";

/**
 * When cobc is missing, still show the sample's expected output in DEMO mode
 * so the playground is usable for learning UI/flow before installing the compiler.
 */
function demoRun(sampleDir) {
  const cfg = readTomlLite(sampleDir);
  const expectedPath = path.join(sampleDir, cfg.expectStdout);
  const compile = compileSample(sampleDir);
  let stdout = "";
  if (fs.existsSync(expectedPath)) {
    stdout = fs.readFileSync(expectedPath, "utf8");
  }

  return {
    ok: true,
    demo: true,
    stage: "demo",
    compile,
    stdout,
    stderr:
      "DEMO MODE (cobc missing)\n" +
      "Showing the sample's expected output so you can explore the playground.\n" +
      "Install GnuCOBOL, click Doctor, then Run again for a REAL compile+execute.",
    code: 0,
    executable: null,
  };
}

export function runSample(sampleDir) {
  if (!findCobc()) {
    return demoRun(sampleDir);
  }

  const compile = compileSample(sampleDir);
  if (!compile.ok) {
    return {
      ok: false,
      demo: false,
      stage: "compile",
      compile,
      stdout: "",
      stderr: compile.stderr,
      code: compile.code,
      executable: null,
    };
  }

  const result = spawnSync(compile.executable, [], {
    cwd: sampleDir,
    encoding: "utf8",
    env: gnuCobolEnv(),
  });

  return {
    ok: result.status === 0,
    demo: false,
    stage: "run",
    compile,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    code: result.status ?? 1,
    executable: compile.executable,
  };
}
