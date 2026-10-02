"use client";

import { useState } from "react";
import Image from "next/image";
import brandLogo from "@/app/assets/images.jpg";

interface PechugonLandingProps {
  onGoToReport?: () => void;
  activeView?: "app" | "reporte";
  onSwitchView?: (view: "app" | "reporte") => void;
}

export function PechugonAppLanding({
  onGoToReport,
  activeView = "app",
  onSwitchView,
}: PechugonLandingProps) {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showDownloadToast, setShowDownloadToast] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Querétaro");

  const handleDownload = (store: string) => {
    setShowDownloadToast(`Iniciando descarga en ${store}...`);
    setTimeout(() => setShowDownloadToast(null), 3500);
  };

  const featureCards = [
    {
      id: 1,
      title: "Promociones exclusivas",
      description: "Descuentos y cupones que sólo encuentras en la app.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="7" cy="7" r="2.5" fill="currentColor" />
          <circle cx="17" cy="17" r="2.5" fill="currentColor" />
        </svg>
      ),
      modalTitle: "Cupones y Promociones Exclusivas",
      modalContent: (
        <div className="feature-preview-content">
          <div className="promo-badge-tag">¡Válido solo en App!</div>
          <div className="promo-sample-card">
            <div className="promo-left">
              <span className="promo-discount">2x1</span>
              <span className="promo-condition">Martes de Rosticería</span>
            </div>
            <div className="promo-right">
              <strong>Medio Pollo Rostizado</strong>
              <p>Aplica en la compra de un paquete completo de medio pollo adicional.</p>
              <span className="promo-code">CÓDIGO: PECHU2X1</span>
            </div>
          </div>
          <div className="promo-sample-card">
            <div className="promo-left">
              <span className="promo-discount">$50 OFF</span>
              <span className="promo-condition">Primer pedido</span>
            </div>
            <div className="promo-right">
              <strong>Descuento de Bienvenida</strong>
              <p>Válido en compras mínimas de $250 a través de la app oficial.</p>
              <span className="promo-code">CÓDIGO: APPBIENVENIDO</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Menú completo",
      description: "Todos nuestros productos con fotos y precios actualizados.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20M18 8a3 3 0 0 1-3-3V2" />
          <path d="M6 2v7a3 3 0 0 0 3 3v10M9 2v7" />
          <path d="M3 2v7a3 3 0 0 0 3 3" />
        </svg>
      ),
      modalTitle: "Menú Digital Pollo Pechugón",
      modalContent: (
        <div className="feature-preview-content">
          <div className="menu-preview-grid">
            <div className="menu-item-card">
              <div className="menu-item-emoji">🍗</div>
              <div>
                <strong>Pollo Rostizado Entero</strong>
                <p>Bañado en receta secreta con chiles secos y especias tradicionales.</p>
                <span className="menu-price">$185.00 MXN</span>
              </div>
            </div>
            <div className="menu-item-card">
              <div className="menu-item-emoji">📦</div>
              <div>
                <strong>Paquete Pechugón Familiar</strong>
                <p>1 Pollo entero + Papas cambray + Arroz + Frijoles charros + Tortillas.</p>
                <span className="menu-price">$260.00 MXN</span>
              </div>
            </div>
            <div className="menu-item-card">
              <div className="menu-item-emoji">🌶️</div>
              <div>
                <strong>Pollo Adobado al Carbón</strong>
                <p>Marinado 24h en adobo tradicional con toque cítrico y suave picor.</p>
                <span className="menu-price">$195.00 MXN</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Tu sucursal más cercana",
      description: "Ubicación, teléfono y horarios de cada rosticería.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" fill="currentColor" />
        </svg>
      ),
      modalTitle: "Red de Sucursales Pollo Pechugón",
      modalContent: (
        <div className="feature-preview-content">
          <p className="branch-intro">Encuentra tu rosticería más cercana en Querétaro y más ciudades:</p>
          <div className="branch-list-sample">
            <div className="branch-sample-row">
              <div>
                <strong>Pechugón Querétaro Centro</strong>
                <p>Av. Zaragoza 120, Col. Centro · Tel: (442) 214-5500</p>
                <span className="branch-status is-open">● Abierto hoy hasta 20:00 hrs</span>
              </div>
              <button className="branch-action-btn" type="button" onClick={() => setShowOrderModal(true)}>Pedir aquí</button>
            </div>
            <div className="branch-sample-row">
              <div>
                <strong>Pechugón Juriquilla</strong>
                <p>Blvd. Universitario 340 · Tel: (442) 234-8899</p>
                <span className="branch-status is-open">● Abierto hoy hasta 20:00 hrs</span>
              </div>
              <button className="branch-action-btn" type="button" onClick={() => setShowOrderModal(true)}>Pedir aquí</button>
            </div>
            <div className="branch-sample-row">
              <div>
                <strong>Pechugón El Pueblito</strong>
                <p>Av. Constituyentes Ote. 85 · Tel: (442) 198-2211</p>
                <span className="branch-status is-open">● Abierto hoy hasta 19:30 hrs</span>
              </div>
              <button className="branch-action-btn" type="button" onClick={() => setShowOrderModal(true)}>Pedir aquí</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Tus favoritos",
      description: "Guarda lo que más pides y ordénalo en segundos.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      modalTitle: "Tus Favoritos Guardados",
      modalContent: (
        <div className="feature-preview-content">
          <p className="branch-intro">Guarda tu pedido habitual para reordenar en 1 solo clic:</p>
          <div className="fav-quick-card">
            <div className="fav-header">
              <span className="fav-badge">⭐ Favorito habitual</span>
              <strong>El Paquete Domingo Familiar</strong>
            </div>
            <p>1 Pollo Rostizado Tradicional + 1 Complemento de Arroz + 1 Salsa Ranchera Especial + Totopos.</p>
            <button className="reorder-btn" type="button" onClick={() => setShowOrderModal(true)}>⚡ Reordenar con 1 clic ($245 MXN)</button>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Entérate primero",
      description: "Avisos de promociones y novedades antes que nadie.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
      ),
      modalTitle: "Notificaciones y Novedades",
      modalContent: (
        <div className="feature-preview-content">
          <p className="branch-intro">Recibe avisos en tiempo real cuando tu pollo esté recién salido del rosticero:</p>
          <div className="alert-sample-box">
            <div className="alert-item">
              <span className="alert-time">Hace 15 min</span>
              <strong>🔥 ¡Pollo recién rostizado saliendo en Juriquilla!</strong>
              <p>Tu rosticero favorito tiene tandas frescas con 15% de descuento durante la próxima hora.</p>
            </div>
            <div className="alert-item">
              <span className="alert-time">Ayer</span>
              <strong>🍗 Nuevo Complemento: Rajas con crema y elote</strong>
              <p>Pruébalo gratis al agregar tu paquete Pechugón de 2 pollos.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Recompensas",
      description: "Acumula con cada compra y disfruta beneficios.",
      icon: (
        <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
      modalTitle: "Club Pechugón Recompensas",
      modalContent: (
        <div className="feature-preview-content">
          <div className="reward-card-gold">
            <div className="reward-card-top">
              <span className="reward-tier">Nivel Pechugón Oro 🏆</span>
              <span className="reward-points">420 Puntos</span>
            </div>
            <strong>Estela Barajas</strong>
            <div className="reward-progress-track">
              <div className="reward-progress-fill" style={{ width: "70%" }} />
            </div>
            <small>Te faltan 80 puntos para canjear 1 Pollo Rostizado Gratis.</small>
          </div>
          <div className="reward-prizes-list">
            <div className="reward-prize-item">
              <span>🥤 150 pts = Refresco Familiar 2L</span>
              <span className="prize-unlocked">¡Disponible!</span>
            </div>
            <div className="reward-prize-item">
              <span>🍟 250 pts = Orden de Papas Cambray Especial</span>
              <span className="prize-unlocked">¡Disponible!</span>
            </div>
            <div className="reward-prize-item">
              <span>🍗 500 pts = 1 Pollo Entero Rostizado Gratis</span>
              <span className="prize-locked">Faltan 80 pts</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pechugon-page-wrapper">
      {/* Toast Notification */}
      {showDownloadToast && (
        <div className="pechugon-toast animate-toast">
          <span className="toast-icon">🚀</span>
          <span>{showDownloadToast}</span>
        </div>
      )}

      {/* Main Top Header matching screenshot */}
      <header className="pechugon-header">
        <div className="pechugon-header-inner">
          {/* Logo brand */}
          <div className="pechugon-brand" onClick={() => onSwitchView?.("app")}>
            <div className="pechugon-logo-badge">
              <Image
                src={brandLogo}
                alt="Pollo Pechugón"
                width={48}
                height={48}
                className="brand-logo-img"
                priority
              />
            </div>
            <div className="pechugon-brand-text">
              <span className="brand-name">POLLO PECHUGÓN</span>
              <span className="brand-subtitle">ROSTICERÍAS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="pechugon-nav" aria-label="Menú principal">
            <button
              type="button"
              className="nav-link"
              onClick={() => setSelectedFeature(2)}
            >
              Menú
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => setShowBranchModal(true)}
            >
              Sucursales
            </button>
            <button
              type="button"
              className={`nav-link ${activeView === "app" ? "nav-link--active" : ""}`}
              onClick={() => onSwitchView?.("app")}
            >
              App
            </button>
            <button
              type="button"
              className={`nav-link nav-link--report ${activeView === "reporte" ? "nav-link--active" : ""}`}
              onClick={() => {
                if (onSwitchView) onSwitchView("reporte");
                else if (onGoToReport) onGoToReport();
              }}
              title="Ver análisis y métricas de venta"
            >
              Reporte Comercial
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => setSelectedFeature(1)}
            >
              Nosotros
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                alert("Módulo de facturación electrónica Pollo Pechugón. Ingresa el folio de tu ticket para generar tu CFDI 4.0.");
              }}
            >
              Facturación
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                alert("Centro de Ayuda Pollo Pechugón: ¿Dudas con tu pedido o la app? Contáctanos por WhatsApp al 442-POLLO-00.");
              }}
            >
              Ayuda
            </button>
          </nav>

          {/* Social Icons & CTA Button */}
          <div className="pechugon-header-actions">
            <div className="pechugon-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Pollo Pechugón"
                className="social-icon-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Pollo Pechugón"
                className="social-icon-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok Pollo Pechugón"
                className="social-icon-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.67a8.21 8.21 0 0 0 5.17 1.83V7.05a4.84 4.84 0 0 1-1.35-.36z" />
                </svg>
              </a>
            </div>

            <button
              type="button"
              className="btn-order-now shimmer-effect"
              onClick={() => setShowOrderModal(true)}
            >
              PEDIR AHORA
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pechugon-main">
        {/* HERO SECTION */}
        <section className="pechugon-hero animate-fade-in">
          <div className="hero-container">
            {/* Left Column: Text & Store Badges */}
            <div className="hero-content">
              {/* App Móvil Tag */}
              <div className="app-badge-pill">
                <span className="badge-dot-pulsing" />
                <span className="badge-text">APP MÓVIL</span>
              </div>

              {/* Red Kicker */}
              <p className="hero-kicker">¡YA ESTÁ DISPONIBLE!</p>

              {/* Big Title */}
              <h1 className="hero-title">
                LA APP DE <span className="text-pechugon-red">POLLO PECHUGÓN</span>
              </h1>

              {/* Description */}
              <p className="hero-description">
                Nuestro pollo de siempre, ahora a un toque de distancia. Promociones
                exclusivas, el menú completo y tu sucursal más cercana, todo en tu celular.
              </p>

              {/* Yellow Alert Notice */}
              <div className="notice-box-queretaro">
                <div className="notice-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="notice-text">
                  Por el momento la app <strong>sólo está disponible en Querétaro</strong>. En el resto de
                  las ciudades pide desde{" "}
                  <button
                    type="button"
                    className="notice-link"
                    onClick={() => setShowBranchModal(true)}
                  >
                    el menú de tu plaza
                  </button>
                  .
                </p>
              </div>

              {/* Store Download Buttons */}
              <div className="store-buttons-row">
                {/* App Store */}
                <button
                  type="button"
                  className="store-btn store-btn--apple"
                  onClick={() => handleDownload("App Store (iOS)")}
                >
                  <svg className="store-icon" viewBox="0 0 384 512" fill="currentColor" width="24" height="24">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <div className="store-btn-copy">
                    <span className="store-btn-sub">Descárgala en el</span>
                    <strong className="store-btn-main">App Store</strong>
                  </div>
                </button>

                {/* Google Play */}
                <button
                  type="button"
                  className="store-btn store-btn--google"
                  onClick={() => handleDownload("Google Play Store (Android)")}
                >
                  <svg className="store-icon" viewBox="0 0 512 512" fill="currentColor" width="24" height="24">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                  <div className="store-btn-copy">
                    <span className="store-btn-sub">Disponible en</span>
                    <strong className="store-btn-main">Google Play</strong>
                  </div>
                </button>
              </div>

              {/* Subtext */}
              <p className="hero-download-meta">Descarga gratuita · iOS y Android</p>
            </div>

            {/* Right Column: 3D Floating Phone Mockup */}
            <div className="hero-phone-col">
              <div className="phone-scene">
                {/* Levitating smartphone */}
                <div className="smartphone-body animate-float">
                  {/* Dynamic Island / Notch */}
                  <div className="phone-screen">
                    <div className="phone-notch">
                      <span className="notch-speaker" />
                      <span className="notch-camera" />
                    </div>

                    {/* Status bar */}
                    <div className="phone-status-bar">
                      <span>9:41</span>
                      <div className="status-icons">
                        <span>●●●●</span>
                        <span>📶</span>
                        <span>100% 🔋</span>
                      </div>
                    </div>

                    {/* App Screen Content: Pollo Pechugón in crimson red */}
                    <div className="phone-app-content">
                      <div className="phone-brand-center">
                        <div className="phone-mascot-circle animate-pulse-subtle">
                          <Image
                            src={brandLogo}
                            alt="Pollo Pechugón App"
                            width={110}
                            height={110}
                            className="phone-mascot-img"
                            priority
                          />
                        </div>
                        <h2 className="phone-brand-title">POLLO PECHUGÓN</h2>
                        <span className="phone-brand-sub">ROSTICERÍAS</span>
                        <div className="phone-mini-tag">Sabor al instante</div>
                      </div>

                      {/* Phone Interactive UI elements */}
                      <div className="phone-screen-ui">
                        <div className="phone-promo-pill">
                          <span>🎉 ¡Cupón 20% en tu primera orden!</span>
                        </div>
                        <button
                          type="button"
                          className="phone-cta-btn"
                          onClick={() => setShowOrderModal(true)}
                        >
                          Ordenar Ahora
                        </button>
                      </div>

                      {/* Home indicator bar */}
                      <div className="phone-home-indicator" />
                    </div>
                  </div>

                  {/* Glass glare effect */}
                  <div className="phone-glare" />
                </div>

                {/* Floating dynamic shadow */}
                <div className="phone-shadow animate-shadow-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ¿QUÉ PUEDES HACER? */}
        <section className="pechugon-features-section">
          <div className="features-container">
            {/* Title with red underline */}
            <div className="section-title-wrap">
              <h2 className="section-title">
                ¿QUÉ PUEDES <span className="text-pechugon-red">HACER?</span>
              </h2>
              <div className="title-red-bar" />
            </div>

            {/* 6 Responsive Cards */}
            <div className="features-grid">
              {featureCards.map((card, idx) => (
                <article
                  key={card.id}
                  className="feature-card animate-card-entrance"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                  onClick={() => setSelectedFeature(card.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedFeature(card.id);
                    }
                  }}
                >
                  <div className="feature-icon-box">
                    {card.icon}
                  </div>
                  <h3 className="feature-card-title">{card.title}</h3>
                  <p className="feature-card-desc">{card.description}</p>
                  <span className="feature-card-action">Ver más →</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROMO BANNER / SWITCHER TO REPORTE COMERCIAL */}
        <section className="pechugon-report-banner">
          <div className="report-banner-inner">
            <div className="report-banner-text">
              <span className="report-badge">GESTIÓN Y ANALÍTICA</span>
              <h3>Panel de Indicadores y Reporte Semanal</h3>
              <p>
                Visualiza el rendimiento comercial de sucursales, productos más vendidos,
                evolución monetaria y los 29 indicadores clave de negocio de Pollo Pechugón.
              </p>
            </div>
            <button
              type="button"
              className="btn-go-to-report"
              onClick={() => {
                if (onSwitchView) onSwitchView("reporte");
                else if (onGoToReport) onGoToReport();
              }}
            >
              <span>📊 Abrir Reporte Comercial</span>
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="pechugon-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <Image
                src={brandLogo}
                alt="Pollo Pechugón"
                width={36}
                height={36}
                className="footer-logo-img"
              />
              <strong>POLLO PECHUGÓN ROSTICERÍAS</strong>
            </div>
            <p>El mejor pollo rostizado de México desde 1993. Sabor inconfundible.</p>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <button type="button" onClick={() => setSelectedFeature(2)}>Menú</button>
              <button type="button" onClick={() => setShowBranchModal(true)}>Sucursales</button>
              <button type="button" onClick={() => onSwitchView?.("reporte")}>Métricas</button>
              <button type="button" onClick={() => setSelectedFeature(1)}>Promociones</button>
            </div>
            <span className="footer-copy">
              © {new Date().getFullYear()} Pollo Pechugón. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      {selectedFeature !== null && (
        <div className="pechugon-modal-backdrop" onClick={() => setSelectedFeature(null)}>
          <div
            className="pechugon-modal-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedFeature(null)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-icon-badge">
                {featureCards.find((c) => c.id === selectedFeature)?.icon}
              </span>
              <h3>{featureCards.find((c) => c.id === selectedFeature)?.modalTitle}</h3>
            </div>
            <div className="modal-body">
              {featureCards.find((c) => c.id === selectedFeature)?.modalContent}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  setSelectedFeature(null);
                  setShowOrderModal(true);
                }}
              >
                Hacer Pedido Ahora
              </button>
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setSelectedFeature(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="pechugon-modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div
            className="pechugon-modal-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowOrderModal(false)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-icon-badge">🍗</span>
              <h3>¿Cómo deseas tu pedido?</h3>
            </div>
            <div className="modal-body">
              <p className="order-modal-sub">
                Selecciona tu ciudad y método de entrega para preparar tu pollo recién rostizado:
              </p>
              <div className="city-selector-wrap">
                <label htmlFor="city-select"><strong>Ciudad / Plaza:</strong></label>
                <select
                  id="city-select"
                  className="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="Querétaro">Querétaro (App Móvil & Sucursales)</option>
                  <option value="Villahermosa">Villahermosa (Rosticerías BD)</option>
                  <option value="Oaxaca">Oaxaca (Rosticerías BD)</option>
                  <option value="Puebla">Puebla</option>
                  <option value="Guadalajara">Guadalajara</option>
                </select>
              </div>

              <div className="order-options-grid">
                <div
                  className="order-option-card"
                  onClick={() => {
                    alert(`¡Excelente! Redirigiendo al catálogo para pedir a domicilio en ${selectedCity}.`);
                    setShowOrderModal(false);
                  }}
                >
                  <span className="order-opt-icon">🛵</span>
                  <strong>A Domicilio</strong>
                  <p>Llega caliente en aprox. 25 a 35 minutos.</p>
                </div>
                <div
                  className="order-option-card"
                  onClick={() => {
                    alert(`¡Listo! Tu pedido para recoger en ${selectedCity} estará listo en 15 minutos.`);
                    setShowOrderModal(false);
                  }}
                >
                  <span className="order-opt-icon">🛍️</span>
                  <strong>Para Recoger</strong>
                  <p>Pasa a la rosticería más cercana sin hacer filas.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="pechugon-modal-backdrop" onClick={() => setShowBranchModal(false)}>
          <div
            className="pechugon-modal-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowBranchModal(false)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-icon-badge">📍</span>
              <h3>Sucursales Pollo Pechugón</h3>
            </div>
            <div className="modal-body">
              <p className="branch-intro">
                Selecciona tu plaza para consultar el menú y ordenar:
              </p>
              <div className="plaza-pills">
                <span className="plaza-pill is-active">Querétaro (App Activa)</span>
                <span className="plaza-pill">Villahermosa</span>
                <span className="plaza-pill">Oaxaca</span>
                <span className="plaza-pill">Veracruz</span>
              </div>
              <div className="branch-list-sample">
                <div className="branch-sample-row">
                  <div>
                    <strong>Querétaro Plaza del Parque</strong>
                    <p>Av. Corregidora Norte 410 · 9:00 - 20:00 hrs</p>
                  </div>
                  <button className="branch-action-btn" type="button" onClick={() => { setShowBranchModal(false); setShowOrderModal(true); }}>Pedir</button>
                </div>
                <div className="branch-sample-row">
                  <div>
                    <strong>Querétaro Bernardo Quintana</strong>
                    <p>Calz. Bernardo Quintana 142 · 9:00 - 20:30 hrs</p>
                  </div>
                  <button className="branch-action-btn" type="button" onClick={() => { setShowBranchModal(false); setShowOrderModal(true); }}>Pedir</button>
                </div>
                <div className="branch-sample-row">
                  <div>
                    <strong>Villahermosa Tamulte</strong>
                    <p>Av. Gregorio Méndez Magaña · 9:00 - 19:30 hrs</p>
                  </div>
                  <button className="branch-action-btn" type="button" onClick={() => { setShowBranchModal(false); setShowOrderModal(true); }}>Pedir</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowBranchModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
