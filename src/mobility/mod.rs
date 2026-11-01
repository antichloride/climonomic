#![allow(non_snake_case)]

pub mod types;
mod calculate;

pub use types::*;

use crate::input::Input;
use crate::input::InputFields;
use crate::result::Results;
use crate::sectors::SectorsResult;

pub struct Mobility {
    pub inputs: InputsMobility,
    pub results: ResultsMobility,
    start_year: u32,
}

impl Mobility {
    pub fn new(start_year: u32, end_year: u32) -> Mobility {
        Mobility {
            inputs: InputsMobility::new("mobility/inputs", start_year, end_year),
            results: ResultsMobility::new("mobility/results", start_year, end_year),
            start_year,
        }
    }

    pub fn get_inputs(&self) -> Vec<&Input> {
        self.inputs.get_inputs()
    }

    pub fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input> {
        self.inputs.get_input_by_id(id)
    }

    pub fn get_results(&self) -> Vec<&Results> {
        self.results.get_results()
    }

    pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results> {
        self.results.get_results_by_id(id)
    }
}

// Getters for cross-sector calculations
#[allow(dead_code)]
impl Mobility {
    pub fn bev_elec_nrg_dmd__G__W_h_per_a(&self) -> &SectorsResult {
        &self.results.bev_elec_nrg_dmd__G__W_h_per_a
    }
    pub fn sl_nrg_dmd__G__W_h_per_a(&self) -> &Results {
        &self.results.sl_nrg_dmd__G__W_h_per_a
    }
    pub fn bev_nrg_costs__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.bev_nrg_costs__M__eur_per_a
    }
    pub fn cars_fuel_costs__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.cars_fuel_costs__M__eur_per_a
    }
    pub fn cars_grant__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.cars_grant__M__eur_per_a
    }
    pub fn cars_ems__k__to_coe_per_a(&self) -> &SectorsResult {
        &self.results.cars_ems__k__to_coe_per_a
    }
}

#[cfg(test)]
pub mod tests {
    extern crate wasm_bindgen_test;
    pub mod mobility_test_case;
}
