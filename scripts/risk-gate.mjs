/**
 * CI risk gate — fail when watched fields have high impact without ack.
 *
 * Ack file (default samples/bank-playground/inventory/risk-ack.json):
 *   { "acks": [{ "field": "ACCT-BAL-TEXT", "reason": "reviewed" }] }
 *
 * Or pass --ack-high-risk / env RISK_ACK_HIGH=1 for emergency bypass (logged).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

if (process.env.RISK_ACK_HIGH === "1" && !args.includes("--ack-high-risk")) {
  args.push("--ack-high-risk");
}

const r = spawnSync(
  "npm",
  ["run", "risk-gate", "-w", "@cobol/estate-ingest", "--", ...args],
  { cwd: root, encoding: "utf8", shell: true }
);
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
