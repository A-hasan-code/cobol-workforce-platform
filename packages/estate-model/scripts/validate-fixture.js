import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = path.join(root, "fixtures", "bank-playground.estate.json");
const schemaPath = path.join(root, "schema", "estate.schema.json");

const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const errors = [];

function req(obj, key, ctx) {
  if (obj[key] === undefined || obj[key] === null) {
    errors.push(`${ctx}: missing required "${key}"`);
  }
}

req(fixture, "version", "estate");
req(fixture, "programs", "estate");
req(fixture, "copybooks", "estate");
req(fixture, "dependencies", "estate");

if (!Array.isArray(fixture.programs) || fixture.programs.length < 1) {
  errors.push("estate.programs must be a non-empty array");
}
if (!Array.isArray(fixture.copybooks) || fixture.copybooks.length < 1) {
  errors.push("estate.copybooks must be a non-empty array");
}
if (!Array.isArray(fixture.dependencies) || fixture.dependencies.length < 1) {
  errors.push("estate.dependencies must be a non-empty array");
}

for (const [i, p] of (fixture.programs || []).entries()) {
  req(p, "id", `programs[${i}]`);
  req(p, "name", `programs[${i}]`);
}
for (const [i, c] of (fixture.copybooks || []).entries()) {
  req(c, "id", `copybooks[${i}]`);
  req(c, "name", `copybooks[${i}]`);
}
for (const [i, d] of (fixture.dependencies || []).entries()) {
  req(d, "from", `dependencies[${i}]`);
  req(d, "to", `dependencies[${i}]`);
  req(d, "type", `dependencies[${i}]`);
}

const ids = new Set([
  ...(fixture.programs || []).map((p) => p.id),
  ...(fixture.copybooks || []).map((c) => c.id),
  ...(fixture.datasets || []).map((d) => d.id),
  ...(fixture.jobs || []).map((j) => j.id),
]);
for (const [i, d] of (fixture.dependencies || []).entries()) {
  if (!ids.has(d.from)) errors.push(`dependencies[${i}].from unknown id: ${d.from}`);
  if (!ids.has(d.to)) errors.push(`dependencies[${i}].to unknown id: ${d.to}`);
}

if (Array.isArray(fixture.ghosts)) {
  for (const [i, g] of fixture.ghosts.entries()) {
    req(g, "programId", `ghosts[${i}]`);
    req(g, "kind", `ghosts[${i}]`);
  }
}

if (Array.isArray(fixture.rules)) {
  for (const [i, r] of fixture.rules.entries()) {
    req(r, "id", `rules[${i}]`);
    req(r, "programId", `rules[${i}]`);
    req(r, "kind", `rules[${i}]`);
    req(r, "summary", `rules[${i}]`);
  }
}

if (Array.isArray(fixture.refactors)) {
  for (const [i, s] of fixture.refactors.entries()) {
    req(s, "id", `refactors[${i}]`);
    req(s, "kind", `refactors[${i}]`);
    req(s, "title", `refactors[${i}]`);
    if (s.safe === undefined) errors.push(`refactors[${i}]: missing required "safe"`);
  }
}

if (errors.length) {
  console.error("Estate fixture INVALID:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log(
  `Estate fixture OK — ${fixture.programs.length} programs, ${fixture.copybooks.length} copybooks, ` +
    `${fixture.dependencies.length} deps, rules=${(fixture.rules || []).length}, ` +
    `refactors=${(fixture.refactors || []).length} (schema ${schema.title})`
);
