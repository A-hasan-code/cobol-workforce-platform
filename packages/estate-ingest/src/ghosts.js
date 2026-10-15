/**
 * Ghost detection via set math (see docs/ESTATE-INGEST.md).
 *
 * S = source programs
 * L = load members
 * J = JCL EXEC PGM=
 * C = static CALL targets
 * D = dynamic CALL identifiers
 * Doc = official inventory
 */

export function detectGhosts({ sourceNames, loadNames, jclNames, callNames, dynamicNames, docNames }) {
  const S = new Set(sourceNames);
  const L = new Set(loadNames);
  const J = new Set(jclNames);
  const C = new Set(callNames);
  const D = new Set(dynamicNames);
  const Doc = new Set(docNames);

  const ghosts = [];
  const statusByName = new Map();

  const mark = (name, status, kind, evidence) => {
    statusByName.set(name, status);
    ghosts.push({ programId: `prog:${name.toLowerCase()}`, kind, evidence });
  };

  for (const name of L) {
    if (!Doc.has(name)) {
      mark(name, "ghost", "ghost-load", `In loadlib but not in documented inventory`);
    }
  }

  for (const name of S) {
    if (!L.has(name) && !J.has(name) && !C.has(name)) {
      mark(
        name,
        "orphan-source",
        "orphan-source",
        `Source present; not in loadlib, JCL EXEC, or static CALL`
      );
    }
  }

  for (const name of L) {
    if (!S.has(name)) {
      mark(name, "orphan-load", "orphan-load", `Load member with no source in estate`);
    }
  }

  for (const name of J) {
    if (!Doc.has(name)) {
      mark(
        name,
        "ghost",
        "undocumented-run",
        `JCL EXEC PGM=${name} but not in documented inventory`
      );
    }
  }

  for (const name of L) {
    if (!J.has(name) && !C.has(name)) {
      const pid = `prog:${name.toLowerCase()}`;
      if (!ghosts.some((g) => g.programId === pid)) {
        mark(
          name,
          "unused-candidate",
          "unused-candidate",
          `Load present; no JCL EXEC or static CALL (verify before delete)`
        );
      }
    }
  }

  for (const name of D) {
    mark(
      name,
      "dynamic-uncertain",
      "dynamic-uncertain",
      `Dynamic CALL target identifier — resolve at runtime only`
    );
  }

  // Prefer strongest status if multiple marks
  const priority = [
    "orphan-load",
    "ghost",
    "orphan-source",
    "dynamic-uncertain",
    "unused-candidate",
    "documented",
  ];
  const finalStatus = new Map();
  for (const [name, st] of statusByName) {
    const prev = finalStatus.get(name);
    if (!prev || priority.indexOf(st) < priority.indexOf(prev)) {
      finalStatus.set(name, st);
    }
  }

  return { ghosts, statusByName: finalStatus };
}
