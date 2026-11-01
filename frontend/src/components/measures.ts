import { store } from '../store';
import { computeScaledBaselines, createDefaultState, ScaledBaselines, CityBaseline } from '../baseline-data';
import { MeasurePillMetric } from '../wasm-engine';

export function renderPillsContent(pm?: MeasurePillMetric): string {
  if (!pm) return '';
  return `
    <div class="pills-container">
      <span class="metric-pill highlight" title="Jährliche CO₂-Reduktion">${pm.co2ReductionPct.toFixed(1)} %/a CO₂</span>
      <span class="metric-pill" title="Eingesparte Tonnen">${pm.co2ReductionTsdTo.toFixed(1)} tsd. t/a</span>
      <span class="metric-pill" title="Einmaliges Investitionsvolumen">${pm.investMio.toFixed(1)} Mio € Invest</span>
      <span class="metric-pill" title="Kosten bzw. Ersparnis je eingesparter Tonne CO₂">${pm.costPerTonCO2.toFixed(1)} €/t CO₂</span>
      <span class="metric-pill" title="Jährliche laufende Einsparungen">${pm.directEffectMioYear.toFixed(1)} Mio €/a</span>
      ${pm.roiPct > 0 ? `<span class="metric-pill" title="Jährliche Rendite">${pm.roiPct.toFixed(1)} % Rendite</span>` : ''}
      ${pm.breakEvenYear !== '—' ? `<span class="metric-pill" title="Amortisationsjahr">${pm.breakEvenYear} Break-Even</span>` : ''}
    </div>
  `;
}

export interface MeasureBounds {
  isReduction: boolean;
  sectors: {
    priv?: { base: number; max: number; isInt?: boolean };
    ghd?: { base: number; max: number; isInt?: boolean };
    kom?: { base: number; max: number; isInt?: boolean };
  };
}

export function getMeasureBounds(measureKey: string, scaled: ScaledBaselines): MeasureBounds {
  switch (measureKey) {
    case 'heatDmd':
      return {
        isReduction: true,
        sectors: {
          priv: { base: scaled.buildings.heatDmdBase.private, max: 35, isInt: true },
          ghd: { base: scaled.buildings.heatDmdBase.ghd, max: 30, isInt: true },
          kom: { base: scaled.buildings.heatDmdBase.kommune, max: 30, isInt: true },
        },
      };
    case 'gasPhaseout':
      return {
        isReduction: true,
        sectors: {
          priv: { base: scaled.buildings.gasAreaBase.private, max: 0, isInt: true },
          ghd: { base: scaled.buildings.gasAreaBase.ghd, max: 0, isInt: true },
          kom: { base: scaled.buildings.gasAreaBase.kommune, max: 0, isInt: true },
        },
      };
    case 'oilPhaseout':
      return {
        isReduction: true,
        sectors: {
          priv: { base: scaled.buildings.oilAreaBase.private, max: 0, isInt: true },
          ghd: { base: scaled.buildings.oilAreaBase.ghd, max: 0, isInt: true },
          kom: { base: scaled.buildings.oilAreaBase.kommune, max: 0, isInt: true },
        },
      };
    case 'pvRoof':
      return {
        isReduction: false,
        sectors: {
          priv: { base: scaled.energy.pvRoofBase.private, max: 35.0 * scaled.popScale },
          ghd: { base: scaled.energy.pvRoofBase.ghd, max: 45.0 * scaled.popScale },
          kom: { base: scaled.energy.pvRoofBase.kommune, max: 3.0 * scaled.popScale },
        },
      };
    case 'pvOpen':
      return {
        isReduction: false,
        sectors: {
          ghd: { base: scaled.energy.pvOpenBase.ghd, max: 100.0 * scaled.popScale },
          kom: { base: scaled.energy.pvOpenBase.kommune, max: 80.0 * scaled.popScale },
        },
      };
    case 'wind':
      return {
        isReduction: false,
        sectors: {
          ghd: { base: scaled.energy.windBase.ghd, max: 250.0 * scaled.popScale },
          kom: { base: scaled.energy.windBase.kommune, max: 40.0 * scaled.popScale },
        },
      };
    case 'greenPower':
      return {
        isReduction: false,
        sectors: {
          priv: { base: scaled.energy.greenPowerBase.private, max: 180.0 * scaled.popScale },
          ghd: { base: scaled.energy.greenPowerBase.ghd, max: 110.0 * scaled.popScale },
          kom: { base: scaled.energy.greenPowerBase.kommune, max: 7.0 * scaled.popScale },
        },
      };
    case 'evCars':
      return {
        isReduction: false,
        sectors: {
          priv: { base: scaled.mobility.evCountBase.private, max: scaled.mobility.carsCountBase.private },
          ghd: { base: scaled.mobility.evCountBase.ghd, max: scaled.mobility.carsCountBase.ghd },
          kom: { base: scaled.mobility.evCountBase.kommune, max: scaled.mobility.carsCountBase.kommune },
        },
      };
    case 'transitShare':
      return {
        isReduction: false,
        sectors: {
          priv: { base: scaled.mobility.transitShareBase.private, max: 40.0 },
          ghd: { base: scaled.mobility.transitShareBase.ghd, max: 40.0 },
          kom: { base: scaled.mobility.transitShareBase.kommune, max: 60.0 },
        },
      };
    case 'bikeShare':
      return {
        isReduction: false,
        sectors: {
          priv: { base: scaled.mobility.bikeShareBase.private, max: 25.0 },
          ghd: { base: scaled.mobility.bikeShareBase.ghd, max: 25.0 },
          kom: { base: scaled.mobility.bikeShareBase.kommune, max: 30.0 },
        },
      };
    default:
      return { isReduction: false, sectors: {} };
  }
}

export function computeMeasurePercentage(measureKey: string, s: CityBaseline): number {
  const scaled = computeScaledBaselines(s.population);
  const bounds = getMeasureBounds(measureKey, scaled);
  const m = s.measures as any;
  const current = m[measureKey];
  if (!current) return 0;

  const sec = bounds.sectors.priv || bounds.sectors.ghd;
  if (!sec) return 0;

  const currentVal = bounds.sectors.priv ? current.targetPrivate : current.targetGHD;
  const range = sec.max - sec.base;
  if (Math.abs(range) < 0.001) return 0;

  const pct = ((currentVal - sec.base) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function applyMeasurePercentage(measureKey: string, pct: number, s: CityBaseline) {
  const scaled = computeScaledBaselines(s.population);
  const bounds = getMeasureBounds(measureKey, scaled);
  const m = s.measures as any;
  const current = m[measureKey];
  if (!current) return;

  const calcTarget = (sec?: { base: number; max: number; isInt?: boolean }) => {
    if (!sec) return 0;
    const raw = sec.base + (pct / 100) * (sec.max - sec.base);
    return sec.isInt ? Math.round(raw) : Math.round(raw * 10) / 10;
  };

  if (bounds.sectors.priv) current.targetPrivate = calcTarget(bounds.sectors.priv);
  if (bounds.sectors.ghd) current.targetGHD = calcTarget(bounds.sectors.ghd);
  if (bounds.sectors.kom) current.targetKommune = calcTarget(bounds.sectors.kom);
}

function renderMeasureSliderHtml(
  key: string,
  pct: number,
  enabled: boolean
): string {
  const label = pct === 0 ? '0% (Keine Änderung)' : pct === 100 ? '100% (Maximal möglich)' : `${pct}% umgesetzt`;
  return `
    <div class="measure-slider-box ${!enabled ? 'disabled' : ''}" id="slider-box-${key}">
      <div class="measure-slider-top">
        <span class="slider-bound-label">0 Änderung</span>
        <span class="slider-pct-badge" id="badge-pct-${key}">${label}</span>
        <span class="slider-bound-label">Maximal möglich</span>
      </div>
      <input
        type="range"
        id="slider-measure-${key}"
        class="range-slider measure-slider"
        min="0"
        max="100"
        step="1"
        value="${pct}"
        style="--slider-progress: ${pct}%;"
        ${!enabled ? 'disabled' : ''}
      />
    </div>
  `;
}

export function renderMeasuresCard(): string {
  const s = store.getState();
  const m = s.measures;
  const scaled = computeScaledBaselines(s.population);
  const out = store.getOutput();
  const metrics = out?.measureMetrics || {};

  return `
    <section class="card" id="card-measures">
      <div class="card-header">
        <h2 class="card-title">Klimamaßnahmen</h2>
        <button id="btn-reset-measures" class="action-link" style="color: var(--k-color-secondary-base); font-weight: 600;">
          ↺ Maßnahmen zurücksetzen
        </button>
      </div>
      <p class="card-subtitle">
        Für jeden Bereich wird eine Vielzahl an Anpassungen, Umrüstungen und Innovation berechnet. Nach Verfassungsrecht sind Klimaschutzmaßnahmen nach den Grenzwerten des Pariser Klimaabkommens auszurichten.
      </p>

      <!-- Stakeholder Equation Slot -->
      <div id="stakeholder-bar-slot"></div>

      <!-- SECTOR 1: GEBÄUDEWÄRME -->
      <div class="sector-container">
        <div class="sector-header sector-buildings">
          <span>🏡 Gebäudewärme & Gebäudehülle</span>
        </div>
        <div class="sector-grid">
          <!-- Measure 1: Heizbedarf senken -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-heat-dmd" ${m.heatDmd.enabled ? 'checked' : ''} />
                Heizbedarf senken ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('heatDmd', computeMeasurePercentage('heatDmd', s), m.heatDmd.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.private} auf</span>
                <input type="number" id="inp-hd-priv" class="mini-input" value="${m.heatDmd.targetPrivate}" />
                <span>kWh / (m² · a)</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.ghd} auf</span>
                <input type="number" id="inp-hd-ghd" class="mini-input" value="${m.heatDmd.targetGHD}" />
                <span>kWh / (m² · a)</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.kommune} auf</span>
                <input type="number" id="inp-hd-kom" class="mini-input" value="${m.heatDmd.targetKommune}" />
                <span>kWh / (m² · a)</span>
              </div>
            </div>
            <div id="pills-heatDmd">${renderPillsContent(metrics.heatDmd)}</div>
          </div>

          <!-- Measure 2: Gasheizungen ersetzen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-gas" ${m.gasPhaseout.enabled ? 'checked' : ''} />
                Gasheizungen ersetzen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('gasPhaseout', computeMeasurePercentage('gasPhaseout', s), m.gasPhaseout.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.private.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-priv" class="mini-input" value="${m.gasPhaseout.targetPrivate}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--k-color-text-muted); display: flex; justify-content: space-between; margin: 4px 0 8px 0;">
              <span>WP: ${m.gasPhaseout.subWpPrivate}%</span>
              <span>Fernwärme: ${m.gasPhaseout.subFwPrivate}%</span>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.ghd.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-ghd" class="mini-input" value="${m.gasPhaseout.targetGHD}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.kommune.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-kom" class="mini-input" value="${m.gasPhaseout.targetKommune}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div id="pills-gasPhaseout">${renderPillsContent(metrics.gasPhaseout)}</div>
          </div>

          <!-- Measure 3: Ölheizungen ersetzen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-oil" ${m.oilPhaseout.enabled ? 'checked' : ''} />
                Ölheizungen ersetzen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('oilPhaseout', computeMeasurePercentage('oilPhaseout', s), m.oilPhaseout.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.private.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-priv" class="mini-input" value="${m.oilPhaseout.targetPrivate}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.ghd.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-ghd" class="mini-input" value="${m.oilPhaseout.targetGHD}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.kommune.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-kom" class="mini-input" value="${m.oilPhaseout.targetKommune}" />
                <span>1.000 m²</span>
              </div>
            </div>
            <div id="pills-oilPhaseout">${renderPillsContent(metrics.oilPhaseout)}</div>
          </div>
        </div>
      </div>

      <!-- SECTOR 2: STROM -->
      <div class="sector-container">
        <div class="sector-header sector-energy">
          <span>⚡ Strom & Erneuerbare Energien</span>
        </div>
        <div class="sector-grid">
          <!-- PV-Dach -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-pv-roof" ${m.pvRoof.enabled ? 'checked' : ''} />
                PV-Dach ausbauen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('pvRoof', computeMeasurePercentage('pvRoof', s), m.pvRoof.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.pvRoofBase.private.toFixed(1)} auf</span>
                <input type="number" id="inp-pvr-priv" class="mini-input" step="0.5" value="${m.pvRoof.targetPrivate}" />
                <span>MWp</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.pvRoofBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-pvr-ghd" class="mini-input" step="0.5" value="${m.pvRoof.targetGHD}" />
                <span>MWp</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.pvRoofBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-pvr-kom" class="mini-input" step="0.1" value="${m.pvRoof.targetKommune}" />
                <span>MWp</span>
              </div>
            </div>
            <div id="pills-pvRoof">${renderPillsContent(metrics.pvRoof)}</div>
          </div>

          <!-- PV-Freifläche -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-pv-open" ${m.pvOpen.enabled ? 'checked' : ''} />
                PV-Freifläche ausbauen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('pvOpen', computeMeasurePercentage('pvOpen', s), m.pvOpen.enabled)}
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.pvOpenBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-pvo-ghd" class="mini-input" step="5" value="${m.pvOpen.targetGHD}" />
                <span>ha</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.pvOpenBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-pvo-kom" class="mini-input" step="5" value="${m.pvOpen.targetKommune}" />
                <span>ha</span>
              </div>
            </div>
            <div id="pills-pvOpen">${renderPillsContent(metrics.pvOpen)}</div>
          </div>

          <!-- Windenergie -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-wind" ${m.wind.enabled ? 'checked' : ''} />
                Windenergie ausbauen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('wind', computeMeasurePercentage('wind', s), m.wind.enabled)}
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.windBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-wnd-ghd" class="mini-input" step="5" value="${m.wind.targetGHD}" />
                <span>ha</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.windBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-wnd-kom" class="mini-input" step="5" value="${m.wind.targetKommune}" />
                <span>ha</span>
              </div>
            </div>
            <div id="pills-wind">${renderPillsContent(metrics.wind)}</div>
          </div>

          <!-- Zukauf erneuerbare Energien -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-green-power" ${m.greenPower.enabled ? 'checked' : ''} />
                Zukauf Ökostrom erhöhen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('greenPower', computeMeasurePercentage('greenPower', s), m.greenPower.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.private.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-priv" class="mini-input" step="5" value="${m.greenPower.targetPrivate}" />
                <span>GWh / a</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-ghd" class="mini-input" step="5" value="${m.greenPower.targetGHD}" />
                <span>GWh / a</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-kom" class="mini-input" step="0.5" value="${m.greenPower.targetKommune}" />
                <span>GWh / a</span>
              </div>
            </div>
            <div id="pills-greenPower">${renderPillsContent(metrics.greenPower)}</div>
          </div>
        </div>
      </div>

      <!-- SECTOR 3: MOBILITÄT -->
      <div class="sector-container">
        <div class="sector-header sector-mobility">
          <span>🚗 Mobilität & Verkehr</span>
        </div>
        <div class="sector-grid">
          <!-- PKW mit E-Autos ersetzen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-ev" ${m.evCars.enabled ? 'checked' : ''} />
                PKW mit E-Autos ersetzen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('evCars', computeMeasurePercentage('evCars', s), m.evCars.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.private.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-priv" class="mini-input" step="0.5" value="${m.evCars.targetPrivate}" />
                <span>1.000 Pkw</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-ghd" class="mini-input" step="0.2" value="${m.evCars.targetGHD}" />
                <span>1.000 Pkw</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-kom" class="mini-input" step="0.1" value="${m.evCars.targetKommune}" />
                <span>1.000 Pkw</span>
              </div>
            </div>
            <div id="pills-evCars">${renderPillsContent(metrics.evCars)}</div>
          </div>

          <!-- Anteil Zug/Bus erhöhen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-pt" ${m.transitShare.enabled ? 'checked' : ''} />
                Anteil Zug/Bus erhöhen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('transitShare', computeMeasurePercentage('transitShare', s), m.transitShare.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von 14,5 auf</span>
                <input type="number" id="inp-pt-priv" class="mini-input" step="1" value="${m.transitShare.targetPrivate}" />
                <span>%</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von 14,5 auf</span>
                <input type="number" id="inp-pt-ghd" class="mini-input" step="1" value="${m.transitShare.targetGHD}" />
                <span>%</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von 29,0 auf</span>
                <input type="number" id="inp-pt-kom" class="mini-input" step="1" value="${m.transitShare.targetKommune}" />
                <span>%</span>
              </div>
            </div>
            <div id="pills-transitShare">${renderPillsContent(metrics.transitShare)}</div>
          </div>

          <!-- Anteil Fahrrad erhöhen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-bike" ${m.bikeShare.enabled ? 'checked' : ''} />
                Anteil Fahrrad erhöhen ⓘ
              </label>
            </div>
            ${renderMeasureSliderHtml('bikeShare', computeMeasurePercentage('bikeShare', s), m.bikeShare.enabled)}
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von 3,2 auf</span>
                <input type="number" id="inp-bk-priv" class="mini-input" step="0.5" value="${m.bikeShare.targetPrivate}" />
                <span>%</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von 3,2 auf</span>
                <input type="number" id="inp-bk-ghd" class="mini-input" step="0.5" value="${m.bikeShare.targetGHD}" />
                <span>%</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von 6,4 auf</span>
                <input type="number" id="inp-bk-kom" class="mini-input" step="0.5" value="${m.bikeShare.targetKommune}" />
                <span>%</span>
              </div>
            </div>
            <div id="pills-bikeShare">${renderPillsContent(metrics.bikeShare)}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function updateMeasurePills() {
  const out = store.getOutput();
  if (!out) return;
  const metrics = out.measureMetrics || {};

  const setHtml = (id: string, pm?: MeasurePillMetric) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderPillsContent(pm);
  };

  setHtml('pills-heatDmd', metrics.heatDmd);
  setHtml('pills-gasPhaseout', metrics.gasPhaseout);
  setHtml('pills-oilPhaseout', metrics.oilPhaseout);
  setHtml('pills-pvRoof', metrics.pvRoof);
  setHtml('pills-pvOpen', metrics.pvOpen);
  setHtml('pills-wind', metrics.wind);
  setHtml('pills-greenPower', metrics.greenPower);
  setHtml('pills-evCars', metrics.evCars);
  setHtml('pills-transitShare', metrics.transitShare);
  setHtml('pills-bikeShare', metrics.bikeShare);
}

function syncSingleMeasureSlider(key: string) {
  const s = store.getState();
  const m = s.measures as any;
  const current = m[key];
  if (!current) return;

  const pct = computeMeasurePercentage(key, s);
  const slider = document.getElementById(`slider-measure-${key}`) as HTMLInputElement | null;
  const badge = document.getElementById(`badge-pct-${key}`);
  const box = document.getElementById(`slider-box-${key}`);

  if (slider && document.activeElement !== slider) {
    slider.value = pct.toString();
    slider.style.setProperty('--slider-progress', `${pct}%`);
    slider.disabled = !current.enabled;
  }
  if (box) {
    box.classList.toggle('disabled', !current.enabled);
  }
  if (badge) {
    badge.textContent = pct === 0 ? '0% (Keine Änderung)' : pct === 100 ? '100% (Maximal möglich)' : `${pct}% umgesetzt`;
  }
}

export function syncMeasuresInputsFromState() {
  const s = store.getState();
  const m = s.measures;

  const setChk = (id: string, val: boolean) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el && document.activeElement !== el) el.checked = val;
  };
  const setNum = (id: string, val: number) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el && document.activeElement !== el) el.value = val.toString();
  };

  setChk('chk-heat-dmd', m.heatDmd.enabled);
  setNum('inp-hd-priv', m.heatDmd.targetPrivate);
  setNum('inp-hd-ghd', m.heatDmd.targetGHD);
  setNum('inp-hd-kom', m.heatDmd.targetKommune);

  setChk('chk-gas', m.gasPhaseout.enabled);
  setNum('inp-gas-priv', m.gasPhaseout.targetPrivate);
  setNum('inp-gas-ghd', m.gasPhaseout.targetGHD);
  setNum('inp-gas-kom', m.gasPhaseout.targetKommune);

  setChk('chk-oil', m.oilPhaseout.enabled);
  setNum('inp-oil-priv', m.oilPhaseout.targetPrivate);
  setNum('inp-oil-ghd', m.oilPhaseout.targetGHD);
  setNum('inp-oil-kom', m.oilPhaseout.targetKommune);

  setChk('chk-pv-roof', m.pvRoof.enabled);
  setNum('inp-pvr-priv', m.pvRoof.targetPrivate);
  setNum('inp-pvr-ghd', m.pvRoof.targetGHD);
  setNum('inp-pvr-kom', m.pvRoof.targetKommune);

  setChk('chk-pv-open', m.pvOpen.enabled);
  setNum('inp-pvo-ghd', m.pvOpen.targetGHD);
  setNum('inp-pvo-kom', m.pvOpen.targetKommune);

  setChk('chk-wind', m.wind.enabled);
  setNum('inp-wnd-ghd', m.wind.targetGHD);
  setNum('inp-wnd-kom', m.wind.targetKommune);

  setChk('chk-green-power', m.greenPower.enabled);
  setNum('inp-gp-priv', m.greenPower.targetPrivate);
  setNum('inp-gp-ghd', m.greenPower.targetGHD);
  setNum('inp-gp-kom', m.greenPower.targetKommune);

  setChk('chk-ev', m.evCars.enabled);
  setNum('inp-ev-priv', m.evCars.targetPrivate);
  setNum('inp-ev-ghd', m.evCars.targetGHD);
  setNum('inp-ev-kom', m.evCars.targetKommune);

  setChk('chk-pt', m.transitShare.enabled);
  setNum('inp-pt-priv', m.transitShare.targetPrivate);
  setNum('inp-pt-ghd', m.transitShare.targetGHD);
  setNum('inp-pt-kom', m.transitShare.targetKommune);

  setChk('chk-bike', m.bikeShare.enabled);
  setNum('inp-bk-priv', m.bikeShare.targetPrivate);
  setNum('inp-bk-ghd', m.bikeShare.targetGHD);
  setNum('inp-bk-kom', m.bikeShare.targetKommune);

  // Sync all sliders
  [
    'heatDmd', 'gasPhaseout', 'oilPhaseout',
    'pvRoof', 'pvOpen', 'wind', 'greenPower',
    'evCars', 'transitShare', 'bikeShare'
  ].forEach(syncSingleMeasureSlider);
}

export function setupMeasuresListeners() {
  const numVal = (id: string) => Number((document.getElementById(id) as HTMLInputElement)?.value) || 0;
  const chkVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked ?? true;

  const bind = (id: string, updater: () => void) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updater);
      el.addEventListener('change', updater);
    }
  };

  // Reset measures button
  document.getElementById('btn-reset-measures')?.addEventListener('click', () => {
    store.updateState(s => {
      s.measures = createDefaultState().measures;
    });
    syncMeasuresInputsFromState();
  });

  // Slider binder helper
  const bindSlider = (
    key: string,
    chkId: string,
    inputIds: (string | null)[]
  ) => {
    const slider = document.getElementById(`slider-measure-${key}`) as HTMLInputElement | null;
    const badge = document.getElementById(`badge-pct-${key}`);
    const chk = document.getElementById(chkId) as HTMLInputElement | null;
    const box = document.getElementById(`slider-box-${key}`);

    if (slider) {
      slider.addEventListener('input', () => {
        const pct = Number(slider.value);
        slider.style.setProperty('--slider-progress', `${pct}%`);
        if (badge) {
          badge.textContent = pct === 0 ? '0% (Keine Änderung)' : pct === 100 ? '100% (Maximal möglich)' : `${pct}% umgesetzt`;
        }

        // Auto-enable measure if user moves slider > 0
        if (chk && !chk.checked && pct > 0) {
          chk.checked = true;
          box?.classList.remove('disabled');
          slider.disabled = false;
        }

        store.updateState(s => {
          const m = s.measures as any;
          if (m[key]) {
            m[key].enabled = chk ? chk.checked : true;
            applyMeasurePercentage(key, pct, s);
          }
        });

        // Sync numeric input fields in DOM
        const s = store.getState();
        const m = s.measures as any;
        const current = m[key];
        if (current) {
          if (inputIds[0]) {
            const el = document.getElementById(inputIds[0]!) as HTMLInputElement | null;
            if (el && document.activeElement !== el) el.value = current.targetPrivate?.toString() ?? '';
          }
          if (inputIds[1]) {
            const el = document.getElementById(inputIds[1]!) as HTMLInputElement | null;
            if (el && document.activeElement !== el) el.value = current.targetGHD?.toString() ?? '';
          }
          if (inputIds[2]) {
            const el = document.getElementById(inputIds[2]!) as HTMLInputElement | null;
            if (el && document.activeElement !== el) el.value = current.targetKommune?.toString() ?? '';
          }
        }
      });
    }

    if (chk) {
      chk.addEventListener('change', () => {
        const isEnabled = chk.checked;
        box?.classList.toggle('disabled', !isEnabled);
        if (slider) slider.disabled = !isEnabled;
        store.updateState(s => {
          (s.measures as any)[key].enabled = isEnabled;
        });
      });
    }
  };

  // Bind all 10 Measure Sliders
  bindSlider('heatDmd', 'chk-heat-dmd', ['inp-hd-priv', 'inp-hd-ghd', 'inp-hd-kom']);
  bindSlider('gasPhaseout', 'chk-gas', ['inp-gas-priv', 'inp-gas-ghd', 'inp-gas-kom']);
  bindSlider('oilPhaseout', 'chk-oil', ['inp-oil-priv', 'inp-oil-ghd', 'inp-oil-kom']);
  bindSlider('pvRoof', 'chk-pv-roof', ['inp-pvr-priv', 'inp-pvr-ghd', 'inp-pvr-kom']);
  bindSlider('pvOpen', 'chk-pv-open', [null, 'inp-pvo-ghd', 'inp-pvo-kom']);
  bindSlider('wind', 'chk-wind', [null, 'inp-wnd-ghd', 'inp-wnd-kom']);
  bindSlider('greenPower', 'chk-green-power', ['inp-gp-priv', 'inp-gp-ghd', 'inp-gp-kom']);
  bindSlider('evCars', 'chk-ev', ['inp-ev-priv', 'inp-ev-ghd', 'inp-ev-kom']);
  bindSlider('transitShare', 'chk-pt', ['inp-pt-priv', 'inp-pt-ghd', 'inp-pt-kom']);
  bindSlider('bikeShare', 'chk-bike', ['inp-bk-priv', 'inp-bk-ghd', 'inp-bk-kom']);

  // Direct Numeric Input Handlers (also sync sliders)
  // Heat Demand
  const updateHd = () => {
    store.updateState(s => {
      s.measures.heatDmd.enabled = chkVal('chk-heat-dmd');
      s.measures.heatDmd.targetPrivate = numVal('inp-hd-priv');
      s.measures.heatDmd.targetGHD = numVal('inp-hd-ghd');
      s.measures.heatDmd.targetKommune = numVal('inp-hd-kom');
    });
    syncSingleMeasureSlider('heatDmd');
  };
  ['inp-hd-priv', 'inp-hd-ghd', 'inp-hd-kom'].forEach(id => bind(id, updateHd));

  // Gas
  const updateGas = () => {
    store.updateState(s => {
      s.measures.gasPhaseout.enabled = chkVal('chk-gas');
      s.measures.gasPhaseout.targetPrivate = numVal('inp-gas-priv');
      s.measures.gasPhaseout.targetGHD = numVal('inp-gas-ghd');
      s.measures.gasPhaseout.targetKommune = numVal('inp-gas-kom');
    });
    syncSingleMeasureSlider('gasPhaseout');
  };
  ['inp-gas-priv', 'inp-gas-ghd', 'inp-gas-kom'].forEach(id => bind(id, updateGas));

  // Oil
  const updateOil = () => {
    store.updateState(s => {
      s.measures.oilPhaseout.enabled = chkVal('chk-oil');
      s.measures.oilPhaseout.targetPrivate = numVal('inp-oil-priv');
      s.measures.oilPhaseout.targetGHD = numVal('inp-oil-ghd');
      s.measures.oilPhaseout.targetKommune = numVal('inp-oil-kom');
    });
    syncSingleMeasureSlider('oilPhaseout');
  };
  ['inp-oil-priv', 'inp-oil-ghd', 'inp-oil-kom'].forEach(id => bind(id, updateOil));

  // PV Roof
  const updatePvR = () => {
    store.updateState(s => {
      s.measures.pvRoof.enabled = chkVal('chk-pv-roof');
      s.measures.pvRoof.targetPrivate = numVal('inp-pvr-priv');
      s.measures.pvRoof.targetGHD = numVal('inp-pvr-ghd');
      s.measures.pvRoof.targetKommune = numVal('inp-pvr-kom');
    });
    syncSingleMeasureSlider('pvRoof');
  };
  ['inp-pvr-priv', 'inp-pvr-ghd', 'inp-pvr-kom'].forEach(id => bind(id, updatePvR));

  // PV Open
  const updatePvO = () => {
    store.updateState(s => {
      s.measures.pvOpen.enabled = chkVal('chk-pv-open');
      s.measures.pvOpen.targetGHD = numVal('inp-pvo-ghd');
      s.measures.pvOpen.targetKommune = numVal('inp-pvo-kom');
    });
    syncSingleMeasureSlider('pvOpen');
  };
  ['inp-pvo-ghd', 'inp-pvo-kom'].forEach(id => bind(id, updatePvO));

  // Wind
  const updateWnd = () => {
    store.updateState(s => {
      s.measures.wind.enabled = chkVal('chk-wind');
      s.measures.wind.targetGHD = numVal('inp-wnd-ghd');
      s.measures.wind.targetKommune = numVal('inp-wnd-kom');
    });
    syncSingleMeasureSlider('wind');
  };
  ['inp-wnd-ghd', 'inp-wnd-kom'].forEach(id => bind(id, updateWnd));

  // Green Power
  const updateGp = () => {
    store.updateState(s => {
      s.measures.greenPower.enabled = chkVal('chk-green-power');
      s.measures.greenPower.targetPrivate = numVal('inp-gp-priv');
      s.measures.greenPower.targetGHD = numVal('inp-gp-ghd');
      s.measures.greenPower.targetKommune = numVal('inp-gp-kom');
    });
    syncSingleMeasureSlider('greenPower');
  };
  ['inp-gp-priv', 'inp-gp-ghd', 'inp-gp-kom'].forEach(id => bind(id, updateGp));

  // EV
  const updateEv = () => {
    store.updateState(s => {
      s.measures.evCars.enabled = chkVal('chk-ev');
      s.measures.evCars.targetPrivate = numVal('inp-ev-priv');
      s.measures.evCars.targetGHD = numVal('inp-ev-ghd');
      s.measures.evCars.targetKommune = numVal('inp-ev-kom');
    });
    syncSingleMeasureSlider('evCars');
  };
  ['inp-ev-priv', 'inp-ev-ghd', 'inp-ev-kom'].forEach(id => bind(id, updateEv));

  // Public Transit
  const updatePt = () => {
    store.updateState(s => {
      s.measures.transitShare.enabled = chkVal('chk-pt');
      s.measures.transitShare.targetPrivate = numVal('inp-pt-priv');
      s.measures.transitShare.targetGHD = numVal('inp-pt-ghd');
      s.measures.transitShare.targetKommune = numVal('inp-pt-kom');
    });
    syncSingleMeasureSlider('transitShare');
  };
  ['inp-pt-priv', 'inp-pt-ghd', 'inp-pt-kom'].forEach(id => bind(id, updatePt));

  // Bike
  const updateBk = () => {
    store.updateState(s => {
      s.measures.bikeShare.enabled = chkVal('chk-bike');
      s.measures.bikeShare.targetPrivate = numVal('inp-bk-priv');
      s.measures.bikeShare.targetGHD = numVal('inp-bk-ghd');
      s.measures.bikeShare.targetKommune = numVal('inp-bk-kom');
    });
    syncSingleMeasureSlider('bikeShare');
  };
  ['inp-bk-priv', 'inp-bk-ghd', 'inp-bk-kom'].forEach(id => bind(id, updateBk));
}
