/**
 * Lightweight free-format COBOL scanners for estate ingest (Phase 2 MVP).
 * Not a full compiler front-end — enough for PROGRAM-ID / COPY / CALL graphs.
 */

export function parseProgramId(source) {
  const m = source.match(/PROGRAM-ID\.\s*([A-Z0-9][A-Z0-9-]*)/i);
  return m ? m[1].toUpperCase() : null;
}

export function parseCopyStatements(source) {
  const names = [];
  const re = /\bCOPY\s+([A-Z0-9][A-Z0-9-]*)(?:\s*\.\s*|\s+)/gi;
  // Scan line-by-line so `*> … COPY foo` comments are not edges
  for (const line of source.split(/\r?\n/)) {
    const code = line.replace(/\*>.*/, "");
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(code))) {
      names.push(m[1].toUpperCase());
    }
  }
  return [...new Set(names)];
}

/**
 * Static CALL "NAME" / CALL 'NAME'
 * Dynamic CALL identifier (no quotes) → dynamicTargets
 */
export function parseCallStatements(source) {
  const staticCalls = [];
  const dynamicTargets = [];
  const lines = source.split(/\r?\n/);
  for (const line of lines) {
    const code = line.replace(/\*>.*/, "").trim();
    if (!/\bCALL\b/i.test(code)) continue;
    const lit = code.match(/\bCALL\s+["']([A-Z0-9][A-Z0-9-]*)["']/i);
    if (lit) {
      staticCalls.push(lit[1].toUpperCase());
      continue;
    }
    const dyn = code.match(/\bCALL\s+([A-Z0-9][A-Z0-9-]*)/i);
    if (dyn && !/^(USING|END-CALL)$/i.test(dyn[1])) {
      dynamicTargets.push(dyn[1].toUpperCase());
    }
  }
  return {
    staticCalls: [...new Set(staticCalls)],
    dynamicTargets: [...new Set(dynamicTargets)],
  };
}

export function parseSelectAssign(source) {
  const datasets = [];
  const re =
    /SELECT\s+([A-Z0-9][A-Z0-9-]*)\s+ASSIGN\s+TO\s+["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(source))) {
    datasets.push({
      ddname: m[1].toUpperCase(),
      assign: m[2],
    });
  }
  return datasets;
}
