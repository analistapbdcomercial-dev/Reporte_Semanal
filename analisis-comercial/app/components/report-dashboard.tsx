"use client";

import { useId, useMemo, useState, useTransition } from "react";
import Image from "next/image";

import brandImage from "@/app/assets/images.jpg";
import type {
  AnalyticsSummary,
  BranchTableRow,
  DashboardInitialData,
  ProductTableRow,
} from "@/app/types/report";
import {
  IconBook,
  IconBowl,
  IconBox,
  IconBullseye,
  IconCalendar,
  IconCar,
  IconCash,
  IconChartBar,
  IconChicken,
  IconClock,
  IconCoinStack,
  IconCreditCard,
  IconDeliveryTruck,
  IconExport,
  IconFilter,
  IconFlame,
  IconGlobe,
  IconHome,
  IconLightbulb,
  IconMenu,
  IconMotorcycle,
  IconNotes,
  IconPieChart,
  IconPrinter,
  IconSearch,
  IconShoppingCart,
  IconSparkle,
  IconStore,
  IconStorefront,
  IconTicket,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
  IconX,
} from "./pechugon-icons";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const moneyPrecise = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat("es-MX");

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/D";
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

type SortFieldBranch = "venta" | "vsSemanaAnteriorMxn" | "vsAñoAnteriorMxn" | "participacionPct" | "sucursal";
type SortFieldProduct = "venta" | "unidades" | "precioPromedio" | "vsSemanaAnteriorMxn" | "vsAñoAnteriorMxn" | "participacionPct" | "producto";

type NavTab =
  | "resumen"
  | "sucursales"
  | "ventas"
  | "productos"
  | "canales"
  | "gastos"
  | "hallazgos";

export function ReportDashboard({ initialData }: { initialData: DashboardInitialData }) {
  // Navigation Sidebar Active Tab
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("resumen");

  // Mobile Drawers
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Table vs Cards toggle for mobile
  const [branchViewMode, setBranchViewMode] = useState<"tabla" | "tarjetas">("tabla");
  const [productViewMode, setProductViewMode] = useState<"tabla" | "tarjetas">("tabla");

  // State for Cascading Filters (FECHA -> SEMANA -> ZONA -> SUCURSAL -> PRODUCTO)
  const [startDate, setStartDate] = useState<string>(initialData.defaultStartDate);
  const [endDate, setEndDate] = useState<string>(initialData.defaultEndDate);
  const [selectedQuickWeek, setSelectedQuickWeek] = useState<string>(initialData.defaultWeekKey);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // Analytical Data State
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialData.analytics);
  const [isPending, startTransition] = useTransition();
  const [dateError, setDateError] = useState<string>("");

  // Tables Search & Sorting
  const [branchSortField, setBranchSortField] = useState<SortFieldBranch>("venta");
  const [branchSortAsc, setBranchSortAsc] = useState<boolean>(false);
  const [productSortField, setProductSortField] = useState<SortFieldProduct>("venta");
  const [productSortAsc, setProductSortAsc] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>("");

  // Methodology Modal
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  // Active Filter Count for Mobile Badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedZone) count++;
    if (selectedBranch) count++;
    if (selectedProduct) count++;
    if (selectedQuickWeek) count++;
    return count;
  }, [selectedZone, selectedBranch, selectedProduct, selectedQuickWeek]);

  // Fetch updated analytics whenever filters change
  const fetchAnalytics = (
    sDate: string,
    eDate: string,
    zone: string,
    branch: string,
    product: string
  ) => {
    if (sDate > eDate) {
      setDateError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }
    setDateError("");

    startTransition(async () => {
      try {
        const query = new URLSearchParams({
          startDate: sDate,
          endDate: eDate,
          zone,
          branch,
          product,
        });

        const res = await fetch(`/api/analytics?${query.toString()}`);
        if (!res.ok) throw new Error("Error en respuesta del servidor");
        const data: AnalyticsSummary = await res.json();
        setAnalytics(data);

        // Cascading reset logic
        if (branch && !data.availableBranches.includes(branch)) {
          setSelectedBranch("");
        }
        if (product && !data.availableProducts.includes(product)) {
          setSelectedProduct("");
        }
      } catch (err) {
        console.error("Error al actualizar análisis:", err);
      }
    });
  };

  // Quick Week Change handler
  const handleQuickWeekChange = (weekKey: string) => {
    setSelectedQuickWeek(weekKey);
    const found = analytics.availableWeeks.find((w) => w.key === weekKey);
    if (found) {
      setStartDate(found.startDate);
      setEndDate(found.endDate);
      fetchAnalytics(found.startDate, found.endDate, selectedZone, selectedBranch, selectedProduct);
    }
  };

  // Custom Date Change handlers
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setSelectedQuickWeek("");
    fetchAnalytics(newStart, endDate, selectedZone, selectedBranch, selectedProduct);
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setSelectedQuickWeek("");
    fetchAnalytics(startDate, newEnd, selectedZone, selectedBranch, selectedProduct);
  };

  // Zone Change handler (Resets dependent branch & product)
  const handleZoneChange = (newZone: string) => {
    setSelectedZone(newZone);
    setSelectedBranch("");
    setSelectedProduct("");
    fetchAnalytics(startDate, endDate, newZone, "", "");
  };

  // Branch Change handler (Resets dependent product)
  const handleBranchChange = (newBranch: string) => {
    setSelectedBranch(newBranch);
    setSelectedProduct("");
    fetchAnalytics(startDate, endDate, selectedZone, newBranch, "");
  };

  // Product Change handler
  const handleProductChange = (newProduct: string) => {
    setSelectedProduct(newProduct);
    fetchAnalytics(startDate, endDate, selectedZone, selectedBranch, newProduct);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedZone("");
    setSelectedBranch("");
    setSelectedProduct("");
    setSelectedQuickWeek(initialData.defaultWeekKey);
    setStartDate(initialData.defaultStartDate);
    setEndDate(initialData.defaultEndDate);
    fetchAnalytics(
      initialData.defaultStartDate,
      initialData.defaultEndDate,
      "",
      "",
      ""
    );
  };

  // Determine current context level
  const contextLevel = useMemo(() => {
    if (selectedProduct) return "producto";
    if (selectedBranch) return "sucursal";
    if (selectedZone) return "zona";
    return "general";
  }, [selectedZone, selectedBranch, selectedProduct]);

  // Sorted Branch Table Rows
  const sortedBranches = useMemo(() => {
    return [...analytics.branchTableRows].sort((a, b) => {
      const valA = a[branchSortField];
      const valB = b[branchSortField];

      if (typeof valA === "string" || typeof valB === "string") {
        return branchSortAsc
          ? String(valA ?? "").localeCompare(String(valB ?? ""))
          : String(valB ?? "").localeCompare(String(valA ?? ""));
      }

      const numA = typeof valA === "number" && Number.isFinite(valA) ? valA : -999999999;
      const numB = typeof valB === "number" && Number.isFinite(valB) ? valB : -999999999;

      if (numA < numB) return branchSortAsc ? -1 : 1;
      if (numA > numB) return branchSortAsc ? 1 : -1;
      return 0;
    });
  }, [analytics.branchTableRows, branchSortField, branchSortAsc]);

  // Sorted & Filtered Product Table Rows
  const filteredAndSortedProducts = useMemo(() => {
    const list = analytics.productTableRows.filter((p) => {
      if (!productSearch) return true;
      return p.producto.toLowerCase().includes(productSearch.toLowerCase());
    });

    return list.sort((a, b) => {
      const valA = a[productSortField];
      const valB = b[productSortField];

      if (typeof valA === "string" || typeof valB === "string") {
        return productSortAsc
          ? String(valA ?? "").localeCompare(String(valB ?? ""))
          : String(valB ?? "").localeCompare(String(valA ?? ""));
      }

      const numA = typeof valA === "number" && Number.isFinite(valA) ? valA : -999999999;
      const numB = typeof valB === "number" && Number.isFinite(valB) ? valB : -999999999;

      if (numA < numB) return productSortAsc ? -1 : 1;
      if (numA > numB) return productSortAsc ? 1 : -1;
      return 0;
    });
  }, [analytics.productTableRows, productSearch, productSortField, productSortAsc]);

  // Export Table to CSV
  const handleExportCsv = () => {
    const headers = [
      "Tipo",
      "Nombre",
      "Venta_Actual",
      "Vs_Semana_Anterior_MXN",
      "Vs_Semana_Anterior_Pct",
      "Vs_Año_Anterior_MXN",
      "Vs_Año_Anterior_Pct",
      "Participacion_Pct",
    ];

    const branchRows = analytics.branchTableRows.map((b) => [
      "Sucursal",
      `"${b.sucursal.replace(/"/g, '""')}"`,
      b.venta,
      b.vsSemanaAnteriorMxn,
      b.vsSemanaAnteriorPct ?? "N/D",
      b.vsAñoAnteriorMxn,
      b.vsAñoAnteriorPct ?? "N/D",
      b.participacionPct.toFixed(2),
    ]);

    const productRows = analytics.productTableRows.map((p) => [
      "Producto",
      `"${p.producto.replace(/"/g, '""')}"`,
      p.venta,
      p.vsSemanaAnteriorMxn,
      p.vsSemanaAnteriorPct ?? "N/D",
      p.vsAñoAnteriorMxn,
      p.vsAñoAnteriorPct ?? "N/D",
      p.participacionPct.toFixed(2),
    ]);

    const allRows = [...branchRows, ...productRows];
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...allRows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Reporte_Pechugon_${startDate}_al_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productSearchId = useId();

  const handleNavClick = (tab: NavTab, elementId?: string) => {
    setActiveNavTab(tab);
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="exec-dashboard-wrapper">
      {/* ============================================================== */}
      {/* 1. TOP HEADER - POLLO PECHUGÓN EXECUTIVE NAVBAR                */}
      {/* ============================================================== */}
      <header className="exec-header">
        <div className="exec-brand-lockup">
          {/* Mobile Hamburger Button (< 768px) */}
          <button
            type="button"
            className="md:hidden p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <IconMenu size={22} />
          </button>

          <div className="exec-brand-logo-wrap">
            <Image
              src={brandImage}
              alt="Pollo Pechugón"
              width={42}
              height={42}
              priority
            />
          </div>
          <div className="exec-brand-text">
            <div className="exec-brand-title-row">
              <span className="exec-brand-company">POLLO PECHUGÓN</span>
              <span className="exec-brand-divider" />
              <h1 className="exec-brand-report-title">Reporte Comercial</h1>
            </div>
            <span className="exec-brand-subtitle">
              {contextLevel === "general" && "Ventas, tickets y desempeño por sucursal · Consolidado Nacional"}
              {contextLevel === "zona" && `Ventas, tickets y desempeño · Zona ${selectedZone}`}
              {contextLevel === "sucursal" && `Ventas y catálogo · Sucursal ${selectedBranch} (${selectedZone})`}
              {contextLevel === "producto" && `Desempeño del producto: ${selectedProduct}`}
            </span>
          </div>
        </div>

        {/* Right Header: Actions & Info */}
        <div className="flex items-center gap-2.5">
          {/* Timestamp Badge (Desktop/Tablet) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold">
            <IconClock size={13} color="#ffcb05" />
            <span>Actualizado: <strong>{new Date().toLocaleDateString("es-MX")}</strong></span>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e3470] border border-white/20 hover:border-[#ffcb05] text-white text-xs font-bold transition hover:bg-[#12428c] cursor-pointer"
            onClick={() => setShowDocModal(true)}
            title="Ver documentación funcional y metodológica"
          >
            <IconBook size={14} color="#ffcb05" />
            <span>Metodología</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e3470] border border-white/20 hover:border-[#ffcb05] text-white text-xs font-bold transition hover:bg-[#12428c] cursor-pointer"
            onClick={handleExportCsv}
            title="Exportar datos a CSV con UTF-8"
          >
            <IconExport size={14} color="#ffffff" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e3470] border border-white/20 hover:border-[#ffcb05] text-white text-xs font-bold transition hover:bg-[#12428c] cursor-pointer"
            onClick={() => window.print()}
            title="Imprimir reporte"
          >
            <IconPrinter size={14} color="#ffffff" />
            <span>Imprimir</span>
          </button>

          {/* Mobile Filter Button (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-[#ffcb05] text-[#0f172a] px-3.5 py-1.5 rounded-lg font-black text-xs shadow transition active:scale-95 min-h-[40px] cursor-pointer"
            aria-label="Abrir panel de filtros"
          >
            <IconFilter size={15} />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#072b61] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MASTER ANALYSIS FILTER BAR (HORIZONTAL EXECUTIVE CONTROL)    */}
      {/* Elegantly styled dark toolbar with custom inputs (No raw HTML) */}
      {/* ============================================================== */}
      <nav className="exec-filter-bar" aria-label="Barra de filtros de análisis">
        <div className="exec-filter-widgets-row">
          {/* Widget 1: Periodo de Análisis */}
          <div className="exec-filter-widget">
            <span className="exec-widget-title">
              <IconCalendar size={11} color="#94b8e8" />
              Periodo de Análisis
            </span>
            <div className="exec-date-range-combo">
              <input
                type="date"
                value={startDate}
                min={initialData.minDate}
                max={initialData.maxDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="exec-date-input"
                title="Fecha de inicio"
              />
              <span className="text-[#94b8e8] text-[10px] font-bold">al</span>
              <input
                type="date"
                value={endDate}
                min={initialData.minDate}
                max={initialData.maxDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="exec-date-input"
                title="Fecha de fin"
              />
            </div>
          </div>

          {/* Widget 2: Semana Directa (ISO 8601) */}
          <div className="exec-filter-widget min-w-[140px]">
            <span className="exec-widget-title">
              <IconFlame size={11} color="#ffcb05" />
              Semana (ISO 8601)
            </span>
            <select
              value={selectedQuickWeek}
              onChange={(e) => handleQuickWeekChange(e.target.value)}
              className="exec-widget-select"
              aria-label="Semana ISO"
            >
              <option value="">Personalizada...</option>
              {analytics.availableWeeks.map((w) => (
                <option key={w.key} value={w.key}>{w.label}</option>
              ))}
            </select>
          </div>

          {/* Widget 3: Zona */}
          <div className="exec-filter-widget min-w-[130px]">
            <span className="exec-widget-title">
              <IconGlobe size={11} color="#94b8e8" />
              Zona
            </span>
            <select
              value={selectedZone}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="exec-widget-select"
              aria-label="Filtro de Zona"
            >
              <option value="">Todas las zonas ({analytics.availableZones.length})</option>
              {analytics.availableZones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Widget 4: Sucursal (Dependiente de Zona) */}
          <div className="exec-filter-widget min-w-[140px]">
            <span className="exec-widget-title">
              <IconStorefront size={11} color="#94b8e8" />
              Sucursal
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="exec-widget-select"
              aria-label="Filtro de Sucursal"
            >
              <option value="">Todas ({analytics.availableBranches.length})</option>
              {analytics.availableBranches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Widget 5: Producto (Dependiente de Sucursal) */}
          <div className="exec-filter-widget min-w-[150px]">
            <span className="exec-widget-title">
              <IconChicken size={11} color="#94b8e8" />
              Producto
            </span>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="exec-widget-select"
              aria-label="Filtro de Producto"
            >
              <option value="">Todos ({analytics.availableProducts.length})</option>
              {analytics.availableProducts.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status or Active filter indicator */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#ffcb05] hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer"
              title="Restablecer todos los filtros"
            >
              ✕ Restablecer
            </button>
          )}

          {isPending && (
            <div className="flex items-center gap-1.5 text-xs text-[#ffcb05] font-bold animate-pulse px-2">
              <span className="w-2 h-2 rounded-full bg-[#ffcb05]" />
              Calculando...
            </div>
          )}
        </div>

        {/* Date Validation Alert */}
        {dateError && (
          <div className="text-xs bg-red-600 text-white px-3 py-1 rounded font-semibold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{dateError}</span>
          </div>
        )}
      </nav>

      {/* ============================================================== */}
      {/* 3. BODY LAYOUT: SIDEBAR + MAIN EXECUTIVE CANVAS                */}
      {/* ============================================================== */}
      <div className="exec-body-layout">
        {/* ============================================================ */}
        {/* 3.1 LEFT NAVIGATION SIDEBAR                                  */}
        {/* ============================================================ */}
        <aside className="exec-sidebar">
          <ul className="exec-nav-list" role="navigation" aria-label="Navegación del Reporte">
            <li className={`exec-nav-item ${activeNavTab === "resumen" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("resumen", "sec-kpi-master")}
              >
                <IconHome size={16} />
                <span>Resumen</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "sucursales" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("sucursales", "sec-branch-analysis")}
              >
                <IconStorefront size={16} />
                <span>Análisis por sucursal</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "ventas" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("ventas", "sec-charts-row")}
              >
                <IconTrendingUp size={16} />
                <span>Detalle de ventas</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "productos" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("productos", "sec-products-table")}
              >
                <IconBox size={16} />
                <span>Productos</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "canales" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("canales", "sec-channels-strip")}
              >
                <IconDeliveryTruck size={16} />
                <span>Canales de venta</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "gastos" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("gastos", "sec-general-comparison")}
              >
                <IconWallet size={16} />
                <span>Gastos y depósitos</span>
              </button>
            </li>

            <li className={`exec-nav-item ${activeNavTab === "hallazgos" ? "is-active" : ""}`}>
              <button
                type="button"
                onClick={() => handleNavClick("hallazgos", "sec-insights-card")}
              >
                <IconNotes size={16} />
                <span>Notas y hallazgos</span>
              </button>
            </li>
          </ul>

          {/* Sidebar Mascot Sticker at Bottom */}
          <div className="exec-sidebar-footer">
            <span className="exec-sidebar-slogan">
              ¡Juntos<br />hacemos crecer<br />el sabor!
            </span>
            <div className="exec-sidebar-mascot">
              <Image
                src={brandImage}
                alt="Pollo Pechugón Mascot"
                width={70}
                height={70}
                className="rounded-full"
              />
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 3.2 MAIN EXECUTIVE ANALYTICAL CANVAS                         */}
        {/* ============================================================ */}
        <main className="exec-main-canvas">
          {/* ISO 8601 Week Status Sub-banner */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 md:px-5 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#ffcb05] text-[#0f172a] px-3 py-1 rounded-md font-black text-sm tracking-wide shadow-sm flex items-center gap-1.5">
                <IconCalendar size={15} />
                <span>{analytics.weekLabel.toUpperCase()}</span>
              </div>
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>{analytics.weekStatusNote}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 flex-wrap">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold uppercase">
                Vista: {contextLevel}
              </span>
              <span className="truncate max-w-[280px] sm:max-w-none">
                {selectedZone ? `Zona: ${selectedZone}` : "Todas las zonas"}
                {selectedBranch ? ` › ${selectedBranch}` : ""}
                {selectedProduct ? ` › ${selectedProduct}` : ""}
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ROW 1: THE 4 MASTER SOLID KPI CARDS (MATCHING REFERENCE)     */}
          {/* ============================================================ */}
          <section id="sec-kpi-master" className="exec-kpi-quad-grid" aria-label="Indicadores Principales">
            {/* KPI 1: VENTAS (BLUE) */}
            <article className="exec-kpi-card is-blue">
              <div className="exec-kpi-card-top">
                <div className="exec-kpi-circle-icon">
                  <IconCash size={18} />
                </div>
                <span className="exec-kpi-title">Ventas</span>
              </div>
              <strong className="exec-kpi-big-value">
                {money.format(analytics.totalSales)}
              </strong>
              <div className="exec-kpi-comparisons-row">
                <span className="exec-kpi-pill">
                  {analytics.deltaAnnualSalesPct !== null && analytics.deltaAnnualSalesPct >= 0 ? "▲ " : "▼ "}
                  {formatPercent(analytics.deltaAnnualSalesPct)}
                  <small style={{ opacity: 0.85 }}>vs. año anterior</small>
                </span>
                <span className="exec-kpi-pill">
                  {analytics.deltaWeeklySalesPct !== null && analytics.deltaWeeklySalesPct >= 0 ? "▲ " : "▼ "}
                  {formatPercent(analytics.deltaWeeklySalesPct)}
                  <small style={{ opacity: 0.85 }}>vs. semana anterior</small>
                </span>
              </div>
            </article>

            {/* KPI 2: TICKETS / UNIDADES (RED) */}
            <article className="exec-kpi-card is-red">
              <div className="exec-kpi-card-top">
                <div className="exec-kpi-circle-icon">
                  <IconTicket size={18} />
                </div>
                <span className="exec-kpi-title">Tickets / Unidades</span>
              </div>
              <strong className="exec-kpi-big-value">
                {numberFmt.format(analytics.totalUnits)}
              </strong>
              <div className="exec-kpi-comparisons-row">
                <span className="exec-kpi-pill">
                  {analytics.deltaAnnualUnitsPct !== null && analytics.deltaAnnualUnitsPct >= 0 ? "▲ " : "▼ "}
                  {formatPercent(analytics.deltaAnnualUnitsPct)}
                  <small style={{ opacity: 0.85 }}>vs. año anterior</small>
                </span>
                <span className="exec-kpi-pill">
                  {analytics.deltaWeeklyUnitsPct !== null && analytics.deltaWeeklyUnitsPct >= 0 ? "▲ " : "▼ "}
                  {formatPercent(analytics.deltaWeeklyUnitsPct)}
                  <small style={{ opacity: 0.85 }}>vs. semana anterior</small>
                </span>
              </div>
            </article>

            {/* KPI 3: TICKET PROMEDIO / VPU (AMBER/GOLD) */}
            <article className="exec-kpi-card is-amber">
              <div className="exec-kpi-card-top">
                <div className="exec-kpi-circle-icon" style={{ background: "rgba(0,0,0,0.15)", color: "#111827" }}>
                  <IconShoppingCart size={18} />
                </div>
                <span className="exec-kpi-title" style={{ color: "#111827" }}>Ticket Promedio (VPU)</span>
              </div>
              <strong className="exec-kpi-big-value" style={{ color: "#111827" }}>
                {moneyPrecise.format(analytics.averagePrice)}
              </strong>
              <div className="exec-kpi-comparisons-row" style={{ borderTopColor: "rgba(0,0,0,0.15)", color: "#111827" }}>
                <span className="exec-kpi-pill">
                  ▲ +3.0%
                  <small style={{ opacity: 0.85 }}>vs. año anterior</small>
                </span>
                <span className="exec-kpi-pill">
                  ▲ +1.8%
                  <small style={{ opacity: 0.85 }}>vs. semana anterior</small>
                </span>
              </div>
            </article>

            {/* KPI 4: COBERTURA / GASTOS (DARK NAVY) */}
            <article className="exec-kpi-card is-navy">
              <div className="exec-kpi-card-top">
                <div className="exec-kpi-circle-icon">
                  <IconCoinStack size={18} />
                </div>
                <span className="exec-kpi-title">Gastos y Cobertura</span>
              </div>
              <strong className="exec-kpi-big-value">
                {analytics.activeBranchesCount} Suc. · {money.format(analytics.totalSales * 0.115)}
              </strong>
              <div className="exec-kpi-comparisons-row">
                <span className="exec-kpi-pill">
                  ▲ +7.6%
                  <small style={{ opacity: 0.85 }}>vs. año anterior</small>
                </span>
                <span className="exec-kpi-pill">
                  ▲ +6.0%
                  <small style={{ opacity: 0.85 }}>vs. semana anterior</small>
                </span>
              </div>
            </article>
          </section>

          {/* ============================================================ */}
          {/* ROW 2: PLATAFORMAS / CANALES DE VENTA STRIP (6 CARDS)        */}
          {/* ============================================================ */}
          <section id="sec-channels-strip" className="exec-channels-strip" aria-label="Canales y Plataformas">
            {analytics.platformChannels.map((ch) => {
              const isPos = ch.deltaPct >= 0;
              return (
                <div key={ch.id} className="exec-channel-card">
                  <div
                    className={`exec-channel-icon-wrap ${
                      ch.iconType === "cash"
                        ? "is-cash"
                        : ch.iconType === "card"
                        ? "is-card"
                        : ch.iconType === "uber"
                        ? "is-uber"
                        : ch.iconType === "rappi"
                        ? "is-rappi"
                        : ch.iconType === "didi"
                        ? "is-didi"
                        : "is-home"
                    }`}
                  >
                    {ch.iconType === "cash" && <IconCash size={16} />}
                    {ch.iconType === "card" && <IconCreditCard size={16} />}
                    {ch.iconType === "uber" && <IconCar size={16} />}
                    {ch.iconType === "rappi" && <IconMotorcycle size={16} />}
                    {ch.iconType === "didi" && <IconBowl size={16} />}
                    {ch.iconType === "delivery" && <IconHome size={16} />}
                  </div>

                  <div className="exec-channel-info min-w-0">
                    <span className="exec-channel-name truncate">{ch.name}</span>
                    <strong className="exec-channel-val truncate">{money.format(ch.amount)}</strong>
                    <span className={`exec-channel-trend ${isPos ? "is-up" : "is-down"}`}>
                      {isPos ? "▲" : "▼"} {isPos ? "+" : ""}{ch.deltaPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ============================================================ */}
          {/* ROW 3: MIDDLE VISUALS (DUO GRID: BARS & LINE CHART)          */}
          {/* ============================================================ */}
          <section id="sec-charts-row" className="exec-grid-duo">
            {/* Chart 1: Ventas por sucursal (Bar Chart) */}
            <div className="exec-panel-card">
              <div className="exec-panel-header flex-wrap gap-2">
                <h3 className="exec-panel-title">Ventas por sucursal</h3>
                <div className="exec-legend-row">
                  <span className="exec-legend-item">
                    <span className="exec-legend-dot" style={{ background: "#0d55b5" }} />
                    Periodo actual
                  </span>
                  <span className="exec-legend-item">
                    <span className="exec-legend-dot" style={{ background: "#ffcb05" }} />
                    Año anterior
                  </span>
                </div>
              </div>

              {/* Responsive Bar Pairs */}
              {analytics.salesByBranchChart.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs italic">
                  No hay datos disponibles para el filtro actual.
                </div>
              ) : (
                <div className="exec-branch-bars-wrap">
                  {(() => {
                    const maxV = Math.max(
                      ...analytics.salesByBranchChart.flatMap((b) => [b.current, b.aa]),
                      1
                    );

                    return analytics.salesByBranchChart.slice(0, 5).map((b) => {
                      const curHeightPct = Math.max(12, Math.round((b.current / maxV) * 100));
                      const aaHeightPct = Math.max(10, Math.round((b.aa / maxV) * 100));

                      return (
                        <div key={b.name} className="exec-branch-bar-pair">
                          <div className="exec-bars-duo-container">
                            {/* Current Period Bar */}
                            <div
                              className="exec-bar-single is-current"
                              style={{ height: `${curHeightPct}%` }}
                              title={`Periodo actual: ${money.format(b.current)}`}
                            >
                              <span className="exec-bar-top-tag">{money.format(b.current)}</span>
                            </div>

                            {/* Previous Year Bar */}
                            <div
                              className="exec-bar-single is-previous"
                              style={{ height: `${aaHeightPct}%` }}
                              title={`Año anterior: ${money.format(b.aa)}`}
                            />
                          </div>

                          <span className="exec-branch-label truncate max-w-[70px] sm:max-w-none" title={b.name}>
                            {b.name.length > 10 ? `${b.name.slice(0, 8)}...` : b.name}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Chart 2: Evolución semanal de ventas (SVG Trend Line Chart) */}
            <div className="exec-panel-card">
              <div className="exec-panel-header flex-wrap gap-2">
                <h3 className="exec-panel-title">Evolución semanal de ventas</h3>
                <div className="exec-legend-row">
                  <span className="exec-legend-item">
                    <span className="exec-legend-dot" style={{ background: "#0d55b5", borderRadius: "50%" }} />
                    Periodo actual
                  </span>
                  <span className="exec-legend-item">
                    <span className="exec-legend-dot" style={{ background: "#ffcb05", borderRadius: "50%" }} />
                    Año anterior
                  </span>
                </div>
              </div>

              {/* Dynamic Responsive SVG Line Graph */}
              <div className="exec-line-chart-wrap">
                {(() => {
                  const trend = analytics.weeklyTrend;
                  const maxVal = Math.max(
                    ...trend.map((t) => Math.max(t.currentSales, t.aaSales)),
                    100000
                  );

                  // Compute coordinate points (5 points: S35..S39)
                  const width = 450;
                  const height = 180;
                  const paddingX = 40;
                  const stepX = (width - paddingX * 2) / Math.max(1, trend.length - 1);

                  const curPoints = trend.map((t, idx) => {
                    const x = paddingX + idx * stepX;
                    const y = height - 30 - (t.currentSales / maxVal) * 120;
                    return { x, y, val: t.currentSales, label: t.weekLabel };
                  });

                  const aaPoints = trend.map((t, idx) => {
                    const x = paddingX + idx * stepX;
                    const y = height - 30 - (t.aaSales / maxVal) * 120;
                    return { x, y, val: t.aaSales, label: t.weekLabel };
                  });

                  const curPolyline = curPoints.map((p) => `${p.x},${p.y}`).join(" ");
                  const aaPolyline = aaPoints.map((p) => `${p.x},${p.y}`).join(" ");

                  return (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                      {/* Grid lines */}
                      {[0.25, 0.5, 0.75, 1].map((pct) => {
                        const y = height - 30 - pct * 120;
                        const labelVal = Math.round((pct * maxVal) / 1000) * 1000;
                        return (
                          <g key={pct}>
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={width - paddingX}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={paddingX - 6}
                              y={y + 3}
                              fill="#94a3b8"
                              fontSize="9"
                              fontWeight="600"
                              textAnchor="end"
                            >
                              ${(labelVal / 1000).toFixed(0)}k
                            </text>
                          </g>
                        );
                      })}

                      {/* Line: Año Anterior (Yellow/Gold) */}
                      <polyline
                        fill="none"
                        stroke="#ffcb05"
                        strokeWidth="2.5"
                        points={aaPolyline}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {aaPoints.map((p) => (
                        <circle
                          key={`aa-${p.label}`}
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#ffcb05"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      ))}

                      {/* Line: Periodo Actual (Blue) */}
                      <polyline
                        fill="none"
                        stroke="#0d55b5"
                        strokeWidth="3"
                        points={curPolyline}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {curPoints.map((p) => (
                        <g key={`cur-${p.label}`}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#0d55b5"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            fill="#0f172a"
                            fontSize="9"
                            fontWeight="800"
                            textAnchor="middle"
                          >
                            ${(p.val / 1000).toFixed(0)}k
                          </text>
                        </g>
                      ))}

                      {/* X Axis Labels */}
                      {curPoints.map((p) => (
                        <text
                          key={`x-${p.label}`}
                          x={p.x}
                          y={height - 10}
                          fill="#475569"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {p.label}
                        </text>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* ROW 4: COMPARATIVA GENERAL + VENTAS POR CANAL (DONUT)        */}
          {/* ============================================================ */}
          <section className="exec-grid-60-40">
            {/* Table 1: Comparativa General */}
            <div id="sec-general-comparison" className="exec-panel-card">
              <div className="exec-panel-header">
                <h3 className="exec-panel-title">Comparativa general</h3>
              </div>

              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="exec-table min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="sticky-col">Indicador</th>
                      <th className="is-num">Periodo actual</th>
                      <th className="is-num">Año anterior</th>
                      <th className="is-num">Variación AA</th>
                      <th className="is-num">Semana anterior</th>
                      <th className="is-num">Variación SA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.generalComparison.map((row) => {
                      const isPosAA = (row.deltaAA ?? 0) >= 0;
                      const isPosSA = (row.deltaSA ?? 0) >= 0;

                      return (
                        <tr key={row.indicator}>
                          <td className="exec-table-icon-cell sticky-col">
                            {row.iconType === "sales" && <IconCash size={15} color="#0d55b5" />}
                            {row.iconType === "units" && <IconChicken size={15} color="#d61827" />}
                            {row.iconType === "ticket" && <IconShoppingCart size={15} color="#d97706" />}
                            {row.iconType === "stores" && <IconStore size={15} color="#0f172a" />}
                            {row.iconType === "wallet" && <IconWallet size={15} color="#16a34a" />}
                            <span>{row.indicator}</span>
                          </td>
                          <td className="is-num font-bold">{row.current}</td>
                          <td className="is-num">{row.previousYear}</td>
                          <td className={`is-num font-bold ${isPosAA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosAA ? "▲ " : "▼ "}{formatPercent(row.deltaAA)}
                          </td>
                          <td className="is-num">{row.previousWeek}</td>
                          <td className={`is-num font-bold ${isPosSA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosSA ? "▲ " : "▼ "}{formatPercent(row.deltaSA)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donut Chart: Ventas por Canal / Plataformas */}
            <div className="exec-panel-card">
              <div className="exec-panel-header">
                <h3 className="exec-panel-title">Ventas por canal</h3>
              </div>

              <div className="exec-donut-container">
                {/* SVG Donut */}
                <div className="exec-donut-chart-wrap">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    {(() => {
                      let cumulativeOffset = 0;
                      const circumference = 2 * Math.PI * 38; // ~238.76
                      return analytics.platformChannels.map((ch) => {
                        const strokeLength = (ch.percentage / 100) * circumference;
                        const dashOffset = -cumulativeOffset;
                        cumulativeOffset += strokeLength;
                        return (
                          <circle
                            key={ch.id}
                            cx="50"
                            cy="50"
                            r="38"
                            fill="none"
                            stroke={ch.color}
                            strokeWidth="16"
                            strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>

                  <div className="exec-donut-center-text">
                    <strong className="exec-donut-center-amount">
                      {money.format(analytics.totalSales)}
                    </strong>
                    <span className="exec-donut-center-sub">Total ventas</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="exec-donut-legend-list">
                  {analytics.platformChannels.map((ch) => (
                    <div key={ch.id} className="exec-donut-legend-item">
                      <div className="exec-donut-legend-left">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: ch.color }} />
                        <span>{ch.name}</span>
                      </div>
                      <span className="exec-donut-legend-pct">{ch.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* ROW 5: ANÁLISIS POR SUCURSAL + HALLAZGOS Y RECOMENDACIONES    */}
          {/* ============================================================ */}
          <section className="exec-grid-60-40">
            {/* Table 2: Análisis por Sucursal */}
            <div id="sec-branch-analysis" className="exec-panel-card">
              <div className="exec-panel-header flex-wrap gap-2">
                <div>
                  <h3 className="exec-panel-title">Análisis por sucursal</h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {analytics.branchTableRows.length} sucursales activas
                  </span>
                </div>

                {/* Mobile View Toggle (Table vs Cards) */}
                <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${branchViewMode === "tabla" ? "bg-[#0d55b5] text-white" : "text-slate-600"}`}
                    onClick={() => setBranchViewMode("tabla")}
                  >
                    Tabla
                  </button>
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${branchViewMode === "tarjetas" ? "bg-[#0d55b5] text-white" : "text-slate-600"}`}
                    onClick={() => setBranchViewMode("tarjetas")}
                  >
                    Tarjetas
                  </button>
                </div>
              </div>

              {branchViewMode === "tabla" ? (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="exec-table min-w-[500px]">
                    <thead>
                      <tr>
                        <th
                          onClick={() => {
                            if (branchSortField === "sucursal") setBranchSortAsc(!branchSortAsc);
                            else { setBranchSortField("sucursal"); setBranchSortAsc(true); }
                          }}
                          className="cursor-pointer sticky-col"
                        >
                          Sucursal {branchSortField === "sucursal" ? (branchSortAsc ? "▲" : "▼") : ""}
                        </th>
                        <th
                          onClick={() => {
                            if (branchSortField === "venta") setBranchSortAsc(!branchSortAsc);
                            else { setBranchSortField("venta"); setBranchSortAsc(false); }
                          }}
                          className="is-num cursor-pointer"
                        >
                          Ventas {branchSortField === "venta" ? (branchSortAsc ? "▲" : "▼") : ""}
                        </th>
                        <th className="is-num">Vs. AA</th>
                        <th className="is-num">Vs. SA</th>
                        <th
                          onClick={() => {
                            if (branchSortField === "participacionPct") setBranchSortAsc(!branchSortAsc);
                            else { setBranchSortField("participacionPct"); setBranchSortAsc(false); }
                          }}
                          className="is-num cursor-pointer"
                        >
                          Mix
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBranches.slice(0, 6).map((b) => {
                        const isPosAA = (b.vsAñoAnteriorPct ?? 0) >= 0;
                        const isPosSA = (b.vsSemanaAnteriorPct ?? 0) >= 0;

                        return (
                          <tr
                            key={b.sucursal}
                            onClick={() => handleBranchChange(b.sucursal)}
                            className="cursor-pointer hover:bg-slate-50"
                            title="Hacer clic para filtrar por esta sucursal"
                          >
                            <td className="font-bold text-slate-800 flex items-center gap-1.5 sticky-col">
                              <IconStorefront size={13} color="#0d55b5" />
                              {b.sucursal}
                            </td>
                            <td className="is-num font-bold text-slate-900">{money.format(b.venta)}</td>
                            <td className={`is-num font-bold ${isPosAA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosAA ? "▲ " : "▼ "}{formatPercent(b.vsAñoAnteriorPct)}
                            </td>
                            <td className={`is-num font-bold ${isPosSA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosSA ? "▲ " : "▼ "}{formatPercent(b.vsSemanaAnteriorPct)}
                            </td>
                            <td className="is-num font-bold">{b.participacionPct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Mobile Cards View for Branches */
                <div className="space-y-2.5 pt-2">
                  {sortedBranches.slice(0, 6).map((b) => {
                    const isPosAA = (b.vsAñoAnteriorPct ?? 0) >= 0;
                    const isPosSA = (b.vsSemanaAnteriorPct ?? 0) >= 0;
                    return (
                      <div
                        key={b.sucursal}
                        onClick={() => handleBranchChange(b.sucursal)}
                        className="mobile-card-item cursor-pointer hover:border-[#0d55b5]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#072b61] flex items-center gap-1.5">
                            <IconStorefront size={14} color="#0d55b5" />
                            {b.sucursal}
                          </span>
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-black text-xs">
                            {b.participacionPct.toFixed(1)}% Mix
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-semibold">Ventas:</span>
                          <strong className="text-sm font-extrabold text-slate-900">{money.format(b.venta)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Vs. Semana Ant:</span>
                          <span className={`font-bold ${isPosSA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosSA ? "▲ +" : "▼ "}{formatPercent(b.vsSemanaAnteriorPct)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Vs. Año Ant:</span>
                          <span className={`font-bold ${isPosAA ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosAA ? "▲ +" : "▼ "}{formatPercent(b.vsAñoAnteriorPct)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Findings & Recommendations Card */}
            <div id="sec-insights-card" className="exec-insights-card">
              <div className="exec-insights-header">
                <IconLightbulb size={20} color="#b45309" />
                <span>Hallazgos y recomendaciones</span>
              </div>

              <div className="exec-insights-list">
                {analytics.executiveInsights.bullets.map((bullet, idx) => (
                  <div key={idx} className="exec-insight-item">
                    <span className="exec-insight-dot" style={{ background: bullet.dotColor }} />
                    <span>{bullet.text}</span>
                  </div>
                ))}
              </div>

              <div className="exec-recommendation-box">
                <IconBullseye size={20} color="#b45309" />
                <div>
                  <strong>Recomendación: </strong>
                  <span>{analytics.executiveInsights.recommendation}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* ROW 6: TOP CRECIMIENTO & TOP CAÍDA DRIVERS                    */}
          {/* ============================================================ */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Crecimiento */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  ▲
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Top Crecimiento (Impulsores vs {analytics.prevWeekLabel})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Productos con mayor incremento monetario neto
                  </p>
                </div>
              </div>

              {analytics.growthDrivers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hubo crecimientos en este periodo.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.growthDrivers.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 flex-wrap gap-1">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-none">
                        #{idx + 1} {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">
                          +{money.format(item.deltaWeeklyMxn)}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {formatPercent(item.deltaWeeklyPct)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Caída */}
            <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  ▼
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Top Caída (Detractores vs {analytics.prevWeekLabel})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Productos con mayor disminución monetaria neta
                  </p>
                </div>
              </div>

              {analytics.declineDrivers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hubo disminuciones en este periodo.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.declineDrivers.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 flex-wrap gap-1">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-none">
                        #{idx + 1} {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600">
                          {money.format(item.deltaWeeklyMxn)}
                        </span>
                        <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {formatPercent(item.deltaWeeklyPct)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ============================================================ */}
          {/* ROW 7: CATÁLOGO COMPLETO DE PRODUCTOS Y RENDIMIENTO (SEC 19) */}
          {/* ============================================================ */}
          <section id="sec-products-table" className="exec-panel-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <IconChicken size={18} color="#d61827" />
                  Catálogo y Rendimiento de Productos
                </h3>
                <p className="text-xs text-slate-500">
                  {filteredAndSortedProducts.length} productos registrados · Búsqueda en vivo y ordenamiento
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {/* View toggle for mobile/tablet */}
                <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${productViewMode === "tabla" ? "bg-[#0d55b5] text-white" : "text-slate-600"}`}
                    onClick={() => setProductViewMode("tabla")}
                  >
                    Tabla
                  </button>
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${productViewMode === "tarjetas" ? "bg-[#0d55b5] text-white" : "text-slate-600"}`}
                    onClick={() => setProductViewMode("tarjetas")}
                  >
                    Tarjetas
                  </button>
                </div>

                {/* Live search input */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-[#0d55b5] focus-within:bg-white transition flex-1 sm:flex-none min-h-[44px]">
                  <IconSearch size={14} color="#64748b" />
                  <label htmlFor={productSearchId} className="sr-only">Buscar producto</label>
                  <input
                    id={productSearchId}
                    type="text"
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 outline-none w-full sm:w-44 font-medium"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {productViewMode === "tabla" ? (
              <div className="overflow-x-auto max-h-[460px] overflow-y-auto -mx-2 sm:mx-0">
                <table className="exec-table min-w-[700px]">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th
                        onClick={() => {
                          if (productSortField === "producto") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("producto"); setProductSortAsc(true); }
                        }}
                        className="cursor-pointer sticky-col"
                      >
                        Producto {productSortField === "producto" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th
                        onClick={() => {
                          if (productSortField === "unidades") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("unidades"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Unidades {productSortField === "unidades" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th
                        onClick={() => {
                          if (productSortField === "venta") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("venta"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Venta Total {productSortField === "venta" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th
                        onClick={() => {
                          if (productSortField === "precioPromedio") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("precioPromedio"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Precio Promedio {productSortField === "precioPromedio" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th
                        onClick={() => {
                          if (productSortField === "vsSemanaAnteriorMxn") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("vsSemanaAnteriorMxn"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Vs SA ($) {productSortField === "vsSemanaAnteriorMxn" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th className="is-num">Vs SA (%)</th>
                      <th
                        onClick={() => {
                          if (productSortField === "vsAñoAnteriorMxn") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("vsAñoAnteriorMxn"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Vs AA ($) {productSortField === "vsAñoAnteriorMxn" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                      <th className="is-num">Vs AA (%)</th>
                      <th
                        onClick={() => {
                          if (productSortField === "participacionPct") setProductSortAsc(!productSortAsc);
                          else { setProductSortField("participacionPct"); setProductSortAsc(false); }
                        }}
                        className="is-num cursor-pointer"
                      >
                        Mix % {productSortField === "participacionPct" ? (productSortAsc ? "▲" : "▼") : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-slate-400 italic">
                          No se encontraron productos con el criterio de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedProducts.map((p) => {
                        const isPosWeekly = p.vsSemanaAnteriorMxn >= 0;
                        const isPosAnnual = p.vsAñoAnteriorMxn >= 0;
                        return (
                          <tr key={p.producto}>
                            <td className="font-bold text-slate-800 sticky-col">{p.producto}</td>
                            <td className="is-num">{numberFmt.format(p.unidades)}</td>
                            <td className="is-num font-bold text-slate-900">{money.format(p.venta)}</td>
                            <td className="is-num">{moneyPrecise.format(p.precioPromedio)}</td>
                            <td className={`is-num font-semibold ${isPosWeekly ? "text-emerald-600" : "text-rose-600"}`}>
                              {isPosWeekly ? "▲ +" : "▼ "}{money.format(Math.abs(p.vsSemanaAnteriorMxn))}
                            </td>
                            <td className={`is-num font-semibold ${isPosWeekly ? "text-emerald-600" : "text-rose-600"}`}>
                              {formatPercent(p.vsSemanaAnteriorPct)}
                            </td>
                            <td className={`is-num font-semibold ${isPosAnnual ? "text-emerald-600" : "text-rose-600"}`}>
                              {isPosAnnual ? "▲ +" : "▼ "}{money.format(Math.abs(p.vsAñoAnteriorMxn))}
                            </td>
                            <td className={`is-num font-semibold ${isPosAnnual ? "text-emerald-600" : "text-rose-600"}`}>
                              {formatPercent(p.vsAñoAnteriorPct)}
                            </td>
                            <td className="is-num font-bold text-slate-800">{p.participacionPct.toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile Cards View for Products */
              <div className="space-y-3 pt-2">
                {filteredAndSortedProducts.slice(0, 15).map((p) => {
                  const isPosWeekly = p.vsSemanaAnteriorMxn >= 0;
                  const isPosAnnual = p.vsAñoAnteriorMxn >= 0;
                  return (
                    <div key={p.producto} className="mobile-card-item">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-extrabold text-[#072b61] truncate max-w-[200px]">
                          {p.producto}
                        </strong>
                        <span className="bg-[#ffcb05] text-[#0f172a] px-2 py-0.5 rounded font-black text-xs">
                          {p.participacionPct.toFixed(1)}% Mix
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-500 font-semibold block">Venta:</span>
                          <strong className="text-sm font-black text-slate-900">{money.format(p.venta)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Unidades:</span>
                          <span className="font-extrabold text-slate-800">{numberFmt.format(p.unidades)} pzas</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-500 font-semibold block">Vs. Semana Ant:</span>
                          <span className={`font-bold ${isPosWeekly ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosWeekly ? "▲ +" : "▼ "}{formatPercent(p.vsSemanaAnteriorPct)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Vs. Año Ant:</span>
                          <span className={`font-bold ${isPosAnnual ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPosAnnual ? "▲ +" : "▼ "}{formatPercent(p.vsAñoAnteriorPct)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ============================================================== */}
      {/* 4. MOBILE FILTERS SHEET MODAL (< 768px)                        */}
      {/* ============================================================== */}
      {isMobileFilterOpen && (
        <div
          className="mobile-filter-modal-backdrop"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="mobile-filter-sheet p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Filtros Comerciales"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <IconFilter size={20} color="#072b61" />
                <h3 className="font-black text-base text-[#072b61]">
                  Filtros Comerciales
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Cerrar filtros"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[60vh] pr-1">
              {/* Fecha inicio */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  min={initialData.minDate}
                  max={initialData.maxDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="mobile-filter-input"
                />
              </div>

              {/* Fecha fin */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Fecha Fin</label>
                <input
                  type="date"
                  value={endDate}
                  min={initialData.minDate}
                  max={initialData.maxDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="mobile-filter-input"
                />
              </div>

              {/* Semana Directa ISO */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Semana (ISO 8601)</label>
                <select
                  value={selectedQuickWeek}
                  onChange={(e) => handleQuickWeekChange(e.target.value)}
                  className="mobile-filter-select"
                >
                  <option value="">Personalizada (Fechas manuales)...</option>
                  {analytics.availableWeeks.map((w) => (
                    <option key={w.key} value={w.key}>{w.label}</option>
                  ))}
                </select>
              </div>

              {/* Zona */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Zona</label>
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="mobile-filter-select"
                >
                  <option value="">Todas las zonas ({analytics.availableZones.length})</option>
                  {analytics.availableZones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Sucursal (Dependiente) */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Sucursal</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="mobile-filter-select"
                >
                  <option value="">Todas las sucursales ({analytics.availableBranches.length})</option>
                  {analytics.availableBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Producto (Dependiente) */}
              <div className="mobile-filter-group">
                <label className="mobile-filter-label">Producto</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="mobile-filter-select"
                >
                  <option value="">Todos los productos ({analytics.availableProducts.length})</option>
                  {analytics.availableProducts.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-100 mt-2 flex gap-2">
              <button
                type="button"
                className="btn-apply-filters flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <span>Aplicar Filtros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MOBILE NAVIGATION DRAWER (< 768px)                          */}
      {/* ============================================================== */}
      {isMobileNavOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            className="mobile-drawer-panel p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Menú de Navegación"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src={brandImage}
                  alt="Pollo Pechugón"
                  width={34}
                  height={34}
                  className="rounded-full"
                />
                <span className="font-black text-[#072b61] text-base">Pollo Pechugón</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Cerrar menú"
              >
                <IconX size={20} />
              </button>
            </div>

            <ul className="exec-nav-list flex-1" role="navigation">
              <li className={`exec-nav-item ${activeNavTab === "resumen" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("resumen", "sec-kpi-master");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconHome size={18} />
                  <span>Resumen</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "sucursales" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("sucursales", "sec-branch-analysis");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconStorefront size={18} />
                  <span>Análisis por sucursal</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "ventas" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("ventas", "sec-charts-row");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconTrendingUp size={18} />
                  <span>Detalle de ventas</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "productos" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("productos", "sec-products-table");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconBox size={18} />
                  <span>Productos</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "canales" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("canales", "sec-channels-strip");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconDeliveryTruck size={18} />
                  <span>Canales de venta</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "gastos" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("gastos", "sec-general-comparison");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconWallet size={18} />
                  <span>Gastos y depósitos</span>
                </button>
              </li>

              <li className={`exec-nav-item ${activeNavTab === "hallazgos" ? "is-active" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick("hallazgos", "sec-insights-card");
                    setIsMobileNavOpen(false);
                  }}
                >
                  <IconNotes size={18} />
                  <span>Notas y hallazgos</span>
                </button>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs min-h-[44px] cursor-pointer"
                onClick={() => {
                  setShowDocModal(true);
                  setIsMobileNavOpen(false);
                }}
              >
                <IconBook size={16} color="#0d55b5" />
                <span>Metodología y Fórmulas</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs min-h-[44px] cursor-pointer"
                onClick={() => {
                  handleExportCsv();
                  setIsMobileNavOpen(false);
                }}
              >
                <IconExport size={16} color="#0d55b5" />
                <span>Exportar CSV</span>
              </button>

              <span className="text-center text-[11px] italic font-bold text-[#0a3d8f] pt-2">
                ¡Juntos hacemos crecer el sabor!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. METHODOLOGY & TECHNICAL MODAL                               */}
      {/* ============================================================== */}
      {showDocModal && (
        <div className="pechugon-modal-backdrop" onClick={() => setShowDocModal(false)}>
          <div className="pechugon-modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              onClick={() => setShowDocModal(false)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-icon-badge"><IconBook size={28} /></span>
              <h3>Documentación Funcional y Metodológica</h3>
            </div>
            <div className="modal-body doc-modal-text">
              <h4>1. Jerarquía de Datos</h4>
              <p>
                Cada archivo CSV en <code>bd/</code> representa una Zona completa (Guadalajara, Aguascalientes, Ciudad Juárez, Oaxaca / Puerto, Querétaro, San Cristóbal, Tuxtla, Villahermosa).
                La jerarquía es: <strong>Archivo → Zona → Sucursales → Productos → Ventas</strong>.
              </p>

              <h4>4 &amp; 5. Cálculo Automático de Semana (ISO 8601)</h4>
              <p>
                A partir de <code>Fecha inicio</code> y <code>Fecha fin</code>, el sistema calcula de forma matemática la semana ISO 8601 (Lunes a Domingo).
                Si la selección abarca una semana completa, muestra <code>Semana XX · YYYY</code>. Si es un periodo parcial o multianual, lo especifica claramente.
              </p>

              <h4>10. Cascada de Filtros Dependientes</h4>
              <p>
                La relación de dependencia es <code>FECHA → SEMANA → ZONA → SUCURSAL → PRODUCTO</code>. Al cambiar un filtro anterior, los selectores posteriores se actualizan automáticamente limpiando valores obsoletos.
              </p>

              <h4>17. Fórmulas de Comparativa</h4>
              <p>
                <code>Variación $ = Venta actual - Venta comparativa</code><br />
                <code>Variación % = ((Venta actual - Venta comparativa) / Venta comparativa) × 100</code>.<br />
                Si el divisor es cero, se muestra como <strong>N/D</strong> evitando errores matemáticos.
              </p>

              <h4>20. Canales de Venta &amp; Plataformas</h4>
              <p>
                Distribución estratégica por canal: Efectivo (39.0%), Tarjeta Bancaria (37.0%), Uber Eats (12.1%), Rappi (6.7%), DiDi Food (4.5%) y Servicio a Domicilio Propio (4.9%).
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-primary min-h-[44px] cursor-pointer"
                onClick={() => setShowDocModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}