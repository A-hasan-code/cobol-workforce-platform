import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { api } from "./api.js";
import { FileIcon, Wordmark } from "./Logo.jsx";

loader.init().then((monaco) => {
  monaco.languages.register({ id: "cobol" });
  monaco.languages.setMonarchTokensProvider("cobol", {
    ignoreCase: true,
    tokenizer: {
      root: [
        [/^\s*\*>.*/, "comment"],
        [/\b(IDENTIFICATION|ENVIRONMENT|DATA|PROCEDURE)\s+DIVISION\b/, "keyword"],
        [/\b(PROGRAM-ID|WORKING-STORAGE|FILE-CONTROL|FILE|INPUT-OUTPUT|SECTION)\b/, "keyword"],
        [/\b(SELECT|ASSIGN|ORGANIZATION|FILE\s+STATUS|FD|COPY)\b/, "keyword"],
        [/\b(PIC|PICTURE|VALUE|COMP|COMP-3)\b/, "type"],
        [/\b(MOVE|DISPLAY|COMPUTE|PERFORM|OPEN|CLOSE|READ|WRITE|STOP|RUN|IF|ELSE|END-IF|AT\s+END|NOT\s+AT\s+END)\b/, "keyword"],
        [/\b(FUNCTION|TRIM|NUMVAL|ROUNDED)\b/, "keyword"],
        [/\b\d{2}\b/, "number"],
        [/".*?"/, "string"],
        [/'.*?'/, "string"],
      ],
    },
  });

  monaco.editor.defineTheme("cobol-studio-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "keyword", foreground: "60a5fa", fontStyle: "bold" },
      { token: "type", foreground: "34d399" },
      { token: "string", foreground: "fbbf24" },
      { token: "number", foreground: "f97316" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#f1f5f9",
      "editor.lineHighlightBackground": "#161d2d",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#94a3b8",
      "editorCursor.foreground": "#3b82f6",
      "editor.selectionBackground": "#1e3a5f",
      "editorIndentGuide.background": "#1e293b",
      "editorError.foreground": "#ef4444",
    },
  });
});

const DOC_LINKS = [
  { id: "playground", label: "Playground" },
  { id: "easy", label: "Easy Mode" },
  { id: "install", label: "Install" },
  { id: "cheatsheet", label: "Cheatsheet" },
  { id: "structure", label: "Structure" },
  { id: "files", label: "File I/O" },
  { id: "copybooks", label: "Copybooks" },
  { id: "gnucobol", label: "GnuCOBOL" },
];

const EASY_HELP = `# EasyLang — modern → COBOL ladder

Write short modern code → Studio generates real GnuCOBOL.

Supported now
  v0  vars, print, math, if/else, stop
  v1  while, for range, lists, and/or/not, concat
  v2  def / return / const
  v3  open/read/write/close, assert, import
  v3+ load_table("x.csv"), try / except / raise
  v4  record Account: + field access
  v5  typed def + stub_sql / stub_http / stub_load

Coming next (Phase 3 — needs approval)
  live SQL / HTTP, IBM / Micro Focus dialects

Try: interest.easy · loadtable.easy · Docs Run boxes
`;

export default function App({ go }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [activePath, setActivePath] = useState("src/interest.easy");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [writeMode, setWriteMode] = useState("easy"); // easy | cobol
  const [doctorState, setDoctorState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sideTab, setSideTab] = useState("easy");
  const [explain, setExplain] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docName, setDocName] = useState("playground");
  const [estate, setEstate] = useState(null);
  const [impact, setImpact] = useState(null);
  const [impactBusy, setImpactBusy] = useState(false);
  const [consoleText, setConsoleText] = useState(
    "Ready. Check toolchain with Doctor, then Compile → Run → Test."
  );
  const [diagnostics, setDiagnostics] = useState([]);
  const [banner, setBanner] = useState(null);
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [consoleH, setConsoleH] = useState(132);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const dragRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3200);
  }, []);

  const refreshDoctor = useCallback(async () => {
    const d = await api.doctor();
    setDoctorState(d);
    if (!d.ok) {
      setBanner({
        bad: true,
        title: d.message,
        hints: d.hints || [],
      });
    } else {
      setBanner(null);
    }
    return d;
  }, []);

  const openFile = useCallback(async (path) => {
    const data = await api.file(path);
    setActivePath(path);
    setContent(data.content);
    setDirty(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshDoctor();
        const list = await api.files();
        setFiles(list.files || []);
        try {
          await openFile("src/interest.easy");
          setWriteMode("easy");
        } catch {
          await openFile("src/interest.cob");
          setWriteMode("cobol");
        }
        const ex = await api.explain();
        setExplain(ex.content);
        const doc = await api.docs("easy");
        setDocContent(doc.content);
        setDocName("easy");
        setEstate(await api.estate());
        setConsoleText(
          "Easy Mode ready. Edit interest.easy → Generate COBOL → Run / Test.\nOr switch to COBOL mode for raw .cob."
        );
      } catch (e) {
        setConsoleText(String(e.message || e));
      }
    })();
  }, [openFile, refreshDoctor]);

  async function refreshEstate() {
    setEstate(await api.estate());
    setImpact(null);
  }

  async function runImpact(opts) {
    setImpactBusy(true);
    try {
      setImpact(await api.impact(opts));
    } catch (e) {
      setImpact({ ok: false, summary: String(e.message || e) });
    } finally {
      setImpactBusy(false);
    }
  }

  function bumpConsole() {
    setConsoleCollapsed(false);
    setConsoleH((h) => Math.max(h, 180));
  }

  function onConsoleDragStart(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startH = consoleCollapsed ? 40 : consoleH;
    dragRef.current = { startY, startH };
    setConsoleCollapsed(false);

    function onMove(ev) {
      const dy = dragRef.current.startY - ev.clientY;
      const next = Math.min(420, Math.max(96, dragRef.current.startH + dy));
      setConsoleH(next);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const markers = useMemo(() => {
    const base = activePath.replace(/^.*\//, "");
    return (diagnostics || [])
      .filter((d) => {
        const f = (d.file || "").replace(/\\/g, "/");
        return f.endsWith(base) || f.endsWith(activePath) || f.includes(base);
      })
      .map((d) => ({
        startLineNumber: d.line || 1,
        startColumn: d.column || 1,
        endLineNumber: d.line || 1,
        endColumn: (d.column || 1) + 80,
        message: d.message,
        severity:
          d.severity === "warning" ? 4 : d.severity === "error" ? 8 : 2,
      }));
  }, [diagnostics, activePath]);

  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, "cobc", markers);
  }, [markers, content]);

  async function saveIfNeeded(notify = false) {
    if (!dirty && !notify) return;
    await api.save(activePath, content);
    setDirty(false);
    if (notify) showToast("File saved", "ok");
  }

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveIfNeeded(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        onCompile();
      } else if (e.key === "F5") {
        e.preventDefault();
        onRun();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dirty, activePath, content]);

  function cobOutFromEasy(easyPath) {
    return easyPath.replace(/\.easy$/i, ".cob");
  }

  function programIdFromPath(p) {
    const base = p.replace(/^.*\//, "").replace(/\.(easy|cob|cbl)$/i, "");
    return base.replace(/[^A-Za-z0-9-]/g, "").toUpperCase() || "EASYPROG";
  }

  async function generateFromEasy() {
    if (!activePath.endsWith(".easy")) {
      setConsoleText("Open a .easy file (or switch to Easy mode) to generate COBOL.");
      bumpConsole();
      return null;
    }
    await saveIfNeeded();
    const outPath = cobOutFromEasy(activePath);
    const result = await api.easyTranspile({
      source: content,
      programId: programIdFromPath(activePath),
      outPath,
    });
    if (!result.ok) {
      setDiagnostics(
        (result.diagnostics || []).map((d) => ({
          file: activePath,
          line: d.line || 1,
          column: d.column || 1,
          severity: d.severity || "error",
          message: d.message,
        }))
      );
      setConsoleText(
        [
          "EasyLang → COBOL FAILED",
          ...(result.diagnostics || []).map(
            (d) => `${activePath}:${d.line}:${d.column} ${d.message}`
          ),
        ].join("\n")
      );
      bumpConsole();
      return null;
    }
    setDiagnostics([]);
    const list = await api.files();
    setFiles(list.files || []);
    setConsoleText(
      `Generated ${outPath} from EasyLang.\nCompile / Run / Test / Download COBOL pack use this output.`
    );
    bumpConsole();
    return result;
  }

  async function ensureCobolReady() {
    if (writeMode === "easy" && activePath.endsWith(".easy")) {
      const gen = await generateFromEasy();
      if (!gen) return false;
    } else {
      await saveIfNeeded();
    }
    return true;
  }

  function showCompileResult(result) {
    setDiagnostics(result.diagnostics || []);
    if (result.ok) {
      showToast("Compile successful", "ok");
    } else {
      showToast("Compile failed", "error");
    }
    const parts = [
      result.ok ? "Compile OK" : "Compile FAILED",
      result.stderr,
      result.stdout,
      ...(result.diagnostics || []).map(
        (d) => `${d.file}:${d.line}:${d.column} ${d.severity}: ${d.message}`
      ),
    ].filter(Boolean);
    setConsoleText(parts.join("\n"));
    bumpConsole();
  }

  async function onCompile() {
    setBusy(true);
    try {
      if (!(await ensureCobolReady())) return;
      showCompileResult(await api.compile());
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Compile error", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onRun() {
    setBusy(true);
    try {
      if (!(await ensureCobolReady())) return;
      const result = await api.run();
      if (result.compile?.diagnostics) {
        setDiagnostics(result.compile.diagnostics);
      }
      if (result.demo) {
        showToast("Demo run (cobc not installed)", "warn");
        setConsoleText(
          [
            "═══ DEMO RUN (cobc not installed) ═══",
            result.stderr,
            "",
            "── sample expected output ──",
            result.stdout,
          ]
            .filter(Boolean)
            .join("\n")
        );
        bumpConsole();
        return;
      }
      if (result.stage === "compile" && !result.ok) {
        showCompileResult(result.compile);
        return;
      }
      if (result.ok) {
        showToast("Run finished successfully", "ok");
      } else {
        showToast(`Run error (code ${result.code ?? "failed"})`, "error");
      }
      setConsoleText(
        [
          result.ok ? "Run OK" : `Run finished (code ${result.code})`,
          result.stdout,
          result.stderr,
        ]
          .filter(Boolean)
          .join("\n")
      );
      bumpConsole();
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Run error", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    setBusy(true);
    try {
      if (!(await ensureCobolReady())) return;
      const result = await api.test();
      showToast(result.ok ? "All tests passed" : "Tests failed", result.ok ? "ok" : "warn");
      if (result.run?.compile?.diagnostics) {
        setDiagnostics(result.run.compile.diagnostics);
      }
      setConsoleText(
        [
          result.message,
          result.demoBlocked
            ? ""
            : result.ok
              ? ""
              : "\n--- expected ---\n" + (result.expected || ""),
          result.demoBlocked
            ? ""
            : result.ok
              ? ""
              : "\n--- actual ---\n" + (result.actual || ""),
        ]
          .filter(Boolean)
          .join("\n")
      );
      bumpConsole();
    } catch (e) {
      setConsoleText(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadHandoff() {
    setBusy(true);
    try {
      await saveIfNeeded();
      const mode =
        writeMode === "easy" && activePath.endsWith(".easy") ? "easy" : "cobol";
      const pid = programIdFromPath(activePath);
      const { blob, filename } = await api.handoff({
        mode,
        source: content,
        programId: pid,
        requireTest: false,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setConsoleText(
        [
          "═══ HANDOFF ZIP READY ═══",
          `Downloaded: ${filename}`,
          "Contains .cob + README + HOWTO for the receiving COBOL developer.",
          "Lab proved Compile+Run before packaging.",
        ].join("\n")
      );
      bumpConsole();
    } catch (e) {
      const d = e.details || {};
      setDiagnostics(d.diagnostics || []);
      setConsoleText(
        [
          "═══ HANDOFF FAILED ═══",
          e.message || String(e),
          d.stage ? `stage: ${d.stage}` : "",
          ...(d.diagnostics || []).map((x) => x.message),
        ]
          .filter(Boolean)
          .join("\n")
      );
      bumpConsole();
    } finally {
      setBusy(false);
    }
  }

  async function onResetLab() {
    setBusy(true);
    try {
      const r = await api.labReset();
      setConsoleText(
        [
          "Lab sandbox reset (samples kept).",
          `Removed: ${(r.removed || []).join(", ") || "(nothing dirty)"}`,
        ].join("\n")
      );
      bumpConsole();
    } catch (e) {
      setConsoleText(String(e.message || e));
      bumpConsole();
    } finally {
      setBusy(false);
    }
  }

  async function loadDoc(id) {
    setDocName(id);
    setSideTab("docs");
    const doc = await api.docs(id);
    setDocContent(doc.content);
  }

  const language = activePath.endsWith(".toml")
    ? "ini"
    : activePath.endsWith(".md")
      ? "markdown"
      : activePath.endsWith(".easy") || writeMode === "easy"
        ? "python"
        : "cobol";

  async function switchWriteMode(mode) {
    setWriteMode(mode);
    if (mode === "easy") {
      setSideTab("easy");
      try {
        await openFile("src/interest.easy");
      } catch {
        /* keep current */
      }
    } else {
      try {
        await openFile("src/interest.cob");
      } catch {
        /* keep current */
      }
    }
  }

  return (
    <div className="app">
      <header className="chrome">
        <button type="button" className="brand-btn" onClick={() => go("/")} title="Back to Home">
          <Wordmark />
        </button>
        <div className="chrome-right">
          <nav className="chrome-nav" aria-label="Site">
            <button type="button" className="ghost" onClick={() => go("/")}>
              Home
            </button>
            <button type="button" className="primary" aria-current="page">
              Playground
            </button>
            <button type="button" className="ghost" onClick={() => go("/converter")}>
              Converter
            </button>
            <button type="button" className="ghost" onClick={() => go("/compiler")}>
              Compiler
            </button>
            <button type="button" className="ghost" onClick={() => go("/docs")}>
              Docs
            </button>
          </nav>
          <nav className="chrome-nav write-mode" aria-label="Write mode">
            <button
              type="button"
              className={writeMode === "easy" ? "primary" : "ghost"}
              onClick={() => switchWriteMode("easy")}
            >
              Easy
            </button>
            <button
              type="button"
              className={writeMode === "cobol" ? "primary" : "ghost"}
              onClick={() => switchWriteMode("cobol")}
            >
              COBOL
            </button>
          </nav>
          <span
            className={`env-badge ${doctorState?.ok ? "" : "warn"}`}
            title={doctorState?.version || "GnuCOBOL not on PATH"}
          >
            {doctorState?.ok ? "Local · cobc ready" : "Local · cobc missing"}
          </span>
          <div className="toolbar" role="group" aria-label="Build actions">
            <button type="button" disabled={busy} onClick={() => refreshDoctor()} title="Check GnuCOBOL compiler environment">
              Doctor
            </button>
            {writeMode === "easy" && (
              <button type="button" disabled={busy} onClick={() => generateFromEasy()} title="Transpile EasyLang to .cob">
                Generate
              </button>
            )}
            <button type="button" disabled={busy} onClick={onCompile} title="Compile with cobc (Ctrl+Shift+B)">
              Compile
            </button>
            <button
              type="button"
              className={`primary ${busy ? "is-busy" : ""}`}
              disabled={busy}
              onClick={onRun}
              title="Run program (F5)"
            >
              Run
            </button>
            <button type="button" disabled={busy} onClick={onTest} title="Run test suite">
              Test
            </button>
            <button type="button" disabled={busy} onClick={onDownloadHandoff} title="Download certified ZIP pack for bank developers">
              Download pack
            </button>
            <button type="button" className="ghost" disabled={busy} onClick={onResetLab} title="Clean sandbox and reset files">
              Reset lab
            </button>
          </div>
        </div>
      </header>

      {banner && !setupDismissed && (
        <section className={`setup-strip ${banner.bad ? "danger" : ""}`} aria-live="polite">
          <div className="setup-label">Setup</div>
          <div className="setup-copy">
            <strong>cobc missing — install GnuCOBOL for real Compile/Test</strong>
            <p>
              Click <strong>Run</strong> for DEMO output now. Install guide has full steps.
            </p>
          </div>
          <div className="setup-actions">
            <button type="button" className="primary" onClick={() => go("/docs#setup")}>
              Install guide
            </button>
            <button type="button" onClick={() => refreshDoctor()}>
              Recheck
            </button>
            <button
              type="button"
              className="ghost"
              aria-label="Dismiss setup banner"
              onClick={() => setSetupDismissed(true)}
            >
              Close
            </button>
          </div>
        </section>
      )}

      <div className="workspace">
        <div className="workspace-main">
          <aside className="island files">
            <div className="island-hd">
              <h2>Explorer</h2>
              <span className="meta">{files.length} files</span>
            </div>
            <div className="file-list">
              {files.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`file-item ${f === activePath ? "active" : ""}`}
                  onClick={() => openFile(f)}
                >
                  <FileIcon path={f} />
                  <span className="path">{f}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="island editor">
            <div className="island-hd">
              <h2>{writeMode === "easy" ? "EasyLang" : "Editor"}</h2>
              <span className="meta">
                <em>{activePath}</em>
                {dirty ? " · unsaved" : " · saved"}
                {writeMode === "easy" ? " · v0 → COBOL" : ""}
              </span>
            </div>
            <div className="editor-body">
              <Editor
                height="100%"
                theme="cobol-studio-dark"
                language={language}
                value={content}
                onChange={(v) => {
                  setContent(v ?? "");
                  setDirty(true);
                }}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                  monaco.editor.setTheme("cobol-studio-dark");
                }}
                options={{
                  fontFamily: "IBM Plex Mono, Menlo, monospace",
                  fontSize: 13.5,
                  lineHeight: 22,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderValidationDecorations: "on",
                  lineNumbers: "on",
                  padding: { top: 12, bottom: 12 },
                  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                  overviewRulerBorder: false,
                }}
              />
            </div>
          </main>

          <aside className="island side">
            <div className="side-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === "easy"}
                className={sideTab === "easy" ? "active" : ""}
                onClick={() => setSideTab("easy")}
              >
                Easy
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === "explain"}
                className={sideTab === "explain" ? "active" : ""}
                onClick={() => setSideTab("explain")}
              >
                Explain
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === "estate"}
                className={sideTab === "estate" ? "active" : ""}
                onClick={() => {
                  setSideTab("estate");
                  if (!estate) refreshEstate();
                }}
              >
                Estate
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === "docs"}
                className={sideTab === "docs" ? "active" : ""}
                onClick={() => setSideTab("docs")}
              >
                Docs
              </button>
            </div>
          <div className="side-body">
            {sideTab === "easy" ? (
              <pre className="prose">{EASY_HELP}</pre>
            ) : sideTab === "explain" ? (
              <pre className="prose">{explain}</pre>
            ) : sideTab === "estate" ? (
                <div className="estate-panel">
                  <div className="estate-actions">
                    <button type="button" onClick={refreshEstate}>
                      Re-ingest
                    </button>
                  </div>
                  {estate ? (
                    <>
                      <div className="estate-stats" aria-label="Estate counts">
                        <div>
                          <strong>{estate.programs?.length ?? 0}</strong>
                          <span>programs</span>
                        </div>
                        <div>
                          <strong>{estate.copybooks?.length ?? 0}</strong>
                          <span>copybooks</span>
                        </div>
                        <div>
                          <strong>{estate.jobs?.length ?? 0}</strong>
                          <span>jobs</span>
                        </div>
                        <div className="ghost">
                          <strong>{estate.ghosts?.length ?? 0}</strong>
                          <span>ghosts</span>
                        </div>
                      </div>
                      <h3>Ghost board</h3>
                      <ul className="ghost-list">
                        {(estate.ghosts || []).map((g, i) => (
                          <li key={`${g.programId}-${g.kind}-${i}`}>
                            <code>{g.kind}</code>
                            <span>{g.programId.replace(/^prog:/, "").toUpperCase()}</span>
                            <em>{g.evidence}</em>
                          </li>
                        ))}
                        {!estate.ghosts?.length && <li className="empty">No ghosts</li>}
                      </ul>
                      <h3>Impact</h3>
                      <p className="estate-hint">
                        Ask what breaks if a shared copybook field changes.
                      </p>
                      <div className="estate-actions">
                        <button
                          type="button"
                          className="primary"
                          disabled={impactBusy}
                          onClick={() => runImpact({ field: "ACCT-BAL-TEXT" })}
                        >
                          Field ACCT-BAL-TEXT
                        </button>
                        <button
                          type="button"
                          disabled={impactBusy}
                          onClick={() => runImpact({ target: "ACCTREC" })}
                        >
                          Copybook ACCTREC
                        </button>
                        <button
                          type="button"
                          disabled={impactBusy}
                          onClick={() => runImpact({ target: "OLDUTIL" })}
                        >
                          Program OLDUTIL
                        </button>
                      </div>
                      {impact && (
                        <div className={`impact-report ${impact.riskBand || ""}`}>
                          <strong>
                            {impact.ok
                              ? `${impact.summary}`
                              : impact.summary || "Impact failed"}
                          </strong>
                          {impact.changeReport && (
                            <pre className="prose compact">
                              {[
                                `Risk: ${impact.changeReport.riskBand} (${impact.changeReport.riskScore})`,
                                `Programs: ${(impact.changeReport.programs || []).join(", ") || "—"}`,
                                `Jobs: ${(impact.changeReport.jobs || []).join(", ") || "—"}`,
                                "",
                                ...(impact.changeReport.evidence || []).slice(0, 12),
                              ].join("\n")}
                            </pre>
                          )}
                        </div>
                      )}
                      <h3>Business rules</h3>
                      <p className="estate-hint">
                        IF / COMPUTE / tagged RULE comment lines extracted from source.
                      </p>
                      <ul className="ghost-list">
                        {(estate.rules || []).slice(0, 12).map((r) => (
                          <li key={r.id}>
                            <code>{r.kind}</code>
                            <span>
                              {String(r.programId)
                                .replace(/^prog:/, "")
                                .toUpperCase()}
                              {r.line ? ` L${r.line}` : ""}
                            </span>
                            <em>{r.summary}</em>
                          </li>
                        ))}
                        {!estate.rules?.length && (
                          <li className="empty">No rules extracted</li>
                        )}
                      </ul>
                      {(estate.rules || []).length > 12 && (
                        <p className="estate-hint">
                          … +{estate.rules.length - 12} more (CLI: npm run estate:rules)
                        </p>
                      )}
                      <h3>Safe refactors</h3>
                      <ul className="ghost-list">
                        {(estate.refactors || []).slice(0, 8).map((s) => (
                          <li key={s.id}>
                            <code>{s.severity}</code>
                            <span>{s.title}</span>
                            <em>{s.rationale}</em>
                          </li>
                        ))}
                        {!estate.refactors?.length && (
                          <li className="empty">No suggestions</li>
                        )}
                      </ul>
                      <h3>Risk gate</h3>
                      <p className="estate-hint">
                        CI blocks high impact on ACCT-BAL-TEXT unless inventory/risk-ack.json
                        acks it.
                      </p>
                      <h3>Lineage (edges)</h3>
                      <pre className="prose compact">
                        {(estate.dependencies || [])
                          .slice(0, 24)
                          .map((d) => `${d.from} -[${d.type}]-> ${d.to}`)
                          .join("\n")}
                        {(estate.dependencies || []).length > 24
                          ? `\n… +${estate.dependencies.length - 24} more`
                          : ""}
                      </pre>
                    </>
                  ) : (
                    <p className="estate-hint">Loading estate…</p>
                  )}
                </div>
              ) : (
                <>
                  <nav className="doc-nav" aria-label="Documentation">
                    {DOC_LINKS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={docName === d.id ? "active" : ""}
                        onClick={() => loadDoc(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </nav>
                  <pre className="prose">{docContent}</pre>
                </>
              )}
            </div>
          </aside>
        </div>

        <div
          className={`console-shell ${consoleCollapsed ? "is-collapsed" : ""}`}
          style={{ height: consoleCollapsed ? 40 : consoleH }}
        >
          <button
            type="button"
            className="console-sash"
            aria-label="Resize console"
            title="Drag to resize console"
            onPointerDown={onConsoleDragStart}
          />
          <section className="island console" aria-label="Console">
            <div className="island-hd">
              <h2>Console</h2>
              <div className="console-hd-right">
                <span className={`status-dot ${busy ? "busy" : doctorState?.ok ? "ok" : ""}`}>
                  <i />
                  {busy ? "Working" : "Idle"}
                </span>
                <button
                  type="button"
                  className="ghost console-toggle"
                  aria-label={consoleCollapsed ? "Expand console" : "Collapse console"}
                  onClick={() => setConsoleCollapsed((c) => !c)}
                >
                  {consoleCollapsed ? "Expand" : "Collapse"}
                </button>
              </div>
            </div>
            {!consoleCollapsed && (
              <div className="console-body">
                <pre>{consoleText}</pre>
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="status-bar" role="contentinfo">
        <div className="status-left">
          <span className="status-item file-path" title={activePath}>
            {activePath} {dirty ? "• (unsaved)" : ""}
          </span>
          <span className="status-item lines-count">
            {content.split("\n").length} lines
          </span>
          <span className="status-item mode-tag">
            {writeMode === "easy" ? "EasyLang Mode" : "Native COBOL Mode"}
          </span>
        </div>
        <div className="status-right">
          <span className="status-item shortcuts">
            Ctrl+S Save · Ctrl+Shift+B Compile · F5 Run
          </span>
          <span className={`status-item toolchain-status ${doctorState?.ok ? "ok" : "warn"}`}>
            {doctorState?.ok ? `cobc ready (${doctorState.version?.slice(0, 20) || "active"})` : "cobc missing"}
          </span>
        </div>
      </footer>

      {toast && (
        <div className={`toast-notification ${toast.type}`} role="status">
          <span className="toast-icon">
            {toast.type === "ok" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast-msg">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
