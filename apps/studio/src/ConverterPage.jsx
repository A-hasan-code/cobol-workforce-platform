import { useEffect, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Wordmark } from "./Logo.jsx";
import { api } from "./api.js";

const STARTER = `# EasyLang → write here, Convert gives real COBOL
msg = "HELLO FROM CONVERTER"
a = 10
b = 5
print(msg)
print("sum=", a + b)
`;

export default function ConverterPage({ go }) {
  const [easy, setEasy] = useState(STARTER);
  const [cobol, setCobol] = useState("*> Click Convert — EasyLang becomes GnuCOBOL here.\n");
  const [busy, setBusy] = useState(false);
  const [doctorState, setDoctorState] = useState(null);
  const [consoleText, setConsoleText] = useState(
    "Converter — EasyLang in → COBOL out. Then Run or Download pack."
  );
  const [diagnostics, setDiagnostics] = useState([]);
  const [programId, setProgramId] = useState("CONVERT");
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

  async function onConvert() {
    setBusy(true);
    try {
      const pid = (programId || "CONVERT").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
      const t = await api.easyTranspile({ source: easy, programId: pid });
      if (!t.ok) {
        setDiagnostics(t.diagnostics || []);
        setCobol("*> Convert failed — fix EasyLang errors (see Output).\n");
        showToast("Convert failed", "error");
        setConsoleText(
          [
            "═══ CONVERT FAILED ═══",
            ...(t.diagnostics || []).map(
              (d) => `line ${d.line}:${d.column} ${d.message}`
            ),
          ].join("\n")
        );
        return;
      }
      setDiagnostics([]);
      setCobol(t.cobol || "");
      showToast("Converted to GnuCOBOL successfully", "ok");
      setConsoleText(
        [
          "═══ CONVERT OK ═══",
          `PROGRAM-ID. ${pid}`,
          "COBOL is on the right. Click Run to prove it, or Download COBOL pack.",
        ].join("\n")
      );
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Conversion error", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onRun() {
    setBusy(true);
    try {
      const pid = (programId || "CONVERT").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
      // always convert fresh so Run matches left pane
      const t = await api.easyTranspile({ source: easy, programId: pid });
      if (!t.ok) {
        setDiagnostics(t.diagnostics || []);
        showToast("Convert failed before run", "error");
        setConsoleText(
          [
            "═══ CONVERT FAILED (before run) ═══",
            ...(t.diagnostics || []).map((d) => d.message),
          ].join("\n")
        );
        return;
      }
      setCobol(t.cobol || "");
      const r = await api.tryLesson({
        mode: "cobol",
        cobol: t.cobol,
        programId: pid,
      });
      setDiagnostics(r.diagnostics || []);
      showToast(r.ok ? "Run successful" : "Run failed", r.ok ? "ok" : "error");
      setConsoleText(
        [
          r.ok ? "═══ CONVERT + RUN OK ═══" : `═══ RUN FAILED (${r.stage || "error"}) ═══`,
          r.stdout,
          r.stderr,
          ...(r.diagnostics || []).map((d) => `L${d.line}: ${d.message}`),
        ]
          .filter(Boolean)
          .join("\n")
      );
    } catch (e) {
      setConsoleText(String(e.message || e));
      showToast("Execution error", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    setBusy(true);
    try {
      const pid = (programId || "CONVERT").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
      const { blob, filename } = await api.handoff({
        mode: "easy",
        source: easy,
        programId: pid,
        requireTest: false,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`, "ok");
      setConsoleText(
        [
          "═══ DOWNLOAD READY ═══",
          `Saved: ${filename}`,
          "ZIP has .cob + source.easy + README + HOWTO for the COBOL developer.",
        ].join("\n")
      );
    } catch (e) {
      const d = e.details || {};
      setDiagnostics(d.diagnostics || []);
      showToast("Download failed", "error");
      setConsoleText(
        ["═══ DOWNLOAD FAILED ═══", e.message, ...(d.diagnostics || []).map((x) => x.message)]
          .filter(Boolean)
          .join("\n")
      );
    } finally {
      setBusy(false);
    }
  }

  function copyCobol() {
    navigator.clipboard?.writeText(cobol).then(
      () => {
        showToast("COBOL copied to clipboard", "ok");
        setConsoleText("COBOL copied to clipboard.");
      },
      () => {
        showToast("Copy failed", "warn");
        setConsoleText("Copy failed — select the COBOL pane manually.");
      }
    );
  }

  return (
    <div className="app-shell converter-shell">
      <header className="chrome">
        <div className="chrome-row">
          <button type="button" className="brand-btn" onClick={() => go("/")} title="Back to Home">
            <Wordmark />
          </button>
          <nav className="chrome-nav" aria-label="Site">
            <button type="button" className="ghost" onClick={() => go("/")}>
              Home
            </button>
            <button type="button" className="ghost" onClick={() => go("/playground")}>
              Playground
            </button>
            <button type="button" className="primary" aria-current="page">
              Converter
            </button>
            <button type="button" className="ghost" onClick={() => go("/compiler")}>
              Compiler
            </button>
            <button type="button" className="ghost" onClick={() => go("/docs")}>
              Docs
            </button>
          </nav>
          <label className="converter-pid">
            PROGRAM-ID
            <input
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              spellCheck={false}
              title="Target COBOL PROGRAM-ID"
            />
          </label>
          <span
            className={`env-badge ${doctorState?.ok ? "" : "warn"}`}
            title={doctorState?.version || "GnuCOBOL not on PATH"}
          >
            {doctorState?.ok ? "Local · cobc ready" : "Local · cobc missing"}
          </span>
          <div className="toolbar" role="group" aria-label="Converter actions">
            <button type="button" disabled={busy} onClick={() => setEasy(STARTER)}>
              Starter
            </button>
            <button type="button" className="primary" disabled={busy} onClick={onConvert}>
              Convert
            </button>
            <button type="button" disabled={busy} onClick={onRun}>
              Convert + Run
            </button>
            <button type="button" disabled={busy} onClick={copyCobol}>
              Copy COBOL
            </button>
            <button type="button" disabled={busy} onClick={onDownload}>
              Download COBOL pack
            </button>
          </div>
        </div>
      </header>

      <section className="compiler-banner island">
        <div className="banner-content">
          <strong>EasyLang → COBOL Converter</strong>
          <p>
            Left pe EasyLang likho (Python-jaisa). <strong>Convert</strong> dabao — right pe real GnuCOBOL
            aata hai. Phir <strong>Download COBOL pack</strong> se ZIP le jao developer ko.
          </p>
        </div>
      </section>

      <div className="workspace converter-workspace">
        <div className="island editor-island">
          <div className="island-hd">
            <h2>EasyLang</h2>
            <span className="meta">you write</span>
          </div>
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={easy}
            onChange={(v) => setEasy(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="island editor-island">
          <div className="island-hd">
            <h2>COBOL</h2>
            <span className="meta">generated</span>
          </div>
          <Editor
            height="100%"
            defaultLanguage="cobol"
            theme="vs-dark"
            value={cobol}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      <aside className="island converter-console">
        <div className="island-hd">
          <h2>Output</h2>
          <span className="meta">{diagnostics.length ? `${diagnostics.length} errors` : "ready"}</span>
        </div>
        <pre className="console-pre">{consoleText}</pre>
      </aside>

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
