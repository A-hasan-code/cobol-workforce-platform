import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { findCobc, gnuCobolEnv } from "./doctor.js";
import { parseCobcErrors } from "./parseErrors.js";
import { readTomlLite } from "./paths.js";

function missingCobcResult(cfg) {
  return {
    ok: false,
    missingTool: true,
    code: 127,
    stdout: "",
    stderr:
      "GnuCOBOL (cobc) is not installed.\n" +
      "Windows (no Admin): powershell -ExecutionPolicy Bypass -File scripts\\setup-gnucobol-windows.ps1\n" +
      "Then click Doctor and Compile again.",
    diagnostics: [
      {
        file: cfg?.main || "interest.cob",
        line: 1,
        column: 1,
        severity: "error",
        message: "cobc missing — run scripts/setup-gnucobol-windows.ps1 then Doctor",
        raw: "",
      },
    ],
    executable: null,
  };
}

export function compileSample(sampleDir) {
  const cfg = readTomlLite(sampleDir);
  const cobc = findCobc();
  if (!cobc) {
    return missingCobcResult(cfg);
  }

  const srcFile = path.join(sampleDir, cfg.src, cfg.main);
  const copyDir = path.join(sampleDir, cfg.copybooks);
  const binDir = path.join(sampleDir, cfg.bin);
  fs.mkdirSync(binDir, { recursive: true });

  const outName = process.platform === "win32" ? `${cfg.executable}.exe` : cfg.executable;
  const outPath = path.join(binDir, outName);

  if (!fs.existsSync(srcFile)) {
    return {
      ok: false,
      code: 1,
      stdout: "",
      stderr: `Source not found: ${srcFile}`,
      diagnostics: [
        {
          file: cfg.main,
          line: 1,
          column: 1,
          severity: "error",
          message: `Source not found: ${srcFile}`,
          raw: "",
        },
      ],
      executable: null,
    };
  }

  const args = ["-x", "-free", srcFile, "-I", copyDir, "-o", outPath];
  const result = spawnSync(cobc, args, {
    cwd: sampleDir,
    encoding: "utf8",
    env: gnuCobolEnv(),
  });

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const combined = `${stdout}\n${stderr}`;
  const { diagnostics } = parseCobcErrors(combined, sampleDir);
  const ok = result.status === 0 && fs.existsSync(outPath);

  return {
    ok,
    code: result.status ?? 1,
    stdout,
    stderr,
    diagnostics,
    executable: ok ? outPath : null,
    args: [cobc, ...args],
  };
}
