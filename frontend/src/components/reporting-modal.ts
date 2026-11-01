import { store } from '../store';

export function openReportingModal() {
  let modal = document.getElementById('modal-reporting');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-reporting';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const s = store.getState();
  const out = store.getOutput();
  const filter = store.getFilter();
  const kpi = out?.kpis[filter] || {
    investTotalMio: 354,
    co2ReductionPercent: 111.2,
    co2ReductionTsdTonnes: 211,
    directEffectsMio: 740,
    indirectEffectsMio: 28,
    localTurnoverMio: 142,
    localJobs: 43,
  };

  const measures = out?.topMeasures || [];

  modal.innerHTML = `
    <div class="modal-surface" style="max-width: 1050px;">
      <div class="modal-header">
        <div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--k-color-text-title);">
            Klimarechner — Strategischer Ergebnisbericht
          </h2>
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-top: 4px;">
            Für <strong>${s.cityName}</strong> (${Math.round(s.population * 1000).toLocaleString('de-DE')} Einwohner) im Transformationszeitraum <strong>${s.startYear} bis ${s.endYear}</strong>
          </p>
        </div>
        <button class="modal-close" id="btn-close-reporting" title="Schließen">✕</button>
      </div>

      <!-- 6-KPI Master Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: var(--k-color-section-base); padding: 18px; border-radius: var(--k-radius-md);">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">Investitionen</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: var(--k-color-text-title);">
            +${Math.round(kpi.investTotalMio)} Mio €
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Einmalige Gesamtkosten</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">Direkte Effekte</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: var(--k-color-primary-base);">
            +${Math.round(kpi.directEffectsMio)} Mio €
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Eingesparte Brennstoffkosten</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">Indirekte Effekte</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: var(--k-color-text-title);">
            +${Math.round(kpi.indirectEffectsMio)} Mio €
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Gewerbe- & Einkommensteuern</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">Umsatzsteigerung</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: #1E293B;">
            +${Math.round(kpi.localTurnoverMio)} Mio €
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Lokale Wertschöpfung</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">CO₂-Minderung</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: var(--k-color-primary-base);">
            -${kpi.co2ReductionPercent.toFixed(1)} %
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Zielpfad bis 2045</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--k-color-text-muted); text-transform: uppercase;">Arbeitsplätze</div>
          <div class="num" style="font-size: 1.8rem; font-weight: 800; color: var(--k-color-text-title);">
            +${kpi.localJobs} Jobs
          </div>
          <div style="font-size: 0.75rem; color: var(--k-color-text-muted);">Vollzeitstellen im Handwerk</div>
        </div>
      </div>

      <!-- Narrative Section -->
      <div style="background: #F8FAFC; border-left: 4px solid var(--k-color-primary-base); padding: 16px; border-radius: 4px;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 6px;">Über die CO₂-Emissionen und kommunale Rendite</h4>
        <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-body); line-height: 1.6;">
          Mit den Bereichen <strong>Wärme, Strom und Mobilität</strong> deckt der Klimarechner ca. ~90% der relevanten städtischen Treibhausgasemissionen ab.
          Die berechneten Maßnahmen erzielen eine Treibhausgasminderung von <strong>${kpi.co2ReductionPercent.toFixed(1)} %</strong>.
          Durch den Ersatz fossiler Heiz- und Kraftstoffe bleiben jährlich Millionen Euro Kaufkraft vor Ort, statt für externe Energieimporte abzufließen.
        </p>
      </div>

      <!-- Comprehensive Data Table -->
      <div>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">Maßnahmenübersicht im Detail</h4>
        <table class="top-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Maßnahme</th>
              <th class="num-col">CO₂-Minderung</th>
              <th class="num-col">Investitionen</th>
              <th class="num-col">Effekt (€/t)</th>
              <th class="num-col">Rendite</th>
              <th class="num-col">Effekt / Jahr</th>
            </tr>
          </thead>
          <tbody>
            ${measures.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td class="num-col num" style="color: var(--k-color-primary-base); font-weight: 700;">${m.co2ReductionPct.toFixed(1)} %</td>
                <td class="num-col num">${m.investMio > 0 ? `${m.investMio.toFixed(1)} Mio €` : '0,0 Mio €'}</td>
                <td class="num-col num">${m.costPerTonCO2.toFixed(1)} €/t</td>
                <td class="num-col num">${m.roiPct > 0 ? `${m.roiPct.toFixed(1)} %` : '—'}</td>
                <td class="num-col num" style="color: var(--k-color-primary-dark); font-weight: 600;">+${(m.directEffectMioYear * 1000).toFixed(0)}k €</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Footer Buttons -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--k-color-section-border);">
        <button id="btn-print-report" class="btn-pill-divider" style="background: var(--k-color-primary-base); color: #FFFFFF; border-color: var(--k-color-primary-base); font-weight: 600;">
          🖨️ Druckansicht / Als PDF speichern
        </button>
        <button id="btn-close-reporting-bottom" class="btn-pill-divider">
          Schließen
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const close = () => modal?.classList.remove('open');
  document.getElementById('btn-close-reporting')?.addEventListener('click', close);
  document.getElementById('btn-close-reporting-bottom')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}
