# Climonomic Engine — Mathematical & Physical Formulation Catalog

> Auto-generated documentation of all mathematical calculations, equations, and physical units in the Climonomic simulation core.

## Overview

Every variable in the Climonomic calculator encodes its physical unit and SI scale directly into its name using double underscores (`__`), as specified in [variables_naming_convention.md](../variables_naming_convention.md).
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

**Source File:** [`src/buildings/calculate.rs`](../src/buildings/calculate.rs)

*Space heating demand, hot water, boiler fuel consumption, energetic renovations, heat pump electricity demand, and building sector emissions.*

### `floor_A__k__m2`

**Source:** Line 40 (`Explicit Annotation`)

$$
\mathrm{floor\_A} = \mathrm{floor\_A\_building} \cdot \mathrm{n\_buildings} \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
floor_A__k__m2 = floor_A_building__m2 * n_buildings * 1e-3;
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

**Source:** Line 52 (`Explicit Annotation`)

$$
\mathrm{total\_heat\_dmd} = \left(\mathrm{n\_inhabitants} \cdot \mathrm{hot\_water\_dmd} + \mathrm{heat\_dmd} \cdot \mathrm{floor\_A}\right) \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
total_heat_dmd__G__W_h_per_a = (n_inhabitants__k__ * hot_water_dmd__k__W_h_per_m2_a + heat_dmd__k__W_h_per_m2_a * floor_A__k__m2) * 1e-3;
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

**Source:** Line 60 (`Explicit Annotation`)

$$
\mathrm{elec\_dmd} = \mathrm{elec\_dmd\_capita} \cdot \mathrm{n\_inhabitants} \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
elec_dmd__G__W_h_per_a = elec_dmd_capita__k_W_h_per_a * n_inhabitants__k__ * 1e-3;
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

**Source:** Line 68 (`Explicit Annotation`)

$$
\mathrm{total\_heat\_dmd} = \frac{\mathrm{total\_heat\_dmd}}{\mathrm{floor\_A}}
$$

**Raw Code Expression:**
```rust
total_heat_dmd__M__W_h_per_m2_a = total_heat_dmd__G__W_h_per_a / floor_A__k__m2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `total_heat_dmd__M__W_h_per_m2_a` | **LHS (Result)** | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `total_heat_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |

---

### `cnsmp_other__G__W_h_per_a`

**Source:** Line 90 (`Explicit Annotation`)

$$
\mathrm{cnsmp\_other} = \mathrm{A\_heat\_other} \cdot \mathrm{total\_heat\_dmd}
$$

**Raw Code Expression:**
```rust
cnsmp_other__G__W_h_per_a = A_heat_other__k__m2 * total_heat_dmd__M__W_h_per_m2_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cnsmp_other__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `A_heat_other__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `total_heat_dmd__M__W_h_per_m2_a` | Input / Variable | `M__W_h_per_m2_a` | $\text{MWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |

---

### `costs_other__M__eur_per_a`

**Source:** Line 99 (`Explicit Annotation`)

$$
\mathrm{costs\_other} = \mathrm{cnsmp\_other} \cdot \mathrm{price\_other\_output\_nrg}
$$

**Raw Code Expression:**
```rust
costs_other__M__eur_per_a = cnsmp_other__G__W_h_per_a * price_other_output_nrg__m__eur_per_W_h;
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

**Source:** Line 136 (`Explicit Annotation`)

$$
\mathrm{cnsmp\_oil} = \frac{\mathrm{cnsmp\_oil} + \mathrm{cnsmp\_oil\_condensing}}{\mathrm{energy\_density}}
$$

**Raw Code Expression:**
```rust
cnsmp_oil__M__L_per_a = (cnsmp_oil__G__W_h_per_a + cnsmp_oil_condensing__G__W_h_per_a) / energy_density__k__W_h_per_L;
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

**Source:** Line 145 (`Explicit Annotation`)

$$
\mathrm{cnsmp\_gas} = \frac{\mathrm{cnsmp\_gas}}{\mathrm{energy\_density}}
$$

**Raw Code Expression:**
```rust
cnsmp_gas__M__m3_per_a = cnsmp_gas__G__W_h_per_a / energy_density__k__W_h_per_m3;
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

**Source:** Line 154 (`Explicit Annotation`)

$$
\mathrm{cnsmp\_gas\_district\_heating} = \frac{\left(1 - \mathrm{district\_heating\_renewable\_part}\right) \cdot \mathrm{cnsmp\_district\_heating}}{\mathrm{energy\_density}}
$$

**Raw Code Expression:**
```rust
cnsmp_gas_district_heating__M__m3_per_a = (1.0 - district_heating_renewable_part) * cnsmp_district_heating__G__W_h_per_a / energy_density__k__W_h_per_m3;
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

### `costs_oil__M__eur_per_a`

**Source:** Line 191 (`Explicit Annotation`)

$$
\mathrm{costs\_oil} = \mathrm{cnsmp\_oil} \cdot \mathrm{price\_oil}
$$

**Raw Code Expression:**
```rust
costs_oil__M__eur_per_a = cnsmp_oil__M__L_per_a * price_oil__eur_per_L;
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

**Source:** Line 197 (`Explicit Annotation`)

$$
\mathrm{costs\_gas} = \mathrm{cnsmp\_gas} \cdot \mathrm{price\_gas}
$$

**Raw Code Expression:**
```rust
costs_gas__M__eur_per_a = cnsmp_gas__M__m3_per_a * price_gas__eur_per_m3;
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

**Source:** Line 203 (`Explicit Annotation`)

$$
\mathrm{costs\_client\_district\_heating} = \mathrm{cnsmp\_district\_heating} \cdot \mathrm{price\_district\_heating}
$$

**Raw Code Expression:**
```rust
costs_client_district_heating__M__eur_per_a = cnsmp_district_heating__G__W_h_per_a * price_district_heating__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `costs_client_district_heating__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `cnsmp_district_heating__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `price_district_heating__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `invest_energetic_renovation__M__eur_per_a`

**Source:** Line 297 (`Explicit Annotation`)

$$
\mathrm{invest\_energetic\_renovation} = \frac{\left(\mathrm{heat\_dmd\_prev\_year} - \mathrm{heat\_dmd\_this\_year}\right) \cdot \mathrm{invest} \cdot \mathrm{floor\_A}}{1\,000}
$$

**Raw Code Expression:**
```rust
invest_energetic_renovation__M__eur_per_a = (heat_dmd_prev_year__k__W_h_per_m2_a - heat_dmd_this_year__k__W_h_per_m2_a) * invest__m__eur_per_W_h_m2 * floor_A__k__m2 / 1000.0;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `invest_energetic_renovation__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `floor_A__k__m2` | Input / Variable | `k__m2` | $10^3\text{ m}^2$ | Area |
| `invest__m__eur_per_W_h_m2` | Input / Variable | `m__eur_per_W_h_m2` | $\text{m€}/\text{Wh}$ | 1 / Area, Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `heat_dmd_prev_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `heat_dmd_this_year__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |

---

### `invest_total__M__eur_per_a`

**Source:** Line 323 (`Explicit Annotation`)

$$
\mathrm{invest\_total} = \mathrm{invest\_heat\_sources} + \mathrm{invest\_energetic\_renovation}
$$

**Raw Code Expression:**
```rust
invest_total__M__eur_per_a = invest_heat_sources__M__eur_per_a + invest_energetic_renovation__M__eur_per_a;
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

**Source:** Line 331 (`Explicit Annotation`)

$$
\mathrm{grant\_total} = \mathrm{grant\_heat\_sources} + \mathrm{grant\_energetic\_renovation}
$$

**Raw Code Expression:**
```rust
grant_total__M__eur_per_a = grant_heat_sources__M__eur_per_a + grant_energetic_renovation__M__eur_per_a;
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

**Source:** Line 360 (`Explicit Annotation`)

$$
\mathrm{costs\_heat\_pump} = \mathrm{cnsmp\_elec\_heat\_pump} \cdot \mathrm{nrg\_own\_mix\_price} \cdot \left(1 - \mathrm{evu\_discount\_heat\_pump}\right)
$$

**Raw Code Expression:**
```rust
costs_heat_pump__M__eur = cnsmp_elec_heat_pump__G__W_h_per_a * nrg_own_mix_price__m__eur_per_W_h * (1.0 - evu_discount_heat_pump);
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

**Source:** Line 379 (`Explicit Annotation`)

$$
\mathrm{costs\_total} = \mathrm{costs\_oil} + \mathrm{costs\_gas} + \mathrm{costs\_client\_district\_heating} + \mathrm{costs\_heat\_pump} + \mathrm{costs\_other}
$$

**Raw Code Expression:**
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

**Source:** Line 395 (`Explicit Annotation`)

$$
\mathrm{ems\_oil} = \mathrm{cnsmp\_oil} \cdot \mathrm{emission}
$$

**Raw Code Expression:**
```rust
ems_oil__k__to_coe_per_a = cnsmp_oil__M__L_per_a * emission__kg_coe_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `ems_oil__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cnsmp_oil__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `emission__kg_coe_per_L` | Input / Variable | `kg_coe_per_L` | $\text{kg }\text{CO}_2\text{e}/\text{L}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |

---

### `heat_dmd_prev_year__k__W_h_per_m2_a`

**Source:** Line 214 (`Rust Code Assignment`)

$$
\mathrm{heat\_dmd\_prev\_year} = \mathrm{heat\_dmd}
$$

**Raw Code Expression:**
```rust
heat_dmd_prev_year__k__W_h_per_m2_a = heat_dmd__k__W_h_per_m2_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `heat_dmd_prev_year__k__W_h_per_m2_a` | **LHS (Result)** | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `heat_dmd__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |

---

### `heat_dmd_prev_year__k__W_h_per_m2_a`

**Source:** Line 294 (`Rust Code Assignment`)

$$
\mathrm{heat\_dmd\_prev\_year} = \mathrm{heat\_dmd}
$$

**Raw Code Expression:**
```rust
heat_dmd_prev_year__k__W_h_per_m2_a = heat_dmd__k__W_h_per_m2_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `heat_dmd_prev_year__k__W_h_per_m2_a` | **LHS (Result)** | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |
| `heat_dmd__k__W_h_per_m2_a` | Input / Variable | `k__W_h_per_m2_a` | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | 1 / Area, Power, 1 / Time (annual), Time (hours) |

---

### `grant_energetic_renovation__M__eur_per_a`

**Source:** Line 310 (`Rust Code Assignment`)

$$
\mathrm{grant\_energetic\_renovation} = \left(\mathrm{heat\_dmd\_prev\_year} - \mathrm{heat\_dmd\_this\_year}\right) \cdot \mathrm{floor\_A} \cdot \mathrm{invest} \cdot \mathrm{grant} \cdot None
$$

**Raw Code Expression:**
```rust
grant_energetic_renovation__M__eur_per_a = (heat_dmd_prev_year__k__W_h_per_m2_a - heat_dmd_this_year__k__W_h_per_m2_a) * floor_A__k__m2 * invest__m__eur_per_W_h_m2 * grant * heat_dmd_prev_year__k__W_h_per_m2_a .is_greater(heat_dmd_this_year__k__W_h_per_m2_a);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Call(func=Attribute(value=Name(id='heat_dmd_prev_year__k__W_h_per_m2_a', ctx=Load()), attr='is_greater', ctx=Load()), args=[Name(id='heat_dmd_this_year__k__W_h_per_m2_a', ctx=Load())])

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

### `ems_gas__k__to_coe_per_a`

**Source:** Line 407 (`Rust Code Assignment`)

$$
\mathrm{ems\_gas} = \mathrm{cnsmp\_gas} \cdot \mathrm{emission}
$$

**Raw Code Expression:**
```rust
ems_gas__k__to_coe_per_a = cnsmp_gas__G__W_h_per_a * emission__kg_coe_per_m3;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch:
  LHS [ems_gas__k__to_coe_per_a] dimensions: {'mass': 1, 'co2_equivalent': 1, 'time_a': -1}
  RHS evaluates to dimensions: {'power': 1, 'time_h': 1, 'time_a': -1, 'mass': 1, 'co2_equivalent': 1, 'volume': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `ems_gas__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cnsmp_gas__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `emission__kg_coe_per_m3` | Input / Variable | `kg_coe_per_m3` | $\text{kg }\text{CO}_2\text{e}/\text{m}^3$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |

---

## Energy & Renewables Sector

**Source File:** [`src/energy/calculate.rs`](../src/energy/calculate.rs)

*Rooftop photovoltaics (PV), open-space ground-mounted solar, onshore wind generation, electricity grid mix procurement, and renewable feed-in.*

### `sol_rf_self_cnsmp__G__W_h_per_a`

**Source:** Line 40 (`Explicit Annotation`)

$$
\mathrm{sol\_rf\_self\_cnsmp} = \mathrm{sol\_rf\_nrg} \cdot \mathrm{sol\_rf\_self\_cnsmp\_part}
$$

**Raw Code Expression:**
```rust
sol_rf_self_cnsmp__G__W_h_per_a = sol_rf_nrg__G__W_h_per_a * sol_rf_self_cnsmp_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_self_cnsmp__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_turnover_buyback__M__eur_per_a`

**Source:** Line 152 (`Explicit Annotation`)

$$
\mathrm{sol\_os\_turnover\_buyback} = \mathrm{sol\_os\_nrg} \cdot \mathrm{buyback\_price}
$$

**Raw Code Expression:**
```rust
sol_os_turnover_buyback__M__eur_per_a = sol_os_nrg__G__W_h_per_a * buyback_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_turnover_buyback__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `buyback_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sol_os_revenue__M__eur_per_a`

**Source:** Line 167 (`Explicit Annotation`)

$$
\mathrm{sol\_os\_revenue} = \mathrm{sol\_os\_turnover\_buyback} - \mathrm{sol\_os\_prod\_costs}
$$

**Raw Code Expression:**
```rust
sol_os_revenue__M__eur_per_a = sol_os_turnover_buyback__M__eur_per_a - sol_os_prod_costs__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_revenue__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_turnover_buyback__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_prod_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `wind_turnover_buyback__M__eur_per_a`

**Source:** Line 232 (`Explicit Annotation`)

$$
\mathrm{wind\_turnover\_buyback} = \mathrm{wind\_nrg} \cdot \mathrm{buyback\_price}
$$

**Raw Code Expression:**
```rust
wind_turnover_buyback__M__eur_per_a = wind_nrg__G__W_h_per_a * buyback_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_turnover_buyback__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `buyback_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `wind_revenue__M__eur_per_a`

**Source:** Line 239 (`Explicit Annotation`)

$$
\mathrm{wind\_revenue} = \mathrm{wind\_turnover\_buyback} - \mathrm{wind\_om}
$$

**Raw Code Expression:**
```rust
wind_revenue__M__eur_per_a = wind_turnover_buyback__M__eur_per_a - wind_om__M__eur_per_a;
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

**Source:** Line 256 (`Explicit Annotation`)

$$
\mathrm{prchsd\_renewable\_nrg} = \mathrm{prchsd\_renewable\_nrg} \cdot \mathrm{renewable\_nrg\_price}
$$

**Raw Code Expression:**
```rust
prchsd_renewable_nrg__M__eur_per_a = prchsd_renewable_nrg__G__W_h_per_a * renewable_nrg_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_renewable_nrg__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_renewable_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `renewable_nrg_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `prchsd_nrg_mix_costs__M__eur_per_a`

**Source:** Line 310 (`Explicit Annotation`)

$$
\mathrm{prchsd\_nrg\_mix\_costs} = \mathrm{prchsd\_nrg\_mix} \cdot \mathrm{nrg\_mix\_price}
$$

**Raw Code Expression:**
```rust
prchsd_nrg_mix_costs__M__eur_per_a = prchsd_nrg_mix__G__W_h_per_a * nrg_mix_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_nrg_mix_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `prchsd_nrg_mix__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sol_rf_costs__eur_per_kWh`

**Source:** Line 334 (`Explicit Annotation`)

$$
\mathrm{sol\_rf\_costs} = \frac{\mathrm{sol\_rf\_costs}}{\mathrm{sol\_rf\_self\_cnsmp}}
$$

**Raw Code Expression:**
```rust
sol_rf_costs__eur_per_kWh = sol_rf_costs__M__eur_per_a / sol_rf_self_cnsmp__G__W_h_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_costs__eur_per_kWh` | **LHS (Result)** | `eur_per_kWh` | $\text{€}/\text{kWh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |
| `sol_rf_costs__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `sol_rf_potential__M__Wp`

**Source:** Line 17 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_potential} = \mathrm{rf\_A} \cdot \mathrm{sol\_rf\_suitable\_A\_part} \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_potential__M__Wp = rf_A__ha * sol_rf_suitable_A_part * solar_roof.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='power_per_area__k__Wp_per_m2', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_potential__M__Wp` | **LHS (Result)** | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `rf_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `sol_rf_suitable_A_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_nrg__G__W_h_per_a`

**Source:** Line 33 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_nrg} = \mathrm{sol\_rf\_installed} \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_nrg__G__W_h_per_a = sol_rf_installed__M__Wp * solar_roof.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='Wp_to_W_h_per_a', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_installed__M__Wp_prev_year`

**Source:** Line 50 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_installed} = \mathrm{sol\_rf\_installed}
$$

**Raw Code Expression:**
```rust
sol_rf_installed__M__Wp_prev_year = sol_rf_installed__M__Wp;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_installed__M__Wp_prev_year` | **LHS (Result)** | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_rf_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `sol_rf_invest__M__eur_per_a`

**Source:** Line 54 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_invest} = \left(\mathrm{sol\_rf\_installed} - \mathrm{sol\_rf\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_invest__M__eur_per_a = (sol_rf_installed__M__Wp_this_year - sol_rf_installed__M__Wp_prev_year) * solar_roof.invest__m__eur_per_Wp * sol_rf_installed__M__Wp_this_year .is_greater(sol_rf_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='invest__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_rf_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_grant__M__eur_per_a`

**Source:** Line 64 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_grant} = \left(\mathrm{sol\_rf\_installed} - \mathrm{sol\_rf\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_grant__M__eur_per_a = (sol_rf_installed__M__Wp_this_year - sol_rf_installed__M__Wp_prev_year) * solar_roof.grant__m__eur_per_Wp * sol_rf_installed__M__Wp_this_year .is_greater(sol_rf_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='grant__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_rf_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_om__M__eur_per_a_last_year`

**Source:** Line 73 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_om} = \mathrm{sol\_rf\_om}
$$

**Raw Code Expression:**
```rust
sol_rf_om__M__eur_per_a_last_year = sol_rf_om__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_om__M__eur_per_a_last_year` | **LHS (Result)** | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_om__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `sol_rf_om__M__eur_per_a`

**Source:** Line 75 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_om} = \mathrm{sol\_rf\_om} + \mathrm{sol\_rf\_invest} \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_om__M__eur_per_a = sol_rf_om__M__eur_per_a_last_year + (sol_rf_invest__M__eur_per_a * solar_roof.operation_costs);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='operation_costs', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_om__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_om__M__eur_per_a_last_year` | Input / Variable | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_rf_revenue__M__eur_per_a`

**Source:** Line 83 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_revenue} = \left(\mathrm{sol\_rf\_nrg} - \mathrm{sol\_rf\_self\_cnsmp}\right) \cdot None
$$

**Raw Code Expression:**
```rust
sol_rf_revenue__M__eur_per_a = (sol_rf_nrg__G__W_h_per_a - sol_rf_self_cnsmp__G__W_h_per_a) * solar_roof.buyback_price__m__eur_per_W_h;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='buyback_price__m__eur_per_W_h', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_revenue__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_installed__M__Wp`

**Source:** Line 95 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_installed} = 10^{-1} \cdot \mathrm{sol\_os\_installed\_A} \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_installed__M__Wp = 1e-1 * sol_os_installed_A__ha * solar_landscape.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='power_per_area__k__Wp_per_m2', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_installed__M__Wp` | **LHS (Result)** | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_nrg__G__W_h_per_a`

**Source:** Line 103 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_nrg} = 10^{-3} \cdot \mathrm{sol\_os\_installed} \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_nrg__G__W_h_per_a = 1e-3 * sol_os_installed__M__Wp * solar_landscape.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='Wp_to_W_h_per_a', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_self_cnsmp__G__W_h_per_a`

**Source:** Line 110 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_self\_cnsmp} = \mathrm{sol\_os\_nrg} \cdot \mathrm{sol\_os\_self\_cnsmp\_part}
$$

**Raw Code Expression:**
```rust
sol_os_self_cnsmp__G__W_h_per_a = sol_os_nrg__G__W_h_per_a * sol_os_self_cnsmp_part;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_self_cnsmp__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `sol_os_self_cnsmp_part` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_installed__M__Wp_prev_year`

**Source:** Line 119 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_installed} = \mathrm{sol\_os\_installed}
$$

**Raw Code Expression:**
```rust
sol_os_installed__M__Wp_prev_year = sol_os_installed__M__Wp;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_installed__M__Wp_prev_year` | **LHS (Result)** | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed__M__Wp` | Input / Variable | `M__Wp` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `sol_os_invest__M__eur_per_a`

**Source:** Line 123 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_invest} = \left(\mathrm{sol\_os\_installed} - \mathrm{sol\_os\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_invest__M__eur_per_a = (sol_os_installed__M__Wp_this_year - sol_os_installed__M__Wp_prev_year) * solar_landscape.invest__m__eur_per_Wp * sol_os_installed__M__Wp_this_year .is_greater(sol_os_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='invest__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_grant__M__eur_per_a`

**Source:** Line 133 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_grant} = \left(\mathrm{sol\_os\_installed} - \mathrm{sol\_os\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_grant__M__eur_per_a = (sol_os_installed__M__Wp_this_year - sol_os_installed__M__Wp_prev_year) * solar_landscape.grant__m__eur_per_Wp * sol_os_installed__M__Wp_this_year .is_greater(sol_os_installed__M__Wp_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='grant__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_installed__M__Wp_prev_year` | Input / Variable | `M__Wp_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `sol_os_installed__M__Wp_this_year` | Input / Variable | `M__Wp_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_om__M__eur_per_a_last_year`

**Source:** Line 142 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_om} = \mathrm{sol\_os\_om}
$$

**Raw Code Expression:**
```rust
sol_os_om__M__eur_per_a_last_year = sol_os_om__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_om__M__eur_per_a_last_year` | **LHS (Result)** | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_om__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `sol_os_om__M__eur_per_a`

**Source:** Line 144 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_om} = \mathrm{sol\_os\_om} + \mathrm{sol\_os\_invest} \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_om__M__eur_per_a = sol_os_om__M__eur_per_a_last_year + (sol_os_invest__M__eur_per_a * solar_landscape.operation_costs);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='operation_costs', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_om__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_om__M__eur_per_a_last_year` | Input / Variable | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_invest__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `sol_os_prod_costs__M__eur_per_a`

**Source:** Line 160 (`Rust Code Assignment`)

$$
\mathrm{sol\_os\_prod\_costs} = \mathrm{sol\_os\_nrg} \cdot None
$$

**Raw Code Expression:**
```rust
sol_os_prod_costs__M__eur_per_a = sol_os_nrg__G__W_h_per_a * solar_landscape.costs;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_landscape', ctx=Load()), attr='costs', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_os_prod_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_os_nrg__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_landscape` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_installed__M__WP`

**Source:** Line 186 (`Rust Code Assignment`)

$$
\mathrm{wind\_installed} = 10 \cdot \mathrm{wind\_installed\_A} \cdot None
$$

**Raw Code Expression:**
```rust
wind_installed__M__WP = 1e1 * wind_installed_A__ha * wind_onshore.power_per_area__k__Wp_per_m2;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='wind_onshore', ctx=Load()), attr='power_per_area__k__Wp_per_m2', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_installed__M__WP` | **LHS (Result)** | `M__WP` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_installed_A__ha` | Input / Variable | `ha` | $\text{ha}$ | Area |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_nrg__G__W_h_per_a`

**Source:** Line 193 (`Rust Code Assignment`)

$$
\mathrm{wind\_nrg} = 10^{-3} \cdot \mathrm{wind\_installed} \cdot None
$$

**Raw Code Expression:**
```rust
wind_nrg__G__W_h_per_a = 1e-3 * wind_installed__M__WP * wind_onshore.Wp_to_W_h_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='wind_onshore', ctx=Load()), attr='Wp_to_W_h_per_a', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_nrg__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `wind_installed__M__WP` | Input / Variable | `M__WP` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `wind_installed__M__WP_prev_year`

**Source:** Line 202 (`Rust Code Assignment`)

$$
\mathrm{wind\_installed} = \mathrm{wind\_installed}
$$

**Raw Code Expression:**
```rust
wind_installed__M__WP_prev_year = wind_installed__M__WP;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_installed__M__WP_prev_year` | **LHS (Result)** | `M__WP_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_installed__M__WP` | Input / Variable | `M__WP` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `wind_invest__M__eur_per_a`

**Source:** Line 205 (`Rust Code Assignment`)

$$
\mathrm{wind\_invest} = 10^{-3} \cdot \left(\mathrm{wind\_installed} - \mathrm{wind\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
wind_invest__M__eur_per_a = 1e-3 * (wind_installed__M__WP_this_year - wind_installed__M__WP_prev_year) * wind_onshore.invest__m__eur_per_Wp * wind_installed__M__WP_this_year .is_greater(wind_installed__M__WP_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='wind_onshore', ctx=Load()), attr='invest__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_invest__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_installed__M__WP_prev_year` | Input / Variable | `M__WP_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `wind_installed__M__WP_this_year` | Input / Variable | `M__WP_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `wind_grant__M__eur_per_a`

**Source:** Line 214 (`Rust Code Assignment`)

$$
\mathrm{wind\_grant} = 10^{-3} \cdot \left(\mathrm{wind\_installed} - \mathrm{wind\_installed}\right) \cdot None \cdot None
$$

**Raw Code Expression:**
```rust
wind_grant__M__eur_per_a = 1e-3 * (wind_installed__M__WP_this_year - wind_installed__M__WP_prev_year) * wind_onshore.grant__m__eur_per_Wp * wind_installed__M__WP_this_year .is_greater(wind_installed__M__WP_prev_year);
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='wind_onshore', ctx=Load()), attr='grant__m__eur_per_Wp', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_grant__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_installed__M__WP_prev_year` | Input / Variable | `M__WP_prev_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |
| `wind_onshore` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `wind_installed__M__WP_this_year` | Input / Variable | `M__WP_this_year` | $\text{MW}_{\text{peak}}$ | Peak Power (PV / Wind) |

---

### `wind_om__M__eur_per_a_last_year`

**Source:** Line 223 (`Rust Code Assignment`)

$$
\mathrm{wind\_om} = \mathrm{wind\_om}
$$

**Raw Code Expression:**
```rust
wind_om__M__eur_per_a_last_year = wind_om__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `wind_om__M__eur_per_a_last_year` | **LHS (Result)** | `M__eur_per_a_last_year` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `wind_om__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `elec_nrg_dmd__G__W_h_per_a`

**Source:** Line 277 (`Rust Code Assignment`)

$$
\mathrm{elec\_nrg\_dmd} = \mathrm{electric\_power\_demand\_buildings} + \mathrm{energy\_heating\_heat\_pump} + \mathrm{bev\_electric\_power\_demand}
$$

**Raw Code Expression:**
```rust
elec_nrg_dmd__G__W_h_per_a = electric_power_demand_buildings + energy_heating_heat_pump + bev_electric_power_demand;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch:
  LHS [elec_nrg_dmd__G__W_h_per_a] dimensions: {'power': 1, 'time_h': 1, 'time_a': -1}
  RHS evaluates to dimensions: {}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `elec_nrg_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `bev_electric_power_demand` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `electric_power_demand_buildings` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |
| `energy_heating_heat_pump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `prchsd_nrg_mix__G__W_h_per_a`

**Source:** Line 294 (`Rust Code Assignment`)

$$
\mathrm{prchsd\_nrg\_mix} = \mathrm{elec\_nrg\_dmd} - \mathrm{sol\_rf\_self\_cnsmp} - \mathrm{sol\_os\_self\_cnsmp} - \mathrm{prchsd\_renewable\_nrg}
$$

**Raw Code Expression:**
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

### `sol_rf_costs__M__eur_per_a`

**Source:** Line 326 (`Rust Code Assignment`)

$$
\mathrm{sol\_rf\_costs} = \mathrm{sol\_rf\_self\_cnsmp} \cdot None - \mathrm{sol\_rf\_revenue}
$$

**Raw Code Expression:**
```rust
sol_rf_costs__M__eur_per_a = sol_rf_self_cnsmp__G__W_h_per_a * solar_roof.buyback_price__m__eur_per_W_h - sol_rf_revenue__M__eur_per_a;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Unsupported expression element: Attribute(value=Name(id='solar_roof', ctx=Load()), attr='buyback_price__m__eur_per_W_h', ctx=Load())

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sol_rf_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_revenue__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `solar_roof` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `nrg_own_mix_price__m__eur_per_W_h`

**Source:** Line 363 (`Rust Code Assignment`)

$$
\mathrm{nrg\_own\_mix\_price} = \frac{\mathrm{total\_nrg\_costs}}{\mathrm{total\_nrg\_volume}}
$$

**Raw Code Expression:**
```rust
nrg_own_mix_price__m__eur_per_W_h = total_nrg_costs__M__eur_per_a / total_nrg_volume__G__W_h_per_a;
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

**Source:** Line 387 (`Rust Code Assignment`)

$$
\mathrm{prchsd\_nrg\_mix\_ems} = \mathrm{prchsd\_nrg\_mix} \cdot \mathrm{weighted\_average} \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
prchsd_nrg_mix_ems__k__to_coe_per_a = prchsd_nrg_mix__G__W_h_per_a * weighted_average * 1e-3;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch:
  LHS [prchsd_nrg_mix_ems__k__to_coe_per_a] dimensions: {'mass': 1, 'co2_equivalent': 1, 'time_a': -1}
  RHS evaluates to dimensions: {'power': 1, 'time_h': 1, 'time_a': -1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `prchsd_nrg_mix_ems__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `prchsd_nrg_mix__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `weighted_average` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

## Mobility Sector

**Source File:** [`src/mobility/calculate.rs`](../src/mobility/calculate.rs)

*Vehicle fleet mileage, battery electric vehicle (BEV) power demand, combustion fuel consumption, street lighting infrastructure, and tailpipe emissions.*

### `traveld_dist_car__M__m_per_a`

**Source:** Line 28 (`Explicit Annotation`)

$$
\mathrm{traveld\_dist\_car} = \mathrm{car\_mileage\_per\_vehicle}
$$

**Raw Code Expression:**
```rust
traveld_dist_car__M__m_per_a = car_mileage_per_vehicle__k__km_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `traveld_dist_car__M__m_per_a` | **LHS (Result)** | `M__m_per_a` | $10^6\text{ m}/\text{a}$ | Length, 1 / Time (annual) |
| `car_mileage_per_vehicle__k__km_per_a` | Input / Variable | `k__km_per_a` | $10^3\text{ km}/\text{a}$ | Length, 1 / Time (annual) |

---

### `cars_grant__M__eur_per_a`

**Source:** Line 48 (`Explicit Annotation`)

$$
\mathrm{cars\_grant} = \left(\mathrm{n\_bev} - \mathrm{n\_bev}\right) \cdot \mathrm{grant\_per\_car}
$$

**Raw Code Expression:**
```rust
cars_grant__M__eur_per_a = (n_bev__k___this_year - n_bev__k___prev_year) * grant_per_car__k__eur;
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

**Source:** Line 58 (`Explicit Annotation`)

$$
\mathrm{bev\_elec\_nrg\_dmd} = \mathrm{n\_bev} \cdot \mathrm{traveld\_dist\_car} \cdot \mathrm{nrg\_cnsmp} \cdot 10^{-2}
$$

**Raw Code Expression:**
```rust
bev_elec_nrg_dmd__G__W_h_per_a = n_bev__k__ * traveld_dist_car__M__m_per_a * nrg_cnsmp__1em2__W_h_per_m * 1e-2;
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

**Source:** Line 68 (`Explicit Annotation`)

$$
\mathrm{cars\_fuel\_dmd} = \frac{\left(\mathrm{n\_cars} - \mathrm{n\_bev}\right) \cdot \mathrm{traveld\_dist\_car} \cdot \mathrm{nrg\_cnsmp}}{\mathrm{energy\_density}} \cdot 10^{-2}
$$

**Raw Code Expression:**
```rust
cars_fuel_dmd__M__L_per_a = (n_cars__k__ - n_bev__k__) * traveld_dist_car__M__m_per_a * nrg_cnsmp__1em2__W_h_per_m / energy_density__k__W_h_per_L * 1e-2;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_fuel_dmd__M__L_per_a` | **LHS (Result)** | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `energy_density__k__W_h_per_L` | Input / Variable | `k__W_h_per_L` | $10^3\text{ (thousands)}$ | Power, Time (hours), 1 / Volume |
| `nrg_cnsmp__1em2__W_h_per_m` | Input / Variable | `1em2__W_h_per_m` | $\text{m}^2$ | 1 / Length, Power, Time (hours) |
| `traveld_dist_car__M__m_per_a` | Input / Variable | `M__m_per_a` | $10^6\text{ m}/\text{a}$ | Length, 1 / Time (annual) |
| `n_cars__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `n_bev__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |

---

### `cars_fuel_costs__M__eur_per_a`

**Source:** Line 79 (`Explicit Annotation`)

$$
\mathrm{cars\_fuel\_costs} = \mathrm{cars\_fuel\_dmd} \cdot \mathrm{price\_fuel}
$$

**Raw Code Expression:**
```rust
cars_fuel_costs__M__eur_per_a = cars_fuel_dmd__M__L_per_a * price_fuel__eur_per_L;
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

**Source:** Line 93 (`Explicit Annotation`)

$$
\mathrm{sl\_nrg\_dmd} = \mathrm{n\_sl} \cdot \mathrm{nrg\_cnsmp\_per\_sl} \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
sl_nrg_dmd__G__W_h_per_a = n_sl__k__ * nrg_cnsmp_per_sl__k__W_h_per_a * 1e-3;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `sl_nrg_dmd__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `n_sl__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `nrg_cnsmp_per_sl__k__W_h_per_a` | Input / Variable | `k__W_h_per_a` | $\text{kWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |

---

### `bev_nrg_costs__M__eur_per_a`

**Source:** Line 116 (`Explicit Annotation`)

$$
\mathrm{bev\_nrg\_costs} = \mathrm{bev\_elec\_nrg\_dmd} \cdot \mathrm{nrg\_own\_mix\_price}
$$

**Raw Code Expression:**
```rust
bev_nrg_costs__M__eur_per_a = bev_elec_nrg_dmd__G__W_h_per_a * nrg_own_mix_price__m__eur_per_W_h;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `bev_nrg_costs__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `bev_elec_nrg_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_own_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sl_om_costs__M__eur_per_a`

**Source:** Line 136 (`Explicit Annotation`)

$$
\mathrm{sl\_om\_costs} = \mathrm{n\_sl} \cdot \mathrm{om\_costs\_per\_sl} \cdot 10^{-3}
$$

**Raw Code Expression:**
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

**Source:** Line 143 (`Explicit Annotation`)

$$
\mathrm{sl\_total\_costs} = \mathrm{sl\_nrg\_costs} + \mathrm{sl\_om\_costs}
$$

**Raw Code Expression:**
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

**Source:** Line 154 (`Explicit Annotation`)

$$
\mathrm{cars\_ems} = \mathrm{cars\_fuel\_dmd} \cdot \mathrm{emission}
$$

**Raw Code Expression:**
```rust
cars_ems__k__to_coe_per_a = cars_fuel_dmd__M__L_per_a * emission__kg_coe_per_L;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `cars_ems__k__to_coe_per_a` | **LHS (Result)** | `k__to_coe_per_a` | $\text{kt }\text{CO}_2\text{e}/\text{a}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Time (annual) |
| `cars_fuel_dmd__M__L_per_a` | Input / Variable | `M__L_per_a` | $\text{Mio. L}/\text{a}$ | 1 / Time (annual), Volume |
| `emission__kg_coe_per_L` | Input / Variable | `kg_coe_per_L` | $\text{kg }\text{CO}_2\text{e}/\text{L}$ | Greenhouse Gas Emissions (CO₂e), Mass, 1 / Volume |

---

### `n_bev__k___prev_year`

**Source:** Line 46 (`Rust Code Assignment`)

$$
\mathrm{n\_bev} = \mathrm{n\_bev}
$$

**Raw Code Expression:**
```rust
n_bev__k___prev_year = n_bev__k__;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `n_bev__k___prev_year` | **LHS (Result)** | `k___prev_year` | $10^3\text{ (thousands)}$ | Dimensionless / Count |
| `n_bev__k__` | Input / Variable | `k__` | $10^3\text{ (thousands)}$ | Dimensionless / Count |

---

### `bev_elec_nrg_price__G__W_h_per_a`

**Source:** Line 111 (`Rust Code Assignment`)

$$
\mathrm{bev\_elec\_nrg\_price} = \mathrm{bev\_elec\_nrg\_dmd} \cdot \mathrm{nrg\_own\_mix\_price}
$$

**Raw Code Expression:**
```rust
bev_elec_nrg_price__G__W_h_per_a = bev_elec_nrg_dmd__G__W_h_per_a * nrg_own_mix_price__m__eur_per_W_h;
```

**Verification Status:** ⚠️ **Discrepancy Note**: Dimensional mismatch:
  LHS [bev_elec_nrg_price__G__W_h_per_a] dimensions: {'power': 1, 'time_h': 1, 'time_a': -1}
  RHS evaluates to dimensions: {'time_a': -1, 'currency': 1}

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `bev_elec_nrg_price__G__W_h_per_a` | **LHS (Result)** | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `bev_elec_nrg_dmd__G__W_h_per_a` | Input / Variable | `G__W_h_per_a` | $\text{GWh}/\text{a}$ | Power, 1 / Time (annual), Time (hours) |
| `nrg_own_mix_price__m__eur_per_W_h` | Input / Variable | `m__eur_per_W_h` | $\text{m€}/\text{Wh}$ | Financial Currency (€), 1 / Power, 1 / Time (hours) |

---

### `sl_nrg_costs__M__eur_per_a`

**Source:** Line 128 (`Rust Code Assignment`)

$$
\mathrm{sl\_nrg\_costs} = \mathrm{n\_sl} \cdot \mathrm{nrg\_cnsmp\_per\_sl} \cdot \mathrm{nrg\_own\_mix\_price} \cdot 10^{-3}
$$

**Raw Code Expression:**
```rust
sl_nrg_costs__M__eur_per_a = n_sl__k__ * nrg_cnsmp_per_sl__k__W_h_per_a * nrg_own_mix_price__m__eur_per_W_h * 1e-3;
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

## Macroeconomics Sector

**Source File:** [`src/economy/calculate.rs`](../src/economy/calculate.rs)

*Capital expenditure splits (material vs. labor), local vs. national turnover, full-time equivalent (FTE) jobs, municipal business taxes, and tax revenues.*

### `invest_heating_material__M__eur_per_a`

**Source:** Line 22 (`Explicit Annotation`)

$$
\mathrm{invest\_heating\_material} = \mathrm{invest\_heat\_sources} \cdot \mathrm{heating\_heatpump}
$$

**Raw Code Expression:**
```rust
invest_heating_material__M__eur_per_a = invest_heat_sources__M__eur_per_a * heating_heatpump;
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

**Source:** Line 28 (`Explicit Annotation`)

$$
\mathrm{invest\_heating\_work} = \mathrm{invest\_heat\_sources} \cdot \left(1 - \mathrm{heating\_heatpump}\right)
$$

**Raw Code Expression:**
```rust
invest_heating_work__M__eur_per_a = invest_heat_sources__M__eur_per_a * (1.0 - heating_heatpump);
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

**Source:** Line 34 (`Explicit Annotation`)

$$
\mathrm{turnover\_heating\_crafting\_local} = \mathrm{invest\_heating\_work} \cdot \mathrm{loacal\_value\_add}
$$

**Raw Code Expression:**
```rust
turnover_heating_crafting_local__M__eur_per_a = invest_heating_work__M__eur_per_a * loacal_value_add;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_crafting_local__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `loacal_value_add` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heating_crafting_national__M__eur_per_a`

**Source:** Line 40 (`Explicit Annotation`)

$$
\mathrm{turnover\_heating\_crafting\_national} = \mathrm{invest\_heating\_work} \cdot \mathrm{national\_added\_value}
$$

**Raw Code Expression:**
```rust
turnover_heating_crafting_national__M__eur_per_a = invest_heating_work__M__eur_per_a * national_added_value;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_crafting_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_work__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `national_added_value` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `turnover_heating_production_national__M__eur_per_a`

**Source:** Line 46 (`Explicit Annotation`)

$$
\mathrm{turnover\_heating\_production\_national} = \mathrm{invest\_heating\_material} \cdot \mathrm{heating\_heatpump}
$$

**Raw Code Expression:**
```rust
turnover_heating_production_national__M__eur_per_a = invest_heating_material__M__eur_per_a * heating_heatpump;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `turnover_heating_production_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `invest_heating_material__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `heating_heatpump` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `revenue_local__M__eur_per_a`

**Source:** Line 239 (`Explicit Annotation`)

$$
\mathrm{revenue\_local} = \mathrm{turnover\_local} \cdot \mathrm{revenue\_local\_part}
$$

**Raw Code Expression:**
```rust
revenue_local__M__eur_per_a = turnover_local__M__eur_per_a * revenue_local_part;
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

**Source:** Line 243 (`Explicit Annotation`)

$$
\mathrm{turnover\_national} = \mathrm{invest\_heat\_sources} + \mathrm{invest\_energetic\_renovation} + \mathrm{sol\_rf\_invest} + \mathrm{sol\_os\_invest}
$$

**Raw Code Expression:**
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

**Source:** Line 251 (`Explicit Annotation`)

$$
\mathrm{turnover\_tax\_local} = \mathrm{turnover\_local} \cdot \mathrm{turnover\_tax} \cdot \mathrm{turnover\_tax\_local\_part}
$$

**Raw Code Expression:**
```rust
turnover_tax_local__M__eur_per_a = turnover_local__M__eur_per_a * turnover_tax * turnover_tax_local_part;
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

### `business_tax_local__M__eur_per_a`

**Source:** Line 262 (`Explicit Annotation`)

$$
\mathrm{business\_tax\_local} = \mathrm{turnover\_local} \cdot \mathrm{business\_tax}
$$

**Raw Code Expression:**
```rust
business_tax_local__M__eur_per_a = turnover_local__M__eur_per_a * business_tax;
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

**Source:** Line 267 (`Explicit Annotation`)

$$
\mathrm{business\_tax\_national} = \mathrm{turnover\_national} \cdot \mathrm{business\_tax}
$$

**Raw Code Expression:**
```rust
business_tax_national__M__eur_per_a = turnover_national__M__eur_per_a * business_tax;
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

**Source:** Line 272 (`Explicit Annotation`)

$$
\mathrm{corporate\_tax\_national} = \mathrm{turnover\_national} \cdot \mathrm{corporate\_tax}
$$

**Raw Code Expression:**
```rust
corporate_tax_national__M__eur_per_a = turnover_national__M__eur_per_a * corporate_tax;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `corporate_tax_national__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_national__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `corporate_tax` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

## Stakeholders Sector

**Source File:** [`src/stakeholders/calculate.rs`](../src/stakeholders/calculate.rs)

*Net annual cash flows, financial effects of climate measures, and capital expenditure balances across Private, Industry, and Municipal stakeholders.*

### `private_cash_flow_netto__M__eur_per_a`

**Source:** Line 73 (`Explicit Annotation`)

$$
\mathrm{private\_cash\_flow\_netto} = \mathrm{private\_effect\_of\_measures} + \mathrm{private\_invest}
$$

**Raw Code Expression:**
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

**Source:** Line 78 (`Explicit Annotation`)

$$
\mathrm{industry\_profit\_from\_measures} = \mathrm{turnover\_local} \cdot \mathrm{revenue\_margin}
$$

**Raw Code Expression:**
```rust
industry_profit_from_measures__M__eur_per_a = turnover_local__M__eur_per_a * revenue_margin;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `industry_profit_from_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `turnover_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `revenue_margin` | Parameter / Constant | `none` | $\text{dimensionless}$ | Dimensionless / Count |

---

### `industry_cash_flow_netto__M__eur_per_a`

**Source:** Line 118 (`Explicit Annotation`)

$$
\mathrm{industry\_cash\_flow\_netto} = \mathrm{industry\_profit\_from\_measures} + \mathrm{industry\_invest} + \mathrm{industry\_effect\_of\_measures}
$$

**Raw Code Expression:**
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

### `community_tax_income_from_measures__M__eur_per_a`

**Source:** Line 157 (`Explicit Annotation`)

$$
\mathrm{community\_tax\_income\_from\_measures} = \mathrm{income\_tax\_local} + \mathrm{business\_tax\_local}
$$

**Raw Code Expression:**
```rust
community_tax_income_from_measures__M__eur_per_a = income_tax_local__M__eur_per_a + business_tax_local__M__eur_per_a;
```

**Verification Status:** ✅ **Verified Physical Balance**

#### Variable & Unit Breakdown

| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |
| :--- | :--- | :--- | :--- | :--- |
| `community_tax_income_from_measures__M__eur_per_a` | **LHS (Result)** | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `income_tax_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |
| `business_tax_local__M__eur_per_a` | Input / Variable | `M__eur_per_a` | $\text{M€}/\text{a}$ | Financial Currency (€), 1 / Time (annual) |

---

### `community_cash_flow_netto__M__eur_per_a`

**Source:** Line 163 (`Explicit Annotation`)

$$
\mathrm{community\_cash\_flow\_netto} = \mathrm{community\_tax\_income\_from\_measures} + \mathrm{community\_effect\_of\_measures} + \mathrm{community\_invest}
$$

**Raw Code Expression:**
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

## Summary Statistics

- **Total Equations Extracted:** 87
- **Equations Verified (100% Dimensional & Scale Balance):** 65
- **Verification Pass Rate:** 74.7%
