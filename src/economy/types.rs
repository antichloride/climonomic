#![allow(non_snake_case)]

use crate::result::Results;

macro_rules! implement_economy {
    ($($field:ident),* $(,)?) => {
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
                    _ => None,
                }
            }
        }
    };
}

implement_economy! {
    invest_heating_material__M__eur_per_a,
    invest_heating_work__M__eur_per_a,
    turnover_heating_crafting_local__M__eur_per_a,
    turnover_heating_crafting_national__M__eur_per_a,
    turnover_heating_production_national__M__eur_per_a,
    invest_heat_demand_material__M__eur_per_a,
    invest_heat_demand_work__M__eur_per_a,
    turnover_heat_demand_crafting_local__M__eur_per_a,
    turnover_heat_demand_crafting_national__M__eur_per_a,
    turnover_heat_demand_production_national__M__eur_per_a,
    invest_solar_roof_material__M__eur_per_a,
    invest_solar_roof_work__M__eur_per_a,
    maintenance_solar_roof_work__M__eur_per_a,
    turnover_solar_roof_crafting_local__M__eur_per_a,
    turnover_solar_roof_crafting_national__M__eur_per_a,
    turnover_solar_roof_production_national__M__eur_per_a,
    invest_solar_landscape_material__M__eur_per_a,
    invest_solar_landscape_work__M__eur_per_a,
    maintenance_solar_landscape_work__M__eur_per_a,
    turnover_solar_landscape_crafting_local__M__eur_per_a,
    turnover_solar_landscape_crafting_national__M__eur_per_a,
    turnover_solar_landscape_production_national__M__eur_per_a,
    n_jobs_crafting_local,
    n_jobs_crafting_national,
    n_jobs_production_national,
    n_jobs_production_sum_national,
    income_local__M__eur_per_a,
    income_national__M__eur_per_a,
    income_tax_local__M__eur_per_a,
    income_tax_national__M__eur_per_a,
    turnover_local__M__eur_per_a,
    revenue_local__M__eur_per_a,
    turnover_national__M__eur_per_a,
    turnover_tax_local__M__eur_per_a,
    turnover_tax_national__M__eur_per_a,
    business_tax_local__M__eur_per_a,
    business_tax_national__M__eur_per_a,
    corporate_tax_national__M__eur_per_a,
    energy_tax_oil__eur_per_L,
    energy_tax_gas__eur_per_kWh,
    energy_tax_fuel__eur_per_L,
    energy_tax_national__M__eur_per_a
}
