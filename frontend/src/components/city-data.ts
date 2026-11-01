import { store } from '../store';
import { openAdvancedModal } from './advanced-modal';
import { openSourcesModal } from './info-modals';

export function renderCityDataCard(): string {
  const s = store.getState();

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
          <label class="field-label" for="input-city-pop">Anzahl Einwohner</label>
          <div class="input-with-unit">
            <input type="number" id="input-city-pop" class="input-control num" value="${s.population}" step="1000" min="1000" max="5000000" />
            <span class="unit-label">Ew.</span>
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
        <button id="btn-open-import-export-card" class="btn-pill-divider" type="button" style="background: var(--k-color-primary-surface); color: var(--k-color-primary-base); border-color: var(--k-color-primary-base); font-weight: 600;">
          ⇅ Excel-Format Import / Export
        </button>
      </div>

      <!-- Card 1b: Fossil Prices -->
      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--k-color-section-border);">
        <div class="card-header" style="margin-bottom: 4px;">
          <h3 style="font-size: var(--k-font-size-h3); font-weight: 700;">Preise für fossile Energien</h3>
        </div>
        <p class="card-subtitle" style="margin-bottom: 16px;">
          Durch zunehmende Bepreisung von CO₂-Emissionen ist mit einem deutlichen Kostenanstieg für fossile Energien zu rechnen. Eingegebene Preise gelten für heute und werden mit der Preis-Entwicklung dann hochgerechnet.
        </p>

        <!-- 4 Fuel Inputs -->
        <div class="input-grid-4">
          <div class="field-group">
            <label class="field-label" for="input-price-co2">CO₂-Preis</label>
            <div class="input-with-unit">
              <input type="number" id="input-price-co2" class="input-control num" value="${s.priceCO2.toFixed(2)}" step="5" min="0" />
              <span class="unit-label">€/t</span>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="input-price-oil">Heizöl</label>
            <div class="input-with-unit">
              <input type="number" id="input-price-oil" class="input-control num" value="${s.priceOil.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/l</span>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="input-price-gas">Heizgas</label>
            <div class="input-with-unit">
              <input type="number" id="input-price-gas" class="input-control num" value="${s.priceGas.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/m³</span>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="input-price-petrol">Benzin</label>
            <div class="input-with-unit">
              <input type="number" id="input-price-petrol" class="input-control num" value="${s.pricePetrol.toFixed(2)}" step="0.05" min="0" />
              <span class="unit-label">€/l</span>
            </div>
          </div>
        </div>

        <!-- Escalation Slider -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center; margin-top: 12px;">
          <div class="field-group">
            <label class="field-label" for="slider-fossil-esc">
              Preisanstieg für fossile Energien ⓘ
              <span id="label-esc-val" class="num" style="font-weight: 700; color: var(--k-color-secondary-base);">
                Um ${s.fossilEscalation} %/Jahr
              </span>
            </label>
            <div class="range-slider-container">
              <input type="range" id="slider-fossil-esc" class="range-slider" min="0" max="15" step="1" value="${s.fossilEscalation}" />
              <div class="slider-labels">
                <span>0%</span>
                <span>3%</span>
                <span>6%</span>
                <span>9%</span>
                <span>12%</span>
                <span>15%</span>
              </div>
            </div>
          </div>

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
  syncProgress('slider-fossil-esc');
  syncProgress('slider-esc-horizon');

  document.getElementById('slider-end-year')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    syncProgress('slider-end-year');
    const lbl = document.getElementById('label-timeframe');
    if (lbl) lbl.textContent = `2026 bis ${val}`;
    store.updateState(s => { s.endYear = val; });
  });

  document.getElementById('input-price-co2')?.addEventListener('change', (e) => {
    const val = Math.max(0, Number((e.target as HTMLInputElement).value));
    store.updateState(s => { s.priceCO2 = val; });
  });

  document.getElementById('input-price-oil')?.addEventListener('change', (e) => {
    const val = Math.max(0, Number((e.target as HTMLInputElement).value));
    store.updateState(s => { s.priceOil = val; });
  });

  document.getElementById('input-price-gas')?.addEventListener('change', (e) => {
    const val = Math.max(0, Number((e.target as HTMLInputElement).value));
    store.updateState(s => { s.priceGas = val; });
  });

  document.getElementById('input-price-petrol')?.addEventListener('change', (e) => {
    const val = Math.max(0, Number((e.target as HTMLInputElement).value));
    store.updateState(s => { s.pricePetrol = val; });
  });

  document.getElementById('slider-fossil-esc')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    syncProgress('slider-fossil-esc');
    const lbl = document.getElementById('label-esc-val');
    if (lbl) lbl.textContent = `Um ${val} %/Jahr`;
    store.updateState(s => { s.fossilEscalation = val; });
  });

  document.getElementById('slider-esc-horizon')?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    syncProgress('slider-esc-horizon');
    const lbl = document.getElementById('label-esc-horizon');
    if (lbl) lbl.textContent = `2026 bis ${val}`;
    store.updateState(s => { s.escalationEnd = val; });
  });

  document.getElementById('btn-open-advanced')?.addEventListener('click', () => {
    openAdvancedModal();
  });

  document.getElementById('btn-open-import-export-card')?.addEventListener('click', async () => {
    const { openImportExportModal } = await import('./import-export-modal');
    openImportExportModal('import');
  });

  document.getElementById('btn-open-sources')?.addEventListener('click', () => {
    openSourcesModal();
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
    const min = Number(slEnd.min) || 2026;
    const max = Number(slEnd.max) || 2045;
    const pct = ((s.endYear - min) / (max - min)) * 100;
    slEnd.style.setProperty('--slider-progress', `${pct}%`);
  }

  const inpCO2 = document.getElementById('input-price-co2') as HTMLInputElement | null;
  if (inpCO2 && document.activeElement !== inpCO2) inpCO2.value = s.priceCO2.toFixed(2);

  const inpOil = document.getElementById('input-price-oil') as HTMLInputElement | null;
  if (inpOil && document.activeElement !== inpOil) inpOil.value = s.priceOil.toFixed(2);

  const inpGas = document.getElementById('input-price-gas') as HTMLInputElement | null;
  if (inpGas && document.activeElement !== inpGas) inpGas.value = s.priceGas.toFixed(2);

  const inpBen = document.getElementById('input-price-petrol') as HTMLInputElement | null;
  if (inpBen && document.activeElement !== inpBen) inpBen.value = s.pricePetrol.toFixed(2);

  const slEsc = document.getElementById('slider-fossil-esc') as HTMLInputElement | null;
  if (slEsc && document.activeElement !== slEsc) {
    slEsc.value = s.fossilEscalation.toString();
    const lbl = document.getElementById('label-esc-val');
    if (lbl) lbl.textContent = `Um ${s.fossilEscalation} %/Jahr`;
    const min = Number(slEsc.min) || 0;
    const max = Number(slEsc.max) || 15;
    const pct = ((s.fossilEscalation - min) / (max - min)) * 100;
    slEsc.style.setProperty('--slider-progress', `${pct}%`);
  }

  const slHrz = document.getElementById('slider-esc-horizon') as HTMLInputElement | null;
  if (slHrz && document.activeElement !== slHrz) {
    slHrz.value = s.escalationEnd.toString();
    const lbl = document.getElementById('label-esc-horizon');
    if (lbl) lbl.textContent = `2026 bis ${s.escalationEnd}`;
    const min = Number(slHrz.min) || 2026;
    const max = Number(slHrz.max) || 2045;
    const pct = ((s.escalationEnd - min) / (max - min)) * 100;
    slHrz.style.setProperty('--slider-progress', `${pct}%`);
  }

  const btnAdv = document.getElementById('btn-open-advanced');
  if (btnAdv) {
    const count = Object.keys(s.expertOverrides || {}).length;
    btnAdv.innerHTML = count > 0
      ? `⚙️ Manuelle Dateneingabe (<strong style="color: var(--k-color-secondary-base);">${count} angepasst</strong>)`
      : `⚙️ Manuelle Dateneingabe (Für Fortgeschrittene)`;
  }
}
