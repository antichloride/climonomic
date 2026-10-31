# climcalc-core

This project is a high-performance simulation engine for communities and cities to evaluate both the **ecological** (GHG emissions) and **economic** (investments, jobs, tax yields, and stakeholder cash flows) impacts of climate mitigation roadmaps.

The engine is written in Rust, compiles to WebAssembly (Wasm), and is packaged for seamless integration into web and Node.js applications. A production application implementing this engine can be found at [klimarechner.ansvar.com](https://klimarechner.ansvar.com/).

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- ⚙️ [**Technical Architecture & Rust Setup Guide**](docs/rust_setup_and_architecture.md):
  - Rust build setup and WebAssembly packaging (`wasm-pack`, `cdylib`/`rlib`).
  - JavaScript/TypeScript Wasm bridge and the `Calculator` API lifecycle.
  - Type hierarchy (`Input`, `Measure`, `Results`, `SectorsInputs`, `SectorsResult`, `SectorsRawValues`).
  - Vectorized math, macro metaprogramming, and operator overloading.
  - Multi-tier testing pipeline: Unit tests, in-browser Wasm tests, and automated Excel ground-truth validation.

- 📊 [**Calculation Logic, Domain Guide & Scenario Modeling**](docs/calculation_logic_and_scenarios.md):
  - Municipal transformation goals (ecological emissions vs. economic viability).
  - Understanding **Measures** (active policy interventions with target deltas) vs. **Scenarios** (external macroeconomic trends such as oil, gas, and power price paths).
  - The 5-stage annual calculation pipeline (Primary sector demand, coupled dynamic feedback, emissions, macroeconomics, and stakeholder cash flows).
  - Deep-dive into domains: **Buildings**, **Energy**, **Mobility**, **Economy**, and **Stakeholders**.
  - Consolidated variable dictionary and unit reference.

- 🏷️ [**Variable Naming Convention**](variables_naming_convention.md):
  - Standardized syntax for encoding SI prefixes (`__k__`, `__M__`, `__G__`, `__m__`), physical units, and quotients.

---

## 🚀 Building & Integration

### Building WebAssembly Package
Build the Wasm bundle using `wasm-pack`:
```bash
wasm-pack build
```

Afterward, integrate the generated `pkg/` package into your frontend project:
```typescript
import { Calculator } from "climcalc-core";

// 1. Initialize simulation range
const calc = Calculator.new(2022, 2045);

// 2. Populate inputs using natural JavaScript objects (or individual string IDs):
calc.set_inputs({
  buildings: {
    n_buildings: { private: 44000.0 },
    price_oil__eur_per_L: 0.82
  },
  energy: {
    sol_rf_installed__M__Wp: { private: 36.26 }
  }
});

// 3. Add intervention measures (individually or in bulk)
calc.add_measures([
  { id: "solar_expansion", inputId: "energy/inputs/sol_rf_installed__M__Wp/private", startYear: 2024, endYear: 2035, delta: -20.0 }
]);

// 4. Run multi-stage annual calculation
calc.calculate_over_years();

// 5. Query results: either the full hierarchical object or specific IDs
const results = calc.get_results_object();
console.log(results.buildings.floor_A__k__m2.private);           // Float64Array [197.68, ...]
console.log(results.stakeholders.private_cash_flow_netto);       // Float64Array [...]

// String-based queries continue to be fully supported:
const netCashFlow = calc.get_results("stakeholders/results/private_cash_flow_netto");
```

---

## 🧪 Testing

### Running Tests
Execute tests with standard Cargo:
```bash
cargo test
```

Run specific domain calculation integration tests:
```bash
RUST_BACKTRACE=1 cargo test --tests test_buildings_calculate
RUST_BACKTRACE=1 cargo test --tests test_energy_calculate
RUST_BACKTRACE=1 cargo test --tests test_mobility_calculate
RUST_BACKTRACE=1 cargo test --tests test_economy_calculate
```

### Ingesting Test Cases from Excel
Test fixtures and validation assertions are synchronized directly against reference Excel models via Python:
```bash
python scripts/copy_test_case.py <path_to_excel_model.xlsx>
```
See the [Testing Section in the Technical Architecture Guide](docs/rust_setup_and_architecture.md#4-testing-architecture--verification-pipeline) for full details.



