import './styles/variables.css';
import './styles/main.css';
import './styles/components.css';
import './styles/print.css';

import { store } from './store';
import { renderHeader, setupHeaderListeners, showToast, initTheme } from './components/header';
import { renderCityDataCard, setupCityDataListeners, syncCityDataInputsFromState } from './components/city-data';
import { renderStakeholderBar, setupStakeholderBarListeners, updateStakeholderBar } from './components/stakeholder-bar';
import { renderMeasuresCard, setupMeasuresListeners, updateMeasurePills, syncMeasuresInputsFromState } from './components/measures';
import { renderKpiDashboard, setupKpiDashboardListeners, updateKpiDashboard } from './components/kpi-cards';
import { renderChartComponent, setupChartListeners, updateChartSvg } from './components/chart';
import { renderTopMeasures, updateTopMeasuresTable } from './components/top-measures';
import { openReportingModal } from './components/reporting-modal';
import { openLegalModal } from './components/info-modals';

async function bootstrap() {
  // Initialize theme from saved preferences
  initTheme();

  const app = document.getElementById('app');
  if (!app) return;

  // Initial skeleton shell
  app.innerHTML = `
    <div class="app-container">
      <div id="header-root"></div>
      <main class="layout-grid">
        <div class="left-panel">
          <div id="city-data-root"></div>
          <div id="measures-root"></div>
        </div>
        <aside class="right-panel">
          <div id="dashboard-root"></div>
        </aside>
      </main>
    </div>
  `;

  // 1. Mount static header
  const headerRoot = document.getElementById('header-root');
  if (headerRoot) {
    headerRoot.innerHTML = renderHeader();
    setupHeaderListeners();
  }

  // 2. Mount Left Panel (City Data & Measures)
  const cityRoot = document.getElementById('city-data-root');
  if (cityRoot) {
    cityRoot.innerHTML = renderCityDataCard();
    setupCityDataListeners();
  }

  const measuresRoot = document.getElementById('measures-root');
  if (measuresRoot) {
    measuresRoot.innerHTML = renderMeasuresCard();
    setupMeasuresListeners();

    const stakeholderSlot = document.getElementById('stakeholder-bar-slot');
    if (stakeholderSlot) {
      stakeholderSlot.innerHTML = renderStakeholderBar();
      setupStakeholderBarListeners();
    }
  }

  // 3. Mount Right Panel (Dashboard, Chart, Top Measures)
  const dashboardRoot = document.getElementById('dashboard-root');
  if (dashboardRoot) {
    dashboardRoot.innerHTML = renderKpiDashboard();
    setupKpiDashboardListeners();

    const chartSlot = document.getElementById('chart-slot');
    if (chartSlot) {
      chartSlot.innerHTML = renderChartComponent();
      setupChartListeners();
    }

    const topSlot = document.getElementById('top-measures-slot');
    if (topSlot) {
      topSlot.innerHTML = renderTopMeasures();
    }

    // Right panel action buttons
    document.getElementById('btn-open-reporting')?.addEventListener('click', () => {
      openReportingModal();
    });

    document.getElementById('btn-share-link')?.addEventListener('click', () => {
      const url = store.getShareableUrl();
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 Simulations-Link in Zwischenablage kopiert');
      }).catch(() => {
        showToast('Link kopiert: ' + url);
      });
    });

    document.getElementById('btn-open-legal')?.addEventListener('click', () => {
      openLegalModal();
    });
  }

  // 4. Subscribe to reactive store (Only non-destructive DOM updates)
  store.subscribe(() => {
    updateDynamicUI();
  });

  // 5. Initialize WebAssembly engine
  await store.init();
}

/**
 * Non-destructive reactive update:
 * NEVER wipes out input DOM nodes or breaks pointer capture during slider drag!
 */
function updateDynamicUI() {
  // Scorecard numbers & subtext
  updateKpiDashboard();

  // SVG Chart & active tabs
  updateChartSvg();

  // Ranking table
  updateTopMeasuresTable();

  // Metric pills on individual measure cards
  updateMeasurePills();

  // Active highlighted sector button
  updateStakeholderBar();

  // Synchronize un-focused inputs (e.g. on preset resets or URL param changes)
  syncCityDataInputsFromState();
  syncMeasuresInputsFromState();
}

// Start application
bootstrap().catch(err => {
  console.error('Failed to initialize Klimarechner:', err);
});
