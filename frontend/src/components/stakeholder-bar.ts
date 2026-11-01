import { StakeholderFilter, store } from '../store';

export function renderStakeholderBar(): string {
  const currentFilter = store.getFilter();

  return `
    <div class="equation-bar">
      <div class="equation-item ${currentFilter === 'private' ? 'active' : ''}" data-filter="private">
        🏠 Private Haushalte
      </div>
      <div class="equation-op">+</div>
      <div class="equation-item ${currentFilter === 'ghd' ? 'active' : ''}" data-filter="ghd">
        🏢 Gewerbe & Industrie
      </div>
      <div class="equation-op">+</div>
      <div class="equation-item ${currentFilter === 'kommune' ? 'active' : ''}" data-filter="kommune">
        🏛️ Kommune & Schulen
      </div>
      <div class="equation-op">=</div>
      <div class="equation-item ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
        🌐 Gesamtstadt (Alle)
      </div>
    </div>
  `;
}

export function updateStakeholderBar() {
  const currentFilter = store.getFilter();
  document.querySelectorAll('.equation-item').forEach(el => {
    const filter = el.getAttribute('data-filter');
    if (filter === currentFilter) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

export function setupStakeholderBarListeners() {
  document.querySelectorAll('.equation-item').forEach(el => {
    el.addEventListener('click', () => {
      const filter = (el as HTMLElement).getAttribute('data-filter') as StakeholderFilter;
      if (filter) {
        store.setFilter(filter);
      }
    });
  });
}
