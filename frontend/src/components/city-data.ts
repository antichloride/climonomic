import { store } from '../store';
import { calculateProjectedPrices, CityBaseline } from '../baseline-data';
import { openAdvancedModal } from './advanced-modal';
import { openSourcesModal } from './info-modals';

export function renderCityDataCard(): string {
  const s = store.getState();
  const proj = calculateProjectedPrices(s);

  return `
    <section class="card" id="card-city-data">
      <div class="card-header">
        <h2 class="card-title">Daten der Stadt</h2>
        <button id="btn-open-sources" class="action-link" style="color: var(--k-color-primary-base); font-weight: 600;">
          ⓘ Quellenangaben
        </button>
      </div>
      <p class="card-subtitle">
        Über die Einwohnerzahl werden durchschnittliche Werte für Deutschland (anteilig) für die Stadt übernommen. Passen Sie die Werte an, um ein genaueres Ergebnis zu erhalten.
      </p>

      <!-- Primary Grid: 3 Columns -->
      <div class="input-grid-3">
        <div class="field-group">
          <label class="field-label" for="input-city-name">Name der Stadt</label>
          <div class="input-with-unit">
            <input type="text" id="input-city-name" class="input-control" value="${s.cityName}" placeholder="z.B. Kassel" />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="input-city-pop">Einwohner (in 1.000)</label>
          <div class="input-with-unit">
            <input type="number" id="input-city-pop" class="input-control num" value="${s.population}" step="any" min="0.001" max="100000" />
            <span class="unit-label">1.000 Ew.</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="slider-end-year">
            Zeitraum der Maßnahmen
            <span id="label-timeframe" class="num" style="font-weight: 700; color: var(--k-color-primary-dark);">
              ${s.startYear} bis ${s.endYear}
            </span>
          </label>
          <div class="range-slider-container">
            <input type="range" id="slider-end-year" class="range-slider" min="2026" max="2045" step="1" value="${s.endYear}" />
            <div class="slider-labels">
              <span>2026</span>
              <span>2030</span>
              <span>2035</span>
              <span>2040</span>
              <span>2045</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Pill Divider -->
      <div class="advanced-divider" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button id="btn-open-advanced" class="btn-pill-divider" type="button">
          ${(Object.keys(s.expertOverrides || {}).length > 0)
            ? `⚙️ Manuelle Dateneingabe (<strong style="color: var(--k-color-secondary-base);">${Object.keys(s.expertOverrides || {}).length} angepasst</strong>)`
            : `⚙️ Manuelle Dateneingabe (Für Fortgeschrittene)`}
        </button>
      </div>

      <!-- Card 1b: Fossil Prices -->
      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--k-color-section-border);">
        <div class="card-header" style="margin-bottom: 4px;">
          <h3 style="font-size: var(--k-font-size-h3); font-weight: 700;">Preise für fossile Energien</h3>
        </div>
        <p class="card-subtitle" style="margin-bottom: 16px;">
          Durch Bepreisung von CO₂-Emissionen und Marktveränderungen steigen die Kosten fossiler Energien. Jeder Energieträger kann individuell in Startpreis und jährlicher Steigerungsrate angepasst werden.
        </p>

        <!-- 4 Individual Fuel Price Cards -->
        <div class="input-grid-4">
          <!-- Card 1: CO2-Preis -->
          <div class="fossil-card-item">
            <div class="fossil-card-header">
              <span class="fossil-card-title">CO₂-Preis</span>
              <span class="fossil-card-unit">€/t</span>
            </div>
            <div class="input-with-unit">
              <input type="number" id="input-price-co2" class="input-control num" value="${s.priceCO2.toFixed(2)}" step="5" min="0" />
              <span class="unit-label">€/t</span>
            </div>
            <div class="fossil-item-esc">
              <div class="fossil-esc-header">
                <span class="fossil-esc-label">Preisanstieg</span>
                <span id="lbl-esc-co2" class="fossil-esc-val">+${s.escCO2}%/a</span>
              </div>
              <div class="range-slider-container">
                <input type="range" id="slider-esc-co2" class="range-slider" min="0" max="15" step="1" value="${s.escCO2}" />
              </div>
            </div>
            <div class="fossil-preview-box">
              <span class="preview-target-text">Zieljahr ${s.endYear}:</span>
              <div class="preview-val-row">
                <span class="preview-price" id="preview-val-co2">${proj.projCO2.toFixed(2)} €/t</span>
                <span class="preview-badge ${proj.pctCO2 === 0 ? 'neutral' : ''}" id="preview-badge-co2">${proj.pctCO2 >= 0 ? '+' : ''}${proj.pctCO2.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Heizöl -->
          <div class="fossil-card-item">
            <div class="fossil-card-header">
              <span class="fossil-card-title">Heizöl</span>
              <span class="fossil-card-unit">€/l</span>
            </div>
            <div class="input-with-unit">
              <input type="number" id="input-price-oil" class="input-control num" value="${s.priceOil.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/l</span>
            </div>
            <div class="fossil-item-esc">
              <div class="fossil-esc-header">
                <span class="fossil-esc-label">Preisanstieg</span>
                <span id="lbl-esc-oil" class="fossil-esc-val">+${s.escOil}%/a</span>
              </div>
              <div class="range-slider-container">
                <input type="range" id="slider-esc-oil" class="range-slider" min="0" max="15" step="1" value="${s.escOil}" />
              </div>
            </div>
            <div class="fossil-preview-box">
              <span class="preview-target-text">Zieljahr ${s.endYear}:</span>
              <div class="preview-val-row">
                <span class="preview-price" id="preview-val-oil">${proj.projOil.toFixed(2)} €/l</span>
                <span class="preview-badge ${proj.pctOil === 0 ? 'neutral' : ''}" id="preview-badge-oil">${proj.pctOil >= 0 ? '+' : ''}${proj.pctOil.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Heizgas -->
          <div class="fossil-card-item">
            <div class="fossil-card-header">
              <span class="fossil-card-title">Heizgas</span>
              <span class="fossil-card-unit">€/m³</span>
            </div>
            <div class="input-with-unit">
              <input type="number" id="input-price-gas" class="input-control num" value="${s.priceGas.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/m³</span>
            </div>
            <div class="fossil-item-esc">
              <div class="fossil-esc-header">
                <span class="fossil-esc-label">Preisanstieg</span>
                <span id="lbl-esc-gas" class="fossil-esc-val">+${s.escGas}%/a</span>
              </div>
              <div class="range-slider-container">
                <input type="range" id="slider-esc-gas" class="range-slider" min="0" max="15" step="1" value="${s.escGas}" />
              </div>
            </div>
            <div class="fossil-preview-box">
              <span class="preview-target-text">Zieljahr ${s.endYear}:</span>
              <div class="preview-val-row">
                <span class="preview-price" id="preview-val-gas">${proj.projGas.toFixed(2)} €/m³</span>
                <span class="preview-badge ${proj.pctGas === 0 ? 'neutral' : ''}" id="preview-badge-gas">${proj.pctGas >= 0 ? '+' : ''}${proj.pctGas.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <!-- Card 4: Benzin -->
          <div class="fossil-card-item">
            <div class="fossil-card-header">
              <span class="fossil-card-title">Benzin</span>
              <span class="fossil-card-unit">€/l</span>
            </div>
            <div class="input-with-unit">
              <input type="number" id="input-price-petrol" class="input-control num" value="${s.pricePetrol.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/l</span>
            </div>
            <div class="fossil-item-esc">
              <div class="fossil-esc-header">
                <span class="fossil-esc-label">Preisanstieg</span>
                <span id="lbl-esc-petrol" class="fossil-esc-val">+${s.escPetrol}%/a</span>
              </div>
              <div class="range-slider-container">
                <input type="range" id="slider-esc-petrol" class="range-slider" min="0" max="15" step="1" value="${s.escPetrol}" />
              </div>
            </div>
            <div class="fossil-preview-box">
              <span class="preview-target-text">Zieljahr ${s.endYear}:</span>
              <div class="preview-val-row">
                <span class="preview-price" id="preview-val-petrol">${proj.projPetrol.toFixed(2)} €/l</span>
                <span class="preview-badge ${proj.pctPetrol === 0 ? 'neutral' : ''}" id="preview-badge-petrol">${proj.pctPetrol >= 0 ? '+' : ''}${proj.pctPetrol.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Escalation Horizon & Bulk Actions -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center; margin-top: 14px;">
          <div class="field-group">
            <label class="field-label" for="slider-esc-horizon">
              Preiszeitraum
              <span id="label-esc-horizon" class="num" style="font-weight: 700;">
                ${s.escalationStart} bis ${s.escalationEnd}
              </span>
            </label>
            <div class="range-slider-container">
              <input type="range" id="slider-esc-horizon" class="range-slider" min="2026" max="2045" step="1" value="${s.escalationEnd}" />
              <div class="slider-labels">
                <span>2026</span>
                <span>2030</span>
                <span>2035</span>
                <span>2040</span>
                <span>2045</span>
              </div>
            </div>
          </div>

          <div class="field-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="field-label" style="margin: 0;">Alle Preisanstiege gleichzeitig anpassen:</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn-fossil-quick" data-rate="0">0% Konstant</button>
              <button type="button" class="btn-fossil-quick" data-rate="3">3% Moderat</button>
              <button type="button" class="btn-fossil-quick" data-rate="6">6% Ambitioniert</button>
              <button type="button" class="btn-fossil-quick" data-rate="9">9% Stark</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function syncProgress(id: string) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) {
    const min = Number(el.min) || 0;
    const max = Number(el.max) || 100;
    const val = Number(el.value);
    const pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--slider-progress', `${pct}%`);
  }
}

export function setupCityDataListeners() {
  document.getElementById('input-city-name')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    store.updateState(s => { s.cityName = val; });
  });

  document.getElementById('input-city-pop')?.addEventListener('change', (e) => {
    const val = Math.max(1000, Number((e.target as HTMLInputElement).value) || 50000);
    store.updateState(s => { s.population = val; });
  });

  // Initialize progress tracks
  syncProgress('slider-end-year');
  syncProgress('slider-esc-horizon');
  syncProgress('slider-esc-co2');
  syncProgress('slider-esc-oil');
  syncProgress('slider-esc-gas');
  syncProgress('slider-esc-petrol');

  document.getElementById('slider-end-year')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    syncProgress('slider-end-year');
    const lbl = document.getElementById('label-timeframe');
    if (lbl) lbl.textContent = `2026 bis ${val}`;
    store.updateState(s => { s.endYear = val; });
    updateFossilPreviews();
  });

  // Base price inputs
  const bindPriceInput = (id: string, prop: 'priceCO2' | 'priceOil' | 'priceGas' | 'pricePetrol') => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    el.addEventListener('input', () => {
      const val = Math.max(0, Number(el.value) || 0);
      store.updateState(s => { s[prop] = val; });
      updateFossilPreviews();
    });
  };

  bindPriceInput('input-price-co2', 'priceCO2');
  bindPriceInput('input-price-oil', 'priceOil');
  bindPriceInput('input-price-gas', 'priceGas');
  bindPriceInput('input-price-petrol', 'pricePetrol');

  // Individual escalation sliders
  const bindEscSlider = (
    sliderId: string,
    labelId: string,
    prop: 'escCO2' | 'escOil' | 'escGas' | 'escPetrol'
  ) => {
    const el = document.getElementById(sliderId) as HTMLInputElement | null;
    if (!el) return;
    el.addEventListener('input', () => {
      const val = Number(el.value);
      syncProgress(sliderId);
      const lbl = document.getElementById(labelId);
      if (lbl) lbl.textContent = `+${val}%/a`;
      store.updateState(s => {
        s[prop] = val;
      });
      updateFossilPreviews();
    });
  };

  bindEscSlider('slider-esc-co2', 'lbl-esc-co2', 'escCO2');
  bindEscSlider('slider-esc-oil', 'lbl-esc-oil', 'escOil');
  bindEscSlider('slider-esc-gas', 'lbl-esc-gas', 'escGas');
  bindEscSlider('slider-esc-petrol', 'lbl-esc-petrol', 'escPetrol');

  // Horizon slider
  document.getElementById('slider-esc-horizon')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    syncProgress('slider-esc-horizon');
    const lbl = document.getElementById('label-esc-horizon');
    if (lbl) lbl.textContent = `2026 bis ${val}`;
    store.updateState(s => { s.escalationEnd = val; });
    updateFossilPreviews();
  });

  // Quick buttons to set all 4 escalation rates at once
  document.querySelectorAll<HTMLButtonElement>('.btn-fossil-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const rate = Number(btn.dataset.rate) || 0;
      store.updateState(s => {
        s.escCO2 = rate;
        s.escOil = rate;
        s.escGas = rate;
        s.escPetrol = rate;
        s.fossilEscalation = rate;
      });

      // Update slider positions & progress tracks
      const sliders = [
        ['slider-esc-co2', 'lbl-esc-co2'],
        ['slider-esc-oil', 'lbl-esc-oil'],
        ['slider-esc-gas', 'lbl-esc-gas'],
        ['slider-esc-petrol', 'lbl-esc-petrol'],
      ] as const;

      for (const [slId, lbId] of sliders) {
        const inp = document.getElementById(slId) as HTMLInputElement | null;
        if (inp) {
          inp.value = rate.toString();
          syncProgress(slId);
        }
        const lbl = document.getElementById(lbId);
        if (lbl) lbl.textContent = `+${rate}%/a`;
      }

      updateFossilPreviews();
    });
  });

  document.getElementById('btn-open-advanced')?.addEventListener('click', () => {
    openAdvancedModal();
  });

  document.getElementById('btn-open-sources')?.addEventListener('click', () => {
    openSourcesModal();
  });
}

export function updateFossilPreviews(state?: CityBaseline) {
  const s = state || store.getState();
  const proj = calculateProjectedPrices(s);

  const updateCardPreview = (
    valId: string,
    badgeId: string,
    val: number,
    unit: string,
    pct: number
  ) => {
    const elVal = document.getElementById(valId);
    if (elVal) elVal.textContent = `${val.toFixed(2)} ${unit}`;
    const elBadge = document.getElementById(badgeId);
    if (elBadge) {
      elBadge.textContent = `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
      elBadge.className = `preview-badge ${pct === 0 ? 'neutral' : ''}`;
    }
  };

  updateCardPreview('preview-val-co2', 'preview-badge-co2', proj.projCO2, '€/t', proj.pctCO2);
  updateCardPreview('preview-val-oil', 'preview-badge-oil', proj.projOil, '€/l', proj.pctOil);
  updateCardPreview('preview-val-gas', 'preview-badge-gas', proj.projGas, '€/m³', proj.pctGas);
  updateCardPreview('preview-val-petrol', 'preview-badge-petrol', proj.projPetrol, '€/l', proj.pctPetrol);

  document.querySelectorAll('.preview-target-text').forEach(el => {
    el.textContent = `Zieljahr ${s.endYear}:`;
  });
}

export function syncCityDataInputsFromState() {
  const s = store.getState();
  const inpName = document.getElementById('input-city-name') as HTMLInputElement | null;
  if (inpName && document.activeElement !== inpName) inpName.value = s.cityName;

  const inpPop = document.getElementById('input-city-pop') as HTMLInputElement | null;
  if (inpPop && document.activeElement !== inpPop) inpPop.value = s.population.toString();

  const slEnd = document.getElementById('slider-end-year') as HTMLInputElement | null;
  if (slEnd && document.activeElement !== slEnd) {
    slEnd.value = s.endYear.toString();
    const lbl = document.getElementById('label-timeframe');
    if (lbl) lbl.textContent = `2026 bis ${s.endYear}`;
    syncProgress('slider-end-year');
  }

  const inpCO2 = document.getElementById('input-price-co2') as HTMLInputElement | null;
  if (inpCO2 && document.activeElement !== inpCO2) inpCO2.value = s.priceCO2.toFixed(2);

  const inpOil = document.getElementById('input-price-oil') as HTMLInputElement | null;
  if (inpOil && document.activeElement !== inpOil) inpOil.value = s.priceOil.toFixed(2);

  const inpGas = document.getElementById('input-price-gas') as HTMLInputElement | null;
  if (inpGas && document.activeElement !== inpGas) inpGas.value = s.priceGas.toFixed(2);

  const inpBen = document.getElementById('input-price-petrol') as HTMLInputElement | null;
  if (inpBen && document.activeElement !== inpBen) inpBen.value = s.pricePetrol.toFixed(2);

  // Sync individual escalation sliders
  const syncEsc = (slId: string, lbId: string, val: number) => {
    const sl = document.getElementById(slId) as HTMLInputElement | null;
    if (sl && document.activeElement !== sl) {
      sl.value = val.toString();
      syncProgress(slId);
      const lbl = document.getElementById(lbId);
      if (lbl) lbl.textContent = `+${val}%/a`;
    }
  };

  syncEsc('slider-esc-co2', 'lbl-esc-co2', s.escCO2 ?? s.fossilEscalation ?? 5);
  syncEsc('slider-esc-oil', 'lbl-esc-oil', s.escOil ?? s.fossilEscalation ?? 3);
  syncEsc('slider-esc-gas', 'lbl-esc-gas', s.escGas ?? s.fossilEscalation ?? 3);
  syncEsc('slider-esc-petrol', 'lbl-esc-petrol', s.escPetrol ?? s.fossilEscalation ?? 2);

  const slHrz = document.getElementById('slider-esc-horizon') as HTMLInputElement | null;
  if (slHrz && document.activeElement !== slHrz) {
    slHrz.value = s.escalationEnd.toString();
    const lbl = document.getElementById('label-esc-horizon');
    if (lbl) lbl.textContent = `2026 bis ${s.escalationEnd}`;
    syncProgress('slider-esc-horizon');
  }

  updateFossilPreviews(s);

  const btnAdv = document.getElementById('btn-open-advanced');
  if (btnAdv) {
    const count = Object.keys(s.expertOverrides || {}).length;
    btnAdv.innerHTML = count > 0
      ? `⚙️ Manuelle Dateneingabe (<strong style="color: var(--k-color-secondary-base);">${count} angepasst</strong>)`
      : `⚙️ Manuelle Dateneingabe (Für Fortgeschrittene)`;
  }
}
