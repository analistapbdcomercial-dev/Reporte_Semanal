"use client";

import { useEffect, useState } from "react";

import type { DashboardData, ReportPeriod, SaleRecord } from "@/app/types/report";

type Level = "general" | "zona" | "sucursal" | "producto";
type ScopedRecord = SaleRecord & { zone: string };
type Bucket = {
  key: string;
  label: string;
  year: number;
  order: number;
  week?: number;
  month?: number;
  records: ScopedRecord[];
};
type MetricRow = {
  id: number;
  name: string;
  formula: string;
  value: string;
  comparison: string;
  visualization: string;
  status: "Disponible" | "Sin comparable" | "Estimado" | "Requiere fuente";
};

const periodLabels: Record<ReportPeriod, string> = {
  semanal: "Semanal",
  mensual: "Mensual",
  anual: "Anual",
};

const levelLabels: Record<Level, string> = {
  general: "General",
  zona: "Zona",
  sucursal: "Sucursal",
  producto: "Producto",
};

const months = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function getBucket(record: ScopedRecord, period: ReportPeriod) {
  const year = record.year || Number(record.month.match(/\d{4}/)?.[0]) || 0;

  if (period === "semanal") {
    const week = Number.parseInt(record.week, 10) || 0;
    return {
      key: `${year}-W${week}`,
      label: `S${String(week).padStart(2, "0")} ${year}`,
      year,
      order: week,
      week,
    };
  }

  if (period === "mensual") {
    const monthName = record.month.split("-")[0].trim();
    const month = months.indexOf(monthName.toLocaleLowerCase("es-MX")) + 1;
    return { key: record.month || `${year}-sin-mes`, label: record.month || String(year), year, order: month, month };
  }

  return { key: String(year), label: String(year), year, order: 0 };
}

function totalSales(records: ScopedRecord[]) {
  return records.reduce((sum, record) => sum + record.total, 0);
}

function totalUnits(records: ScopedRecord[]) {
  return records.reduce((sum, record) => sum + record.quantity, 0);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current / previous) - 1) * 100;
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Sin base comparable";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function groupTotals(records: ScopedRecord[], keyFor: (record: ScopedRecord) => string) {
  const totals = new Map<string, number>();
  records.forEach((record) => {
    const key = keyFor(record);
    if (key) totals.set(key, (totals.get(key) ?? 0) + record.total);
  });
  return totals;
}

function dimensionKey(record: ScopedRecord, level: Level) {
  if (level === "general") return record.zone;
  if (level === "zona") return record.branch === "Todas las Sucursales" ? "Sin desglose de sucursal" : record.branch;
  if (level === "sucursal") return record.product;
  return record.branch === "Todas las Sucursales" ? record.zone : record.branch;
}

export function ReportDashboard({ data }: { data: DashboardData }) {
  const [level, setLevel] = useState<Level>("zona");
  const [selectedZone, setSelectedZone] = useState(data.zones[0]?.zone ?? "");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("semanal");
  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const allRecords: ScopedRecord[] = data.zones.flatMap((zone) =>
    zone.records.map((record) => ({ ...record, zone: zone.zone })),
  );
  const zoneRecords = allRecords.filter((record) => record.zone === selectedZone);
  const zoneBranches = [...new Set(zoneRecords.map((record) => record.branch).filter((branch) => branch && branch !== "Todas las Sucursales"))].sort();
  const catalogRecords = level === "general" ? allRecords : zoneRecords;
  const productsInScope = [...new Set(catalogRecords.map((record) => record.product).filter(Boolean))].sort();

  let scopedRecords = level === "general" ? allRecords : zoneRecords;
  if (level === "sucursal" && selectedBranch) scopedRecords = scopedRecords.filter((record) => record.branch === selectedBranch);
  if (level === "producto" && selectedProduct) scopedRecords = scopedRecords.filter((record) => record.product === selectedProduct);

  const grouped = new Map<string, Bucket>();
  scopedRecords.forEach((record) => {
    const key = getBucket(record, reportPeriod);
    const bucket = grouped.get(key.key) ?? { ...key, records: [] };
    bucket.records.push(record);
    grouped.set(key.key, bucket);
  });

  const buckets = [...grouped.values()].sort((left, right) => left.year - right.year || left.order - right.order);
  const activeKey = buckets.some((bucket) => bucket.key === selectedBucket)
    ? selectedBucket
    : buckets[buckets.length - 1]?.key ?? "";
  const activeIndex = buckets.findIndex((bucket) => bucket.key === activeKey);
  const current = buckets[activeIndex];
  const previous = current && reportPeriod === "semanal"
    ? current.week === 1
      ? buckets
        .filter((bucket) => bucket.year === current.year - 1 && bucket.week !== undefined)
        .sort((left, right) => (right.week ?? 0) - (left.week ?? 0))[0]
      : buckets.find((bucket) => bucket.year === current.year && bucket.week === (current.week ?? 0) - 1)
    : activeIndex > 0 ? buckets[activeIndex - 1] : undefined;
  const previousYear = current
    ? buckets.find((bucket) => bucket.year === current.year - 1 && (
      reportPeriod === "anual"
        ? true
        : reportPeriod === "mensual"
          ? bucket.month === current.month
          : bucket.week === current.week
    ))
    : undefined;
  const currentRecords = current?.records ?? [];
  const parentRecords = level === "general" || level === "zona" ? allRecords : zoneRecords;
  const parentCurrentRecords = current
    ? parentRecords.filter((record) => getBucket(record, reportPeriod).key === current.key)
    : [];
  const parentCurrentSales = totalSales(parentCurrentRecords);
  const currentSales = totalSales(currentRecords);
  const previousSales = previous ? totalSales(previous.records) : undefined;
  const previousYearSales = previousYear ? totalSales(previousYear.records) : undefined;
  const currentUnits = totalUnits(currentRecords);
  const previousUnits = previous ? totalUnits(previous.records) : undefined;
  const previousYearUnits = previousYear ? totalUnits(previousYear.records) : undefined;
  const averagePrice = currentUnits ? currentSales / currentUnits : 0;
  const previousAveragePrice = previous && totalUnits(previous.records)
    ? totalSales(previous.records) / totalUnits(previous.records)
    : undefined;
  const previousYearAveragePrice = previousYear && totalUnits(previousYear.records)
    ? totalSales(previousYear.records) / totalUnits(previousYear.records)
    : undefined;
  const trend = buckets.slice(Math.max(0, activeIndex - 5), activeIndex + 1);
  const trendMax = Math.max(...trend.map((bucket) => totalSales(bucket.records)), 1);
  const activePreviousRecords = previous?.records ?? [];
  const currentElementTotals = groupTotals(currentRecords, (record) => dimensionKey(record, level));
  const previousElementTotals = groupTotals(activePreviousRecords, (record) => dimensionKey(record, level));
  const elementNames = new Set([...currentElementTotals.keys(), ...previousElementTotals.keys()]);
  const elementChanges = [...elementNames].map((name) => {
    const total = currentElementTotals.get(name) ?? 0;
    const priorTotal = previousElementTotals.get(name) ?? 0;
    return { name, total, previous: priorTotal, change: total - priorTotal };
  });
  const growthLeaders = [...elementChanges].filter((item) => item.change > 0).sort((a, b) => b.change - a.change).slice(0, 5);
  const declines = [...elementChanges].filter((item) => item.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);
  const mixRecords = level === "producto" ? parentCurrentRecords : currentRecords;
  const mixDenominator = totalSales(mixRecords);
  const mix = [...groupTotals(mixRecords, (record) => record.product).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const catalog = new Set(catalogRecords.map((record) => record.product).filter(Boolean));
  const coverageRecords = level === "producto" ? parentCurrentRecords : currentRecords;
  const soldProducts = new Set(coverageRecords.map((record) => record.product).filter(Boolean));
  const previouslySold = new Set(activePreviousRecords.map((record) => record.product).filter(Boolean));
  const unsoldCount = [...catalog].filter((product) => !soldProducts.has(product)).length;
  const newProductCount = previous
    ? [...soldProducts].filter((product) => !previouslySold.has(product)).length
    : null;
  const coverage = catalog.size ? (soldProducts.size / catalog.size) * 100 : 0;
  const topFiveSales = mix.reduce((sum, item) => sum + item[1], 0);
  const participationEntities = level === "general"
    ? groupTotals(parentCurrentRecords, (record) => record.zone)
    : new Map([[level === "zona" ? selectedZone : level === "sucursal" ? selectedBranch : selectedProduct, currentSales]]);
  const participationLeader = [...participationEntities.entries()].sort((left, right) => right[1] - left[1])[0];
  const participationDenominator = level === "general" || level === "zona" ? parentCurrentSales : parentCurrentSales;
  const participationShare = participationDenominator ? (participationLeader?.[1] ?? 0) / participationDenominator * 100 : 0;
  const selectedProductSales = selectedProduct ? groupTotals(parentCurrentRecords, (record) => record.product).get(selectedProduct) ?? 0 : 0;
  const selectedProductShare = mixDenominator ? selectedProductSales / mixDenominator * 100 : 0;
  const totalChange = previousSales === undefined ? undefined : currentSales - previousSales;
  const contributionRows = [...elementChanges].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const leadingContribution = contributionRows[0];
  const leadingContributionPct = totalChange && leadingContribution
    ? (leadingContribution.change / totalChange) * 100
    : null;
  const cumulativeContributionPct = totalChange
    ? contributionRows.slice(0, 5).reduce((sum, item) => sum + item.change, 0) / totalChange * 100
    : null;
  const catalogLabel = level === "general" ? "productos históricos de ambas zonas" : "productos históricos de la zona";
  const unavailable = "Requiere fuente" as const;
  const metrics: MetricRow[] = [
    { id: 1, name: reportPeriod === "semanal" ? "Venta semanal" : reportPeriod === "mensual" ? "Venta mensual" : "Venta anual", formula: "Σ Venta", value: current ? money.format(currentSales) : "Sin datos", comparison: current?.label ?? "—", visualization: "KPI + tabla", status: "Disponible" },
    { id: 2, name: "Venta vs periodo anterior $", formula: "Venta actual − venta anterior", value: previousSales === undefined ? "Sin datos comparables" : money.format(currentSales - previousSales), comparison: previous?.label ?? "Periodo anterior", visualization: "Barras divergentes + tabla", status: previous ? "Disponible" : "Sin comparable" },
    { id: 3, name: "Venta vs periodo anterior %", formula: "(Actual / anterior − 1) × 100", value: formatPercent(previousSales === undefined ? null : percentChange(currentSales, previousSales)), comparison: previous?.label ?? "Periodo anterior", visualization: "Barras % + tabla", status: previous ? "Disponible" : "Sin comparable" },
    { id: 4, name: "Venta vs mismo periodo AA $", formula: "Venta actual − venta mismo periodo AA", value: previousYearSales === undefined ? "Sin datos comparables" : money.format(currentSales - previousYearSales), comparison: previousYear?.label ?? "Año anterior", visualization: "Barras divergentes + tabla", status: previousYear ? "Disponible" : "Sin comparable" },
    { id: 5, name: "Venta vs mismo periodo AA %", formula: "(Actual / mismo periodo AA − 1) × 100", value: formatPercent(previousYearSales === undefined ? null : percentChange(currentSales, previousYearSales)), comparison: previousYear?.label ?? "Año anterior", visualization: "Barras % + tabla", status: previousYear ? "Disponible" : "Sin comparable" },
    { id: 6, name: "Unidades", formula: "Σ Cantidad", value: currentUnits.toLocaleString("es-MX"), comparison: current?.label ?? "—", visualization: "KPI + tabla", status: "Disponible" },
    { id: 7, name: "Unidades vs periodo anterior %", formula: "(Unidades actuales / anteriores − 1) × 100", value: formatPercent(previousUnits === undefined ? null : percentChange(currentUnits, previousUnits)), comparison: previous?.label ?? "Periodo anterior", visualization: "Barras + tabla", status: previous ? "Disponible" : "Sin comparable" },
    { id: 8, name: "Unidades vs mismo periodo AA %", formula: "(Unidades actuales / AA − 1) × 100", value: formatPercent(previousYearUnits === undefined ? null : percentChange(currentUnits, previousYearUnits)), comparison: previousYear?.label ?? "Año anterior", visualization: "Barras + tabla", status: previousYear ? "Disponible" : "Sin comparable" },
    { id: 9, name: "Venta por unidad", formula: "Venta / Unidades", value: money.format(averagePrice), comparison: current?.label ?? "—", visualization: "KPI + línea/barras", status: "Disponible" },
    { id: 10, name: "Variación venta por unidad", formula: "(VPU actual / VPU anterior − 1) × 100", value: formatPercent(previousAveragePrice === undefined ? null : percentChange(averagePrice, previousAveragePrice)), comparison: previous?.label ?? "Periodo anterior", visualization: "Barras + tabla", status: previousAveragePrice === undefined ? "Sin comparable" : "Disponible" },
    { id: 11, name: "Precio promedio", formula: "Σ Venta / Σ Cantidad", value: money.format(averagePrice), comparison: current?.label ?? "—", visualization: "KPI + tabla", status: "Disponible" },
    { id: 12, name: "Variación precio promedio", formula: "(Precio actual / precio comparable − 1) × 100", value: formatPercent(previousYearAveragePrice === undefined ? null : percentChange(averagePrice, previousYearAveragePrice)), comparison: previousYear?.label ?? "Año anterior", visualization: "Barras", status: previousYearAveragePrice === undefined ? "Sin comparable" : "Disponible" },
    { id: 13, name: "Participación del elemento líder", formula: "Venta elemento / Venta total del nivel padre × 100", value: `${participationShare.toFixed(1)}%`, comparison: participationLeader?.[0] ?? "Sin desglose", visualization: "Pareto/dona + tabla", status: currentRecords.length ? "Disponible" : "Sin comparable" },
    { id: 14, name: "Mix de venta por producto", formula: "Venta producto / Venta total × 100", value: level === "producto" ? `${selectedProduct || "Producto"} · ${selectedProductShare.toFixed(1)}%` : mix[0] && mixDenominator ? `${mix[0][0]} · ${(mix[0][1] / mixDenominator * 100).toFixed(1)}%` : "Sin datos", comparison: "Top 5 en desglose", visualization: "Barras apiladas/dona", status: currentRecords.length ? "Disponible" : "Sin comparable" },
    { id: 15, name: "Top crecimiento", formula: "Venta actual − venta anterior, desc.", value: growthLeaders[0]?.name ?? "Sin crecimiento", comparison: growthLeaders[0] ? money.format(growthLeaders[0].change) : "—", visualization: "Barras horizontales", status: previous ? "Disponible" : "Sin comparable" },
    { id: 16, name: "Top caída", formula: "Venta actual − venta anterior, asc.", value: declines[0]?.name ?? "Sin caídas", comparison: declines[0] ? money.format(declines[0].change) : "—", visualization: "Barras horizontales", status: previous ? "Disponible" : "Sin comparable" },
    { id: 17, name: "Contribución al cambio %", formula: "Variación elemento / variación total × 100", value: leadingContributionPct === null ? "Sin base comparable" : `${leadingContributionPct.toFixed(1)}%`, comparison: leadingContribution?.name ?? "—", visualization: "Barras divergentes", status: previous ? "Disponible" : "Sin comparable" },
    { id: 18, name: "Contribución acumulada %", formula: "Σ contribuciones ordenadas", value: cumulativeContributionPct === null ? "Sin base comparable" : `${cumulativeContributionPct.toFixed(1)}%`, comparison: "Top 5 elementos", visualization: "Pareto", status: previous ? "Disponible" : "Sin comparable" },
    { id: 19, name: "Productos sin venta", formula: "Productos catálogo con venta actual = 0", value: `${unsoldCount} productos`, comparison: catalogLabel, visualization: "Tabla + KPI", status: catalog.size ? "Estimado" : "Requiere fuente" },
    { id: 20, name: "Productos nuevos", formula: "Venta actual > 0 y comparable = 0", value: newProductCount === null ? "Sin datos comparables" : `${newProductCount} productos`, comparison: previous?.label ?? "Periodo anterior", visualization: "Tabla + KPI", status: previous ? "Disponible" : "Sin comparable" },
    { id: 21, name: "Cobertura de productos", formula: "Productos con venta / productos catálogo × 100", value: `${coverage.toFixed(1)}%`, comparison: `Catálogo histórico: ${catalog.size}`, visualization: "KPI + barra", status: catalog.size ? "Estimado" : "Requiere fuente" },
    { id: 22, name: "Concentración de venta", formula: "Venta acumulada Top 5 / Venta total × 100", value: `${mixDenominator ? (topFiveSales / mixDenominator * 100).toFixed(1) : "0.0"}%`, comparison: "Top 5 productos", visualization: "Pareto", status: currentRecords.length ? "Disponible" : "Sin comparable" },
    { id: 23, name: "Margen $", formula: "Venta − Costo", value: "Requiere fuente de costo", comparison: "Costo no incluido en CSV", visualization: "KPI + tabla", status: unavailable },
    { id: 24, name: "Margen %", formula: "(Venta − Costo) / Venta × 100", value: "Requiere fuente de costo", comparison: "Costo no incluido en CSV", visualization: "KPI + barras", status: unavailable },
    { id: 25, name: "Utilidad", formula: "Venta − Costo − Gastos", value: "Requiere costos y gastos", comparison: "No incluidos en CSV", visualization: "KPI + tabla", status: unavailable },
    { id: 26, name: "Ticket promedio", formula: "Venta / número de tickets", value: "Requiere conteo de tickets", comparison: "No incluido en CSV", visualization: "KPI + barras", status: unavailable },
    { id: 27, name: "Variación ticket promedio", formula: "(Ticket actual / comparable − 1) × 100", value: "Requiere conteo de tickets", comparison: "No incluido en CSV", visualization: "Barras", status: unavailable },
    { id: 28, name: "Inventario final", formula: "Existencia final", value: "Requiere fuente de inventario", comparison: "No incluido en CSV", visualization: "Tabla + barras", status: unavailable },
    { id: 29, name: "Días de inventario", formula: "Inventario / venta diaria promedio", value: "Requiere inventario", comparison: "No incluido en CSV", visualization: "KPI + semáforo", status: unavailable },
  ];

  const metricGroups = [
    { title: "Ventas", rows: metrics.slice(0, 5) },
    { title: "Unidades y precio", rows: metrics.slice(5, 12) },
    { title: "Participación, mix y ranking", rows: metrics.slice(12, 22) },
    { title: "Rentabilidad, tickets e inventario", rows: metrics.slice(22) },
  ];
  const selectedMetric = metrics.find((metric) => metric.id === selectedMetricId);
  const modalHistory = selectedMetric && selectedMetric.status !== "Requiere fuente"
    ? buckets.slice(Math.max(0, activeIndex - 5), activeIndex + 1).map((bucket) => ({
      label: bucket.label,
      value: totalSales(bucket.records),
    }))
    : [];
  const modalHistoryMax = Math.max(...modalHistory.map((point) => point.value), 1);
  const breakdownKey = (record: ScopedRecord) => {
    if (level === "general") return record.zone;
    if (level === "zona") return record.branch === "Todas las Sucursales" ? "Sin sucursal" : record.branch;
    if (level === "sucursal") return record.product;
    return record.branch === "Todas las Sucursales" ? record.zone : record.branch;
  };
  const modalBreakdown = [...groupTotals(currentRecords, breakdownKey).entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const changeScale = Math.max(...[...growthLeaders, ...declines].map((item) => Math.abs(item.change)), 1);
  const trendTitle = reportPeriod === "semanal" ? "semana" : reportPeriod === "mensual" ? "mes" : "año";

  useEffect(() => {
    if (selectedMetricId === null) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedMetricId(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedMetricId]);

  return (
    <div className="report-shell">
      <header className="report-topbar">
        <div className="brand-block">
          <div className="brand-icon" aria-hidden="true">P</div>
          <div className="brand-copy"><strong>POLLO PECHUGÓN</strong><small>ANÁLISIS COMERCIAL</small></div>
        </div>
        <span className="topbar-caption">Panel de ventas</span>
      </header>

      <div className="report-body">
        <aside className="left-panel">
          <div className="panel-group">
            <h3>Reporte</h3>
            <div className="period-list" role="group" aria-label="Tipo de reporte">
              {data.periods.map((period) => (
                <button key={period} type="button" className={`period-btn ${period === reportPeriod ? "active" : ""}`} aria-pressed={period === reportPeriod} onClick={() => { setReportPeriod(period); setSelectedBucket(""); }}>
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>
          <div className="side-note">
            <span className="side-note__label">Indicadores</span>
            <strong>29</strong>
            <span>en el catálogo del panel</span>
          </div>
          <div className="source-note">
            Los CSV contienen venta, cantidad, producto y sucursal. La cobertura usa productos históricos como catálogo provisional; costos, gastos, tickets e inventario requieren fuentes adicionales.
          </div>
        </aside>

        <main className="main-panel">
          <div className="main-header">
            <div className="main-header__title">
              <span className="eyebrow">Análisis comercial</span>
              <h1>{current ? `${periodLabels[reportPeriod]} ${current.label}` : "Sin datos"}</h1>
            </div>
            <div className="main-header__filters">
              <label className="field-filter">
                <span>Nivel</span>
                <select value={level} onChange={(event) => { setLevel(event.target.value as Level); setSelectedBucket(""); }}>
                  {(Object.keys(levelLabels) as Level[]).map((item) => <option key={item} value={item}>{levelLabels[item]}</option>)}
                </select>
              </label>
              <label className="field-filter">
                <span>Zona</span>
                <select value={selectedZone} onChange={(event) => { setSelectedZone(event.target.value); setSelectedBranch(""); setSelectedProduct(""); setSelectedBucket(""); }}>
                  {data.zones.map((item) => <option key={item.zone} value={item.zone}>{item.zone}</option>)}
                </select>
              </label>
              <label className="field-filter">
                <span>Sucursal</span>
                <select value={selectedBranch} disabled={level !== "sucursal"} onChange={(event) => { setSelectedBranch(event.target.value); setSelectedBucket(""); }}>
                  <option value="">Todas</option>
                  {zoneBranches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                </select>
              </label>
              <label className="field-filter">
                <span>Producto</span>
                <select value={selectedProduct} disabled={level !== "producto"} onChange={(event) => { setSelectedProduct(event.target.value); setSelectedBucket(""); }}>
                  <option value="">Todos</option>
                  {productsInScope.map((product) => <option key={product} value={product}>{product}</option>)}
                </select>
              </label>
              <label className="field-filter">
                <span>Periodo</span>
                <select value={activeKey} onChange={(event) => setSelectedBucket(event.target.value)}>
                  {buckets.map((bucket) => <option key={bucket.key} value={bucket.key}>{bucket.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {!current ? (
            <div className="empty-state">No hay ventas para los filtros seleccionados.</div>
          ) : (
            <>
              <div className="comparison-strip">
                <article className="comparison-card">
                  <span className="card-label">Venta del periodo</span>
                  <strong className="kpi-value">{money.format(currentSales)}</strong>
                  <span className="card-meta">{current.label}</span>
                </article>
                <article className="comparison-card">
                  <span className="card-label">Unidades</span>
                  <strong className="kpi-value">{currentUnits.toLocaleString("es-MX")}</strong>
                  <span className="card-meta">{currentRecords.length.toLocaleString("es-MX")} registros</span>
                </article>
                <article className="comparison-card">
                  <span className="card-label">Venta por unidad</span>
                  <strong className="kpi-value">{money.format(averagePrice)}</strong>
                  <span className="card-meta">Venta neta / unidades</span>
                </article>
              </div>

              <section className="analytics-grid">
                <article className="panel-card">
                  <div className="card-title-row"><div><span className="muted-label">Tendencia</span><h3>Venta por {trendTitle}</h3></div><span className="chart-unit">MXN</span></div>
                  <div className="bars-chart">
                    {trend.map((bucket) => {
                      const value = totalSales(bucket.records);
                      return <div key={bucket.key} className="bar-group" title={`${bucket.label}: ${money.format(value)}`}><div className="bar-wrap"><span className="bar" style={{ height: `${Math.max(2, value / trendMax * 100)}%` }} /></div><span>{bucket.label}</span></div>;
                    })}
                  </div>
                </article>
                <article className="panel-card">
                  <div className="card-title-row"><div><span className="muted-label">Mix de venta</span><h3>Productos principales</h3></div></div>
                  {mix.length ? <ul className="product-list">{mix.map(([name, total]) => <li key={name}><div className="product-name"><span>{name}</span><small>{currentSales ? (total / currentSales * 100).toFixed(1) : "0.0"}%</small></div><div className="product-bar"><span style={{ width: `${currentSales ? total / currentSales * 100 : 0}%` }} /></div></li>)}</ul> : <p className="muted-copy">Sin desglose de productos.</p>}
                </article>
              </section>

              <section className="ranking-grid">
                <article className="panel-card">
                  <div className="card-title-row"><div><span className="muted-label">Vs. periodo anterior</span><h3>Top crecimiento</h3></div></div>
                  {growthLeaders.length ? <ul className="ranking-list">{growthLeaders.map((item) => <li key={item.name}><div className="product-name"><span>{item.name}</span><strong>{money.format(item.change)}</strong></div><div className="ranking-track"><span className="growth-fill" style={{ width: `${item.change / changeScale * 100}%` }} /></div></li>)}</ul> : <p className="muted-copy">Sin crecimiento comparable para este periodo.</p>}
                </article>
                <article className="panel-card">
                  <div className="card-title-row"><div><span className="muted-label">Vs. periodo anterior</span><h3>Top caída</h3></div></div>
                  {declines.length ? <ul className="ranking-list">{declines.map((item) => <li key={item.name}><div className="product-name"><span>{item.name}</span><strong>{money.format(item.change)}</strong></div><div className="ranking-track"><span className="decline-fill" style={{ width: `${Math.abs(item.change) / changeScale * 100}%` }} /></div></li>)}</ul> : <p className="muted-copy">Sin caídas comparables para este periodo.</p>}
                </article>
              </section>

              <section className="indicator-section">
                <div className="indicator-heading"><div><span className="muted-label">Catálogo de indicadores</span><h2>Los 29 indicadores</h2></div><span>{levelLabels[level]} · {current.label}</span></div>
                {metricGroups.map((group) => (
                  <div className="metric-group" key={group.title}>
                    <h3>{group.title}</h3>
                    <div className="table-scroll">
                      <table className="indicator-table">
                        <thead><tr><th>#</th><th>Indicador / fórmula</th><th>Resultado</th><th>Comparación</th><th>Visualización</th><th>Estado</th></tr></thead>
                        <tbody>{group.rows.map((metric) => <tr key={metric.id}><td>{String(metric.id).padStart(2, "0")}</td><td><strong>{metric.name}</strong><small>{metric.formula}</small></td><td className="metric-value">{metric.value}</td><td>{metric.comparison}</td><td>{metric.visualization}</td><td><button type="button" className={`metric-status ${metric.status === "Disponible" ? "is-available" : metric.status === "Sin comparable" ? "is-comparison-missing" : metric.status === "Estimado" ? "is-estimated" : "is-source-missing"}`} onClick={() => setSelectedMetricId(metric.id)} aria-label={`Ver análisis de ${metric.name}`}>{metric.status}<span aria-hidden="true"> ↗</span></button></td></tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </div>
      {selectedMetric && (
        <div className="metric-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMetricId(null); }}>
          <section className="metric-modal" role="dialog" aria-modal="true" aria-labelledby="metric-modal-title">
            <header className="metric-modal-header">
              <div>
                <span className="muted-label">Indicador {String(selectedMetric.id).padStart(2, "0")} · {levelLabels[level]}</span>
                <h2 id="metric-modal-title">{selectedMetric.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedMetricId(null)} aria-label="Cerrar análisis">×</button>
            </header>

            <div className="metric-detail-grid">
              <div><span>Resultado</span><strong>{selectedMetric.value}</strong></div>
              <div><span>Comparación</span><strong>{selectedMetric.comparison}</strong></div>
              <div><span>Estado</span><strong>{selectedMetric.status}</strong></div>
            </div>
            <div className="metric-formula"><span>Fórmula</span><strong>{selectedMetric.formula}</strong></div>

            {selectedMetric.status === "Requiere fuente" ? (
              <div className="metric-source-needed">
                <strong>No hay base para calcular este indicador.</strong>
                <p>{selectedMetric.comparison}. Agrega ese campo al archivo fuente para habilitar el cálculo y su visualización.</p>
              </div>
            ) : (
              <div className="metric-modal-content">
                <article className="metric-modal-chart">
                  <div className="card-title-row"><div><span className="muted-label">Histograma</span><h3>Ventas por periodo reciente</h3></div><span className="chart-unit">MXN</span></div>
                  {modalHistory.length ? (
                    <div className="modal-bars" role="img" aria-label="Histograma de ventas de los últimos periodos">
                      {modalHistory.map((point) => (
                        <div className="modal-bar-column" key={point.label} title={`${point.label}: ${money.format(point.value)}`}>
                          <strong>{money.format(point.value)}</strong>
                          <div className="modal-bar-track"><span style={{ height: `${Math.max(2, point.value / modalHistoryMax * 100)}%` }} /></div>
                          <small>{point.label}</small>
                        </div>
                      ))}
                    </div>
                  ) : <p className="muted-copy">No hay periodos comparables para graficar.</p>}
                </article>
                <article className="metric-modal-breakdown">
                  <div className="card-title-row"><div><span className="muted-label">Detalle</span><h3>{level === "general" ? "Ventas por zona" : level === "zona" ? "Ventas por sucursal" : level === "sucursal" ? "Ventas por producto" : "Ventas por sucursal"}</h3></div></div>
                  {modalBreakdown.length ? (
                    <ul>{modalBreakdown.map(([name, amount]) => <li key={name}><span>{name}</span><strong>{money.format(amount)}</strong></li>)}</ul>
                  ) : <p className="muted-copy">No hay desglose disponible.</p>}
                </article>
              </div>
            )}
            <footer className="metric-modal-footer"><span>Periodo analizado: {current?.label ?? "—"}</span><button type="button" onClick={() => setSelectedMetricId(null)}>Cerrar</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}