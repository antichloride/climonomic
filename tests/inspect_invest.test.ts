import { describe, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import initWasm, { Calculator } from '../pkg-web/climcalc_core.js';
import { createDefaultState, importStateInputs } from '../frontend/src/baseline-data';

describe('Inspect where invest came from', () => {
  it('inspects series for heatDmd', async () => {
    const wasmPath = path.resolve(__dirname, '../pkg-web/climcalc_core_bg.wasm');
    const wasmBytes = fs.readFileSync(wasmPath);
    await initWasm({ module_or_path: wasmBytes });

    const fixturePath = path.resolve(__dirname, '../tests/fixtures/webfassung_260630.json');
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

    const state = createDefaultState();
    state.startYear = fixture.start_year;
    state.endYear = fixture.end_year;
    importStateInputs(state, fixture);

    const b = state.extractorInputs.buildings;
    const calc = new Calculator(state.startYear, state.endYear);
    for (const sec of ['private', 'industry', 'public']) {
      calc.set_input(`buildings/inputs/n_inhabitants__k__/${sec}`, b.n_inhabitants__k__[sec]);
      calc.set_input(`buildings/inputs/n_buildings/${sec}`, b.n_buildings[sec]);
      calc.set_input(`buildings/inputs/floor_A_building__m2/${sec}`, b.floor_A_building__m2[sec]);
      calc.set_input(`buildings/inputs/heat_dmd__k__W_h_per_m2_a/${sec}`, b.heat_dmd__kWh_per_m2_a[sec]);
    }

    // Add heatDmd measure:
    calc.add_measures([{
      id: 'm_hd_priv',
      inputId: 'buildings/inputs/heat_dmd__k__W_h_per_m2_a/private',
      startYear: state.startYear,
      endYear: state.endYear,
      delta: 26,
    }]);

    calc.calculate_over_years();

    const renGrant = Array.from(calc.get_results('buildings/results/grant_energetic_renovation__M__eur_per_a/private'));
    const solInvest = Array.from(calc.get_results('energy/results/sol_rf_invest__M__eur_per_a/private'));
    const solGrant = Array.from(calc.get_results('energy/results/sol_rf_grant__M__eur_per_a/private'));

    console.log('renGrant sum:', renGrant.reduce((a, b) => a + b, 0));
    console.log('solInvest sum:', solInvest.reduce((a, b) => a + b, 0));
    console.log('solGrant sum:', solGrant.reduce((a, b) => a + b, 0));
  });
});
