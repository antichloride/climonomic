use crate::sectors::SectorsInputs;
use crate::sectors::SectorsResult;
use crate::result::Results;
use crate::input::Input;
use crate::input::InputFields;

macro_rules! implement_inputs_buildings{
    ($($field:ident),*) => {

        #[derive(serde::Serialize)]
        pub struct InputsBuildings{
            $(
                pub $field: SectorsInputs,
             )*
            pub price_oil__eur_per_L: Input,
            pub price_gas__eur_per_m3: Input,
            pub price_district_heating__m__eur_per_W_h: Input,
            pub price_other_output_nrg__m__eur_per_W_h: Input,
            pub district_heating_renewable_part: Input,
        }

        impl InputsBuildings{
            pub fn new(
                id: &str,
                start_year: u32,
                end_year: u32
            ) -> InputsBuildings {
                InputsBuildings{
                    $(
                        $field: SectorsInputs::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                        price_oil__eur_per_L: Input::new(
                            id.to_owned()+"/price_oil__eur_per_L",
                            start_year,
                            end_year,
                        ),
                        price_gas__eur_per_m3: Input::new(
                            id.to_owned()+"/price_gas__eur_per_m3",
                            start_year,
                            end_year,
                        ),
                        price_district_heating__m__eur_per_W_h: Input::new(
                            id.to_owned()+"/price_district_heating__m__eur_per_W_h",
                            start_year,
                            end_year,
                        ),
                        price_other_output_nrg__m__eur_per_W_h: Input::new(
                            id.to_owned()+"/price_other_output_nrg__m__eur_per_W_h",
                            start_year,
                            end_year,
                        ),
                        district_heating_renewable_part: Input::new(
                            id.to_owned()+"/district_heating_renewable_part",
                            start_year,
                            end_year,
                        ),
                }
            }
        }

        impl InputFields for InputsBuildings{

            fn get_inputs(& self) -> Vec<&Input>{
                let mut inputs: Vec<&Input> = Vec::from([]);
                $(
                    inputs.extend(self.$field.get_inputs());
                 )*
                inputs.push(&self.price_oil__eur_per_L);
                inputs.push(&self.price_gas__eur_per_m3);
                inputs.push(&self.price_district_heating__m__eur_per_W_h);
                inputs.push(&self.price_other_output_nrg__m__eur_per_W_h);
                inputs.push(&self.district_heating_renewable_part);
                return inputs
            }

            fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field)
                            => self.$field.get_input_by_id(remaining_id),
                     )*
                    "price_oil__eur_per_L"=> Some(
                        &mut self.price_oil__eur_per_L),
                    "price_gas__eur_per_m3"=> Some(
                        &mut self.price_gas__eur_per_m3),
                    "price_district_heating__m__eur_per_W_h"=> Some(
                        &mut self.price_district_heating__m__eur_per_W_h),
                    "price_other_output_nrg__m__eur_per_W_h"=> Some(
                        &mut self.price_other_output_nrg__m__eur_per_W_h),
                    "district_heating_renewable_part"=> Some(
                        &mut self.district_heating_renewable_part),
                    _ => None,
                }
            }
        }
    }
}

implement_inputs_buildings!{
    n_buildings,
    floor_A_building__m2,
    heat_dmd__k__W_h_per_m2_a,
    n_inhabitants__k__,
    hot_water_dmd__k__W_h_per_m2_a,
    elec_dmd_capita__k_W_h_per_a,
    A_heat_oil__k__m2,
    A_heat_oil_condensing__k__m2,
    A_heat_gas__k__m2,
    A_heat_district_heating__k__m2,
    A_heat_heat_pump__k__m2
}

macro_rules! implement_results_buildings{
    ($($field:ident),*) => {

        #[derive(serde::Serialize)]
        pub struct ResultsBuildings{
            $(
                pub $field: SectorsResult,
             )*
        }

        impl ResultsBuildings{
            pub fn new(
                id: &str,
                start_year: u32,
                end_year: u32
            ) -> ResultsBuildings{
                ResultsBuildings{
                    $(
                        $field: SectorsResult::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                }
            }

            pub fn get_results(& self) -> Vec<&Results>{
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.extend(self.$field.get_results());
                 )*
                return results
            }

            pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field)
                            => self.$field.get_results_by_id(remaining_id),
                     )*
                    "costs_other__M__eur" => self.costs_other__M__eur_per_a.get_results_by_id(remaining_id),
                    "costs_total_heating__M__eur" => self.costs_total__M__eur.get_results_by_id(remaining_id),
                    _ => None,
                }
            }
        }
    }
}

implement_results_buildings!{
    floor_A__k__m2,
    specific_heat_dmd__kWh_per_m2_a,
    specific_hot_water_dmd__kWh_per_a,
    total_heat_dmd__G__W_h_per_a,
    elec_dmd__G__W_h_per_a,
    A_heat_oil__k__m2,
    A_heat_oil_condensing__k__m2,
    A_heat_gas__k__m2,
    A_heat_heat_pump__k__m2,
    A_heat_other__k__m2,
    cnsmp_oil__G__W_h_per_a,
    cnsmp_oil_condensing__G__W_h_per_a,
    cnsmp_gas__G__W_h_per_a,
    cnsmp_district_heating__G__W_h_per_a,
    cnsmp_elec_heat_pump__G__W_h_per_a,
    cnsmp_other__G__W_h_per_a,
    cnsmp_total_heat__G__W_h_per_a,
    cnsmp_oil__M__L_per_a,
    cnsmp_gas__M__m3_per_a,
    cnsmp_gas_district_heating__M__m3_per_a,
    costs_oil__M__eur_per_a,
    costs_gas__M__eur_per_a,
    costs_client_district_heating__M__eur_per_a,
    invest_heat_sources__M__eur_per_a,
    invest_energetic_renovation__M__eur_per_a,
    invest_total__M__eur_per_a,
    grant_heat_sources__M__eur_per_a,
    grant_energetic_renovation__M__eur_per_a,
    grant_total__M__eur_per_a,
    costs_heat_pump__M__eur,
    costs_other__M__eur_per_a,
    costs_total__M__eur,
    ems_oil__k__to_coe_per_a,
    ems_gas__k__to_coe_per_a
}
