import { describe, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import initWasm, { Calculator } from '../pkg-web/climcalc_core.js';
import { createDefaultState, importStateInputs } from '../frontend/src/baseline-data';
import { runSimulation } from '../frontend/src/wasm-engine';

describe('Deep comparison of frontend vs fixture expected outputs', () => {
  it('evaluates webfassung_260630 fixture against frontend output', async () => {
    const wasmPath = path.resolve(__dirname, '../pkg-web/climcalc_core_bg.wasm');
    const wasmBytes = fs.readFileSync(wasmPath);
    await initWasm({ module_or_path: wasmBytes });

    const fixturePath = path.resolve(__dirname, '../tests/fixtures/webfassung_260630.json');
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

    // 1. Direct Rust Model Output (which passes 108/108 tests in e2e_excel.test.ts)
    const calc = new Calculator(fixture.start_year, fixture.end_year);
    const rustDirect = (calc as any).calculate(fixture.inputs, fixture.measures);

    console.log('=== 1. RUST DIRECT MODEL (calculate) ===');
    console.log('summary_dashboard:', JSON.stringify(rustDirect.summary_dashboard, null, 2));

    // 2. Frontend Simulation Output
    const state = createDefaultState();
    state.startYear = fixture.start_year;
    state.endYear = fixture.end_year;
    importStateInputs(state, fixture);

    const frontendOut = runSimulation(state);

    console.log('=== 2. FRONTEND runSimulation OUTPUT ===');
    console.log('All KPIs:', frontendOut.kpis.all);
    console.log('Private KPIs:', frontendOut.kpis.private);
    console.log('Industry KPIs:', frontendOut.kpis.ghd);
    console.log('Public KPIs:', frontendOut.kpis.kommune);

    console.log('=== 3. EXPECTED FROM FIXTURE ===');
    console.log('Expected summary_dashboard:', JSON.stringify(fixture.expected_outputs.summary_dashboard, null, 2));
  });
});
