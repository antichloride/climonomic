import { store } from '../store';
import {
  V5_SECTOR_GROUPS,
  V5_SCALAR_GROUPS,
  V5_INPUT_DEFINITIONS,
  getBaselineValueForId,
  DomainKey,
  SectorKey,
} from '../baseline-data';
import { showToast } from './header';

export function openAdvancedModal() {
  let modal = document.getElementById('modal-advanced');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-advanced';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const s = store.getState();
  const currentOverrides = s.expertOverrides || {};

  // Count active overrides
  const overrideCount = Object.keys(currentOverrides).length;

  const sectors: Array<{ key: SectorKey; label: string; sub: string }> = [
    { key: 'private', label: 'Privat', sub: 'Wohnen' },
    { key: 'industry', label: 'GHD', sub: 'Gewerbe & Industrie' },
    { key: 'schools', label: 'Schulen', sub: 'Bildungseinrichtungen' },
    { key: 'public', label: 'Kommune', sub: 'Verwaltung & Öffentlich' },
  ];

  modal.innerHTML = `
    <div class="modal-surface modal-expert">
      <div class="modal-header">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--k-color-text-title);">
              Manuelle Dateneingabe (Expertenmodus)
            </h2>
            <span class="header-badge" style="background: var(--k-color-secondary-surface); color: var(--k-color-secondary-base); border-color: var(--k-color-secondary-base);">
              v5 MODEL ENGINE
            </span>
            ${
              overrideCount > 0
                ? `<span class="override-pill" id="expert-override-pill">${overrideCount} Werte angepasst</span>`
                : ''
            }
          </div>
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-top: 4px;">
            Kommunale Katasterdaten, Zensuswerte und Realdaten der Stadtwerke zur Feinabstimmung aller 116 Eingangsvariablen.
          </p>
        </div>
        <button class="modal-close" id="btn-close-advanced" title="Schließen" aria-label="Schließen">✕</button>
      </div>

      <!-- Toolbar: Search & Domain Tabs -->
      <div class="expert-toolbar">
        <div class="expert-search-wrap">
          <span style="font-size: 1rem; color: var(--k-color-text-muted);">🔍</span>
          <input
            type="text"
            id="expert-search-input"
            class="expert-search-input"
            placeholder="Variable suchen (z.B. Heizfläche, Öl, Gas, PV, Dach, BEV, Preis)..."
          />
        </div>

        <div class="expert-tabs">
          <button class="expert-tab-btn active" data-tab="all">
            Alle (116)
          </button>
          <button class="expert-tab-btn" data-tab="buildings">
            🏢 Gebäude & Wärme (49)
          </button>
          <button class="expert-tab-btn" data-tab="mobility">
            🚗 Mobilität & Verkehr (23)
          </button>
          <button class="expert-tab-btn" data-tab="energy">
            ⚡ Energie & Strom (44)
          </button>
        </div>
      </div>

      <!-- Scrollable Variable Matrix -->
      <div class="expert-scroll-body" id="expert-scroll-body">
        ${renderDomainContent('buildings', '🏢 Gebäudebestand & Wärme', s, sectors)}
        ${renderDomainContent('mobility', '🚗 Mobilität & Verkehr', s, sectors)}
        ${renderDomainContent('energy', '⚡ Energie & Strom', s, sectors)}
      </div>

      <!-- Modal Footer -->
      <div class="expert-footer">
        <div style="display: flex; gap: 12px; align-items: center;">
          <button id="btn-reset-expert-defaults" class="btn-pill-divider" type="button" style="color: var(--k-color-text-muted);">
            ↺ Auf Standardwerte (nach Einwohnerzahl) zurücksetzen
          </button>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="btn-cancel-advanced" class="action-link" type="button">
            Abbrechen
          </button>
          <button id="btn-apply-advanced" class="btn-primary-action" type="button" style="padding: 10px 24px; font-weight: 700;">
            ✓ Übernehmen & Simulation berechnen
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');

  // Wire up listeners
  setupModalInteractions(modal);
}

function renderDomainContent(
  domain: DomainKey,
  title: string,
  s: any,
  sectors: Array<{ key: SectorKey; label: string; sub: string }>
): string {
  const sectorGroups = V5_SECTOR_GROUPS.filter(g => g.domain === domain);
  const scalarGroups = V5_SCALAR_GROUPS.filter(g => g.domain === domain);

  // Group sector parameters by subCategory
  const subCategories: Record<string, typeof sectorGroups> = {};
  for (const g of sectorGroups) {
    if (!subCategories[g.subCategory]) subCategories[g.subCategory] = [];
    subCategories[g.subCategory].push(g);
  }

  return `
    <section class="expert-domain-section" data-domain="${domain}">
      <div class="expert-domain-header">
        <h3>${title}</h3>
      </div>

      <!-- Sector Matrix Tables -->
      ${Object.entries(subCategories).map(([subTitle, items]) => `
        <div class="expert-subgroup">
          <div class="expert-subgroup-title">${subTitle}</div>
          <div class="expert-table-wrap">
            <table class="expert-matrix-table">
              <thead>
                <tr>
                  <th style="min-width: 240px; text-align: left;">Parameter & Beschreibung</th>
                  <th style="width: 130px; text-align: center;">Einheit</th>
                  ${sectors.map(sec => `
                    <th style="width: 140px; text-align: right;">
                      <div>${sec.label}</div>
                      <div style="font-size: 0.65rem; font-weight: 500; color: var(--k-color-text-muted);">${sec.sub}</div>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${items.map(param => renderSectorRow(param, s, sectors)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}

      <!-- Scalar Parameters -->
      ${scalarGroups.length > 0 ? `
        <div class="expert-subgroup" style="margin-top: 24px;">
          <div class="expert-subgroup-title">Sektorübergreifende Parameter & Tarife</div>
          <div class="expert-scalar-grid">
            ${scalarGroups.map(param => renderScalarCard(param, s)).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

function renderSectorRow(
  param: (typeof V5_SECTOR_GROUPS)[0],
  s: any,
  sectors: Array<{ key: SectorKey; label: string; sub: string }>
): string {
  const overrides = s.expertOverrides || {};

  return `
    <tr class="expert-row" data-search="${param.label.toLowerCase()} ${param.param.toLowerCase()} ${param.description.toLowerCase()}">
      <td class="expert-col-name">
        <div style="font-weight: 600; color: var(--k-color-text-title);">${param.label}</div>
        <div style="font-size: 0.72rem; color: var(--k-color-text-muted); margin-top: 2px;">
          ${param.description}
        </div>
      </td>
      <td class="expert-col-unit" style="text-align: center; font-size: 0.78rem; font-weight: 600; color: var(--k-color-text-muted); white-space: nowrap;">
        ${param.unit}
      </td>
      ${sectors.map(sec => {
        const id = `${param.domain}/inputs/${param.param}/${sec.key}`;
        const defVal = getBaselineValueForId(id, s.population);
        const isOverridden = overrides[id] !== undefined;
        const currentVal = isOverridden ? overrides[id] : defVal;
        const formattedVal = Number.isInteger(currentVal) ? currentVal : currentVal.toFixed(2);

        return `
          <td class="expert-col-val" style="text-align: right;">
            <div class="expert-input-wrap">
              <input
                type="number"
                class="expert-input ${isOverridden ? 'is-overridden' : ''}"
                data-id="${id}"
                data-default="${defVal}"
                value="${formattedVal}"
                step="any"
              />
              ${isOverridden ? '<span class="override-indicator" title="Vom Standard abweichender Wert">•</span>' : ''}
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `;
}

function renderScalarCard(
  param: (typeof V5_SCALAR_GROUPS)[0],
  s: any
): string {
  const overrides = s.expertOverrides || {};
  const id = param.id;
  const defVal = getBaselineValueForId(id, s.population);
  const isOverridden = overrides[id] !== undefined;
  const currentVal = isOverridden ? overrides[id] : defVal;
  const formattedVal = Number.isInteger(currentVal) ? currentVal : currentVal.toFixed(2);

  return `
    <div class="expert-scalar-card ${isOverridden ? 'is-overridden' : ''}" data-search="${param.label.toLowerCase()} ${param.param.toLowerCase()} ${param.description.toLowerCase()}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div style="font-size: 0.88rem; font-weight: 600; color: var(--k-color-text-title);">
          ${param.label}
        </div>
        <span class="unit-badge">${param.unit}</span>
      </div>
      <p style="font-size: 0.72rem; color: var(--k-color-text-muted); margin-bottom: 10px;">
        ${param.description}
      </p>
      <div class="input-with-unit" style="padding: 6px 10px;">
        <input
          type="number"
          class="input-control num expert-input"
          data-id="${id}"
          data-default="${defVal}"
          value="${formattedVal}"
          step="any"
        />
        <span class="unit-label">${param.unit}</span>
      </div>
    </div>
  `;
}

function setupModalInteractions(modal: HTMLElement) {
  const close = () => {
    modal.classList.remove('open');
  };

  document.getElementById('btn-close-advanced')?.addEventListener('click', close);
  document.getElementById('btn-cancel-advanced')?.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Tab switching
  const tabs = modal.querySelectorAll('.expert-tab-btn');
  const sections = modal.querySelectorAll('.expert-domain-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetDomain = tab.getAttribute('data-tab');
      sections.forEach(sec => {
        const secDomain = sec.getAttribute('data-domain');
        if (targetDomain === 'all' || secDomain === targetDomain) {
          (sec as HTMLElement).style.display = 'block';
        } else {
          (sec as HTMLElement).style.display = 'none';
        }
      });
    });
  });

  // Real-time Search Filter
  const searchInput = document.getElementById('expert-search-input') as HTMLInputElement | null;
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const rows = modal.querySelectorAll('.expert-row, .expert-scalar-card');

    rows.forEach(row => {
      const text = row.getAttribute('data-search') || '';
      if (!q || text.includes(q)) {
        (row as HTMLElement).style.display = '';
      } else {
        (row as HTMLElement).style.display = 'none';
      }
    });
  });

  // Highlight modified fields as user types
  modal.querySelectorAll<HTMLInputElement>('.expert-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const def = Number(inp.getAttribute('data-default'));
      const cur = Number(inp.value);
      if (!isNaN(cur) && Math.abs(cur - def) > 0.0001) {
        inp.classList.add('is-overridden');
      } else {
        inp.classList.remove('is-overridden');
      }
    });
  });

  // Reset to default values
  document.getElementById('btn-reset-expert-defaults')?.addEventListener('click', () => {
    const s = store.getState();
    modal.querySelectorAll<HTMLInputElement>('.expert-input').forEach(inp => {
      const id = inp.getAttribute('data-id');
      if (id) {
        const def = getBaselineValueForId(id, s.population);
        inp.value = Number.isInteger(def) ? def.toString() : def.toFixed(2);
        inp.setAttribute('data-default', def.toString());
        inp.classList.remove('is-overridden');
      }
    });
    showToast('Werte auf Standardwerte für Einwohnerzahl zurückgesetzt');
  });

  // Apply Changes & Save to Store
  document.getElementById('btn-apply-advanced')?.addEventListener('click', () => {
    const s = store.getState();
    const newOverrides: Record<string, number> = {};
    let count = 0;

    modal.querySelectorAll<HTMLInputElement>('.expert-input').forEach(inp => {
      const id = inp.getAttribute('data-id');
      if (id) {
        const val = Number(inp.value);
        const def = getBaselineValueForId(id, s.population);

        if (!isNaN(val) && Math.abs(val - def) > 0.0001) {
          newOverrides[id] = val;
          count++;
        }
      }
    });

    store.updateState(state => {
      state.expertOverrides = newOverrides;
    });

    close();
    showToast(`✓ ${count} Experten-Variablen übernommen & Simulation neu berechnet`);
  });
}
