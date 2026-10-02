export type ReportPeriod = "semanal" | "mensual" | "anual";

export type Level = "general" | "zona" | "sucursal" | "producto";

export type SaleRecord = {
  // Original & normalized fields per prompt specification
  Zona: string;
  Fecha: string;           // ISO YYYY-MM-DD
  Fecha_Inicial: string;   // e.g. "21/sep/26"
  Fecha_Final: string;     // e.g. "27/sep/26"
  Año: number;             // e.g. 2026
  Semana: number;          // e.g. 39
  Semana_Label: string;    // e.g. "S39 · 2026"
  Sucursal: string;        // e.g. "Arenales"
  Producto: string;        // e.g. "PECHUGÓN"
  Cantidad: number;        // e.g. 188
  Venta: number;           // e.g. 33940
  Precio_Promedio: number; // e.g. 180.53
  Precio?: number;
  Subtotal?: number;
  Descuento?: number;
  Mes?: string;
  Trimestre?: string;
  Archivo_Fuente: string;  // e.g. "GDL BD - Venta Monetaria.csv"
};

export type WeekOption = {
  key: string;       // e.g. "2026-S39"
  label: string;     // e.g. "S39 · 2026"
  year: number;      // 2026
  week: number;      // 39
  startDate: string; // "2026-09-21"
  endDate: string;   // "2026-09-27"
};

export type BranchTableRow = {
  sucursal: string;
  zona: string;
  venta: number;
  vsSemanaAnteriorMxn: number;
  vsSemanaAnteriorPct: number | null;
  vsAñoAnteriorMxn: number;
  vsAñoAnteriorPct: number | null;
  participacionPct: number;
};

export type ProductTableRow = {
  producto: string;
  unidades: number;
  venta: number;
  precioPromedio: number;
  vsSemanaAnteriorMxn: number;
  vsSemanaAnteriorPct: number | null;
  vsAñoAnteriorMxn: number;
  vsAñoAnteriorPct: number | null;
  participacionPct: number;
};

export type DriverItem = {
  name: string;
  deltaWeeklyMxn: number;
  deltaWeeklyPct: number | null;
  currentSales: number;
  prevSales: number;
};

export type AnalyticsSummary = {
  // Current Filter State & Meta
  startDate: string;
  endDate: string;
  selectedZone: string;
  selectedBranch: string;
  selectedProduct: string;
  weekLabel: string;
  weekStatusNote: string; // e.g. "Semana completa", "Periodo parcial (21/09/2026 → 24/09/2026)", or multiple
  isPartialWeek: boolean;
  isMultiWeek: boolean;
  includedWeeks: string[];

  // Primary KPIs
  totalSales: number;
  totalUnits: number;
  activeBranchesCount: number;
  activeProductsCount: number;
  averagePrice: number;
  ticketAverage: number;
  sharePct: number;

  // Comparative vs Semana Anterior
  prevWeekLabel: string;
  prevSales: number;
  prevUnits: number;
  deltaWeeklySales: number;
  deltaWeeklySalesPct: number | null;
  deltaWeeklyUnits: number;
  deltaWeeklyUnitsPct: number | null;

  // Comparative vs Año Anterior
  aaWeekLabel: string;
  aaSales: number;
  aaUnits: number;
  deltaAnnualSales: number;
  deltaAnnualSalesPct: number | null;
  deltaAnnualUnits: number;
  deltaAnnualUnitsPct: number | null;

  // Navigation / Cascading Filter Options
  availableZones: string[];
  availableBranches: string[];
  availableProducts: string[];
  availableWeeks: WeekOption[];

  // Tables
  branchTableRows: BranchTableRow[];
  productTableRows: ProductTableRow[];

  // Growth & Decline Drivers
  growthDrivers: DriverItem[];
  declineDrivers: DriverItem[];

  // Chart datasets
  salesByBranchChart: { name: string; current: number; previous: number; aa: number }[];
  salesByProductChart: { name: string; current: number; previous: number }[];
  variationByBranchChart: { name: string; deltaWeekly: number; deltaAnnual: number }[];
  variationByProductChart: { name: string; deltaWeekly: number; deltaAnnual: number }[];
  participationChart: { name: string; value: number; sharePct: number; color?: string }[];

  // Executive Platform Channels Strip & Breakdown
  platformChannels: {
    id: string;
    name: string;
    amount: number;
    percentage: number;
    deltaPct: number;
    color: string;
    iconType: "cash" | "card" | "uber" | "rappi" | "didi" | "delivery";
  }[];

  // 5-Week Trend Line Chart Dataset (S35..S39)
  weeklyTrend: {
    weekLabel: string;
    currentSales: number;
    aaSales: number;
  }[];

  // General Comparison Matrix
  generalComparison: {
    indicator: string;
    current: string;
    previousYear: string;
    deltaAA: number | null;
    previousWeek: string;
    deltaSA: number | null;
    iconType: "sales" | "units" | "ticket" | "stores" | "wallet";
  }[];

  // Dynamic Findings and Recommendations
  executiveInsights: {
    bullets: { text: string; dotColor: string }[];
    recommendation: string;
  };
};

export type DashboardInitialData = {
  minDate: string; // "2023-01-02"
  maxDate: string; // "2026-09-27"
  defaultStartDate: string;
  defaultEndDate: string;
  defaultWeekKey: string;
  availableZones: string[];
  analytics: AnalyticsSummary;
};

