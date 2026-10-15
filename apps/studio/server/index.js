import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  doctor,
  compileSample,
  runSample,
  testSample,
  tryCobolSource,
  defaultSampleDir,
  listSampleFiles,
  readSampleFile,
  writeSampleFile,
  repoRoot,
} from "@cobol/runtime-kit";
import {
  ingestEstate,
  impactAnalysis,
  suggestRefactors,
  evaluateRiskGate,
  loadRiskAcks,
  ingestFromZip,
  writeEstateFixture,
} from "@cobol/estate-ingest";
import { transpile } from "@cobol/easylang";
import { buildHandoffPack } from "./handoff.js";
import { resetLabSandbox } from "./labReset.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const studioRoot = path.resolve(__dirname, "..");
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || 8787);
/** Render / containers need a public bind; local still works via localhost. */
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
app.use(express.json({ limit: "2mb" }));

function sample() {
  return defaultSampleDir();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cobol-studio" });
});

/** Lightweight keep-alive for free hosts (Render sleep). External cron should hit this. */
app.get("/api/ping", (_req, res) => {
  res.status(200).type("text/plain").send("pong");
});

app.get("/api/doctor", (_req, res) => {
  res.json(doctor());
});

app.get("/api/files", (_req, res) => {
  try {
    res.json({ files: listSampleFiles(sample()) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/file", (req, res) => {
  try {
    const rel = String(req.query.path || "");
    const content = readSampleFile(sample(), rel);
    res.json({ path: rel, content });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/file", (req, res) => {
  try {
    const rel = String(req.body.path || "");
    const content = String(req.body.content ?? "");
    writeSampleFile(sample(), rel, content);
    res.json({ ok: true, path: rel });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/compile", (_req, res) => {
  res.json(compileSample(sample()));
});

app.post("/api/run", (_req, res) => {
  res.json(runSample(sample()));
});

app.post("/api/test", (_req, res) => {
  res.json(testSample(sample()));
});

/** Easy/COBOL → proven run → downloadable ZIP for bank developers */
app.post("/api/handoff", (req, res) => {
  try {
    const mode = String(req.body.mode || "easy");
    const source = String(req.body.source ?? "");
    const programId = String(req.body.programId || "HANDOFF");
    const requireTest = Boolean(req.body.requireTest);
    const pack = buildHandoffPack(sample(), { mode, source, programId, requireTest });
    if (!pack.ok) {
      return res.status(400).json({
        ok: false,
        stage: pack.stage,
        error: pack.error,
        diagnostics: pack.diagnostics || [],
        cobol: pack.cobol || "",
      });
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${pack.filename}"`);
    res.send(pack.zip);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/** Clear scratch lab files (keeps real samples) */
app.post("/api/lab/reset", (_req, res) => {
  try {
    res.json(resetLabSandbox(sample()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/explain", (_req, res) => {
  try {
    const p = path.join(sample(), "EXPLAIN.md");
    res.json({ content: fs.readFileSync(p, "utf8") });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.get("/api/estate", (_req, res) => {
  try {
    res.json(ingestEstate(sample()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/easy/transpile", (req, res) => {
  try {
    const source = String(req.body.source ?? "");
    const programId = String(req.body.programId || "EASYPROG");
    const outPath = req.body.outPath ? String(req.body.outPath) : null;
    const basedir = path.join(sample(), "src");
    const result = transpile(source, { programId, basedir });
    if (result.ok && outPath) {
      writeSampleFile(sample(), outPath, result.cobol);
    }
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/** Docs / lesson try: EasyLang or COBOL → compile → run (does not touch interest.cob). */
app.post("/api/try", (req, res) => {
  try {
    const mode = String(req.body.mode || "easy");
    let cobol = String(req.body.cobol || "");
    const easy = String(req.body.easy || "");
    const programId = String(req.body.programId || "DOCTRY");

    if (mode === "easy" || (easy && !cobol)) {
      const t = transpile(easy, { programId, basedir: path.join(sample(), "src") });
      if (!t.ok) {
        return res.json({
          ok: false,
          stage: "easy",
          stdout: "",
          stderr: "EasyLang errors",
          diagnostics: t.diagnostics,
          cobol: "",
        });
      }
      cobol = t.cobol;
    }

    const ran = tryCobolSource(sample(), cobol, { programId });
    res.json({ ...ran, cobol });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/estate/ghosts", (_req, res) => {
  try {
    const estate = ingestEstate(sample());
    res.json({
      count: estate.ghosts.length,
      ghosts: estate.ghosts,
      programs: estate.programs.filter((p) => p.status && p.status !== "documented"),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/estate/impact", (req, res) => {
  try {
    const estate = ingestEstate(sample());
    const target = req.query.target ? String(req.query.target) : undefined;
    const field = req.query.field ? String(req.query.field) : undefined;
    if (!target && !field) {
      return res.status(400).json({ error: "Provide ?target= or ?field=" });
    }
    res.json(impactAnalysis(estate, { target, field }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/estate/rules", (_req, res) => {
  try {
    const estate = ingestEstate(sample());
    res.json({ count: estate.rules?.length || 0, rules: estate.rules || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/estate/refactors", (_req, res) => {
  try {
    const estate = ingestEstate(sample());
    const suggestions = estate.refactors?.length
      ? estate.refactors
      : suggestRefactors(estate);
    res.json({ count: suggestions.length, refactors: suggestions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/estate/risk-gate", (_req, res) => {
  try {
    const estate = ingestEstate(sample());
    const ackPath = path.join(sample(), "inventory", "risk-ack.json");
    const acks = loadRiskAcks(ackPath, fs);
    res.json(evaluateRiskGate(estate, { fields: ["ACCT-BAL-TEXT"], acks }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Customer zip ingest — multipart-free: JSON { zipBase64 } or { zipPath } (local path). */
app.post("/api/estate/zip-ingest", (req, res) => {
  try {
    let zipPath = req.body.zipPath ? String(req.body.zipPath) : null;
    let cleanup = null;
    if (!zipPath && req.body.zipBase64) {
      const buf = Buffer.from(String(req.body.zipBase64), "base64");
      cleanup = path.join(os.tmpdir(), `studio-zip-${Date.now()}.zip`);
      fs.writeFileSync(cleanup, buf);
      zipPath = cleanup;
    }
    if (!zipPath) {
      return res.status(400).json({ error: "Provide zipPath or zipBase64" });
    }
    const { estate } = ingestFromZip(zipPath, { keepWorkDir: false });
    if (cleanup) {
      try {
        fs.unlinkSync(cleanup);
      } catch {
        /* ignore */
      }
    }
    const out = path.join(os.tmpdir(), `customer-${Date.now()}.estate.json`);
    writeEstateFixture(estate, out);
    res.json({
      ok: true,
      fixturePath: out,
      connector: estate.ingestRun?.connector,
      stats: estate.ingestRun?.stats,
      ghosts: estate.ghosts?.length || 0,
      rules: estate.rules?.length || 0,
      refactors: estate.refactors?.length || 0,
      programs: (estate.programs || []).map((p) => p.name),
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/docs/:name", (req, res) => {
  const allowed = {
    cheatsheet: "docs/cobol/23-CHEATSHEET.md",
    install: "docs/INSTALL.md",
    gnucobol: "docs/cobol/13-GNUCOBOL.md",
    structure: "docs/cobol/02-PROGRAM-STRUCTURE.md",
    files: "docs/cobol/08-FILE-IO.md",
    copybooks: "docs/cobol/09-COPYBOOKS.md",
    playground: "docs/PLAYGROUND.md",
    easy: "docs/EASY-MODE.md",
  };
  const rel = allowed[req.params.name];
  if (!rel) return res.status(404).json({ error: "Unknown doc" });
  try {
    const abs = path.join(repoRoot(), rel);
    res.json({ name: req.params.name, content: fs.readFileSync(abs, "utf8") });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

async function start() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: studioRoot,
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api")) return next();
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.join(studioRoot, "index.html"), "utf8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(studioRoot, "dist")));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(studioRoot, "dist", "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`COBOL Studio → http://${HOST}:${PORT}`);
    console.log(`Sample: ${sample()}`);
    console.log(`Mode: ${isProd ? "production" : "development"}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
