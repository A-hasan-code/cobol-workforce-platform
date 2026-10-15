import fs from "node:fs";
import path from "node:path";
import { parseEasy } from "./parse.js";
import { generateCobol } from "./codegen.js";

export { parseEasy } from "./parse.js";
export { generateCobol } from "./codegen.js";

/**
 * Resolve `import name` by loading name.easy from basedir (defs only merge).
 */
function resolveImports(ast, { basedir, _seen = new Set() } = {}) {
  const diagnostics = [...(ast.diagnostics || [])];
  const imports = (ast.statements || []).filter((s) => s.type === "import");
  if (!imports.length) return { ...ast, diagnostics };

  if (!basedir) {
    for (const im of imports) {
      diagnostics.push({
        line: im.line,
        column: 1,
        severity: "error",
        message: `import "${im.name}" needs a project folder (basedir) — use Playground or pass basedir`,
      });
    }
    return { ok: false, statements: ast.statements, diagnostics, version: "5" };
  }

  const mergedDefs = [];
  for (const im of imports) {
    const key = im.name.toLowerCase();
    if (_seen.has(key)) {
      diagnostics.push({
        line: im.line,
        column: 1,
        severity: "error",
        message: `Circular import: ${im.name}`,
      });
      continue;
    }
    _seen.add(key);
    const filePath = path.join(basedir, `${im.name}.easy`);
    if (!fs.existsSync(filePath)) {
      diagnostics.push({
        line: im.line,
        column: 1,
        severity: "error",
        message: `import not found: ${im.name}.easy (looked in ${basedir})`,
      });
      continue;
    }
    const src = fs.readFileSync(filePath, "utf8");
    const child = parseEasy(src);
    if (!child.ok) {
      diagnostics.push(...child.diagnostics.map((d) => ({ ...d, message: `${im.name}.easy: ${d.message}` })));
      continue;
    }
    const resolved = resolveImports(child, { basedir, _seen: new Set(_seen) });
    if (!resolved.ok && resolved.diagnostics?.length) {
      diagnostics.push(...resolved.diagnostics);
      continue;
    }
    const body = resolved.statements || child.statements;
    for (const st of body) {
      if (st.type === "def" || st.type === "record") mergedDefs.push(st);
      else if (st.type === "import") {
        /* already resolved */
      } else {
        diagnostics.push({
          line: im.line,
          column: 1,
          severity: "error",
          message: `${im.name}.easy may only contain record / def / import / comments (no top-level run code)`,
        });
      }
    }
  }

  if (diagnostics.some((d) => d.severity === "error")) {
    return { ok: false, statements: ast.statements, diagnostics, version: "5" };
  }

  const withoutImports = (ast.statements || []).filter((s) => s.type !== "import");
  return {
    ok: true,
    statements: [...mergedDefs, ...withoutImports],
    diagnostics,
    version: "5",
  };
}

export function transpile(source, options = {}) {
  const ast = parseEasy(source);
  if (!ast.ok) {
    return {
      ok: false,
      cobol: "",
      diagnostics: ast.diagnostics,
      version: "5",
    };
  }

  const basedir =
    options.basedir ||
    (options.sourcePath ? path.dirname(options.sourcePath) : undefined);

  const resolved = resolveImports(ast, { basedir });
  if (!resolved.ok) {
    return {
      ok: false,
      cobol: "",
      diagnostics: resolved.diagnostics,
      version: "5",
    };
  }

  const gen = generateCobol(resolved, options);
  return {
    ok: gen.ok,
    cobol: gen.cobol,
    diagnostics: [...resolved.diagnostics, ...gen.diagnostics],
    version: "5",
    varTypes: gen.varTypes,
    tables: gen.tables,
  };
}
