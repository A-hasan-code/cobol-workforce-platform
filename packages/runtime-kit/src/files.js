import fs from "node:fs";
import path from "node:path";

const ALLOWED_EXT = new Set([
  ".cob",
  ".cbl",
  ".cpy",
  ".in",
  ".out",
  ".md",
  ".toml",
  ".jcl",
  ".json",
  ".easy",
]);

function assertInside(sampleDir, relPath) {
  const abs = path.resolve(sampleDir, relPath);
  const root = path.resolve(sampleDir);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    throw new Error("Path escapes sample directory");
  }
  return abs;
}

export function listSampleFiles(sampleDir) {
  const out = [];
  const walk = (dir, prefix = "") => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      if (name === "bin") continue;
      const abs = path.join(dir, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      const st = fs.statSync(abs);
      if (st.isDirectory()) walk(abs, rel);
      else out.push(rel.replace(/\\/g, "/"));
    }
  };
  walk(sampleDir);
  return out.sort();
}

export function readSampleFile(sampleDir, relPath) {
  const abs = assertInside(sampleDir, relPath);
  const ext = path.extname(abs).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`File type not allowed: ${ext}`);
  }
  return fs.readFileSync(abs, "utf8");
}

export function writeSampleFile(sampleDir, relPath, content) {
  const abs = assertInside(sampleDir, relPath);
  const ext = path.extname(abs).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`File type not allowed: ${ext}`);
  }
  if (relPath.replace(/\\/g, "/").includes("..")) {
    throw new Error("Invalid path");
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}
