import { useEffect, useRef, useState } from "react";
import { api } from "./api.js";

/**
 * Docs lesson runner: EasyLang + live COBOL preview side-by-side, then Run.
 */
export default function TryLesson({
  title = "Try it here",
  mode = "easy",
  easy = "",
  cobol = "",
  note = "",
  programId = "DOCTRY",
}) {
  const [code, setCode] = useState(mode === "cobol" ? cobol : easy);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState("");
  const [genCobol, setGenCobol] = useState("");
  const [convertErr, setConvertErr] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  async function refreshCobol(source) {
    if (mode !== "easy") {
      setGenCobol(source);
      setConvertErr("");
      return;
    }
    try {
      const result = await api.easyTranspile({
        source,
        programId,
      });
      if (!result.ok) {
        setGenCobol("");
        setConvertErr(
          (result.diagnostics || [])
            .map((d) => `Line ${d.line}: ${d.message}`)
            .join("\n") || "EasyLang convert failed"
        );
        return;
      }
      setConvertErr("");
      setGenCobol(result.cobol || "");
    } catch (e) {
      setGenCobol("");
      setConvertErr(String(e.message || e));
    }
  }

  useEffect(() => {
    refreshCobol(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onCodeChange(value) {
    setCode(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => refreshCobol(value), 280);
  }

  async function onRun() {
    setBusy(true);
    setOut("Running…");
    try {
      await refreshCobol(code);
      const result = await api.tryLesson({
        mode,
        easy: mode === "easy" ? code : "",
        cobol: mode === "cobol" ? code : "",
        programId,
      });
      if (result.cobol) {
        setGenCobol(result.cobol);
        setConvertErr("");
      }
      if (!result.ok) {
        const diags = (result.diagnostics || [])
          .map((d) => `Line ${d.line}: ${d.message}`)
          .join("\n");
        setOut(
          [
            result.stage === "easy"
              ? "EasyLang error"
              : result.stage === "compile"
                ? "Compile failed"
                : "Run failed",
            diags,
            result.stderr,
            result.stdout,
          ]
            .filter(Boolean)
            .join("\n")
        );
      } else {
        setOut(result.stdout || "(no output)");
      }
    } catch (e) {
      setOut(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    const next = mode === "cobol" ? cobol : easy;
    setCode(next);
    setOut("");
    setConvertErr("");
    refreshCobol(next);
  }

  function copyCode() {
    const toCopy = genCobol || code;
    navigator.clipboard?.writeText(toCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const rows = Math.min(14, Math.max(8, code.split("\n").length + 2));

  return (
    <section className="docs-try" aria-label={title}>
      <div className="docs-try-hd">
        <div>
          <span className="docs-kicker">Live convert + compiler</span>
          <h3>{title}</h3>
        </div>
        <div className="docs-try-actions">
          <button type="button" className="ghost" disabled={busy} onClick={reset} title="Reset lesson code">
            Reset
          </button>
          <button type="button" className="primary" disabled={busy} onClick={onRun} title="Run on local compiler">
            {busy ? "Running…" : "Run COBOL"}
          </button>
        </div>
      </div>
      {note ? <p className="docs-try-note">{note}</p> : null}

      {mode === "easy" ? (
        <div className="docs-try-split">
          <div className="docs-try-pane">
            <div className="pane-header-row">
              <label className="docs-try-label">EasyLang (you write — Python-easy)</label>
            </div>
            <textarea
              className="docs-try-editor"
              spellCheck={false}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              rows={rows}
            />
          </div>
          <div className="docs-try-pane">
            <div className="pane-header-row">
              <label className="docs-try-label">COBOL (auto-generated)</label>
              <button
                type="button"
                className="ghost copy-mini-btn"
                onClick={copyCode}
                title="Copy generated COBOL"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {convertErr ? (
              <pre className="docs-try-cobol is-error">{convertErr}</pre>
            ) : (
              <pre className="docs-try-cobol">
                {genCobol || "Type EasyLang on the left — COBOL appears here."}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="pane-header-row">
            <label className="docs-try-label">COBOL (you write)</label>
            <button
              type="button"
              className="ghost copy-mini-btn"
              onClick={copyCode}
              title="Copy COBOL"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            className="docs-try-editor"
            spellCheck={false}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            rows={rows}
          />
        </>
      )}

      <div className="docs-try-footer">
        <label className="docs-try-label">Program output (after Run COBOL)</label>
        <pre className={`docs-try-out ${out ? "" : "empty"}`}>
          {out ||
            "Press Run COBOL — converts EasyLang → .cob, compiles with GnuCOBOL, shows stdout here."}
        </pre>
      </div>
    </section>
  );
}
