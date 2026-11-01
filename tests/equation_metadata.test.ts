import { describe, it, expect } from 'vitest';
import { Calculator } from '../pkg/climcalc_core.js';

describe('Equation Metadata & Declarative Macro Verification Suite', () => {
  const calc = new Calculator(2022, 2030);

  it('exposes list_equations() covering all 5 sectors', () => {
    const eqs = calc.list_equations();
    expect(Array.isArray(eqs)).toBe(true);
    expect(eqs.length).toBeGreaterThanOrEqual(100);

    const sectors = new Set(eqs.map((e: any) => e.sector));
    expect(sectors).toContain('buildings');
    expect(sectors).toContain('energy');
    expect(sectors).toContain('mobility');
    expect(sectors).toContain('economy');
    expect(sectors).toContain('stakeholders');

    for (const eq of eqs) {
      expect(typeof eq.id).toBe('string');
      expect(typeof eq.sector).toBe('string');
      expect(typeof eq.description).toBe('string');
      expect(typeof eq.formula).toBe('string');
      expect(eq.formula.length).toBeGreaterThan(0);
      expect(eq.description.length).toBeGreaterThan(0);
    }
  });

  it('retrieves specific equation metadata across all sectors', () => {
    // Buildings
    const b = calc.get_equation_metadata('total_heat_dmd__G__W_h_per_a');
    expect(b.sector).toBe('buildings');
    expect(b.formula).toContain('n_inhabitants__k__');

    // Energy
    const en = calc.get_equation_metadata('sol_rf_nrg__G__W_h_per_a');
    expect(en.sector).toBe('energy');
    expect(en.formula).toContain('sol_rf_installed__M__Wp');

    // Mobility
    const m = calc.get_equation_metadata('bev_elec_nrg_dmd__G__W_h_per_a');
    expect(m.sector).toBe('mobility');
    expect(m.formula).toContain('n_bev__k__');

    // Economy
    const ec = calc.get_equation_metadata('income_tax_local__M__eur_per_a');
    expect(ec.sector).toBe('economy');
    expect(ec.formula).toContain('income_local__M__eur_per_a');

    // Stakeholders
    const st = calc.get_equation_metadata('private_cash_flow_netto__M__eur_per_a');
    expect(st.sector).toBe('stakeholders');
    expect(st.formula).toContain('private_effect_of_measures__M__eur_per_a');
  });

  it('retrieves equation metadata using hierarchical result paths', () => {
    const eq1 = calc.get_equation_metadata('buildings/results/floor_A__k__m2');
    expect(eq1.id).toBe('floor_A__k__m2');
    expect(eq1.sector).toBe('buildings');

    const eq2 = calc.get_equation_metadata('energy/results/wind_nrg__G__W_h_per_a');
    expect(eq2.id).toBe('wind_nrg__G__W_h_per_a');
    expect(eq2.sector).toBe('energy');

    const eq3 = calc.get_equation_metadata('mobility/results/cars_ems__k__to_coe_per_a');
    expect(eq3.id).toBe('cars_ems__k__to_coe_per_a');
    expect(eq3.sector).toBe('mobility');
  });

  it('retrieves equation metadata with valid descriptions and formulas', () => {
    const eqs = calc.list_equations();
    const floorA = eqs.find((e: any) => e.id === 'floor_A__k__m2');
    expect(floorA).toBeDefined();
    expect(floorA.description).toContain('Total floor area');
  });

  it('throws an informative error for non-existent equation IDs', () => {
    expect(() => calc.get_equation_metadata('completely_unknown_equation_id')).toThrow(
      /Equation metadata not found for ID/
    );
  });
});
