export type CsvColumn<T> = {
  label: string;
  value: (row: T) => any;
};

export function serializeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function formatCsvCell(value: any): string {
  const raw = serializeCsvValue(value);
  const escaped = raw.replace(/"/g, '""');
  if (
    escaped.includes(",") ||
    escaped.includes("\n") ||
    escaped.includes("\r") ||
    escaped.includes('"')
  ) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function buildCsvString<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const header = columns.map((column) => formatCsvCell(column.label)).join(",");
  const dataRows = rows.map((row) =>
    columns.map((column) => formatCsvCell(column.value(row))).join(","),
  );
  return [header, ...dataRows].join("\r\n");
}

export function downloadCsvFile<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
) {
  if (typeof window === "undefined") return;

  const csvString = buildCsvString(columns, rows);
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
