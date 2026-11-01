import { store } from '../store';

export function renderHeader(): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return `
    <header class="app-header">
      <div class="header-brand">
        <div class="header-title-row">
          <h1 class="header-title">Klimarechner</h1>
          <span class="header-badge">WASM SIMULATION</span>
        </div>
        <p class="header-subtitle">
          Wie wirken sich Klimaschutzmaßnahmen auf unsere Stadt aus? Diese Ergebnisse sind überschlägige Rechnungen. Für die Umsetzung werden detaillierte Planungen benötigt.
        </p>
      </div>
      <div class="header-actions">
        <button id="btn-theme-toggle" class="btn-theme-toggle" title="Design wechseln (Hell / Dunkel)" aria-label="Design wechseln">
          ${isDark ? '☀️' : '🌙'}
        </button>
        <button id="btn-reset-all" class="btn-header-reset" title="Alle Eingaben und Maßnahmen zurücksetzen">
          ↺ Eingaben zurücksetzen
        </button>
      </div>
    </header>
  `;
}

export function initTheme() {
  const saved = localStorage.getItem('clim_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function setupHeaderListeners() {
  document.getElementById('btn-reset-all')?.addEventListener('click', () => {
    store.resetToDefaults();
    showToast('Alle Eingaben auf Standardwerte zurückgesetzt');
  });

  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('clim_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('clim_theme', 'light');
    }

    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
  });
}

export function showToast(message: string) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast?.classList.remove('show');
  }, 3000);
}
