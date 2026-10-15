import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { findCobc, gnuCobolEnv } from "./doctor.js";
import { parseCobcErrors } from "./parseErrors.js";

/** Scratch basename — Linux GnuCOBOL rejects names starting with `_`. */
export const TRY_SCRATCH_BASE = "trytmp";

/**
 * Compile + run a one-off COBOL program (Docs / playground try).
 * Uses src/trytmp.cob so the main sample interest.cob is not overwritten.
 */
export function tryCobolSource(sampleDir, cobolSource, { programId = "DOCTRY" } = {}) {
  const cobc = findCobc();
  if (!cobc) {
    return {
      ok: false,
      missingTool: true,
      stage: "tool",
      stdout: "",
      stderr:
        "GnuCOBOL (cobc) missing. Run scripts/setup-gnucobol-windows.ps1 then Doctor.",
      diagnostics: [],
      code: 127,
    };
  }

  const srcDir = path.join(sampleDir, "src");
  const binDir = path.join(sampleDir, "bin");
  const copyDir = path.join(sampleDir, "copybooks");
  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(binDir, { recursive: true });

  const srcFile = path.join(srcDir, `${TRY_SCRATCH_BASE}.cob`);
  const outName = process.platform === "win32" ? `${TRY_SCRATCH_BASE}.exe` : TRY_SCRATCH_BASE;
  const outPath = path.join(binDir, outName);

  const header = `*> Docs try — temporary\n`;
  let body = String(cobolSource || "");
  if (!/PROGRAM-ID/i.test(body)) {
    body = `${header}IDENTIFICATION DIVISION.
PROGRAM-ID. ${programId}.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-DUMMY PIC X VALUE " ".
PROCEDURE DIVISION.
${body}
    STOP RUN.
`;
  } else if (!body.startsWith("*>")) {
    body = header + body;
  }

  fs.writeFileSync(srcFile, body, "utf8");

  const args = ["-x", "-free", srcFile, "-I", copyDir, "-o", outPath];
  const compiled = spawnSync(cobc, args, {
    cwd: sampleDir,
    encoding: "utf8",
    env: gnuCobolEnv(),
  });
  const cOut = compiled.stdout || "";
  const cErr = compiled.stderr || "";
  const { diagnostics } = parseCobcErrors(`${cOut}\n${cErr}`, sampleDir);

  if (compiled.status !== 0 || !fs.existsSync(outPath)) {
    return {
      ok: false,
      stage: "compile",
      stdout: cOut,
      stderr: cErr || "Compile failed",
      diagnostics,
      code: compiled.status ?? 1,
    };
  }

  const ran = spawnSync(outPath, [], {
    cwd: sampleDir,
    encoding: "utf8",
    env: gnuCobolEnv(),
  });

  return {
    ok: ran.status === 0,
    stage: "run",
    stdout: ran.stdout || "",
    stderr: ran.stderr || "",
    diagnostics: [],
    code: ran.status ?? 1,
  };
}
