import { describe, it, expect } from 'vitest';
import { Calculator } from '../pkg/climcalc_core.js';

describe('Variable Naming Convention & Unit Verification Suite', () => {
  const calc = new Calculator(2022, 2025);
  const inputIds = calc.list_input_ids();
  const resultIds = calc.list_result_ids();

  const VALID_DOMAINS = new Set([
    'buildings',
    'energy',
    'mobility',
    'economy',
    'stakeholders',
    'emissions',
  ]);

  const VALID_SECTORS = new Set(['private', 'industry', 'schools', 'public']);

  const VALID_SI_PREFIXES = new Set(['k', 'M', 'G', 'T', 'm', 'c', 'd', '1e3', '1em3']);

  const VALID_BASE_UNITS = new Set([
    'm', 'm2', 'm3', 'ha',
    'W', 'Wp', 'WP', 'h', 'a',
    'L', 'eur', 'to', 'kg',
    'coe', 'km', 'FTE', 'kWh', 's'
  ]);

  it('registers a comprehensive catalog of inputs and results', () => {
    expect(inputIds.length).toBeGreaterThan(50);
    expect(resultIds.length).toBeGreaterThan(100);
  });

  describe('Namespace and Hierarchy Structure', () => {
    it.each(inputIds)('input ID "%s" matches "<domain>/inputs/<var_name>[/<sector>]"', (id) => {
      const parts = id.split('/');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts.length).toBeLessThanOrEqual(4);

      const [domain, category, , sector] = parts;
      expect(VALID_DOMAINS.has(domain)).toBe(true);
      expect(category).toBe('inputs');
      if (sector) {
        expect(VALID_SECTORS.has(sector)).toBe(true);
      }
    });

    it.each(resultIds)('result ID "%s" matches "<domain>/results/<var_name>[/<sector>]"', (id) => {
      const parts = id.split('/');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts.length).toBeLessThanOrEqual(4);

      const [domain, category, , sector] = parts;
      expect(VALID_DOMAINS.has(domain)).toBe(true);
      expect(category).toBe('results');
      if (sector) {
        expect(VALID_SECTORS.has(sector)).toBe(true);
      }
    });

    it('ensures all sectorized variables define all 4 sectors', () => {
      const sectorGroups: Record<string, string[]> = {};
      for (const id of [...inputIds, ...resultIds]) {
        const parts = id.split('/');
        if (parts.length === 4) {
          const basePath = `${parts[0]}/${parts[1]}/${parts[2]}`;
          if (!sectorGroups[basePath]) sectorGroups[basePath] = [];
          sectorGroups[basePath].push(parts[3]);
        }
      }

      for (const [basePath, sectors] of Object.entries(sectorGroups)) {
        expect(sectors.sort()).toEqual(['industry', 'private', 'public', 'schools']);
      }
    });
  });

  describe('Variable Naming Grammar and Unit Suffixes', () => {
    function validateVariableName(varName: string) {
      // 1. Alphanumeric + underscore check
      expect(varName).toMatch(/^[a-zA-Z0-9_]+$/);

      // 2. Dimensionless check
      const isCount = varName.startsWith('n_');
      const isShare = varName.endsWith('_part') || varName.startsWith('modal_split') || varName === 'mean_persons_per_car';

      if (varName.includes('__')) {
        // Encoded unit / multiplier check
        const unitSegments = varName.split('__').slice(1);
        expect(unitSegments.length).toBeGreaterThanOrEqual(1);

        for (const segment of unitSegments) {
          if (segment === '') continue; // Trailing __ for multiplier-only e.g. n_cars__k__
          if (VALID_SI_PREFIXES.has(segment)) continue;

          // Check compound quotients (numerator_per_denominator)
          const terms = segment.split('_per_');
          for (const term of terms) {
            const factors = term.split('_');
            for (const f of factors) {
              if (f === '') continue;
              const isBaseUnit = VALID_BASE_UNITS.has(f);
              const isPrefix = VALID_SI_PREFIXES.has(f);
              expect(isBaseUnit || isPrefix).toBe(true);
            }
          }
        }
      } else {
        // If no __ unit is present, must be an explicit count or dimensionless ratio
        expect(isCount || isShare).toBe(true);
      }
    }

    it.each(inputIds)('input variable in "%s" conforms to unit naming grammar', (id) => {
      const varName = id.split('/')[2];
      validateVariableName(varName);
    });

    it.each(resultIds)('result variable in "%s" conforms to unit naming grammar', (id) => {
      const varName = id.split('/')[2];
      validateVariableName(varName);
    });
  });

  describe('Domain Canonical Identifiers & Existing Aliases', () => {
    it('retrieves Economy results using canonical unit-suffixed IDs', () => {
      calc.calculate_over_years();

      const canonicalLocal = calc.get_results('economy/results/turnover_local__M__eur_per_a');
      expect(canonicalLocal).toBeDefined();
      expect(canonicalLocal.length).toBeGreaterThan(0);

      const canonicalBizTax = calc.get_results('economy/results/business_tax_local__M__eur_per_a');
      expect(canonicalBizTax).toBeDefined();
      expect(canonicalBizTax.length).toBeGreaterThan(0);

      const canonicalHeating = calc.get_results('economy/results/invest_heating_material__M__eur_per_a');
      expect(canonicalHeating).toBeDefined();
      expect(canonicalHeating.length).toBeGreaterThan(0);
    });

    it('retrieves Stakeholders results using canonical unit-suffixed IDs', () => {
      calc.calculate_over_years();

      const canonicalPriv = calc.get_results('stakeholders/results/private_invest__M__eur_per_a');
      expect(canonicalPriv).toBeDefined();
      expect(canonicalPriv.length).toBeGreaterThan(0);

      const canonicalIndProfit = calc.get_results('stakeholders/results/industry_profit_from_measures__M__eur_per_a');
      expect(canonicalIndProfit).toBeDefined();
      expect(canonicalIndProfit.length).toBeGreaterThan(0);

      const canonicalComInvest = calc.get_results('stakeholders/results/community_invest__M__eur_per_a');
      expect(canonicalComInvest).toBeDefined();
      expect(canonicalComInvest.length).toBeGreaterThan(0);
    });

    it('resolves Energy and Buildings aliases', () => {
      calc.calculate_over_years();

      // Buildings costs_total
      const canonicalCosts = calc.get_results('buildings/results/costs_total__M__eur/private');
      const aliasCosts = calc.get_results('buildings/results/costs_total_heating__M__eur/private');
      const aliasCostsPerA = calc.get_results('buildings/results/costs_total__M__eur_per_a/private');
      expect(canonicalCosts).toEqual(aliasCosts);
      expect(canonicalCosts).toEqual(aliasCostsPerA);

      // Energy wind_installed casing
      const windWP = calc.get_results('energy/results/wind_installed__M__WP/industry');
      const windWp = calc.get_results('energy/results/wind_installed__M__Wp/industry');
      expect(windWP).toEqual(windWp);
    });
  });
});
