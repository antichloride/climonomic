import { store } from '../store';

export function renderTopMeasures(): string {
  const out = store.getOutput();
  if (!out) return '';

  const measures = out.topMeasures.slice(0, 5);

  return `
    <div class="top-measures-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--k-color-text-title);">
          Top Maßnahmen
        </h4>
        <span style="font-size: var(--k-font-size-xs); color: var(--k-color-text-muted);">
          nach CO₂-Minderung
        </span>
      </div>
      <table class="top-table">
        <thead>
          <tr>
            <th>Maßnahme</th>
            <th class="num-col">CO₂-Reduktion ▾</th>
            <th class="num-col">Effekt (€/t CO₂)</th>
          </tr>
        </thead>
        <tbody>
          ${measures.map((m, idx) => `
            <tr>
              <td>
                <span style="color: var(--k-color-text-muted); font-size: 0.75rem; margin-right: 4px;">${idx + 1}.</span>
                <strong>${m.name}</strong>
              </td>
              <td class="num-col num" style="color: var(--k-color-primary-base); font-weight: 700;">
                ${m.co2ReductionPct.toFixed(1)} %
              </td>
              <td class="num-col num">
                ${m.costPerTonCO2.toFixed(1)} €/t
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function updateTopMeasuresTable() {
  const slot = document.getElementById('top-measures-slot');
  if (slot) slot.innerHTML = renderTopMeasures();
}
