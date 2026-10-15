import fs from "node:fs";
import path from "node:path";

/**
 * Clear lab scratch files so learners get a clean sandbox (does not delete samples).
 */
export function resetLabSandbox(sampleDir) {
  const removed = [];
  const candidates = [
    path.join(sampleDir, "src", "trytmp.cob"),
    path.join(sampleDir, "src", "_try.cob"), // legacy name (Linux cobc forbids leading _)
    path.join(sampleDir, "easydemo.txt"),
    path.join(sampleDir, "bin", "trytmp"),
    path.join(sampleDir, "bin", "trytmp.exe"),
    path.join(sampleDir, "bin", "trytmp.so"),
    path.join(sampleDir, "bin", "_try"),
    path.join(sampleDir, "bin", "_try.exe"),
    path.join(sampleDir, "bin", "_try.so"),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        removed.push(path.relative(sampleDir, p));
      }
    } catch {
      /* ignore locked files */
    }
  }

  // old selftest / try scratch modules
  const srcDir = path.join(sampleDir, "src");
  if (fs.existsSync(srcDir)) {
    for (const name of fs.readdirSync(srcDir)) {
      if (
        name.startsWith("_selftest_") ||
        name.startsWith("_try") ||
        name === "trytmp.cob" ||
        name.startsWith("trytmp.")
      ) {
        const p = path.join(srcDir, name);
        try {
          fs.unlinkSync(p);
          removed.push(path.join("src", name));
        } catch {
          /* ignore */
        }
      }
    }
  }

  return { ok: true, removed };
}
