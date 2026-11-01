import { store } from '../store';
import { computeScaledBaselines } from '../baseline-data';

export function openAdvancedModal() {
  let modal = document.getElementById('modal-advanced');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-advanced';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const s = store.getState();
  const scaled = computeScaledBaselines(s.population);

  modal.innerHTML = `
    <div class="modal-surface" style="max-width: 800px;">
      <div class="modal-header">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700;">
            Manuelle Dateneingabe (Für Fortgeschrittene)
          </h2>
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-top: 4px;">
            Kommunale Katasterdaten und Realdaten der Stadtwerke zur Feinabstimmung der Ausgangsbasis.
          </p>
        </div>
        <button class="modal-close" id="btn-close-advanced">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Buildings Section -->
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--k-color-sector-buildings); margin-bottom: 8px;">
            1. Gebäudebestand & Wohnflächen
          </h4>
          <div class="input-grid-3">
            <div class="field-group">
              <label class="field-label">Gebäude Privat</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${Math.round(11000 * scaled.popScale)}" />
                <span class="unit-label">Stk.</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Gebäude GHD</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${Math.round(1300 * scaled.popScale)}" />
                <span class="unit-label">Stk.</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Öffentliche Gebäude</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${Math.round(150 * scaled.popScale)}" />
                <span class="unit-label">Stk.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Potentials Section -->
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #2B8BE6; margin-bottom: 8px;">
            2. Erneuerbare Potenziale (Solar & Wind)
          </h4>
          <div class="input-grid-3">
            <div class="field-group">
              <label class="field-label">PV-Dachflächenpotenzial</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${(105 * scaled.popScale).toFixed(1)}" />
                <span class="unit-label">MWp</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">PV-Freiflächenpotenzial</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${(150 * scaled.popScale).toFixed(1)}" />
                <span class="unit-label">ha</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Windflächenpotenzial</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${(200 * scaled.popScale).toFixed(1)}" />
                <span class="unit-label">ha</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobility Fleet -->
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #C8328B; margin-bottom: 8px;">
            3. Fahrzeugflotte (Bestand)
          </h4>
          <div class="input-grid-3">
            <div class="field-group">
              <label class="field-label">PKW Bestand (Privat)</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${scaled.mobility.carsCountBase.private.toFixed(1)}" />
                <span class="unit-label">tsd.</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">PKW Bestand (GHD)</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${scaled.mobility.carsCountBase.ghd.toFixed(1)}" />
                <span class="unit-label">tsd.</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Kommunale Fahrzeuge</label>
              <div class="input-with-unit">
                <input type="number" class="input-control num" value="${scaled.mobility.carsCountBase.kommune.toFixed(2)}" />
                <span class="unit-label">tsd.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--k-color-section-border);">
        <button id="btn-apply-advanced" class="btn-pill-divider" style="background: var(--k-color-primary-base); color: #FFFFFF; border-color: var(--k-color-primary-base); font-weight: 600;">
          Übernehmen & Neu berechnen
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const close = () => modal?.classList.remove('open');
  document.getElementById('btn-close-advanced')?.addEventListener('click', close);
  document.getElementById('btn-apply-advanced')?.addEventListener('click', () => {
    store.recalculate();
    close();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
