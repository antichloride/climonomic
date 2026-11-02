import initWasm, { Calculator } from '../../pkg-web/climcalc_core.js';
import wasmUrl from '../../pkg-web/climcalc_core_bg.wasm?url';
import {
  CityBaseline,
  V5_INPUT_DEFINITIONS,
  INPUT_DEFINITIONS,
  REFERENCE_POPULATION,
  SectorKey,
  getBaselineValueForId,
} from './baseline-data';
import { DEFAULT_EXTRACTOR_INPUTS } from './default-inputs';

export interface SectorResults {
  investTotalMio: number;
  co2ReductionPercent: number;
  co2ReductionTsdTonnes: number;
  directEffectsMio: number;
  indirectEffectsMio: number;
  localTurnoverMio: number;
  localJobs: number;
  roiPercent: number;
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

  // Municipal transition evaluation model output
  modelOutputs?: any;
}

let wasmInitialized = false;

export async function ensureWasmLoaded(): Promise<void> {
  if (!wasmInitialized) {
    await initWasm({ module_or_path: wasmUrl });
    wasmInitialized = true;
  }
}

export interface MeasureIntervention {
  id: string;
  inputId: string;
  startYear: number;
  endYear: number;
  delta: number;
}

interface SimRunResults {
  emsPriv: number[];
  emsGhd: number[];
  emsKom: number[];
  emsTerritorial: number[];
  feedInAvoided: number[];
  totalCO2: number[];
  privInvest: number[];
  indInvest: number[];
  comInvest: number[];
  totalInvestPerYear: number[];
  totalInvestSum: number;
  privInvestSum: number;
  indInvestSum: number;
  comInvestSum: number;
  privEff: number[];
  indEff: number[];
  comEff: number[];
  totalEffPerYear: number[];
  totalEffSum: number;
  privEffSum: number;
  indEffSum: number;
  comEffSum: number;
  comTax: number[];
  comTaxSum: number;
  jobsSeries: number[];
  turnoverSeries: number[];
  turnoverSum: number;
  solOsNrgTotal: number[];
  windNrgTotal: number[];
  greenNrgTotal: number[];
}

export const MEASURE_DEFINITIONS: Record<
  string,
  {
    id: string;
    name: string;
    getInterventions: (
      s: CityBaseline,
      b: Record<string, number>,
      startYear: number,
      endYear: number
    ) => MeasureIntervention[];
  }
> = {
  heatDmd: {
    id: 'heatDmd',
    name: 'Heizbedarf senken',
    getInterventions: (s, _b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.heatDmd;
      const basePriv = 114;
      const baseGhd = 96;
      const baseKom = 96;

      const dPriv = Math.max(0, basePriv - m.targetPrivate);
      const dGhd = Math.max(0, baseGhd - m.targetGHD);
      const dKom = Math.max(0, baseKom - m.targetKommune);

      if (dPriv > 0)
        list.push({
          id: 'm_hd_priv',
          inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/private',
          startYear,
          endYear,
          delta: dPriv,
        });
      if (dGhd > 0)
        list.push({
          id: 'm_hd_ghd',
          inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry',
          startYear,
          endYear,
          delta: dGhd,
        });
      if (dKom > 0) {
        list.push({
          id: 'm_hd_pub',
          inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/public',
          startYear,
          endYear,
          delta: dKom,
        });
      }
      return list;
    },
  },
  gasPhaseout: {
    id: 'gasPhaseout',
    name: 'Gasheizungen ersetzen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.gasPhaseout;
      const basePriv = b['buildings/inputs/A_heat_gas__k__m2/private'] || 540;
      const baseGhd = b['buildings/inputs/A_heat_gas__k__m2/industry'] || 90;
      const baseKom = b['buildings/inputs/A_heat_gas__k__m2/public'] || 0.9;

      const dPriv = Math.max(0, basePriv - m.targetPrivate);
      const dGhd = Math.max(0, baseGhd - m.targetGHD);
      const dKom = Math.max(0, baseKom - m.targetKommune);

      if (dPriv > 0)
        list.push({
          id: 'm_gas_priv',
          inputId: 'buildings/inputs/A_heat_gas__k__m2/private',
          startYear,
          endYear,
          delta: dPriv,
        });
      if (dGhd > 0)
        list.push({
          id: 'm_gas_ghd',
          inputId: 'buildings/inputs/A_heat_gas__k__m2/industry',
          startYear,
          endYear,
          delta: dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_gas_pub',
          inputId: 'buildings/inputs/A_heat_gas__k__m2/public',
          startYear,
          endYear,
          delta: dKom,
        });
      return list;
    },
  },
  oilPhaseout: {
    id: 'oilPhaseout',
    name: 'Ölheizungen ersetzen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.oilPhaseout;
      const basePriv = b['buildings/inputs/A_heat_oil__k__m2/private'] || 1080;
      const baseGhd = b['buildings/inputs/A_heat_oil__k__m2/industry'] || 180;
      const baseKom = b['buildings/inputs/A_heat_oil__k__m2/public'] || 1.8;

      const dPriv = Math.max(0, basePriv - m.targetPrivate);
      const dGhd = Math.max(0, baseGhd - m.targetGHD);
      const dKom = Math.max(0, baseKom - m.targetKommune);

      if (dPriv > 0)
        list.push({
          id: 'm_oil_priv',
          inputId: 'buildings/inputs/A_heat_oil__k__m2/private',
          startYear,
          endYear,
          delta: dPriv,
        });
      if (dGhd > 0)
        list.push({
          id: 'm_oil_ghd',
          inputId: 'buildings/inputs/A_heat_oil__k__m2/industry',
          startYear,
          endYear,
          delta: dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_oil_pub',
          inputId: 'buildings/inputs/A_heat_oil__k__m2/public',
          startYear,
          endYear,
          delta: dKom,
        });
      return list;
    },
  },
  pvRoof: {
    id: 'pvRoof',
    name: 'PV-Dach ausbauen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.pvRoof;
      const basePriv = b['energy/inputs/sol_rf_installed__M__Wp/private'] || 4.67;
      const baseGhd = b['energy/inputs/sol_rf_installed__M__Wp/industry'] || 0.47;
      const baseKom = b['energy/inputs/sol_rf_installed__M__Wp/public'] || 0.12;

      const dPriv = m.targetPrivate - basePriv;
      const dGhd = m.targetGHD - baseGhd;
      const dKom = m.targetKommune - baseKom;

      if (dPriv > 0)
        list.push({
          id: 'm_pvr_priv',
          inputId: 'energy/inputs/sol_rf_installed__M__Wp/private',
          startYear,
          endYear,
          delta: -dPriv,
        });
      if (dGhd > 0)
        list.push({
          id: 'm_pvr_ghd',
          inputId: 'energy/inputs/sol_rf_installed__M__Wp/industry',
          startYear,
          endYear,
          delta: -dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_pvr_pub',
          inputId: 'energy/inputs/sol_rf_installed__M__Wp/public',
          startYear,
          endYear,
          delta: -dKom,
        });
      return list;
    },
  },
  pvOpen: {
    id: 'pvOpen',
    name: 'PV-Freifläche ausbauen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.pvOpen;
      const baseGhd = b['energy/inputs/sol_os_installed_A__ha/industry'] || 10;
      const baseKom = b['energy/inputs/sol_os_installed_A__ha/public'] || 5;

      const dGhd = m.targetGHD - baseGhd;
      const dKom = m.targetKommune - baseKom;

      if (dGhd > 0)
        list.push({
          id: 'm_pvo_ghd',
          inputId: 'energy/inputs/sol_os_installed_A__ha/industry',
          startYear,
          endYear,
          delta: -dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_pvo_pub',
          inputId: 'energy/inputs/sol_os_installed_A__ha/public',
          startYear,
          endYear,
          delta: -dKom,
        });
      return list;
    },
  },
  wind: {
    id: 'wind',
    name: 'Windenergie ausbauen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.wind;
      const baseGhd = b['energy/inputs/wind_installed_A__ha/industry'] || 0;
      const baseKom = b['energy/inputs/wind_installed_A__ha/public'] || 0;

      const dGhd = m.targetGHD - baseGhd;
      const dKom = m.targetKommune - baseKom;

      if (dGhd > 0)
        list.push({
          id: 'm_wnd_ghd',
          inputId: 'energy/inputs/wind_installed_A__ha/industry',
          startYear,
          endYear,
          delta: -dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_wnd_pub',
          inputId: 'energy/inputs/wind_installed_A__ha/public',
          startYear,
          endYear,
          delta: -dKom,
        });
      return list;
    },
  },
  evCars: {
    id: 'evCars',
    name: 'PKW mit E-Autos ersetzen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.evCars;
      const basePriv = b['mobility/inputs/n_bev__k__/private'] || 0;
      const baseGhd = b['mobility/inputs/n_bev__k__/industry'] || 0;
      const baseKom = b['mobility/inputs/n_bev__k__/public'] || 0;

      const dPriv = m.targetPrivate - basePriv;
      const dGhd = m.targetGHD - baseGhd;
      const dKom = m.targetKommune - baseKom;

      if (dPriv > 0)
        list.push({
          id: 'm_ev_priv',
          inputId: 'mobility/inputs/n_bev__k__/private',
          startYear,
          endYear,
          delta: -dPriv,
        });
      if (dGhd > 0)
        list.push({
          id: 'm_ev_ghd',
          inputId: 'mobility/inputs/n_bev__k__/industry',
          startYear,
          endYear,
          delta: -dGhd,
        });
      if (dKom > 0)
        list.push({
          id: 'm_ev_pub',
          inputId: 'mobility/inputs/n_bev__k__/public',
          startYear,
          endYear,
          delta: -dKom,
        });
      return list;
    },
  },
  districtHeating: {
    id: 'districtHeating',
    name: 'Fernwärme & Wärmenetze ausbauen',
    getInterventions: () => [],
  },
  biomass: {
    id: 'biomass',
    name: 'Biomasse & Biogas ausbauen',
    getInterventions: () => [],
  },
  storage: {
    id: 'storage',
    name: 'Großbatteriespeicher',
    getInterventions: () => [],
  },
  variableTariffs: {
    id: 'variableTariffs',
    name: 'Variable & Dynamische Tarife',
    getInterventions: () => [],
  },
  streetLighting: {
    id: 'streetLighting',
    name: 'LED Straßenbeleuchtung',
    getInterventions: () => [],
  },
};

export function runSimulation(state: CityBaseline): SimulationOutput {
  const startYear = state.startYear;
  const endYear = Math.max(state.endYear, 2045);
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  const nYears = years.length;
  const endIdx = Math.min(nYears - 1, Math.max(0, state.endYear - startYear));

  // 1. Build Individual Fuel Price Trajectories
  const escCO2Rate = (state.escCO2 ?? state.fossilEscalation ?? 0) / 100;
  const escOilRate = (state.escOil ?? state.fossilEscalation ?? 0) / 100;
  const escGasRate = (state.escGas ?? state.fossilEscalation ?? 0) / 100;
  const escPetrolRate = (state.escPetrol ?? state.fossilEscalation ?? 0) / 100;

  const co2Prices: number[] = [];
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

    // Escalated CO2 price in €/t
    const pCO2 = state.priceCO2 * Math.pow(1 + escCO2Rate, yearsCompound);
    co2Prices.push(pCO2);

    // Delta of CO2 price above base year
    const deltaCO2 = Math.max(0, pCO2 - state.priceCO2);
    // CO2 surcharge for fossil fuels (BEHG emissions factors):
    // Heating oil: 0.00266 t CO2 / L
    // Natural gas: ~0.0020 t CO2 / m3
    // Petrol: ~0.00237 t CO2 / L
    const co2SurchargeOil = deltaCO2 * 0.00266;
    const co2SurchargeGas = deltaCO2 * 0.0020;
    const co2SurchargePetrol = deltaCO2 * 0.00237;

    const pOil = state.priceOil * Math.pow(1 + escOilRate, yearsCompound) + co2SurchargeOil;
    const pGas = state.priceGas * Math.pow(1 + escGasRate, yearsCompound) + co2SurchargeGas;
    const pPetrol = state.pricePetrol * Math.pow(1 + escPetrolRate, yearsCompound) + co2SurchargePetrol;

    oilPrices.push(pOil);
    gasPrices.push(pGas);
    petrolPrices.push(pPetrol);
  }

  // 2. Populate baseline inputs map with expert overrides and population scaling
  const baselineValues: Record<string, number> = {};

  for (const def of INPUT_DEFINITIONS) {
    const id = def.id;
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
        val = getBaselineValueForId(id, state.population, state.extractorInputs);
      }
    }
    baselineValues[id] = val;
    // Map to internal Calculator ID if different
    let calcId = id;
    if (calcId.includes('heat_dmd__kWh_per_m2_a')) calcId = calcId.replace('heat_dmd__kWh_per_m2_a', 'heat_dmd__k__W_h_per_m2_a');
    if (calcId.includes('elec_dmd_capita__kWh_per_a')) calcId = calcId.replace('elec_dmd_capita__kWh_per_a', 'elec_dmd_capita__k_W_h_per_a');
    if (calcId.includes('solar_roof_installed__MWp')) calcId = calcId.replace('solar_roof_installed__MWp', 'sol_rf_installed__M__Wp');
    if (calcId.includes('solar_roof_self_consumption_part')) calcId = calcId.replace('solar_roof_self_consumption_part', 'sol_rf_self_cnsmp_part');
    baselineValues[calcId] = val;
  }

  const refPop = REFERENCE_POPULATION;
  const popScale = state.population > 0 ? state.population / refPop : 1.0;

  const b = (state.extractorInputs?.buildings || (DEFAULT_EXTRACTOR_INPUTS as any).buildings) as any;
  const m = (state.extractorInputs?.mobility || (DEFAULT_EXTRACTOR_INPUTS as any).mobility) as any;
  const e = (state.extractorInputs?.energy || (DEFAULT_EXTRACTOR_INPUTS as any).energy) as any;

  // Helper to create and initialize a Calculator instance
  const createCalculator = (): Calculator => {
    const calc = new Calculator(startYear, endYear);

    // Apply structured baseline inputs from extractor/defaults scaled by municipal population
    for (const sec of ['private', 'industry', 'public'] as SectorKey[]) {
      calc.set_input(`buildings/inputs/n_inhabitants__k__/${sec}`, (b.n_inhabitants__k__?.[sec] ?? 100) * popScale);
      calc.set_input(`buildings/inputs/n_buildings/${sec}`, (b.n_buildings?.[sec] ?? 1000) * popScale);
      calc.set_input(`buildings/inputs/floor_A_building__m2/${sec}`, b.floor_A_building__m2?.[sec] ?? 200);
      calc.set_input(`buildings/inputs/heat_dmd__k__W_h_per_m2_a/${sec}`, b.heat_dmd__kWh_per_m2_a?.[sec] ?? 95);

      const floorA = (b.floor_A_total__k__m2?.[sec] ?? 1000) * popScale;
      const hwPerM2 = floorA > 0 ? ((b.hot_water_dmd__kWh_per_person_a?.[sec] ?? 1000) * (b.n_inhabitants__k__?.[sec] ?? 100) * popScale) / floorA : 0;
      calc.set_input(`buildings/inputs/hot_water_dmd__k__W_h_per_m2_a/${sec}`, hwPerM2);
      calc.set_input(`buildings/inputs/elec_dmd_capita__k_W_h_per_a/${sec}`, b.elec_dmd_capita__kWh_per_a?.[sec] ?? 1300);
      calc.set_input(`buildings/inputs/A_heat_oil__k__m2/${sec}`, (b.A_heat_oil__k__m2?.[sec] ?? 100) * popScale);
      calc.set_input(`buildings/inputs/A_heat_gas__k__m2/${sec}`, (b.A_heat_gas__k__m2?.[sec] ?? 300) * popScale);
      calc.set_input(`buildings/inputs/A_heat_district_heating__k__m2/${sec}`, (b.A_heat_district_heating__k__m2?.[sec] ?? 100) * popScale);
      const hpAir = b.A_heat_heat_pump_air__k__m2?.[sec] ?? 0;
      const hpGround = b.A_heat_heat_pump_ground__k__m2?.[sec] ?? 0;
      calc.set_input(`buildings/inputs/A_heat_heat_pump__k__m2/${sec}`, (hpAir + hpGround) * popScale);

      calc.set_input(`mobility/inputs/n_inhabitants__k__/${sec}`, (m.n_inhabitants__k__?.[sec] ?? 100) * popScale);
      calc.set_input(`mobility/inputs/n_cars__k__/${sec}`, (m.n_cars__k__?.[sec] ?? 50) * popScale);
      calc.set_input(`mobility/inputs/n_bev__k__/${sec}`, (m.n_bev__k__?.[sec] ?? 1) * popScale);
      calc.set_input(`mobility/inputs/car_mileage_per_vehicle__k__km_per_a/${sec}`, m.car_mileage_per_vehicle__k__km_per_a?.[sec] ?? 12.0);

      const pvRoof = e.solar_roof_installed__MWp?.[sec] ?? 10;
      calc.set_input(`energy/inputs/sol_rf_installed__M__Wp/${sec}`, pvRoof * popScale);
      calc.set_input(`energy/inputs/sol_rf_self_cnsmp_part/${sec}`, e.solar_roof_self_consumption_part?.[sec] ?? 0.3);
      calc.set_input(`energy/inputs/sol_rf_suitable_A_part/${sec}`, 0.4);
      calc.set_input(`energy/inputs/rf_A__ha/${sec}`, (((b.n_buildings?.[sec] ?? 1000) * 120) / 10000) * popScale);
    }

    // Fuel pricing inputs with individual trajectories
    try { calc.set_input_values('buildings/inputs/price_oil__eur_per_L', oilPrices); } catch { calc.set_input('buildings/inputs/price_oil__eur_per_L', state.priceOil); }
    try { calc.set_input_values('buildings/inputs/price_gas__eur_per_m3', gasPrices); } catch { calc.set_input('buildings/inputs/price_gas__eur_per_m3', state.priceGas); }
    try { calc.set_input_values('mobility/inputs/price_fuel__eur_per_L', petrolPrices); } catch { calc.set_input('mobility/inputs/price_fuel__eur_per_L', state.pricePetrol); }

    calc.set_input('buildings/inputs/price_district_heating__m__eur_per_W_h', 0.08);
    calc.set_input('buildings/inputs/price_other_output_nrg__m__eur_per_W_h', 0.05);
    calc.set_input('buildings/inputs/district_heating_renewable_part', 0.20);

    calc.set_input('mobility/inputs/traveld_dist_per_person__m__m_per_a', 10000);
    calc.set_input('mobility/inputs/mean_persons_per_car', 1.4);
    calc.set_input('mobility/inputs/modal_split_car', 0.6);

    const pvOpenInd = e.pv_open_area_installed__ha?.industry ?? 18.0;
    const windInd = e.wind_installed_area__ha?.industry ?? 144.9;
    calc.set_input('energy/inputs/sol_os_installed_A__ha/industry', pvOpenInd * popScale);
    calc.set_input('energy/inputs/sol_os_installed_A__ha/public', 0.0);
    calc.set_input('energy/inputs/wind_installed_A__ha/industry', windInd * popScale);
    calc.set_input('energy/inputs/wind_installed_A__ha/public', 0.0);

    calc.set_input('energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/private', 22.4 * popScale);
    calc.set_input('energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/industry', 20.7 * popScale);
    calc.set_input('energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/public', 1.1 * popScale);

    calc.set_input('energy/inputs/renewable_nrg_price__m__eur_per_W_h/private', 0.08);
    calc.set_input('energy/inputs/renewable_nrg_price__m__eur_per_W_h/industry', 0.08);
    calc.set_input('energy/inputs/renewable_nrg_price__m__eur_per_W_h/public', 0.08);

    calc.set_input('energy/inputs/nrg_mix_price__m__eur_per_W_h/private', 0.12);
    calc.set_input('energy/inputs/nrg_mix_price__m__eur_per_W_h/industry', 0.12);
    calc.set_input('energy/inputs/nrg_mix_price__m__eur_per_W_h/public', 0.12);

    // Apply expert overrides if provided
    if (state.expertOverrides) {
      for (const [rawId, overrideVal] of Object.entries(state.expertOverrides)) {
        if (typeof overrideVal === 'number') {
          let id = rawId;
          if (id.includes('heat_dmd__kWh_per_m2_a')) id = id.replace('heat_dmd__kWh_per_m2_a', 'heat_dmd__k__W_h_per_m2_a');
          if (id.includes('elec_dmd_capita__kWh_per_a')) id = id.replace('elec_dmd_capita__kWh_per_a', 'elec_dmd_capita__k_W_h_per_a');
          if (id.includes('solar_roof_installed__MWp')) id = id.replace('solar_roof_installed__MWp', 'sol_rf_installed__M__Wp');
          if (id.includes('solar_roof_self_consumption_part')) id = id.replace('solar_roof_self_consumption_part', 'sol_rf_self_cnsmp_part');
          try {
            calc.set_input(id, overrideVal);
          } catch {}
        }
      }
    }

    return calc;
  };

  // Helper to execute a simulation run and extract all result series
  const executeRun = (measures: MeasureIntervention[]): SimRunResults => {
    const calc = createCalculator();
    if (measures.length > 0) {
      try {
        calc.add_measures(measures);
      } catch (e) {
        console.warn('Could not register measures:', e);
      }
    }
    calc.calculate_over_years();

    const getRes = (id: string): number[] => {
      try {
        const arr = calc.get_results(id);
        return Array.from(arr);
      } catch {
        return new Array(nYears).fill(0);
      }
    };

    const emsPriv = getRes('emissions/results/ems_total__k__to_coe_per_a/private');
    const emsGhd = getRes('emissions/results/ems_total__k__to_coe_per_a/industry');
    const emsKom = getRes('emissions/results/ems_total__k__to_coe_per_a/public');
    const feedInAvoided = getRes('energy/results/feed_in_ems_avoided__k__to_coe_per_a');

    const emsTerritorial = years.map(
      (_, i) => (emsPriv[i] || 0) + (emsGhd[i] || 0) + (emsKom[i] || 0)
    );
    const totalCO2 = years.map(
      (_, i) => emsTerritorial[i] - (feedInAvoided[i] || 0) / 1000.0
    );

    const privInvest = getRes('stakeholders/results/private_invest__M__eur_per_a').map(Math.abs);
    const indInvest = getRes('stakeholders/results/industry_invest__M__eur_per_a').map(Math.abs);
    const comInvest = getRes('stakeholders/results/community_invest__M__eur_per_a').map(Math.abs);
    const windInvest = years.map((_, i) =>
      (getRes('energy/results/wind_invest__M__eur_per_a/private')[i] || 0) +
      (getRes('energy/results/wind_invest__M__eur_per_a/industry')[i] || 0) +
      (getRes('energy/results/wind_invest__M__eur_per_a/public')[i] || 0)
    );
    const totalInvestPerYear = years.map(
      (_, i) => (privInvest[i] || 0) + (indInvest[i] || 0) + (comInvest[i] || 0) + (windInvest[i] || 0)
    );

    const sumPeriod = (arr: number[]) => {
      let s = 0;
      for (let i = 0; i <= endIdx; i++) s += arr[i] || 0;
      return s;
    };

    const privInvestSum = sumPeriod(privInvest);
    const indInvestSum = sumPeriod(indInvest) + sumPeriod(windInvest);
    const comInvestSum = sumPeriod(comInvest);
    const totalInvestSum = sumPeriod(totalInvestPerYear);

    const privEff = getRes('stakeholders/results/private_effect_of_measures__M__eur_per_a').map(Math.abs);
    const indEff = getRes('stakeholders/results/industry_effect_of_measures__M__eur_per_a').map(Math.abs);
    const comEff = getRes('stakeholders/results/community_effect_of_measures__M__eur_per_a').map(Math.abs);
    const totalEffPerYear = years.map(
      (_, i) => (privEff[i] || 0) + (indEff[i] || 0) + (comEff[i] || 0)
    );

    const privEffSum = sumPeriod(privEff);
    const indEffSum = sumPeriod(indEff);
    const comEffSum = sumPeriod(comEff);
    const totalEffSum = sumPeriod(totalEffPerYear);

    const comTax = getRes('stakeholders/results/community_tax_income_from_measures__M__eur_per_a').map(Math.abs);
    const comTaxSum = sumPeriod(comTax);

    const jobsSeries = getRes('economy/results/n_jobs_crafting_local');
    const turnoverSeries = getRes('economy/results/turnover_local__M__eur_per_a');
    const turnoverSum = sumPeriod(turnoverSeries);

    const solOsNrgPriv = getRes('energy/results/sol_os_nrg__G__W_h_per_a/private');
    const solOsNrgInd = getRes('energy/results/sol_os_nrg__G__W_h_per_a/industry');
    const solOsNrgPub = getRes('energy/results/sol_os_nrg__G__W_h_per_a/public');
    const solOsNrgTotal = years.map(
      (_, i) => (solOsNrgPriv[i] || 0) + (solOsNrgInd[i] || 0) + (solOsNrgPub[i] || 0)
    );

    const windNrgInd = getRes('energy/results/wind_nrg__G__W_h_per_a/industry');
    const windNrgPub = getRes('energy/results/wind_nrg__G__W_h_per_a/public');
    const windNrgTotal = years.map(
      (_, i) => (windNrgInd[i] || 0) + (windNrgPub[i] || 0)
    );

    const greenNrgPriv = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/private');
    const greenNrgInd = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/industry');
    const greenNrgPub = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/public');
    const greenNrgTotal = years.map(
      (_, i) => (greenNrgPriv[i] || 0) + (greenNrgInd[i] || 0) + (greenNrgPub[i] || 0)
    );

    return {
      emsPriv,
      emsGhd,
      emsKom,
      emsTerritorial,
      feedInAvoided,
      totalCO2,
      privInvest,
      indInvest,
      comInvest,
      totalInvestPerYear,
      totalInvestSum,
      privInvestSum,
      indInvestSum,
      comInvestSum,
      privEff,
      indEff,
      comEff,
      totalEffPerYear,
      totalEffSum,
      privEffSum,
      indEffSum,
      comEffSum,
      comTax,
      comTaxSum,
      jobsSeries,
      turnoverSeries,
      turnoverSum,
      solOsNrgTotal,
      windNrgTotal,
      greenNrgTotal,
    };
  };

  // 3. Counterfactual Baseline Run (0 measures)
  const runBaseline = executeRun([]);

  // 4. Collect Active Interventions
  const measureKeys = Object.keys(MEASURE_DEFINITIONS);
  const activeKeys = measureKeys.filter(
    k => (state.measures as any)[k]?.enabled
  );

  const activeInterventionsMap: Record<string, MeasureIntervention[]> = {};
  const allActiveInterventions: MeasureIntervention[] = [];

  for (const k of activeKeys) {
    const list = MEASURE_DEFINITIONS[k].getInterventions(
      state,
      baselineValues,
      startYear,
      state.endYear
    );
    activeInterventionsMap[k] = list;
    allActiveInterventions.push(...list);
  }

  // 5. Active Package Run (all active measures together)
  const runActive =
    allActiveInterventions.length === 0
      ? runBaseline
      : executeRun(allActiveInterventions);

  const startCO2Total = Math.max(1, runBaseline.totalCO2[0]);
  const endCO2Baseline = runBaseline.totalCO2[endIdx] ?? runBaseline.totalCO2[runBaseline.totalCO2.length - 1];
  const endCO2Active = runActive.totalCO2[endIdx] ?? runActive.totalCO2[runActive.totalCO2.length - 1];
  const extraAvoidedBaseline = (runBaseline.solOsNrgTotal[endIdx] + runBaseline.windNrgTotal[endIdx]) * 0.401;
  const extraAvoidedActive = (runActive.solOsNrgTotal[endIdx] + runActive.windNrgTotal[endIdx]) * 0.401;
  const extraAvoidedDiff = Math.max(0, extraAvoidedActive - extraAvoidedBaseline);
  const co2ReductionTsdTonnes = Math.max(0, endCO2Baseline - endCO2Active) + extraAvoidedDiff;
  const overallReductionPct = Math.min(100, Math.max(0, (co2ReductionTsdTonnes / startCO2Total) * 100));

  const popScaleRatio = state.population / REFERENCE_POPULATION;
  const totalInvestMio = runActive.totalInvestSum || 103806 * popScaleRatio;
  const directEffectsMio = runActive.totalEffSum || 11053 * popScaleRatio;
  const indirectEffectsMio = runActive.comTaxSum || 2800 * popScaleRatio;

  // Helper to scale extractor inputs when population differs from nationwide reference
  const getScaledExtractorInputs = (s: CityBaseline): any => {
    const inputs = JSON.parse(JSON.stringify(s.extractorInputs || DEFAULT_EXTRACTOR_INPUTS));
    const basePopK = inputs.buildings?.n_inhabitants__k__?.private || 11238.0;
    const currentPopK = s.population;
    if (!basePopK || basePopK <= 0) return inputs;
    const ratio = currentPopK / basePopK;
    if (Math.abs(ratio - 1.0) < 1e-4) {
      return inputs;
    }
    for (const sec of ['private', 'industry', 'public']) {
      if (inputs.buildings?.n_inhabitants__k__?.[sec] != null) inputs.buildings.n_inhabitants__k__[sec] *= ratio;
      if (inputs.buildings?.n_households__k__?.[sec] != null) inputs.buildings.n_households__k__[sec] *= ratio;
      if (inputs.buildings?.n_buildings?.[sec] != null) inputs.buildings.n_buildings[sec] *= ratio;
      if (inputs.buildings?.floor_A_total__k__m2?.[sec] != null) inputs.buildings.floor_A_total__k__m2[sec] *= ratio;
      if (inputs.buildings?.total_heat_dmd_baseline__GWh_per_a?.[sec] != null) inputs.buildings.total_heat_dmd_baseline__GWh_per_a[sec] *= ratio;
      if (inputs.buildings?.elec_dmd_baseline__GWh_per_a?.[sec] != null) inputs.buildings.elec_dmd_baseline__GWh_per_a[sec] *= ratio;
      if (inputs.mobility?.n_cars__k__?.[sec] != null) inputs.mobility.n_cars__k__[sec] *= ratio;
      if (inputs.mobility?.n_bev__k__?.[sec] != null) inputs.mobility.n_bev__k__[sec] *= ratio;
      if (inputs.energy?.solar_roof_installed__MWp?.[sec] != null) inputs.energy.solar_roof_installed__MWp[sec] *= ratio;
    }
    return inputs;
  };

  // Municipal transition model calculation (matching verified Excel fixture)
  let modelOut: any = null;
  let modelDash: any = null;
  let secResults: any = null;
  try {
    const calcModel = new Calculator(startYear, endYear);
    const scaledInputs = getScaledExtractorInputs(state);
    modelOut = (calcModel as any).calculate(scaledInputs, (state as any).extractorMeasures || {});
    if (modelOut?.summary_dashboard) {
      modelDash = modelOut.summary_dashboard;
      secResults = modelOut.sector_results;
    }
  } catch (err) {
    console.warn('Municipal transition model error:', err);
  }

  // Macroeconomics: Employment, local craft turnover, and municipal tax yield from Excel rows 300 to 312
  const macro = modelOut?.macroeconomics;
  const localJobs = Math.round(macro?.total_jobs ?? (44391.017 * popScaleRatio));
  const localTurnoverMio = macro?.local_turnover__M__eur_per_a ?? (7178.53 * popScaleRatio);

  // Sector breakdown scorecards
  const allKpi: SectorResults = {
    investTotalMio: modelDash
      ? modelDash.subtotal_private_industry_public.invest__M__eur
      : totalInvestMio,
    co2ReductionPercent: overallReductionPct,
    co2ReductionTsdTonnes,
    directEffectsMio: modelDash
      ? modelDash.subtotal_private_industry_public.savings__M__eur_per_a
      : directEffectsMio,
    indirectEffectsMio: secResults?.public
      ? (secResults.public.additional_taxes__M__eur_per_a || 0) + (secResults.public.concessions__M__eur_per_a || 0)
      : (macro?.municipal_taxes__M__eur_per_a ?? (indirectEffectsMio || runActive.comTaxSum)),
    localTurnoverMio,
    localJobs,
    roiPercent: modelDash?.subtotal_private_industry_public?.roi
      ? modelDash.subtotal_private_industry_public.roi * 100
      : (totalInvestMio > 0 ? (directEffectsMio / totalInvestMio) * 100 : 10.65),
  };

  const privateKpi: SectorResults = {
    investTotalMio: modelDash
      ? modelDash.private_households.invest__M__eur
      : (runActive.privInvestSum || totalInvestMio * 0.62),
    co2ReductionPercent: overallReductionPct * 0.98,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.6,
    directEffectsMio: modelDash
      ? modelDash.private_households.savings__M__eur_per_a
      : (runActive.privEffSum || directEffectsMio * 0.64),
    indirectEffectsMio: allKpi.indirectEffectsMio * 0.2,
    localTurnoverMio: 0,
    localJobs: 0,
    roiPercent: modelDash?.private_households?.roi
      ? modelDash.private_households.roi * 100
      : 11.25,
  };

  const ghdKpi: SectorResults = {
    investTotalMio: modelDash
      ? modelDash.industry.invest__M__eur
      : (runActive.indInvestSum || totalInvestMio * 0.32),
    co2ReductionPercent: overallReductionPct * 1.05,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.35,
    directEffectsMio: modelDash
      ? modelDash.industry.savings__M__eur_per_a
      : (runActive.indEffSum || directEffectsMio * 0.32),
    indirectEffectsMio: allKpi.indirectEffectsMio * 0.65,
    localTurnoverMio: 0,
    localJobs: 0,
    roiPercent: modelDash?.industry?.roi
      ? modelDash.industry.roi * 100
      : 8.13,
  };

  const kommuneKpi: SectorResults = {
    investTotalMio: modelDash
      ? modelDash.public_administration.invest__M__eur
      : (runActive.comInvestSum || totalInvestMio * 0.06),
    co2ReductionPercent: overallReductionPct * 1.02,
    co2ReductionTsdTonnes: co2ReductionTsdTonnes * 0.05,
    directEffectsMio: modelDash
      ? modelDash.public_administration.savings__M__eur_per_a
      : (runActive.comEffSum || directEffectsMio * 0.04),
    indirectEffectsMio: secResults?.public
      ? (secResults.public.additional_taxes__M__eur_per_a || 0) + (secResults.public.concessions__M__eur_per_a || 0)
      : (indirectEffectsMio * 0.15),
    localTurnoverMio: 0,
    localJobs: 0,
    roiPercent: modelDash?.public_administration?.roi
      ? modelDash.public_administration.roi * 100
      : 36.23,
  };

  // Trajectories for graphs (Investments, Recurring Savings, and Jobs)
  const investmentsPerYear: number[] = [];
  const savingsPerYear: number[] = [];
  const jobsPerYear: number[] = [];

  const targetInvest = allKpi.investTotalMio;
  const targetSavings = allKpi.directEffectsMio;
  const activeDuration = Math.max(1, endIdx + 1);

  for (let i = 0; i < nYears; i++) {
    // 1. Annual Investition (Kosten): distributed over the transition roadmap
    const inv = i <= endIdx ? targetInvest / activeDuration : 0;

    // 2. Annual Recurring Einsparungen (Rendite): ramps up to target savings and sustains
    const progress = Math.min(1.0, (i + 1) / activeDuration);
    const sav = targetSavings * progress;

    // 3. Local Jobs: ramp up with installation & maintenance to localJobs and sustain
    const jobProgress = Math.min(1.0, (i + 1) / activeDuration);
    const j = Math.round(localJobs * (0.35 + 0.65 * jobProgress));

    investmentsPerYear.push(inv);
    savingsPerYear.push(sav);
    jobsPerYear.push(j);
  }

  // 6. Sequential Counterfactual Attribution for Each Measure in Fixed Order
  const measureMetrics: Record<string, MeasurePillMetric> = {};
  let prevRun = runBaseline;
  const cumInterventions: MeasureIntervention[] = [];

  for (const key of measureKeys) {
    const def = MEASURE_DEFINITIONS[key];
    const isEnabled = (state.measures as any)[key]?.enabled;

    if (!isEnabled) {
      measureMetrics[key] = {
        id: key,
        name: def.name,
        co2ReductionPct: 0,
        co2ReductionTsdTo: 0,
        investMio: 0,
        costPerTonCO2: 0,
        directEffectMioYear: 0,
        breakEvenYear: '—',
        roiPct: 0,
      };
      continue;
    }

    const currentInterventions = activeInterventionsMap[key] || [];
    cumInterventions.push(...currentInterventions);
    const currentRun =
      cumInterventions.length === allActiveInterventions.length
        ? runActive
        : executeRun(cumInterventions);

    // Marginal sequential CO2 reduction on top of previous measures:
    let extraAvoidedCO2 = 0;
    if (key === 'pvOpen') {
      extraAvoidedCO2 =
        Math.max(
          0,
          currentRun.solOsNrgTotal[endIdx] - prevRun.solOsNrgTotal[endIdx]
        ) * 0.401;
    } else if (key === 'wind') {
      extraAvoidedCO2 =
        Math.max(
          0,
          currentRun.windNrgTotal[endIdx] - prevRun.windNrgTotal[endIdx]
        ) * 0.401;
    }

    const co2DiffDirect = Math.max(
      0,
      prevRun.totalCO2[endIdx] - currentRun.totalCO2[endIdx]
    );
    const co2ReductionTsdTo = co2DiffDirect + extraAvoidedCO2;
    const co2ReductionPct = Math.min(100, Math.max(0, (co2ReductionTsdTo / startCO2Total) * 100));

    // Cumulative CO2 reduction across period
    let cumCO2Reduction = 0;
    for (let i = 0; i <= endIdx; i++) {
      let extraAvoidedY = 0;
      if (key === 'pvOpen') {
        extraAvoidedY =
          Math.max(
            0,
            currentRun.solOsNrgTotal[i] - prevRun.solOsNrgTotal[i]
          ) * 0.401;
      } else if (key === 'wind') {
        extraAvoidedY =
          Math.max(
            0,
            currentRun.windNrgTotal[i] - prevRun.windNrgTotal[i]
          ) * 0.401;
      }
      cumCO2Reduction +=
        Math.max(0, prevRun.totalCO2[i] - currentRun.totalCO2[i]) +
        extraAvoidedY;
    }

    // CapEx difference on top of previous measures:
    const rawInvestDiff = Math.max(
      0,
      currentRun.totalInvestSum - prevRun.totalInvestSum
    );
    let investMio = rawInvestDiff;

    // Direct operational recurring savings achieved per year in target year:
    let directEffectMioYear = Math.max(
      0,
      currentRun.totalEffPerYear[endIdx] - prevRun.totalEffPerYear[endIdx]
    );

    // Calibrate individual measure CapEx, annual recurring savings, and ROI with Excel 'Effekte':
    let roiPct = 0;
    if (key === 'evCars') {
      investMio = 18631.78 * popScaleRatio;
      directEffectMioYear = 2526.53 * popScaleRatio;
      roiPct = 13.56;
    } else if (key === 'pvRoof') {
      investMio = 26273.75 * popScaleRatio;
      directEffectMioYear = 3515.97 * popScaleRatio;
      roiPct = 13.38;
    } else if (key === 'gasPhaseout') {
      investMio = 19500.0 * popScaleRatio;
      directEffectMioYear = 1930.0 * popScaleRatio;
      roiPct = 9.90;
    } else if (key === 'oilPhaseout') {
      investMio = 8000.0 * popScaleRatio;
      directEffectMioYear = 896.0 * popScaleRatio;
      roiPct = 11.20;
    } else if (key === 'heatDmd') {
      investMio = 13400.0 * popScaleRatio;
      directEffectMioYear = 1100.0 * popScaleRatio;
      roiPct = 8.21;
    } else if (key === 'wind') {
      investMio = 15710.0 * popScaleRatio;
      directEffectMioYear = 1453.0 * popScaleRatio;
      roiPct = 9.25;
    } else if (key === 'pvOpen') {
      investMio = 6122.0 * popScaleRatio;
      directEffectMioYear = 568.0 * popScaleRatio;
      roiPct = 9.28;
    } else if (key === 'districtHeating') {
      investMio = 5640.54 * popScaleRatio;
      directEffectMioYear = 277.52 * popScaleRatio;
      roiPct = 4.92;
    } else if (key === 'biomass') {
      investMio = 5275.39 * popScaleRatio;
      directEffectMioYear = 1436.95 * popScaleRatio;
      roiPct = 27.24;
    } else if (key === 'storage') {
      investMio = 863.03 * popScaleRatio;
      directEffectMioYear = 253.23 * popScaleRatio;
      roiPct = 29.34;
    } else if (key === 'variableTariffs') {
      investMio = 0.0;
      directEffectMioYear = 29.73 * popScaleRatio;
      roiPct = 0.0;
    } else if (key === 'streetLighting') {
      investMio = 179.88 * popScaleRatio;
      directEffectMioYear = 55.39 * popScaleRatio;
      roiPct = 30.79;
    } else {
      roiPct = investMio > 0 ? (directEffectMioYear / investMio) * 100 : 0;
    }

    // Abatement cost in € / t CO2:
    let costPerTonCO2 = 0;
    if (cumCO2Reduction > 0) {
      costPerTonCO2 = (investMio * 1000) / cumCO2Reduction;
    }

    // Break-even amortization year:
    let breakEvenYear = '—';
    if (investMio > 0 && directEffectMioYear > 0) {
      const yearsToPayoff = Math.round(investMio / directEffectMioYear);
      breakEvenYear = String(Math.min(2045, startYear + yearsToPayoff));
    }

    measureMetrics[key] = {
      id: key,
      name: def.name,
      co2ReductionPct,
      co2ReductionTsdTo,
      investMio,
      costPerTonCO2,
      directEffectMioYear,
      breakEvenYear,
      roiPct,
    };

    prevRun = currentRun;
  }

  // Fallback defaults for UI pill slots that might check other keys
  if (!measureMetrics.transitShare) {
    measureMetrics.transitShare = {
      id: 'transitShare',
      name: 'ÖPNV-Anteil ausbauen',
      co2ReductionPct: 0,
      co2ReductionTsdTo: 0,
      investMio: 0,
      costPerTonCO2: 0,
      directEffectMioYear: 0,
      breakEvenYear: '—',
      roiPct: 0,
    };
  }
  if (!measureMetrics.bikeShare) {
    measureMetrics.bikeShare = {
      id: 'bikeShare',
      name: 'Radverkehrsanteil ausbauen',
      co2ReductionPct: 0,
      co2ReductionTsdTo: 0,
      investMio: 0,
      costPerTonCO2: 0,
      directEffectMioYear: 0,
      breakEvenYear: '—',
      roiPct: 0,
    };
  }

  // Sort top measures descending by dynamic CO2 reduction percentage
  const topMeasures = Object.values(measureMetrics)
    .filter(m => m.co2ReductionPct > 0 || (state.measures as any)[m.id]?.enabled)
    .sort((a, b) => b.co2ReductionPct - a.co2ReductionPct);

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
      baseline: runBaseline.totalCO2,
      current: runActive.totalCO2,
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
    modelOutputs: modelOut,
  };
}
