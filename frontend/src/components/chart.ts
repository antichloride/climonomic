import { ChartTab, store } from '../store';

export function renderSvgContent(): string {
  const currentTab = store.getChartTab();
  const out = store.getOutput();

  if (!out) {
    return `<p style="color: #888;">Berechne Simulation...</p>`;
  }

  const { years } = out;
  const width = 420;
  const height = 180;
  const padLeft = 45;
  const padRight = 10;
  const padTop = 15;
  const padBottom = 25;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  let yMin = 0;
  let yMax = 210;
  let dataSeries: number[] = [];
  let unit = 'tsd. t';

  if (currentTab === 'co2') {
    dataSeries = out.co2Trajectory.current;
    yMin = -30;
    yMax = Math.max(...out.co2Trajectory.baseline, 210);
    unit = 'tsd. t CO₂';
  } else if (currentTab === 'costs') {
    dataSeries = out.costsTrajectory.directSavings;
    yMin = 0;
    yMax = Math.max(...dataSeries, 50);
    unit = 'Mio €/a';
  } else if (currentTab === 'jobs') {
    dataSeries = out.jobsTrajectory.localJobs;
    yMin = 0;
    yMax = Math.max(...dataSeries, 50);
    unit = 'Jobs';
  }

  const zeroY = padTop + plotH * (yMax / (yMax - yMin));
  const nBars = years.length;
  const barWidth = Math.max(8, (plotW / nBars) - 4);

  // Generate Bars
  const barsSvg = years.map((yr, idx) => {
    const val = dataSeries[idx] ?? 0;
    const x = padLeft + (idx * (plotW / nBars)) + 2;
    let barH = Math.abs(val) / (yMax - yMin) * plotH;
    let y = val >= 0 ? zeroY - barH : zeroY;
    const color = val < 0 ? 'var(--k-color-positive)' : 'var(--k-color-primary-base)';

    return `
      <rect 
        class="chart-bar" 
        x="${x}" 
        y="${y}" 
        width="${barWidth}" 
        height="${Math.max(2, barH)}" 
        fill="${color}" 
        rx="2"
        data-year="${yr}"
        data-val="${val.toFixed(1)}"
        data-unit="${unit}"
        style="cursor: pointer;"
      />
      ${idx % 4 === 0 || idx === nBars - 1 ? `
        <text x="${x + barWidth / 2}" y="${height - 6}" font-size="9" fill="#8E95A0" text-anchor="middle" font-family="Lato, monospace">
          ${yr}
        </text>
      ` : ''}
    `;
  }).join('');

  // Horizontal Grid Lines
  const gridLines = `
    <!-- Top line -->
    <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="#E5E7EB" stroke-dasharray="3,3" />
    <text x="${padLeft - 6}" y="${padTop + 4}" font-size="9" fill="#8E95A0" text-anchor="end" font-family="Lato, monospace">${Math.round(yMax)}</text>
    
    <!-- Zero line -->
    <line x1="${padLeft}" y1="${zeroY}" x2="${width - padRight}" y2="${zeroY}" stroke="#A0AEC0" stroke-width="1.2" />
    <text x="${padLeft - 6}" y="${zeroY + 3}" font-size="9" fill="#4A5568" font-weight="bold" text-anchor="end" font-family="Lato, monospace">0</text>
    
    ${yMin < 0 ? `
      <!-- Negative min line -->
      <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#E5E7EB" stroke-dasharray="3,3" />
      <text x="${padLeft - 6}" y="${height - padBottom + 4}" font-size="9" fill="#8E95A0" text-anchor="end" font-family="Lato, monospace">${Math.round(yMin)}</text>
    ` : ''}
  `;

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
      ${gridLines}
      ${barsSvg}
    </svg>
    <div id="chart-tooltip" style="position: absolute; display: none; background: #111418; color: #FFFFFF; padding: 4px 8px; border-radius: 4px; font-size: 11px; pointer-events: none; z-index: 10; font-family: Lato, monospace;"></div>
  `;
}

export function renderChartComponent(): string {
  const currentTab = store.getChartTab();
  const isAll = store.getFilter() === 'all';

  return `
    <div class="chart-container">
      <div class="chart-tabs">
        <button class="chart-tab ${currentTab === 'co2' ? 'active' : ''}" data-tab="co2">
          CO₂ Emissionen
        </button>
        <button class="chart-tab ${currentTab === 'costs' ? 'active' : ''}" data-tab="costs">
          Kosten & Rendite
        </button>
        <button class="chart-tab ${currentTab === 'jobs' ? 'active' : ''}" data-tab="jobs" id="tab-jobs" style="display: ${isAll ? 'inline-block' : 'none'};">
          Arbeitsplätze
        </button>
      </div>

      <div class="chart-svg-wrap" id="chart-svg-host">
        ${renderSvgContent()}
      </div>
    </div>
  `;
}

export function updateChartSvg() {
  const currentTab = store.getChartTab();
  const isAll = store.getFilter() === 'all';

  const tabJobs = document.getElementById('tab-jobs');
  if (tabJobs) {
    tabJobs.style.display = isAll ? 'inline-block' : 'none';
  }

  document.querySelectorAll('.chart-tab').forEach(b => {
    if (b.getAttribute('data-tab') === currentTab) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  const host = document.getElementById('chart-svg-host');
  if (host) {
    host.innerHTML = renderSvgContent();
    setupBarHoverListeners();
  }
}

export function setupChartListeners() {
  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).getAttribute('data-tab') as ChartTab;
      if (tab) {
        store.setChartTab(tab);
      }
    });
  });

  setupBarHoverListeners();
}

function setupBarHoverListeners() {
  const tooltip = document.getElementById('chart-tooltip');
  document.querySelectorAll('.chart-bar').forEach(bar => {
    bar.addEventListener('mouseenter', (e) => {
      const el = e.target as SVGElement;
      const yr = el.getAttribute('data-year');
      const val = el.getAttribute('data-val');
      const unit = el.getAttribute('data-unit');
      if (tooltip) {
        tooltip.textContent = `${yr}: ${val} ${unit}`;
        tooltip.style.display = 'block';
      }
      (bar as SVGElement).style.opacity = '0.8';
    });

    bar.addEventListener('mousemove', (e) => {
      const me = e as MouseEvent;
      const wrap = document.getElementById('chart-svg-host');
      if (tooltip && wrap) {
        const rect = wrap.getBoundingClientRect();
        tooltip.style.left = `${me.clientX - rect.left + 10}px`;
        tooltip.style.top = `${me.clientY - rect.top - 25}px`;
      }
    });

    bar.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
      (bar as SVGElement).style.opacity = '1';
    });
  });
}
