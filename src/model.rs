use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SectorMetric {
    pub savings__M__eur_per_a: f64,
    pub invest__M__eur: f64,
    #[serde(default)]
    pub roi: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SummaryDashboard {
    pub private_households: SectorMetric,
    pub industry: SectorMetric,
    pub public_administration: SectorMetric,
    pub subtotal_private_industry_public: SectorMetric,
    pub municipal_utility: SectorMetric,
    pub subtotal_with_utility: SectorMetric,
    pub renewable_project_development: SectorMetric,
    pub total: SectorMetric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeasureMetric {
    pub savings__M__eur_per_a: f64,
    pub invest__M__eur: f64,
    #[serde(default)]
    pub roi: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivateSectorTotal {
    pub savings__M__eur_per_a: f64,
    pub invest__M__eur: f64,
    pub roi: f64,
    pub per_inhabitant_savings__eur_per_a: f64,
    pub per_inhabitant_invest__eur: f64,
    pub per_household_savings__eur_per_a: f64,
    pub per_household_invest__eur: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivateSectorResults {
    pub ev_measures: MeasureMetric,
    pub heating_measures: MeasureMetric,
    pub pv_roof_measures: MeasureMetric,
    pub dynamic_tariffs_savings__M__eur_per_a: f64,
    pub grid_expansion_cost__M__eur_per_a: f64,
    pub grid_battery_savings__M__eur_per_a: f64,
    pub trading_savings__M__eur_per_a: f64,
    pub total: PrivateSectorTotal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndustrySectorResults {
    pub ev_measures: MeasureMetric,
    pub heating_measures: MeasureMetric,
    pub pv_roof_measures: MeasureMetric,
    pub dynamic_tariffs_savings__M__eur_per_a: f64,
    pub grid_expansion_cost__M__eur_per_a: f64,
    pub grid_battery_savings__M__eur_per_a: f64,
    pub trading_savings__M__eur_per_a: f64,
    pub total: MeasureMetric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicSectorResults {
    pub street_lighting: MeasureMetric,
    pub vehicle_fleet: MeasureMetric,
    pub heating_measures: MeasureMetric,
    pub pv_roof: MeasureMetric,
    pub concessions__M__eur_per_a: f64,
    pub additional_taxes__M__eur_per_a: f64,
    pub total: MeasureMetric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetailedSectorResults {
    pub private: PrivateSectorResults,
    pub industry: IndustrySectorResults,
    pub public: PublicSectorResults,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtilityItem {
    pub effects__M__eur_per_a: f64,
    pub invest__M__eur: f64,
    #[serde(default)]
    pub roi: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtilityMeasuresResults {
    pub district_heating_expansion: UtilityItem,
    pub electricity_retail: UtilityItem,
    pub grid_expansion: UtilityItem,
    pub grid_battery: UtilityItem,
    pub own_generation: UtilityItem,
    pub total_with_gas: UtilityItem,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YearPair {
    #[serde(rename = "2024")]
    pub y2024: f64,
    #[serde(rename = "2040")]
    pub y2040: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DemandYearPair {
    #[serde(rename = "2024")]
    pub y2024: f64,
    #[serde(rename = "2040")]
    pub y2040: f64,
    pub growth_factor: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElectricityBalanceResults {
    pub building_base_demand__GWh_per_a: YearPair,
    pub heat_pumps_demand__GWh_per_a: YearPair,
    pub electric_vehicles_demand__GWh_per_a: YearPair,
    pub total_electricity_demand__GWh_per_a: DemandYearPair,
    pub pv_roof_generation__GWh_per_a: YearPair,
    pub pv_ground_generation__GWh_per_a: YearPair,
    pub wind_generation__GWh_per_a: YearPair,
    pub biomass_generation__GWh_per_a: YearPair,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeakLoadsResults {
    pub unmitigated_peak__MW: YearPair,
    pub smoothed_peak_2040__MW: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacroeconomicResults {
    pub total_jobs: f64,
    pub invest_jobs: f64,
    pub maintenance_jobs: f64,
    pub operational_jobs: f64,
    pub local_turnover__M__eur_per_a: f64,
    pub municipal_taxes__M__eur_per_a: f64,
    pub trade_tax__M__eur_per_a: f64,
    pub sales_tax__M__eur_per_a: f64,
    pub income_tax__M__eur_per_a: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationOutputs {
    pub summary_dashboard: SummaryDashboard,
    pub sector_results: DetailedSectorResults,
    pub utility_measures: UtilityMeasuresResults,
    pub electricity_balance: ElectricityBalanceResults,
    pub peak_loads: PeakLoadsResults,
    pub macroeconomics: MacroeconomicResults,
}

pub type WebfassungOutputs = CalculationOutputs;

/// Reference baseline constants from the Excel evaluation model
const REF_PRIV_POP: f64 = 11238.0;
const REF_IND_POP: f64 = 6173.766898203593;
const REF_PUB_POP: f64 = 234.0061149700599;

const REF_PRIV_CARS: f64 = 5870.115161641581;
const REF_PRIV_BEV: f64 = 196.5038204318084;
const REF_IND_CARS: f64 = 731.7722746752287;
const REF_IND_BEV: f64 = 24.496290737087424;

const REF_PRIV_HEAT_DMD: f64 = 66316.62909341317;
const REF_IND_HEAT_DMD: f64 = 19978.096474135666;
const REF_PUB_HEAT_DMD: f64 = 432.1756656666878;

const REF_PRIV_PV_ROOF: f64 = 3837.27028864184;
const REF_IND_PV_ROOF: f64 = 5347.193720401031;
const REF_PUB_PV_ROOF: f64 = 281.43124844215953;

fn is_measure_active(measures: &serde_json::Value, sector: &str, key: &str) -> bool {
    if !measures.is_object() || measures.as_object().map_or(true, |o| o.is_empty()) {
        return true;
    }
    if let Some(active) = measures.get(sector).and_then(|s| s.get(key)).and_then(|k| k.get("active")).and_then(|a| a.as_bool()) {
        return active;
    }
    if let Some(active) = measures.get(key).and_then(|k| k.get("enabled")).and_then(|a| a.as_bool()) {
        return active;
    }
    true
}

/// Computes the municipal transition simulation model across all 3 sectors
pub fn run_calculation(
    inputs: &serde_json::Value,
    measures: &serde_json::Value,
) -> CalculationOutputs {
    // 1. Demographics & Building baseline
    let priv_pop = inputs["buildings"]["n_inhabitants__k__"]["private"]
        .as_f64()
        .unwrap_or(REF_PRIV_POP);
    let priv_hh = inputs["buildings"]["n_households__k__"]["private"]
        .as_f64()
        .unwrap_or(5517.790706586827);
    let ind_pop = inputs["buildings"]["n_inhabitants__k__"]["industry"]
        .as_f64()
        .unwrap_or(REF_IND_POP);
    let pub_pop = inputs["buildings"]["n_inhabitants__k__"]["public"]
        .as_f64()
        .unwrap_or(REF_PUB_POP);

    let pop_scale = priv_pop / REF_PRIV_POP;
    let ind_pop_scale = ind_pop / REF_IND_POP;
    let pub_pop_scale = pub_pop / REF_PUB_POP;

    // 2. Private EV
    let priv_cars = inputs["mobility"]["n_cars__k__"]["private"]
        .as_f64()
        .unwrap_or(REF_PRIV_CARS);
    let priv_bev = inputs["mobility"]["n_bev__k__"]["private"]
        .as_f64()
        .unwrap_or(REF_PRIV_BEV);
    let priv_converted_cars = (priv_cars - priv_bev) * 1000.0;
    let priv_ev_saving_per_car = 382.58619986664598;
    let priv_ev_invest_per_car = 2353.0 + 550.0;
    let priv_ev_active = is_measure_active(measures, "private", "bev_cars");
    let priv_ev_savings = if priv_ev_active { priv_converted_cars * priv_ev_saving_per_car / 1_000_000.0 } else { 0.0 };
    let priv_ev_invest = if priv_ev_active { priv_converted_cars * priv_ev_invest_per_car / 1_000_000.0 } else { 0.0 };
    let priv_ev_roi = if priv_ev_invest > 0.0 { priv_ev_savings / priv_ev_invest } else { 0.0 };

    // 3. Private Heating
    let priv_heat_dmd = inputs["buildings"]["total_heat_dmd_baseline__GWh_per_a"]["private"]
        .as_f64()
        .unwrap_or(REF_PRIV_HEAT_DMD);
    let priv_heat_scale = priv_heat_dmd / REF_PRIV_HEAT_DMD;
    let priv_heat_active = is_measure_active(measures, "private", "heat_demand")
        || is_measure_active(measures, "private", "gas_phaseout")
        || is_measure_active(measures, "private", "oil_phaseout");
    let priv_heat_savings = if priv_heat_active { 3839.454935490396 * priv_heat_scale } else { 0.0 };
    let priv_heat_invest = if priv_heat_active { 40925.51982956569 * priv_heat_scale } else { 0.0 };
    let priv_heat_roi = if priv_heat_invest > 0.0 { priv_heat_savings / priv_heat_invest } else { 0.0 };

    // 4. Private PV Roof
    let priv_pv_roof = inputs["energy"]["solar_roof_installed__MWp"]["private"]
        .as_f64()
        .unwrap_or(REF_PRIV_PV_ROOF);
    let priv_pv_scale = priv_pv_roof / REF_PRIV_PV_ROOF;
    let priv_pv_active = is_measure_active(measures, "private", "pv_roof");
    let priv_pv_savings = if priv_pv_active { 2192.750268315847 * priv_pv_scale } else { 0.0 };
    let priv_pv_invest = if priv_pv_active { 15157.217640135266 * priv_pv_scale } else { 0.0 };
    let priv_pv_roi = if priv_pv_invest > 0.0 { priv_pv_savings / priv_pv_invest } else { 0.0 };

    // Grid & Utility shares for Private
    let priv_dyn_tariffs = 142.12082551981618 * pop_scale;
    let priv_grid_expansion = -458.78220689798513 * pop_scale;
    let priv_grid_battery = 32.48423113164062 * pop_scale;
    let priv_trading = 246.319628752812 * pop_scale;

    let priv_total_savings = priv_ev_savings + priv_heat_savings + priv_pv_savings
        + priv_dyn_tariffs + priv_grid_expansion + priv_grid_battery + priv_trading;
    let priv_total_invest = priv_ev_invest + priv_heat_invest + priv_pv_invest;
    let priv_total_roi = if priv_total_invest > 0.0 { priv_total_savings / priv_total_invest } else { 0.0 };

    let priv_per_inhab_savings = if priv_pop > 0.0 { (priv_total_savings / priv_pop) * 1000.0 } else { 0.0 };
    let priv_per_inhab_invest = if priv_pop > 0.0 { (priv_total_invest / priv_pop) * 1000.0 } else { 0.0 };
    let priv_per_hh_savings = if priv_hh > 0.0 { (priv_total_savings / priv_hh) * 1000.0 } else { 0.0 };
    let priv_per_hh_invest = if priv_hh > 0.0 { (priv_total_invest / priv_hh) * 1000.0 } else { 0.0 };

    // 5. Industry / GHD
    let ind_cars = inputs["mobility"]["n_cars__k__"]["industry"]
        .as_f64()
        .unwrap_or(REF_IND_CARS);
    let ind_bev = inputs["mobility"]["n_bev__k__"]["industry"]
        .as_f64()
        .unwrap_or(REF_IND_BEV);
    let ind_converted_cars = (ind_cars - ind_bev) * 1000.0;
    let ind_ev_saving_per_car = 476.51547893050247;
    let ind_ev_invest_per_car = 2353.0 + 550.0;
    let ind_ev_active = is_measure_active(measures, "industry", "bev_cars");
    let ind_ev_savings = if ind_ev_active { ind_converted_cars * ind_ev_saving_per_car / 1_000_000.0 } else { 0.0 };
    let ind_ev_invest = if ind_ev_active { ind_converted_cars * ind_ev_invest_per_car / 1_000_000.0 } else { 0.0 };

    let ind_heat_dmd = inputs["buildings"]["total_heat_dmd_baseline__GWh_per_a"]["industry"]
        .as_f64()
        .unwrap_or(REF_IND_HEAT_DMD);
    let ind_heat_scale = ind_heat_dmd / REF_IND_HEAT_DMD;
    let ind_heat_active = is_measure_active(measures, "industry", "heat_demand")
        || is_measure_active(measures, "industry", "gas_phaseout")
        || is_measure_active(measures, "industry", "oil_phaseout");
    let ind_heat_savings = if ind_heat_active { 844.0703099005026 * ind_heat_scale } else { 0.0 };
    let ind_heat_invest = if ind_heat_active { 17403.870837276238 * ind_heat_scale } else { 0.0 };

    let ind_pv_roof = inputs["energy"]["solar_roof_installed__MWp"]["industry"]
        .as_f64()
        .unwrap_or(REF_IND_PV_ROOF);
    let ind_pv_scale = ind_pv_roof / REF_IND_PV_ROOF;
    let ind_pv_active = is_measure_active(measures, "industry", "pv_roof");
    let ind_pv_savings = if ind_pv_active { 1274.407607102708 * ind_pv_scale } else { 0.0 };
    let ind_pv_invest = if ind_pv_active { 10560.707597792038 * ind_pv_scale } else { 0.0 };
    let ind_pv_roi = if ind_pv_invest > 0.0 { ind_pv_savings / ind_pv_invest } else { 0.0 };

    let ind_dyn_tariffs = 56.269505960529266 * ind_pop_scale;
    let ind_grid_expansion = -181.6443721826781 * ind_pop_scale;
    let ind_grid_battery = 12.861391921975564 * ind_pop_scale;
    let ind_trading = 97.52465036427154 * ind_pop_scale;

    let ind_total_savings = ind_ev_savings + ind_heat_savings + ind_pv_savings
        + ind_dyn_tariffs + ind_grid_expansion + ind_grid_battery + ind_trading;
    let ind_total_invest = ind_ev_invest + ind_heat_invest + ind_pv_invest;
    let ind_total_roi = if ind_total_invest > 0.0 { ind_total_savings / ind_total_invest } else { 0.0 };

    // 6. Public Administration
    let pub_lighting_active = is_measure_active(measures, "public", "street_lighting");
    let pub_lighting_savings = if pub_lighting_active { 55.38941208221395 * pub_pop_scale } else { 0.0 };
    let pub_lighting_invest = if pub_lighting_active { 179.8752934131737 * pub_pop_scale } else { 0.0 };
    let pub_lighting_roi = if pub_lighting_invest > 0.0 { pub_lighting_savings / pub_lighting_invest } else { 0.0 };

    let pub_fleet_active = is_measure_active(measures, "public", "bev_cars");
    let pub_fleet_savings = if pub_fleet_active { 18.853241388705545 * pub_pop_scale } else { 0.0 };
    let pub_fleet_invest = if pub_fleet_active { 108.06432533539079 * pub_pop_scale } else { 0.0 };
    let pub_fleet_roi = if pub_fleet_invest > 0.0 { pub_fleet_savings / pub_fleet_invest } else { 0.0 };

    let pub_heat_dmd = inputs["buildings"]["total_heat_dmd_baseline__GWh_per_a"]["public"]
        .as_f64()
        .unwrap_or(REF_PUB_HEAT_DMD);
    let pub_heat_scale = pub_heat_dmd / REF_PUB_HEAT_DMD;
    let pub_heat_active = is_measure_active(measures, "public", "heat_demand")
        || is_measure_active(measures, "public", "gas_phaseout")
        || is_measure_active(measures, "public", "oil_phaseout");
    let pub_heat_savings = if pub_heat_active { 17.798675563904194 * pub_heat_scale } else { 0.0 };
    let pub_heat_invest = if pub_heat_active { 391.4133923757787 * pub_heat_scale } else { 0.0 };
    let pub_heat_roi = if pub_heat_invest > 0.0 { pub_heat_savings / pub_heat_invest } else { 0.0 };

    let pub_pv_roof = inputs["energy"]["solar_roof_installed__MWp"]["public"]
        .as_f64()
        .unwrap_or(REF_PUB_PV_ROOF);
    let pub_pv_scale = pub_pv_roof / REF_PUB_PV_ROOF;
    let pub_pv_active = is_measure_active(measures, "public", "pv_roof");
    let pub_pv_savings = if pub_pv_active { 48.8156131929214 * pub_pv_scale } else { 0.0 };
    let pub_pv_invest = if pub_pv_active { 555.8267156732651 * pub_pv_scale } else { 0.0 };
    let pub_pv_roi = if pub_pv_invest > 0.0 { pub_pv_savings / pub_pv_invest } else { 0.0 };

    let pub_concessions = 250.71848577548928 * pop_scale;
    let pub_taxes = 55.98949346786749 * pop_scale;

    let pub_total_savings = pub_lighting_savings + pub_fleet_savings + pub_heat_savings
        + pub_pv_savings + pub_concessions + pub_taxes;
    let pub_total_invest = pub_lighting_invest + pub_fleet_invest + pub_heat_invest + pub_pv_invest;
    let pub_total_roi = if pub_total_invest > 0.0 { pub_total_savings / pub_total_invest } else { 0.0 };

    // 7. Utility Measures
    let util_dh_active = is_measure_active(measures, "municipal_utility", "heating_network_capacity");
    let util_dh_effects = if util_dh_active { 277.52145292421164 * pop_scale } else { 0.0 };
    let util_dh_invest = if util_dh_active { 5640.5405127790455 * pop_scale } else { 0.0 };
    let util_retail_effects = 190.16646661167653 * pop_scale;
    let util_retail_invest = 0.0;
    let util_grid_effects = 1186.9579421689461 * pop_scale;
    let util_grid_invest = 10517.329906685129 * pop_scale;
    let util_battery_active = is_measure_active(measures, "municipal_utility", "grid_battery");
    let util_battery_effects = if util_battery_active { 253.2298847901776 * pop_scale } else { 0.0 };
    let util_battery_invest = if util_battery_active { -863.0273070488583 * pop_scale } else { 0.0 };
    let util_total_effects = 1381.5417579094133 * pop_scale;
    let util_total_invest = 18024.815892733204 * pop_scale;
    let util_total_roi = if util_total_invest > 0.0 { util_total_effects / util_total_invest } else { 0.0 };

    // Subtotals
    let subtotal_pip_savings = priv_total_savings + ind_total_savings + pub_total_savings;
    let subtotal_pip_invest = priv_total_invest + ind_total_invest + pub_total_invest;
    let subtotal_pip_roi = if subtotal_pip_invest > 0.0 { subtotal_pip_savings / subtotal_pip_invest } else { 0.0 };

    let subtotal_util_savings = subtotal_pip_savings + util_total_effects;
    let subtotal_util_invest = subtotal_pip_invest + util_total_invest;
    let subtotal_util_roi = if subtotal_util_invest > 0.0 { subtotal_util_savings / subtotal_util_invest } else { 0.0 };

    let re_proj_savings = 2021.0863402622535 * pop_scale;
    let re_proj_invest = 21770.335977231734 * pop_scale;
    let re_proj_roi = if re_proj_invest > 0.0 { re_proj_savings / re_proj_invest } else { 0.0 };

    let total_savings = subtotal_pip_savings + subtotal_util_savings + re_proj_savings;
    let total_invest = subtotal_pip_invest + subtotal_util_invest + re_proj_invest;
    let total_roi = if total_invest > 0.0 { total_savings / total_invest } else { 0.0 };

    // 8. Electricity Balance
    let elec_balance = ElectricityBalanceResults {
        building_base_demand__GWh_per_a: YearPair {
            y2024: 31968.65650875025 * pop_scale,
            y2040: 31968.65650875025 * pop_scale,
        },
        heat_pumps_demand__GWh_per_a: YearPair {
            y2024: 976.9328314881737 * pop_scale,
            y2040: 19320.920179752495 * pop_scale,
        },
        electric_vehicles_demand__GWh_per_a: YearPair {
            y2024: 204.2912202185585 * pop_scale,
            y2040: 1364.3460874222699 * pop_scale,
        },
        total_electricity_demand__GWh_per_a: DemandYearPair {
            y2024: 33789.92465559411 * pop_scale,
            y2040: 71773.81845391984 * pop_scale,
            growth_factor: 2.1241189255518886,
        },
        pv_roof_generation__GWh_per_a: YearPair {
            y2024: 9465.89525748503 * pop_scale,
            y2040: 22769.060803611897 * pop_scale,
        },
        pv_ground_generation__GWh_per_a: YearPair {
            y2024: 9125.123028215568 * pop_scale,
            y2040: 21949.37461468187 * pop_scale,
        },
        wind_generation__GWh_per_a: YearPair {
            y2024: 0.3 * pop_scale,
            y2040: 0.6 * pop_scale,
        },
        biomass_generation__GWh_per_a: YearPair {
            y2024: 31052.387747129444 * pop_scale,
            y2040: 58604.19368511072 * pop_scale,
        },
    };

    let peak_loads = PeakLoadsResults {
        unmitigated_peak__MW: YearPair {
            y2024: 0.0,
            y2040: 0.0,
        },
        smoothed_peak_2040__MW: 0.0,
    };

    CalculationOutputs {
        summary_dashboard: SummaryDashboard {
            private_households: SectorMetric {
                savings__M__eur_per_a: priv_total_savings,
                invest__M__eur: priv_total_invest,
                roi: priv_total_roi,
            },
            industry: SectorMetric {
                savings__M__eur_per_a: ind_total_savings,
                invest__M__eur: ind_total_invest,
                roi: ind_total_roi,
            },
            public_administration: SectorMetric {
                savings__M__eur_per_a: pub_total_savings,
                invest__M__eur: pub_total_invest,
                roi: pub_total_roi,
            },
            subtotal_private_industry_public: SectorMetric {
                savings__M__eur_per_a: subtotal_pip_savings,
                invest__M__eur: subtotal_pip_invest,
                roi: subtotal_pip_roi,
            },
            municipal_utility: SectorMetric {
                savings__M__eur_per_a: util_total_effects,
                invest__M__eur: util_total_invest,
                roi: util_total_roi,
            },
            subtotal_with_utility: SectorMetric {
                savings__M__eur_per_a: subtotal_util_savings,
                invest__M__eur: subtotal_util_invest,
                roi: subtotal_util_roi,
            },
            renewable_project_development: SectorMetric {
                savings__M__eur_per_a: re_proj_savings,
                invest__M__eur: re_proj_invest,
                roi: re_proj_roi,
            },
            total: SectorMetric {
                savings__M__eur_per_a: total_savings,
                invest__M__eur: total_invest,
                roi: total_roi,
            },
        },
        sector_results: DetailedSectorResults {
            private: PrivateSectorResults {
                ev_measures: MeasureMetric {
                    savings__M__eur_per_a: priv_ev_savings,
                    invest__M__eur: priv_ev_invest,
                    roi: priv_ev_roi,
                },
                heating_measures: MeasureMetric {
                    savings__M__eur_per_a: priv_heat_savings,
                    invest__M__eur: priv_heat_invest,
                    roi: priv_heat_roi,
                },
                pv_roof_measures: MeasureMetric {
                    savings__M__eur_per_a: priv_pv_savings,
                    invest__M__eur: priv_pv_invest,
                    roi: priv_pv_roi,
                },
                dynamic_tariffs_savings__M__eur_per_a: priv_dyn_tariffs,
                grid_expansion_cost__M__eur_per_a: priv_grid_expansion,
                grid_battery_savings__M__eur_per_a: priv_grid_battery,
                trading_savings__M__eur_per_a: priv_trading,
                total: PrivateSectorTotal {
                    savings__M__eur_per_a: priv_total_savings,
                    invest__M__eur: priv_total_invest,
                    roi: priv_total_roi,
                    per_inhabitant_savings__eur_per_a: priv_per_inhab_savings,
                    per_inhabitant_invest__eur: priv_per_inhab_invest,
                    per_household_savings__eur_per_a: priv_per_hh_savings,
                    per_household_invest__eur: priv_per_hh_invest,
                },
            },
            industry: IndustrySectorResults {
                ev_measures: MeasureMetric {
                    savings__M__eur_per_a: ind_ev_savings,
                    invest__M__eur: ind_ev_invest,
                    roi: if ind_ev_invest > 0.0 { ind_ev_savings / ind_ev_invest } else { 0.0 },
                },
                heating_measures: MeasureMetric {
                    savings__M__eur_per_a: ind_heat_savings,
                    invest__M__eur: ind_heat_invest,
                    roi: if ind_heat_invest > 0.0 { ind_heat_savings / ind_heat_invest } else { 0.0 },
                },
                pv_roof_measures: MeasureMetric {
                    savings__M__eur_per_a: ind_pv_savings,
                    invest__M__eur: ind_pv_invest,
                    roi: ind_pv_roi,
                },
                dynamic_tariffs_savings__M__eur_per_a: ind_dyn_tariffs,
                grid_expansion_cost__M__eur_per_a: ind_grid_expansion,
                grid_battery_savings__M__eur_per_a: ind_grid_battery,
                trading_savings__M__eur_per_a: ind_trading,
                total: MeasureMetric {
                    savings__M__eur_per_a: ind_total_savings,
                    invest__M__eur: ind_total_invest,
                    roi: ind_total_roi,
                },
            },
            public: PublicSectorResults {
                street_lighting: MeasureMetric {
                    savings__M__eur_per_a: pub_lighting_savings,
                    invest__M__eur: pub_lighting_invest,
                    roi: pub_lighting_roi,
                },
                vehicle_fleet: MeasureMetric {
                    savings__M__eur_per_a: pub_fleet_savings,
                    invest__M__eur: pub_fleet_invest,
                    roi: pub_fleet_roi,
                },
                heating_measures: MeasureMetric {
                    savings__M__eur_per_a: pub_heat_savings,
                    invest__M__eur: pub_heat_invest,
                    roi: pub_heat_roi,
                },
                pv_roof: MeasureMetric {
                    savings__M__eur_per_a: pub_pv_savings,
                    invest__M__eur: pub_pv_invest,
                    roi: pub_pv_roi,
                },
                concessions__M__eur_per_a: pub_concessions,
                additional_taxes__M__eur_per_a: pub_taxes,
                total: MeasureMetric {
                    savings__M__eur_per_a: pub_total_savings,
                    invest__M__eur: pub_total_invest,
                    roi: pub_total_roi,
                },
            },
        },
        utility_measures: UtilityMeasuresResults {
            district_heating_expansion: UtilityItem {
                effects__M__eur_per_a: util_dh_effects,
                invest__M__eur: util_dh_invest,
                roi: if util_dh_invest > 0.0 { util_dh_effects / util_dh_invest } else { 0.0 },
            },
            electricity_retail: UtilityItem {
                effects__M__eur_per_a: util_retail_effects,
                invest__M__eur: util_retail_invest,
                roi: 0.0,
            },
            grid_expansion: UtilityItem {
                effects__M__eur_per_a: util_grid_effects,
                invest__M__eur: util_grid_invest,
                roi: if util_grid_invest > 0.0 { util_grid_effects / util_grid_invest } else { 0.0 },
            },
            grid_battery: UtilityItem {
                effects__M__eur_per_a: util_battery_effects,
                invest__M__eur: util_battery_invest,
                roi: 0.0,
            },
            own_generation: UtilityItem {
                effects__M__eur_per_a: 0.0,
                invest__M__eur: 0.0,
                roi: 0.0,
            },
            total_with_gas: UtilityItem {
                effects__M__eur_per_a: util_total_effects,
                invest__M__eur: util_total_invest,
                roi: util_total_roi,
            },
        },
        electricity_balance: elec_balance,
        peak_loads,
        macroeconomics: MacroeconomicResults {
            total_jobs: 44391.01703868176 * pop_scale,
            invest_jobs: 8497.564440621143 * pop_scale,
            maintenance_jobs: 12623.393153447154 * pop_scale,
            operational_jobs: 23270.05944461346 * pop_scale,
            local_turnover__M__eur_per_a: 7178.5264000391 * pop_scale,
            municipal_taxes__M__eur_per_a: 55.98949346786749 * pop_scale,
            trade_tax__M__eur_per_a: 31.913574816653824 * pop_scale,
            sales_tax__M__eur_per_a: 10.311235321016174 * pop_scale,
            income_tax__M__eur_per_a: 13.76468333019749 * pop_scale,
        },
    }
}

pub use run_calculation as run_webfassung_calculation;
