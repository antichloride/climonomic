# Climonomic Engine — Mathematical & Physical Formulation Catalog

> Auto-generated documentation of all mathematical calculations, equations, and physical units in the Climonomic simulation core.

## Overview

Every variable in the Climonomic calculator encodes its physical unit and SI scale directly into its name using double underscores (`__`), as specified in [variables_naming_convention.md](../variables_naming_convention.md).
Equations are declared via declarative Rust macros (`src/equations.rs`) as a **single source of truth** and exposed directly through the WebAssembly API (`calc.get_equation_metadata(id)`).

Each calculation is statically verified for:

1. **Dimensional Consistency**: The physical dimensions of the resulting quantity must match the combined dimensions of the input arguments.
2. **Scale Factor Balance**: Numeric factors in code ($K_{\text{code}}$) must balance the SI prefixes of the variables according to the physical balance law:
   $$K_{\text{code}} \times \text{scale}(\text{LHS}) = \text{scale}(\text{RHS}_{\text{variables}})$$

---

## Table of Contents

- [Buildings Sector](#buildings-sector)
- [Energy & Renewables Sector](#energy-renewables-sector)
- [Mobility Sector](#mobility-sector)
- [Macroeconomics Sector](#macroeconomics-sector)
- [Stakeholders Sector](#stakeholders-sector)

---

## Buildings Sector

**Source Implementation:** [`src/buildings/calculate.rs`](../src/buildings/calculate.rs)

*Space heating demand, hot water, boiler fuel consumption, energetic renovations, heat pump electricity demand, and building sector emissions.*

### `floor_A__k__m2`

> **Description:** Total floor area across all buildings in the municipality

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{floor\_A} = \mathrm{floor\_A\_building} \cdot \mathrm{n\_buildings} \cdot 10^{-3}
$$

**Formula Expression:**
```rust
floor_A__k__m2 = &floor_A_building__m2 * &n_buildings * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `floor_A__k__m2` | **LHS (Result)** | `k__m2` | $10^3\text{ m}^2$ | Area |
| `floor_A_building__m2` | Input / Variable | `m2` | $\text{m}^2$ | Area |
| `n_buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `total_heat_dmd__G__W_h_per_a`

> **Description:** Total space heating demand

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{total\_heat\_dmd} = \left(\mathrm{n\_inhabitants} \cdot \mathrm{hot\_water\_dmd} + \mathrm{heat\_dmd} \cdot \mathrm{floor\_A}\right) \cdot 10^{-3}
$$

**Formula Expression:**
```rust
total_heat_dmd__G__W_h_per_a = (&n_inhabitants__k__ * &hot_water_dmd__k__W_h_per_m2_a + &heat_dmd__k__W_h_per_m2_a * &floor_A__k__m2) * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `total_heat_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `n_inhabitants__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `hot_water_dmd__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `heat_dmd__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |

---

### `elec_dmd__G__W_h_per_a`

> **Description:** Electricity demand across all inhabitants

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{elec\_dmd} = \mathrm{elec\_dmd\_capita} \cdot \mathrm{n\_inhabitants} \cdot 10^{-3}
$$

**Formula Expression:**
```rust
elec_dmd__G__W_h_per_a = &elec_dmd_capita__k_W_h_per_a * &n_inhabitants__k__ * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `elec_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `elec_dmd_capita__k_W_h_per_a` | Input / Variable | `k_W_h_per_a` | $\text{kWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `n_inhabitants__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |

---

### `total_heat_dmd__M__W_h_per_m2_a`

> **Description:** Specific heat demand per unit floor area

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{total\_heat\_dmd} = \frac{\mathrm{total\_heat\_dmd}}{\mathrm{floor\_A}}
$$

**Formula Expression:**
```rust
total_heat_dmd__M__W_h_per_m2_a = &total_heat_dmd__G__W_h_per_a / &floor_A__k__m2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `total_heat_dmd__M__W_h_per_m2_a` | **LHS (Result)** | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `total_heat_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |

---

### `cnsmp_oil__G__W_h_per_a`

> **Description:** Space heating fuel consumption from non-condensing oil systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_oil} = \frac{\mathrm{A\_heat\_oil} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_oil__G__W_h_per_a = &A_heat_oil__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::oil_no_condensing.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_oil__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_oil__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `oil_no_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_oil_condensing__G__W_h_per_a`

> **Description:** Space heating fuel consumption from condensing oil systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_oil\_condensing} = \frac{\mathrm{A\_heat\_oil\_condensing} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_oil_condensing__G__W_h_per_a = &A_heat_oil_condensing__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::oil_with_condensing.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_oil_condensing__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_oil_condensing__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `oil_with_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_gas__G__W_h_per_a`

> **Description:** Space heating fuel consumption from natural gas systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_gas} = \frac{\mathrm{A\_heat\_gas} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_gas__G__W_h_per_a = &A_heat_gas__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::gas.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_gas__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_gas__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `gas` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_district_heating__G__W_h_per_a`

> **Description:** Thermal energy supplied by district heating networks

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_district\_heating} = \frac{\mathrm{A\_heat\_district\_heating} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_district_heating__G__W_h_per_a = &A_heat_district_heating__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::district_heating.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_district_heating__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_district_heating__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `district_heating` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_elec_heat_pump__G__W_h_per_a`

> **Description:** Electricity consumption of heat pump heating systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_elec\_heat\_pump} = \frac{\mathrm{A\_heat\_heat\_pump} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_elec_heat_pump__G__W_h_per_a = &A_heat_heat_pump__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::heat_pump.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_elec_heat_pump__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_heat_pump__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_other__G__W_h_per_a`

> **Description:** Other heating fuel consumption

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_other} = \frac{\mathrm{A\_heat\_other} \cdot \mathrm{total\_heat\_dmd}}{None}
$$

**Formula Expression:**
```rust
cnsmp_other__G__W_h_per_a = &A_heat_other__k__m2 * &total_heat_dmd__M__W_h_per_m2_a / constants::other.efficency;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_other__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_other__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `other` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `costs_other__M__eur_per_a`

> **Description:** Other heating fuel expenditures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_other} = \mathrm{cnsmp\_other} \cdot \mathrm{price\_other\_output\_nrg}
$$

**Formula Expression:**
```rust
costs_other__M__eur_per_a = &cnsmp_other__G__W_h_per_a * price_other_output_nrg__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_other__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cnsmp_other__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `price_other_output_nrg__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `cnsmp_oil__M__L_per_a`

> **Description:** Heating oil consumption in million liters

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_oil} = \frac{\mathrm{cnsmp\_oil} + \mathrm{cnsmp\_oil\_condensing}}{\mathrm{energy\_density}}
$$

**Formula Expression:**
```rust
cnsmp_oil__M__L_per_a = (&results.cnsmp_oil__G__W_h_per_a.get_year(year) + &results.cnsmp_oil_condensing__G__W_h_per_a.get_year(year)) / constants::EnergySource::oil::energy_density__k__W_h_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_oil__M__L_per_a` | **LHS (Result)** | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `energy_density__k__W_h_per_L` | Input / Variable | `k__W_h_per_L` | $10^3\text{ (thousands)}$ | Power, Time (hours), 1 / Volume |
| `cnsmp_oil__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `cnsmp_oil_condensing__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `cnsmp_gas__M__m3_per_a`

> **Description:** Natural gas heating fuel consumption in million cubic meters

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_gas} = \frac{\mathrm{cnsmp\_gas}}{\mathrm{energy\_density}}
$$

**Formula Expression:**
```rust
cnsmp_gas__M__m3_per_a = &results.cnsmp_gas__G__W_h_per_a.get_year(year) / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_gas__M__m3_per_a` | **LHS (Result)** | `M__m3_per_a` | $\text{Mio. m}^3/\text{a}$ | 1 / Time (annual), Volume |
| `cnsmp_gas__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `energy_density__k__W_h_per_m3` | Input / Variable | `k__W_h_per_m3` | $10^3\text{ (thousands)}$ | Power, Time (hours), 1 / Volume |

---

### `cnsmp_gas_district_heating__M__m3_per_a`

> **Description:** Natural gas consumed for district heating generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_gas\_district\_heating} = \frac{\left(1 - \mathrm{district\_heating\_renewable\_part}\right) \cdot \mathrm{cnsmp\_district\_heating}}{\mathrm{energy\_density}}
$$

**Formula Expression:**
```rust
cnsmp_gas_district_heating__M__m3_per_a = (1.0 - &district_heating_renewable_part) * &results.cnsmp_district_heating__G__W_h_per_a.get_year(year) / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_gas_district_heating__M__m3_per_a` | **LHS (Result)** | `M__m3_per_a` | $\text{Mio. m}^3/\text{a}$ | 1 / Time (annual), Volume |
| `energy_density__k__W_h_per_m3` | Input / Variable | `k__W_h_per_m3` | $10^3\text{ (thousands)}$ | Power, Time (hours), 1 / Volume |
| `cnsmp_district_heating__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `district_heating_renewable_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cnsmp_total_heat__G__W_h_per_a`

> **Description:** Total municipal heat consumption across all heating technologies

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cnsmp\_total\_heat} = \mathrm{c\_oil\_cond} + \mathrm{c\_gas} + \mathrm{c\_hp} + \mathrm{c\_other}
$$

**Formula Expression:**
```rust
cnsmp_total_heat__G__W_h_per_a = c_oil_cond + c_gas + c_hp + c_other;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_total_heat__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `c_other` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `c_hp` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `c_oil_cond` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `c_gas` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `costs_oil__M__eur_per_a`

> **Description:** Total annual expenditures on heating oil

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_oil} = \mathrm{cnsmp\_oil} \cdot \mathrm{price\_oil}
$$

**Formula Expression:**
```rust
costs_oil__M__eur_per_a = &cnsmp_oil__M__L_per_a * price_oil__eur_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_oil__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cnsmp_oil__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `price_oil__eur_per_L` | Input / Variable | `eur_per_L` | $\text{€}/\text{L}$ | Financial Currency (€), 1 / Volume |

---

### `costs_gas__M__eur_per_a`

> **Description:** Total annual expenditures on natural gas

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_gas} = \mathrm{cnsmp\_gas} \cdot \mathrm{price\_gas}
$$

**Formula Expression:**
```rust
costs_gas__M__eur_per_a = &cnsmp_gas__M__m3_per_a * price_gas__eur_per_m3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_gas__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cnsmp_gas__M__m3_per_a` | Input / Variable | `M__m3_per_a` | $\text{Mio. m}^3/\text{a}$ | 1 / Time (annual), Volume |
| `price_gas__eur_per_m3` | Input / Variable | `eur_per_m3` | $\text{€}/\text{m}^3$ | Financial Currency (€), 1 / Volume |

---

### `costs_client_district_heating__M__eur_per_a`

> **Description:** Total client costs for district heating

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_client\_district\_heating} = \mathrm{cnsmp\_district\_heating} \cdot \mathrm{price\_district\_heating}
$$

**Formula Expression:**
```rust
costs_client_district_heating__M__eur_per_a = &results.cnsmp_district_heating__G__W_h_per_a.get_year(year) * price_district_heating__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_client_district_heating__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cnsmp_district_heating__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `price_district_heating__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `invest_heat_sources__M__eur_per_a`

> **Description:** Total annual capital expenditure for heating system transitions

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_heat\_sources} = \mathrm{invest\_oil\_no\_condensing} + \mathrm{invest\_oil\_with\_condensing} + \mathrm{invest\_gas} + \mathrm{invest\_district\_heating} + \mathrm{invest\_heat\_pump} + \mathrm{invest\_other}
$$

**Formula Expression:**
```rust
invest_heat_sources__M__eur_per_a = invest_oil_no_condensing + invest_oil_with_condensing + invest_gas + invest_district_heating + invest_heat_pump + invest_other;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_heat_sources__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_other` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `invest_heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `invest_district_heating` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `invest_gas` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `invest_oil_no_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `invest_oil_with_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `grant_heat_sources__M__eur_per_a`

> **Description:** Total annual subsidies and grants for heating system transitions

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{grant\_heat\_sources} = \mathrm{grant\_oil\_no\_condensing} + \mathrm{grant\_oil\_with\_condensing} + \mathrm{grant\_gas} + \mathrm{grant\_district\_heating} + \mathrm{grant\_heat\_pump} + \mathrm{grant\_other}
$$

**Formula Expression:**
```rust
grant_heat_sources__M__eur_per_a = grant_oil_no_condensing + grant_oil_with_condensing + grant_gas + grant_district_heating + grant_heat_pump + grant_other;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `grant_heat_sources__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `grant_other` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `grant_heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `grant_district_heating` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `grant_gas` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `grant_oil_no_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `grant_oil_with_condensing` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_energetic_renovation__M__eur_per_a`

> **Description:** Building energetic renovation investment expenditures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_energetic\_renovation} = \frac{\left(\mathrm{heat\_dmd\_prev\_year} - \mathrm{heat\_dmd\_this\_year}\right) \cdot \mathrm{invest} \cdot \mathrm{floor\_A}}{1\,000} \cdot None
$$

**Formula Expression:**
```rust
invest_energetic_renovation__M__eur_per_a = (&heat_dmd_prev_year__k__W_h_per_m2_a - &heat_dmd_this_year__k__W_h_per_m2_a) * constants::energetic_restoration::invest__m__eur_per_W_h_m2 * &floor_A__k__m2 / 1000.0 * heat_dmd_prev_year__k__W_h_per_m2_a .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_energetic_renovation__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heat_dmd_this_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `heat_dmd_prev_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `invest__m__eur_per_W_h_m2` | Input / Variable | `m__eur_per_W_h_m2` | $\text{m€}/\text{Wh}$ | 1 / Area, Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `grant_energetic_renovation__M__eur_per_a`

> **Description:** Public grants for building energetic renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{grant\_energetic\_renovation} = \left(\mathrm{heat\_dmd\_prev\_year} - \mathrm{heat\_dmd\_this\_year}\right) \cdot \mathrm{floor\_A} \cdot \mathrm{invest} \cdot \mathrm{grant} \cdot None
$$

**Formula Expression:**
```rust
grant_energetic_renovation__M__eur_per_a = (&heat_dmd_prev_year__k__W_h_per_m2_a - &heat_dmd_this_year__k__W_h_per_m2_a) * &floor_A__k__m2 * constants::energetic_restoration::invest__m__eur_per_W_h_m2 * constants::energetic_restoration::grant * heat_dmd_prev_year__k__W_h_per_m2_a .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 1000

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `grant_energetic_renovation__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `grant` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `heat_dmd_this_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `invest__m__eur_per_W_h_m2` | Input / Variable | `m__eur_per_W_h_m2` | $\text{m€}/\text{Wh}$ | 1 / Area, Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `heat_dmd_prev_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |

---

### `invest_total__M__eur_per_a`

> **Description:** Total investment in building heating systems and renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_total} = \mathrm{invest\_heat\_sources} + \mathrm{invest\_energetic\_renovation}
$$

**Formula Expression:**
```rust
invest_total__M__eur_per_a = &invest_heat_sources__M__eur_per_a + &invest_energetic_renovation__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_total__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_sources__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_energetic_renovation__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `grant_total__M__eur_per_a`

> **Description:** Total grants for heating transitions and renovations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{grant\_total} = \mathrm{grant\_heat\_sources} + \mathrm{grant\_energetic\_renovation}
$$

**Formula Expression:**
```rust
grant_total__M__eur_per_a = &grant_heat_sources__M__eur_per_a + &grant_energetic_renovation__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `grant_total__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `grant_heat_sources__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `grant_energetic_renovation__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `costs_heat_pump__M__eur`

> **Description:** Total electricity expenditures for heat pumps

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_heat\_pump} = \mathrm{cnsmp\_elec\_heat\_pump} \cdot \mathrm{nrg\_own\_mix\_price} \cdot \left(1 - \mathrm{evu\_discount\_heat\_pump}\right)
$$

**Formula Expression:**
```rust
costs_heat_pump__M__eur = &cnsmp_elec_heat_pump__G__W_h_per_a * &nrg_own_mix_price__m__eur_per_W_h * (1.0 - evu_discount_heat_pump);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_heat_pump__M__eur` | **LHS (Result)** | `M__eur` | $\text{M€}$ | Financial Currency (€) |
| `cnsmp_elec_heat_pump__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_own_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `evu_discount_heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `costs_total__M__eur`

> **Description:** Total building energy and heating expenditures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{costs\_total} = \mathrm{costs\_oil} + \mathrm{costs\_gas} + \mathrm{costs\_client\_district\_heating} + \mathrm{costs\_heat\_pump} + \mathrm{costs\_other}
$$

**Formula Expression:**
```rust
costs_total__M__eur = costs_oil__M__eur_per_a + costs_gas__M__eur_per_a + costs_client_district_heating__M__eur_per_a + costs_heat_pump__M__eur + costs_other__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_total__M__eur` | **LHS (Result)** | `M__eur` | $\text{M€}$ | Financial Currency (€) |
| `costs_other__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `costs_heat_pump__M__eur` | Input / Variable | `M__eur` | $\text{M€}$ | Financial Currency (€) |
| `costs_client_district_heating__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `costs_oil__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `costs_gas__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `ems_oil__k__to_coe_per_a`

> **Description:** Greenhouse gas emissions from heating oil consumption

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{ems\_oil} = \mathrm{cnsmp\_oil} \cdot \mathrm{emission}
$$

**Formula Expression:**
```rust
ems_oil__k__to_coe_per_a = cnsmp_oil__M__L_per_a * constants::EnergySource::oil::emission__kg_coe_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `ems_oil__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cnsmp_oil__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `emission__kg_coe_per_L` | Input / Variable | `kg_coe_per_L` | $\text{kg }\text{CO}_2\text{e}/\text{L}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |

---

### `ems_gas__k__to_coe_per_a`

> **Description:** Greenhouse gas emissions from natural gas consumption

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{ems\_gas} = \mathrm{cnsmp\_gas} \cdot \mathrm{emission}
$$

**Formula Expression:**
```rust
ems_gas__k__to_coe_per_a = cnsmp_gas__G__W_h_per_a * constants::EnergySource::gas::emission__kg_coe_per_m3;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'mass': 1, 'co2_equivalent': 1, 'time_a': -1} vs RHS {'power': 1, 'time_h': 1, 'time_a': -1, 'mass': 1, 'co2_equivalent': 1, 'volume': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `ems_gas__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cnsmp_gas__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `emission__kg_coe_per_m3` | Input / Variable | `kg_coe_per_m3` | $\text{kg }\text{CO}_2\text{e}/\text{m}^3$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |

---

## Energy & Renewables Sector

**Source Implementation:** [`src/energy/calculate.rs`](../src/energy/calculate.rs)

*Rooftop photovoltaics (PV), open-space ground-mounted solar, onshore wind generation, electricity grid mix procurement, and renewable feed-in.*

### `sol_rf_potential__M__Wp`

> **Description:** Rooftop solar power generation potential

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_potential} = \mathrm{rf\_A} \cdot \mathrm{sol\_rf\_suitable\_A\_part} \cdot None
$$

**Formula Expression:**
```rust
sol_rf_potential__M__Wp = &rf_A__ha * &sol_rf_suitable_A_part * constants::solar_roof.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 0.1

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_potential__M__Wp` | **LHS (Result)** | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `rf_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `sol_rf_suitable_A_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_nrg__G__W_h_per_a`

> **Description:** Rooftop solar annual electricity generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_nrg} = \mathrm{sol\_rf\_installed} \cdot None
$$

**Formula Expression:**
```rust
sol_rf_nrg__G__W_h_per_a = &sol_rf_installed__M__Wp * constants::solar_roof.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {'power_peak': 1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_self_cnsmp__G__W_h_per_a`

> **Description:** Rooftop solar self-consumed electricity

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_self\_cnsmp} = \mathrm{sol\_rf\_nrg} \cdot \mathrm{sol\_rf\_self\_cnsmp\_part}
$$

**Formula Expression:**
```rust
sol_rf_self_cnsmp__G__W_h_per_a = &sol_rf_nrg__G__W_h_per_a * &sol_rf_self_cnsmp_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_self_cnsmp__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_invest__M__eur_per_a`

> **Description:** Annual capital expenditure for rooftop solar installations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_invest} = \left(\mathrm{sol\_rf\_installed} - \mathrm{sol\_rf\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
sol_rf_invest__M__eur_per_a = (&sol_rf_installed__M__Wp_this_year - &sol_rf_installed__M__Wp_prev_year) * constants::solar_roof.invest__m__eur_per_Wp * sol_rf_installed__M__Wp_this_year .is_greater(&sol_rf_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 1000

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_rf_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_grant__M__eur_per_a`

> **Description:** Subsidies and grants for rooftop solar installations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_grant} = \left(\mathrm{sol\_rf\_installed} - \mathrm{sol\_rf\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
sol_rf_grant__M__eur_per_a = (&sol_rf_installed__M__Wp_this_year - &sol_rf_installed__M__Wp_prev_year) * constants::solar_roof.grant__m__eur_per_Wp * sol_rf_installed__M__Wp_this_year .is_greater(&sol_rf_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 1000

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_rf_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_om__M__eur_per_a`

> **Description:** Cumulative operation and maintenance costs for rooftop solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_om} = \mathrm{sol\_rf\_om} + \mathrm{sol\_rf\_invest} \cdot None
$$

**Formula Expression:**
```rust
sol_rf_om__M__eur_per_a = &sol_rf_om__M__eur_per_a_last_year + &(&sol_rf_invest__M__eur_per_a * constants::solar_roof.operation_costs);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_om__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_om__M__eur_per_a_last_year` | Input / Variable | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_revenue__M__eur_per_a`

> **Description:** Feed-in revenue from surplus rooftop solar electricity

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_revenue} = \left(\mathrm{sol\_rf\_nrg} - \mathrm{sol\_rf\_self\_cnsmp}\right) \cdot None
$$

**Formula Expression:**
```rust
sol_rf_revenue__M__eur_per_a = (&sol_rf_nrg__G__W_h_per_a - &sol_rf_self_cnsmp__G__W_h_per_a) * constants::solar_roof.buyback_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_revenue__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_installed__M__Wp`

> **Description:** Open-space solar installed peak power capacity

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_installed} = 10^{-1} \cdot \mathrm{sol\_os\_installed\_A} \cdot None
$$

**Formula Expression:**
```rust
sol_os_installed__M__Wp = 1e-1 * &sol_os_installed_A__ha * constants::solar_landscape.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 0.01

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_installed__M__Wp` | **LHS (Result)** | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_nrg__G__W_h_per_a`

> **Description:** Open-space solar annual electricity generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_nrg} = 10^{-3} \cdot \mathrm{sol\_os\_installed} \cdot None
$$

**Formula Expression:**
```rust
sol_os_nrg__G__W_h_per_a = 1e-3 * &sol_os_installed__M__Wp * constants::solar_landscape.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {'power_peak': 1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_self_cnsmp__G__W_h_per_a`

> **Description:** Open-space solar self-consumed electricity

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_self\_cnsmp} = \mathrm{sol\_os\_nrg} \cdot \mathrm{sol\_os\_self\_cnsmp\_part}
$$

**Formula Expression:**
```rust
sol_os_self_cnsmp__G__W_h_per_a = &sol_os_nrg__G__W_h_per_a * &sol_os_self_cnsmp_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_self_cnsmp__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_self_cnsmp_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_invest__M__eur_per_a`

> **Description:** Annual capital expenditure for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_invest} = \left(\mathrm{sol\_os\_installed} - \mathrm{sol\_os\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
sol_os_invest__M__eur_per_a = (&sol_os_installed__M__Wp_this_year - &sol_os_installed__M__Wp_prev_year) * constants::solar_landscape.invest__m__eur_per_Wp * sol_os_installed__M__Wp_this_year .is_greater(&sol_os_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 1000

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_grant__M__eur_per_a`

> **Description:** Subsidies and grants for open-space solar installations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_grant} = \left(\mathrm{sol\_os\_installed} - \mathrm{sol\_os\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
sol_os_grant__M__eur_per_a = (&sol_os_installed__M__Wp_this_year - &sol_os_installed__M__Wp_prev_year) * constants::solar_landscape.grant__m__eur_per_Wp * sol_os_installed__M__Wp_this_year .is_greater(&sol_os_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio 1000

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_om__M__eur_per_a`

> **Description:** Annual operation and maintenance costs for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_om} = \mathrm{sol\_os\_om} + \mathrm{sol\_os\_invest} \cdot None
$$

**Formula Expression:**
```rust
sol_os_om__M__eur_per_a = &sol_os_om__M__eur_per_a_last_year + &(&sol_os_invest__M__eur_per_a * constants::solar_landscape.operation_costs);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_om__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_om__M__eur_per_a_last_year` | Input / Variable | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_turnover_buyback__M__eur_per_a`

> **Description:** Feed-in turnover for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_turnover\_buyback} = \mathrm{sol\_os\_nrg} \cdot None
$$

**Formula Expression:**
```rust
sol_os_turnover_buyback__M__eur_per_a = &sol_os_nrg__G__W_h_per_a * constants::solar_landscape.buyback_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_turnover_buyback__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_prod_costs__M__eur_per_a`

> **Description:** Production and generation costs for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_prod\_costs} = \mathrm{sol\_os\_nrg} \cdot None
$$

**Formula Expression:**
```rust
sol_os_prod_costs__M__eur_per_a = &sol_os_nrg__G__W_h_per_a * constants::solar_landscape.costs;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {'power': 1, 'time_h': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_prod_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_revenue__M__eur_per_a`

> **Description:** Net revenue from open-space solar generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_os\_revenue} = \mathrm{sol\_os\_turnover\_buyback} - \mathrm{sol\_os\_prod\_costs}
$$

**Formula Expression:**
```rust
sol_os_revenue__M__eur_per_a = &sol_os_turnover_buyback__M__eur_per_a - &sol_os_prod_costs__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_revenue__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_turnover_buyback__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_prod_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `wind_installed__M__WP`

> **Description:** Wind installed peak power capacity

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_installed} = 10 \cdot \mathrm{wind\_installed\_A} \cdot None
$$

**Formula Expression:**
```rust
wind_installed__M__WP = 1e1 * &wind_installed_A__ha * constants::wind_onshore.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_installed__M__WP` | **LHS (Result)** | `M__WP` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_installed_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_nrg__G__W_h_per_a`

> **Description:** Wind annual electricity generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_nrg} = 10^{-3} \cdot \mathrm{wind\_installed} \cdot None
$$

**Formula Expression:**
```rust
wind_nrg__G__W_h_per_a = 1e-3 * &wind_installed__M__WP * constants::wind_onshore.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {'power_peak': 1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `wind_installed__M__WP` | Input / Variable | `M__WP` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_invest__M__eur_per_a`

> **Description:** Capital expenditure for onshore wind installations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_invest} = 10^{-3} \cdot \left(\mathrm{wind\_installed} - \mathrm{wind\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
wind_invest__M__eur_per_a = 1e-3 * (&wind_installed__M__WP_this_year - &wind_installed__M__WP_prev_year) * constants::wind_onshore.invest__m__eur_per_Wp * wind_installed__M__WP_this_year .is_greater(&wind_installed__M__WP_prev_year);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_installed__M__WP_prev_year` | Input / Variable | `M__WP_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `wind_installed__M__WP_this_year` | Input / Variable | `M__WP_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `wind_grant__M__eur_per_a`

> **Description:** Subsidies and grants for onshore wind installations

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_grant} = 10^{-3} \cdot \left(\mathrm{wind\_installed} - \mathrm{wind\_installed}\right) \cdot None \cdot None
$$

**Formula Expression:**
```rust
wind_grant__M__eur_per_a = 1e-3 * (&wind_installed__M__WP_this_year - &wind_installed__M__WP_prev_year) * constants::wind_onshore.grant__m__eur_per_Wp * wind_installed__M__WP_this_year .is_greater(&wind_installed__M__WP_prev_year);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_installed__M__WP_prev_year` | Input / Variable | `M__WP_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `wind_installed__M__WP_this_year` | Input / Variable | `M__WP_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `wind_om__M__eur_per_a`

> **Description:** Cumulative operation and maintenance costs for onshore wind

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_om} = \mathrm{wind\_om} + \mathrm{wind\_invest} \cdot None
$$

**Formula Expression:**
```rust
wind_om__M__eur_per_a = &wind_om__M__eur_per_a_last_year + &(&wind_invest__M__eur_per_a * constants::wind_onshore.operation_costs);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_om__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_om__M__eur_per_a_last_year` | Input / Variable | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_turnover_buyback__M__eur_per_a`

> **Description:** Feed-in turnover for onshore wind

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_turnover\_buyback} = \mathrm{wind\_nrg} \cdot None
$$

**Formula Expression:**
```rust
wind_turnover_buyback__M__eur_per_a = &wind_nrg__G__W_h_per_a * constants::wind_onshore.buyback_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_turnover_buyback__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_revenue__M__eur_per_a`

> **Description:** Net revenue from onshore wind generation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{wind\_revenue} = \mathrm{wind\_turnover\_buyback} - \mathrm{wind\_om}
$$

**Formula Expression:**
```rust
wind_revenue__M__eur_per_a = &wind_turnover_buyback__M__eur_per_a - &wind_om__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_revenue__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_turnover_buyback__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_om__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `prchsd_renewable_nrg__M__eur_per_a`

> **Description:** Total cost of purchased renewable energy

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{prchsd\_renewable\_nrg} = \mathrm{prchsd\_renewable\_nrg} \cdot \mathrm{renewable\_nrg\_price}
$$

**Formula Expression:**
```rust
prchsd_renewable_nrg__M__eur_per_a = &prchsd_renewable_nrg__G__W_h_per_a * &renewable_nrg_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_renewable_nrg__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_renewable_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `renewable_nrg_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `elec_nrg_dmd__G__W_h_per_a`

> **Description:** Total electricity demand across buildings, heat pumps, and electric vehicles

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{elec\_nrg\_dmd} = \mathrm{electric\_power\_demand\_buildings} + \mathrm{energy\_heating\_heat\_pump} + \mathrm{bev\_electric\_power\_demand}
$$

**Formula Expression:**
```rust
elec_nrg_dmd__G__W_h_per_a = electric_power_demand_buildings + energy_heating_heat_pump + bev_electric_power_demand;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `elec_nrg_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `bev_electric_power_demand` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `electric_power_demand_buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `energy_heating_heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `prchsd_nrg_mix__G__W_h_per_a`

> **Description:** Grid electricity demand remaining after self-consumption and direct green power

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{prchsd\_nrg\_mix} = \mathrm{elec\_nrg\_dmd} - \mathrm{sol\_rf\_self\_cnsmp} - \mathrm{sol\_os\_self\_cnsmp} - \mathrm{prchsd\_renewable\_nrg}
$$

**Formula Expression:**
```rust
prchsd_nrg_mix__G__W_h_per_a = elec_nrg_dmd__G__W_h_per_a - sol_rf_self_cnsmp__G__W_h_per_a - sol_os_self_cnsmp__G__W_h_per_a - prchsd_renewable_nrg__G__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_nrg_mix__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `prchsd_renewable_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `elec_nrg_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `prchsd_nrg_mix_costs__M__eur_per_a`

> **Description:** Total cost of purchased electricity mix

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{prchsd\_nrg\_mix\_costs} = \mathrm{prchsd\_nrg\_mix} \cdot \mathrm{nrg\_mix\_price}
$$

**Formula Expression:**
```rust
prchsd_nrg_mix_costs__M__eur_per_a = &prchsd_nrg_mix__G__W_h_per_a * &nrg_mix_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_nrg_mix_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_nrg_mix__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sol_rf_costs__M__eur_per_a`

> **Description:** Net cost of rooftop solar generation and self-consumption

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_costs} = \mathrm{sol\_rf\_self\_cnsmp} \cdot None - \mathrm{sol\_rf\_revenue}
$$

**Formula Expression:**
```rust
sol_rf_costs__M__eur_per_a = &sol_rf_self_cnsmp__G__W_h_per_a * constants::solar_roof.buyback_price__m__eur_per_W_h - &sol_rf_revenue__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_revenue__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_costs__eur_per_kWh`

> **Description:** Rooftop solar electricity generation cost per kWh

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sol\_rf\_costs} = \frac{\mathrm{sol\_rf\_costs}}{\mathrm{sol\_rf\_self\_cnsmp}}
$$

**Formula Expression:**
```rust
sol_rf_costs__eur_per_kWh = &sol_rf_costs__M__eur_per_a / &sol_rf_self_cnsmp__G__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_costs__eur_per_kWh` | **LHS (Result)** | `eur_per_kWh` | $\text{€}/\text{kWh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `sol_rf_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `total_nrg_costs__M__eur_per_a`

> **Description:** Total electricity procurement and generation costs across sectors

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{total\_nrg\_costs} = \mathrm{prchsd\_renewable\_nrg} + \mathrm{prchsd\_nrg\_mix\_costs} + \mathrm{sol\_rf\_costs}
$$

**Formula Expression:**
```rust
total_nrg_costs__M__eur_per_a = prchsd_renewable_nrg__M__eur_per_a + prchsd_nrg_mix_costs__M__eur_per_a + sol_rf_costs__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `total_nrg_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_renewable_nrg__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_nrg_mix_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `total_nrg_volume__G__W_h_per_a`

> **Description:** Total electricity procurement and generation volume across sectors

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{total\_nrg\_volume} = \mathrm{sol\_rf\_self\_cnsmp} + \mathrm{prchsd\_renewable\_nrg} + \mathrm{prchsd\_nrg\_mix}
$$

**Formula Expression:**
```rust
total_nrg_volume__G__W_h_per_a = sol_rf_self_cnsmp__G__W_h_per_a + prchsd_renewable_nrg__G__W_h_per_a + prchsd_nrg_mix__G__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `total_nrg_volume__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `prchsd_nrg_mix__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `prchsd_renewable_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `nrg_own_mix_price__m__eur_per_W_h`

> **Description:** Effective municipal electricity tariff based on weighted power mix costs

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{nrg\_own\_mix\_price} = \frac{\mathrm{total\_nrg\_costs}}{\mathrm{total\_nrg\_volume}}
$$

**Formula Expression:**
```rust
nrg_own_mix_price__m__eur_per_W_h = &total_nrg_costs__M__eur_per_a / &total_nrg_volume__G__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `nrg_own_mix_price__m__eur_per_W_h` | **LHS (Result)** | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `total_nrg_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `total_nrg_volume__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `prchsd_nrg_mix_ems__k__to_coe_per_a`

> **Description:** Emissions from purchased electricity grid mix

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{prchsd\_nrg\_mix\_ems} = \mathrm{prchsd\_nrg\_mix} \cdot \mathrm{weighted\_average} \cdot 10^{-3}
$$

**Formula Expression:**
```rust
prchsd_nrg_mix_ems__k__to_coe_per_a = &prchsd_nrg_mix__G__W_h_per_a * constants::evu_emissions::weighted_average * 1e-3;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'mass': 1, 'co2_equivalent': 1, 'time_a': -1} vs RHS {'power': 1, 'time_h': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_nrg_mix_ems__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `prchsd_nrg_mix__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `weighted_average` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `feed_in_total__G__W_h_per_a`

> **Description:** Total private surplus PV solar feed-in to the electricity grid

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{feed\_in\_total} = \mathrm{sol\_rf\_nrg} \cdot \left(1 - \mathrm{sol\_rf\_self\_cnsmp\_part}\right)
$$

**Formula Expression:**
```rust
feed_in_total__G__W_h_per_a = sol_rf_nrg.private * (1.0 - sol_rf_self_cnsmp_part.private);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `feed_in_total__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_nrg` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_self_cnsmp_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `feed_in_ems_avoided__k__to_coe_per_a`

> **Description:** Avoided greenhouse gas emissions from fed-in solar power displacing grid mix

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{feed\_in\_ems\_avoided} = \mathrm{feed\_in\_total} \cdot \mathrm{avoidance\_factor}
$$

**Formula Expression:**
```rust
feed_in_ems_avoided__k__to_coe_per_a = feed_in_total__G__W_h_per_a * avoidance_factor;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'mass': 1, 'co2_equivalent': 1, 'time_a': -1} vs RHS {'power': 1, 'time_h': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `feed_in_ems_avoided__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `feed_in_total__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `avoidance_factor` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

## Mobility Sector

**Source Implementation:** [`src/mobility/calculate.rs`](../src/mobility/calculate.rs)

*Vehicle fleet mileage, battery electric vehicle (BEV) power demand, combustion fuel consumption, street lighting infrastructure, and tailpipe emissions.*

### `traveld_dist_car__M__m_per_a`

> **Description:** Total annual distance traveled by car across vehicle fleet

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{traveld\_dist\_car} = \mathrm{car\_mileage}
$$

**Formula Expression:**
```rust
traveld_dist_car__M__m_per_a = car_mileage;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `traveld_dist_car__M__m_per_a` | **LHS (Result)** | `M__m_per_a` | $10^6\text{ m}/\text{a}$ | Length, 1 / Time (annual) |
| `car_mileage` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `cars_grant__M__eur_per_a`

> **Description:** Subsidies and purchase grants for electric vehicles

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cars\_grant} = \left(\mathrm{n\_bev} - \mathrm{n\_bev}\right) \cdot \mathrm{grant\_per\_car}
$$

**Formula Expression:**
```rust
cars_grant__M__eur_per_a = (&n_bev__k___this_year - &n_bev__k___prev_year) * constants::bev::grant_per_car__k__eur * n_bev__k___this_year.is_greater(&n_bev__k___prev_year);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `grant_per_car__k__eur` | Input / Variable | `k__eur` | $10^3\text{ (thousands)}$ | Financial Currency (€) |
| `n_bev__k___this_year` | Input / Variable | `k___this_year` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `n_bev__k___prev_year` | Input / Variable | `k___prev_year` | $10^3\text{ (thousands)}$ | Dimensionless / Count |

---

### `bev_elec_nrg_dmd__G__W_h_per_a`

> **Description:** Electric power demand for battery electric vehicle fleet

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{bev\_elec\_nrg\_dmd} = \mathrm{n\_bev} \cdot \mathrm{traveld\_dist\_car} \cdot \mathrm{nrg\_cnsmp} \cdot 10^{-2}
$$

**Formula Expression:**
```rust
bev_elec_nrg_dmd__G__W_h_per_a = &n_bev__k__ * &traveld_dist_car__M__m_per_a * constants::bev::nrg_cnsmp__1em2__W_h_per_m * 1e-2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `bev_elec_nrg_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_cnsmp__1em2__W_h_per_m` | Input / Variable | `1em2__W_h_per_m` | $\text{m}^2$ | 1 / Length, Power, Time (hours) |
| `n_bev__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `traveld_dist_car__M__m_per_a` | Input / Variable | `M__m_per_a` | $10^6\text{ m}/\text{a}$ | Length, 1 / Time (annual) |

---

### `cars_fuel_dmd__M__L_per_a`

> **Description:** Combustion fuel demand for internal combustion engine cars

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cars\_fuel\_dmd} = \text{(n_cars__k__ - n_bev__k__) * traveld_dist_car__M__m_per_a * nrg_cnsmp__1em2__W_h_per_m / oil::energy_density__k__W_h_per_L * 1e-2}
$$

**Formula Expression:**
```rust
cars_fuel_dmd__M__L_per_a = (&n_cars__k__ - &n_bev__k__) * &traveld_dist_car__M__m_per_a * constants::combustor::nrg_cnsmp__1em2__W_h_per_m / oil::energy_density__k__W_h_per_L * 1e-2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_fuel_dmd__M__L_per_a` | **LHS (Result)** | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `energy_density__k__W_h_per_L` | Input / Variable | `k__W_h_per_L` | $10^3\text{ (thousands)}$ | Power, Time (hours), 1 / Volume |
| `n_bev__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `n_cars__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `nrg_cnsmp__1em2__W_h_per_m` | Input / Variable | `1em2__W_h_per_m` | $\text{m}^2$ | 1 / Length, Power, Time (hours) |
| `oil` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `traveld_dist_car__M__m_per_a` | Input / Variable | `M__m_per_a` | $10^6\text{ m}/\text{a}$ | Length, 1 / Time (annual) |

---

### `cars_fuel_costs__M__eur_per_a`

> **Description:** Annual fuel costs for combustion cars

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cars\_fuel\_costs} = \mathrm{cars\_fuel\_dmd} \cdot \mathrm{price\_fuel}
$$

**Formula Expression:**
```rust
cars_fuel_costs__M__eur_per_a = &cars_fuel_dmd__M__L_per_a * price_fuel__eur_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_fuel_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cars_fuel_dmd__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `price_fuel__eur_per_L` | Input / Variable | `eur_per_L` | $\text{€}/\text{L}$ | Financial Currency (€), 1 / Volume |

---

### `sl_nrg_dmd__G__W_h_per_a`

> **Description:** Electricity demand for municipal street lighting

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sl\_nrg\_dmd} = \mathrm{n\_sl} \cdot 10^{-3} \cdot \mathrm{nrg\_cnsmp\_per\_sl}
$$

**Formula Expression:**
```rust
sl_nrg_dmd__G__W_h_per_a = n_sl__k__ * 1e-3 * nrg_cnsmp_per_sl__k__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sl_nrg_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_cnsmp_per_sl__k__W_h_per_a` | Input / Variable | `k__W_h_per_a` | $\text{kWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `n_sl__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |

---

### `bev_elec_nrg_price__G__W_h_per_a`

> **Description:** Electricity costs for battery electric vehicle fleet charging

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{bev\_elec\_nrg\_price} = \mathrm{bev\_elec\_nrg\_dmd} \cdot \mathrm{nrg\_own\_mix\_price}
$$

**Formula Expression:**
```rust
bev_elec_nrg_price__G__W_h_per_a = &bev_elec_nrg_dmd__G__W_h_per_a * &nrg_own_mix_price__m__eur_per_W_h;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'power': 1, 'time_h': 1, 'time_a': -1} vs RHS {'time_a': -1, 'currency': 1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `bev_elec_nrg_price__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `bev_elec_nrg_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_own_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sl_nrg_costs__M__eur_per_a`

> **Description:** Electricity costs for municipal street lighting

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sl\_nrg\_costs} = \mathrm{n\_sl} \cdot \mathrm{nrg\_cnsmp\_per\_sl} \cdot \mathrm{nrg\_own\_mix\_price} \cdot 10^{-3}
$$

**Formula Expression:**
```rust
sl_nrg_costs__M__eur_per_a = n_sl__k__ * nrg_cnsmp_per_sl__k__W_h_per_a * nrg_own_mix_price__m__eur_per_W_h.public * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sl_nrg_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `nrg_own_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `n_sl__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `nrg_cnsmp_per_sl__k__W_h_per_a` | Input / Variable | `k__W_h_per_a` | $\text{kWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `sl_om_costs__M__eur_per_a`

> **Description:** Operation and maintenance costs for municipal street lighting

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sl\_om\_costs} = \mathrm{n\_sl} \cdot \mathrm{om\_costs\_per\_sl} \cdot 10^{-3}
$$

**Formula Expression:**
```rust
sl_om_costs__M__eur_per_a = n_sl__k__ * om_costs_per_sl__eur_per_a * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sl_om_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `n_sl__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `om_costs_per_sl__eur_per_a` | Input / Variable | `eur_per_a` | $\text{currency} \cdot \text{time_a}^{-1}$ | Financial Currency (€), 1 / Time (annual) |

---

### `sl_total_costs__M__eur_per_a`

> **Description:** Total costs for municipal street lighting

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{sl\_total\_costs} = \mathrm{sl\_nrg\_costs} + \mathrm{sl\_om\_costs}
$$

**Formula Expression:**
```rust
sl_total_costs__M__eur_per_a = sl_nrg_costs__M__eur_per_a + sl_om_costs__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sl_total_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sl_nrg_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sl_om_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `cars_ems__k__to_coe_per_a`

> **Description:** Tailpipe greenhouse gas emissions from combustion cars

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{cars\_ems} = \text{cars_fuel_dmd__M__L_per_a * oil::emission__kg_coe_per_L}
$$

**Formula Expression:**
```rust
cars_ems__k__to_coe_per_a = cars_fuel_dmd__M__L_per_a * oil::emission__kg_coe_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_ems__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cars_fuel_dmd__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `emission__kg_coe_per_L` | Input / Variable | `kg_coe_per_L` | $\text{kg }\text{CO}_2\text{e}/\text{L}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |
| `oil` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

## Macroeconomics Sector

**Source Implementation:** [`src/economy/calculate.rs`](../src/economy/calculate.rs)

*Capital expenditure splits (material vs. labor), local vs. national turnover, full-time equivalent (FTE) jobs, municipal business taxes, and tax revenues.*

### `invest_heating_material__M__eur_per_a`

> **Description:** Material investment share for heating systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_heating\_material} = \mathrm{invest\_heat\_sources} \cdot \mathrm{heating\_heatpump}
$$

**Formula Expression:**
```rust
invest_heating_material__M__eur_per_a = invest_heat_sources__M__eur_per_a * constants::material::invest_local::heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_heating_material__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_sources__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_heating_work__M__eur_per_a`

> **Description:** Labor and installation investment share for heating systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_heating\_work} = \mathrm{invest\_heat\_sources} \cdot \left(1 - \mathrm{heating\_heatpump}\right)
$$

**Formula Expression:**
```rust
invest_heating_work__M__eur_per_a = invest_heat_sources__M__eur_per_a * (1.0 - constants::material::invest_local::heating_heatpump);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_heating_work__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_sources__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heating_crafting_local__M__eur_per_a`

> **Description:** Local craftsmanship turnover from heating systems installation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heating\_crafting\_local} = \mathrm{invest\_heating\_work} \cdot \mathrm{heating\_heatpump}
$$

**Formula Expression:**
```rust
turnover_heating_crafting_local__M__eur_per_a = invest_heating_work__M__eur_per_a * constants::invest_work::loacal_value_add::heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_crafting_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heating_crafting_national__M__eur_per_a`

> **Description:** National craftsmanship turnover from heating systems installation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heating\_crafting\_national} = \mathrm{invest\_heating\_work} \cdot \mathrm{heating\_heatpump}
$$

**Formula Expression:**
```rust
turnover_heating_crafting_national__M__eur_per_a = invest_heating_work__M__eur_per_a * constants::invest_work::national_added_value::heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_crafting_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heating_production_national__M__eur_per_a`

> **Description:** National industrial manufacturing turnover for heating equipment

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heating\_production\_national} = \mathrm{invest\_heating\_material} \cdot \mathrm{heating\_heatpump}
$$

**Formula Expression:**
```rust
turnover_heating_production_national__M__eur_per_a = invest_heating_material__M__eur_per_a * constants::material::invest_national::heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_production_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_heat_demand_material__M__eur_per_a`

> **Description:** Material investment share for energetic renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_heat\_demand\_material} = \mathrm{invest\_energetic\_renovation} \cdot \mathrm{energetic\_restoration}
$$

**Formula Expression:**
```rust
invest_heat_demand_material__M__eur_per_a = invest_energetic_renovation__M__eur_per_a * constants::material::invest_local::energetic_restoration;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_heat_demand_material__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_energetic_renovation__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_heat_demand_work__M__eur_per_a`

> **Description:** Craftsmanship labor investment share for energetic renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_heat\_demand\_work} = \mathrm{invest\_energetic\_renovation} \cdot \left(1 - \mathrm{energetic\_restoration}\right)
$$

**Formula Expression:**
```rust
invest_heat_demand_work__M__eur_per_a = invest_energetic_renovation__M__eur_per_a * (1.0 - constants::material::invest_local::energetic_restoration);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_heat_demand_work__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_energetic_renovation__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heat_demand_crafting_local__M__eur_per_a`

> **Description:** Local craftsmanship turnover from building renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heat\_demand\_crafting\_local} = \mathrm{invest\_heat\_demand\_work} \cdot \mathrm{energetic\_restoration}
$$

**Formula Expression:**
```rust
turnover_heat_demand_crafting_local__M__eur_per_a = invest_heat_demand_work__M__eur_per_a * constants::invest_work::loacal_value_add::energetic_restoration;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heat_demand_crafting_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_demand_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heat_demand_crafting_national__M__eur_per_a`

> **Description:** National craftsmanship turnover from building renovation

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heat\_demand\_crafting\_national} = \mathrm{invest\_heat\_demand\_work} \cdot \mathrm{energetic\_restoration}
$$

**Formula Expression:**
```rust
turnover_heat_demand_crafting_national__M__eur_per_a = invest_heat_demand_work__M__eur_per_a * constants::invest_work::national_added_value::energetic_restoration;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heat_demand_crafting_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_demand_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heat_demand_production_national__M__eur_per_a`

> **Description:** National production turnover for insulation and building materials

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_heat\_demand\_production\_national} = \mathrm{invest\_heat\_demand\_material} \cdot \mathrm{heating\_heatpump}
$$

**Formula Expression:**
```rust
turnover_heat_demand_production_national__M__eur_per_a = invest_heat_demand_material__M__eur_per_a * constants::material::invest_national::heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heat_demand_production_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_demand_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_solar_roof_material__M__eur_per_a`

> **Description:** Material investment share for rooftop solar systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_solar\_roof\_material} = \mathrm{sol\_rf\_invest} \cdot \mathrm{solar\_roof}
$$

**Formula Expression:**
```rust
invest_solar_roof_material__M__eur_per_a = sol_rf_invest__M__eur_per_a * constants::material::invest_local::solar_roof;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_solar_roof_material__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_solar_roof_work__M__eur_per_a`

> **Description:** Installation labor investment share for rooftop solar systems

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_solar\_roof\_work} = \mathrm{sol\_rf\_invest} \cdot \left(1 - \mathrm{solar\_roof}\right)
$$

**Formula Expression:**
```rust
invest_solar_roof_work__M__eur_per_a = sol_rf_invest__M__eur_per_a * (1.0 - constants::material::invest_local::solar_roof);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_solar_roof_work__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_roof_crafting_local__M__eur_per_a`

> **Description:** Local craftsmanship turnover from rooftop solar maintenance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_roof\_crafting\_local} = \mathrm{maintenance\_solar\_roof\_work} \cdot \mathrm{solar\_roof}
$$

**Formula Expression:**
```rust
turnover_solar_roof_crafting_local__M__eur_per_a = maintenance_solar_roof_work * constants::invest_work::loacal_value_add::solar_roof;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_roof_crafting_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `maintenance_solar_roof_work` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_roof_crafting_national__M__eur_per_a`

> **Description:** National craftsmanship turnover from rooftop solar maintenance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_roof\_crafting\_national} = \mathrm{maintenance\_solar\_roof\_work} \cdot \mathrm{solar\_roof}
$$

**Formula Expression:**
```rust
turnover_solar_roof_crafting_national__M__eur_per_a = maintenance_solar_roof_work * constants::invest_work::national_added_value::solar_roof;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_roof_crafting_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `maintenance_solar_roof_work` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_roof_production_national__M__eur_per_a`

> **Description:** National manufacturing turnover for rooftop solar components

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_roof\_production\_national} = \mathrm{invest\_solar\_roof\_work} \cdot \mathrm{solar\_roof}
$$

**Formula Expression:**
```rust
turnover_solar_roof_production_national__M__eur_per_a = invest_solar_roof_work__M__eur_per_a * constants::material::invest_national::solar_roof;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_roof_production_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_solar_roof_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_solar_landscape_material__M__eur_per_a`

> **Description:** Material investment share for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_solar\_landscape\_material} = \mathrm{sol\_os\_invest} \cdot \mathrm{solar\_landscape}
$$

**Formula Expression:**
```rust
invest_solar_landscape_material__M__eur_per_a = sol_os_invest__M__eur_per_a * constants::material::invest_local::solar_landscape;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_solar_landscape_material__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `invest_solar_landscape_work__M__eur_per_a`

> **Description:** Installation labor investment share for open-space solar

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{invest\_solar\_landscape\_work} = \mathrm{sol\_os\_invest} \cdot \left(1 - \mathrm{solar\_landscape}\right)
$$

**Formula Expression:**
```rust
invest_solar_landscape_work__M__eur_per_a = sol_os_invest__M__eur_per_a * (1.0 - constants::material::invest_local::solar_landscape);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_solar_landscape_work__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_landscape_crafting_local__M__eur_per_a`

> **Description:** Local craftsmanship turnover from open-space solar maintenance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_landscape\_crafting\_local} = \mathrm{maintenance\_solar\_landscape\_work} \cdot \mathrm{solar\_landscape}
$$

**Formula Expression:**
```rust
turnover_solar_landscape_crafting_local__M__eur_per_a = maintenance_solar_landscape_work * constants::invest_work::loacal_value_add::solar_landscape;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_landscape_crafting_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `maintenance_solar_landscape_work` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_landscape_crafting_national__M__eur_per_a`

> **Description:** National craftsmanship turnover from open-space solar maintenance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_landscape\_crafting\_national} = \mathrm{maintenance\_solar\_landscape\_work} \cdot \mathrm{solar\_landscape}
$$

**Formula Expression:**
```rust
turnover_solar_landscape_crafting_national__M__eur_per_a = maintenance_solar_landscape_work * constants::invest_work::national_added_value::solar_landscape;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_landscape_crafting_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `maintenance_solar_landscape_work` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_solar_landscape_production_national__M__eur_per_a`

> **Description:** National manufacturing turnover for open-space solar components

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_solar\_landscape\_production\_national} = \mathrm{invest\_solar\_landscape\_work} \cdot \mathrm{solar\_landscape}
$$

**Formula Expression:**
```rust
turnover_solar_landscape_production_national__M__eur_per_a = invest_solar_landscape_work__M__eur_per_a * constants::material::invest_national::solar_landscape;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_solar_landscape_production_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_solar_landscape_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `n_jobs_crafting_local`

> **Description:** Local employment generated by craft installations and maintenance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{n\_jobs\_crafting\_local} = \frac{\mathrm{turnover\_heating\_crafting\_local}}{\mathrm{heating\_heatpump}} + \frac{\mathrm{turnover\_heat\_demand\_crafting\_local}}{\mathrm{energetic\_restoration}} + \frac{\mathrm{turnover\_solar\_roof\_crafting\_local}}{\mathrm{solar\_roof}} + \frac{\mathrm{turnover\_solar\_landscape\_crafting\_local}}{\mathrm{solar\_landscape}}
$$

**Formula Expression:**
```rust
n_jobs_crafting_local = turnover_heating_crafting_local__M__eur_per_a / constants::fte_per_million_turnover::work::heating_heatpump + turnover_heat_demand_crafting_local__M__eur_per_a / constants::fte_per_million_turnover::work::energetic_restoration + turnover_solar_roof_crafting_local__M__eur_per_a / constants::fte_per_million_turnover::work::solar_roof + turnover_solar_landscape_crafting_local__M__eur_per_a / constants::fte_per_million_turnover::work::solar_landscape;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {} vs RHS {'currency': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `n_jobs_crafting_local` | **LHS (Result)** | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_landscape_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_roof_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heating_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heat_demand_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `n_jobs_crafting_national`

> **Description:** National craft employment generated across Germany

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{n\_jobs\_crafting\_national} = \frac{\mathrm{turnover\_heating\_crafting\_national}}{\mathrm{heating\_heatpump}} + \frac{\mathrm{turnover\_heat\_demand\_crafting\_national}}{\mathrm{energetic\_restoration}} + \frac{\mathrm{turnover\_solar\_roof\_crafting\_national}}{\mathrm{solar\_roof}} + \frac{\mathrm{turnover\_solar\_landscape\_crafting\_national}}{\mathrm{solar\_landscape}}
$$

**Formula Expression:**
```rust
n_jobs_crafting_national = turnover_heating_crafting_national__M__eur_per_a / constants::fte_per_million_turnover::work::heating_heatpump + turnover_heat_demand_crafting_national__M__eur_per_a / constants::fte_per_million_turnover::work::energetic_restoration + turnover_solar_roof_crafting_national__M__eur_per_a / constants::fte_per_million_turnover::work::solar_roof + turnover_solar_landscape_crafting_national__M__eur_per_a / constants::fte_per_million_turnover::work::solar_landscape;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {} vs RHS {'currency': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `n_jobs_crafting_national` | **LHS (Result)** | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_landscape_crafting_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_roof_crafting_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heating_crafting_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heat_demand_crafting_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `n_jobs_production_national`

> **Description:** National manufacturing employment generated across Germany

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{n\_jobs\_production\_national} = \frac{\mathrm{turnover\_heating\_production\_national}}{\mathrm{heating\_heatpump}} + \frac{\mathrm{turnover\_heat\_demand\_production\_national}}{\mathrm{energetic\_restoration}} + \frac{\mathrm{turnover\_solar\_roof\_production\_national}}{\mathrm{solar\_roof}} + \frac{\mathrm{turnover\_solar\_landscape\_production\_national}}{\mathrm{solar\_landscape}}
$$

**Formula Expression:**
```rust
n_jobs_production_national = turnover_heating_production_national__M__eur_per_a / constants::fte_per_million_turnover::material::heating_heatpump + turnover_heat_demand_production_national__M__eur_per_a / constants::fte_per_million_turnover::material::energetic_restoration + turnover_solar_roof_production_national__M__eur_per_a / constants::fte_per_million_turnover::material::solar_roof + turnover_solar_landscape_production_national__M__eur_per_a / constants::fte_per_million_turnover::material::solar_landscape;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {} vs RHS {'currency': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `n_jobs_production_national` | **LHS (Result)** | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_landscape_production_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_roof_production_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heating_production_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heat_demand_production_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `n_jobs_production_sum_national`

> **Description:** Total direct and indirect national employment across Germany

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{n\_jobs\_production\_sum\_national} = \mathrm{n\_jobs\_crafting\_national} + \mathrm{n\_jobs\_production\_national}
$$

**Formula Expression:**
```rust
n_jobs_production_sum_national = n_jobs_crafting_national + n_jobs_production_national;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `n_jobs_production_sum_national` | **LHS (Result)** | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `n_jobs_crafting_national` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `n_jobs_production_national` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `income_local__M__eur_per_a`

> **Description:** Total employee compensation generated within the municipality

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{income\_local} = \mathrm{n\_jobs\_crafting\_local} \cdot \mathrm{income\_per\_fte}
$$

**Formula Expression:**
```rust
income_local__M__eur_per_a = n_jobs_crafting_local * constants::tax::income_per_fte;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `income_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `n_jobs_crafting_local` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `income_per_fte` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `income_national__M__eur_per_a`

> **Description:** Total employee compensation generated at national level

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{income\_national} = \left(\mathrm{n\_jobs\_crafting\_national} + \mathrm{n\_jobs\_production\_national}\right) \cdot \mathrm{income\_per\_fte}
$$

**Formula Expression:**
```rust
income_national__M__eur_per_a = (n_jobs_crafting_national + n_jobs_production_national) * constants::tax::income_per_fte;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch: LHS {'currency': 1, 'time_a': -1} vs RHS {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `income_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_per_fte` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `n_jobs_crafting_national` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `n_jobs_production_national` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `income_tax_local__M__eur_per_a`

> **Description:** Municipal share of income tax revenue

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{income\_tax\_local} = \mathrm{income\_local} \cdot \mathrm{income\_tax\_local\_per\_fte}
$$

**Formula Expression:**
```rust
income_tax_local__M__eur_per_a = income_local__M__eur_per_a * constants::tax::income_tax_local_per_fte;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `income_tax_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_tax_local_per_fte` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `income_tax_national__M__eur_per_a`

> **Description:** Total federal and state income tax revenue

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{income\_tax\_national} = \mathrm{income\_national} \cdot \mathrm{income\_tax\_per\_fte}
$$

**Formula Expression:**
```rust
income_tax_national__M__eur_per_a = income_national__M__eur_per_a * constants::tax::income_tax_per_fte;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `income_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_tax_per_fte` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_local__M__eur_per_a`

> **Description:** Total economic turnover generated within the municipality

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_local} = \mathrm{turnover\_heating\_crafting\_local} + \mathrm{invest\_heating\_material} \cdot \mathrm{heating\_heatpump} + \mathrm{turnover\_heat\_demand\_crafting\_local} + \mathrm{invest\_heat\_demand\_material} \cdot \mathrm{energetic\_restoration} + \mathrm{turnover\_solar\_roof\_crafting\_local} + \mathrm{invest\_solar\_roof\_material} \cdot \mathrm{solar\_roof} + \mathrm{turnover\_solar\_landscape\_crafting\_local} + \mathrm{invest\_solar\_landscape\_material} \cdot \mathrm{solar\_landscape}
$$

**Formula Expression:**
```rust
turnover_local__M__eur_per_a = turnover_heating_crafting_local__M__eur_per_a + invest_heating_material__M__eur_per_a * constants::invest_work::loacal_value_add::heating_heatpump + turnover_heat_demand_crafting_local__M__eur_per_a + invest_heat_demand_material__M__eur_per_a * constants::invest_work::loacal_value_add::energetic_restoration + turnover_solar_roof_crafting_local__M__eur_per_a + invest_solar_roof_material__M__eur_per_a * constants::invest_work::loacal_value_add::solar_roof + turnover_solar_landscape_crafting_local__M__eur_per_a + invest_solar_landscape_material__M__eur_per_a * constants::invest_work::loacal_value_add::solar_landscape;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_solar_landscape_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_solar_landscape_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_solar_roof_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_solar_roof_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heat_demand_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_demand_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energetic_restoration` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_heating_crafting_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `revenue_local__M__eur_per_a`

> **Description:** Operating profits and margins retained locally by municipal firms

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{revenue\_local} = \mathrm{turnover\_local} \cdot \mathrm{revenue\_local\_part}
$$

**Formula Expression:**
```rust
revenue_local__M__eur_per_a = turnover_local__M__eur_per_a * constants::revenue_local_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `revenue_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `revenue_local_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_national__M__eur_per_a`

> **Description:** Total national turnover across all climate protection measures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_national} = \mathrm{invest\_heat\_sources} + \mathrm{invest\_energetic\_renovation} + \mathrm{sol\_rf\_invest} + \mathrm{sol\_os\_invest}
$$

**Formula Expression:**
```rust
turnover_national__M__eur_per_a = invest_heat_sources__M__eur_per_a + invest_energetic_renovation__M__eur_per_a + sol_rf_invest__M__eur_per_a + sol_os_invest__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heat_sources__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_energetic_renovation__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `turnover_tax_local__M__eur_per_a`

> **Description:** Municipal share of value-added / turnover tax revenue

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_tax\_local} = \mathrm{turnover\_local} \cdot \mathrm{turnover\_tax} \cdot \mathrm{turnover\_tax\_local\_part}
$$

**Formula Expression:**
```rust
turnover_tax_local__M__eur_per_a = turnover_local__M__eur_per_a * constants::tax::turnover_tax * constants::tax::turnover_tax_local_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_tax_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_tax_local_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `turnover_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_tax_national__M__eur_per_a`

> **Description:** Federal turnover / value-added tax revenue

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{turnover\_tax\_national} = \mathrm{income\_national} \cdot \mathrm{turnover\_tax}
$$

**Formula Expression:**
```rust
turnover_tax_national__M__eur_per_a = income_national__M__eur_per_a * constants::tax::turnover_tax;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `business_tax_local__M__eur_per_a`

> **Description:** Municipal business tax revenue (Gewerbesteuer)

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{business\_tax\_local} = \mathrm{turnover\_local} \cdot \mathrm{business\_tax}
$$

**Formula Expression:**
```rust
business_tax_local__M__eur_per_a = turnover_local__M__eur_per_a * constants::tax::business_tax;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `business_tax_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `business_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `business_tax_national__M__eur_per_a`

> **Description:** National business tax revenue (Gewerbesteuer Umlage)

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{business\_tax\_national} = \mathrm{turnover\_national} \cdot \mathrm{business\_tax}
$$

**Formula Expression:**
```rust
business_tax_national__M__eur_per_a = turnover_national__M__eur_per_a * constants::tax::business_tax;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `business_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `business_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `corporate_tax_national__M__eur_per_a`

> **Description:** Federal corporate income tax revenue (Körperschaftsteuer)

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{corporate\_tax\_national} = \mathrm{turnover\_national} \cdot \mathrm{corporate\_tax}
$$

**Formula Expression:**
```rust
corporate_tax_national__M__eur_per_a = turnover_national__M__eur_per_a * constants::tax::corporate_tax;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `corporate_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `corporate_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `energy_tax_national__M__eur_per_a`

> **Description:** Avoided / net change in federal energy tax revenue from fossil phase-out

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{energy\_tax\_national} = \left(\mathrm{cnsmp\_oil} - \mathrm{cnsmp\_oil}\right) \cdot \mathrm{oil} + \left(\mathrm{cnsmp\_gas} - \mathrm{cnsmp\_gas}\right) \cdot \mathrm{gas} + \left(\mathrm{cars\_fuel\_dmd} - \mathrm{cars\_fuel\_dmd}\right) \cdot \mathrm{fuel}
$$

**Formula Expression:**
```rust
energy_tax_national__M__eur_per_a = (cnsmp_oil__M__L_per_a_first_year - cnsmp_oil__M__L_per_a) * constants::energy_taxes::oil + (cnsmp_gas__G__W_h_per_a_first_year - cnsmp_gas__G__W_h_per_a) * constants::energy_taxes::gas + (cars_fuel_dmd__M__L_per_a_first_year - cars_fuel_dmd__M__L_per_a) * constants::energy_taxes::fuel;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Cannot add mismatched dimensions: {'volume': 1, 'time_a': -1} vs {'power': 1, 'time_h': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `energy_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `fuel` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `oil` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `gas` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `cars_fuel_dmd__M__L_per_a_first_year` | Input / Variable | `M__L_per_a_first_year` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `cars_fuel_dmd__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `cnsmp_oil__M__L_per_a_first_year` | Input / Variable | `M__L_per_a_first_year` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `cnsmp_oil__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `cnsmp_gas__G__W_h_per_a_first_year` | Input / Variable | `G__W_h_per_a_first_year` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `cnsmp_gas__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

## Stakeholders Sector

**Source Implementation:** [`src/stakeholders/calculate.rs`](../src/stakeholders/calculate.rs)

*Net annual cash flows, financial effects of climate measures, and capital expenditure balances across Private, Industry, and Municipal stakeholders.*

### `private_invest__M__eur_per_a`

> **Description:** Total private capital expenditure for climate protection measures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{private\_invest} = None + None - \left(None + None\right) + None - None
$$

**Formula Expression:**
```rust
private_invest__M__eur_per_a = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).private + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).private) - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).private + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).private) + energy.sol_rf_invest__M__eur_per_a().get_year(year).private - energy.sol_rf_grant__M__eur_per_a().get_year(year).private;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `private_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `private_effect_of_measures__M__eur_per_a`

> **Description:** Net annual operational savings for private households

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{private\_effect\_of\_measures} = None - None + None - None + None - None + None - None + \mathrm{sol\_rf\_costs\_prev\_private} - \mathrm{sol\_rf\_costs\_curr\_private} + None - None - \left(None - None\right)
$$

**Formula Expression:**
```rust
private_effect_of_measures__M__eur_per_a = (buildings.results.costs_total__M__eur.get_year(prev).private - buildings.results.costs_total__M__eur.get_year(year).private) + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).private - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).private) + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).private - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).private) + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).private - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).private) + (sol_rf_costs_prev_private - sol_rf_costs_curr_private) + (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).private - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).private) - (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).private - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).private);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `private_effect_of_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_prev_private` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_curr_private` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `mobility` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `private_cash_flow_netto__M__eur_per_a`

> **Description:** Net annual cash flow balance for private households

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{private\_cash\_flow\_netto} = \mathrm{private\_effect\_of\_measures} + \mathrm{private\_invest}
$$

**Formula Expression:**
```rust
private_cash_flow_netto__M__eur_per_a = private_effect_of_measures__M__eur_per_a + private_invest__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `private_cash_flow_netto__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `private_effect_of_measures__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `private_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `industry_profit_from_measures__M__eur_per_a`

> **Description:** Operating profit for commercial and industrial businesses

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{industry\_profit\_from\_measures} = None \cdot \mathrm{revenue\_margin}
$$

**Formula Expression:**
```rust
industry_profit_from_measures__M__eur_per_a = economy.turnover_local__M__eur().get_year(year) * constants::economy::revenue_margin;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `industry_profit_from_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `revenue_margin` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `economy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `industry_invest__M__eur_per_a`

> **Description:** Capital expenditure for commercial and industrial enterprises

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{industry\_invest} = None + None + None + None + None - None + None - None
$$

**Formula Expression:**
```rust
industry_invest__M__eur_per_a = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).industry + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).industry) + (buildings.grant_heat_sources__M__eur_per_a().get_year(year).industry + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).industry) + (energy.sol_rf_invest__M__eur_per_a().get_year(year).industry - energy.sol_rf_grant__M__eur_per_a().get_year(year).industry) + (energy.sol_os_invest__M__eur_per_a().get_year(year).industry - energy.sol_os_grant__M__eur_per_a().get_year(year).industry);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `industry_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `industry_effect_of_measures__M__eur_per_a`

> **Description:** Operational financial effects and savings for commercial sector

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{industry\_effect\_of\_measures} = None - None + None - None + None - None + None - None + \mathrm{sol\_rf\_costs\_prev\_industry} - \mathrm{sol\_rf\_costs\_curr\_industry} + None - None - \left(None - None\right)
$$

**Formula Expression:**
```rust
industry_effect_of_measures__M__eur_per_a = (buildings.results.costs_total__M__eur.get_year(prev).industry - buildings.results.costs_total__M__eur.get_year(year).industry) + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).industry - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).industry) + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).industry - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).industry) + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).industry - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).industry) + (sol_rf_costs_prev_industry - sol_rf_costs_curr_industry) + (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).industry - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).industry) - (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).industry - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).industry);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `industry_effect_of_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_prev_industry` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_curr_industry` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `mobility` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `industry_cash_flow_netto__M__eur_per_a`

> **Description:** Net annual cash flow balance for commercial and industrial sector

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{industry\_cash\_flow\_netto} = \mathrm{industry\_profit\_from\_measures} + \mathrm{industry\_invest} + \mathrm{industry\_effect\_of\_measures}
$$

**Formula Expression:**
```rust
industry_cash_flow_netto__M__eur_per_a = industry_profit_from_measures__M__eur_per_a + industry_invest__M__eur_per_a + industry_effect_of_measures__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `industry_cash_flow_netto__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `industry_effect_of_measures__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `industry_profit_from_measures__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `industry_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `community_invest__M__eur_per_a`

> **Description:** Municipal capital expenditure for public buildings and infrastructure

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{community\_invest} = None + None - \left(None + None\right) + None - None + None - None
$$

**Formula Expression:**
```rust
community_invest__M__eur_per_a = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).schools + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).schools) - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).schools + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).schools) + (energy.sol_rf_invest__M__eur_per_a().get_year(year).public - energy.sol_rf_grant__M__eur_per_a().get_year(year).public) + (energy.sol_os_invest__M__eur_per_a().get_year(year).public - energy.sol_os_grant__M__eur_per_a().get_year(year).public);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `community_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `community_effect_of_measures__M__eur_per_a`

> **Description:** Operational financial effects and savings for the municipality

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{community\_effect\_of\_measures} = None - None + None - None + None - None + None - None + \mathrm{sol\_rf\_costs\_prev\_public} - \mathrm{sol\_rf\_costs\_curr\_public} + None - None - \left(None - None\right)
$$

**Formula Expression:**
```rust
community_effect_of_measures__M__eur_per_a = (buildings.results.costs_total__M__eur.get_year(prev).schools - buildings.results.costs_total__M__eur.get_year(year).schools) + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).public - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).public) + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).public - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).public) + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).public - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).public) + (sol_rf_costs_prev_public - sol_rf_costs_curr_public) + (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).public - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).public) - (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).public - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).public);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `community_effect_of_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_prev_public` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `sol_rf_costs_curr_public` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `mobility` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `community_tax_income_from_measures__M__eur_per_a`

> **Description:** Additional municipal tax revenue generated by climate measures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{community\_tax\_income\_from\_measures} = None + None
$$

**Formula Expression:**
```rust
community_tax_income_from_measures__M__eur_per_a = economy.income_tax_local__M__eur().get_year(year) + economy.business_tax_local__M__eur().get_year(year);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `community_tax_income_from_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `economy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `community_cash_flow_netto__M__eur_per_a`

> **Description:** Net annual municipal cash flow balance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{community\_cash\_flow\_netto} = \mathrm{community\_tax\_income\_from\_measures} + \mathrm{community\_effect\_of\_measures} + \mathrm{community\_invest}
$$

**Formula Expression:**
```rust
community_cash_flow_netto__M__eur_per_a = community_tax_income_from_measures__M__eur_per_a + community_effect_of_measures__M__eur_per_a + community_invest__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `community_cash_flow_netto__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `community_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `community_tax_income_from_measures__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `community_effect_of_measures__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `federal_additional_expenses__M__eur_per_a`

> **Description:** Total federal and state grant expenditures for climate measures

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{federal\_additional\_expenses} = -None + None + None + None + None
$$

**Formula Expression:**
```rust
federal_additional_expenses__M__eur_per_a = -(buildings.grant_heat_sources__M__eur_per_a().get_year(year).sum() + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).sum() + mobility.cars_grant__M__eur_per_a().get_year(year).sum() + energy.sol_rf_grant__M__eur_per_a().get_year(year).sum() + energy.sol_os_grant__M__eur_per_a().get_year(year).sum());
```

**Verification Status:** ⚠️ **Discrepancy Note**: Scale factor mismatch: ratio -1

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `federal_additional_expenses__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `energy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `mobility` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `federal_additional_tax_income__M__eur_per_a`

> **Description:** Additional federal and state tax revenue from climate activities

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{federal\_additional\_tax\_income} = None + None + None + None + None
$$

**Formula Expression:**
```rust
federal_additional_tax_income__M__eur_per_a = economy.income_tax_national__M__eur().get_year(year) + economy.turnover_tax_national__M__eur().get_year(year) + economy.business_tax_national__M__eur().get_year(year) + economy.corporate_tax_national__M__eur().get_year(year) + economy.energy_tax_national__M__eur().get_year(year);
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `federal_additional_tax_income__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `economy` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `federal_cash_flow_netto__M__eur_per_a`

> **Description:** Net annual federal and state cash flow balance

**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)

$$
\mathrm{federal\_cash\_flow\_netto} = \mathrm{federal\_additional\_expenses} + \mathrm{federal\_additional\_tax\_income}
$$

**Formula Expression:**
```rust
federal_cash_flow_netto__M__eur_per_a = federal_additional_expenses__M__eur_per_a + federal_additional_tax_income__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `federal_cash_flow_netto__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `federal_additional_expenses__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `federal_additional_tax_income__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

## Summary Statistics

- **Total Equations Extracted:** 125
- **Equations Verified (100% Dimensional & Scale Balance):** 94
- **Verification Pass Rate:** 75.2%
