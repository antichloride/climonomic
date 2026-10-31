#![allow(non_snake_case)]

use crate::input::Input;
use crate::input::InputFields;
use crate::result::Results;
use crate::sectors::SectorsInputs;
use crate::sectors::SectorsResult;

macro_rules! implement_inputs_mobility {
    ($($field:ident),*) => {
        #[derive(serde::Serialize)]
        pub struct InputsMobility {
            $(
                pub $field: SectorsInputs,
            )*
            pub traveld_dist_per_person__m__m_per_a: Input,
            pub mean_persons_per_car: Input,
            pub modal_split_car: Input,
            pub n_sl__k__: Input,
            pub nrg_cnsmp_per_sl__k__W_h_per_a: Input,
            pub om_costs_per_sl__eur_per_a: Input,
            pub price_fuel__eur_per_L: Input,
        }

        impl InputsMobility {
            pub fn new(id: &str, start_year: u32, end_year: u32) -> InputsMobility {
                InputsMobility {
                    $(
                        $field: SectorsInputs::new(
                            id.to_owned() + "/" + stringify!($field),
                            start_year,
                            end_year,
                        ),
                    )*
                    traveld_dist_per_person__m__m_per_a: Input::new(
                        id.to_owned() + "/traveld_dist_per_person__m__m_per_a",
                        start_year,
                        end_year,
                    ),
                    mean_persons_per_car: Input::new(
                        id.to_owned() + "/mean_persons_per_car",
                        start_year,
                        end_year,
                    ),
                    modal_split_car: Input::new(
                        id.to_owned() + "/modal_split_car",
                        start_year,
                        end_year,
                    ),
                    n_sl__k__: Input::new(
                        id.to_owned() + "/n_sl__k__",
                        start_year,
                        end_year,
                    ),
                    nrg_cnsmp_per_sl__k__W_h_per_a: Input::new(
                        id.to_owned() + "/nrg_cnsmp_per_sl__k__W_h_per_a",
                        start_year,
                        end_year,
                    ),
                    om_costs_per_sl__eur_per_a: Input::new(
                        id.to_owned() + "/om_costs_per_sl__eur_per_a",
                        start_year,
                        end_year,
                    ),
                    price_fuel__eur_per_L: Input::new(
                        id.to_owned() + "/price_fuel__eur_per_L",
                        start_year,
                        end_year,
                    ),
                }
            }
        }

        impl InputFields for InputsMobility {
            fn get_inputs(&self) -> Vec<&Input> {
                let mut inputs: Vec<&Input> = Vec::from([]);
                $(
                    inputs.extend(self.$field.get_inputs());
                )*
                inputs.push(&self.traveld_dist_per_person__m__m_per_a);
                inputs.push(&self.mean_persons_per_car);
                inputs.push(&self.modal_split_car);
                inputs.push(&self.n_sl__k__);
                inputs.push(&self.nrg_cnsmp_per_sl__k__W_h_per_a);
                inputs.push(&self.om_costs_per_sl__eur_per_a);
                inputs.push(&self.price_fuel__eur_per_L);
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
                    "traveld_dist_per_person__m__m_per_a" => {
                        Some(&mut self.traveld_dist_per_person__m__m_per_a)
                    }
                    "mean_persons_per_car" => Some(&mut self.mean_persons_per_car),
                    "modal_split_car" => Some(&mut self.modal_split_car),
                    "n_sl__k__" => Some(&mut self.n_sl__k__),
                    "nrg_cnsmp_per_sl__k__W_h_per_a" => {
                        Some(&mut self.nrg_cnsmp_per_sl__k__W_h_per_a)
                    }
                    "om_costs_per_sl__eur_per_a" => Some(&mut self.om_costs_per_sl__eur_per_a),
                    "price_fuel__eur_per_L" => Some(&mut self.price_fuel__eur_per_L),
                    _ => None,
                }
            }
        }
    };
}

implement_inputs_mobility! {
    n_inhabitants__k__,
    n_cars__k__,
    n_bev__k__
}

macro_rules! implement_results_mobility {
    ($($field:ident),*) => {
        #[derive(serde::Serialize)]
        pub struct ResultsMobility {
            $(
                pub $field: SectorsResult,
            )*
            pub sl_nrg_dmd__G__W_h_per_a: Results,
            pub sl_nrg_costs__M__eur_per_a: Results,
            pub sl_om_costs__M__eur_per_a: Results,
            pub sl_total_costs__M__eur_per_a: Results,
        }

        impl ResultsMobility {
            pub fn new(id: &str, start_year: u32, end_year: u32) -> ResultsMobility {
                ResultsMobility {
                    $(
                        $field: SectorsResult::new(
                            id.to_owned() + "/" + stringify!($field),
                            start_year,
                            end_year,
                        ),
                    )*
                    sl_nrg_dmd__G__W_h_per_a: Results::new(
                        id.to_owned() + "/sl_nrg_dmd__G__W_h_per_a",
                        start_year,
                        end_year,
                    ),
                    sl_nrg_costs__M__eur_per_a: Results::new(
                        id.to_owned() + "/sl_nrg_costs__M__eur_per_a",
                        start_year,
                        end_year,
                    ),
                    sl_om_costs__M__eur_per_a: Results::new(
                        id.to_owned() + "/sl_om_costs__M__eur_per_a",
                        start_year,
                        end_year,
                    ),
                    sl_total_costs__M__eur_per_a: Results::new(
                        id.to_owned() + "/sl_total_costs__M__eur_per_a",
                        start_year,
                        end_year,
                    ),
                }
            }

            pub fn get_results(&self) -> Vec<&Results> {
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.extend(self.$field.get_results());
                )*
                results.push(&self.sl_nrg_dmd__G__W_h_per_a);
                results.push(&self.sl_nrg_costs__M__eur_per_a);
                results.push(&self.sl_om_costs__M__eur_per_a);
                results.push(&self.sl_total_costs__M__eur_per_a);
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
                    "sl_nrg_dmd__G__W_h_per_a" => Some(&mut self.sl_nrg_dmd__G__W_h_per_a),
                    "sl_nrg_costs__M__eur_per_a" => Some(&mut self.sl_nrg_costs__M__eur_per_a),
                    "sl_om_costs__M__eur_per_a" => Some(&mut self.sl_om_costs__M__eur_per_a),
                    "sl_total_costs__M__eur_per_a" => {
                        Some(&mut self.sl_total_costs__M__eur_per_a)
                    }
                    _ => None,
                }
            }
        }
    };
}

implement_results_mobility! {
    traveld_dist_car__M__m_per_a,
    cars_grant__M__eur_per_a,
    bev_elec_nrg_dmd__G__W_h_per_a,
    bev_elec_nrg_price__G__W_h_per_a,
    cars_fuel_dmd__M__L_per_a,
    cars_fuel_costs__M__eur_per_a,
    bev_nrg_costs__M__eur_per_a,
    cars_ems__k__to_coe_per_a
}
