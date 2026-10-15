/**
 * EasyLang AST → free-format GnuCOBOL (v0–v5 + load_table / try/raise).
 */

const LOAD_TABLE_MAX = 20;
let trySeq = 0;
let loadIxUsed = false;

import { parseCallExpr, parseFieldRef } from "./parse.js";

/** Local demo bank rows — NOT real Db2. Phase 3 replaces with connectors. */
const STUB_SQL_ROWS = {
  ACCT0001: { id: "ACCT0001", name: "Ali Hasan", balance: "1250.00", rate: "5.00" },
  ACCT0002: { id: "ACCT0002", name: "Sara Khan", balance: "800.00", rate: "4.50" },
};

const STUB_HTTP = {
  "/rates/default": "5.00",
  "/rates/promo": "3.25",
  rate: "5.00",
  default: "5.00",
};

function fieldCobol(recVar, field) {
  const r = String(recVar).toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  const f = String(field).toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  return `WS-${r}-${f}`.slice(0, 30);
}

function recordGroupCobol(recVar) {
  return cobolName(recVar);
}

function fileSelect(handle) {
  return `F-${String(handle).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 28)}`;
}
function fileRec(handle) {
  return `${fileSelect(handle)}-REC`;
}
function fileStatus(handle) {
  return `WS-${String(handle).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24)}-FS`;
}
function fileEof(handle) {
  return `WS-${String(handle).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24)}-EOF`;
}

function emitFileStatusCheck(handle, lines, terminate) {
  const fs = fileStatus(handle);
  // no periods inside IF — a period would kill END-IF (same rule as v2 scopes)
  lines.push(`    IF ${fs} NOT = "00"`);
  lines.push(`        DISPLAY "FILE STATUS " ${fs} " FOR " "${handle}"`);
  lines.push(`        STOP RUN`);
  lines.push(terminate ? `    END-IF.` : `    END-IF`);
}

function cobolName(jsName) {
  const up = String(jsName).toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  return `WS-${up}`.slice(0, 30);
}

function tableItemName(jsName) {
  return `${cobolName(jsName)}-ITEM`;
}

function fnProgName(name) {
  return String(name).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30) || "FN";
}

function lkName(param) {
  return `LK-${String(param).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 27)}`;
}

function isStringLiteral(expr) {
  return /^".*"$/.test(String(expr).trim());
}

function isNumberLiteral(expr) {
  return /^-?\d+(\.\d+)?$/.test(String(expr).trim());
}

function fieldKind(expr, ctx) {
  const fr = parseFieldRef(expr);
  if (!fr || !ctx?.recordInstances) return null;
  const typeName = ctx.recordInstances.get(fr.record);
  if (!typeName || !ctx.recordTypes) return null;
  const rec = ctx.recordTypes.get(String(typeName).toLowerCase());
  if (!rec) return null;
  const field = rec.fields.find((f) => f.name === fr.field);
  return field ? field.kind : null;
}

function looksNumericExpr(expr, varTypes, tables, ctx = null) {
  const e = String(expr).trim();
  if (isNumberLiteral(e)) return true;
  if (isStringLiteral(e)) return false;
  const fk = fieldKind(e, ctx);
  if (fk) return fk === "num";
  if (parseCallExpr(e)) return true; // assume numeric return for now
  const idx = e.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(.+)\s*\]$/);
  if (idx) return tables.has(idx[1]) || varTypes.get(idx[1]) === "table";
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(e)) {
    return varTypes.get(e) !== "str" && varTypes.get(e) !== "file" && !String(varTypes.get(e) || "").startsWith("record:");
  }
  if (/[+\-*/()]/.test(e) && !isStringConcat(e, varTypes, tables, ctx)) return true;
  return false;
}

function isStringConcat(expr, varTypes, tables, ctx = null) {
  const e = String(expr).trim();
  if (!e.includes("+")) return false;
  const parts = splitConcatParts(e);
  if (parts.length < 2) return false;
  return parts.some((p) => {
    if (isStringLiteral(p)) return true;
    if (varTypes.get(p) === "str") return true;
    if (fieldKind(p, ctx) === "str") return true;
    return false;
  });
}

function splitConcatParts(expr) {
  const parts = [];
  let cur = "";
  let inStr = false;
  const e = String(expr).trim();
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (c === '"' && e[i - 1] !== "\\") inStr = !inStr;
    if (c === "+" && !inStr) {
      if (cur.trim()) parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function resolveName(n, nameMap) {
  if (nameMap && nameMap.has(n)) return nameMap.get(n);
  return cobolName(n);
}

function mapCondition(cond, varTypes, tables, nameMap = null, ctx = null) {
  let c = cond.trim();
  c = c.replace(/\band\b/gi, " AND ").replace(/\bor\b/gi, " OR ").replace(/\bnot\b/gi, " NOT ");
  c = c.replace(/==/g, "=");
  c = c.replace(/!=/g, "NOT =");
  c = c.replace(
    /([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    (_, rec, field) => fieldCobol(rec, field)
  );
  c = c.replace(
    /([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]/g,
    (_, name, index) => {
      const idx = mapExpr(index, varTypes, tables, nameMap, ctx);
      return `${tableItemName(name)} (${idx} + 1)`;
    }
  );
  const names = [...varTypes.keys()].sort((a, b) => b.length - a.length);
  for (const n of names) {
    if (tables.has(n)) continue;
    if (String(varTypes.get(n) || "").startsWith("record:")) continue;
    const re = new RegExp(`\\b${n}\\b`, "g");
    c = c.replace(re, resolveName(n, nameMap));
  }
  return c.replace(/\s+/g, " ").trim();
}

function mapExpr(expr, varTypes, tables, nameMap = null, ctx = null) {
  let e = String(expr).trim();
  if (isStringLiteral(e) || isNumberLiteral(e)) return e;
  e = e.replace(
    /([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    (_, rec, field) => fieldCobol(rec, field)
  );
  e = e.replace(
    /([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]/g,
    (_, name, index) => {
      const idx = mapExpr(index, varTypes, tables, nameMap, ctx);
      return `${tableItemName(name)} (${idx} + 1)`;
    }
  );
  const names = [...(nameMap ? nameMap.keys() : []), ...varTypes.keys()]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b.length - a.length);
  for (const n of names) {
    if (tables.has(n)) continue;
    if (String(varTypes.get(n) || "").startsWith("record:")) continue;
    const re = new RegExp(`\\b${n}\\b`, "g");
    e = e.replace(re, resolveName(n, nameMap));
  }
  return e;
}

function inferTypes(statements, varTypes, tables, ctx = null) {
  for (const st of statements) {
    if (st.type === "list_assign") {
      tables.set(st.name, st.items.length);
      varTypes.set(st.name, "table");
    } else if (st.type === "const" || st.type === "assign") {
      if (st.construct) {
        varTypes.set(st.name, `record:${st.construct}`);
        if (ctx?.recordInstances) ctx.recordInstances.set(st.name, st.construct);
      }       else if (st.call && st.call.name.toLowerCase() === "open") varTypes.set(st.name, "file");
      else if (st.call && st.call.name.toLowerCase() === "load_table") {
        tables.set(st.name, LOAD_TABLE_MAX);
        varTypes.set(st.name, "table");
      } else if (st.call && st.call.name.toLowerCase() === "read") varTypes.set(st.name, "str");
      else if (st.call && st.call.name.toLowerCase() === "stub_sql") {
        const f = stripLit(st.call.args?.[0] || "").toLowerCase();
        varTypes.set(st.name, f === "balance" || f === "rate" ? "num" : "str");
      } else if (st.call && st.call.name.toLowerCase() === "stub_http") varTypes.set(st.name, "num");
      else if (st.call) varTypes.set(st.name, "num");
      else if (st.fromIndex) varTypes.set(st.name, "num");
      else if (st.fromField) {
        const k = fieldKind(`${st.fromField.record}.${st.fromField.field}`, ctx);
        varTypes.set(st.name, k || "num");
      } else if (isStringLiteral(st.expr) || isStringConcat(st.expr, varTypes, tables, ctx)) {
        varTypes.set(st.name, "str");
      } else if (looksNumericExpr(st.expr, varTypes, tables, ctx)) {
        varTypes.set(st.name, "num");
      } else if (/^[A-Za-z_]/.test(st.expr) && varTypes.has(st.expr)) {
        varTypes.set(st.name, varTypes.get(st.expr));
      } else varTypes.set(st.name, "num");
    } else if (st.type === "for") {
      varTypes.set(st.variable, "num");
      inferTypes(st.body || [], varTypes, tables, ctx);
    } else if (st.type === "while" || st.type === "if" || st.type === "try") {
      inferTypes(st.body || [], varTypes, tables, ctx);
      if (st.elseBody) inferTypes(st.elseBody, varTypes, tables, ctx);
      if (st.exceptBody) inferTypes(st.exceptBody, varTypes, tables, ctx);
    } else if (st.type === "def") {
      inferTypes(st.body || [], varTypes, tables, ctx);
    }
  }
}

function functionHasReturn(body) {
  for (const st of body || []) {
    if (st.type === "return" && st.expr) return true;
    if (st.type === "if") {
      if (functionHasReturn(st.body) || functionHasReturn(st.elseBody)) return true;
    }
    if (st.type === "while" || st.type === "for") {
      if (functionHasReturn(st.body)) return true;
    }
  }
  return false;
}

function inferParamKinds(def) {
  const kinds = {};
  for (const p of def.params) kinds[p] = "num";
  const markStr = (name) => {
    if (Object.prototype.hasOwnProperty.call(kinds, name)) kinds[name] = "str";
  };
  const walk = (body) => {
    for (const st of body || []) {
      if (st.type === "print") {
        for (const a of st.args) {
          if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(a.trim())) markStr(a.trim());
        }
      }
      if (st.type === "assign" && isStringConcat(st.expr, new Map(), new Map())) {
        for (const p of def.params) {
          if (st.expr.includes(p)) markStr(p);
        }
      }
      if (st.type === "return" && st.expr && isStringLiteral(st.expr)) {
        /* return str */
      }
      if (st.body) walk(st.body);
      if (st.elseBody) walk(st.elseBody);
    }
  };
  walk(def.body);
  // call-site override later
  return kinds;
}

let printTempSeq = 0;
let callTempSeq = 0;

/** Periods only outside IF/PERFORM scopes — a period inside IF kills ELSE/END-IF. */
function stmt(line, { terminate = true } = {}) {
  const s = String(line).replace(/\s+$/, "");
  if (!s || s.endsWith(".") || !terminate) return s;
  if (/^\s*(IF |ELSE$|END-IF|PERFORM |END-PERFORM)/.test(s)) return s;
  return `${s}.`;
}

function emitBuiltinLoadTable(st, ctx, tables, lines, terminate) {
  const call = st.call;
  if (call.args.length !== 1) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `load_table expects load_table("file.csv")`,
    });
    return;
  }
  const pathLit = call.args[0].trim();
  if (!isStringLiteral(pathLit)) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `load_table path must be a string literal like "rates.csv"`,
    });
    return;
  }
  const handle = st.name;
  tables.set(handle, LOAD_TABLE_MAX);
  const fileHandle = `ld${handle}`;
  ctx.files.set(fileHandle, {
    handle: fileHandle,
    path: pathLit,
    mode: "r",
    select: fileSelect(fileHandle),
    rec: fileRec(fileHandle),
    status: fileStatus(fileHandle),
    eof: fileEof(fileHandle),
  });
  if (!ctx.loadTables) ctx.loadTables = new Map();
  ctx.loadTables.set(handle, {
    fileHandle,
    count: `${cobolName(handle)}-N`,
    max: LOAD_TABLE_MAX,
  });
  loadIxUsed = true;
  const meta = ctx.files.get(fileHandle);
  const count = ctx.loadTables.get(handle).count;
  const item = tableItemName(handle);
  lines.push(stmt(`    MOVE 0 TO ${count}`, { terminate }));
  lines.push(stmt(`    MOVE "N" TO ${meta.eof}`, { terminate }));
  lines.push(stmt(`    OPEN INPUT ${meta.select}`, { terminate }));
  emitFileStatusCheck(fileHandle, lines, terminate);
  lines.push(
    `    PERFORM VARYING WS-LOAD-IX FROM 1 BY 1 UNTIL WS-LOAD-IX > ${LOAD_TABLE_MAX} OR ${meta.eof} = "Y"`
  );
  lines.push(`        READ ${meta.select} INTO ${meta.rec}`);
  lines.push(`            AT END`);
  lines.push(`                MOVE "Y" TO ${meta.eof}`);
  lines.push(`            NOT AT END`);
  lines.push(`                MOVE ${meta.rec} TO ${item} (WS-LOAD-IX)`);
  lines.push(`                ADD 1 TO ${count}`);
  lines.push(`        END-READ`);
  lines.push(`        IF ${meta.eof} NOT = "Y"`);
  emitFileStatusCheck(fileHandle, lines, false);
  lines.push(`        END-IF`);
  lines.push(terminate ? `    END-PERFORM.` : `    END-PERFORM`);
  lines.push(stmt(`    CLOSE ${meta.select}`, { terminate }));
  emitFileStatusCheck(fileHandle, lines, terminate);
}

function emitBuiltinOpen(st, ctx, lines, terminate) {
  const call = st.call;
  if (call.args.length !== 2) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `open expects open("path.txt", "w"|"r")`,
    });
    return;
  }
  const pathLit = call.args[0].trim();
  const modeLit = call.args[1].trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!isStringLiteral(pathLit)) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `open path must be a string literal like "notes.txt"`,
    });
    return;
  }
  if (modeLit !== "w" && modeLit !== "r") {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `open mode must be "w" (write) or "r" (read)`,
    });
    return;
  }
  const handle = st.name;
  ctx.files.set(handle, {
    handle,
    path: pathLit,
    mode: modeLit,
    select: fileSelect(handle),
    rec: fileRec(handle),
    status: fileStatus(handle),
    eof: fileEof(handle),
  });
  const meta = ctx.files.get(handle);
  if (modeLit === "w") {
    lines.push(stmt(`    OPEN OUTPUT ${meta.select}`, { terminate }));
  } else {
    lines.push(stmt(`    OPEN INPUT ${meta.select}`, { terminate }));
    lines.push(stmt(`    MOVE "N" TO ${meta.eof}`, { terminate }));
  }
  emitFileStatusCheck(handle, lines, terminate);
}

function emitBuiltinRead(st, ctx, varTypes, lines, terminate) {
  const call = st.call;
  if (call.args.length !== 1) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `read expects read(fileHandle)`,
    });
    return;
  }
  const handle = call.args[0].trim();
  const meta = ctx.files.get(handle);
  if (!meta || meta.mode !== "r") {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `read: open ${handle} with "r" first`,
    });
    return;
  }
  const dest = cobolName(st.name);
  lines.push(`    READ ${meta.select} INTO ${dest}`);
  lines.push(`        AT END`);
  lines.push(`            MOVE SPACES TO ${dest}`);
  lines.push(`            MOVE "Y" TO ${meta.eof}`);
  lines.push(`    END-READ`);
  lines.push(`    IF ${meta.eof} NOT = "Y"`);
  emitFileStatusCheck(handle, lines, false);
  lines.push(terminate ? `    END-IF.` : `    END-IF`);
}

function emitBuiltinWrite(call, ctx, varTypes, tables, lines, terminate, nameMap) {
  if (call.args.length !== 2) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `write expects write(fileHandle, value)`,
    });
    return;
  }
  const handle = call.args[0].trim();
  const meta = ctx.files.get(handle);
  if (!meta || meta.mode !== "w") {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `write: open ${handle} with "w" first`,
    });
    return;
  }
  const val = call.args[1].trim();
  if (isStringLiteral(val) || isNumberLiteral(val)) {
    lines.push(stmt(`    MOVE ${val} TO ${meta.rec}`, { terminate: false }));
  } else if (varTypes.get(val) === "str" || /^[A-Za-z_]/.test(val)) {
    lines.push(
      stmt(`    MOVE FUNCTION TRIM(${mapExpr(val, varTypes, tables, nameMap)}) TO ${meta.rec}`, {
        terminate: false,
      })
    );
  } else {
    lines.push(
      stmt(`    MOVE ${mapExpr(val, varTypes, tables, nameMap)} TO ${meta.rec}`, { terminate: false })
    );
  }
  lines.push(stmt(`    WRITE ${meta.rec}`, { terminate }));
  emitFileStatusCheck(handle, lines, terminate);
}

function emitBuiltinClose(call, ctx, lines, terminate) {
  if (call.args.length !== 1) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `close expects close(fileHandle)`,
    });
    return;
  }
  const handle = call.args[0].trim();
  const meta = ctx.files.get(handle);
  if (!meta) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `close: unknown file handle "${handle}" — open it first`,
    });
    return;
  }
  lines.push(stmt(`    CLOSE ${meta.select}`, { terminate }));
  emitFileStatusCheck(handle, lines, terminate);
}

function emitAssign(st, varTypes, tables, lines, editSlots, nameMap, ctx, terminate) {
  const dest = resolveName(st.name, nameMap);
  const t = { terminate };
  if (st.construct) {
    const key = st.construct.toLowerCase();
    const rec = ctx.recordTypes.get(key);
    if (!rec) {
      ctx.diagnostics.push({
        line: st.line,
        column: 1,
        severity: "error",
        message: `Unknown record type "${st.construct}". Define: record ${st.construct}:`,
      });
      return;
    }
    ctx.recordInstances.set(st.name, st.construct);
    varTypes.set(st.name, `record:${st.construct}`);
    lines.push(stmt(`    INITIALIZE ${recordGroupCobol(st.name)}`, t));
    return;
  }
  if (st.call) {
    const bn = st.call.name.toLowerCase();
    if (bn === "open") {
      emitBuiltinOpen(st, ctx, lines, terminate);
      return;
    }
    if (bn === "load_table") {
      emitBuiltinLoadTable(st, ctx, tables, lines, terminate);
      return;
    }
    if (bn === "read") {
      emitBuiltinRead(st, ctx, varTypes, lines, terminate);
      return;
    }
    if (bn === "stub_sql") {
      emitStubSqlAssign(st, dest, ctx, varTypes, lines, terminate);
      return;
    }
    if (bn === "stub_http") {
      emitStubHttpAssign(st, dest, ctx, varTypes, lines, terminate);
      return;
    }
    if (bn === "write" || bn === "close" || bn === "stub_load") {
      ctx.diagnostics.push({
        line: st.line,
        column: 1,
        severity: "error",
        message: `${bn}(...) is a statement — do not assign it`,
      });
      return;
    }
    emitCall(st.call, dest, ctx, varTypes, tables, lines, terminate);
    return;
  }
  const expr = st.expr.trim();
  if (st.fromIndex) {
    lines.push(
      stmt(
        `    MOVE ${tableItemName(st.fromIndex.name)} (${mapExpr(st.fromIndex.index, varTypes, tables, nameMap, ctx)} + 1) TO ${dest}`,
        t
      )
    );
    return;
  }
  if (st.fromField) {
    const cob = fieldCobol(st.fromField.record, st.fromField.field);
    lines.push(stmt(`    MOVE ${cob} TO ${dest}`, t));
    return;
  }
  if (isStringConcat(expr, varTypes, tables, ctx)) {
    const parts = splitConcatParts(expr).map((p) => {
      if (isStringLiteral(p)) return p;
      return `FUNCTION TRIM(${mapExpr(p, varTypes, tables, nameMap, ctx)})`;
    });
    lines.push(
      stmt(
        parts.length === 1
          ? `    MOVE ${parts[0]} TO ${dest}`
          : `    MOVE FUNCTION CONCATENATE(${parts.join(", ")}) TO ${dest}`,
        t
      )
    );
    return;
  }
  if (isStringLiteral(expr) || isNumberLiteral(expr)) {
    lines.push(stmt(`    MOVE ${expr} TO ${dest}`, t));
  } else if (looksNumericExpr(expr, varTypes, tables, ctx) && /[+\-*/]/.test(expr)) {
    lines.push(stmt(`    COMPUTE ${dest} ROUNDED = ${mapExpr(expr, varTypes, tables, nameMap, ctx)}`, t));
  } else if (parseFieldRef(expr)) {
    lines.push(stmt(`    MOVE ${mapExpr(expr, varTypes, tables, nameMap, ctx)} TO ${dest}`, t));
  } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expr)) {
    lines.push(stmt(`    MOVE ${resolveName(expr, nameMap)} TO ${dest}`, t));
  } else {
    lines.push(stmt(`    COMPUTE ${dest} ROUNDED = ${mapExpr(expr, varTypes, tables, nameMap, ctx)}`, t));
  }
}

function emitFieldAssign(st, varTypes, tables, lines, editSlots, nameMap, ctx, terminate) {
  const typeName = ctx.recordInstances.get(st.record);
  if (!typeName) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `"${st.record}" is not a record instance — use ${st.record} = SomeRecord() first`,
    });
    return;
  }
  const rec = ctx.recordTypes.get(String(typeName).toLowerCase());
  const field = rec?.fields.find((f) => f.name === st.field);
  if (!field) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `Unknown field ${st.record}.${st.field}`,
    });
    return;
  }
  const dest = fieldCobol(st.record, st.field);
  const expr = st.expr.trim();
  const t = { terminate };
  if (isStringLiteral(expr) || isNumberLiteral(expr)) {
    lines.push(stmt(`    MOVE ${expr} TO ${dest}`, t));
  } else if (looksNumericExpr(expr, varTypes, tables, ctx) && /[+\-*/]/.test(expr)) {
    lines.push(stmt(`    COMPUTE ${dest} ROUNDED = ${mapExpr(expr, varTypes, tables, nameMap, ctx)}`, t));
  } else if (parseFieldRef(expr) || /^[A-Za-z_]/.test(expr)) {
    lines.push(stmt(`    MOVE ${mapExpr(expr, varTypes, tables, nameMap, ctx)} TO ${dest}`, t));
  } else {
    lines.push(stmt(`    COMPUTE ${dest} ROUNDED = ${mapExpr(expr, varTypes, tables, nameMap, ctx)}`, t));
  }
}

function stripLit(s) {
  const t = String(s || "").trim();
  if (/^".*"$/.test(t) || /^'.*'$/.test(t)) return t.slice(1, -1);
  return t;
}

function emitStubSqlAssign(st, dest, ctx, varTypes, lines, terminate) {
  const args = st.call.args || [];
  if (args.length !== 2) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `stub_sql expects stub_sql("field", "ACCT0001") — fields: id, name, balance, rate`,
    });
    return;
  }
  const field = stripLit(args[0]).toLowerCase();
  const acct = stripLit(args[1]).toUpperCase();
  const row = STUB_SQL_ROWS[acct];
  if (!row) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `stub_sql: unknown account "${acct}". Demo rows: ACCT0001, ACCT0002`,
    });
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(row, field)) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `stub_sql: unknown field "${field}". Use id, name, balance, rate`,
    });
    return;
  }
  const val = row[field];
  const isNum = field === "balance" || field === "rate";
  varTypes.set(st.name, isNum ? "num" : "str");
  lines.push(`*> STUB SQL — not real Db2. Phase 3 swaps this for a connector.`);
  if (isNum) {
    lines.push(stmt(`    MOVE ${val} TO ${dest}`, { terminate }));
  } else {
    lines.push(stmt(`    MOVE "${val}" TO ${dest}`, { terminate }));
  }
}

function emitStubHttpAssign(st, dest, ctx, varTypes, lines, terminate) {
  const args = st.call.args || [];
  if (args.length < 1 || args.length > 2) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `stub_http expects stub_http("/rates/default") or stub_http("rate")`,
    });
    return;
  }
  const pathKey = stripLit(args[0]);
  const val = STUB_HTTP[pathKey] || STUB_HTTP[pathKey.toLowerCase()];
  if (val == null) {
    ctx.diagnostics.push({
      line: st.line,
      column: 1,
      severity: "error",
      message: `stub_http: unknown path "${pathKey}". Try "/rates/default" or "rate"`,
    });
    return;
  }
  varTypes.set(st.name, "num");
  lines.push(`*> STUB HTTP — not a real network call. Phase 3 swaps this for a connector.`);
  lines.push(stmt(`    MOVE ${val} TO ${dest}`, { terminate }));
}

function emitStubLoad(call, ctx, varTypes, lines, terminate) {
  if (call.args.length !== 2) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `stub_load expects stub_load(recordVar, "ACCT0001")`,
    });
    return;
  }
  const handle = call.args[0].trim();
  const acct = stripLit(call.args[1]).toUpperCase();
  const typeName = ctx.recordInstances.get(handle);
  if (!typeName) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `stub_load: "${handle}" is not a record — create it with Account() first`,
    });
    return;
  }
  const row = STUB_SQL_ROWS[acct];
  if (!row) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `stub_load: unknown account "${acct}". Demo rows: ACCT0001, ACCT0002`,
    });
    return;
  }
  const rec = ctx.recordTypes.get(String(typeName).toLowerCase());
  lines.push(`*> STUB LOAD — fills record from local demo table (not Db2).`);
  for (const f of rec.fields) {
    const key = f.name.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
    const dest = fieldCobol(handle, f.name);
    const val = row[key];
    if (f.kind === "num") lines.push(stmt(`    MOVE ${val} TO ${dest}`, { terminate: false }));
    else lines.push(stmt(`    MOVE "${val}" TO ${dest}`, { terminate: false }));
  }
  // terminate last line
  if (lines.length && !/\.\s*$/.test(lines[lines.length - 1]) && terminate) {
    lines[lines.length - 1] = stmt(lines[lines.length - 1], { terminate: true });
  }
}

function emitCall(call, retDest, ctx, varTypes, tables, lines, terminate = true, nameMap = null) {
  const term = { terminate };
  const key = call.name.toLowerCase();
  if (key === "write") {
    emitBuiltinWrite(call, ctx, varTypes, tables, lines, terminate, nameMap);
    return null;
  }
  if (key === "close") {
    emitBuiltinClose(call, ctx, lines, terminate);
    return null;
  }
  if (key === "stub_load") {
    emitStubLoad(call, ctx, varTypes, lines, terminate);
    return null;
  }
  if (
    key === "open" ||
    key === "read" ||
    key === "load_table" ||
    key === "stub_sql" ||
    key === "stub_http"
  ) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `${key} must be assigned: x = ${key}(...)`,
    });
    return null;
  }
  const meta = ctx.functions.get(key);
  if (!meta) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `Unknown function "${call.name}". Define it with def ${call.name}(...):`,
    });
    return null;
  }
  if (call.args.length !== meta.params.length) {
    ctx.diagnostics.push({
      line: call.line || 1,
      column: 1,
      severity: "error",
      message: `${call.name} expects ${meta.params.length} arg(s), got ${call.args.length}`,
    });
    return null;
  }
  const using = [];
  for (let i = 0; i < call.args.length; i++) {
    const arg = call.args[i].trim();
    const wantStr = meta.paramKinds[meta.params[i]] === "str";
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(arg) && !isNumberLiteral(arg)) {
      using.push(cobolName(arg));
    } else if (isStringLiteral(arg) || isNumberLiteral(arg)) {
      callTempSeq += 1;
      const tmp = `WS-CARG${callTempSeq}`;
      ctx.callTemps.set(tmp, wantStr || isStringLiteral(arg) ? "str" : "num");
      lines.push(stmt(`    MOVE ${arg} TO ${tmp}`, term));
      using.push(tmp);
    } else {
      callTempSeq += 1;
      const tmp = `WS-CARG${callTempSeq}`;
      ctx.callTemps.set(tmp, "num");
      lines.push(stmt(`    COMPUTE ${tmp} ROUNDED = ${mapExpr(arg, varTypes, tables)}`, term));
      using.push(tmp);
    }
  }
  let ret = retDest;
  if (meta.hasReturn) {
    if (!ret) {
      callTempSeq += 1;
      ret = `WS-CRET${callTempSeq}`;
      ctx.callTemps.set(ret, meta.returnKind || "num");
    }
    using.push(ret);
  }
  if (using.length) {
    lines.push(stmt(`    CALL "${meta.progName}" USING ${using.join(" ")}`, term));
  } else {
    lines.push(stmt(`    CALL "${meta.progName}"`, term));
  }
  return ret;
}

function emitPrintArg(a, varTypes, tables, editSlots, lines, temps, nameMap, ctx, terminate = true) {
  const t = { terminate };
  if (isStringLiteral(a)) return a;
  if (isNumberLiteral(a)) return a;
  const call = parseCallExpr(a);
  if (call) {
    callTempSeq += 1;
    const tmp = `WS-CRET${callTempSeq}`;
    ctx.callTemps.set(tmp, "num");
    emitCall(call, tmp, ctx, varTypes, tables, lines, terminate);
    // keep only in callTemps — do not also push to printTemps (duplicate WS)
    lines.push(stmt(`    MOVE ${tmp} TO ${tmp}-E`, t));
    return `FUNCTION TRIM(${tmp}-E)`;
  }
  const idx = a.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(.+)\s*\]$/);
  if (idx) {
    return `${tableItemName(idx[1])} (${mapExpr(idx[2], varTypes, tables, nameMap)} + 1)`;
  }
  const fr = parseFieldRef(a);
  if (fr) {
    const cob = fieldCobol(fr.record, fr.field);
    const kind = fieldKind(a, ctx);
    if (kind === "str") return `FUNCTION TRIM(${cob})`;
    editSlots.add(`__field_${cob}`);
    lines.push(stmt(`    MOVE ${cob} TO ${cob}-E`, t));
    return `FUNCTION TRIM(${cob}-E)`;
  }
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(a)) {
    const cob = resolveName(a, nameMap);
    if (varTypes.get(a) === "str" || (nameMap && String(cob).startsWith("LK-") && ctx?.fnStrParams?.has(a))) {
      return `FUNCTION TRIM(${cob})`;
    }
    if (varTypes.get(a) === "num" || !varTypes.has(a)) {
      if (cob.startsWith("WS-")) {
        editSlots.add(a);
        return `FUNCTION TRIM(${cob}-E)`;
      }
      return cob;
    }
    return `FUNCTION TRIM(${cob})`;
  }
  if (looksNumericExpr(a, varTypes, tables, ctx) || /[+\-*/]/.test(a)) {
    printTempSeq += 1;
    const tmp = `WS-PRT${printTempSeq}`;
    temps.add(tmp);
    lines.push(stmt(`    COMPUTE ${tmp} ROUNDED = ${mapExpr(a, varTypes, tables, nameMap, ctx)}`, t));
    lines.push(stmt(`    MOVE ${tmp} TO ${tmp}-E`, t));
    return `FUNCTION TRIM(${tmp}-E)`;
  }
  return mapExpr(a, varTypes, tables, nameMap, ctx);
}

function emitBlock(statements, varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, terminate = true) {
  const t = { terminate };
  for (const st of statements) {
    if (st.type === "def" || st.type === "import") continue;
    if (st.type === "assert") {
      const cond = mapCondition(st.condition, varTypes, tables, nameMap, ctx);
      lines.push(`    IF NOT (${cond})`);
      lines.push(`        DISPLAY "ASSERT FAIL: ${st.condition.replace(/"/g, "'")}"`);
      lines.push(`        STOP RUN`);
      lines.push(terminate ? `    END-IF.` : `    END-IF`);
      continue;
    }
    if (st.type === "const") {
      const dest = cobolName(st.name);
      if (isStringLiteral(st.expr) || isNumberLiteral(st.expr)) {
        lines.push(stmt(`    MOVE ${st.expr} TO ${dest}`, t));
      } else {
        lines.push(stmt(`    COMPUTE ${dest} ROUNDED = ${mapExpr(st.expr, varTypes, tables, nameMap)}`, t));
      }
    } else if (st.type === "list_assign") {
      const n = st.items.length;
      tables.set(st.name, n);
      for (let i = 0; i < n; i++) {
        const item = st.items[i];
        const dest = `${tableItemName(st.name)} (${i + 1})`;
        lines.push(
          stmt(
            `    MOVE ${isStringLiteral(item) ? item : mapExpr(item, varTypes, tables, nameMap)} TO ${dest}`,
            t
          )
        );
      }
    } else if (st.type === "index_assign") {
      if (!tables.has(st.name)) {
        diagnostics.push({
          line: st.line,
          column: 1,
          severity: "error",
          message: `Table "${st.name}" was not defined with a list literal first`,
        });
        continue;
      }
      lines.push(
        stmt(
          `    MOVE ${mapExpr(st.expr, varTypes, tables, nameMap)} TO ${tableItemName(st.name)} (${mapExpr(st.index, varTypes, tables, nameMap)} + 1)`,
          t
        )
      );
    } else if (st.type === "field_assign") {
      emitFieldAssign(st, varTypes, tables, lines, editSlots, nameMap, ctx, terminate);
    } else if (st.type === "assign") {
      emitAssign(st, varTypes, tables, lines, editSlots, nameMap, ctx, terminate);
    } else if (st.type === "call") {
      emitCall(st, null, ctx, varTypes, tables, lines, terminate, nameMap);
    } else if (st.type === "print") {
      const parts = [];
      for (const raw of st.args) {
        parts.push(
          emitPrintArg(raw.trim(), varTypes, tables, editSlots, lines, printTemps, nameMap, ctx, terminate)
        );
      }
      if (parts.length === 0) lines.push(stmt(`    DISPLAY SPACE`, t));
      else if (parts.length === 1) lines.push(stmt(`    DISPLAY ${parts[0]}`, t));
      else {
        const withSpaces = [];
        parts.forEach((p, i) => {
          if (i) withSpaces.push(`" "`);
          withSpaces.push(p);
        });
        lines.push(stmt(`    DISPLAY ${withSpaces.join(" ")}`, t));
      }
    } else if (st.type === "if") {
      lines.push(`    IF ${mapCondition(st.condition, varTypes, tables, nameMap, ctx)}`);
      emitBlock(st.body || [], varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, false);
      if (st.elseBody?.length) {
        lines.push(`    ELSE`);
        emitBlock(st.elseBody, varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, false);
      }
      lines.push(terminate ? `    END-IF.` : `    END-IF`);
    } else if (st.type === "while") {
      lines.push(`    PERFORM UNTIL NOT (${mapCondition(st.condition, varTypes, tables, nameMap, ctx)})`);
      emitBlock(st.body || [], varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, false);
      lines.push(terminate ? `    END-PERFORM.` : `    END-PERFORM`);
    } else if (st.type === "for") {
      const v = resolveName(st.variable, nameMap);
      lines.push(
        `    PERFORM VARYING ${v} FROM ${mapExpr(st.start, varTypes, tables, nameMap, ctx)} BY 1 UNTIL ${v} >= ${mapExpr(st.end, varTypes, tables, nameMap, ctx)}`
      );
      emitBlock(st.body || [], varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, false);
      lines.push(terminate ? `    END-PERFORM.` : `    END-PERFORM`);
    } else if (st.type === "return") {
      if (st.expr && ctx.returnLk) {
        const e = st.expr.trim();
        if (isStringLiteral(e) || isNumberLiteral(e)) {
          lines.push(stmt(`    MOVE ${e} TO ${ctx.returnLk}`, t));
        } else if (/[+\-*/]/.test(e)) {
          lines.push(
            stmt(`    COMPUTE ${ctx.returnLk} ROUNDED = ${mapExpr(e, varTypes, tables, nameMap, ctx)}`, t)
          );
        } else {
          lines.push(stmt(`    MOVE ${mapExpr(e, varTypes, tables, nameMap, ctx)} TO ${ctx.returnLk}`, t));
        }
      }
      lines.push(stmt(`    GOBACK`, t));
    } else if (st.type === "try") {
      trySeq += 1;
      const id = trySeq;
      const raised = `WS-RAISED-${id}`;
      const msg = `WS-RAISE-MSG-${id}`;
      const endLabel = `TRY-END-${id}`;
      if (!ctx.tryFlags) ctx.tryFlags = [];
      ctx.tryFlags.push({ raised, msg });
      const prevTry = ctx.tryId;
      ctx.tryId = id;
      ctx.tryRaised = raised;
      ctx.tryMsg = msg;
      ctx.tryEnd = endLabel;
      lines.push(stmt(`    MOVE "N" TO ${raised}`, t));
      lines.push(stmt(`    MOVE SPACES TO ${msg}`, t));
      emitBlock(st.body || [], varTypes, tables, lines, editSlots, diagnostics, printTemps, nameMap, ctx, false);
      lines.push(`${endLabel}.`);
      ctx.tryId = prevTry;
      ctx.tryRaised = prevTry ? `WS-RAISED-${prevTry}` : null;
      ctx.tryMsg = prevTry ? `WS-RAISE-MSG-${prevTry}` : null;
      ctx.tryEnd = prevTry ? `TRY-END-${prevTry}` : null;
      lines.push(`    IF ${raised} = "Y"`);
      emitBlock(
        st.exceptBody || [],
        varTypes,
        tables,
        lines,
        editSlots,
        diagnostics,
        printTemps,
        nameMap,
        ctx,
        false
      );
      lines.push(terminate ? `    END-IF.` : `    END-IF`);
    } else if (st.type === "raise") {
      const msgExpr = st.expr || '"ERROR"';
      let displayBit;
      if (isStringLiteral(msgExpr)) {
        displayBit = msgExpr;
      } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(msgExpr.trim())) {
        displayBit = `FUNCTION TRIM(${resolveName(msgExpr.trim(), nameMap)})`;
      } else {
        displayBit = `"ERROR"`;
      }
      if (ctx.tryId && ctx.tryRaised && ctx.tryEnd) {
        if (isStringLiteral(msgExpr)) {
          lines.push(stmt(`    MOVE ${msgExpr} TO ${ctx.tryMsg}`, t));
        } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(msgExpr.trim())) {
          lines.push(
            stmt(`    MOVE ${resolveName(msgExpr.trim(), nameMap)} TO ${ctx.tryMsg}`, t)
          );
        } else {
          lines.push(stmt(`    MOVE "ERROR" TO ${ctx.tryMsg}`, t));
        }
        lines.push(stmt(`    MOVE "Y" TO ${ctx.tryRaised}`, { terminate: true }));
        // Period required — without it the next paragraph name becomes a 2nd GO TO target.
        lines.push(`    GO TO ${ctx.tryEnd}.`);
      } else {
        lines.push(stmt(`    DISPLAY "RAISE " ${displayBit}`, t));
        lines.push(stmt(`    STOP RUN`, t));
      }
    } else if (st.type === "stop") {
      lines.push(stmt(`    STOP RUN`, t));
    }
  }
}

function buildWsLines(
  varTypes,
  tables,
  editSlots,
  printTemps,
  callTemps,
  statements,
  files,
  recordInstances,
  recordTypes,
  loadTables,
  tryFlags,
  needLoadIx
) {
  const ws = [];
  for (const [name, len] of tables) {
    const sample = (statements || []).find((s) => s.type === "list_assign" && s.name === name);
    const isLoad = loadTables?.has(name);
    const asStr =
      isLoad || (sample && sample.items.some((it) => isStringLiteral(it)));
    const pic = asStr ? (isLoad ? "PIC X(200)" : "PIC X(40)") : "PIC S9(9)V99";
    ws.push(`01  ${cobolName(name)}.`);
    ws.push(`    05  ${tableItemName(name)} OCCURS ${len} TIMES ${pic}.`);
    if (isLoad) {
      ws.push(`01  ${loadTables.get(name).count} PIC 9(4) VALUE 0.`);
    }
  }
  if (needLoadIx) {
    ws.push(`01  WS-LOAD-IX PIC 9(4) VALUE 0.`);
  }
  for (const f of tryFlags || []) {
    ws.push(`01  ${f.raised} PIC X VALUE "N".`);
    ws.push(`01  ${f.msg} PIC X(80) VALUE SPACES.`);
  }
  // record group items
  for (const [inst, typeName] of recordInstances || []) {
    const rec = recordTypes?.get(String(typeName).toLowerCase());
    if (!rec) continue;
    ws.push(`01  ${recordGroupCobol(inst)}.`);
    for (const f of rec.fields) {
      const cob = fieldCobol(inst, f.name);
      if (f.kind === "str") ws.push(`    05  ${cob} PIC X(80) VALUE SPACES.`);
      else ws.push(`    05  ${cob} PIC S9(9)V99 VALUE 0.`);
    }
  }
  for (const [name, kind] of varTypes) {
    if (kind === "table" || kind === "file") continue;
    if (String(kind).startsWith("record:")) continue;
    const cob = cobolName(name);
    if (kind === "str") ws.push(`01  ${cob} PIC X(200) VALUE SPACES.`);
    else ws.push(`01  ${cob} PIC S9(9)V99 VALUE 0.`);
  }
  for (const meta of files?.values?.() || []) {
    ws.push(`01  ${meta.status} PIC XX VALUE "00".`);
    if (meta.mode === "r") ws.push(`01  ${meta.eof} PIC X VALUE "N".`);
  }
  for (const name of editSlots) {
    if (String(name).startsWith("__tmp_")) continue;
    if (String(name).startsWith("__field_")) {
      const cob = String(name).slice("__field_".length);
      ws.push(`01  ${cob}-E PIC -(9)9.99.`);
      continue;
    }
    ws.push(`01  ${cobolName(name)}-E PIC -(9)9.99.`);
  }
  for (const tmp of printTemps) {
    ws.push(`01  ${tmp} PIC S9(9)V99 VALUE 0.`);
    ws.push(`01  ${tmp}-E PIC -(9)9.99.`);
  }
  for (const [t, kind] of callTemps) {
    if (kind === "str") ws.push(`01  ${t} PIC X(80) VALUE SPACES.`);
    else {
      ws.push(`01  ${t} PIC S9(9)V99 VALUE 0.`);
      ws.push(`01  ${t}-E PIC -(9)9.99.`);
    }
  }
  return ws;
}

function emitNestedFunction(def, meta) {
  const lines = [];
  const varTypes = new Map();
  const tables = new Map();
  // params in map
  for (const p of def.params) {
    varTypes.set(p, meta.paramKinds[p] || "num");
  }
  inferTypes(def.body || [], varTypes, tables);

  const nameMap = new Map();
  for (const p of def.params) nameMap.set(p, lkName(p));
  // locals that aren't params
  for (const [n, k] of varTypes) {
    if (def.params.includes(n)) continue;
    if (k === "table") continue;
    nameMap.set(n, cobolName(n));
  }

  const editSlots = new Set();
  const printTemps = new Set();
  const diagnostics = [];
  const callTemps = new Map();
  const ctx = {
    functions: meta.allFunctions,
    diagnostics,
    callTemps,
    returnLk: meta.hasReturn ? "LK-RET" : null,
    fnStrParams: new Set(def.params.filter((p) => meta.paramKinds[p] === "str")),
  };

  const proc = [];
  printTempSeq = 0;
  callTempSeq = 0;
  emitBlock(def.body || [], varTypes, tables, proc, editSlots, diagnostics, printTemps, nameMap, ctx);
  if (!proc.some((l) => /GOBACK|STOP RUN/.test(l))) {
    proc.push(stmt(`    GOBACK`));
  }

  const linkage = [];
  for (const p of def.params) {
    const pic = meta.paramKinds[p] === "str" ? "PIC X(80)" : "PIC S9(9)V99";
    linkage.push(`01  ${lkName(p)} ${pic}.`);
  }
  if (meta.hasReturn) {
    const pic = meta.returnKind === "str" ? "PIC X(80)" : "PIC S9(9)V99";
    linkage.push(`01  LK-RET ${pic}.`);
  }

  const localWs = [];
  for (const [n, k] of varTypes) {
    if (def.params.includes(n) || k === "table") continue;
    if (k === "str") localWs.push(`01  ${cobolName(n)} PIC X(80) VALUE SPACES.`);
    else localWs.push(`01  ${cobolName(n)} PIC S9(9)V99 VALUE 0.`);
  }
  for (const tmp of printTemps) {
    localWs.push(`01  ${tmp} PIC S9(9)V99 VALUE 0.`);
    localWs.push(`01  ${tmp}-E PIC -(9)9.99.`);
  }

  const usingList = [
    ...def.params.map((p) => lkName(p)),
    ...(meta.hasReturn ? ["LK-RET"] : []),
  ];

  lines.push(``);
  lines.push(`IDENTIFICATION DIVISION.`);
  lines.push(`PROGRAM-ID. ${meta.progName} IS COMMON PROGRAM.`);
  lines.push(`DATA DIVISION.`);
  if (localWs.length) {
    lines.push(`WORKING-STORAGE SECTION.`);
    lines.push(...localWs);
  }
  if (linkage.length) {
    lines.push(`LINKAGE SECTION.`);
    lines.push(...linkage);
  }
  lines.push(`PROCEDURE DIVISION${usingList.length ? ` USING ${usingList.join(" ")}` : ""}.`);
  lines.push(...proc);
  lines.push(`END PROGRAM ${meta.progName}.`);
  return { lines, diagnostics };
}

export function generateCobol(ast, { programId = "EASYPROG" } = {}) {
  const diagnostics = [];
  const all = ast.statements || [];
  const defs = all.filter((s) => s.type === "def");
  const recordDefs = all.filter((s) => s.type === "record");
  const mainStmts = all.filter(
    (s) => s.type !== "def" && s.type !== "import" && s.type !== "record"
  );

  const recordTypes = new Map();
  for (const r of recordDefs) {
    const key = r.name.toLowerCase();
    if (recordTypes.has(key)) {
      diagnostics.push({
        line: r.line,
        column: 1,
        severity: "error",
        message: `Duplicate record ${r.name}`,
      });
      continue;
    }
    recordTypes.set(key, { name: r.name, fields: r.fields });
  }

  const functions = new Map();
  for (const d of defs) {
    const key = d.name.toLowerCase();
    if (functions.has(key)) {
      diagnostics.push({
        line: d.line,
        column: 1,
        severity: "error",
        message: `Duplicate def ${d.name}`,
      });
      continue;
    }
    const hasReturn = functionHasReturn(d.body);
    let returnKind = d.returnKind || "num";
    for (const st of d.body || []) {
      if (st.type === "return" && st.expr && isStringLiteral(st.expr)) returnKind = "str";
    }
    const paramKinds = { ...inferParamKinds(d), ...(d.paramKinds || {}) };
    // refine from main call sites
    for (const st of mainStmts) {
      const calls = [];
      if (st.type === "call" && st.name.toLowerCase() === key) calls.push(st);
      if (st.type === "assign" && st.call && st.call.name.toLowerCase() === key) calls.push(st.call);
      for (const c of calls) {
        c.args.forEach((a, i) => {
          if (isStringLiteral(a) && d.params[i] && !paramKinds[d.params[i]]) {
            paramKinds[d.params[i]] = "str";
          }
        });
      }
    }
    functions.set(key, {
      name: d.name,
      progName: fnProgName(d.name),
      params: d.params,
      hasReturn,
      returnKind,
      paramKinds,
      def: d,
      allFunctions: functions,
    });
  }

  // wire allFunctions ref
  for (const meta of functions.values()) {
    meta.allFunctions = functions;
  }

  const varTypes = new Map();
  const tables = new Map();
  const recordInstances = new Map();
  const editSlots = new Set();
  const printTemps = new Set();
  const callTemps = new Map();
  const files = new Map();
  printTempSeq = 0;
  callTempSeq = 0;
  trySeq = 0;
  loadIxUsed = false;
  const proc = [];
  const ctx = {
    functions,
    diagnostics,
    callTemps,
    returnLk: null,
    files,
    recordTypes,
    recordInstances,
    loadTables: new Map(),
    tryFlags: [],
  };
  inferTypes(mainStmts, varTypes, tables, ctx);

  emitBlock(mainStmts, varTypes, tables, proc, editSlots, diagnostics, printTemps, null, ctx);

  if (diagnostics.length) {
    return { ok: false, cobol: "", diagnostics, varTypes: {} };
  }

  // Only add a trailing STOP RUN if the main path never stops.
  // Do NOT rewrite STOP RUN inside IF/assert — a period there breaks END-IF.
  const hasTopStop = proc.some((l) => /^\s*STOP RUN\.?\s*$/.test(l));
  if (!hasTopStop) {
    proc.push(`    STOP RUN.`);
  }

  const ws = buildWsLines(
    varTypes,
    tables,
    editSlots,
    printTemps,
    callTemps,
    mainStmts,
    files,
    recordInstances,
    recordTypes,
    ctx.loadTables,
    ctx.tryFlags,
    loadIxUsed
  );

  const proc2 = [];
  for (const line of proc) {
    if (line.includes("DISPLAY") && line.includes("-E)")) {
      const re = /FUNCTION TRIM\((WS-[A-Z0-9-]+)-E\)/g;
      let mm;
      const moved = new Set();
      while ((mm = re.exec(line))) {
        const base = mm[1];
        if (!moved.has(base)) {
          // never terminate — may sit inside IF/PERFORM before END-*
          proc2.push(`    MOVE ${base} TO ${base}-E`);
          moved.add(base);
        }
      }
    }
    proc2.push(line);
  }

  const pid = String(programId)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 30) || "EASYPROG";

  const nested = [];
  for (const d of defs) {
    const meta = functions.get(d.name.toLowerCase());
    if (!meta) continue;
    const n = emitNestedFunction(d, meta);
    diagnostics.push(...n.diagnostics);
    nested.push(...n.lines);
  }

  if (diagnostics.length) {
    return { ok: false, cobol: "", diagnostics, varTypes: {} };
  }

  const envLines = [];
  const fileSection = [];
  if (files.size) {
    envLines.push(`ENVIRONMENT DIVISION.`);
    envLines.push(`INPUT-OUTPUT SECTION.`);
    envLines.push(`FILE-CONTROL.`);
    for (const meta of files.values()) {
      envLines.push(`    SELECT ${meta.select} ASSIGN TO ${meta.path}`);
      envLines.push(`        ORGANIZATION IS LINE SEQUENTIAL`);
      envLines.push(`        FILE STATUS IS ${meta.status}.`);
    }
    envLines.push(``);
    fileSection.push(`FILE SECTION.`);
    for (const meta of files.values()) {
      fileSection.push(`FD  ${meta.select}.`);
      fileSection.push(`01  ${meta.rec} PIC X(200).`);
    }
    fileSection.push(``);
  }

  const needEnd = defs.length > 0;
  const cobol = [
    `*> Generated by EasyLang v5 (+ load_table/try) — do not hand-edit without switching to COBOL mode`,
    `IDENTIFICATION DIVISION.`,
    `PROGRAM-ID. ${pid}.`,
    ``,
    ...envLines,
    `DATA DIVISION.`,
    ...fileSection,
    `WORKING-STORAGE SECTION.`,
    ...(ws.length ? ws : [`01  WS-DUMMY PIC X VALUE " ".`]),
    ``,
    `PROCEDURE DIVISION.`,
    `MAIN.`,
    ...proc2,
    ...nested,
    ...(needEnd ? [`END PROGRAM ${pid}.`] : []),
    ``,
  ].join("\n");

  return {
    ok: true,
    cobol,
    diagnostics: [],
    varTypes: Object.fromEntries(varTypes),
    tables: Object.fromEntries(tables),
  };
}
