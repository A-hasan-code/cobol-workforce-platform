/**
 * Safe refactor suggestions + generated test stubs (Phase 2 slice 2).
 * Suggestions are advisory — never auto-edit bank source.
 */

/**
 * @param {object} estate
 * @returns {{ id: string, severity: string, kind: string, target: string, title: string, rationale: string, safe: boolean, steps: string[], testStub?: string }[]}
 */
export function suggestRefactors(estate) {
  const out = [];
  const ghosts = estate.ghosts || [];
  const programs = estate.programs || [];
  const rules = estate.rules || [];

  for (const g of ghosts) {
    const name = String(g.programId || "")
      .replace(/^prog:/i, "")
      .toUpperCase();

    if (g.kind === "orphan-source") {
      out.push({
        id: `ref:archive:${name.toLowerCase()}`,
        severity: "medium",
        kind: "archive-orphan-source",
        target: g.programId,
        title: `Archive or document ${name}`,
        rationale: g.evidence || "Source exists but nothing CALLs / EXECs it.",
        safe: true,
        steps: [
          "Confirm with ops that the program is unused",
          "Move to archive/ or mark status=unused-candidate in inventory",
          "Keep a regression stub test so accidental revive is caught",
        ],
        testStub: generateSkipStub(name, "orphan-source — expect not on daily path"),
      });
    }

    if (g.kind === "dynamic-uncertain") {
      out.push({
        id: `ref:static-call:${name.toLowerCase()}`,
        severity: "high",
        kind: "prefer-static-call",
        target: g.programId,
        title: `Replace dynamic CALL targeting ${name} with a literal`,
        rationale: g.evidence || "Dynamic CALL hides the dependency graph.",
        safe: true,
        steps: [
          "Find CALL <identifier> sites",
          "If the name is fixed at runtime, use CALL \"NAME\"",
          "Re-ingest and confirm dynamic-uncertain ghost clears",
        ],
        testStub: generateCallGraphStub(name),
      });
    }

    if (g.kind === "undocumented-run" || g.kind === "ghost-load" || g.kind === "orphan-load") {
      out.push({
        id: `ref:document:${name.toLowerCase()}:${g.kind}`,
        severity: g.kind === "undocumented-run" ? "high" : "medium",
        kind: "document-load",
        target: g.programId,
        title: `Document load/source for ${name} (${g.kind})`,
        rationale: g.evidence || `${g.kind} detected`,
        safe: true,
        steps: [
          "Add PROGRAM-ID source or recover from loadlib export",
          "Update inventory/documented.json",
          "Re-run estate:ingest + ghosts",
        ],
      });
    }
  }

  // High fan-in compute rules → suggest isolated unit test
  const computeByProg = new Map();
  for (const r of rules) {
    if (r.kind !== "compute") continue;
    if (!computeByProg.has(r.programId)) computeByProg.set(r.programId, []);
    computeByProg.get(r.programId).push(r);
  }
  for (const [progId, list] of computeByProg) {
    if (list.length < 1) continue;
    const name = progId.replace(/^prog:/i, "").toUpperCase();
    const prog = programs.find((p) => p.id === progId);
    if (!prog?.sourcePath) continue;
    out.push({
      id: `ref:test-formula:${name.toLowerCase()}`,
      severity: "low",
      kind: "generate-formula-test",
      target: progId,
      title: `Add formula regression test for ${name}`,
      rationale: `${list.length} COMPUTE rule(s) — pin expected interest math.`,
      safe: true,
      steps: [
        "Save generated stub under tests/",
        "Wire Runtime Kit test runner if not already",
        "Assert DISPLAY / return values for known inputs",
      ],
      testStub: generateFormulaStub(name, list[0]),
    });
  }

  return out;
}

function generateSkipStub(name, note) {
  const id = `T${name.replace(/[^A-Z0-9]/gi, "").slice(0, 7)}`.slice(0, 8) || "TSTSKIP";
  return `*> Suggested test stub — ${note}
IDENTIFICATION DIVISION.
PROGRAM-ID. ${id}.
PROCEDURE DIVISION.
    DISPLAY "SKIP ${name}: ${note}"
    STOP RUN.
`;
}

function generateCallGraphStub(name) {
  const id = `T${name.replace(/[^A-Z0-9]/gi, "").slice(0, 7)}`.slice(0, 8) || "TSTCALL";
  return `*> Suggested: prove static CALL graph includes ${name} after refactor
IDENTIFICATION DIVISION.
PROGRAM-ID. ${id}.
PROCEDURE DIVISION.
    DISPLAY "EXPECT STATIC CALL SITE FOR ${name}"
    STOP RUN.
`;
}

function generateFormulaStub(name, rule) {
  const id = `T${name.replace(/[^A-Z0-9]/gi, "").slice(0, 7)}`.slice(0, 8) || "TSTFORM";
  return `*> Suggested formula check for ${name}
*> Rule: ${rule.summary}
IDENTIFICATION DIVISION.
PROGRAM-ID. ${id}.
DATA DIVISION.
WORKING-STORAGE SECTION.
01  WS-OK PIC X VALUE "Y".
PROCEDURE DIVISION.
    DISPLAY "TODO: call ${name} with fixed inputs; assert result"
    DISPLAY "RULE ${rule.summary}"
    IF WS-OK = "Y"
       DISPLAY "PASS"
    ELSE
       DISPLAY "FAIL"
       STOP RUN
    END-IF
    STOP RUN.
`;
}

/**
 * Write test stubs that have content to a directory (safe = new files only).
 */
export function writeRefactorTests(suggestions, outDir, { fs, path } = {}) {
  if (!fs || !path) throw new Error("fs and path required");
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const s of suggestions) {
    if (!s.testStub) continue;
    const base = `${s.kind}-${String(s.target).replace(/[^a-z0-9-]/gi, "_")}.cob`;
    const abs = path.join(outDir, base);
    if (fs.existsSync(abs)) continue;
    fs.writeFileSync(abs, s.testStub, "utf8");
    written.push(abs);
  }
  return written;
}
