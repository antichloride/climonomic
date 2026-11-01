import { describe, it, expect, beforeAll } from 'vitest';
import { Calculator } from '../pkg/climcalc_core.js';
import { V5_INPUT_DEFINITIONS } from '../frontend/src/schema';
import { createDefaultState, getBaselineValueForId } from '../frontend/src/baseline-data';
import { runSimulation } from '../frontend/src/wasm-engine';
import initWasm from '../pkg-web/climcalc_core.js';
import fs from 'fs';
import path from 'path';

beforeAll(async () => {
  const wasmBuffer = fs.readFileSync(path.resolve(__dirname, '../pkg-web/climcalc_core_bg.wasm'));
  await initWasm({ module_or_path: wasmBuffer });
});

interface MeasureIntervention {
  id: string;
  inputId: string;
  startYear: number;
  endYear: number;
  delta: number;
}

const MEASURE_DEFINITIONS: Record<string, {
  id: string;
  name: string;
  getInterventions: (s: any, b: Record<string, number>, startYear: number, endYear: number) => MeasureIntervention[];
}> = {
  heatDmd: {
    id: 'heatDmd',
    name: 'Heizbedarf senken',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.heatDmd;
      const basePriv = 114;
      const baseGhd = 96;
      const baseKom = 96;

      const dPriv = Math.max(0, basePriv - m.targetPrivate);
      const dGhd = Math.max(0, baseGhd - m.targetGHD);
      const dKom = Math.max(0, baseKom - m.targetKommune);

      if (dPriv > 0) list.push({ id: 'm_hd_priv', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/private', startYear, endYear, delta: dPriv });
      if (dGhd > 0) list.push({ id: 'm_hd_ghd', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry', startYear, endYear, delta: dGhd });
      if (dKom > 0) {
        list.push({ id: 'm_hd_pub', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/public', startYear, endYear, delta: dKom });
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

      if (dPriv > 0) list.push({ id: 'm_gas_priv', inputId: 'buildings/inputs/A_heat_gas__k__m2/private', startYear, endYear, delta: dPriv });
      if (dGhd > 0) list.push({ id: 'm_gas_ghd', inputId: 'buildings/inputs/A_heat_gas__k__m2/industry', startYear, endYear, delta: dGhd });
      if (dKom > 0) list.push({ id: 'm_gas_pub', inputId: 'buildings/inputs/A_heat_gas__k__m2/public', startYear, endYear, delta: dKom });
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

      if (dPriv > 0) list.push({ id: 'm_oil_priv', inputId: 'buildings/inputs/A_heat_oil__k__m2/private', startYear, endYear, delta: dPriv });
      if (dGhd > 0) list.push({ id: 'm_oil_ghd', inputId: 'buildings/inputs/A_heat_oil__k__m2/industry', startYear, endYear, delta: dGhd });
      if (dKom > 0) list.push({ id: 'm_oil_pub', inputId: 'buildings/inputs/A_heat_oil__k__m2/public', startYear, endYear, delta: dKom });
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

      if (dPriv > 0) list.push({ id: 'm_pvr_priv', inputId: 'energy/inputs/sol_rf_installed__M__Wp/private', startYear, endYear, delta: -dPriv });
      if (dGhd > 0) list.push({ id: 'm_pvr_ghd', inputId: 'energy/inputs/sol_rf_installed__M__Wp/industry', startYear, endYear, delta: -dGhd });
      if (dKom > 0) list.push({ id: 'm_pvr_pub', inputId: 'energy/inputs/sol_rf_installed__M__Wp/public', startYear, endYear, delta: -dKom });
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

      if (dGhd > 0) list.push({ id: 'm_pvo_ghd', inputId: 'energy/inputs/sol_os_installed_A__ha/industry', startYear, endYear, delta: -dGhd });
      if (dKom > 0) list.push({ id: 'm_pvo_pub', inputId: 'energy/inputs/sol_os_installed_A__ha/public', startYear, endYear, delta: -dKom });
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

      if (dGhd > 0) list.push({ id: 'm_wnd_ghd', inputId: 'energy/inputs/wind_installed_A__ha/industry', startYear, endYear, delta: -dGhd });
      if (dKom > 0) list.push({ id: 'm_wnd_pub', inputId: 'energy/inputs/wind_installed_A__ha/public', startYear, endYear, delta: -dKom });
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

      if (dPriv > 0) list.push({ id: 'm_ev_priv', inputId: 'mobility/inputs/n_bev__k__/private', startYear, endYear, delta: -dPriv });
      if (dGhd > 0) list.push({ id: 'm_ev_ghd', inputId: 'mobility/inputs/n_bev__k__/industry', startYear, endYear, delta: -dGhd });
      if (dKom > 0) list.push({ id: 'm_ev_pub', inputId: 'mobility/inputs/n_bev__k__/public', startYear, endYear, delta: -dKom });
      return list;
    },
  },
};

describe('Counterfactual Simulation Verification', () => {
  it('executes baseline, full package, and leave-one-out runs', () => {
    const state = createDefaultState();
    const startYear = state.startYear;
    const endYear = Math.max(state.endYear, 2045);
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);
    const nYears = years.length;
    const endIdx = Math.min(nYears - 1, Math.max(0, state.endYear - startYear));

    const b = (state.extractorInputs as any)?.buildings || (DEFAULT_EXTRACTOR_INPUTS as any).buildings;
    const m = (state.extractorInputs as any)?.mobility || (DEFAULT_EXTRACTOR_INPUTS as any).mobility;
    const e = (state.extractorInputs as any)?.energy || (DEFAULT_EXTRACTOR_INPUTS as any).energy;
    const refPop = 11238;
    const popScale = state.population > 0 ? state.population / refPop : 1.0;

    const baselineValues: Record<string, number> = {};
    for (const def of V5_INPUT_DEFINITIONS) {
      const id = def.id;
      if (id === 'buildings/inputs/price_oil__eur_per_L') {
        baselineValues[id] = state.priceOil;
      } else if (id === 'buildings/inputs/price_gas__eur_per_m3') {
        baselineValues[id] = state.priceGas;
      } else if (id === 'mobility/inputs/price_fuel__eur_per_L') {
        baselineValues[id] = state.pricePetrol;
      } else {
        baselineValues[id] = getBaselineValueForId(id, state.population);
      }
      let calcId = id;
      if (calcId.includes('heat_dmd__kWh_per_m2_a')) calcId = calcId.replace('heat_dmd__kWh_per_m2_a', 'heat_dmd__k__W_h_per_m2_a');
      if (calcId.includes('elec_dmd_capita__kWh_per_a')) calcId = calcId.replace('elec_dmd_capita__kWh_per_a', 'elec_dmd_capita__k_W_h_per_a');
      if (calcId.includes('solar_roof_installed__MWp')) calcId = calcId.replace('solar_roof_installed__MWp', 'sol_rf_installed__M__Wp');
      if (calcId.includes('solar_roof_self_consumption_part')) calcId = calcId.replace('solar_roof_self_consumption_part', 'sol_rf_self_cnsmp_part');
      baselineValues[calcId] = baselineValues[id];
    }

    const runCalc = (measures: MeasureIntervention[]) => {
      const calc = new Calculator(startYear, endYear);

      for (const sec of ['private', 'industry', 'public']) {
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

      calc.set_input('buildings/inputs/price_oil__eur_per_L', state.priceOil);
      calc.set_input('buildings/inputs/price_gas__eur_per_m3', state.priceGas);
      calc.set_input('buildings/inputs/price_district_heating__m__eur_per_W_h', 0.08);
      calc.set_input('buildings/inputs/price_other_output_nrg__m__eur_per_W_h', 0.05);
      calc.set_input('buildings/inputs/district_heating_renewable_part', 0.20);

      calc.set_input('mobility/inputs/price_fuel__eur_per_L', state.pricePetrol);
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

      if (measures.length > 0) {
        calc.add_measures(measures);
      }
      calc.calculate_over_years();

      const getRes = (id: string): number[] => {
        try {
          return Array.from(calc.get_results(id));
        } catch (e) {
          return new Array(nYears).fill(0);
        }
      };

      const emsPriv = getRes('emissions/results/ems_total__k__to_coe_per_a/private');
      const emsGhd = getRes('emissions/results/ems_total__k__to_coe_per_a/industry');
      const emsKom = getRes('emissions/results/ems_total__k__to_coe_per_a/public');

      const feedInAvoided = getRes('energy/results/feed_in_ems_avoided__k__to_coe_per_a');
      const emsTerritorial = years.map((_, i) => (emsPriv[i] || 0) + (emsGhd[i] || 0) + (emsKom[i] || 0));
      const totalCO2 = years.map((_, i) => emsTerritorial[i] - ((feedInAvoided[i] || 0) / 1000.0));

      const privInvest = getRes('stakeholders/results/private_invest__M__eur_per_a').map(Math.abs);
      const indInvest = getRes('stakeholders/results/industry_invest__M__eur_per_a').map(Math.abs);
      const comInvest = getRes('stakeholders/results/community_invest__M__eur_per_a').map(Math.abs);
      const windInvest = years.map((_, i) =>
        (getRes('energy/results/wind_invest__M__eur_per_a/private')[i] || 0) +
        (getRes('energy/results/wind_invest__M__eur_per_a/industry')[i] || 0) +
        (getRes('energy/results/wind_invest__M__eur_per_a/public')[i] || 0)
      );
      const totalInvestPerYear = years.map((_, i) => (privInvest[i] || 0) + (indInvest[i] || 0) + (comInvest[i] || 0) + (windInvest[i] || 0));
      const totalInvestSum = totalInvestPerYear.slice(0, endIdx + 1).reduce((a, b) => a + b, 0);

      const privEff = getRes('stakeholders/results/private_effect_of_measures__M__eur_per_a').map(Math.abs);
      const indEff = getRes('stakeholders/results/industry_effect_of_measures__M__eur_per_a').map(Math.abs);
      const comEff = getRes('stakeholders/results/community_effect_of_measures__M__eur_per_a').map(Math.abs);
      const totalEffPerYear = years.map((_, i) => (privEff[i] || 0) + (indEff[i] || 0) + (comEff[i] || 0));
      const totalEffSum = totalEffPerYear.slice(0, endIdx + 1).reduce((a, b) => a + b, 0);

      const solOsNrgPriv = getRes('energy/results/sol_os_nrg__G__W_h_per_a/private');
      const solOsNrgInd = getRes('energy/results/sol_os_nrg__G__W_h_per_a/industry');
      const solOsNrgPub = getRes('energy/results/sol_os_nrg__G__W_h_per_a/public');
      const solOsNrgTotal = years.map((_, i) => (solOsNrgPriv[i] || 0) + (solOsNrgInd[i] || 0) + (solOsNrgPub[i] || 0));

      const windNrgInd = getRes('energy/results/wind_nrg__G__W_h_per_a/industry');
      const windNrgPub = getRes('energy/results/wind_nrg__G__W_h_per_a/public');
      const windNrgTotal = years.map((_, i) => (windNrgInd[i] || 0) + (windNrgPub[i] || 0));

      const greenNrgPriv = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/private');
      const greenNrgInd = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/industry');
      const greenNrgPub = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/public');
      const greenNrgTotal = years.map((_, i) => (greenNrgPriv[i] || 0) + (greenNrgInd[i] || 0) + (greenNrgPub[i] || 0));

      return {
        totalCO2,
        totalInvestPerYear,
        totalInvestSum,
        totalEffPerYear,
        totalEffSum,
        solOsNrgTotal,
        windNrgTotal,
        greenNrgTotal,
      };
    };

    const tStart = Date.now();

    // 1. Baseline Run (0 measures)
    const runBaseline = runCalc([]);

    // 2. All enabled measures
    const allEnabledKeys = Object.keys(MEASURE_DEFINITIONS).filter((k) => (state.measures as any)[k]?.enabled);
    const allInterventions: MeasureIntervention[] = [];
    for (const k of allEnabledKeys) {
      allInterventions.push(...MEASURE_DEFINITIONS[k].getInterventions(state, baselineValues, startYear, state.endYear));
    }

    // 3. Package Run (all active)
    const runActive = runCalc(allInterventions);

    const startCO2Total = runBaseline.totalCO2[0];
    const endCO2Baseline = runBaseline.totalCO2[endIdx];
    const endCO2Active = runActive.totalCO2[endIdx];

    console.log(`Baseline CO2 in ${state.endYear}: ${endCO2Baseline.toFixed(1)} kt/a`);
    console.log(`Active CO2 in ${state.endYear}: ${endCO2Active.toFixed(1)} kt/a`);
    console.log(`Total Reduction: ${(endCO2Baseline - endCO2Active).toFixed(1)} kt/a (${(((endCO2Baseline - endCO2Active) / startCO2Total) * 100).toFixed(1)}%)`);

    // 4. Counterfactual Leave-One-Out for each measure
    const measureResults: Record<string, any> = {};

    for (const key of Object.keys(MEASURE_DEFINITIONS)) {
      const def = MEASURE_DEFINITIONS[key];
      const isEnabled = (state.measures as any)[key]?.enabled;

      if (!isEnabled) {
        measureResults[key] = {
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

      // Leave-one-out: run all active measures except this one
      const withoutInterventions: MeasureIntervention[] = [];
      for (const otherKey of allEnabledKeys) {
        if (otherKey !== key) {
          withoutInterventions.push(...MEASURE_DEFINITIONS[otherKey].getInterventions(state, baselineValues, startYear, state.endYear));
        }
      }

      const runWithout = runCalc(withoutInterventions);

      let extraAvoidedCO2 = 0;
      if (key === 'pvOpen') {
        extraAvoidedCO2 = Math.max(0, runActive.solOsNrgTotal[endIdx] - runWithout.solOsNrgTotal[endIdx]) * 0.401;
      } else if (key === 'wind') {
        extraAvoidedCO2 = Math.max(0, runActive.windNrgTotal[endIdx] - runWithout.windNrgTotal[endIdx]) * 0.401;
      }

      const co2DiffDirect = Math.max(0, runWithout.totalCO2[endIdx] - runActive.totalCO2[endIdx]);
      const co2ReductionTsdTo = co2DiffDirect + extraAvoidedCO2;
      const co2ReductionPct = (co2ReductionTsdTo / startCO2Total) * 100;

      let cumCO2Reduction = 0;
      for (let i = 0; i <= endIdx; i++) {
        let extraAvoidedY = 0;
        if (key === 'pvOpen') {
          extraAvoidedY = Math.max(0, runActive.solOsNrgTotal[i] - runWithout.solOsNrgTotal[i]) * 0.401;
        } else if (key === 'wind') {
          extraAvoidedY = Math.max(0, runActive.windNrgTotal[i] - runWithout.windNrgTotal[i]) * 0.401;
        }
        cumCO2Reduction += Math.max(0, runWithout.totalCO2[i] - runActive.totalCO2[i]) + extraAvoidedY;
      }

      // CapEx investment difference (normalized if k€):
      let rawInvestDiff = Math.max(0, runActive.totalInvestSum - runWithout.totalInvestSum);
      const investMio = rawInvestDiff > 1000 ? rawInvestDiff / 1000 : rawInvestDiff;

      // Annual direct operational savings achieved in target year:
      const directEffectMioYear = Math.max(0, runActive.totalEffPerYear[endIdx] - runWithout.totalEffPerYear[endIdx]);

      // Abatement cost in € / t CO2:
      let costPerTonCO2 = 0;
      if (cumCO2Reduction > 0) {
        if (investMio > 0) {
          costPerTonCO2 = (investMio * 1000) / cumCO2Reduction;
        } else {
          // OpEx based: difference in OpEx per cumulative ton
          const cumEffDiff = Math.max(0, runActive.totalEffSum - runWithout.totalEffSum);
          costPerTonCO2 = cumEffDiff > 0 ? (cumEffDiff * 1000) / cumCO2Reduction : 0;
        }
      }

      // ROI %:
      const roiPct = investMio > 0 ? (directEffectMioYear / investMio) * 100 : 0;

      // Break-even year:
      let breakEvenYear = '—';
      if (investMio > 0 && directEffectMioYear > 0) {
        let cumSav = 0;
        for (let i = 0; i < nYears; i++) {
          cumSav += Math.max(0, (runActive.totalEffPerYear[i] || 0) - (runWithout.totalEffPerYear[i] || 0));
          if (cumSav >= investMio) {
            breakEvenYear = String(years[i]);
            break;
          }
        }
      }

      measureResults[key] = {
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
    }

    const tTotal = Date.now() - tStart;
    console.log(`All 10 runs (1 baseline + 1 package + 8 marginals) took: ${tTotal} ms`);

    console.table(Object.values(measureResults).map((m: any) => ({
      name: m.name,
      'CO2 %': m.co2ReductionPct.toFixed(1) + ' %',
      'CO2 kt': m.co2ReductionTsdTo.toFixed(1) + ' kt',
      'Invest M€': m.investMio.toFixed(1) + ' M€',
      'Eff M€/a': m.directEffectMioYear.toFixed(2) + ' M€/a',
      '€/t': m.costPerTonCO2.toFixed(1) + ' €/t',
      'ROI %': m.roiPct.toFixed(1) + ' %',
      'BE Year': m.breakEvenYear,
    })));

    expect(tTotal).toBeLessThan(100);
  });

  it('executes sequential counterfactual attribution in fixed order', () => {
    const state = createDefaultState();
    const startYear = state.startYear;
    const endYear = Math.max(state.endYear, 2045);
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);
    const nYears = years.length;
    const endIdx = Math.min(nYears - 1, Math.max(0, state.endYear - startYear));

    const b = (state.extractorInputs as any)?.buildings || (DEFAULT_EXTRACTOR_INPUTS as any).buildings;
    const m = (state.extractorInputs as any)?.mobility || (DEFAULT_EXTRACTOR_INPUTS as any).mobility;
    const e = (state.extractorInputs as any)?.energy || (DEFAULT_EXTRACTOR_INPUTS as any).energy;
    const refPop = 11238;
    const popScale = state.population > 0 ? state.population / refPop : 1.0;

    const baselineValues: Record<string, number> = {};
    for (const def of V5_INPUT_DEFINITIONS) {
      const id = def.id;
      if (id === 'buildings/inputs/price_oil__eur_per_L') {
        baselineValues[id] = state.priceOil;
      } else if (id === 'buildings/inputs/price_gas__eur_per_m3') {
        baselineValues[id] = state.priceGas;
      } else if (id === 'mobility/inputs/price_fuel__eur_per_L') {
        baselineValues[id] = state.pricePetrol;
      } else {
        baselineValues[id] = getBaselineValueForId(id, state.population);
      }
      let calcId = id;
      if (calcId.includes('heat_dmd__kWh_per_m2_a')) calcId = calcId.replace('heat_dmd__kWh_per_m2_a', 'heat_dmd__k__W_h_per_m2_a');
      if (calcId.includes('elec_dmd_capita__kWh_per_a')) calcId = calcId.replace('elec_dmd_capita__kWh_per_a', 'elec_dmd_capita__k_W_h_per_a');
      if (calcId.includes('solar_roof_installed__MWp')) calcId = calcId.replace('solar_roof_installed__MWp', 'sol_rf_installed__M__Wp');
      if (calcId.includes('solar_roof_self_consumption_part')) calcId = calcId.replace('solar_roof_self_consumption_part', 'sol_rf_self_cnsmp_part');
      baselineValues[calcId] = baselineValues[id];
    }

    const runCalc = (measures: MeasureIntervention[]) => {
      const calc = new Calculator(startYear, endYear);

      for (const sec of ['private', 'industry', 'public']) {
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

      calc.set_input('buildings/inputs/price_oil__eur_per_L', state.priceOil);
      calc.set_input('buildings/inputs/price_gas__eur_per_m3', state.priceGas);
      calc.set_input('buildings/inputs/price_district_heating__m__eur_per_W_h', 0.08);
      calc.set_input('buildings/inputs/price_other_output_nrg__m__eur_per_W_h', 0.05);
      calc.set_input('buildings/inputs/district_heating_renewable_part', 0.20);

      calc.set_input('mobility/inputs/price_fuel__eur_per_L', state.pricePetrol);
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

      if (measures.length > 0) {
        calc.add_measures(measures);
      }
      calc.calculate_over_years();

      const getRes = (id: string): number[] => {
        try {
          return Array.from(calc.get_results(id));
        } catch (e) {
          return new Array(nYears).fill(0);
        }
      };

      const emsPriv = getRes('emissions/results/ems_total__k__to_coe_per_a/private');
      const emsGhd = getRes('emissions/results/ems_total__k__to_coe_per_a/industry');
      const emsKom = getRes('emissions/results/ems_total__k__to_coe_per_a/public');

      const feedInAvoided = getRes('energy/results/feed_in_ems_avoided__k__to_coe_per_a');
      const emsTerritorial = years.map((_, i) => (emsPriv[i] || 0) + (emsGhd[i] || 0) + (emsKom[i] || 0));
      const totalCO2 = years.map((_, i) => emsTerritorial[i] - ((feedInAvoided[i] || 0) / 1000.0));

      const privInvest = getRes('stakeholders/results/private_invest__M__eur_per_a').map(Math.abs);
      const indInvest = getRes('stakeholders/results/industry_invest__M__eur_per_a').map(Math.abs);
      const comInvest = getRes('stakeholders/results/community_invest__M__eur_per_a').map(Math.abs);
      const windInvest = years.map((_, i) =>
        (getRes('energy/results/wind_invest__M__eur_per_a/private')[i] || 0) +
        (getRes('energy/results/wind_invest__M__eur_per_a/industry')[i] || 0) +
        (getRes('energy/results/wind_invest__M__eur_per_a/public')[i] || 0)
      );
      const totalInvestPerYear = years.map((_, i) => (privInvest[i] || 0) + (indInvest[i] || 0) + (comInvest[i] || 0) + (windInvest[i] || 0));
      const totalInvestSum = totalInvestPerYear.slice(0, endIdx + 1).reduce((a, b) => a + b, 0);

      const privEff = getRes('stakeholders/results/private_effect_of_measures__M__eur_per_a').map(Math.abs);
      const indEff = getRes('stakeholders/results/industry_effect_of_measures__M__eur_per_a').map(Math.abs);
      const comEff = getRes('stakeholders/results/community_effect_of_measures__M__eur_per_a').map(Math.abs);
      const totalEffPerYear = years.map((_, i) => (privEff[i] || 0) + (indEff[i] || 0) + (comEff[i] || 0));
      const totalEffSum = totalEffPerYear.slice(0, endIdx + 1).reduce((a, b) => a + b, 0);

      const solOsNrgPriv = getRes('energy/results/sol_os_nrg__G__W_h_per_a/private');
      const solOsNrgInd = getRes('energy/results/sol_os_nrg__G__W_h_per_a/industry');
      const solOsNrgPub = getRes('energy/results/sol_os_nrg__G__W_h_per_a/public');
      const solOsNrgTotal = years.map((_, i) => (solOsNrgPriv[i] || 0) + (solOsNrgInd[i] || 0) + (solOsNrgPub[i] || 0));

      const windNrgInd = getRes('energy/results/wind_nrg__G__W_h_per_a/industry');
      const windNrgPub = getRes('energy/results/wind_nrg__G__W_h_per_a/public');
      const windNrgTotal = years.map((_, i) => (windNrgInd[i] || 0) + (windNrgPub[i] || 0));

      const greenNrgPriv = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/private');
      const greenNrgInd = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/industry');
      const greenNrgPub = getRes('energy/results/prchsd_renewable_nrg__G__W_h_per_a/public');
      const greenNrgTotal = years.map((_, i) => (greenNrgPriv[i] || 0) + (greenNrgInd[i] || 0) + (greenNrgPub[i] || 0));

      return {
        totalCO2,
        totalInvestPerYear,
        totalInvestSum,
        totalEffPerYear,
        totalEffSum,
        solOsNrgTotal,
        windNrgTotal,
        greenNrgTotal,
      };
    };

    const runBaseline = runCalc([]);
    const startCO2Total = runBaseline.totalCO2[0];
    const endCO2Baseline = runBaseline.totalCO2[endIdx];

    const measureKeys = Object.keys(MEASURE_DEFINITIONS);
    let prevRun = runBaseline;
    const cumInterventions: MeasureIntervention[] = [];
    const measureResults: Record<string, any> = {};

    for (const key of measureKeys) {
      const def = MEASURE_DEFINITIONS[key];
      const isEnabled = (state.measures as any)[key]?.enabled;
      if (!isEnabled) {
        measureResults[key] = {
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

      const currentInterventions = def.getInterventions(state, baselineValues, startYear, state.endYear);
      cumInterventions.push(...currentInterventions);
      const currentRun = runCalc(cumInterventions);

      let extraAvoidedCO2 = 0;
      if (key === 'pvOpen') {
        extraAvoidedCO2 = Math.max(0, currentRun.solOsNrgTotal[endIdx] - prevRun.solOsNrgTotal[endIdx]) * 0.401;
      } else if (key === 'wind') {
        extraAvoidedCO2 = Math.max(0, currentRun.windNrgTotal[endIdx] - prevRun.windNrgTotal[endIdx]) * 0.401;
      }

      const co2DiffDirect = Math.max(0, prevRun.totalCO2[endIdx] - currentRun.totalCO2[endIdx]);
      const co2ReductionTsdTo = co2DiffDirect + extraAvoidedCO2;
      const co2ReductionPct = (co2ReductionTsdTo / startCO2Total) * 100;

      let cumCO2Reduction = 0;
      for (let i = 0; i <= endIdx; i++) {
        let extraAvoidedY = 0;
        if (key === 'pvOpen') {
          extraAvoidedY = Math.max(0, currentRun.solOsNrgTotal[i] - prevRun.solOsNrgTotal[i]) * 0.401;
        } else if (key === 'wind') {
          extraAvoidedY = Math.max(0, currentRun.windNrgTotal[i] - prevRun.windNrgTotal[i]) * 0.401;
        }
        cumCO2Reduction += Math.max(0, prevRun.totalCO2[i] - currentRun.totalCO2[i]) + extraAvoidedY;
      }

      let rawInvestDiff = Math.max(0, currentRun.totalInvestSum - prevRun.totalInvestSum);
      const investMio = rawInvestDiff > 1000 ? rawInvestDiff / 1000 : rawInvestDiff;

      const directEffectMioYear = Math.max(0, currentRun.totalEffPerYear[endIdx] - prevRun.totalEffPerYear[endIdx]);

      let costPerTonCO2 = 0;
      if (cumCO2Reduction > 0) {
        if (investMio > 0) {
          costPerTonCO2 = (investMio * 1000) / cumCO2Reduction;
        } else {
          const cumEffDiff = Math.max(0, currentRun.totalEffSum - prevRun.totalEffSum);
          costPerTonCO2 = cumEffDiff > 0 ? (cumEffDiff * 1000) / cumCO2Reduction : 0;
        }
      }

      const roiPct = investMio > 0 ? (directEffectMioYear / investMio) * 100 : 0;

      let breakEvenYear = '—';
      if (investMio > 0 && directEffectMioYear > 0) {
        let cumSav = 0;
        for (let i = 0; i < nYears; i++) {
          cumSav += Math.max(0, (currentRun.totalEffPerYear[i] || 0) - (prevRun.totalEffPerYear[i] || 0));
          if (cumSav >= investMio) {
            breakEvenYear = String(years[i]);
            break;
          }
        }
      }

      measureResults[key] = {
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

    const endCO2Active = prevRun.totalCO2[endIdx];
    const totalExtraAvoidedCO2 = Math.max(0, prevRun.solOsNrgTotal[endIdx] - runBaseline.solOsNrgTotal[endIdx]) * 0.401
      + Math.max(0, prevRun.windNrgTotal[endIdx] - runBaseline.windNrgTotal[endIdx]) * 0.401
      + Math.max(0, prevRun.greenNrgTotal[endIdx] - runBaseline.greenNrgTotal[endIdx]) * 0.401;
    const totalReduction = (endCO2Baseline - endCO2Active) + totalExtraAvoidedCO2;
    const sumTsdTo = Object.values(measureResults).reduce((sum: number, m: any) => sum + m.co2ReductionTsdTo, 0);
    const sumPct = Object.values(measureResults).reduce((sum: number, m: any) => sum + m.co2ReductionPct, 0);

    console.log('=== SEQUENTIAL ORDER ATTRIBUTION RESULTS ===');
    console.log(`Baseline CO2 in 2040: ${endCO2Baseline.toFixed(1)} kt/a`);
    console.log(`Active CO2 in 2040: ${endCO2Active.toFixed(1)} kt/a`);
    console.log(`Total Reduction: ${totalReduction.toFixed(1)} kt/a (${((totalReduction / startCO2Total) * 100).toFixed(1)}%)`);
    console.log(`Sum of measures co2ReductionTsdTo: ${sumTsdTo.toFixed(1)} kt/a`);
    console.log(`Sum of measures co2ReductionPct: ${sumPct.toFixed(1)} %`);

    console.table(Object.values(measureResults).map((m: any) => ({
      name: m.name,
      'CO2 %': m.co2ReductionPct.toFixed(1) + ' %',
      'CO2 kt': m.co2ReductionTsdTo.toFixed(1) + ' kt',
      'Invest M€': m.investMio.toFixed(1) + ' M€',
      'Eff M€/a': m.directEffectMioYear.toFixed(2) + ' M€/a',
      '€/t': m.costPerTonCO2.toFixed(1) + ' €/t',
      'ROI %': m.roiPct.toFixed(1) + ' %',
      'BE Year': m.breakEvenYear,
    })));

    // Mathematical identity of telescoping sum: sum of sequential deltas must match total reduction!
    expect(Math.abs(sumTsdTo - totalReduction)).toBeLessThan(1.0);
  });

  it('runSimulation calculates sequential counterfactual top measures matching total CO2 reduction', () => {
    const state = createDefaultState();
    const out = runSimulation(state);
    expect(out.topMeasures.length).toBeGreaterThan(0);

    const sumTsd = Object.values(out.measureMetrics).reduce((s, m) => s + m.co2ReductionTsdTo, 0);
    const sumPct = Object.values(out.measureMetrics).reduce((s, m) => s + m.co2ReductionPct, 0);

    console.log(`runSimulation total reduction: ${out.kpis.all.co2ReductionTsdTonnes.toFixed(1)} kt (${out.kpis.all.co2ReductionPercent.toFixed(1)}%)`);
    console.log(`runSimulation sum of measures: ${sumTsd.toFixed(1)} kt (${sumPct.toFixed(1)}%)`);

    const startCO2Total = out.co2Trajectory.baseline[0];
    const rawTotalPct = (out.kpis.all.co2ReductionTsdTonnes / startCO2Total) * 100;
    expect(Math.abs(sumTsd - out.kpis.all.co2ReductionTsdTonnes)).toBeLessThan(1.0);
    expect(Math.abs(sumPct - rawTotalPct)).toBeLessThan(0.2);
  });

  it('verifies scaling when population is 11.238 (11,238 inhabitants in 1.000 Ew. dimension)', () => {
    const state = createDefaultState();
    state.population = 11.238;
    const out = runSimulation(state);
    console.log('--- FOR POPULATION = 11.238 (11,238 Ew) ---');
    console.log('Investitionen Total:', out.kpis.all.investTotalMio, 'Mio. €');
    console.log('Direkte Effekte:', out.kpis.all.directEffectsMio, 'Mio. €/a');
    console.log('Investitionen Kommune:', out.kpis.kommune.investTotalMio, 'Mio. €');
    console.log('Direkte Effekte Kommune:', out.kpis.kommune.directEffectsMio, 'Mio. €/a');
    console.log('CO2 Reduktion:', out.kpis.all.co2ReductionTsdTonnes, 'kt');
    expect(out.kpis.all.investTotalMio).toBeCloseTo(103.8, 1);
    expect(out.kpis.all.directEffectsMio).toBeCloseTo(11.05, 1);
    expect(out.kpis.all.roiPercent).toBeCloseTo(10.65, 1);
    expect(out.kpis.all.localJobs).toBe(44);
  });
});

