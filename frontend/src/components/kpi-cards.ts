import { StakeholderFilter, store } from '../store';

interface RunningAnim {
  rafId: number;
  currentVal: number;
}
const runningAnims = new WeakMap<HTMLElement, RunningAnim>();

export function renderKpiDashboard(): string {
  const out = store.getOutput();
  const filter = store.getFilter();
  const s = store.getState();
  const kpi = out?.kpis[filter] || {
    investTotalMio: 354,
    co2ReductionPercent: 111.2,
    co2ReductionTsdTonnes: 211,
    directEffectsMio: 740,
    indirectEffectsMio: 28,
    localTurnoverMio: 142,
    localJobs: 43,
  };

  const isAll = filter === 'all';

  return `
    <div class="results-card">
      <div class="results-header">
        <h3 style="font-size: var(--k-font-size-h3); font-weight: 700;">
          Effekte für
        </h3>
        <select id="select-sector-view" class="sector-select">
          <option value="all" ${filter === 'all' ? 'selected' : ''}>alle Sektoren</option>
          <option value="private" ${filter === 'private' ? 'selected' : ''}>Private Haushalte</option>
          <option value="ghd" ${filter === 'ghd' ? 'selected' : ''}>GHD & Industrie</option>
          <option value="kommune" ${filter === 'kommune' ? 'selected' : ''}>Kommune & Schulen</option>
        </select>
      </div>

      <!-- 2x2 Primary Scorecards with Animated IDs -->
      <div class="scorecard-grid">
        <div class="scorecard">
          <div class="scorecard-label">
            <span>Investitionen</span>
            <span title="Einmalige Gesamtinvestition across period">ⓘ</span>
          </div>
          <div class="scorecard-value" id="val-kpi-invest">
            ${Math.round(kpi.investTotalMio)} <span style="font-size: 1rem; font-weight: 600;">Mio €</span>
          </div>
          <div class="scorecard-sub" id="val-kpi-invest-sub">kumuliert bis ${s.endYear}</div>
        </div>

        <div class="scorecard">
          <div class="scorecard-label">
            <span>CO₂ Reduktion</span>
            <span title="Gesamte relative Treibhausgas-Minderung">ⓘ</span>
          </div>
          <div class="scorecard-value green" id="val-kpi-co2">
            ${kpi.co2ReductionPercent.toFixed(1)} <span style="font-size: 1.1rem; font-weight: 700;">%</span>
          </div>
          <div class="scorecard-sub" id="val-kpi-co2-sub">ca. ${kpi.co2ReductionTsdTonnes.toFixed(1)} tsd. t/a</div>
        </div>

        <div class="scorecard">
          <div class="scorecard-label">
            <span>Direkte Effekte</span>
            <span title="Vermiedene Energiekosten & Effizienzgewinne">ⓘ</span>
          </div>
          <div class="scorecard-value" id="val-kpi-direct">
            ${Math.round(kpi.directEffectsMio)} <span style="font-size: 1rem; font-weight: 600;">Mio €</span>
          </div>
          <div class="scorecard-sub">Netto-Geldeinsparungen</div>
        </div>

        <div class="scorecard">
          <div class="scorecard-label">
            <span>Indirekte Effekte</span>
            <span title="Gewerbesteuern, Einkommensteuern & Handwerksgewinne">ⓘ</span>
          </div>
          <div class="scorecard-value" id="val-kpi-indirect">
            ${Math.round(kpi.indirectEffectsMio)} <span style="font-size: 1rem; font-weight: 600;">Mio €</span>
          </div>
          <div class="scorecard-sub">kommunale Steuern & Erträge</div>
        </div>
      </div>

      <!-- Extra local economy stats (visible when 'all' selected) -->
      <div class="economy-stats-bar" id="economy-stats-bar" style="display: ${isAll ? 'flex' : 'none'};">
        <div>
          <div class="stat-item-val" id="val-kpi-turnover">${Math.round(kpi.localTurnoverMio)} Mio €</div>
          <div class="stat-item-lbl">Umsatz lokales Handwerk</div>
        </div>
        <div style="width: 1px; background: var(--k-color-section-border);"></div>
        <div>
          <div class="stat-item-val" id="val-kpi-jobs">+${kpi.localJobs} Jobs</div>
          <div class="stat-item-lbl">Lokale Arbeitsplätze/Jahr</div>
        </div>
      </div>

      <!-- Slot for Chart -->
      <div id="chart-slot"></div>

      <!-- Slot for Top Measures -->
      <div id="top-measures-slot"></div>

      <!-- Action Buttons -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
        <button id="btn-open-reporting" class="btn-primary-action">
          <span>Zum Reporting</span>
          <span>→</span>
        </button>

        <div class="action-links">
          <button id="btn-share-link" class="action-link" title="Link mit aktuellen Parametern kopieren">
            🔗 Link teilen
          </button>
          <button id="btn-open-legal" class="action-link">
            Impressum & Datenschutz
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Non-destructive update for KPI dashboard (numbers, subtext, sector dropdown, economy bar)
 */
export function updateKpiDashboard() {
  const out = store.getOutput();
  if (!out) return;
  const filter = store.getFilter();
  const kpi = out.kpis[filter];
  if (!kpi) return;
  const s = store.getState();

  // 1. Smooth ticker for numeric scorecards
  animateKpiNumbers();

  // 2. Subtext updates
  const elCo2Sub = document.getElementById('val-kpi-co2-sub');
  if (elCo2Sub) {
    elCo2Sub.textContent = `ca. ${kpi.co2ReductionTsdTonnes.toFixed(1)} tsd. t/a`;
  }

  const elInvestSub = document.getElementById('val-kpi-invest-sub');
  if (elInvestSub) {
    elInvestSub.textContent = `kumuliert bis ${s.endYear}`;
  }

  // 3. Keep select sector synced if changed from outside
  const select = document.getElementById('select-sector-view') as HTMLSelectElement | null;
  if (select && document.activeElement !== select && select.value !== filter) {
    select.value = filter;
  }

  // 4. Economy stats bar visibility
  const statsBar = document.getElementById('economy-stats-bar');
  if (statsBar) {
    statsBar.style.display = filter === 'all' ? 'flex' : 'none';
  }
}

/**
 * Smoothly interpolates and ticks numbers as calculations update
 */
export function animateKpiNumbers() {
  const out = store.getOutput();
  if (!out) return;
  const filter = store.getFilter();
  const kpi = out.kpis[filter];
  if (!kpi) return;

  const elInvest = document.getElementById('val-kpi-invest');
  const elCo2 = document.getElementById('val-kpi-co2');
  const elDirect = document.getElementById('val-kpi-direct');
  const elIndirect = document.getElementById('val-kpi-indirect');
  const elTurnover = document.getElementById('val-kpi-turnover');
  const elJobs = document.getElementById('val-kpi-jobs');

  const duration = 160;

  if (elInvest) {
    animateValue(elInvest, kpi.investTotalMio, duration, 0, '<span style="font-size: 1rem; font-weight: 600;">Mio €</span>');
  }
  if (elCo2) {
    animateValue(elCo2, kpi.co2ReductionPercent, duration, 1, '<span style="font-size: 1.1rem; font-weight: 700;">%</span>');
  }
  if (elDirect) {
    animateValue(elDirect, kpi.directEffectsMio, duration, 0, '<span style="font-size: 1rem; font-weight: 600;">Mio €</span>');
  }
  if (elIndirect) {
    animateValue(elIndirect, kpi.indirectEffectsMio, duration, 0, '<span style="font-size: 1rem; font-weight: 600;">Mio €</span>');
  }
  if (elTurnover) {
    animateValue(elTurnover, kpi.localTurnoverMio, duration, 0, 'Mio €');
  }
  if (elJobs) {
    animateValue(elJobs, kpi.localJobs, duration, 0, 'Jobs', '+');
  }
}

function animateValue(
  el: HTMLElement,
  end: number,
  durationMs: number,
  decimals: number,
  suffixHtml: string,
  prefix: string = ''
) {
  const existing = runningAnims.get(el);
  const start = existing ? existing.currentVal : end;
  if (existing) {
    cancelAnimationFrame(existing.rafId);
  }

  if (Math.abs(start - end) < 0.001) {
    const formatted = decimals > 0 ? end.toFixed(decimals) : Math.round(end).toString();
    el.innerHTML = `${prefix}${formatted} ${suffixHtml}`;
    runningAnims.set(el, { rafId: 0, currentVal: end });
    return;
  }

  const startTime = performance.now();
  const anim: RunningAnim = { rafId: 0, currentVal: start };
  runningAnims.set(el, anim);

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    // Smooth easeOutQuad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = start + (end - start) * eased;
    anim.currentVal = current;

    const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
    el.innerHTML = `${prefix}${formatted} ${suffixHtml}`;

    if (progress < 1) {
      anim.rafId = requestAnimationFrame(tick);
    }
  }

  anim.rafId = requestAnimationFrame(tick);
}

export function setupKpiDashboardListeners() {
  document.getElementById('select-sector-view')?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value as StakeholderFilter;
    store.setFilter(val);
  });
}
