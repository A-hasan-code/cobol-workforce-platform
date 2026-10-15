/** Extract level / name / PIC fields from a simple copybook. */

export function parseCopybookFields(source) {
  const fields = [];
  const re =
    /^\s*(\d{2})\s+([A-Z0-9][A-Z0-9-]*)(?:\s+PIC(?:TURE)?\s+([A-Z0-9().V+-]+))?/gim;
  let m;
  while ((m = re.exec(source))) {
    fields.push({
      name: m[2].toUpperCase(),
      level: Number(m[1]),
      picture: m[3] || "",
    });
  }
  return fields;
}

export function copybookBaseName(fileName) {
  return fileName
    .replace(/\.(cpy|cbl|cob)$/i, "")
    .toUpperCase();
}
