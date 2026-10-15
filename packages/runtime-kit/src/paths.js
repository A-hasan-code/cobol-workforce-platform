import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root: packages/runtime-kit/src -> ../../.. */
export function repoRoot() {
  return path.resolve(__dirname, "../../..");
}

export function defaultSampleDir() {
  return path.join(repoRoot(), "samples", "bank-playground");
}

export function resolveSampleDir(cliPath) {
  if (cliPath) return path.resolve(cliPath);
  return defaultSampleDir();
}

export function readTomlLite(sampleDir) {
  const file = path.join(sampleDir, "cobol.toml");
  if (!fs.existsSync(file)) {
    throw new Error(`cobol.toml not found in ${sampleDir}`);
  }
  const text = fs.readFileSync(file, "utf8");
  const get = (key) => {
    const re = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"`, "m");
    const m = text.match(re);
    return m ? m[1] : null;
  };
  return {
    name: get("name") || "sample",
    main: get("main") || "interest.cob",
    executable: get("executable") || "interest",
    src: get("src") || "src",
    copybooks: get("copybooks") || "copybooks",
    testdata: get("testdata") || "testdata",
    expected: get("expected") || "expected",
    bin: get("bin") || "bin",
    expectStdout: get("expect_stdout") || "expected/interest.out",
  };
}
