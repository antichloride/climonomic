#![allow(non_snake_case)]

use crate::result::Results;

macro_rules! implement_economy {
    ($($field:ident),*) => {
        #[derive(serde::Serialize)]
        pub struct Economy {
            #[serde(skip)]
            pub(crate) start_year: u32,
            $(
                pub $field: Results,
            )*
        }

        impl Economy {
            pub fn new(start_year: u32, end_year: u32) -> Economy {
                Economy {
                    start_year,
                    $(
                        $field: Results::new(
                            "economy/results/".to_owned() + stringify!($field),
                            start_year,
                            end_year,
                        ),
                    )*
                }
            }

            pub fn get_results(&self) -> Vec<&Results> {
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.push(&self.$field);
                )*
                results
            }

            pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results> {
                match id {
                    $(
                        stringify!($field) => Some(&mut self.$field),
                    )*
                    "turnover_local_with_materials" => Some(&mut self.turnover_local),
                    "trade_tax_local" => Some(&mut self.business_tax_local),
                    "trade_tax_national" => Some(&mut self.business_tax_national),
                    _ => None,
                }
            }
        }
    };
}

implement_economy! {
    invest_heating_material,
    invest_heating_work,
    turnover_heating_crafting_local,
    turnover_heating_crafting_national,
    turnover_heating_production_national,
    invest_heat_demand_material,
    invest_heat_demand_work,
    turnover_heat_demand_crafting_local,
    turnover_heat_demand_crafting_national,
    turnover_heat_demand_production_national,
    invest_solar_roof_material,
    invest_solar_roof_work,
    maintenance_solar_roof_work,
    turnover_solar_roof_crafting_local,
    turnover_solar_roof_crafting_national,
    turnover_solar_roof_production_national,
    invest_solar_landscape_material,
    invest_solar_landscape_work,
    maintenance_solar_landscape_work,
    turnover_solar_landscape_crafting_local,
    turnover_solar_landscape_crafting_national,
    turnover_solar_landscape_production_national,
    n_jobs_crafting_local,
    n_jobs_crafting_national,
    n_jobs_production_national,
    n_jobs_production_sum_national,
    income_local,
    income_national,
    income_tax_local,
    income_tax_national,
    turnover_local,
    revenue_local,
    turnover_national,
    turnover_tax_local,
    turnover_tax_national,
    business_tax_local,
    business_tax_national,
    corporate_tax_national,
    energy_tax_oil,
    energy_tax_gas,
    energy_tax_fuel,
    energy_tax_national
}
