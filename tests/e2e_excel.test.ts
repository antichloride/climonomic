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
      it('executes simulation and evaluates output match against Excel truth', () => {
        const calc = new Calculator(fixture.start_year, fixture.end_year);
        // Supports both calculate and calculate_webfassung
        const results = (calc as any).calculate ? (calc as any).calculate(fixture.inputs, fixture.measures) : (calc as any).calculate_webfassung(fixture.inputs, fixture.measures);

        const rtol = 0.05; // 5% relative tolerance
        const atol = 0.05;

        let totalCompared = 0;
        let matchedCount = 0;
        const byDomain: Record<string, { total: number; matched: number }> = {};
        const failures: Array<{ path: string; expected: number; actual: number; diff: number }> = [];

        function evaluate(actual: any, expected: any, currentPath: string, domain: string) {
          if (!byDomain[domain]) byDomain[domain] = { total: 0, matched: 0 };
          if (typeof expected === 'number') {
            totalCompared++;
            byDomain[domain].total++;
            const act = typeof actual === 'number' ? actual : NaN;
            const diff = Math.abs(act - expected);
            const maxAllowed = Math.max(atol, rtol * Math.abs(expected));
            if (diff <= maxAllowed) {
              matchedCount++;
              byDomain[domain].matched++;
            } else {
              failures.push({ path: currentPath, expected, actual: act, diff });
            }
          } else if (typeof expected === 'object' && expected !== null) {
            for (const [k, v] of Object.entries(expected)) {
              evaluate(actual?.[k], v, `${currentPath}.${k}`, domain);
            }
          }
        }

        for (const [domain, expVal] of Object.entries(fixture.expected_outputs)) {
          evaluate(results[domain], expVal, domain, domain);
        }

        const matchPct = ((matchedCount / totalCompared) * 100).toFixed(1);
        console.log(`\n======================================================`);
        console.log(`Excel Webfassung Validation Report: ${fixture.name}`);
        console.log(`Total data points evaluated: ${totalCompared}`);
        console.log(`Matching points within tolerance: ${matchedCount} (${matchPct}%)`);
        console.log(`Divergent points to align:        ${failures.length}`);
        console.log(`------------------------------------------------------`);
        console.log(`Breakdown by Domain:`);
        for (const [domain, stats] of Object.entries(byDomain)) {
          const domPct = stats.total > 0 ? ((stats.matched / stats.total) * 100).toFixed(1) : '0.0';
          console.log(`  - ${domain.padEnd(25)}: ${stats.matched}/${stats.total} (${domPct}%)`);
        }
        console.log(`======================================================`);

        if (failures.length > 0) {
          console.error('Failures:', failures.slice(0, 10));
        }

        expect(totalCompared).toBeGreaterThan(0);
        expect(failures.length).toBe(0);
        expect(matchPct).toBe('100.0');
      });
    });
  }
});
