import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseProgramId,
  parseCopyStatements,
  parseCallStatements,
  parseSelectAssign,
} from "./parseCobol.js";
import { parseCopybookFields, copybookBaseName } from "./parseCopybook.js";
import { parseJcl, collectExecPrograms } from "./parseJcl.js";
import { detectGhosts } from "./ghosts.js";
import { extractRulesFromSource } from "./rules.js";
import { suggestRefactors } from "./refactor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function defaultSampleRoot() {
  return path.resolve(__dirname, "../../../samples/bank-playground");
}

export function repoRoot() {
  return path.resolve(__dirname, "../../..");
}

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      if (name === "bin" || name === "node_modules") continue;
      walkFiles(abs, exts, out);
    } else if (exts.has(path.extname(name).toLowerCase())) {
      // Skip Studio scratch (_try.cob) and editor temps
      if (name.startsWith("_") || name.endsWith("~")) continue;
      out.push(abs);
    }
  }
  return out;
}

function relToRepo(abs) {
  const root = repoRoot();
  return path.relative(root, abs).replace(/\\/g, "/");
}

function readJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/**
 * Ingest a playground / git-folder estate into the Phase-1 estate model shape.
 */
export function ingestEstate(sampleDir = defaultSampleRoot()) {
  const srcDir = path.join(sampleDir, "src");
  const cpyDir = path.join(sampleDir, "copybooks");
  const jclDir = path.join(sampleDir, "jcl");
  const invDir = path.join(sampleDir, "inventory");

  const cobFiles = walkFiles(srcDir, new Set([".cob", ".cbl"]));
  const cpyFiles = walkFiles(cpyDir, new Set([".cpy"]));
  const jclFiles = walkFiles(jclDir, new Set([".jcl", ".JCL"]));

  const documented = readJson(path.join(invDir, "documented.json"), { programs: [] });
  const loadlib = readJson(path.join(invDir, "loadlib.json"), { members: [] });
  const docNames = new Set((documented.programs || []).map((n) => String(n).toUpperCase()));
  const loadNames = new Set((loadlib.members || []).map((n) => String(n).toUpperCase()));

  const programs = [];
  const dependencies = [];
  const datasets = [];
  const datasetById = new Map();
  const sourceNames = new Set();
  const callNames = new Set();
  const dynamicNames = new Set();
  const programByName = new Map();

  for (const abs of cobFiles) {
    const source = fs.readFileSync(abs, "utf8");
    const name = parseProgramId(source) || path.basename(abs, path.extname(abs)).toUpperCase();
    sourceNames.add(name);
    const id = `prog:${name.toLowerCase()}`;
    const copies = parseCopyStatements(source);
    const { staticCalls, dynamicTargets } = parseCallStatements(source);
    for (const c of staticCalls) callNames.add(c);
    for (const d of dynamicTargets) dynamicNames.add(d);

    const prog = {
      id,
      name,
      sourcePath: relToRepo(abs),
      loadPresent: loadNames.has(name),
      status: "documented",
      dialect: "gnucobol-free",
    };
    programs.push(prog);
    programByName.set(name, prog);

    for (const cpy of copies) {
      dependencies.push({
        from: id,
        to: `cpy:${cpy.toLowerCase()}`,
        type: "COPY",
      });
    }
    for (const cal of staticCalls) {
      dependencies.push({
        from: id,
        to: `prog:${cal.toLowerCase()}`,
        type: "CALL",
      });
    }
    for (const sel of parseSelectAssign(source)) {
      const dsId = `ds:${sel.ddname.toLowerCase()}`;
      if (!datasetById.has(dsId)) {
        const ds = {
          id: dsId,
          ddname: sel.ddname,
          dsnPattern: sel.assign,
          producers: [],
          consumers: [],
        };
        datasetById.set(dsId, ds);
        datasets.push(ds);
      }
      const ds = datasetById.get(dsId);
      if (!ds.consumers.includes(id)) ds.consumers.push(id);
      dependencies.push({ from: id, to: dsId, type: "DD" });
    }
  }

  // Ensure CALL / JCL / load-only programs exist as nodes
  const ensureProgram = (name, { sourcePath = null, loadPresent = false } = {}) => {
    if (programByName.has(name)) {
      const p = programByName.get(name);
      if (loadPresent) p.loadPresent = true;
      return p;
    }
    const prog = {
      id: `prog:${name.toLowerCase()}`,
      name,
      sourcePath,
      loadPresent,
      status: "documented",
      dialect: sourcePath ? "gnucobol-free" : "unknown",
    };
    programs.push(prog);
    programByName.set(name, prog);
    return prog;
  };

  for (const name of loadNames) {
    ensureProgram(name, { loadPresent: true });
  }
  for (const name of callNames) {
    ensureProgram(name, { loadPresent: loadNames.has(name) });
  }
  for (const name of dynamicNames) {
    ensureProgram(name, { loadPresent: false });
  }

  const copybooks = [];
  const copybookIds = new Set();
  for (const abs of cpyFiles) {
    const source = fs.readFileSync(abs, "utf8");
    const base = copybookBaseName(path.basename(abs));
    const id = `cpy:${base.toLowerCase()}`;
    copybookIds.add(id);
    copybooks.push({
      id,
      name: path.basename(abs),
      path: relToRepo(abs),
      fields: parseCopybookFields(source),
    });
  }

  // Drop COPY deps to missing copybooks? keep them — orphan COPY target signal later
  const jobs = [];
  const parsedJobs = jclFiles.map((abs) => {
    const parsed = parseJcl(fs.readFileSync(abs, "utf8"), relToRepo(abs));
    return parsed;
  });
  const jclNames = collectExecPrograms(parsedJobs);

  for (const name of jclNames) {
    ensureProgram(name, { loadPresent: loadNames.has(name) });
  }

  for (const pj of parsedJobs) {
    const jobId = `job:${pj.jobName.toLowerCase()}`;
    const steps = pj.steps.map((s) => {
      const prog = ensureProgram(s.program, { loadPresent: loadNames.has(s.program) });
      dependencies.push({
        from: jobId,
        to: prog.id,
        type: "EXEC",
      });
      return { name: s.name, programId: prog.id };
    });
    for (const dd of pj.dds) {
      const dsId = `ds:${dd.ddname.toLowerCase()}`;
      if (!datasetById.has(dsId)) {
        const ds = {
          id: dsId,
          ddname: dd.ddname,
          dsnPattern: dd.dsn,
          producers: [],
          consumers: [],
        };
        datasetById.set(dsId, ds);
        datasets.push(ds);
      }
      dependencies.push({ from: jobId, to: dsId, type: "DD" });
    }
    jobs.push({
      id: jobId,
      name: pj.jobName,
      jclPath: pj.jclPath,
      steps,
    });
  }

  const { ghosts, statusByName } = detectGhosts({
    sourceNames: [...sourceNames],
    loadNames: [...loadNames],
    jclNames: [...jclNames],
    callNames: [...callNames],
    dynamicNames: [...dynamicNames],
    docNames: [...docNames],
  });

  for (const p of programs) {
    if (statusByName.has(p.name)) {
      p.status = statusByName.get(p.name);
    } else if (docNames.has(p.name)) {
      p.status = "documented";
    }
  }

  // Deduplicate dependencies
  const depKey = (d) => `${d.from}|${d.to}|${d.type}`;
  const seen = new Set();
  const uniqueDeps = [];
  for (const d of dependencies) {
    const k = depKey(d);
    if (seen.has(k)) continue;
    // skip job ids that aren't in programs/copybooks/datasets — jobs are valid from
    seen.add(k);
    uniqueDeps.push(d);
  }

  const rules = [];
  for (const p of programs) {
    if (!p.sourcePath) continue;
    const abs = path.resolve(repoRoot(), p.sourcePath);
    if (!fs.existsSync(abs)) continue;
    try {
      rules.push(...extractRulesFromSource(fs.readFileSync(abs, "utf8"), p.name));
    } catch {
      /* skip unreadable */
    }
  }

  const estate = {
    version: "0.2.0",
    name: path.basename(sampleDir),
    programs: programs.sort((a, b) => a.name.localeCompare(b.name)),
    copybooks: copybooks.sort((a, b) => a.name.localeCompare(b.name)),
    dependencies: uniqueDeps,
    jobs,
    datasets,
    ghosts,
    rules,
    refactors: [],
    environments: [
      { id: "env:local", name: "local", risk: "none" },
      { id: "env:ci", name: "ci", risk: "ephemeral" },
      { id: "env:staging", name: "staging", risk: "controlled" },
      { id: "env:prod", name: "prod", risk: "highest-gated" },
    ],
    ingestRun: {
      when: new Date().toISOString(),
      connector: "git-folder",
      scope: relToRepo(sampleDir),
      stats: {
        programs: programs.length,
        copybooks: copybooks.length,
        jobs: jobs.length,
        dependencies: uniqueDeps.length,
        ghosts: ghosts.length,
        rules: rules.length,
      },
    },
  };

  estate.refactors = suggestRefactors(estate);
  estate.ingestRun.stats.refactors = estate.refactors.length;

  return estate;
}

export function writeEstateFixture(estate, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(estate, null, 2) + "\n", "utf8");
  return outPath;
}

export function defaultFixturePath() {
  return path.resolve(repoRoot(), "packages/estate-model/fixtures/bank-playground.estate.json");
}
