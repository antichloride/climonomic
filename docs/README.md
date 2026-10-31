# climcalc-core Documentation

Welcome to the documentation for **`climcalc-core`**, a WebAssembly-based simulation engine for municipal climate mitigation and economic impact assessment.

## Documentation Overview

1. [**Technical Architecture & Rust Setup Guide**](rust_setup_and_architecture.md)
   - Rust toolchain and build configuration (`Cargo.toml`, `wasm-pack`).
   - WebAssembly integration, JavaScript bridge, and API lifecycle.
   - Type system hierarchy: `Input`, `Measure`, `Results`, `SectorsInputs`, `SectorsResult`, and `SectorsRawValues`.
   - Vector math, operator overloading, and macro-based metaprogramming.
   - Comprehensive testing pipeline: Unit tests, in-browser Wasm tests, and automated Excel ground-truth validation via Python.

2. [**Calculation Logic, Domain Guide, and Scenario Modeling**](calculation_logic_and_scenarios.md)
   - Municipal transformation scope and dual objective (ecological emissions vs. economic viability).
   - Core concepts: **Measures** (active municipal policy interventions) vs. **Scenarios** (exogenous macroeconomic trends such as oil, gas, and electricity price curves).
   - Five-stage annual calculation pipeline (Primary physical demands, coupled feedback, emissions, macroeconomics, stakeholder net cash flows).
   - Domain-specific breakdown: Buildings, Energy, Mobility, Economy, and Stakeholder cash flows.
   - Consolidated variable and unit summary reference.

3. [**Variable Naming Convention**](../variables_naming_convention.md)
   - Syntax rules for encoding SI multipliers (`__k__`, `__M__`, `__G__`, `__m__`), physical units, and quotients.
