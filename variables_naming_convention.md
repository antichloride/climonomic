# Variable Naming Convention and Parameter Catalog

This document defines the naming conventions, abbreviation rules, unit formatting, and parameter catalog used across the Climonomic simulation engine (Rust, WebAssembly, TypeScript, and Excel fixtures).

---

## 1. Abbreviations

Abbreviations may be used when a term occurs frequently (at least 3 times across variables) or is standard across engineering, energy systems, and macroeconomics.

| Term | Abbreviation | Meaning / Context |
| :--- | :--- | :--- |
| **area** | `A` | Surface area (e.g., `floor_A`, `rf_A`, `wind_suitable_A`) |
| **battery electric vehicle** | `bev` | Electric vehicles |
| **consumption** | `cnsmp` | Final fuel or energy consumption |
| **demand** | `dmd` | Energy or thermal demand |
| **distance** | `dist` | Travel distance |
| **electricity** | `elec` | Electric power / electricity |
| **emissions** | `ems` | Greenhouse gas emissions |
| **energy** | `nrg` | Energy |
| **heating / heater** | `heat` | Heating systems, heating demand, heat pumps |
| **investment** | `invest` / `inv` | Capital expenditures |
| **local** | `loc` | Municipal / local economy |
| **national** | `nat` | National / federal economy |
| **open space** | `os` | Ground-mounted utility installations (Freifläche, e.g. `sol_os`) |
| **operation and maintenance** | `om` | O&M running costs |
| **portion / share** | `part` | Dimensionless fraction / share ($0.0 \dots 1.0$) |
| **production** | `prod` | Industrial manufacturing / energy production |
| **purchased** | `prchsd` | Procured from external grid / market |
| **rooftop / roof** | `rf` | Building rooftop installations (e.g. `sol_rf`) |
| **solar** | `sol` | Solar photovoltaics (PV) |
| **street light** | `sl` | Public street lighting infrastructure |
| **turnover** | `to` | Economic turnover / revenue (in variable names) |

---

## 2. Unit Encoding Syntax

Physical units and scale multipliers are encoded directly into variable names using double underscores (`__`) as delimiters.

### 2.1 Basic Rules

1. **Unit Delimiter (`__`)**:
   The start of the unit descriptor is indicated by a double underscore:
   - `time__s` $\rightarrow$ seconds ($s$)
   - `floor_A__m2` $\rightarrow$ square meters ($\text{m}^2$)

2. **Compound Units**:
   Multiple multiplied unit factors in the numerator are separated by a single underscore:
   - `power__W_s` $\rightarrow \text{W}\cdot\text{s}$ (watt-seconds)
   - `energy__k__W_h` $\rightarrow \text{kWh}$ (kilowatt-hours)

3. **Quotients / Denominators (`_per_`)**:
   Units appearing in the denominator follow `_per_`:
   - `velocity__m_per_s` $\rightarrow \text{m}/\text{s}$
   - `heat_dmd__k__W_h_per_m2_a` $\rightarrow \text{kWh}/(\text{m}^2\cdot\text{a})$
   - `price_oil__eur_per_L` $\rightarrow \text{EUR}/\text{L}$

4. **Exponents and Powers**:
   Square or cubic dimensions are denoted by an integer directly following the unit symbol:
   - `m2` $\rightarrow \text{m}^2$
   - `m3` $\rightarrow \text{m}^3$
   - `s2` $\rightarrow \text{s}^2$

5. **Multipliers and SI Prefixes (`__<prefix>__<unit>`)**:
   SI prefixes and scale multipliers are placed at the beginning of the unit descriptor between double underscores:
   - `velocity__k__m_per_h` $\rightarrow \text{km}/\text{h}$
   - `costs_total__M__eur` $\rightarrow 10^6\text{ EUR}$ (million euros)
   - `total_heat_dmd__G__W_h_per_a` $\rightarrow \text{GWh}/\text{a}$

6. **Dimensionless Multipliers (`__<prefix>__`)**:
   When a quantity is dimensionless (such as an absolute count) but scaled by an SI prefix:
   - `n_inhabitants__k__` $\rightarrow 10^3\text{ inhabitants}$ (thousands)
   - `n_cars__k__` $\rightarrow 10^3\text{ cars}$ (thousands)
   - `n_sl__k__` $\rightarrow 10^3\text{ street lights}$ (thousands)

### 2.2 Standard SI Multipliers

| Prefix | Factor | Description | Example |
| :--- | :--- | :--- | :--- |
| `m` | $10^{-3}$ | milli | `price__m__eur_per_W_h` ($\text{m€}/\text{Wh} = \text{€}/\text{kWh}$) |
| `c` | $10^{-2}$ | centi | `dist__c__m` ($\text{cm}$) |
| `d` | $10^{-1}$ | deci | `volume__d__m3` ($\text{dm}^3$) |
| `k` | $10^3$ | kilo | `heat_dmd__k__W_h_per_m2_a` ($\text{kWh}/(\text{m}^2\cdot\text{a})$) |
| `M` | $10^6$ | mega | `sol_rf_installed__M__Wp` ($\text{MW}_{\text{peak}}$), `costs__M__eur` ($\text{M€}$) |
| `G` | $10^9$ | giga | `total_heat_dmd__G__W_h_per_a` ($\text{GWh}/\text{a}$) |
| `T` | $10^{12}$ | tera | `energy__T__W_h` ($\text{TWh}$) |

### 2.3 Base Physical Units

| Symbol | Quantity | Notes |
| :--- | :--- | :--- |
| `m` | Meter | Length ($\text{m}$) |
| `m2` | Square meter | Area ($\text{m}^2$) |
| `m3` | Cubic meter | Volume ($\text{m}^3$) |
| `ha` | Hectare | Land area ($1\text{ ha} = 10\,000\text{ m}^2$) |
| `W` | Watt | Power ($\text{W}$) |
| `Wp` | Watt peak | Photovoltaic peak generation capacity ($\text{W}_{\text{peak}}$) |
| `h` | Hour | Time ($3\,600\text{ s}$) |
| `a` | Annum / Year | Operational time period ($8\,760\text{ h}$) |
| `L` | Liter | Volume of liquid fuel ($1\text{ L} = 10^{-3}\text{ m}^3$) |
| `eur` | Euro | Financial amounts (€) |
| `to` | Tonne (metric) | Mass ($1\,000\text{ kg}$) |
| `kg` | Kilogram | Mass ($1\text{ kg}$) |
| `coe` | $\text{CO}_2$ equivalent | Greenhouse gas global warming potential ($\text{CO}_2\text{e}$) |
| `km` | Kilometer | Distance ($1\,000\text{ m}$) |
| `part` | Fraction | Dimensionless portion / share ($0.0 \dots 1.0$) |

---

## 3. ID Hierarchy and Sector Disaggregation

In the calculation engine and WebAssembly API, parameters are accessed via slash-delimited paths:

```text
<domain>/<inputs|results>/<field_name>[/<sector>]
```

### 3.1 Sectors (`SectorsInputs` / `SectorsResult`)

Parameters categorized by sector are disaggregated across four stakeholder groups:

1. `private`: Private households / residential sector (Wohnen)
2. `industry`: Commercial, trade, services, and industrial sector (GHD / Industrie)
3. `schools`: Schools and educational facilities (Schulen & Kitas)
4. `public`: Municipal administration and public buildings (Kommune & Verwaltung)

---

## 4. Parameter Catalog by Domain

### 4.1 Buildings Domain (`buildings`)

#### Inputs (`buildings/inputs/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `n_buildings` | Sectorized | count | Number of buildings |
| `floor_A_building__m2` | Sectorized | $\text{m}^2$ | Average floor area per building |
| `heat_dmd__k__W_h_per_m2_a` | Sectorized | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | Specific space heating demand |
| `n_inhabitants__k__` | Sectorized | $10^3\text{ capita}$ | Inhabitants / occupants in thousands |
| `hot_water_dmd__k__W_h_per_m2_a` | Sectorized | $\text{kWh}/(\text{m}^2\cdot\text{a})$ | Specific domestic hot water demand |
| `elec_dmd_capita__k_W_h_per_a` | Sectorized | $\text{kWh}/(\text{capita}\cdot\text{a})$ | Specific electricity demand per capita |
| `A_heat_oil__k__m2` | Sectorized | $10^3\text{ m}^2$ | Heated floor area: standard oil boiler |
| `A_heat_oil_condensing__k__m2` | Sectorized | $10^3\text{ m}^2$ | Heated floor area: condensing oil boiler |
| `A_heat_gas__k__m2` | Sectorized | $10^3\text{ m}^2$ | Heated floor area: gas boiler |
| `A_heat_district_heating__k__m2`| Sectorized | $10^3\text{ m}^2$ | Heated floor area: district heating (Fernwärme) |
| `A_heat_heat_pump__k__m2` | Sectorized | $10^3\text{ m}^2$ | Heated floor area: heat pump (Wärmepumpe) |
| `price_oil__eur_per_L` | Scalar | $\text{EUR}/\text{L}$ | Heating oil price |
| `price_gas__eur_per_m3` | Scalar | $\text{EUR}/\text{m}^3$ | Natural gas price |
| `price_district_heating__m__eur_per_W_h` | Scalar | $\text{m€}/\text{Wh} = \text{EUR}/\text{kWh}$ | District heating tariff |
| `price_other_output_nrg__m__eur_per_W_h` | Scalar | $\text{m€}/\text{Wh} = \text{EUR}/\text{kWh}$ | Other heat energy source tariff |
| `district_heating_renewable_part` | Scalar | fraction ($0 \dots 1$) | Renewable share in district heating grid |

#### Results (`buildings/results/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `floor_A__k__m2` | Sectorized | $10^3\text{ m}^2$ | Total heated floor area |
| `total_heat_dmd__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Total space heat and hot water demand |
| `elec_dmd__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Household/appliance electricity demand |
| `A_heat_oil__k__m2` | Sectorized | $10^3\text{ m}^2$ | Active floor area with standard oil |
| `A_heat_oil_condensing__k__m2` | Sectorized | $10^3\text{ m}^2$ | Active floor area with condensing oil |
| `A_heat_gas__k__m2` | Sectorized | $10^3\text{ m}^2$ | Active floor area with gas heating |
| `A_heat_heat_pump__k__m2` | Sectorized | $10^3\text{ m}^2$ | Active floor area with heat pumps |
| `A_heat_other__k__m2` | Sectorized | $10^3\text{ m}^2$ | Active floor area with other systems |
| `cnsmp_oil__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Fuel energy consumption: standard oil |
| `cnsmp_oil_condensing__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Fuel energy consumption: condensing oil |
| `cnsmp_gas__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Fuel energy consumption: gas |
| `cnsmp_district_heating__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Thermal energy from district heating |
| `cnsmp_elec_heat_pump__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Electricity consumption of heat pumps |
| `cnsmp_other__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Energy consumption: other heat sources |
| `cnsmp_total_heat__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Total final thermal energy consumed |
| `cnsmp_oil__M__L_per_a` | Sectorized | $10^6\text{ L}/\text{a}$ | Heating oil consumption in million liters |
| `cnsmp_gas__M__m3_per_a` | Sectorized | $10^6\text{ m}^3/\text{a}$ | Natural gas consumption in million cubic meters |
| `cnsmp_gas_district_heating__M__m3_per_a` | Sectorized | $10^6\text{ m}^3/\text{a}$ | Natural gas used for district heating generation |
| `costs_oil__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Fuel expenditure for heating oil |
| `costs_gas__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Fuel expenditure for natural gas |
| `costs_client_district_heating__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Expenditure for district heating |
| `invest_heat_sources__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual investment in heating installations |
| `invest_energetic_renovation__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual investment in building insulation/envelope |
| `invest_total__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Total building investments |
| `grant_heat_sources__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Subsidies/grants received for heating systems |
| `grant_energetic_renovation__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Subsidies/grants received for renovation |
| `grant_total__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Total subsidies received |
| `costs_heat_pump__M__eur` | Sectorized | $\text{M€}/\text{a}$ | Operational electricity costs for heat pumps |
| `costs_other__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Operational costs for other heat sources |
| `costs_total__M__eur` | Sectorized | $\text{M€}/\text{a}$ | Total annual heating operational costs |
| `ems_oil__k__to_coe_per_a` | Sectorized | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | GHG emissions from heating oil |
| `ems_gas__k__to_coe_per_a` | Sectorized | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | GHG emissions from natural gas |

---

### 4.2 Energy Domain (`energy`)

#### Inputs (`energy/inputs/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `rf_A__ha` | Sectorized | $\text{ha}$ | Total rooftop area available |
| `sol_rf_suitable_A_part` | Sectorized | fraction ($0 \dots 1$) | Share of roof area suitable for solar PV |
| `sol_rf_installed__M__Wp` | Sectorized | $\text{MW}_{\text{peak}}$ | Installed rooftop PV capacity |
| `sol_rf_self_cnsmp_part` | Sectorized | fraction ($0 \dots 1$) | Self-consumption share of rooftop PV |
| `sol_os_installed_A__ha` | Sectorized | $\text{ha}$ | Land area installed with open-space PV |
| `sol_os_self_cnsmp_part` | Sectorized | fraction ($0 \dots 1$) | Self-consumption share of open-space PV |
| `wind_suitable_A__ha` | Sectorized | $\text{ha}$ | Land area designated for onshore wind |
| `wind_installed_A__ha` | Sectorized | $\text{ha}$ | Active land area developed with wind turbines |
| `prchsd_renewable_nrg__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Green electricity purchased from dedicated PPAs |
| `renewable_nrg_price__m__eur_per_W_h` | Sectorized | $\text{m€}/\text{Wh} = \text{EUR}/\text{kWh}$ | Purchased green electricity tariff |
| `nrg_mix_price__m__eur_per_W_h` | Sectorized | $\text{m€}/\text{Wh} = \text{EUR}/\text{kWh}$ | Standard public grid electricity tariff |

#### Results (`energy/results/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `sol_rf_potential__M__Wp` | Sectorized | $\text{MW}_{\text{peak}}$ | Maximum technical rooftop PV potential |
| `sol_rf_installed__M__Wp` | Sectorized | $\text{MW}_{\text{peak}}$ | Active installed rooftop PV capacity |
| `sol_rf_nrg__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Total electricity generation: rooftop PV |
| `sol_rf_self_cnsmp_part` | Sectorized | fraction ($0 \dots 1$) | Actual self-consumption fraction |
| `sol_rf_self_cnsmp__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Self-consumed electricity: rooftop PV |
| `sol_rf_invest__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual investment in rooftop PV |
| `sol_rf_grant__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Subsidies/grants received for rooftop PV |
| `sol_rf_om__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual O&M costs: rooftop PV |
| `sol_rf_revenue__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Feed-in tariff revenue: rooftop PV |
| `sol_rf_costs__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Net generation costs: rooftop PV |
| `sol_rf_costs__eur_per_kWh` | Sectorized | $\text{EUR}/\text{kWh}$ | Levelized cost of electricity (LCOE): rooftop PV |
| `sol_os_installed_A__ha` | Sectorized | $\text{ha}$ | Installed open-space PV land area |
| `sol_os_installed__M__Wp` | Sectorized | $\text{MW}_{\text{peak}}$ | Installed open-space PV capacity |
| `sol_os_nrg__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Electricity generation: open-space PV |
| `sol_os_self_cnsmp__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Self-consumed power: open-space PV |
| `sol_os_invest__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual investment: open-space PV |
| `sol_os_grant__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Subsidies/grants: open-space PV |
| `sol_os_om__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual O&M costs: open-space PV |
| `sol_os_turnover_buyback__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Feed-in buyback revenue: open-space PV |
| `sol_os_revenue__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Total revenues: open-space PV |
| `sol_os_prod_costs__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Production costs: open-space PV |
| `sol_os_profit__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Net profit / operator margin: open-space PV |
| `wind_installed__M__WP` | Sectorized | $\text{MW}_{\text{peak}}$ | Installed wind turbine capacity |
| `wind_nrg__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Total electricity generation: wind |
| `wind_invest__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual investment: wind energy |
| `wind_grant__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Subsidies/grants: wind energy |
| `wind_om__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Annual O&M costs: wind energy |
| `wind_turnover_buyback__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Feed-in buyback revenue: wind energy |
| `wind_revenue__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Total revenues: wind energy |
| `prchsd_renewable_nrg__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Green power purchased |
| `prchsd_renewable_nrg_price__eur_per_kWh` | Sectorized | $\text{EUR}/\text{kWh}$ | Effective tariff: purchased green power |
| `prchsd_renewable_nrg__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Total cost: purchased green electricity |
| `elec_nrg_dmd__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Gross electricity demand (appliances + heat pumps + EVs) |
| `prchsd_nrg_mix__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Residual electricity purchased from standard grid mix |
| `prchsd_nrg_mix_price__eur_per_kWh` | Sectorized | $\text{EUR}/\text{kWh}$ | Effective tariff: grid mix power |
| `prchsd_nrg_mix_costs__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Expenditure: residual grid mix electricity |
| `prchsd_nrg_mix_ems__k__to_coe_per_a` | Sectorized | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | GHG emissions from residual grid power |
| `nrg_own_mix_price__m__eur_per_W_h` | Sectorized | $\text{m€}/\text{Wh} = \text{EUR}/\text{kWh}$ | Weighted blended municipal electricity price |
| `feed_in_total__G__W_h_per_a` | Scalar | $\text{GWh}/\text{a}$ | Total renewable electricity fed into public transmission grid |
| `feed_in_ems_avoided__k__to_coe_per_a` | Scalar | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | Avoided national grid emissions via fed-in surplus |

---

### 4.3 Mobility Domain (`mobility`)

#### Inputs (`mobility/inputs/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `n_inhabitants__k__` | Sectorized | $10^3\text{ capita}$ | Inhabitants by sector |
| `n_cars__k__` | Sectorized | $10^3\text{ vehicles}$ | Total vehicle fleet |
| `n_bev__k__` | Sectorized | $10^3\text{ vehicles}$ | Number of battery electric vehicles (BEVs) |
| `car_mileage_per_vehicle__k__km_per_a` | Sectorized | $10^3\text{ km}/(\text{vehicle}\cdot\text{a})$ | Average annual mileage per vehicle |
| `traveld_dist_per_person__m__m_per_a` | Scalar | $10^3\text{ km}/(\text{capita}\cdot\text{a})$ | Total travel distance per resident |
| `mean_persons_per_car` | Scalar | persons / vehicle | Vehicle occupancy rate |
| `modal_split_car` | Scalar | fraction ($0 \dots 1$) | Share of trips taken by passenger car |
| `n_sl__k__` | Scalar | $10^3\text{ units}$ | Number of street lights in thousands |
| `nrg_cnsmp_per_sl__k__W_h_per_a` | Scalar | $\text{kWh}/(\text{light}\cdot\text{a})$ | Specific energy consumption per street light |
| `om_costs_per_sl__eur_per_a` | Scalar | $\text{EUR}/(\text{light}\cdot\text{a})$ | Maintenance cost per street light |
| `price_fuel__eur_per_L` | Scalar | $\text{EUR}/\text{L}$ | Vehicle motor fuel price (petrol/diesel) |

#### Results (`mobility/results/...`)

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `n_cars__k__` | Sectorized | $10^3\text{ vehicles}$ | Active total car fleet |
| `n_bev__k__` | Sectorized | $10^3\text{ vehicles}$ | Active electric car fleet |
| `car_mileage__k__km_per_a` | Sectorized | $10^3\text{ km}/\text{a}$ | Average mileage per vehicle |
| `traveld_dist_car__M__m_per_a` | Sectorized | $10^6\text{ km}/\text{a}$ | Total vehicle-kilometers traveled (VKT) |
| `cars_grant__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | EV purchase subsidies received |
| `bev_elec_nrg_dmd__G__W_h_per_a` | Sectorized | $\text{GWh}/\text{a}$ | Electric energy consumed by BEV fleet |
| `bev_elec_nrg_price__G__W_h_per_a` | Sectorized | $\text{EUR}/\text{kWh}$ | Effective charging electricity price |
| `cars_fuel_dmd__M__L_per_a` | Sectorized | $10^6\text{ L}/\text{a}$ | Combustion vehicle fuel consumption |
| `cars_fuel_costs__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Expenditure on liquid vehicle fuels |
| `bev_nrg_costs__M__eur_per_a` | Sectorized | $\text{M€}/\text{a}$ | Expenditure on electric charging power |
| `cars_ems__k__to_coe_per_a` | Sectorized | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | GHG emissions from vehicle fuel combustion |
| `sl_nrg_dmd__G__W_h_per_a` | Scalar | $\text{GWh}/\text{a}$ | Street lighting electricity consumption |
| `sl_nrg_costs__M__eur_per_a` | Scalar | $\text{M€}/\text{a}$ | Electricity expenditure for street lighting |
| `sl_om_costs__M__eur_per_a` | Scalar | $\text{M€}/\text{a}$ | Maintenance costs for street lighting |
| `sl_total_costs__M__eur_per_a` | Scalar | $\text{M€}/\text{a}$ | Total operational cost of street lighting |

---

### 4.4 Economy Domain (`economy`)

All economy metrics are computed on a municipal macro scale (`economy/results/...`) as single trajectories.

#### Investments and Turnover Breakdown

| Variable Name | Unit | Description |
| :--- | :--- | :--- |
| `invest_heating_material` | $\text{M€}/\text{a}$ | Material expenditures: heating replacements |
| `invest_heating_work` | $\text{M€}/\text{a}$ | Labor & installation expenditures: heating replacements |
| `turnover_heating_crafting_local` | $\text{M€}/\text{a}$ | Local craftsman turnover: heating installations |
| `turnover_heating_crafting_national` | $\text{M€}/\text{a}$ | National craftsman turnover: heating installations |
| `turnover_heating_production_national` | $\text{M€}/\text{a}$ | National industrial manufacturing turnover: heat pumps |
| `invest_heat_demand_material` | $\text{M€}/\text{a}$ | Material expenditures: building insulation |
| `invest_heat_demand_work` | $\text{M€}/\text{a}$ | Labor & installation expenditures: building insulation |
| `turnover_heat_demand_crafting_local` | $\text{M€}/\text{a}$ | Local craftsman turnover: insulation / envelope |
| `turnover_heat_demand_crafting_national` | $\text{M€}/\text{a}$ | National craftsman turnover: insulation / envelope |
| `turnover_heat_demand_production_national` | $\text{M€}/\text{a}$ | National manufacturing turnover: insulation materials |
| `invest_solar_roof_material` | $\text{M€}/\text{a}$ | Material expenditures: rooftop PV |
| `invest_solar_roof_work` | $\text{M€}/\text{a}$ | Labor & installation expenditures: rooftop PV |
| `maintenance_solar_roof_work` | $\text{M€}/\text{a}$ | Ongoing maintenance labor: rooftop PV |
| `turnover_solar_roof_crafting_local` | $\text{M€}/\text{a}$ | Local craftsman turnover: rooftop PV O&M |
| `turnover_solar_roof_crafting_national` | $\text{M€}/\text{a}$ | National craftsman turnover: rooftop PV O&M |
| `turnover_solar_roof_production_national` | $\text{M€}/\text{a}$ | National manufacturing turnover: rooftop PV hardware |
| `invest_solar_landscape_material` | $\text{M€}/\text{a}$ | Material expenditures: open-space PV |
| `invest_solar_landscape_work` | $\text{M€}/\text{a}$ | Labor & installation expenditures: open-space PV |
| `maintenance_solar_landscape_work` | $\text{M€}/\text{a}$ | Ongoing maintenance labor: open-space PV |
| `turnover_solar_landscape_crafting_local` | $\text{M€}/\text{a}$ | Local craftsman turnover: open-space PV O&M |
| `turnover_solar_landscape_crafting_national` | $\text{M€}/\text{a}$ | National craftsman turnover: open-space PV O&M |
| `turnover_solar_landscape_production_national`| $\text{M€}/\text{a}$ | National manufacturing turnover: open-space PV hardware |

#### Employment and Full-Time Equivalent (FTE) Jobs

| Variable Name | Unit | Description |
| :--- | :--- | :--- |
| `n_jobs_crafting_local` | FTE | Full-time equivalent jobs created locally in trades/crafting |
| `n_jobs_crafting_national` | FTE | Full-time equivalent jobs created nationally in trades/crafting |
| `n_jobs_production_national` | FTE | Full-time equivalent jobs created nationally in equipment manufacturing |
| `n_jobs_production_sum_national` | FTE | Sum of national crafting and production jobs |

#### Aggregate Turnover, Income, and Fiscal Taxes

| Variable Name | Unit | Description |
| :--- | :--- | :--- |
| `income_local` | $\text{M€}/\text{a}$ | Gross labor income generated locally |
| `income_national` | $\text{M€}/\text{a}$ | Gross labor income generated nationally |
| `income_tax_local` | $\text{M€}/\text{a}$ | Municipal share of wage income tax (Einkommensteuer-Gemeindeanteil) |
| `income_tax_national` | $\text{M€}/\text{a}$ | Total wage income tax yield |
| `turnover_local` | $\text{M€}/\text{a}$ | Total value-added turnover stimulated in the local economy |
| `revenue_local` | $\text{M€}/\text{a}$ | Local corporate profit margins |
| `turnover_national` | $\text{M€}/\text{a}$ | Total economic turnover stimulated across the nation |
| `turnover_tax_local` | $\text{M€}/\text{a}$ | Municipal share of value-added tax (Umsatzsteuer-Gemeindeanteil) |
| `turnover_tax_national` | $\text{M€}/\text{a}$ | Total national VAT yield (Umsatzsteuer) |
| `business_tax_local` | $\text{M€}/\text{a}$ | Local municipal business tax yield (Gewerbesteuer) |
| `business_tax_national` | $\text{M€}/\text{a}$ | National business tax levy |
| `corporate_tax_national` | $\text{M€}/\text{a}$ | National corporate income tax yield (Körperschaftsteuer) |
| `energy_tax_oil` | $\text{EUR}/\text{L}$ | Statutory energy tax rate on heating oil |
| `energy_tax_gas` | $\text{EUR}/\text{kWh}$ | Statutory energy tax rate on natural gas |
| `energy_tax_fuel` | $\text{EUR}/\text{L}$ | Statutory energy tax rate on vehicle motor fuels |
| `energy_tax_national` | $\text{M€}/\text{a}$ | Change in federal energy tax revenue vs. start year baseline |

---

### 4.5 Stakeholders Domain (`stakeholders`)

The stakeholders domain models net economic cash flows across the four core civic entities (`stakeholders/results/...`).

| Variable Name | Unit | Description |
| :--- | :--- | :--- |
| `private_invest` | $\text{M€}/\text{a}$ | Net private outlays (investments minus subsidies received) |
| `private_effect_of_measures` | $\text{M€}/\text{a}$ | Operational savings vs. baseline (energy bill reductions) |
| `private_cash_flow_netto` | $\text{M€}/\text{a}$ | Net annual cash flow balance for private households |
| `industry_invest` | $\text{M€}/\text{a}$ | Net commercial outlays (investments minus subsidies received) |
| `industry_effect_of_measures` | $\text{M€}/\text{a}$ | Operational savings vs. baseline (energy bill reductions) |
| `industry_profit_from_measures` | $\text{M€}/\text{a}$ | Net corporate profits stimulated by local transformation turnover |
| `industry_cash_flow_netto` | $\text{M€}/\text{a}$ | Net annual cash flow balance for commercial/industry |
| `community_invest` | $\text{M€}/\text{a}$ | Net municipal budget outlays for public buildings & facilities |
| `community_effect_of_measures` | $\text{M€}/\text{a}$ | Municipal utility operational savings (heating, power, lighting) |
| `community_tax_income_from_measures` | $\text{M€}/\text{a}$ | Additional local tax revenues (trade tax, local income tax) |
| `community_cash_flow_netto` | $\text{M€}/\text{a}$ | Net annual fiscal cash flow for the municipality |
| `federal_additional_expenses` | $\text{M€}/\text{a}$ | Federal outlays: national subsidy disbursements for heat pumps, renovation, PV, and EVs |
| `federal_additional_tax_income` | $\text{M€}/\text{a}$ | Additional federal tax inflows (VAT, corporate tax, income tax, energy tax diff) |
| `federal_cash_flow_netto` | $\text{M€}/\text{a}$ | Net fiscal balance for the federal government / state level |

---

### 4.6 Emissions Domain (`emissions`)

Emissions summarize total community greenhouse gas emissions and net municipal balance (`emissions/results/...`).

| Variable Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `ems_total__k__to_coe_per_a` | Sectorized | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | Gross greenhouse gas emissions from buildings, grid power, and mobility |
| `net_co2_balance__k__to_coe_per_a` | Scalar | $10^3\text{ t }\text{CO}_2\text{e}/\text{a}$ | Net emissions balance after crediting feed-in displacement of national grid power |

---

## 5. Supported Compatibility Aliases

To ensure backwards compatibility with Excel naming conventions and legacy frontend integrations, `Calculator::get_results_by_id` accepts the following aliases:

| Engine Result ID | Accepted Legacy Alias | Domain |
| :--- | :--- | :--- |
| `economy/results/turnover_local` | `turnover_local_with_materials` | Economy |
| `economy/results/business_tax_local` | `trade_tax_local` | Economy |
| `economy/results/business_tax_national` | `trade_tax_national` | Economy |
| `stakeholders/results/industry_profit_from_measures` | `industry_profit` | Stakeholders |
| `buildings/results/costs_other__M__eur_per_a` | `costs_other__M__eur` | Buildings |
| `buildings/results/costs_total__M__eur` | `costs_total_heating__M__eur` | Buildings |
