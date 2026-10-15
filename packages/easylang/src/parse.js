/**
 * EasyLang v0–v5 + plan v3 leftovers: load_table, try/raise.
 */

function diag(line, column, message, severity = "error") {
  return { line, column, severity, message };
}

function stripComment(line) {
  let inStr = false;
  for (let k = 0; k < line.length; k++) {
    const c = line[k];
    if (c === '"' && line[k - 1] !== "\\") inStr = !inStr;
    if (c === "#" && !inStr) return line.slice(0, k);
  }
  return line;
}

function indentWidth(raw) {
  const m = raw.match(/^[ \t]*/);
  const s = m ? m[0] : "";
  return s.replace(/\t/g, "    ").length;
}

export function splitArgs(inner) {
  const args = [];
  let cur = "";
  let inStr = false;
  let depth = 0;
  for (let i = 0; i < String(inner || "").length; i++) {
    const c = inner[i];
    if (c === '"' && inner[i - 1] !== "\\") {
      inStr = !inStr;
      cur += c;
      continue;
    }
    if (!inStr) {
      if (c === "(" || c === "[") depth += 1;
      if (c === ")" || c === "]") depth -= 1;
      if (c === "," && depth === 0) {
        if (cur.trim()) args.push(cur.trim());
        cur = "";
        continue;
      }
    }
    cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function parseListLiteral(expr) {
  const m = expr.match(/^\[(.*)\]$/);
  if (!m) return null;
  const inner = m[1].trim();
  if (!inner) return [];
  return splitArgs(inner);
}

function parseIndexRef(text) {
  const m = String(text).trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(.+?)\s*\]$/);
  if (!m) return null;
  return { name: m[1], index: m[2].trim() };
}

function parseFieldRef(text) {
  const m = String(text).trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)$/);
  if (!m) return null;
  return { record: m[1], field: m[2] };
}

function normalizeFieldKind(raw) {
  const k = String(raw || "").trim().toLowerCase();
  if (k === "str" || k === "string" || k === "text") return "str";
  if (k === "num" || k === "number" || k === "int" || k === "float") return "num";
  return null;
}

/** Call expression — print/range excluded; file/stub builtins flagged. */
export function parseCallExpr(text) {
  const m = String(text).trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*$/);
  if (!m) return null;
  const name = m[1];
  if (/^(print|range)$/i.test(name)) return null;
  const builtin =
    /^(open|read|write|close|load_table|stub_sql|stub_http|stub_load)$/i.test(name);
  return { name, args: splitArgs(m[2]), builtin };
}

export function parseEasy(source) {
  const diagnostics = [];
  const rawLines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const rows = [];

  for (let i = 0; i < rawLines.length; i++) {
    const lineNo = i + 1;
    const raw = rawLines[i];
    const indent = indentWidth(raw);
    const code = stripComment(raw).trim();
    if (!code) continue;
    rows.push({ lineNo, indent, code });
  }

  function parseBlock(startIdx, parentIndent, { inFunction = false } = {}) {
    const body = [];
    let i = startIdx;
    while (i < rows.length) {
      const row = rows[i];
      if (row.indent < parentIndent) break;
      if (row.indent !== parentIndent) {
        diagnostics.push(
          diag(row.lineNo, 1, `Unexpected indent (expected ${parentIndent} spaces for this block)`)
        );
        i += 1;
        continue;
      }

      const { code, lineNo } = row;

      if (/^else\s*:?\s*$/i.test(code)) {
        diagnostics.push(diag(lineNo, 1, "`else` must follow an `if` block"));
        i += 1;
        continue;
      }

      if (/^except\s*:?\s*$/i.test(code)) {
        diagnostics.push(diag(lineNo, 1, "`except` must follow a `try` block"));
        i += 1;
        continue;
      }

      const recordMatch = code.match(/^record\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*$/i);
      if (recordMatch) {
        if (parentIndent !== 0) {
          diagnostics.push(diag(lineNo, 1, "`record` only allowed at top level"));
          i += 1;
          continue;
        }
        const fields = [];
        i += 1;
        const fieldIndent = parentIndent + 4;
        while (i < rows.length) {
          const fr = rows[i];
          if (fr.indent < fieldIndent) break;
          if (fr.indent !== fieldIndent) {
            diagnostics.push(diag(fr.lineNo, 1, `Record fields must indent ${fieldIndent} spaces`));
            i += 1;
            continue;
          }
          const fm = fr.code.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)$/);
          if (!fm) {
            diagnostics.push(
              diag(fr.lineNo, 1, `Record field must look like name: str|num (got "${fr.code}")`)
            );
            i += 1;
            continue;
          }
          const kind = normalizeFieldKind(fm[2]);
          if (!kind) {
            diagnostics.push(diag(fr.lineNo, 1, `Unknown field type "${fm[2]}" — use str or num`));
            i += 1;
            continue;
          }
          fields.push({ name: fm[1], kind });
          i += 1;
        }
        if (!fields.length) {
          diagnostics.push(diag(lineNo, 1, `record ${recordMatch[1]} needs at least one field`));
        }
        body.push({ type: "record", line: lineNo, name: recordMatch[1], fields });
        continue;
      }

      const defMatch = code.match(
        /^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*(?:->\s*([A-Za-z_][A-Za-z0-9_]*))?\s*:\s*$/i
      );
      if (defMatch) {
        if (parentIndent !== 0) {
          diagnostics.push(diag(lineNo, 1, "Nested def not supported — define at top level"));
          i += 1;
          continue;
        }
        const paramKinds = {};
        const params = splitArgs(defMatch[2]).map((p) => {
          const typed = p.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)$/);
          if (typed) {
            const kind = normalizeFieldKind(typed[2]);
            if (!kind) {
              diagnostics.push(diag(lineNo, 1, `Invalid param type "${typed[2]}" — use str or num`));
            } else {
              paramKinds[typed[1]] = kind;
            }
            return typed[1];
          }
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(p)) {
            diagnostics.push(diag(lineNo, 1, `Invalid parameter name: ${p}`));
          }
          return p;
        });
        let returnKind = null;
        if (defMatch[3]) {
          returnKind = normalizeFieldKind(defMatch[3]);
          if (!returnKind) {
            diagnostics.push(diag(lineNo, 1, `Invalid return type "${defMatch[3]}" — use str or num`));
          }
        }
        const node = {
          type: "def",
          line: lineNo,
          name: defMatch[1],
          params,
          paramKinds,
          returnKind,
          body: [],
        };
        i += 1;
        const inner = parseBlock(i, parentIndent + 4, { inFunction: true });
        node.body = inner.body;
        i = inner.next;
        body.push(node);
        continue;
      }

      const tryMatch = code.match(/^try\s*:\s*$/i);
      if (tryMatch) {
        const node = {
          type: "try",
          line: lineNo,
          body: [],
          exceptBody: [],
        };
        const childIndent = parentIndent + 4;
        i += 1;
        const tryParsed = parseBlock(i, childIndent, { inFunction });
        node.body = tryParsed.body;
        i = tryParsed.next;
        if (i < rows.length) {
          const maybeExcept = rows[i];
          if (
            maybeExcept.indent === parentIndent &&
            /^except\s*:?\s*$/i.test(maybeExcept.code)
          ) {
            i += 1;
            const exceptParsed = parseBlock(i, childIndent, { inFunction });
            node.exceptBody = exceptParsed.body;
            i = exceptParsed.next;
          } else {
            diagnostics.push(diag(lineNo, 1, "`try` needs a following `except:` block"));
          }
        } else {
          diagnostics.push(diag(lineNo, 1, "`try` needs a following `except:` block"));
        }
        body.push(node);
        continue;
      }

      const ifMatch = code.match(/^if\s+(.+?)\s*:\s*$/i);
      if (ifMatch) {
        const node = {
          type: "if",
          line: lineNo,
          condition: ifMatch[1].trim(),
          body: [],
          elseBody: null,
        };
        const childIndent = parentIndent + 4;
        i += 1;
        const thenParsed = parseBlock(i, childIndent, { inFunction });
        node.body = thenParsed.body;
        i = thenParsed.next;
        if (i < rows.length) {
          const maybeElse = rows[i];
          if (
            maybeElse.indent === parentIndent &&
            /^else\s*:?\s*$/i.test(maybeElse.code)
          ) {
            i += 1;
            const elseParsed = parseBlock(i, childIndent, { inFunction });
            node.elseBody = elseParsed.body;
            i = elseParsed.next;
          }
        }
        body.push(node);
        continue;
      }

      const whileMatch = code.match(/^while\s+(.+?)\s*:\s*$/i);
      if (whileMatch) {
        const node = {
          type: "while",
          line: lineNo,
          condition: whileMatch[1].trim(),
          body: [],
        };
        i += 1;
        const inner = parseBlock(i, parentIndent + 4, { inFunction });
        node.body = inner.body;
        i = inner.next;
        body.push(node);
        continue;
      }

      const forMatch = code.match(
        /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\s*\((.+)\)\s*:\s*$/i
      );
      if (forMatch) {
        const args = splitArgs(forMatch[2]);
        let start = "0";
        let end = null;
        if (args.length === 1) end = args[0];
        else if (args.length === 2) {
          start = args[0];
          end = args[1];
        } else {
          diagnostics.push(diag(lineNo, 1, "range() supports range(n) or range(start, end)"));
          i += 1;
          continue;
        }
        const node = {
          type: "for",
          line: lineNo,
          variable: forMatch[1],
          start,
          end,
          body: [],
        };
        i += 1;
        const inner = parseBlock(i, parentIndent + 4, { inFunction });
        node.body = inner.body;
        i = inner.next;
        body.push(node);
        continue;
      }

      if (/^stop\s*$/i.test(code)) {
        body.push({ type: "stop", line: lineNo });
        i += 1;
        continue;
      }

      const importMatch = code.match(/^import\s+["']?([A-Za-z_][A-Za-z0-9_-]*)["']?\s*$/i);
      if (importMatch) {
        if (parentIndent !== 0) {
          diagnostics.push(diag(lineNo, 1, "`import` only allowed at top level"));
          i += 1;
          continue;
        }
        body.push({ type: "import", line: lineNo, name: importMatch[1] });
        i += 1;
        continue;
      }

      const assertMatch = code.match(/^assert\s+(.+)$/i);
      if (assertMatch) {
        body.push({ type: "assert", line: lineNo, condition: assertMatch[1].trim() });
        i += 1;
        continue;
      }

      const raiseMatch = code.match(/^raise(?:\s+(.+))?$/i);
      if (raiseMatch) {
        body.push({
          type: "raise",
          line: lineNo,
          expr: raiseMatch[1] ? raiseMatch[1].trim() : '"ERROR"',
        });
        i += 1;
        continue;
      }

      const retMatch = code.match(/^return(?:\s+(.+))?$/i);
      if (retMatch) {
        if (!inFunction) {
          diagnostics.push(diag(lineNo, 1, "`return` only allowed inside def"));
          i += 1;
          continue;
        }
        body.push({
          type: "return",
          line: lineNo,
          expr: retMatch[1] ? retMatch[1].trim() : null,
        });
        i += 1;
        continue;
      }

      const printMatch = code.match(/^print\s*\((.*)\)\s*$/i);
      if (printMatch) {
        body.push({ type: "print", line: lineNo, args: splitArgs(printMatch[1]) });
        i += 1;
        continue;
      }

      const constMatch = code.match(/^const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/i);
      if (constMatch) {
        body.push({
          type: "const",
          line: lineNo,
          name: constMatch[1],
          expr: constMatch[2].trim(),
        });
        i += 1;
        continue;
      }

      const idxAssign = code.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(.+?)\s*\]\s*=\s*(.+)$/);
      if (idxAssign) {
        body.push({
          type: "index_assign",
          line: lineNo,
          name: idxAssign[1],
          index: idxAssign[2].trim(),
          expr: idxAssign[3].trim(),
        });
        i += 1;
        continue;
      }

      const fieldAssign = code.match(
        /^([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/
      );
      if (fieldAssign) {
        body.push({
          type: "field_assign",
          line: lineNo,
          record: fieldAssign[1],
          field: fieldAssign[2],
          expr: fieldAssign[3].trim(),
        });
        i += 1;
        continue;
      }

      const callOnly = parseCallExpr(code);
      if (callOnly) {
        body.push({ type: "call", line: lineNo, ...callOnly });
        i += 1;
        continue;
      }

      const assignMatch = code.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const name = assignMatch[1];
        const expr = assignMatch[2].trim();
        const listItems = parseListLiteral(expr);
        if (listItems) {
          body.push({ type: "list_assign", line: lineNo, name, items: listItems });
        } else {
          const ctor = expr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*$/);
          const call = ctor ? null : parseCallExpr(expr);
          const fromIndex = parseIndexRef(expr);
          const fromField = parseFieldRef(expr);
          body.push({
            type: "assign",
            line: lineNo,
            name,
            expr,
            fromIndex: fromIndex || undefined,
            fromField: fromField || undefined,
            call: call || undefined,
            construct: ctor ? ctor[1] : undefined,
          });
        }
        i += 1;
        continue;
      }

      diagnostics.push(
        diag(
          lineNo,
          1,
          "Unsupported EasyLang. Allowed: record, assign, const, lists, print, if/else, while, for, try/except/raise, def/return/calls, open/read/write/close/load_table, stub_sql/stub_http/stub_load, assert, import, stop. See docs/EASY-MODE.md"
        )
      );
      i += 1;
    }
    return { body, next: i };
  }

  const { body: statements } = parseBlock(0, 0, { inFunction: false });
  return { ok: diagnostics.length === 0, statements, diagnostics, version: "5" };
}

export { parseFieldRef };
