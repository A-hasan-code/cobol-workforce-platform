/**
 * CI risk gates — block merge on high impact unless explicitly acked.
 */

import { impactAnalysis } from "./impact.js";

/**
 * @param {object} estate
 * @param {{ fields?: string[], targets?: string[], acks?: { field?: string, target?: string, reason?: string }[], maxBand?: string }} opts
 */
export function evaluateRiskGate(estate, opts = {}) {
  const fields = opts.fields?.length ? opts.fields : ["ACCT-BAL-TEXT"];
  const targets = opts.targets || [];
  const acks = opts.acks || [];
  // Default: anything above "low" needs ack for watched fields (bank caution).
  const maxBand = opts.maxBand || "low";
  const bandRank = { low: 1, medium: 2, high: 3 };

  const findings = [];

  for (const field of fields) {
    const report = impactAnalysis(estate, { field });
    findings.push({
      kind: "field",
      key: field,
      ok: report.ok,
      riskScore: report.riskScore,
      riskBand: report.riskBand || "low",
      summary: report.summary,
      acked: acks.some((a) => String(a.field || "").toUpperCase() === field.toUpperCase()),
    });
  }

  for (const target of targets) {
    const report = impactAnalysis(estate, { target });
    findings.push({
      kind: "target",
      key: target,
      ok: report.ok,
      riskScore: report.riskScore,
      riskBand: report.riskBand || "low",
      summary: report.summary,
      acked: acks.some(
        (a) => String(a.target || "").toUpperCase() === String(target).toUpperCase()
      ),
    });
  }

  const blocked = [];
  for (const f of findings) {
    if (!f.ok) continue;
    const rank = bandRank[f.riskBand] || 0;
    const max = bandRank[maxBand] || 2;
    if (rank > max && !f.acked) {
      blocked.push(f);
    }
  }

  return {
    ok: blocked.length === 0,
    maxBand,
    findings,
    blocked,
    summary: blocked.length
      ? `Risk gate FAIL — ${blocked.length} high-impact item(s) need ack`
      : `Risk gate PASS — ${findings.length} check(s)`,
  };
}

export function loadRiskAcks(ackPath, fs) {
  if (!ackPath || !fs.existsSync(ackPath)) return [];
  const raw = JSON.parse(fs.readFileSync(ackPath, "utf8"));
  return Array.isArray(raw.acks) ? raw.acks : Array.isArray(raw) ? raw : [];
}
