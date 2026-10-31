import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Import the WebAssembly module built by wasm-pack
// Note: When built with `--target nodejs`, pkg exports the Calculator class
import { Calculator } from '../pkg/climcalc_core.js';

interface Fixture {
  name: string;
  source: string;
  start_year: number;
  end_year: number;
  years: number[];
  inputs: Record<string, any>;
  measures: Array<{
    id: string;
    input_id: string;
    start_year: number;
    end_year: number;
    delta: number;
  }>;
  expected_outputs: Record<string, number[]>;
}

describe('End-to-End Excel Verification Suite', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const fixtureFiles = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.json'));

  it('found at least one fixture to test', () => {
    expect(fixtureFiles.length).toBeGreaterThan(0);
  });

  for (const file of fixtureFiles) {
    const fixturePath = path.join(fixturesDir, file);
    const fixture: Fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    describe(`Fixture: ${fixture.name} (${fixture.start_year} - ${fixture.end_year})`, () => {
      it('executes simulation and validates outputs against Excel truth within tolerance', () => {
        // 1. Initialize calculator with simulation year bounds
        const calc = new Calculator(fixture.start_year, fixture.end_year);

        // 2. Set all baseline inputs in bulk using hierarchical JS object API
        calc.set_inputs(fixture.inputs);

        // 3. Add all policy measures in bulk
        if (fixture.measures && fixture.measures.length > 0) {
          calc.add_measures(fixture.measures);
        }

        // 4. Run the 5-stage annual calculation pipeline over years
        calc.calculate_over_years();

        // 5. Compare each expected output time series
        const rtol = 0.05; // 5% relative tolerance (accounting for intermediate rounding in Excel)
        const atol = 0.05; // 0.05 absolute tolerance for near-zero values

        const failures: Array<{
          id: string;
          year: number;
          expected: number;
          actual: number;
          diff: number;
          pct: string;
        }> = [];

        let totalCompared = 0;
        let matchedCount = 0;

        for (const [resultId, expectedSeries] of Object.entries(fixture.expected_outputs)) {
          let actualSeries: number[];
          try {
            actualSeries = calc.get_results(resultId);
          } catch (e: any) {
            failures.push({
              id: resultId,
              year: fixture.start_year,
              expected: 0,
              actual: NaN,
              diff: NaN,
              pct: `Error calling get_results: ${e?.message || e}`,
            });
            continue;
          }

          expectedSeries.forEach((expected, i) => {
            totalCompared++;
            const year = fixture.start_year + i;
            const actual = actualSeries[i];

            const diff = Math.abs(actual - expected);
            const maxAllowed = Math.max(atol, rtol * Math.abs(expected));

            if (diff <= maxAllowed) {
              matchedCount++;
            } else {
              const pct = expected !== 0 ? `${((diff / Math.abs(expected)) * 100).toFixed(2)}%` : 'N/A';
              failures.push({
                id: resultId,
                year,
                expected,
                actual,
                diff,
                pct,
              });
            }
          });
        }

        console.log(`\n======================================================`);
        console.log(`E2E Results for ${fixture.name}:`);
        console.log(`Total data points compared: ${totalCompared}`);
        console.log(`Points within tolerance:   ${matchedCount} (${((matchedCount / totalCompared) * 100).toFixed(1)}%)`);
        console.log(`Points diverging:          ${failures.length}`);
        console.log(`======================================================`);

        if (failures.length > 0) {
          console.log(`\nTop 20 Divergent Points:`);
          failures.slice(0, 20).forEach((f) => {
            console.log(
              `  - ${f.id} [${f.year}]: expected ${f.expected.toFixed(4)}, actual ${f.actual.toFixed(4)} (diff: ${f.diff.toFixed(4)}, ${f.pct})`
            );
          });
        }

        // Assert no unhandled failures
        expect(failures).toEqual([]);
      });
    });
  }
});
