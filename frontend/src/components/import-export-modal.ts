import { store } from '../store';
import { showToast } from './header';
import { DEFAULT_EXTRACTOR_INPUTS } from '../default-inputs';

export function openImportExportModal(initialTab: 'export' | 'import' = 'export') {
  let modal = document.getElementById('modal-import-export');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-import-export';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const jsonStr = store.exportInputsJson(true);

  modal.innerHTML = `
    <div class="modal-surface" style="max-width: 840px; width: 95%;">
      <div class="modal-header">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--k-color-text-title);">
              Einstellungen Import / Export
            </h2>
            <span class="header-badge" style="background: var(--k-color-primary-surface); color: var(--k-color-primary-base); border-color: var(--k-color-primary-base);">
              EXCEL & JSON
            </span>
          </div>
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-top: 4px;">
            Direkter Import von Excel-Dateien (.xlsx) über client-seitiges Python (Pyodide) oder Austausch als JSON.
          </p>
        </div>
        <button class="modal-close" id="btn-close-import-export" title="Schließen" aria-label="Schließen">✕</button>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--k-color-border-subtle); padding: 0 24px; margin-top: 8px;">
        <button id="tab-btn-export" class="expert-tab-btn ${initialTab === 'export' ? 'active' : ''}" style="padding: 10px 16px; border-radius: 8px 8px 0 0;">
          📤 Exportieren (JSON)
        </button>
        <button id="tab-btn-import" class="expert-tab-btn ${initialTab === 'import' ? 'active' : ''}" style="padding: 10px 16px; border-radius: 8px 8px 0 0;">
          📥 Importieren (Excel .xlsx / JSON)
        </button>
      </div>

      <div class="modal-body" style="padding: 20px 24px;">
        <!-- TAB 1: EXPORT -->
        <div id="tab-content-export" style="display: ${initialTab === 'export' ? 'block' : 'none'};">
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-bottom: 12px;">
            Dieser JSON-Datensatz enthält alle aktuellen Parameter aus den 4 Sektordomänen im exakten Format der Excel-Webfassung.
          </p>
          <div style="position: relative;">
            <textarea
              id="export-json-area"
              readonly
              rows="14"
              style="width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.82rem; background: var(--k-color-bg-base); color: var(--k-color-text-body); border: 1px solid var(--k-color-border-subtle); border-radius: 8px; padding: 12px; resize: vertical;"
            >${jsonStr}</textarea>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">
            <button id="btn-copy-export" class="btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
              📋 In Zwischenablage kopieren
            </button>
            <button id="btn-download-export" class="btn-pill-divider" style="background: var(--k-color-bg-surface-elevated); border: 1px solid var(--k-color-border-subtle); display: inline-flex; align-items: center; gap: 6px;">
              💾 Als .json herunterladen
            </button>
          </div>
        </div>

        <!-- TAB 2: IMPORT -->
        <div id="tab-content-import" style="display: ${initialTab === 'import' ? 'block' : 'none'};">
          <p style="font-size: var(--k-font-size-sm); color: var(--k-color-text-muted); margin-bottom: 12px;">
            Ziehen Sie eine originale <strong>Excel-Arbeitsmappe (.xlsx)</strong> oder eine <strong>JSON-Datei</strong> hierher. Excel-Dateien werden direkt im Browser mit dem originalen Python-Extraktor (<code>scripts/extraction_webfassung.py</code> via Pyodide) eingelesen.
          </p>

          <!-- Dropzone -->
          <div id="import-dropzone" style="border: 2px dashed var(--k-color-border-focus); border-radius: 10px; padding: 24px; text-align: center; background: var(--k-color-bg-base); cursor: pointer; transition: all 0.2s ease;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">📊 ➔ ⚡</div>
            <div style="font-weight: 600; color: var(--k-color-text-title); font-size: 1.05rem;">
              Excel-Datei (.xlsx) oder JSON-Datei hier ablegen
            </div>
            <div style="font-size: var(--k-font-size-xs); color: var(--k-color-text-muted); margin-top: 6px;">
              Klicken zum Durchsuchen • Unterstützt <code>.xlsx</code> (automatische Python-Extraktion) und <code>.json</code>
            </div>
            <input type="file" id="import-file-input" accept=".xlsx,.xls,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display: none;" />
          </div>

          <div id="import-status-msg" style="display: none; margin-top: 12px; padding: 10px 14px; border-radius: 6px; font-size: var(--k-font-size-sm); transition: all 0.2s;"></div>

          <div style="margin: 16px 0 8px 0; text-align: center; color: var(--k-color-text-muted); font-size: var(--k-font-size-xs); font-weight: 600;">
            — ODER JSON HIER DIREKT EINFÜGEN / BEARBEITEN —
          </div>

          <textarea
            id="import-json-area"
            rows="7"
            placeholder='Fügen Sie hier das JSON ein (z.B. { "buildings": { ... }, "mobility": { ... } } oder { "inputs": { ... } })'
            style="width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.82rem; background: var(--k-color-bg-base); color: var(--k-color-text-body); border: 1px solid var(--k-color-border-subtle); border-radius: 8px; padding: 12px; resize: vertical;"
          ></textarea>

          <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <button id="btn-load-defaults" class="btn-pill-divider" type="button" style="color: var(--k-color-text-muted); font-size: var(--k-font-size-xs);">
              ↺ Standardwerte aus Excel laden
            </button>
            <div style="display: flex; gap: 10px;">
              <button id="btn-apply-import" class="btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                📥 Einstellungen anwenden & simulieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const closeModal = () => {
    modal.classList.remove('open');
  };

  document.getElementById('btn-close-import-export')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tab switching
  const tabBtnExport = document.getElementById('tab-btn-export');
  const tabBtnImport = document.getElementById('tab-btn-import');
  const tabContentExport = document.getElementById('tab-content-export');
  const tabContentImport = document.getElementById('tab-content-import');

  tabBtnExport?.addEventListener('click', () => {
    tabBtnExport.classList.add('active');
    tabBtnImport?.classList.remove('active');
    if (tabContentExport) tabContentExport.style.display = 'block';
    if (tabContentImport) tabContentImport.style.display = 'none';
  });

  tabBtnImport?.addEventListener('click', () => {
    tabBtnImport.classList.add('active');
    tabBtnExport?.classList.remove('active');
    if (tabContentImport) tabContentImport.style.display = 'block';
    if (tabContentExport) tabContentExport.style.display = 'none';
  });

  // Export handlers
  document.getElementById('btn-copy-export')?.addEventListener('click', () => {
    const area = document.getElementById('export-json-area') as HTMLTextAreaElement | null;
    if (area) {
      navigator.clipboard.writeText(area.value).then(() => {
        showToast('📋 Einstellungen in die Zwischenablage kopiert');
      }).catch(() => {
        area.select();
        document.execCommand('copy');
        showToast('📋 Einstellungen kopiert');
      });
    }
  });

  document.getElementById('btn-download-export')?.addEventListener('click', () => {
    const json = store.exportInputsJson(true);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klimarechner_einstellungen_${store.getState().cityName.toLowerCase() || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 JSON-Datei erfolgreich heruntergeladen');
  });

  // Import dropzone & file input
  const dropzone = document.getElementById('import-dropzone');
  const fileInput = document.getElementById('import-file-input') as HTMLInputElement | null;
  const statusMsg = document.getElementById('import-status-msg');
  const importArea = document.getElementById('import-json-area') as HTMLTextAreaElement | null;

  const showStatus = (text: string, isError = false, isLoading = false) => {
    if (!statusMsg) return;
    statusMsg.style.display = 'block';
    if (isError) {
      statusMsg.style.background = 'rgba(239, 68, 68, 0.12)';
      statusMsg.style.color = '#ef4444';
      statusMsg.style.border = '1px solid #ef4444';
    } else if (isLoading) {
      statusMsg.style.background = 'rgba(59, 130, 246, 0.12)';
      statusMsg.style.color = '#3b82f6';
      statusMsg.style.border = '1px solid #3b82f6';
    } else {
      statusMsg.style.background = 'rgba(16, 185, 129, 0.12)';
      statusMsg.style.color = '#10b981';
      statusMsg.style.border = '1px solid #10b981';
    }
    statusMsg.textContent = text;
  };

  dropzone?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--k-color-primary-base)';
    dropzone.style.background = 'var(--k-color-primary-surface)';
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--k-color-border-focus)';
    dropzone.style.background = 'var(--k-color-bg-base)';
  });
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--k-color-border-focus)';
    dropzone.style.background = 'var(--k-color-bg-base)';
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFile(file);
  });

  async function handleFile(file: File) {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      showStatus(`Initialisiere Python-Extraktor für "${file.name}"...`, false, true);
      try {
        const { extractFromExcelFile } = await import('../pyodide-extractor');
        const res = await extractFromExcelFile(file, (progressText) => {
          showStatus(progressText, false, true);
        });

        if (res.success && res.inputsJson) {
          if (importArea) importArea.value = res.inputsJson;
          const applyRes = store.importInputsJson(res.inputsJson);
          if (applyRes.success) {
            showStatus(`✓ Excel-Datei erfolgreich mit Python extrahiert: ${applyRes.message}`);
            showToast(`✓ Excel-Datei "${file.name}" extrahiert & simuliert!`);
            setTimeout(() => closeModal(), 1600);
          } else {
            showStatus(`Daten extrahiert, aber Import fehlgeschlagen: ${applyRes.message}`, true);
          }
        } else {
          showStatus(`Fehler bei der Python-Extraktion: ${res.error || 'Unbekannter Fehler'}`, true);
        }
      } catch (err: any) {
        showStatus(`Fehler beim Laden von Pyodide: ${err?.message || err}`, true);
      }
      return;
    }

    // Standard JSON file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importArea) importArea.value = content;
      showStatus(`JSON-Datei "${file.name}" geladen (${Math.round(file.size / 1024)} KB). Klicken Sie auf "Einstellungen anwenden".`);
    };
    reader.onerror = () => {
      showStatus('Fehler beim Lesen der Datei.', true);
    };
    reader.readAsText(file);
  }

  // Import button action (manual JSON apply)
  document.getElementById('btn-apply-import')?.addEventListener('click', () => {
    const content = importArea?.value.trim();
    if (!content) {
      showStatus('Bitte fügen Sie ein JSON ein oder wählen Sie eine Datei aus.', true);
      return;
    }

    try {
      const res = store.importInputsJson(content);
      if (res.success) {
        showStatus(`✓ ${res.message}`);
        showToast(`✓ ${res.message}`);
        setTimeout(() => closeModal(), 1200);
      } else {
        showStatus(`Fehler beim Import: ${res.message}`, true);
      }
    } catch (e: any) {
      showStatus(`Ungültiges JSON-Format: ${e?.message || e}`, true);
    }
  });

  // Load defaults action
  document.getElementById('btn-load-defaults')?.addEventListener('click', () => {
    if (importArea) {
      importArea.value = JSON.stringify(DEFAULT_EXTRACTOR_INPUTS, null, 2);
    }
    showStatus('Excel-Standarddatensatz (Klimarechner 260630 Webfassung) eingefügt.');
  });
}
