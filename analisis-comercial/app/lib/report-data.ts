import fs from "node:fs";
import path from "node:path";

import type { DashboardData, SaleRecord, ZoneReport } from "@/app/types/report";

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCurrency(value: string): number {
  if (!value) return 0;

  const normalized = value
    .replace(/\$/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "");

  if (!normalized || normalized === "-") return 0;

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeZoneName(fileName: string): string {
  return fileName
    .replace(/\.csv$/i, "")
    .replace(/\s*BD\s*-\s*Venta Monetaria$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readCsvRows(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<CsvRow>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

function buildZoneReport(fileName: string): ZoneReport {
  const filePath = path.join(process.cwd(), "bd", fileName);
  const rows = readCsvRows(filePath);
  const records: SaleRecord[] = rows.map((row) => ({
    week: (row.Semana || "").trim(),
    branch: (row.Sucursal || "").trim(),
    quantity: Number((row.Cantidad || "0").replace(/\s+/g, "")) || 0,
    product: (row.Producto || "").trim(),
    total: parseCurrency(row.Total || "0"),
    month: (row.Mes || "").trim(),
    year: Number((row.Año || "").trim()) || 0,
  }));

  return {
    zone: normalizeZoneName(fileName),
    fileName,
    branches: [...new Set(records.map((record) => record.branch).filter(Boolean))].sort(),
    records,
  };
}

export function getDashboardData(): DashboardData {
  const zoneFiles = fs
    .readdirSync(path.join(process.cwd(), "bd"))
    .filter((file) => file.toLowerCase().endsWith(".csv"));

  const zones = zoneFiles.map(buildZoneReport);

  return {
    periods: ["semanal", "mensual", "anual"],
    zones,
  };
}
