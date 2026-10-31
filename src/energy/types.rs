#![allow(non_snake_case)]

use crate::input::Input;
use crate::input::InputFields;
use crate::result::Results;
use crate::sectors::SectorsInputs;
use crate::sectors::SectorsResult;

macro_rules! implement_inputs_energy {
    ($($field:ident),*) => {
        #[derive(serde::Serialize)]
        pub struct InputsEnergy {
            $(
                pub $field: SectorsInputs,
            )*
        }

        impl InputsEnergy {
            pub fn new(id: &str, start_year: u32, end_year: u32) -> InputsEnergy {
                InputsEnergy {
                    $(
                        $field: SectorsInputs::new(id.to_owned() + "/" + stringify!($field), start_year, end_year),
                    )*
                }
            }
        }

        impl InputFields for InputsEnergy {
            fn get_inputs(&self) -> Vec<&Input> {
                let mut inputs: Vec<&Input> = Vec::from([]);
                $(
                    inputs.extend(self.$field.get_inputs());
                )*
                inputs
            }

            fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input> {
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix {
                    $(
                        stringify!($field) => self.$field.get_input_by_id(remaining_id),
                    )*
                    _ => None,
                }
            }
        }
    };
}

implement_inputs_energy! {
    rf_A__ha,
    sol_rf_suitable_A_part,
    sol_rf_installed__M__Wp,
    sol_rf_self_cnsmp_part,
    sol_os_installed_A__ha,
    sol_os_self_cnsmp_part,
    wind_suitable_A__ha,
    wind_installed_A__ha,
    prchsd_renewable_nrg__G__W_h_per_a,
    renewable_nrg_price__m__eur_per_W_h,
    nrg_mix_price__m__eur_per_W_h
}

macro_rules! implement_results_energy {
    ($($field:ident),*) => {
        #[derive(serde::Serialize)]
        pub struct ResultsEnergy {
            $(
                pub $field: SectorsResult,
            )*
        }

        impl ResultsEnergy {
            pub fn new(id: &str, start_year: u32, end_year: u32) -> ResultsEnergy {
                ResultsEnergy {
                    $(
                        $field: SectorsResult::new(id.to_owned() + "/" + stringify!($field), start_year, end_year),
                    )*
                }
            }

            pub fn get_results(&self) -> Vec<&Results> {
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.extend(self.$field.get_results());
                )*
                results
            }

            pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results> {
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix {
                    $(
                        stringify!($field) => self.$field.get_results_by_id(remaining_id),
                    )*
                    _ => None,
                }
            }
        }
    };
}

implement_results_energy! {
    prchsd_renewable_nrg__G__W_h_per_a,
    sol_rf_potential__M__Wp,
    sol_rf_nrg__G__W_h_per_a,
    sol_rf_self_cnsmp__G__W_h_per_a,
    sol_rf_invest__M__eur_per_a,
    sol_rf_grant__M__eur_per_a,
    sol_rf_om__M__eur_per_a,
    sol_rf_revenue__M__eur_per_a,
    sol_os_installed__M__Wp,
    sol_os_nrg__G__W_h_per_a,
    sol_os_self_cnsmp__G__W_h_per_a,
    sol_os_invest__M__eur_per_a,
    sol_os_grant__M__eur_per_a,
    sol_os_om__M__eur_per_a,
    sol_os_turnover_buyback__M__eur_per_a,
    sol_os_revenue__M__eur_per_a,
    sol_os_prod_costs__M__eur_per_a,
    wind_installed__M__WP,
    wind_nrg__G__W_h_per_a,
    wind_invest__M__eur_per_a,
    wind_grant__M__eur_per_a,
    wind_om__M__eur_per_a,
    wind_turnover_buyback__M__eur_per_a,
    wind_revenue__M__eur_per_a,
    prchsd_renewable_nrg__M__eur_per_a,
    elec_nrg_dmd__G__W_h_per_a,
    prchsd_nrg_mix__G__W_h_per_a,
    prchsd_nrg_mix_costs__M__eur_per_a,
    prchsd_nrg_mix_ems__k__to_coe_per_a,
    nrg_own_mix_price__m__eur_per_W_h
}
