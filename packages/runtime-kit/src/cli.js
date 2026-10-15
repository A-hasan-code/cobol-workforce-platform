import { doctor } from "./doctor.js";
import { compileSample } from "./compile.js";
import { runSample } from "./run.js";
import { testSample } from "./test.js";
import { resolveSampleDir } from "./paths.js";

function printDiagnostics(diagnostics) {
  if (!diagnostics?.length) return;
  console.log("\nDiagnostics:");
  for (const d of diagnostics) {
    console.log(`  ${d.file}:${d.line}:${d.column} ${d.severity}: ${d.message}`);
  }
}

export async function main(argv) {
  const [cmd, ...rest] = argv;
  const sampleFlag = rest.find((a) => a.startsWith("--sample="));
  const sampleDir = resolveSampleDir(sampleFlag ? sampleFlag.split("=")[1] : undefined);

  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log(`cobol-kit <doctor|compile|run|test> [--sample=path]

Local Runtime Kit for the bank-playground sample.
Install GnuCOBOL first, then: npm run doctor`);
    return;
  }

  if (cmd === "doctor") {
    const d = doctor();
    console.log(d.message);
    if (d.cobc) console.log(`cobc: ${d.cobc}`);
    if (!d.ok) {
      for (const h of d.hints) console.log(h);
      process.exitCode = 1;
    }
    return;
  }

  if (cmd === "compile") {
    const r = compileSample(sampleDir);
    console.log(r.ok ? "Compile OK" : "Compile FAILED");
    if (r.stderr) console.error(r.stderr);
    if (r.stdout) console.log(r.stdout);
    printDiagnostics(r.diagnostics);
    if (!r.ok) process.exitCode = 1;
    return;
  }

  if (cmd === "run") {
    const r = runSample(sampleDir);
    if (r.stage === "compile" && !r.ok) {
      console.error("Compile FAILED");
      console.error(r.stderr);
      printDiagnostics(r.compile?.diagnostics);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    if (!r.ok) process.exitCode = r.code || 1;
    return;
  }

  if (cmd === "test") {
    const r = testSample(sampleDir);
    console.log(r.message);
    if (r.run?.stage === "compile" && r.run.compile) {
      printDiagnostics(r.run.compile.diagnostics);
      console.error(r.run.compile.stderr);
    } else if (!r.ok) {
      console.log("\n--- expected ---\n" + (r.expected || ""));
      console.log("--- actual ---\n" + (r.actual || ""));
      if (r.run?.compile?.diagnostics?.length) {
        printDiagnostics(r.run.compile.diagnostics);
      }
    }
    if (!r.ok) process.exitCode = 1;
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}
