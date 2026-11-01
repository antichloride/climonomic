export function openSourcesModal() {
  openGenericModal(
    'Quellenangaben & Berechnungsmethodik',
    `
      <div style="font-size: var(--k-font-size-sm); line-height: 1.6; color: var(--k-color-text-body); display: flex; flex-direction: column; gap: 14px;">
        <p>
          Der <strong>Klimarechner</strong> basiert auf dem Open-Source Simulationskern <code>climcalc-core</code>, der in WebAssembly kompiliert direkt im Browser läuft.
        </p>
        <h4 style="font-weight: 700;">Datenquellen</h4>
        <ul style="padding-left: 20px;">
          <li><strong>Statistisches Bundesamt (Destatis)</strong>: Einwohnerzahlen, Gebäudebestand, Wohnflächenverteilung.</li>
          <li><strong>Kraftfahrt-Bundesamt (KBA)</strong>: PKW-Dichte, Fahrzeugantriebsarten und Fahrleistungen.</li>
          <li><strong>Umweltbundesamt (UBA)</strong>: CO₂-Emissionsfaktoren des deutschen Strommixes und fossiler Brennstoffe.</li>
          <li><strong>Fraunhofer ISE</strong>: Photovoltaik- und Windenergieertragspotenziale nach Breitengrad.</li>
        </ul>
        <p>
          Alle Berechnungen sind unverbindliche Orientierungswerte für die kommunale Wärmeplanung und politische Entscheidungsfindung.
        </p>
      </div>
    `
  );
}

export function openLegalModal() {
  openGenericModal(
    'Impressum & Datenschutz',
    `
      <div style="font-size: var(--k-font-size-sm); line-height: 1.6; color: var(--k-color-text-body); display: flex; flex-direction: column; gap: 14px;">
        <h4 style="font-weight: 700;">Angaben gemäß § 5 TMG</h4>
        <p>
          Klimarechner — Interaktives Planungstool für Städte und Kommunen.<br/>
          Bereitgestellt als Open-Source-Software für kommunale Klimaschutz- und Wärmeplanung.
        </p>
        <h4 style="font-weight: 700;">Datenschutz & Privatsphäre</h4>
        <p>
          Der Klimarechner verarbeitet alle Berechnungen vollständig <strong>lokal im Webbrowser (Client-Side WebAssembly)</strong>.
          Es werden keinerlei eingegebene Daten, Stadtnamen oder Schiebereglerwerte an externe Server übertragen oder gespeichert.
        </p>
      </div>
    `
  );
}

function openGenericModal(title: string, htmlContent: string) {
  let modal = document.getElementById('modal-generic');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-generic';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-surface" style="max-width: 650px;">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 700;">${title}</h3>
        <button class="modal-close" id="btn-close-generic">✕</button>
      </div>
      <div>${htmlContent}</div>
      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <button id="btn-close-generic-bottom" class="btn-pill-divider">Schließen</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  const close = () => modal?.classList.remove('open');
  document.getElementById('btn-close-generic')?.addEventListener('click', close);
  document.getElementById('btn-close-generic-bottom')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
