/**
 * Business-rule extraction (Phase 2 slice 2).
 * Heuristic scanners — not a full COBOL semantic analyzer.
 */

function stripComment(line) {
  return line.replace(/\*>.*/, "").trim();
}

function lineNo(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

/**
 * Extract candidate business rules from one program source.
 * @returns {{ id: string, programId: string, kind: string, summary: string, evidence: string, line: number }[]}
 */
export function extractRulesFromSource(source, programId) {
  const pid = String(programId || "UNKNOWN").toUpperCase();
  const rules = [];
  let n = 0;
  const nextId = (kind) => {
    n += 1;
    return `rule:${pid.toLowerCase()}:${kind}:${n}`;
  };

  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const code = stripComment(raw);
    const line = i + 1;

    const tagged = raw.match(/\*>\s*RULE:\s*(.+)$/i);
    if (tagged) {
      rules.push({
        id: nextId("tagged"),
        programId: `prog:${pid.toLowerCase()}`,
        kind: "tagged",
        summary: tagged[1].trim(),
        evidence: raw.trim(),
        line,
      });
    }

    if (/^\s*IF\b/i.test(code)) {
      const cond = code.replace(/^\s*IF\s+/i, "").replace(/\s+$/, "");
      rules.push({
        id: nextId("if"),
        programId: `prog:${pid.toLowerCase()}`,
        kind: "if",
        summary: `Branch when ${cond}`,
        evidence: code.slice(0, 160),
        line,
      });
    }

    if (/\bEVALUATE\b/i.test(code)) {
      const subj = code.match(/\bEVALUATE\s+(.+)$/i);
      rules.push({
        id: nextId("evaluate"),
        programId: `prog:${pid.toLowerCase()}`,
        kind: "evaluate",
        summary: `Decide on ${subj ? subj[1].trim() : "subject"}`,
        evidence: code.slice(0, 160),
        line,
      });
    }

    if (/\bCOMPUTE\b/i.test(code)) {
      const m = code.match(/\bCOMPUTE\s+(.+?)\s*=\s*(.+)$/i);
      if (m) {
        rules.push({
          id: nextId("compute"),
          programId: `prog:${pid.toLowerCase()}`,
          kind: "compute",
          summary: `Formula: ${m[1].trim()} = ${m[2].trim().replace(/\s+ROUNDED\s*/i, " ").trim()}`,
          evidence: code.slice(0, 160),
          line,
        });
      }
    }

    if (/\bWHEN\b/i.test(code) && !/^\s*\*>/.test(raw)) {
      const m = code.match(/\bWHEN\s+(.+)$/i);
      if (m && !/OTHER/i.test(m[1])) {
        rules.push({
          id: nextId("when"),
          programId: `prog:${pid.toLowerCase()}`,
          kind: "when",
          summary: `Case when ${m[1].trim()}`,
          evidence: code.slice(0, 160),
          line,
        });
      }
    }
  }

  // 88-level condition names in DATA DIVISION (copybooks / WS)
  const eightyEight = /\b88\s+([A-Z0-9][A-Z0-9-]*)\s+VALUE\s+([^.]+)\./gi;
  let m;
  while ((m = eightyEight.exec(source))) {
    rules.push({
      id: nextId("condition-name"),
      programId: `prog:${pid.toLowerCase()}`,
      kind: "condition-name",
      summary: `Condition ${m[1].toUpperCase()} when VALUE ${m[2].trim()}`,
      evidence: m[0].slice(0, 160),
      line: lineNo(source, m.index),
    });
  }

  return rules;
}

/**
 * Extract rules for every program that has source on disk.
 */
export function extractEstateRules(estate, readSource) {
  const all = [];
  for (const p of estate.programs || []) {
    if (!p.sourcePath || typeof readSource !== "function") continue;
    let src;
    try {
      src = readSource(p.sourcePath);
    } catch {
      continue;
    }
    if (!src) continue;
    all.push(...extractRulesFromSource(src, p.name));
  }
  return all;
}
