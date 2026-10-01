export type ReportPeriod = "semanal" | "mensual" | "anual";

export type SaleRecord = {
  week: string;
  branch: string;
  quantity: number;
  product: string;
  total: number;
  month: string;
  year: number;
};

export type ZoneReport = {
  zone: string;
  fileName: string;
  branches: string[];
  records: SaleRecord[];
};

export type DashboardData = {
  periods: ReportPeriod[];
  zones: ZoneReport[];
};
