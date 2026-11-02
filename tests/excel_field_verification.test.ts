import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createDefaultState, importStateInputs, getBaselineValueForId } from '../frontend/src/baseline-data';
import { DEFAULT_EXTRACTOR_INPUTS } from '../frontend/src/default-inputs';
import { Calculator } from '../pkg/climcalc_core.js';
import initWasm from '../pkg-web/climcalc_core.js';

beforeAll(async () => {
  const wasmBuffer = fs.readFileSync(path.resolve(__dirname, '../pkg-web/climcalc_core_bg.wasm'));
  await initWasm({ module_or_path: wasmBuffer });
});

describe('Excel Field Verification Suite', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures/webfassung_260630.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  it('verifies all baseline input dimensions against DEFAULT_EXTRACTOR_INPUTS', () => {
    const fixtureInputs = fixture.inputs;
    const defaultInputs = DEFAULT_EXTRACTOR_INPUTS as any;

    // 1. Buildings domain
    expect(defaultInputs.buildings.n_inhabitants__k__.private).toBe(fixtureInputs.buildings.n_inhabitants__k__.private);
    expect(defaultInputs.buildings.n_inhabitants__k__.industry).toBe(fixtureInputs.buildings.n_inhabitants__k__.industry);
    expect(defaultInputs.buildings.n_inhabitants__k__.public).toBe(fixtureInputs.buildings.n_inhabitants__k__.public);

    expect(defaultInputs.buildings.n_buildings.private).toBe(fixtureInputs.buildings.n_buildings.private);
    expect(defaultInputs.buildings.n_buildings.industry).toBe(fixtureInputs.buildings.n_buildings.industry);
    expect(defaultInputs.buildings.n_buildings.public).toBe(fixtureInputs.buildings.n_buildings.public);

    expect(defaultInputs.buildings.floor_A_total__k__m2.private).toBe(fixtureInputs.buildings.floor_A_total__k__m2.private);
    expect(defaultInputs.buildings.floor_A_total__k__m2.industry).toBe(fixtureInputs.buildings.floor_A_total__k__m2.industry);
    expect(defaultInputs.buildings.floor_A_total__k__m2.public).toBe(fixtureInputs.buildings.floor_A_total__k__m2.public);

    expect(defaultInputs.buildings.A_heat_oil__k__m2.private).toBe(fixtureInputs.buildings.A_heat_oil__k__m2.private);
    expect(defaultInputs.buildings.A_heat_gas__k__m2.private).toBe(fixtureInputs.buildings.A_heat_gas__k__m2.private);
    expect(defaultInputs.buildings.A_heat_wood__k__m2.private).toBe(fixtureInputs.buildings.A_heat_wood__k__m2.private);
    expect(defaultInputs.buildings.A_heat_heat_pump_air__k__m2.private).toBe(fixtureInputs.buildings.A_heat_heat_pump_air__k__m2.private);
    expect(defaultInputs.buildings.A_heat_heat_pump_ground__k__m2.private).toBe(fixtureInputs.buildings.A_heat_heat_pump_ground__k__m2.private);
    expect(defaultInputs.buildings.A_heat_district_heating__k__m2.private).toBe(fixtureInputs.buildings.A_heat_district_heating__k__m2.private);

    // 2. Mobility domain
    expect(defaultInputs.mobility.n_cars__k__.private).toBe(fixtureInputs.mobility.n_cars__k__.private);
    expect(defaultInputs.mobility.n_cars__k__.industry).toBe(fixtureInputs.mobility.n_cars__k__.industry);
    expect(defaultInputs.mobility.n_cars__k__.public).toBe(fixtureInputs.mobility.n_cars__k__.public);

    expect(defaultInputs.mobility.n_bev__k__.private).toBe(fixtureInputs.mobility.n_bev__k__.private);
    expect(defaultInputs.mobility.n_bev__k__.industry).toBe(fixtureInputs.mobility.n_bev__k__.industry);
    expect(defaultInputs.mobility.n_bev__k__.public).toBe(fixtureInputs.mobility.n_bev__k__.public);

    expect(defaultInputs.mobility.car_mileage_per_vehicle__k__km_per_a.private).toBe(
      fixtureInputs.mobility.car_mileage_per_vehicle__k__km_per_a.private
    );

    // 3. Energy domain
    expect(defaultInputs.energy.solar_roof_installed__MWp.private).toBe(
      fixtureInputs.energy.solar_roof_installed__MWp.private
    );
    expect(defaultInputs.energy.solar_roof_installed__MWp.industry).toBe(
      fixtureInputs.energy.solar_roof_installed__MWp.industry
    );
    expect(defaultInputs.energy.solar_roof_installed__MWp.public).toBe(
      fixtureInputs.energy.solar_roof_installed__MWp.public
    );

    expect(defaultInputs.energy.solar_roof_self_consumption_part.private).toBe(
      fixtureInputs.energy.solar_roof_self_consumption_part.private
    );

    // 4. Economy domain
    expect(defaultInputs.economy.taxes.corporate_profit_part).toBe(fixtureInputs.economy.taxes.corporate_profit_part);
    expect(defaultInputs.economy.taxes.turnover_tax_part).toBe(fixtureInputs.economy.taxes.turnover_tax_part);
    expect(defaultInputs.economy.job_coefficients.employees_per_M_eur_turnover).toBe(
      fixtureInputs.economy.job_coefficients.employees_per_M_eur_turnover
    );
  });

  it('verifies that state import correctly populates all inputs, population, and measures', () => {
    const state = createDefaultState();
    const res = importStateInputs(state, fixture);

    expect(res.success).toBe(true);
    expect(res.modifiedCount).toBeGreaterThan(20);

    // Population should be 11.238 (in 1.000 Ew. dimension)
    expect(state.population).toBeCloseTo(11.238, 3);

    // Measures targets should be synced
    expect(state.measures.heatDmd.targetPrivate).toBe(Math.round(fixture.measures.private.heat_demand.target_kWh_per_m2_a));
    expect(state.measures.gasPhaseout.targetPrivate).toBe(0);
    expect(state.measures.oilPhaseout.targetPrivate).toBe(0);
    expect(state.measures.pvRoof.targetPrivate).toBeCloseTo(fixture.measures.private.pv_roof.target_installed__MWp, 0);
    expect(state.measures.evCars.targetPrivate).toBeCloseTo(fixture.measures.private.mobility.bev_count_target__k__, 0);

    // Verify newly supported measures and their settings
    expect(state.measures.districtHeating.capacityGWh).toBeCloseTo(5456.6, 0);
    expect(state.measures.districtHeating.shareRenewable).toBe(100);
    expect(state.measures.biomass.targetGHD).toBeCloseTo(2.35, 2);
    expect(state.measures.biomass.targetKommune).toBeCloseTo(0.12, 2);
    expect(state.measures.storage.capacityMWh).toBe(20.0);
    expect(state.measures.variableTariffs.customerShare).toBe(20);
    expect(state.measures.streetLighting.targetKommune).toBeCloseTo(1.21, 2);

    // Ensure getBaselineValueForId with state.extractorInputs returns accurate values
    const carVal = getBaselineValueForId('mobility/inputs/n_cars__k__/private', state.population, state.extractorInputs);
    expect(carVal).toBeCloseTo(5.87, 1);

    const roofPvVal = getBaselineValueForId('energy/inputs/solar_roof_installed__MWp/private', state.population, state.extractorInputs);
    expect(roofPvVal).toBeCloseTo(3.84, 1);
  });

  it('verifies that running simulation with imported state matches expected Excel summary outputs', () => {
    const state = createDefaultState();
    importStateInputs(state, fixture);

    const calc = new Calculator(state.startYear, state.endYear);
    const outputs = calc.calculate(state.extractorInputs, (state as any).extractorMeasures || {});
    expect(outputs).toBeDefined();

    // Verify subtotal invest matches 103,806 Mio. € within 0.1% tolerance
    const expectedInvest = fixture.expected_outputs.summary_dashboard.subtotal_private_industry_public.invest__M__eur;
    expect(outputs.summary_dashboard.subtotal_private_industry_public.invest__M__eur).toBeCloseTo(expectedInvest, 0);

    // Verify direct effects matches 11,053 Mio. €/a within 0.1% tolerance
    const expectedSavings = fixture.expected_outputs.summary_dashboard.subtotal_private_industry_public.savings__M__eur_per_a;
    expect(outputs.summary_dashboard.subtotal_private_industry_public.savings__M__eur_per_a).toBeCloseTo(expectedSavings, 0);
  });

  it('diagnoses runSimulation outputs for Kosten, Rendite, and Arbeitsplätze', async () => {
    const { runSimulation } = await import('../frontend/src/wasm-engine');
    const state = createDefaultState();
    const simOut = runSimulation(state);
    console.log('SimOut KPIs (all):', simOut.kpis.all);
    console.log('SimOut KPIs (private):', simOut.kpis.private);
    console.log('SimOut KPIs (ghd):', simOut.kpis.ghd);
    console.log('SimOut KPIs (kommune):', simOut.kpis.kommune);
    console.log('SimOut costsTrajectory (investments):', simOut.costsTrajectory.investments);
    console.log('SimOut costsTrajectory (directSavings):', simOut.costsTrajectory.directSavings);
    console.log('SimOut jobsTrajectory:', simOut.jobsTrajectory.localJobs);
  });

  it('verifies measures extraction completeness across all sectors and utility in the Excel workbook', () => {
    const m = fixture.measures;
    expect(m).toBeDefined();

    // 1. Private Measures
    expect(m.private.heat_demand.target_kWh_per_m2_a).toBeCloseTo(75.86, 2);
    expect(m.private.heat_sources_targets__k__m2.oil).toBe(0.0);
    expect(m.private.heat_sources_targets__k__m2.gas).toBe(0.0);
    expect(m.private.heat_sources_targets__k__m2.wood).toBeCloseTo(50876.42, 1);
    expect(m.private.heat_sources_targets__k__m2.heat_pump_air).toBeCloseTo(356134.96, 1);
    expect(m.private.mobility.cars_count_target__k__).toBeCloseTo(5870.12, 1);
    expect(m.private.mobility.bev_count_target__k__).toBeCloseTo(5870.12, 1);
    expect(m.private.mobility.modal_split_pt_part).toBeCloseTo(0.135, 3);
    expect(m.private.mobility.modal_split_car_part).toBeCloseTo(0.797, 3);
    expect(m.private.pv_roof.target_installed__MWp).toBeCloseTo(11511.81, 1);

    // 2. Industry Measures
    expect(m.industry.heat_demand.target_kWh_per_m2_a).toBeCloseTo(76.5, 1);
    expect(m.industry.renewables.solar_ground_target__MWp).toBeCloseTo(8163.19, 1);
    expect(m.industry.renewables.wind_target__MWp).toBeCloseTo(16537.09, 1);
    expect(m.industry.renewables.biomass_target__MWp).toBeCloseTo(2352.07, 1);
    expect(m.industry.renewables.lease_rate_municipal_ground__eur_per_kWh).toBe(0.002);
    expect(m.industry.renewables.municipal_ground_part).toBe(0.1);

    // 3. Public Measures
    expect(m.public.heat_demand.target_kWh_per_m2_a).toBeCloseTo(76.5, 1);
    expect(m.public.mobility.bev_count_target__k__).toBeCloseTo(38.51, 1);
    expect(m.public.lighting.led_points_target__k__).toBeCloseTo(1211.28, 1);
    expect(m.public.pv_roof.target_installed__MWp).toBeCloseTo(562.86, 1);

    // 4. Utility Measures
    expect(m.municipal_utility.pv_ground_target__MWp).toBeCloseTo(429.64, 1);
    expect(m.municipal_utility.wind_target__MWp).toBeCloseTo(870.37, 1);
    expect(m.municipal_utility.biomass_target__MWp).toBeCloseTo(123.79, 1);
    expect(m.municipal_utility.grid_battery_capacity_target__MWh).toBe(20.0);
    expect(m.municipal_utility.simultaneity_factor_undamped).toBe(0.8);
    expect(m.municipal_utility.max_target_utilization).toBe(0.7);
    expect(m.municipal_utility.variable_tariffs_customer_share).toBe(0.2);
    expect(m.municipal_utility.district_heating_target_sources_part.biomass).toBe(0.25);
    expect(m.municipal_utility.district_heating_target_sources_part.waste_heat).toBe(0.25);
    expect(m.municipal_utility.district_heating_target_sources_part.river_heat).toBe(0.25);
    expect(m.municipal_utility.district_heating_target_sources_part.geothermal_shallow).toBe(0.25);

    // 5. Verify measure settings (ist, target, start_year, end_year, active)
    expect(m.fossil_prices.petrol.active).toBe(true);
    expect(m.fossil_prices.petrol.ist).toBeCloseTo(1.67, 2);
    expect(m.private.heat_demand.settings.active).toBe(true);
    expect(m.private.heat_demand.settings.start_year).toBe(2026);
    expect(m.private.heat_demand.settings.end_year).toBe(2040);
    expect(m.industry.biomass.active).toBe(true);
    expect(m.municipal_utility.grid_battery.active).toBe(true);
    expect(m.municipal_utility.variable_tariffs.active).toBe(true);
    expect(m.municipal_utility.heating_network_capacity.active).toBe(true);
    expect(m.public.street_lighting.active).toBe(true);

    // 6. Total items list extracted
    expect(m.items.length).toBe(80);
    expect(m.items[0]).toHaveProperty('name');
    expect(m.items[0]).toHaveProperty('target');
    expect(m.items[0]).toHaveProperty('active');
  });
});
