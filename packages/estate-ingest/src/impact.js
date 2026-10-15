/**
 * Impact analysis: who depends on a program, copybook, or field.
 */

export function impactAnalysis(estate, { target, field } = {}) {
  if (!estate) throw new Error("estate required");

  const deps = estate.dependencies || [];
  const programs = estate.programs || [];
  const copybooks = estate.copybooks || [];
  const jobs = estate.jobs || [];

  let seedIds = [];
  let label = target || field || "";

  if (field) {
    const fieldUpper = field.toUpperCase();
    const owning = copybooks.filter((c) =>
      (c.fields || []).some((f) => f.name === fieldUpper)
    );
    seedIds = owning.map((c) => c.id);
    label = `field ${fieldUpper}`;
    if (!seedIds.length) {
      return {
        ok: false,
        label,
        riskScore: 0,
        summary: `Field ${fieldUpper} not found in any copybook`,
        dependents: { programs: [], jobs: [], copybooks: [], edges: [] },
      };
    }
  } else if (target) {
    const t = String(target);
    if (t.startsWith("prog:") || t.startsWith("cpy:") || t.startsWith("ds:") || t.startsWith("job:")) {
      seedIds = [t];
    } else {
      const upper = t.toUpperCase();
      const prog = programs.find((p) => p.name === upper || p.id === `prog:${t.toLowerCase()}`);
      const cpy = copybooks.find(
        (c) =>
          c.name.replace(/\.(cpy|cbl)$/i, "").toUpperCase() === upper ||
          c.id === `cpy:${t.toLowerCase()}`
      );
      if (prog) seedIds = [prog.id];
      else if (cpy) seedIds = [cpy.id];
      else seedIds = [`prog:${t.toLowerCase()}`, `cpy:${t.toLowerCase()}`];
    }
    label = seedIds.join(", ");
  } else {
    throw new Error("Provide target= or field=");
  }

  // Reverse edges: to ← from (who depends on seed)
  const reverse = new Map();
  for (const d of deps) {
    if (!reverse.has(d.to)) reverse.set(d.to, []);
    reverse.get(d.to).push(d);
  }

  const visited = new Set();
  const edges = [];
  const queue = [...seedIds];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    for (const e of reverse.get(id) || []) {
      edges.push(e);
      queue.push(e.from);
    }
  }

  // Jobs that EXEC any impacted program
  const impactedProgIds = [...visited].filter((id) => id.startsWith("prog:"));
  const impactedJobs = jobs.filter((j) =>
    (j.steps || []).some((s) => impactedProgIds.includes(s.programId))
  );

  const depPrograms = programs.filter((p) => visited.has(p.id) && !seedIds.includes(p.id));
  const depCopybooks = copybooks.filter((c) => visited.has(c.id) && !seedIds.includes(c.id));

  // Also include programs that COPY a seed copybook (direct)
  for (const id of seedIds) {
    if (id.startsWith("cpy:")) {
      for (const d of deps) {
        if (d.to === id && d.type === "COPY") {
          const p = programs.find((x) => x.id === d.from);
          if (p && !depPrograms.some((x) => x.id === p.id)) depPrograms.push(p);
        }
      }
    }
  }

  const programCount = new Set([
    ...depPrograms.map((p) => p.id),
    ...edges.filter((e) => e.from.startsWith("prog:")).map((e) => e.from),
  ]).size;
  const jobCount = impactedJobs.length;
  const riskScore = Math.min(100, programCount * 15 + jobCount * 20 + (field ? 10 : 0));

  return {
    ok: true,
    label,
    seedIds,
    field: field || null,
    riskScore,
    riskBand: riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low",
    summary: `${programCount} program(s), ${jobCount} job(s) may be affected (${riskScore}/100)`,
    dependents: {
      programs: depPrograms,
      jobs: impactedJobs,
      copybooks: depCopybooks,
      edges,
    },
    changeReport: {
      title: `Impact report — ${label}`,
      riskScore,
      riskBand: riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low",
      programs: depPrograms.map((p) => p.name),
      jobs: impactedJobs.map((j) => j.name),
      evidence: edges.map((e) => `${e.from} -[${e.type}]-> ${e.to}`),
    },
  };
}
