import { describe, it, expect } from 'vitest';
import { Calculator } from '../pkg/climcalc_core.js';
import { V5_INPUT_DEFINITIONS } from '../frontend/src/v5-schema';
import { createDefaultState, getBaselineValueForId } from '../frontend/src/baseline-data';

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
        list.push({ id: 'm_hd_sch', inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/schools', startYear, endYear, delta: dKom });
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
  greenPower: {
    id: 'greenPower',
    name: 'Zukauf erneuerbare Energien erhöhen',
    getInterventions: (s, b, startYear, endYear) => {
      const list: MeasureIntervention[] = [];
      const m = s.measures.greenPower;
      const basePriv = b['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/private'] || 4.67;
      const baseGhd = b['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/industry'] || 0.47;
      const baseKom = b['energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/public'] || 0.12;

      const dPriv = m.targetPrivate - basePriv;
      const dGhd = m.targetGHD - baseGhd;
      const dKom = m.targetKommune - baseKom;

      if (dPriv > 0) list.push({ id: 'm_gp_priv', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/private', startYear, endYear, delta: -dPriv });
      if (dGhd > 0) list.push({ id: 'm_gp_ghd', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/industry', startYear, endYear, delta: -dGhd });
      if (dKom > 0) list.push({ id: 'm_gp_pub', inputId: 'energy/inputs/prchsd_renewable_nrg__G__W_h_per_a/public', startYear, endYear, delta: -dKom });
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

    const baselineValues: Record<string, number> = {};
    for (const id of Object.keys(V5_INPUT_DEFINITIONS)) {
      if (id === 'buildings/inputs/price_oil__eur_per_L') {
        baselineValues[id] = state.priceOil;
      } else if (id === 'buildings/inputs/price_gas__eur_per_m3') {
        baselineValues[id] = state.priceGas;
      } else if (id === 'mobility/inputs/price_fuel__eur_per_L') {
        baselineValues[id] = state.pricePetrol;
      } else {
        baselineValues[id] = getBaselineValueForId(id, state.population);
      }
    }

    const runCalc = (measures: MeasureIntervention[]) => {
      const calc = new Calculator(startYear, endYear);
      for (const [id, val] of Object.entries(baselineValues)) {
        try {
          calc.set_input(id, val);
        } catch (e) {}
      }
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
      const totalInvestPerYear = years.map((_, i) => (privInvest[i] || 0) + (indInvest[i] || 0) + (comInvest[i] || 0));
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
      } else if (key === 'greenPower') {
        extraAvoidedCO2 = Math.max(0, runActive.greenNrgTotal[endIdx] - runWithout.greenNrgTotal[endIdx]) * 0.401;
      }

      const co2DiffDirect = Math.max(0, runWithout.totalCO2[endIdx] - runActive.totalCO2[endIdx]);
      const co2ReductionTsdTo = co2DiffDirect + extraAvoidedCO2;
      const co2ReductionPct = (co2ReductionTsdTo / startCO2Total) * 100;

      // Cumulative CO2 reduction across all years up to endIdx:
      let cumCO2Reduction = 0;
      for (let i = 0; i <= endIdx; i++) {
        cumCO2Reduction += Math.max(0, runWithout.totalCO2[i] - runActive.totalCO2[i]);
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
});
