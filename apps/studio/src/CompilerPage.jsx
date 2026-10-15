import { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Wordmark } from "./Logo.jsx";
import { api } from "./api.js";

const STARTER = `IDENTIFICATION DIVISION.
PROGRAM-ID. COMPLAB.
DATA DIVISION.
WORKING-STORAGE SECTION.
01  WS-MSG PIC X(40) VALUE "HELLO FROM COMPILER LAB".
PROCEDURE DIVISION.
    DISPLAY FUNCTION TRIM(WS-MSG)
    STOP RUN.
`;

export default function CompilerPage({ go }) {
  const editorRef = useRef(null);
  const [source, setSource] = useState(STARTER);
  const [busy, setBusy] = useState(false);
  const [doctorState, setDoctorState] = useState(null);
  const [consoleText, setConsoleText] = useState(
    "Compiler Lab — paste COBOL, Compile+Run. No EasyLang here."
  );
  const [diagnostics, setDiagnostics] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3200);
  }, []);

  useEffect(() => {
    api.doctor().then(setDoctorState).catch(() => setDoctorState(null));
  }, []);

  async function onRun() {
    setBusy(true);
    try {
      const r = await api.tryLesson({
        mode: "cobol",
        cobol: source,
        programId: "COMPLAB",
      });
      setDiagnostics(r.diagnostics || []);
      const parts = [
        r.ok ? "═══ COMPILE + RUN OK ═══" : `═══ FAILED (${r.stage || "error"}) ═══`,
        r.stdout,
        r.stderr,
        ...(r.diagnostics || []).map(
          (d) => `line ${d.line}:${d.column} ${d.severity}: ${d.message}`
        ),
      ].filter(Boolean);
      setConsoleText(parts.join("\n"));
      showToast(r.ok ? "Compile + Run successful" : "Compile or Run failed", r.ok ? "ok" : "error");
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Execution error", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onResetLab() {
    setBusy(true);
    try {
      const r = await api.labReset();
      setConsoleText(
        [`Lab sandbox reset.`, `Removed: ${(r.removed || []).join(", ") || "(nothing)"}`].join("\n")
      );
      showToast("Lab sandbox reset", "ok");
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Reset failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell compiler-shell">
      <header className="chrome">
        <button type="button" className="brand-btn" onClick={() => go("/")} title="Back to Home">
          <Wordmark />
        </button>
        <div className="chrome-right">
          <nav className="chrome-nav" aria-label="Site">
            <button type="button" className="ghost" onClick={() => go("/")}>
              Home
            </button>
            <button type="button" className="ghost" onClick={() => go("/playground")}>
              Playground
            </button>
            <button type="button" className="ghost" onClick={() => go("/converter")}>
              Converter
            </button>
            <button type="button" className="primary" aria-current="page">
              Compiler
            </button>
            <button type="button" className="ghost" onClick={() => go("/docs")}>
              Docs
            </button>
          </nav>
          <span
            className={`env-badge ${doctorState?.ok ? "" : "warn"}`}
            title={doctorState?.version || "GnuCOBOL not on PATH"}
          >
            {doctorState?.ok ? "Local · cobc ready" : "Local · cobc missing"}
          </span>
          <div className="toolbar" role="group" aria-label="Compiler actions">
            <button type="button" disabled={busy} onClick={() => setSource(STARTER)} title="Load starter code">
              Starter
            </button>
            <button type="button" disabled={busy} onClick={onResetLab} title="Reset compile cache">
              Reset lab
            </button>
            <button
              type="button"
              className={`primary ${busy ? "is-busy" : ""}`}
              disabled={busy}
              onClick={onRun}
              title="Compile and run with GnuCOBOL"
            >
              Compile + Run
            </button>
          </div>
        </div>
      </header>

      <section className="compiler-banner island">
        <div className="banner-content">
          <strong>Compiler Lab</strong>
          <p>
            Pure COBOL only — paste free-format GnuCOBOL, then Compile + Run. EasyLang se COBOL chahiye?
            Top nav → <strong>Converter</strong>.
          </p>
        </div>
      </section>

      <div className="workspace compiler-workspace">
        <div className="island editor-island">
          <div className="island-hd">
            <h2>COBOL source</h2>
            <span className="meta">free-format</span>
          </div>
          <Editor
            height="100%"
            defaultLanguage="cobol"
            theme="vs-dark"
            value={source}
            onChange={(v) => setSource(v ?? "")}
            onMount={(ed) => {
              editorRef.current = ed;
            }}
            options={{
              minimap: { enabled: false },
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <aside className="island console-island">
          <div className="island-hd">
            <h2>Output</h2>
            <span className="meta">{diagnostics.length ? `${diagnostics.length} msgs` : "clean"}</span>
          </div>
          <pre className="console-pre">{consoleText}</pre>
          {diagnostics.length > 0 && (
            <ul className="diag-list">
              {diagnostics.map((d, i) => (
                <li key={i}>
                  L{d.line}: {d.message}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

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
