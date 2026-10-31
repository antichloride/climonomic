#![allow(non_snake_case)]

pub mod types;
mod calculate;

pub use types::*;

use crate::input::Input;
use crate::input::InputFields;
use crate::result::Results;
use crate::sectors::SectorsResult;

pub struct Buildings {
    pub inputs: InputsBuildings,
    pub results: ResultsBuildings,
    start_year: u32,
}

impl Buildings {
    pub fn new(start_year: u32, end_year: u32) -> Buildings {
        Buildings {
            inputs: InputsBuildings::new("buildings/inputs", start_year, end_year),
            results: ResultsBuildings::new("buildings/results", start_year, end_year),
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
impl Buildings {
    pub fn elec_dmd__G__W_h_per_a(&self) -> &SectorsResult {
        &self.results.elec_dmd__G__W_h_per_a
    }
    pub fn cnsmp_elec_heat_pump__G__W_h_per_a(&self) -> &SectorsResult {
        &self.results.cnsmp_elec_heat_pump__G__W_h_per_a
    }
    pub fn invest_heat_sources__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.invest_heat_sources__M__eur_per_a
    }
    pub fn invest_energetic_renovation__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.invest_energetic_renovation__M__eur_per_a
    }
    pub fn grant_heat_sources__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.grant_heat_sources__M__eur_per_a
    }
    pub fn grant_energetic_renovation__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.grant_energetic_renovation__M__eur_per_a
    }
    pub fn costs_oil__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.costs_oil__M__eur_per_a
    }
    pub fn costs_gas__M__eur_per_a(&self) -> &SectorsResult {
        &self.results.costs_gas__M__eur_per_a
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;
    extern crate wasm_bindgen_test;
    pub mod buildings_test_case;
    mod compare_with_excel;

    #[test]
    fn test_buildings_get_results_by_id() {
        let mut buildings: Buildings = Buildings::new(2022, 2025);
        assert!(buildings.get_results_by_id("floor_A__k__m2/private").is_some());
    }

    #[test]
    fn test_results_buildings_get_results_by_id() {
        let mut results_buildings: ResultsBuildings =
            ResultsBuildings::new("buildings/results", 2022, 2025);
        assert!(results_buildings
            .get_results_by_id("floor_A__k__m2/private")
            .is_some());
    }
}
