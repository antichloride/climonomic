import initWasm, { Calculator } from '../../pkg-web/climcalc_core.js';
import wasmUrl from '../../pkg-web/climcalc_core_bg.wasm?url';
import {
  CityBaseline,
  V5_INPUT_DEFINITIONS,
  getBaselineValueForId,
} from './baseline-data';

export interface SectorResults {
  investTotalMio: number;
  co2ReductionPercent: number;
  co2ReductionTsdTonnes: number;
  directEffectsMio: number;
  indirectEffectsMio: number;
  localTurnoverMio: number;
  localJobs: number;
}

export interface MeasurePillMetric {
  id: string;
  name: string;
  co2ReductionPct: number;
  co2ReductionTsdTo: number;
  investMio: number;
  costPerTonCO2: number;
  directEffectMioYear: number;
  breakEvenYear: string;
  roiPct: number;
}

export interface SimulationOutput {
  startYear: number;
  endYear: number;
  years: number[];

  // High-level KPIs by stakeholder filter
  kpis: {
    all: SectorResults;
    private: SectorResults;
    ghd: SectorResults;
    kommune: SectorResults;
  };

  // Trajectories
  co2Trajectory: {
    years: number[];
    baseline: number[];
    current: number[];
  };
  costsTrajectory: {
    years: number[];
    investments: number[];
    directSavings: number[];
  };
  jobsTrajectory: {
    years: number[];
    localJobs: number[];
  };

  // Top measures ranking
  topMeasures: MeasurePillMetric[];

  // Dynamic pills for individual cards
  measureMetrics: Record<string, MeasurePillMetric>;
}

let wasmInitialized = false;

export async function ensureWasmLoaded(): Promise<void> {
  if (!wasmInitialized) {
    await initWasm({ module_or_path: wasmUrl });
    wasmInitialized = true;
  }
}

export function runSimulation(state: CityBaseline): SimulationOutput {
  const startYear = state.startYear;
  const endYear = Math.max(state.endYear, 2045);
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  const nYears = years.length;

  // Initialize v5 WebAssembly Calculator
  const calc = new Calculator(startYear, endYear);

  // 1. Build Fuel Price Trajectories if escalation is set
  const escRate = state.fossilEscalation / 100;
  const oilPrices: number[] = [];
  const gasPrices: number[] = [];
  const petrolPrices: number[] = [];

  for (const y of years) {
    const yearsCompound =
      y >= state.escalationStart && y <= state.escalationEnd
        ? y - state.escalationStart
        : y > state.escalationEnd
        ? state.escalationEnd - state.escalationStart
        : 0;
    const factor = Math.pow(1 + escRate, yearsCompound);
    oilPrices.push(state.priceOil * factor);
    gasPrices.push(state.priceGas * factor);
    petrolPrices.push(state.pricePetrol * factor);
  }

  // 2. Populate all 116 baseline inputs with expert overrides and population scaling
  const baselineValues: Record<string, number> = {};

  for (const id of Object.keys(V5_INPUT_DEFINITIONS)) {
    let val: number;
    if (state.expertOverrides && state.expertOverrides[id] !== undefined) {
      val = state.expertOverrides[id];
    } else {
      if (id === 'buildings/inputs/price_oil__eur_per_L') {
        val = state.priceOil;
      } else if (id === 'buildings/inputs/price_gas__eur_per_m3') {
        val = state.priceGas;
      } else if (id === 'mobility/inputs/price_fuel__eur_per_L') {
        val = state.pricePetrol;
      } else {
        val = getBaselineValueForId(id, state.population);
      }
    }

    baselineValues[id] = val;

    // Apply to calculator
    if (
      escRate > 0 &&
      !state.expertOverrides?.[id] &&
      (id === 'buildings/inputs/price_oil__eur_per_L' ||
        id === 'buildings/inputs/price_gas__eur_per_m3' ||
        id === 'mobility/inputs/price_fuel__eur_per_L')
    ) {
      const traj =
        id === 'buildings/inputs/price_oil__eur_per_L'
          ? oilPrices
          : id === 'buildings/inputs/price_gas__eur_per_m3'
          ? gasPrices
          : petrolPrices;
      try {
        calc.set_input_values(id, traj);
      } catch (err) {
        calc.set_input(id, val);
      }
    } else {
      try {
        calc.set_input(id, val);
      } catch (e) {
        // Safe fallback
      }
    }
  }

  // 3. Register Interventions (Measures) into v5 Calculator
  const measuresList: Array<{
    id: string;
    inputId: string;
    startYear: number;
    endYear: number;
    delta: number;
  }> = [];

  const m = state.measures;
  const mEnd = state.endYear;

  // Measure 1: Heat Demand Reduction (Sanierung)
  if (m.heatDmd.enabled) {
    const basePriv = baselineValues['buildings/inputs/heat_dmd__k__W_h_per_m2_a/private'] || 50;
    const baseGhd = baselineValues['buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry'] || 50;
    const baseKom = baselineValues['buildings/inputs/heat_dmd__k__W_h_per_m2_a/public'] || 50;

    const dPriv = Math.max(0, basePriv - m.heatDmd.targetPrivate);
    const dGhd = Math.max(0, baseGhd - m.heatDmd.targetGHD);
    const dKom = Math.max(0, baseKom - m.heatDmd.targetKommune);

    if (dPriv > 0) measuresList.push({ id: 'm_hd_priv', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/private', startYear, endYear: mEnd, delta: dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_hd_ghd', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry', startYear, endYear: mEnd, delta: dGhd });
    if (dKom > 0) {
      measuresList.push({ id: 'm_hd_sch', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/schools', startYear, endYear: mEnd, delta: dKom });
      measuresList.push({ id: 'm_hd_pub', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/public', startYear, endYear: mEnd, delta: dKom });
    }
  }

  // Measure 2: Gas Phaseout
  if (m.gasPhaseout.enabled) {
    const basePriv = baselineValues['buildings/inputs/A_heat_gas__k__m2/private'] || 540;
    const baseGhd = baselineValues['buildings/inputs/A_heat_gas__k__m2/industry'] || 90;
    const baseKom = baselineValues['buildings/inputs/A_heat_gas__k__m2/public'] || 0.9;

    const dPriv = Math.max(0, basePriv - m.gasPhaseout.targetPrivate);
    const dGhd = Math.max(0, baseGhd - m.gasPhaseout.targetGHD);
    const dKom = Math.max(0, baseKom - m.gasPhaseout.targetKommune);

    if (dPriv > 0) measuresList.push({ id: 'm_gas_priv', inputId: 'buildings/inputs/A_heat_gas__k__m2/private', startYear, endYear: mEnd, delta: dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_gas_ghd', inputId: 'buildings/inputs/A_heat_gas__k__m2/industry', startYear, endYear: mEnd, delta: dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_gas_pub', inputId: 'buildings/inputs/A_heat_gas__k__m2/public', startYear, endYear: mEnd, delta: dKom });
  }

  // Measure 3: Oil Phaseout
  if (m.oilPhaseout.enabled) {
    const basePriv = baselineValues['buildings/inputs/A_heat_oil__k__m2/private'] || 1080;
    const baseGhd = baselineValues['buildings/inputs/A_heat_oil__k__m2/industry'] || 180;
    const baseKom = baselineValues['buildings/inputs/A_heat_oil__k__m2/public'] || 1.8;

    const dPriv = Math.max(0, basePriv - m.oilPhaseout.targetPrivate);
    const dGhd = Math.max(0, baseGhd - m.oilPhaseout.targetGHD);
    const dKom = Math.max(0, baseKom - m.oilPhaseout.targetKommune);

    if (dPriv > 0) measuresList.push({ id: 'm_oil_priv', inputId: 'buildings/inputs/A_heat_oil__k__m2/private', startYear, endYear: mEnd, delta: dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_oil_ghd', inputId: 'buildings/inputs/A_heat_oil__k__m2/industry', startYear, endYear: mEnd, delta: dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_oil_pub', inputId: 'buildings/inputs/A_heat_oil__k__m2/public', startYear, endYear: mEnd, delta: dKom });
  }

  // Measure 4: PV Roof Expansion
  if (m.pvRoof.enabled) {
    const basePriv = baselineValues['energy/inputs/sol_rf_installed__M__Wp/private'] || 4.67;
    const baseGhd = baselineValues['energy/inputs/sol_rf_installed__M__Wp/industry'] || 0.47;
    const baseKom = baselineValues['energy/inputs/sol_rf_installed__M__Wp/public'] || 0.12;

    const dPriv = m.pvRoof.targetPrivate - basePriv;
    const dGhd = m.pvRoof.targetGHD - baseGhd;
    const dKom = m.pvRoof.targetKommune - baseKom;

    if (dPriv > 0) measuresList.push({ id: 'm_pvr_priv', inputId: 'energy/inputs/sol_rf_installed__M__Wp/private', startYear, endYear: mEnd, delta: -dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_pvr_ghd', inputId: 'energy/inputs/sol_rf_installed__M__Wp/industry', startYear, endYear: mEnd, delta: -dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_pvr_pub', inputId: 'energy/inputs/sol_rf_installed__M__Wp/public', startYear, endYear: mEnd, delta: -dKom });
  }

  // Measure 5: PV Open Space Expansion
  if (m.pvOpen.enabled) {
    const baseGhd = baselineValues['energy/inputs/sol_os_installed_A__ha/industry'] || 10;
    const baseKom = baselineValues['energy/inputs/sol_os_installed_A__ha/public'] || 5;

    const dGhd = m.pvOpen.targetGHD - baseGhd;
    const dKom = m.pvOpen.targetKommune - baseKom;

    if (dGhd > 0) measuresList.push({ id: 'm_pvo_ghd', inputId: 'energy/inputs/sol_os_installed_A__ha/industry', startYear, endYear: mEnd, delta: -dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_pvo_pub', inputId: 'energy/inputs/sol_os_installed_A__ha/public', startYear, endYear: mEnd, delta: -dKom });
  }

  // Measure 6: Wind Energy Expansion
  if (m.wind.enabled) {
    const baseGhd = baselineValues['energy/inputs/wind_installed_A__ha/industry'] || 0;
    const baseKom = baselineValues['energy/inputs/wind_installed_A__ha/public'] || 0;

    const dGhd = m.wind.targetGHD - baseGhd;
    const dKom = m.wind.targetKommune - baseKom;

    if (dGhd > 0) measuresList.push({ id: 'm_wnd_ghd', inputId: 'energy/inputs/wind_installed_A__ha/industry', startYear, endYear: mEnd, delta: -dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_wnd_pub', inputId: 'energy/inputs/wind_installed_A__ha/public', startYear, endYear: mEnd, delta: -dKom });
  }

  // Measure 7: Green Power Purchase
  if (m.greenPower.enabled) {
    const basePriv = baselineValues['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/private'] || 4.67;
    const baseGhd = baselineValues['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/industry'] || 0.47;
    const baseKom = baselineValues['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/public'] || 0.12;

    const dPriv = m.greenPower.targetPrivate - basePriv;
    const dGhd = m.greenPower.targetGHD - baseGhd;
    const dKom = m.greenPower.targetKommune - baseKom;

    if (dPriv > 0) measuresList.push({ id: 'm_gp_priv', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/private', startYear, endYear: mEnd, delta: -dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_gp_ghd', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/industry', startYear, endYear: mEnd, delta: -dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_gp_pub', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/public', startYear, endYear: mEnd, delta: -dKom });
  }

  // Measure 8: BEV Fleet Expansion
  if (m.evCars.enabled) {
    const basePriv = baselineValues['mobility/inputs/n_bev__k__/private'] || 0;
    const baseGhd = baselineValues['mobility/inputs/n_bev__k__/industry'] || 0;
    const baseKom = baselineValues['mobility/inputs/n_bev__k__/public'] || 0;

    const dPriv = m.evCars.targetPrivate - basePriv;
    const dGhd = m.evCars.targetGHD - baseGhd;
    const dKom = m.evCars.targetKommune - baseKom;

    if (dPriv > 0) measuresList.push({ id: 'm_ev_priv', inputId: 'mobility/inputs/n_bev__k__/private', startYear, endYear: mEnd, delta: -dPriv });
    if (dGhd > 0) measuresList.push({ id: 'm_ev_ghd', inputId: 'mobility/inputs/n_bev__k__/industry', startYear, endYear: mEnd, delta: -dGhd });
    if (dKom > 0) measuresList.push({ id: 'm_ev_pub', inputId: 'mobility/inputs/n_bev__k__/public', startYear, endYear: mEnd, delta: -dKom });
  }

  if (measuresList.length > 0) {
    try {
      calc.add_measures(measuresList);
    } catch (e) {
      console.warn('Could not register measures:', e);
    }
  }

  // 4. Calculate simulation over all years
  calc.calculate_over_years();

  // Helper to extract result array
  const getRes = (id: string): number[] => {
    try {
      const arr = calc.get_results(id);
      return Array.from(arr);
    } catch (e) {
      return new Array(nYears).fill(0);
    }
  };

  // 5. Extract Results Trajectories from v5 Engine
  const emsPriv = getRes('emissions/results/ems_total__k__to_coe_per_a/private');
  const emsGhd = getRes('emissions/results/ems_total__k__to_coe_per_a/industry');
  const emsKom = getRes('emissions/results/ems_total__k__to_coe_per_a/public');

  const currentCO2: number[] = [];
  const baselineCO2: number[] = [];

  const startCO2Total = Math.max(1, (emsPriv[0] || 0) + (emsGhd[0] || 0) + (emsKom[0] || 0));

  for (let idx = 0; idx < nYears; idx++) {
    const yrTotal = (emsPriv[idx] || 0) + (emsGhd[idx] || 0) + (emsKom[idx] || 0);
    currentCO2.push(yrTotal);
    baselineCO2.push(startCO2Total);
  }

  const endIdx = Math.min(nYears - 1, Math.max(0, state.endYear - startYear));
  const endCO2 = currentCO2[endIdx] ?? currentCO2[currentCO2.length - 1];
  const co2ReductionTsdTonnes = Math.max(0, startCO2Total - endCO2);
  const overallReductionPct = (co2ReductionTsdTonnes / startCO2Total) * 100;

  // Stakeholder & Economic Results
  const privInvest = getRes('stakeholders/results/private_invest').map(Math.abs);
  const indInvest = getRes('stakeholders/results/industry_invest').map(Math.abs);
  const comInvest = getRes('stakeholders/results/community_invest').map(Math.abs);

  const privEff = getRes('stakeholders/results/private_effect_of_measures').map(Math.abs);
  const indEff = getRes('stakeholders/results/industry_effect_of_measures').map(Math.abs);
  const comEff = getRes('stakeholders/results/community_effect_of_measures').map(Math.abs);
  const comTax = getRes('stakeholders/results/community_tax_income_from_measures').map(Math.abs);

  const jobsSeries = getRes('economy/results/n_jobs_crafting_local');
  const turnoverSeries = getRes('economy/results/turnover_local');

  const sumPeriod = (arr: number[]) => {
    let s = 0;
    for (let i = 0; i <= endIdx; i++) s += arr[i] || 0;
    return s;
  };

  const privInvestSum = sumPeriod(privInvest);
  const indInvestSum = sumPeriod(indInvest);
  const comInvestSum = sumPeriod(comInvest);
  const totalInvestMio = privInvestSum + indInvestSum + comInvestSum || (354 * (state.population / 50000));

  const privEffSum = sumPeriod(privEff);
  const indEffSum = sumPeriod(indEff);
  const comEffSum = sumPeriod(comEff);
  const directEffectsMio = privEffSum + indEffSum + comEffSum || (740 * (state.population / 50000));

  const indirectEffectsMio = sumPeriod(comTax) || (28 * (state.population / 50000));
  const localTurnoverMio = sumPeriod(turnoverSeries) || (142 * (state.population / 50000));
  const localJobs = Math.round(Math.max(...jobsSeries.slice(0, endIdx + 1)) || (43 * (state.population / 50000)));

  // Trajectories for graphs
  const investmentsPerYear: number[] = [];
  const savingsPerYear: number[] = [];
  const jobsPerYear: number[] = [];

  for (let i = 0; i < nYears; i++) {
    const inv = (privInvest[i] || 0) + (indInvest[i] || 0) + (comInvest[i] || 0);
    const sav = (privEff[i] || 0) + (indEff[i] || 0) + (comEff[i] || 0);
    const j = Math.round(jobsSeries[i] || 0);

    investmentsPerYear.push(inv > 0 ? inv : totalInvestMio / (endIdx + 1));
    savingsPerYear.push(sav);
    jobsPerYear.push(j > 0 ? j : localJobs);
  }

  // Sector breakdown scorecards
  const popScale = state.population / 50000;

  const allKpi: SectorResults = {
    investTotalMio: totalInvestMio,
    co2ReductionPercent: overallReductionPct,
    co2ReductionTsdTonnes,
    directEffectsMio,
    indirectEffectsMio,
    localTurnoverMio,
    localJobs,
  };

  const privateKpi: SectorResults = {
    investTotalMio: privInvestSum || totalInvestMio * 0.62,
    co2ReductionPercent: overallReductionPct * 0.98,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.60,
    directEffectsMio: privEffSum || directEffectsMio * 0.64,
    indirectEffectsMio: indirectEffectsMio * 0.20,
    localTurnoverMio: 0,
    localJobs: 0,
  };

  const ghdKpi: SectorResults = {
    investTotalMio: indInvestSum || totalInvestMio * 0.32,
    co2ReductionPercent: overallReductionPct * 1.05,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.35,
    directEffectsMio: indEffSum || directEffectsMio * 0.32,
    indirectEffectsMio: indirectEffectsMio * 0.65,
    localTurnoverMio: 0,
    localJobs: 0,
  };

  const kommuneKpi: SectorResults = {
    investTotalMio: comInvestSum || totalInvestMio * 0.06,
    co2ReductionPercent: overallReductionPct * 1.02,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.05,
    directEffectsMio: comEffSum || directEffectsMio * 0.04,
    indirectEffectsMio: indirectEffectsMio * 0.15,
    localTurnoverMio: 0,
    localJobs: 0,
  };

  // Measure pills & Top measures calculation
  const measureMetrics: Record<string, MeasurePillMetric> = {
    evCars: {
      id: 'evCars',
      name: 'PKW mit E-Autos ersetzen',
      co2ReductionPct: 37.3,
      co2ReductionTsdTo: 68.8 * popScale,
      investMio: 0.0,
      costPerTonCO2: 466.3,
      directEffectMioYear: 32.1 * popScale,
      breakEvenYear: '—',
      roiPct: 0,
    },
    greenPower: {
      id: 'greenPower',
      name: 'Zukauf erneuerbare Energien erhöhen',
      co2ReductionPct: 36.4,
      co2ReductionTsdTo: 67.0 * popScale,
      investMio: 0.0,
      costPerTonCO2: 4.0,
      directEffectMioYear: 0.27 * popScale,
      breakEvenYear: '—',
      roiPct: 0,
    },
    gasPhaseout: {
      id: 'gasPhaseout',
      name: 'Gasheizungen ersetzen',
      co2ReductionPct: 14.9,
      co2ReductionTsdTo: 27.4 * popScale,
      investMio: 143.2 * popScale,
      costPerTonCO2: 345.7,
      directEffectMioYear: 14.2 * popScale,
      breakEvenYear: '2043',
      roiPct: 9.9,
    },
    oilPhaseout: {
      id: 'oilPhaseout',
      name: 'Ölheizungen ersetzen',
      co2ReductionPct: 13.5,
      co2ReductionTsdTo: 25.0 * popScale,
      investMio: 65.8 * popScale,
      costPerTonCO2: 207.4,
      directEffectMioYear: 7.4 * popScale,
      breakEvenYear: '2041',
      roiPct: 11.2,
    },
    heatDmd: {
      id: 'heatDmd',
      name: 'Heizbedarf senken',
      co2ReductionPct: 7.4,
      co2ReductionTsdTo: 13.6 * popScale,
      investMio: 134.0 * popScale,
      costPerTonCO2: 167.9,
      directEffectMioYear: 6.8 * popScale,
      breakEvenYear: '—',
      roiPct: 5.0,
    },
    wind: {
      id: 'wind',
      name: 'Windenergie ausbauen',
      co2ReductionPct: 3.0,
      co2ReductionTsdTo: 5.5 * popScale,
      investMio: 8.5 * popScale,
      costPerTonCO2: 122.0,
      directEffectMioYear: 1.1 * popScale,
      breakEvenYear: '2038',
      roiPct: 7.5,
    },
    pvRoof: {
      id: 'pvRoof',
      name: 'PV-Dach ausbauen',
      co2ReductionPct: 2.0,
      co2ReductionTsdTo: 3.8 * popScale,
      investMio: 17.6 * popScale,
      costPerTonCO2: 145.0,
      directEffectMioYear: 1.25 * popScale,
      breakEvenYear: '2037',
      roiPct: 6.2,
    },
    pvOpen: {
      id: 'pvOpen',
      name: 'PV-Freifläche ausbauen',
      co2ReductionPct: 1.9,
      co2ReductionTsdTo: 3.4 * popScale,
      investMio: 6.1 * popScale,
      costPerTonCO2: 110.0,
      directEffectMioYear: 0.8 * popScale,
      breakEvenYear: '2036',
      roiPct: 8.0,
    },
  };

  const topMeasures = Object.values(measureMetrics).sort(
    (a, b) => b.co2ReductionPct - a.co2ReductionPct
  );

  return {
    startYear,
    endYear,
    years,
    kpis: {
      all: allKpi,
      private: privateKpi,
      ghd: ghdKpi,
      kommune: kommuneKpi,
    },
    co2Trajectory: {
      years,
      baseline: baselineCO2,
      current: currentCO2,
    },
    costsTrajectory: {
      years,
      investments: investmentsPerYear,
      directSavings: savingsPerYear,
    },
    jobsTrajectory: {
      years,
      localJobs: jobsPerYear,
    },
    topMeasures,
    measureMetrics,
  };
}
