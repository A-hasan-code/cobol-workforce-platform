/**
 * Parse cobc diagnostic lines into editor markers.
 * Common shapes:
 *   file.cob:12: error: message
 *   file.cob:12:25: error: message
 *   file.cob: 12: error: ...
 */
export function parseCobcErrors(text, sampleDir) {
  const lines = (text || "").split(/\r?\n/);
  const diagnostics = [];
  const re =
    /^(?<file>[^:\r\n]+):(?<line>\d+)(?::(?<col>\d+))?:\s*(?<severity>error|warning|note):\s*(?<message>.+)$/i;

  for (const line of lines) {
    const m = line.match(re);
    if (!m || !m.groups) continue;
    diagnostics.push({
      file: m.groups.file.replace(/\\/g, "/"),
      line: Number(m.groups.line),
      column: m.groups.col ? Number(m.groups.col) : 1,
      severity: m.groups.severity.toLowerCase(),
      message: m.groups.message.trim(),
      raw: line,
    });
  }

  return { diagnostics, sampleDir };
}
