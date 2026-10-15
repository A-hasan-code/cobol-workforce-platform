/** Minimal JCL scanner: JOB name, EXEC PGM=, DD DSN=. */

export function parseJcl(source, jclPath) {
  const jobMatch = source.match(/\/\/(\S+)\s+JOB\b/i);
  const jobName = jobMatch ? jobMatch[1].toUpperCase() : pathStem(jclPath);

  const steps = [];
  const stepRe = /\/\/(\S+)\s+EXEC\s+PGM=([A-Z0-9$#@]+)/gi;
  let m;
  while ((m = stepRe.exec(source))) {
    steps.push({
      name: m[1].toUpperCase(),
      program: m[2].toUpperCase(),
    });
  }

  const dds = [];
  const ddRe = /\/\/(\S+)\s+DD\s+.*?\bDSN=([^,\s]+)/gi;
  while ((m = ddRe.exec(source))) {
    dds.push({
      ddname: m[1].toUpperCase(),
      dsn: m[2].toUpperCase(),
    });
  }

  return { jobName, steps, dds, jclPath };
}

function pathStem(p) {
  const base = String(p || "JOB").replace(/\\/g, "/").split("/").pop();
  return base.replace(/\.[^.]+$/, "").toUpperCase();
}

export function collectExecPrograms(jobs) {
  const set = new Set();
  for (const job of jobs) {
    for (const step of job.steps || []) {
      if (step.program) set.add(step.program.toUpperCase());
    }
  }
  return set;
}
