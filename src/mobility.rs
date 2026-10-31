#![allow(non_snake_case)]

use crate::sectors::SectorsInputs;
use crate::sectors::SectorsRawValues;
use crate::sectors::SectorsResult;
use crate::result::Results;
use crate::input::Input;
use crate::input::InputFields;
use crate::constants::mobility as constants;
use crate::constants::buildings::EnergySource::oil;


pub struct Mobility {
    inputs: InputsMobility,
    pub results: ResultsMobility,
    start_year: u32,
}

impl Mobility{

    pub fn new(start_year: u32, end_year: u32) -> Mobility{
        return Mobility{
            inputs: InputsMobility
                ::new("mobility/inputs", start_year, end_year),
            results: ResultsMobility
                ::new("mobility/results", start_year, end_year),
            start_year: start_year,
        }
    }


    pub fn get_inputs(& self) -> Vec<&Input>{
        return self.inputs.get_inputs();
    }

    pub fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
        return self.inputs.get_input_by_id(id);
    }


    pub fn get_results(& self) -> Vec<&Results>{
        return self.results.get_results();
    }

    pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
        return self.results.get_results_by_id(id);
    }
}

impl Mobility{
    pub fn bev_elec_nrg_dmd__G__W_h_per_a(&self) -> &SectorsResult{
        return &self.results.bev_elec_nrg_dmd__G__W_h_per_a;
    }
    pub fn sl_nrg_dmd__G__W_h_per_a(&self) -> &Results {
        return &self.results.sl_nrg_dmd__G__W_h_per_a;
    }
    pub fn bev_nrg_costs__M__eur_per_a(&self) -> &SectorsResult {
        return &self.results.bev_nrg_costs__M__eur_per_a;
    }
    pub fn cars_fuel_costs__M__eur_per_a(&self) -> &SectorsResult {
        return &self.results.cars_fuel_costs__M__eur_per_a;
    }
}

impl Mobility{
    pub fn calculate(&mut self, year: u32){

        let n_inhabitants__k__ = self.inputs.n_inhabitants__k__.get_year(year);
        let n_bev__k__ = self.inputs.n_bev__k__.get_year(year);
        let n_cars__k__ = self.inputs.n_cars__k__.get_year(year);
        let traveld_dist_per_person__m__m_per_a =
            self.inputs.traveld_dist_per_person__m__m_per_a.get_year(year);
        let mean_persons_per_car =
            self.inputs.mean_persons_per_car.get_year(year);
        let modal_split_car =
            self.inputs.modal_split_car.get_year(year);

        let mut traveld_dist_car__M__m_per_a =
            &n_inhabitants__k__ / &n_cars__k__
            * traveld_dist_per_person__m__m_per_a
            * modal_split_car
            / mean_persons_per_car;
        if n_cars__k__.private==0.0{
            traveld_dist_car__M__m_per_a.private = 0.0;
        }
        if n_cars__k__.industry==0.0{
            traveld_dist_car__M__m_per_a.industry = 0.0;
        }
        if n_cars__k__.schools==0.0{
            traveld_dist_car__M__m_per_a.schools = 0.0;
        }
        if n_cars__k__.public==0.0{
            traveld_dist_car__M__m_per_a.public = 0.0;
        }
        self.results.traveld_dist_car__M__m_per_a
            .set_year_values(year, &traveld_dist_car__M__m_per_a);

        if year != self.start_year{
            let n_bev__k___this_year =
                self.inputs.n_bev__k__.get_year(year);
            let n_bev__k___prev_year =
                self.inputs.n_bev__k__.get_year(year - 1);

            let cars_grant__M__eur_per_a =
                (&n_bev__k___this_year - &n_bev__k___prev_year)
                * constants::bev::grant_per_car__k__eur
                * n_bev__k___this_year.is_greater(&n_bev__k___prev_year);
            self.results.cars_grant__M__eur_per_a
                .set_year_values(year, &cars_grant__M__eur_per_a);
        }

        let bev_elec_nrg_dmd__G__W_h_per_a = &n_bev__k__
            * &traveld_dist_car__M__m_per_a
            * constants::bev::nrg_cnsmp__1em2__W_h_per_m * 1e-2;
        self.results.bev_elec_nrg_dmd__G__W_h_per_a
            .set_year_values(year, &bev_elec_nrg_dmd__G__W_h_per_a);

        let cars_fuel_dmd__M__L_per_a = (&n_cars__k__ - &n_bev__k__)
            * &traveld_dist_car__M__m_per_a
            * constants::combustor::nrg_cnsmp__1em2__W_h_per_m
            / oil::energy_density__k__W_h_per_L * 1e-2;
        self.results.cars_fuel_dmd__M__L_per_a
            .set_year_values(year, &cars_fuel_dmd__M__L_per_a);

        let price_fuel__eur_per_L =
            self.inputs.price_fuel__eur_per_L.get_year(year);
        let cars_fuel_costs__M__eur_per_a =
            &cars_fuel_dmd__M__L_per_a * price_fuel__eur_per_L;
        self.results.cars_fuel_costs__M__eur_per_a
            .set_year_values(year, &cars_fuel_costs__M__eur_per_a);

        // Street lightning
        let n_sl__k__ = self.inputs.n_sl__k__.get_year(year);
        let nrg_cnsmp_per_sl__k__W_h_per_a =
            self.inputs.nrg_cnsmp_per_sl__k__W_h_per_a.get_year(year);

        let sl_nrg_dmd__G__W_h_per_a = n_sl__k__ * 1e-3
            * nrg_cnsmp_per_sl__k__W_h_per_a;
        self.results.sl_nrg_dmd__G__W_h_per_a
            .set_year_value(year, sl_nrg_dmd__G__W_h_per_a);


    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        nrg_own_mix_price__m__eur_per_W_h: SectorsRawValues,
    ){

        let bev_elec_nrg_dmd__G__W_h_per_a =
            self.results.bev_elec_nrg_dmd__G__W_h_per_a.get_year(year);

        let bev_elec_nrg_price__G__W_h_per_a = &bev_elec_nrg_dmd__G__W_h_per_a
            * &nrg_own_mix_price__m__eur_per_W_h;
        self.results.bev_elec_nrg_price__G__W_h_per_a
            .set_year_values(year, &bev_elec_nrg_price__G__W_h_per_a);

        // Street lighning
        let n_sl__k__ = self.inputs.n_sl__k__.get_year(year);
        let nrg_cnsmp_per_sl__k__W_h_per_a =
            self.inputs.nrg_cnsmp_per_sl__k__W_h_per_a.get_year(year);
        let om_costs_per_sl__eur_per_a =
            self.inputs.om_costs_per_sl__eur_per_a.get_year(year);

        let sl_nrg_costs__M__eur_per_a = n_sl__k__
            * nrg_cnsmp_per_sl__k__W_h_per_a
            * nrg_own_mix_price__m__eur_per_W_h.public* 1e-3;
        self.results.sl_nrg_costs__M__eur_per_a
            .set_year_value(year, sl_nrg_costs__M__eur_per_a);

        let sl_om_costs__M__eur_per_a = n_sl__k__
            * om_costs_per_sl__eur_per_a * 1e-3;
        self.results.sl_om_costs__M__eur_per_a
            .set_year_value(year, sl_om_costs__M__eur_per_a);

        let sl_total_costs__M__eur_per_a =
            sl_nrg_costs__M__eur_per_a + sl_om_costs__M__eur_per_a;
        self.results.sl_total_costs__M__eur_per_a
            .set_year_value(year, sl_total_costs__M__eur_per_a);
    }

    pub fn calculate_emissions(&mut self, year: u32){
        let cars_fuel_dmd__M__L_per_a =
            self.results.cars_fuel_dmd__M__L_per_a.get_year(year);
        let cars_ems__k__to_coe_per_a =
            cars_fuel_dmd__M__L_per_a * oil::emission__kg_coe_per_L;
        self.results.cars_ems__k__to_coe_per_a
            .set_year_values(year, &cars_ems__k__to_coe_per_a);
    }
}



macro_rules! implement_inputs_mobility{
    ($($field:ident),*) => {

        struct InputsMobility{
            $(
                $field: SectorsInputs,
             )*
            traveld_dist_per_person__m__m_per_a: Input,
            mean_persons_per_car: Input,
            modal_split_car: Input,
            n_sl__k__: Input,
            nrg_cnsmp_per_sl__k__W_h_per_a: Input,
            om_costs_per_sl__eur_per_a: Input,
            price_fuel__eur_per_L: Input,
        }

        impl InputsMobility{
            fn new(id: &str, start_year: u32, end_year: u32) -> InputsMobility {
                return InputsMobility{
                    $(
                        $field: SectorsInputs::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                        traveld_dist_per_person__m__m_per_a: Input::new(
                            id.to_owned()+"/traveld_dist_per_person__m__m_per_a",
                            start_year,
                            end_year,
                        ),
                        mean_persons_per_car: Input::new(
                            id.to_owned()+"/mean_persons_per_car",
                            start_year,
                            end_year,
                        ),
                        modal_split_car: Input::new(
                            id.to_owned()+"/modal_split_car",
                            start_year,
                            end_year,
                        ),
                        n_sl__k__: Input::new(
                            id.to_owned()+"/n_sl__k__",
                            start_year,
                            end_year,
                        ),
                        nrg_cnsmp_per_sl__k__W_h_per_a: Input::new(
                            id.to_owned()+"/nrg_cnsmp_per_sl__k__W_h_per_a",
                            start_year,
                            end_year,
                        ),
                        om_costs_per_sl__eur_per_a: Input::new(
                            id.to_owned()+"/om_costs_per_sl__eur_per_a",
                            start_year,
                            end_year,
                        ),
                        price_fuel__eur_per_L: Input::new(
                            id.to_owned()+"/price_fuel__eur_per_L",
                            start_year,
                            end_year,
                        ),
                }
            }
        }

        impl InputFields for InputsMobility{

            fn get_inputs(& self) -> Vec<&Input>{
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
                return inputs
            }

            fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field) =>
                            self.$field.get_input_by_id(remaining_id),
                     )*
                    "traveld_dist_per_person__m__m_per_a"=> Some(&mut self.traveld_dist_per_person__m__m_per_a),
                    "mean_persons_per_car"=> Some(&mut self.mean_persons_per_car),
                    "modal_split_car"=> Some(&mut self.modal_split_car),
                    "n_sl__k__"=> Some(&mut self.n_sl__k__),
                    "nrg_cnsmp_per_sl__k__W_h_per_a"=> Some(
                        &mut self.nrg_cnsmp_per_sl__k__W_h_per_a),
                    "om_costs_per_sl__eur_per_a"=> Some(
                        &mut self.om_costs_per_sl__eur_per_a),
                    "price_fuel__eur_per_L"=> Some(
                        &mut self.price_fuel__eur_per_L),
                    _ => None,

                }

            }
        }
    }
}


implement_inputs_mobility!{
    n_inhabitants__k__,
    n_cars__k__,
    n_bev__k__
}


macro_rules! implement_results_mobility{
    ($($field:ident),*) => {

        pub struct ResultsMobility{
            $(
                pub $field: SectorsResult,
             )*
            sl_nrg_dmd__G__W_h_per_a: Results,
            sl_nrg_costs__M__eur_per_a: Results,
            sl_om_costs__M__eur_per_a: Results,
            sl_total_costs__M__eur_per_a: Results,
        }

        impl ResultsMobility{
            fn new(
                id: &str,
                start_year: u32,
                end_year: u32
            ) -> ResultsMobility{
                return ResultsMobility{
                    $(
                        $field: SectorsResult::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                        sl_nrg_dmd__G__W_h_per_a: Results::new(
                            id.to_owned()+"/sl_nrg_dmd__G__W_h_per_a",
                            start_year,
                            end_year,
                        ),
                        sl_nrg_costs__M__eur_per_a: Results::new(
                            id.to_owned()+"/sl_nrg_costs__M__eur_per_a",
                            start_year,
                            end_year,
                        ),
                        sl_om_costs__M__eur_per_a: Results::new(
                            id.to_owned()+"/sl_om_costs__M__eur_per_a",
                            start_year,
                            end_year,
                        ),
                        sl_total_costs__M__eur_per_a: Results::new(
                            id.to_owned()+"/sl_total_costs__M__eur_per_a",
                            start_year,
                            end_year,
                        ),
                }
            }

            pub fn get_results(& self) -> Vec<&Results>{
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.extend(self.$field.get_results());
                 )*
                results.push(&self.sl_nrg_dmd__G__W_h_per_a);
                results.push(&self.sl_nrg_costs__M__eur_per_a);
                results.push(&self.sl_om_costs__M__eur_per_a);
                results.push(&self.sl_total_costs__M__eur_per_a);
                return results
            }

            fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field)=> self.$field
                            .get_results_by_id(remaining_id),
                     )*
                    "sl_nrg_dmd__G__W_h_per_a"=> Some(
                        &mut self.sl_nrg_dmd__G__W_h_per_a),
                    "sl_nrg_costs__M__eur_per_a"=> Some(
                        &mut self.sl_nrg_costs__M__eur_per_a),
                    "sl_om_costs__M__eur_per_a"=> Some(
                        &mut self.sl_om_costs__M__eur_per_a),
                    "sl_total_costs__M__eur_per_a"=> Some(
                        &mut self.sl_total_costs__M__eur_per_a),
                    _ => None,

                }

            }
        }


    }
}

implement_results_mobility!{
    traveld_dist_car__M__m_per_a,
    cars_grant__M__eur_per_a,
    bev_elec_nrg_dmd__G__W_h_per_a,
    bev_elec_nrg_price__G__W_h_per_a,
    cars_fuel_dmd__M__L_per_a,
    cars_fuel_costs__M__eur_per_a,
    bev_nrg_costs__M__eur_per_a,
    cars_ems__k__to_coe_per_a
}


#[cfg(test)]
pub mod tests{
    extern crate wasm_bindgen_test;
    pub mod mobility_test_case;
    mod compare_with_excel;
}
