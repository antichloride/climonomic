import { store } from '../store';
import { computeScaledBaselines, createDefaultState } from '../baseline-data';
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
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.private} auf</span>
                <input type="number" id="inp-hd-priv" class="mini-input" value="${m.heatDmd.targetPrivate}" />
                <span>kWh/m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.ghd} auf</span>
                <input type="number" id="inp-hd-ghd" class="mini-input" value="${m.heatDmd.targetGHD}" />
                <span>kWh/m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.heatDmdBase.kommune} auf</span>
                <input type="number" id="inp-hd-kom" class="mini-input" value="${m.heatDmd.targetKommune}" />
                <span>kWh/m²</span>
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
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.private.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-priv" class="mini-input" value="${m.gasPhaseout.targetPrivate}" />
                <span>tsd. m²</span>
              </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--k-color-text-muted); display: flex; justify-content: space-between;">
              <span>WP: ${m.gasPhaseout.subWpPrivate}%</span>
              <span>Fernwärme: ${m.gasPhaseout.subFwPrivate}%</span>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.ghd.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-ghd" class="mini-input" value="${m.gasPhaseout.targetGHD}" />
                <span>tsd. m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.gasAreaBase.kommune.toFixed(0)} auf</span>
                <input type="number" id="inp-gas-kom" class="mini-input" value="${m.gasPhaseout.targetKommune}" />
                <span>tsd. m²</span>
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
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.private.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-priv" class="mini-input" value="${m.oilPhaseout.targetPrivate}" />
                <span>tsd. m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.ghd.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-ghd" class="mini-input" value="${m.oilPhaseout.targetGHD}" />
                <span>tsd. m²</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.buildings.oilAreaBase.kommune.toFixed(0)} auf</span>
                <input type="number" id="inp-oil-kom" class="mini-input" value="${m.oilPhaseout.targetKommune}" />
                <span>tsd. m²</span>
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
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.private.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-priv" class="mini-input" step="5" value="${m.greenPower.targetPrivate}" />
                <span>GWh</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-ghd" class="mini-input" step="5" value="${m.greenPower.targetGHD}" />
                <span>GWh</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.energy.greenPowerBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-gp-kom" class="mini-input" step="0.5" value="${m.greenPower.targetKommune}" />
                <span>GWh</span>
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
            <div class="target-row">
              <span class="target-label">Privat:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.private.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-priv" class="mini-input" step="0.5" value="${m.evCars.targetPrivate}" />
                <span>tsd.</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">GHD:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.ghd.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-ghd" class="mini-input" step="0.2" value="${m.evCars.targetGHD}" />
                <span>tsd.</span>
              </div>
            </div>
            <div class="target-row">
              <span class="target-label">Kommune:</span>
              <div class="target-inputs">
                <span>Von ${scaled.mobility.evCountBase.kommune.toFixed(1)} auf</span>
                <input type="number" id="inp-ev-kom" class="mini-input" step="0.1" value="${m.evCars.targetKommune}" />
                <span>tsd.</span>
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
          </div>

          <!-- Anteil Fahrrad erhöhen -->
          <div class="measure-card">
            <div class="measure-header">
              <label class="measure-toggle">
                <input type="checkbox" id="chk-bike" ${m.bikeShare.enabled ? 'checked' : ''} />
                Anteil Fahrrad erhöhen ⓘ
              </label>
            </div>
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
  });

  // Heat Demand
  const updateHd = () => {
    store.updateState(s => {
      s.measures.heatDmd.enabled = chkVal('chk-heat-dmd');
      s.measures.heatDmd.targetPrivate = numVal('inp-hd-priv');
      s.measures.heatDmd.targetGHD = numVal('inp-hd-ghd');
      s.measures.heatDmd.targetKommune = numVal('inp-hd-kom');
    });
  };
  ['chk-heat-dmd', 'inp-hd-priv', 'inp-hd-ghd', 'inp-hd-kom'].forEach(id => bind(id, updateHd));

  // Gas
  const updateGas = () => {
    store.updateState(s => {
      s.measures.gasPhaseout.enabled = chkVal('chk-gas');
      s.measures.gasPhaseout.targetPrivate = numVal('inp-gas-priv');
      s.measures.gasPhaseout.targetGHD = numVal('inp-gas-ghd');
      s.measures.gasPhaseout.targetKommune = numVal('inp-gas-kom');
    });
  };
  ['chk-gas', 'inp-gas-priv', 'inp-gas-ghd', 'inp-gas-kom'].forEach(id => bind(id, updateGas));

  // Oil
  const updateOil = () => {
    store.updateState(s => {
      s.measures.oilPhaseout.enabled = chkVal('chk-oil');
      s.measures.oilPhaseout.targetPrivate = numVal('inp-oil-priv');
      s.measures.oilPhaseout.targetGHD = numVal('inp-oil-ghd');
      s.measures.oilPhaseout.targetKommune = numVal('inp-oil-kom');
    });
  };
  ['chk-oil', 'inp-oil-priv', 'inp-oil-ghd', 'inp-oil-kom'].forEach(id => bind(id, updateOil));

  // PV Roof
  const updatePvR = () => {
    store.updateState(s => {
      s.measures.pvRoof.enabled = chkVal('chk-pv-roof');
      s.measures.pvRoof.targetPrivate = numVal('inp-pvr-priv');
      s.measures.pvRoof.targetGHD = numVal('inp-pvr-ghd');
      s.measures.pvRoof.targetKommune = numVal('inp-pvr-kom');
    });
  };
  ['chk-pv-roof', 'inp-pvr-priv', 'inp-pvr-ghd', 'inp-pvr-kom'].forEach(id => bind(id, updatePvR));

  // PV Open
  const updatePvO = () => {
    store.updateState(s => {
      s.measures.pvOpen.enabled = chkVal('chk-pv-open');
      s.measures.pvOpen.targetGHD = numVal('inp-pvo-ghd');
      s.measures.pvOpen.targetKommune = numVal('inp-pvo-kom');
    });
  };
  ['chk-pv-open', 'inp-pvo-ghd', 'inp-pvo-kom'].forEach(id => bind(id, updatePvO));

  // Wind
  const updateWnd = () => {
    store.updateState(s => {
      s.measures.wind.enabled = chkVal('chk-wind');
      s.measures.wind.targetGHD = numVal('inp-wnd-ghd');
      s.measures.wind.targetKommune = numVal('inp-wnd-kom');
    });
  };
  ['chk-wind', 'inp-wnd-ghd', 'inp-wnd-kom'].forEach(id => bind(id, updateWnd));

  // Green Power
  const updateGp = () => {
    store.updateState(s => {
      s.measures.greenPower.enabled = chkVal('chk-green-power');
      s.measures.greenPower.targetPrivate = numVal('inp-gp-priv');
      s.measures.greenPower.targetGHD = numVal('inp-gp-ghd');
      s.measures.greenPower.targetKommune = numVal('inp-gp-kom');
    });
  };
  ['chk-green-power', 'inp-gp-priv', 'inp-gp-ghd', 'inp-gp-kom'].forEach(id => bind(id, updateGp));

  // EV
  const updateEv = () => {
    store.updateState(s => {
      s.measures.evCars.enabled = chkVal('chk-ev');
      s.measures.evCars.targetPrivate = numVal('inp-ev-priv');
      s.measures.evCars.targetGHD = numVal('inp-ev-ghd');
      s.measures.evCars.targetKommune = numVal('inp-ev-kom');
    });
  };
  ['chk-ev', 'inp-ev-priv', 'inp-ev-ghd', 'inp-ev-kom'].forEach(id => bind(id, updateEv));

  // Public Transit
  const updatePt = () => {
    store.updateState(s => {
      s.measures.transitShare.enabled = chkVal('chk-pt');
      s.measures.transitShare.targetPrivate = numVal('inp-pt-priv');
      s.measures.transitShare.targetGHD = numVal('inp-pt-ghd');
      s.measures.transitShare.targetKommune = numVal('inp-pt-kom');
    });
  };
  ['chk-pt', 'inp-pt-priv', 'inp-pt-ghd', 'inp-pt-kom'].forEach(id => bind(id, updatePt));

  // Bike
  const updateBk = () => {
    store.updateState(s => {
      s.measures.bikeShare.enabled = chkVal('chk-bike');
      s.measures.bikeShare.targetPrivate = numVal('inp-bk-priv');
      s.measures.bikeShare.targetGHD = numVal('inp-bk-ghd');
      s.measures.bikeShare.targetKommune = numVal('inp-bk-kom');
    });
  };
  ['chk-bike', 'inp-bk-priv', 'inp-bk-ghd', 'inp-bk-kom'].forEach(id => bind(id, updateBk));
}
