#![allow(non_snake_case)]

pub mod types;
mod calculate;

pub use types::*;

use crate::input::Input;
use crate::input::InputFields;
use crate::result::Results;
use crate::sectors::SectorsResult;

pub struct Energy {
    pub inputs: InputsEnergy,
    pub results: ResultsEnergy,
    start_year: u32,
}

impl Energy {
    pub fn new(start_year: u32, end_year: u32) -> Energy {
        Energy {
            inputs: InputsEnergy::new("energy/inputs", start_year, end_year),
            results: ResultsEnergy::new("energy/results", start_year, end_year),
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

    pub fn feed_in_total__G__W_h_per_a(&self) -> &Results {
        &self.results.feed_in_total__G__W_h_per_a
    }

    pub fn feed_in_ems_avoided__k__to_coe_per_a(&self) -> &Results {
        &self.results.feed_in_ems_avoided__k__to_coe_per_a
    }
}

// Getters for cross-sector calculations
impl Energy {
    pub fn nrg_own_mix_price__m__eur_per_W_h(&self) -> &SectorsResult {
        &self.results.nrg_own_mix_price__m__eur_per_W_h
    }
    pub fn sol_rf_invest__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_rf_invest__M__eur_per_a
    }
    pub fn sol_os_invest__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_os_invest__M__eur_per_a
    }
    pub fn wind_invest__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.wind_invest__M__eur_per_a
    }
    pub fn sol_rf_grant__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_rf_grant__M__eur_per_a
    }
    pub fn sol_os_grant__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_os_grant__M__eur_per_a
    }
    pub fn wind_grant__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.wind_grant__M__eur_per_a
    }
    pub fn sol_rf_om__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_rf_om__M__eur_per_a
    }
    pub fn sol_os_om__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_os_om__M__eur_per_a
    }
    pub fn sol_rf_revenue__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_rf_revenue__M__eur_per_a
    }
    pub fn sol_os_revenue__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.sol_os_revenue__M__eur_per_a
    }
    pub fn wind_revenue__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.wind_revenue__M__eur_per_a
    }
    pub fn prchsd_renewable_nrg__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.prchsd_renewable_nrg__M__eur_per_a
    }
    pub fn prchsd_nrg_mix_costs__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.prchsd_nrg_mix_costs__M__eur_per_a
    }
    pub fn prchsd_nrg_mix_ems__k__to_coe_per_a(&self) -> &SectorsResult {
        &self.results.prchsd_nrg_mix_ems__k__to_coe_per_a
    }
}

#[cfg(test)]
pub mod tests {
    extern crate wasm_bindgen_test;
    pub mod energy_test_case;
}
