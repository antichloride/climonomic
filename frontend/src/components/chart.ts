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
  let barsSvg = '';

  const nBars = years.length;
  const barWidth = Math.max(8, (plotW / nBars) - 4);

  if (currentTab === 'co2') {
    const dataSeries = out.co2Trajectory.current;
    const minVal = Math.min(...dataSeries, 0);
    yMin = minVal < 0 ? minVal * 1.1 : 0;
    const maxVal = Math.max(...out.co2Trajectory.baseline, ...dataSeries, 10);
    yMax = maxVal * 1.15;
    const zeroY = padTop + plotH * (yMax / (yMax - yMin));

    barsSvg = years.map((yr, idx) => {
      const val = dataSeries[idx] ?? 0;
      const x = padLeft + (idx * (plotW / nBars)) + 2;
      let barH = (Math.abs(val) / (yMax - yMin)) * plotH;
      let y = val >= 0 ? zeroY - barH : zeroY;
      const color = val < 0 ? 'var(--k-color-positive, #10B981)' : 'var(--k-color-primary-base)';

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
          data-unit="tsd. t CO₂"
          style="cursor: pointer;"
        />
        ${idx % 4 === 0 || idx === nBars - 1 ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-size="9" fill="#8E95A0" text-anchor="middle" font-family="Lato, monospace">
            ${yr}
          </text>
        ` : ''}
      `;
    }).join('');
  } else if (currentTab === 'costs') {
    const invSeries = out.costsTrajectory.investments;
    const savSeries = out.costsTrajectory.directSavings;
    const maxVal = Math.max(...invSeries, ...savSeries, 10);
    yMin = 0;
    yMax = maxVal * 1.15;
    const zeroY = padTop + plotH;
    const subWidth = Math.max(3, (barWidth / 2) - 1);

    barsSvg = years.map((yr, idx) => {
      const inv = invSeries[idx] ?? 0;
      const sav = savSeries[idx] ?? 0;
      const x = padLeft + (idx * (plotW / nBars)) + 2;
      const invH = (inv / yMax) * plotH;
      const savH = (sav / yMax) * plotH;

      return `
        <!-- Kosten (Investition) -->
        <rect 
          class="chart-bar" 
          x="${x}" 
          y="${zeroY - invH}" 
          width="${subWidth}" 
          height="${Math.max(2, invH)}" 
          fill="#3B82F6" 
          rx="1"
          data-year="${yr}"
          data-val="Kosten: ${inv.toFixed(1)} Mio € Investition"
          data-unit=""
          style="cursor: pointer;"
        />
        <!-- Rendite (Einsparung) -->
        <rect 
          class="chart-bar" 
          x="${x + subWidth + 1}" 
          y="${zeroY - savH}" 
          width="${subWidth}" 
          height="${Math.max(2, savH)}" 
          fill="#10B981" 
          rx="1"
          data-year="${yr}"
          data-val="Rendite: ${sav.toFixed(1)} Mio €/a Einsparung"
          data-unit=""
          style="cursor: pointer;"
        />
        ${idx % 4 === 0 || idx === nBars - 1 ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-size="9" fill="#8E95A0" text-anchor="middle" font-family="Lato, monospace">
            ${yr}
          </text>
        ` : ''}
      `;
    }).join('');
  } else if (currentTab === 'jobs') {
    const dataSeries = out.jobsTrajectory.localJobs;
    const maxVal = Math.max(...dataSeries, 10);
    yMin = 0;
    yMax = maxVal * 1.15;
    const zeroY = padTop + plotH;

    barsSvg = years.map((yr, idx) => {
      const val = dataSeries[idx] ?? 0;
      const x = padLeft + (idx * (plotW / nBars)) + 2;
      let barH = (val / yMax) * plotH;

      return `
        <rect 
          class="chart-bar" 
          x="${x}" 
          y="${zeroY - barH}" 
          width="${barWidth}" 
          height="${Math.max(2, barH)}" 
          fill="var(--k-color-primary-base)" 
          rx="2"
          data-year="${yr}"
          data-val="${Math.round(val)}"
          data-unit="Vollzeit-Jobs"
          style="cursor: pointer;"
        />
        ${idx % 4 === 0 || idx === nBars - 1 ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-size="9" fill="#8E95A0" text-anchor="middle" font-family="Lato, monospace">
            ${yr}
          </text>
        ` : ''}
      `;
    }).join('');
  }

  const zeroY = currentTab === 'co2' ? padTop + plotH * (yMax / (yMax - yMin)) : padTop + plotH;

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

  const legendHtml = currentTab === 'costs'
    ? `
      <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
        <span style="display: inline-flex; align-items: center; gap: 5px;">
          <span style="width: 8px; height: 8px; background: #3B82F6; border-radius: 2px;"></span>
          <strong>Kosten</strong> (Investition/a)
        </span>
        <span style="display: inline-flex; align-items: center; gap: 5px;">
          <span style="width: 8px; height: 8px; background: #10B981; border-radius: 2px;"></span>
          <strong>Rendite</strong> (Einsparung/a)
        </span>
      </div>
    `
    : currentTab === 'jobs'
    ? `
      <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
        <span style="display: inline-flex; align-items: center; gap: 5px;">
          <span style="width: 8px; height: 8px; background: var(--k-color-primary-base); border-radius: 2px;"></span>
          <strong>Lokale Arbeitsplätze</strong> (Vollzeitstellen im Handwerk)
        </span>
      </div>
    `
    : `
      <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
        <span style="display: inline-flex; align-items: center; gap: 5px;">
          <span style="width: 8px; height: 8px; background: var(--k-color-primary-base); border-radius: 2px;"></span>
          <strong>Jährliche Treibhausgase</strong> (Zielpfad in tsd. t CO₂/a)
        </span>
      </div>
    `;

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

      <div id="chart-legend-host">
        ${legendHtml}
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

  const legendHost = document.getElementById('chart-legend-host');
  if (legendHost) {
    legendHost.innerHTML = currentTab === 'costs'
      ? `
        <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; background: #3B82F6; border-radius: 2px;"></span>
            <strong>Kosten</strong> (Investition/a)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; background: #10B981; border-radius: 2px;"></span>
            <strong>Rendite</strong> (Einsparung/a)
          </span>
        </div>
      `
      : currentTab === 'jobs'
      ? `
        <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; background: var(--k-color-primary-base); border-radius: 2px;"></span>
            <strong>Lokale Arbeitsplätze</strong> (Vollzeitstellen im Handwerk)
          </span>
        </div>
      `
      : `
        <div class="chart-legend" style="display: flex; gap: 16px; font-size: 11px; color: var(--k-color-text-muted); padding: 2px 10px 6px 10px;">
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; background: var(--k-color-primary-base); border-radius: 2px;"></span>
            <strong>Jährliche Treibhausgase</strong> (Zielpfad in tsd. t CO₂/a)
          </span>
        </div>
      `;
  }

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
      const unit = el.getAttribute('data-unit') || '';
      if (tooltip) {
        tooltip.textContent = unit ? `${yr}: ${val} ${unit}` : `${yr}: ${val}`;
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
