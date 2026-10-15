/**
 * Customer zip / export ingest — expand archive then run git-folder ingest.
 * Uses system `tar` (Windows 10+ / Linux / macOS) so we stay dependency-free.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ingestEstate } from "./ingest.js";

/**
 * Find an estate root inside extracted folder (src/ or copybooks/ present).
 */
export function findEstateRoot(dir) {
  const markers = ["src", "copybooks", "jcl"];
  const hasMarker = (d) => markers.some((m) => fs.existsSync(path.join(d, m)));
  if (hasMarker(dir)) return dir;

  const kids = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const k of kids) {
    const child = path.join(dir, k.name);
    if (hasMarker(child)) return child;
  }
  // Flat dump of .cob/.cpy — synthesize layout
  const cob = listExt(dir, [".cob", ".cbl"]);
  const cpy = listExt(dir, [".cpy"]);
  if (cob.length || cpy.length) {
    const synth = path.join(dir, "_estate_root");
    fs.mkdirSync(path.join(synth, "src"), { recursive: true });
    fs.mkdirSync(path.join(synth, "copybooks"), { recursive: true });
    fs.mkdirSync(path.join(synth, "jcl"), { recursive: true });
    fs.mkdirSync(path.join(synth, "inventory"), { recursive: true });
    for (const f of cob) {
      fs.copyFileSync(f, path.join(synth, "src", path.basename(f)));
    }
    for (const f of cpy) {
      fs.copyFileSync(f, path.join(synth, "copybooks", path.basename(f)));
    }
    fs.writeFileSync(
      path.join(synth, "inventory", "documented.json"),
      JSON.stringify({ programs: [] }, null, 2)
    );
    fs.writeFileSync(
      path.join(synth, "inventory", "loadlib.json"),
      JSON.stringify({ members: [] }, null, 2)
    );
    return synth;
  }
  throw new Error(
    "Zip does not look like an estate (need src/ or copybooks/ or .cob/.cpy files)"
  );
}

function listExt(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isFile() && exts.includes(path.extname(name).toLowerCase())) {
      out.push(abs);
    }
  }
  return out;
}

export function extractZip(zipPath, destDir) {
  if (!fs.existsSync(zipPath)) throw new Error(`Zip not found: ${zipPath}`);
  fs.mkdirSync(destDir, { recursive: true });
  // tar on Win10+/Linux extracts zip
  execFileSync("tar", ["-xf", zipPath, "-C", destDir], { stdio: "pipe" });
  return destDir;
}

/**
 * Ingest a customer export zip into estate model shape.
 * @returns {{ estate: object, workDir: string, estateRoot: string }}
 */
export function ingestFromZip(zipPath, { keepWorkDir = false } = {}) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "estate-zip-"));
  try {
    extractZip(zipPath, workDir);
    const estateRoot = findEstateRoot(workDir);
    const estate = ingestEstate(estateRoot);
    estate.ingestRun = {
      ...(estate.ingestRun || {}),
      connector: "customer-zip",
      zipPath: path.resolve(zipPath),
      scope: estateRoot,
    };
    return { estate, workDir, estateRoot };
  } finally {
    if (!keepWorkDir) {
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  }
}
