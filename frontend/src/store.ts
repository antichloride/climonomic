import { CityBaseline, createDefaultState, exportStateInputs, importStateInputs } from './baseline-data';
import { SimulationOutput, ensureWasmLoaded, runSimulation } from './wasm-engine';

export type StakeholderFilter = 'all' | 'private' | 'ghd' | 'kommune';
export type ChartTab = 'co2' | 'costs' | 'jobs';

type Listener = (output: SimulationOutput, state: CityBaseline) => void;

class SimulationStore {
  private state: CityBaseline = createDefaultState();
  private output: SimulationOutput | null = null;
  private activeSectorFilter: StakeholderFilter = 'all';
  private activeChartTab: ChartTab = 'co2';
  private listeners: Listener[] = [];
  private isCalculating = false;

  constructor() {
    this.loadStateFromUrlHash();
  }

  public getState(): CityBaseline {
    return this.state;
  }

  public getOutput(): SimulationOutput | null {
    return this.output;
  }

  public getFilter(): StakeholderFilter {
    return this.activeSectorFilter;
  }

  public setFilter(filter: StakeholderFilter) {
    this.activeSectorFilter = filter;
    this.notify();
  }

  public getChartTab(): ChartTab {
    return this.activeChartTab;
  }

  public setChartTab(tab: ChartTab) {
    this.activeChartTab = tab;
    this.notify();
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    if (this.output) {
      fn(this.output, this.state);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public async init() {
    await ensureWasmLoaded();
    this.recalculate();
  }

  public updateState(updater: (state: CityBaseline) => void) {
    updater(this.state);
    this.syncUrlHash();
    this.recalculate();
  }

  public exportInputsJson(pretty = true): string {
    const inputs = exportStateInputs(this.state);
    return JSON.stringify(inputs, null, pretty ? 2 : undefined);
  }

  public importInputsJson(rawJsonOrObj: any): { success: boolean; message: string; modifiedCount: number } {
    const res = importStateInputs(this.state, rawJsonOrObj);
    if (res.success) {
      this.syncUrlHash();
      this.recalculate();
    }
    return res;
  }

  public resetToDefaults() {
    this.state = createDefaultState();
    this.activeSectorFilter = 'all';
    this.activeChartTab = 'co2';
    this.syncUrlHash();
    this.recalculate();
  }

  public recalculate() {
    if (this.isCalculating) return;
    this.isCalculating = true;

    try {
      this.output = runSimulation(this.state);
      this.notify();
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      this.isCalculating = false;
    }
  }

  private notify() {
    if (!this.output) return;
    for (const listener of this.listeners) {
      listener(this.output, this.state);
    }
  }

  public getShareableUrl(): string {
    const s = this.state;
    const params = new URLSearchParams();
    params.set('city', s.cityName);
    params.set('pop', s.population.toString());
    params.set('y0', s.startYear.toString());
    params.set('y1', s.endYear.toString());
    params.set('co2p', s.priceCO2.toString());
    params.set('oil', s.priceOil.toString());
    params.set('gas', s.priceGas.toString());
    params.set('ben', s.pricePetrol.toString());
    params.set('esc', s.fossilEscalation.toString());
    params.set('eco2', (s.escCO2 ?? s.fossilEscalation ?? 5).toString());
    params.set('eoil', (s.escOil ?? s.fossilEscalation ?? 3).toString());
    params.set('egas', (s.escGas ?? s.fossilEscalation ?? 3).toString());
    params.set('eben', (s.escPetrol ?? s.fossilEscalation ?? 2).toString());

    return `${window.location.origin}${window.location.pathname}#v1&${params.toString()}`;
  }

  private hashDebounceTimer: any = null;

  private syncUrlHash() {
    if (this.hashDebounceTimer) {
      clearTimeout(this.hashDebounceTimer);
    }
    this.hashDebounceTimer = setTimeout(() => {
      try {
        const s = this.state;
        const params = new URLSearchParams();
        params.set('city', s.cityName);
        params.set('pop', s.population.toString());
        params.set('y0', s.startYear.toString());
        params.set('y1', s.endYear.toString());
        params.set('co2p', s.priceCO2.toString());
        params.set('oil', s.priceOil.toString());
        params.set('gas', s.priceGas.toString());
        params.set('ben', s.pricePetrol.toString());
        params.set('esc', s.fossilEscalation.toString());
        params.set('eco2', (s.escCO2 ?? s.fossilEscalation ?? 5).toString());
        params.set('eoil', (s.escOil ?? s.fossilEscalation ?? 3).toString());
        params.set('egas', (s.escGas ?? s.fossilEscalation ?? 3).toString());
        params.set('eben', (s.escPetrol ?? s.fossilEscalation ?? 2).toString());

        window.history.replaceState(null, '', `#v1&${params.toString()}`);
      } catch (e) {
        // Silently ignore browser rate limit errors during active dragging
      }
    }, 150);
  }

  private loadStateFromUrlHash() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('#v1&')) return;

    try {
      const queryString = hash.replace(/^#v1&/, '');
      const params = new URLSearchParams(queryString);

      if (params.has('pop')) {
        const rawPop = Number(params.get('pop')) || 11.238;
        this.state.population = rawPop >= 1000 ? rawPop / 1000 : rawPop;
      }
      if (params.has('y0')) this.state.startYear = Number(params.get('y0')) || 2026;
      if (params.has('y1')) this.state.endYear = Number(params.get('y1')) || 2040;
      if (params.has('co2p')) this.state.priceCO2 = Number(params.get('co2p')) || 50;
      if (params.has('oil')) this.state.priceOil = Number(params.get('oil')) || 1.0;
      if (params.has('gas')) this.state.priceGas = Number(params.get('gas')) || 1.13;
      if (params.has('ben')) this.state.pricePetrol = Number(params.get('ben')) || 1.67;
      if (params.has('esc')) this.state.fossilEscalation = Number(params.get('esc')) || 0;
      this.state.escCO2 = params.has('eco2') ? Number(params.get('eco2')) : (this.state.fossilEscalation || 5);
      this.state.escOil = params.has('eoil') ? Number(params.get('eoil')) : (this.state.fossilEscalation || 3);
      this.state.escGas = params.has('egas') ? Number(params.get('egas')) : (this.state.fossilEscalation || 3);
      this.state.escPetrol = params.has('eben') ? Number(params.get('eben')) : (this.state.fossilEscalation || 2);
    } catch (e) {
      console.warn('Could not parse URL hash state:', e);
    }
  }
}

export const store = new SimulationStore();
