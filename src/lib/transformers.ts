export function jsonToCsv(json: any[]): string {
  if (!Array.isArray(json) || json.length === 0) {
    return "";
  }

  const headers = Object.keys(json[0] ?? {});

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    if (value instanceof Date) return value.toISOString();

    if (typeof value === "boolean") return value ? "true" : "false";

    if (typeof value === "number")
      return Number.isFinite(value) ? `${value}` : "";

    if (typeof value === "object") return JSON.stringify(value);

    const strValue = String(value);
    const needsQuoting = /[",\n]/.test(strValue);
    const escaped = strValue.replace(/"/g, '""');
    return needsQuoting ? `"${escaped}"` : escaped;
  };

  const rows = json.map((row) =>
    headers.map((header) => formatValue((row ?? {})[header])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function jsonToSql(
  json: any[],
  tableName: string = "mock_data"
): string {
  if (!Array.isArray(json) || json.length === 0) {
    return "";
  }

  const columns = Object.keys(json[0] ?? {});

  const escapeString = (value: string) => value.replace(/'/g, "''");

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";

    if (value instanceof Date) return `'${value.toISOString()}'`;

    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";

    if (typeof value === "number")
      return Number.isFinite(value) ? `${value}` : "NULL";

    if (typeof value === "object")
      return `'${escapeString(JSON.stringify(value))}'`;

    return `'${escapeString(String(value))}'`;
  };

  const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, "_");

  const statements = json.map((row) => {
    const values = columns
      .map((col) => formatValue((row ?? {})[col]))
      .join(", ");
    return `INSERT INTO ${sanitizedTable} (${columns.join(
      ", "
    )}) VALUES (${values});`;
  });

  return statements.join("\n");
}
