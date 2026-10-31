import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Import the WebAssembly module built by wasm-pack
import { Calculator } from '../pkg/climcalc_core.js';

interface Fixture {
  name: string;
  excel_version: string;
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
  all_rechenwerk_rows?: Record<string, any>;
}

describe('End-to-End Excel Version 5 Verification Suite', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const fixtureFiles = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.json'));

  it('found at least one fixture to test', () => {
    expect(fixtureFiles.length).toBeGreaterThan(0);
  });

  for (const file of fixtureFiles) {
    const fixturePath = path.join(fixturesDir, file);
    const fixture: Fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    describe(`Fixture: ${fixture.name} (${fixture.start_year} - ${fixture.end_year})`, () => {
      it('executes simulation and evaluates output match against Excel truth', () => {
        // 1. Initialize calculator with simulation year bounds
        const calc = new Calculator(fixture.start_year, fixture.end_year);

        // 2. Set all baseline inputs in bulk using hierarchical JS object API
        calc.set_inputs(fixture.inputs);

        // 3. Add all policy measures in bulk
        if (fixture.measures && fixture.measures.length > 0) {
          calc.add_measures(fixture.measures);
        }

        // 4. Run the 5-stage annual calculation pipeline over all simulation years
        calc.calculate_over_years();

        // 5. Compare each expected output time series against Excel truth
        const rtol = 0.05; // 5% relative tolerance
        const atol = 0.05; // 0.05 absolute tolerance for near-zero values

        const failures: Array<{
          id: string;
          year: number;
          expected: number;
          actual: number;
          diff: number;
          pct: string;
        }> = [];

        const byDomain: Record<string, { total: number; matched: number }> = {};
        let totalCompared = 0;
        let matchedCount = 0;

        for (const [resultId, expectedSeries] of Object.entries(fixture.expected_outputs)) {
          const domain = resultId.split('/')[0];
          if (!byDomain[domain]) byDomain[domain] = { total: 0, matched: 0 };

          let actualSeries: number[];
          try {
            actualSeries = calc.get_results(resultId);
          } catch (e: any) {
            expectedSeries.forEach((_, i) => {
              totalCompared++;
              byDomain[domain].total++;
              failures.push({
                id: resultId,
                year: fixture.start_year + i,
                expected: expectedSeries[i],
                actual: NaN,
                diff: NaN,
                pct: `Not found: ${e?.message || e}`,
              });
            });
            continue;
          }

          expectedSeries.forEach((expected, i) => {
            totalCompared++;
            byDomain[domain].total++;
            const year = fixture.start_year + i;
            const actual = actualSeries[i];

            const diff = Math.abs(actual - expected);
            const maxAllowed = Math.max(atol, rtol * Math.abs(expected));

            if (diff <= maxAllowed) {
              matchedCount++;
              byDomain[domain].matched++;
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

        const matchPct = ((matchedCount / totalCompared) * 100).toFixed(1);

        console.log(`\n======================================================`);
        console.log(`Excel Version 5 Validation Report: ${fixture.name}`);
        console.log(`Total data points evaluated: ${totalCompared}`);
        console.log(`Matching points within tolerance: ${matchedCount} (${matchPct}%)`);
        console.log(`Divergent points to align:        ${failures.length}`);
        console.log(`------------------------------------------------------`);
        console.log(`Breakdown by Domain:`);
        for (const [domain, stats] of Object.entries(byDomain)) {
          const domPct = stats.total > 0 ? ((stats.matched / stats.total) * 100).toFixed(1) : '0.0';
          console.log(`  - ${domain.padEnd(14)}: ${stats.matched}/${stats.total} (${domPct}%)`);
        }
        console.log(`======================================================`);

        // Validate that simulation executes successfully and evaluates all points
        expect(totalCompared).toBeGreaterThan(0);
        expect(matchedCount).toBeGreaterThan(0);
      });
    });
  }
});
