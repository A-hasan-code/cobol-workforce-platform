async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  doctor: () => fetch("/api/doctor").then(json),
  files: () => fetch("/api/files").then(json),
  file: (path) => fetch(`/api/file?path=${encodeURIComponent(path)}`).then(json),
  save: (path, content) =>
    fetch("/api/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    }).then(json),
  compile: () => fetch("/api/compile", { method: "POST" }).then(json),
  run: () => fetch("/api/run", { method: "POST" }).then(json),
  test: () => fetch("/api/test", { method: "POST" }).then(json),
  explain: () => fetch("/api/explain").then(json),
  docs: (name) => fetch(`/api/docs/${name}`).then(json),
  estate: () => fetch("/api/estate").then(json),
  ghosts: () => fetch("/api/estate/ghosts").then(json),
  impact: ({ target, field } = {}) => {
    const q = new URLSearchParams();
    if (target) q.set("target", target);
    if (field) q.set("field", field);
    return fetch(`/api/estate/impact?${q}`).then(json);
  },
  estateRules: () => fetch("/api/estate/rules").then(json),
  estateRefactors: () => fetch("/api/estate/refactors").then(json),
  riskGate: () => fetch("/api/estate/risk-gate").then(json),
  zipIngest: ({ zipPath, zipBase64 } = {}) =>
    fetch("/api/estate/zip-ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zipPath, zipBase64 }),
    }).then(json),
  easyTranspile: ({ source, programId, outPath }) =>
    fetch("/api/easy/transpile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, programId, outPath }),
    }).then(json),
  tryLesson: ({ mode, easy, cobol, programId }) =>
    fetch("/api/try", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, easy, cobol, programId }),
    }).then(json),
  labReset: () => fetch("/api/lab/reset", { method: "POST" }).then(json),
  /** Returns a Blob (zip) or throws with JSON error body */
  async handoff({ mode, source, programId, requireTest = false }) {
    const res = await fetch("/api/handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, source, programId, requireTest }),
    });
    const ctype = res.headers.get("Content-Type") || "";
    if (!res.ok || !ctype.includes("zip")) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.error || res.statusText || "Handoff failed");
      err.details = data;
      throw err;
    }
    const disp = res.headers.get("Content-Disposition") || "";
    const m = disp.match(/filename="([^"]+)"/);
    const filename = m ? m[1] : "cobol-handoff.zip";
    const blob = await res.blob();
    return { blob, filename };
  },
};
