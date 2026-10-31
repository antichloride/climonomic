use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;
use serde::{Serialize, Deserialize};

mod buildings;
use buildings::Buildings;
mod energy;
use energy::Energy;
mod mobility;
use mobility::Mobility;
mod input;
mod result;
use result::Results;
use input::Input;
mod sectors;
mod constants;
mod economy;
use economy::Economy;
mod stakeholders;
use stakeholders::Stakeholders;

#[cfg(test)]
#[macro_use]
extern crate approx;

#[wasm_bindgen]
pub struct Calculator {
    pub(crate) buildings: Buildings,
    pub(crate) mobility: Mobility,
    pub(crate) energy: Energy,
    pub(crate) economy: Economy,
    pub(crate) stakeholders: Stakeholders,
    pub start_year: u32,
    pub end_year: u32,
}


/// This struct serves as interface for the WebAssembly bridge.
///
/// The procedure works as follows:
/// 1. Initialize the calculator using the "new" function.
/// 2. Fill the input parameters using "set_input".
/// 3. Add measures using "new_measure".
/// 4. Trigger the calculation using "calculate_over_years".
/// 5. Get result values (list with one value per year) using "get_results".
///
#[wasm_bindgen]
impl Calculator{
    /// A calculator is initialized by defining the year range. Note that
    /// start and end year are included. All input parameters will be
    /// initialized as zero.
    pub fn new(start_year: u32, end_year: u32) -> Calculator {
        Calculator {
            buildings: Buildings::new(start_year, end_year),
            mobility: Mobility::new(start_year, end_year),
            energy: Energy::new(start_year, end_year),
            economy: Economy::new(start_year, end_year),
            stakeholders: Stakeholders::new(start_year, end_year),
            start_year,
            end_year,
        }
    }

    /// This function serves to trigger the calculation process.
    pub fn calculate_over_years(&mut self){
        for year in self.start_year..=self.end_year {
            self.calculate_first_stage(year);
            self.calculate_second_stage(year);
            self.calculate_emissions(year);
            self.economy.calculate(
                year,
                &self.buildings,
                &self.energy,
                &self.mobility,
            );
            self.stakeholders.calculate(
                year,
                &self.buildings,
                &self.energy,
                &self.mobility,
                &self.economy,
            )
        }
    }

    fn calculate_first_stage(&mut self, year:u32){
        self.buildings.calculate(year);
        self.mobility.calculate(year);
        self.energy.calculate(year);
    }

    fn calculate_second_stage(&mut self, year:u32){
        self.energy.calculate_second_stage(
            year,
            self.buildings.elec_dmd__G__W_h_per_a().get_year(year),
            self.buildings.cnsmp_elec_heat_pump__G__W_h_per_a().get_year(year),
            self.mobility.bev_elec_nrg_dmd__G__W_h_per_a().get_year(year),
            self.mobility.sl_nrg_dmd__G__W_h_per_a().get_year(year),
        );
        self.mobility.calculate_second_stage(
            year,
            self.energy.nrg_own_mix_price__m__eur_per_W_h().get_year(year),
        );
        self.buildings.calculate_second_stage(
            year,
            &self.energy.nrg_own_mix_price__m__eur_per_W_h()
        );
    }

    fn calculate_emissions(&mut self, year: u32){
        self.energy.calculate_emissions(year);
        self.buildings.calculate_emissions(year);
        self.mobility.calculate_emissions(year);
    }

    fn get_inputs(&self) -> Vec<&Input> {
        let mut list: Vec<&Input> = Vec::from([]);
        list.extend(self.buildings.get_inputs());
        list.extend(self.mobility.get_inputs());
        list.extend(self.energy.get_inputs());
        return list;
    }

    /// Returns the ids of all input parameters.
    pub fn list_input_ids(&self) -> Vec<String> {
        self.get_inputs().iter().map(|&a| a.id.clone()).collect()
    }

    fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input> {
        let (domain, rest) = id.split_once('/')?;
        let (_, remaining_id) = rest.split_once('/')?;

        match domain {
            "buildings" => self.buildings.get_input_by_id(remaining_id),
            "mobility" => self.mobility.get_input_by_id(remaining_id),
            "energy" => self.energy.get_input_by_id(remaining_id),
            _ => None,
        }
    }

    pub fn get_input_values(&mut self, id: &str) -> Result<Vec<f64>, JsError> {
        self.get_input_by_id(id)
            .map(|input| input.get_values().clone())
            .ok_or_else(|| JsError::new(&format!("Input ID not found: '{id}'")))
    }

    /// This function serves to populate the input parameters.
    ///
    /// Note that "set input" sets the start year baseline of an input parameter.
    pub fn set_input(&mut self, id: &str, value: f64) -> Result<(), JsError> {
        match self.get_input_by_id(id) {
            Some(input) => {
                input.set_values(value);
                Ok(())
            }
            None => Err(JsError::new(&format!("Input ID not found: '{id}'"))),
        }
    }

    /// This function returns the start year value of an input parameter.
    pub fn get_input(&mut self, id: &str) -> Result<f64, JsError> {
        match self.get_input_by_id(id) {
            Some(input) => Ok(input.get_value()),
            None => Err(JsError::new(&format!("Input ID not found: '{id}'"))),
        }
    }

    fn get_results_list(&self) -> Vec<&Results> {
        let mut list: Vec<&Results> = Vec::from([]);
        list.extend(self.buildings.get_results());
        list.extend(self.mobility.get_results());
        list.extend(self.energy.get_results());
        list.extend(self.economy.get_results());
        list.extend(self.stakeholders.get_results());
        return list;
    }

    /// Returns the ids of all results.
    pub fn list_result_ids(&self) -> Vec<String> {
        self.get_results_list().iter().map(|&a| a.id.clone()).collect()
    }

    fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results> {
        let (domain, rest) = id.split_once('/')?;
        let (_, remaining_id) = rest.split_once('/')?;

        match domain {
            "buildings" => self.buildings.get_results_by_id(remaining_id),
            "mobility" => self.mobility.get_results_by_id(remaining_id),
            "energy" => self.energy.get_results_by_id(remaining_id),
            "economy" => self.economy.get_results_by_id(remaining_id),
            "stakeholders" => self.stakeholders.get_results_by_id(remaining_id),
            _ => None,
        }
    }

    /// Get a list of values (for each year) in a result.
    pub fn get_results(&mut self, id: &str) -> Result<Vec<f64>, JsError> {
        self.get_results_by_id(id)
            .map(|results| results.get_values().clone())
            .ok_or_else(|| JsError::new(&format!("Result ID not found: '{id}'")))
    }

    /// Add a new measure to an input (given by an input id).
    /// start and end year defines the year range for which the measure applies.
    ///
    /// Note that start year is included.
    ///
    /// The delta defines by how much the input parameter is changed over the given range of years.
    /// The change is applied linearly.
    pub fn new_measure(
        &mut self,
        id: &str,
        input_id: &str,
        start_year: u32,
        end_year: u32,
        delta: f64,
    ) -> Result<(), JsError> {
        match self.get_input_by_id(input_id) {
            Some(input) => {
                input.add_measure(id, start_year, end_year, delta);
                Ok(())
            }
            None => Err(JsError::new(&format!("Input ID not found: '{input_id}'"))),
        }
    }

    /// For changing the start_year, end_year or delta of a given measure.
    /// Note that even if one of them does not change, all must be given.
    pub fn update_measure(
        &mut self,
        id: &str,
        input_id: &str,
        start_year: u32,
        end_year: u32,
        delta: f64,
    ) -> Result<(), JsError> {
        match self.get_input_by_id(input_id) {
            Some(input) => {
                input.update_measure(id, start_year, end_year, delta);
                Ok(())
            }
            None => Err(JsError::new(&format!("Input ID not found: '{input_id}'"))),
        }
    }

    /// Deleting a measure. Note that this updates the values of the
    /// corresponding input.
    pub fn delete_measure(
        &mut self,
        id: &str,
        input_id: &str,
    ) -> Result<(), JsError> {
        match self.get_input_by_id(input_id) {
            Some(input) => {
                input.delete_measure(id);
                Ok(())
            }
            None => Err(JsError::new(&format!("Input ID not found: '{input_id}'"))),
        }
    }

    /// List all measure ids that are present in the current calculator.
    pub fn list_measure_ids(&self) -> Vec<String> {
        let mut list = Vec::new();
        for input in self.get_inputs() {
            for id in input.list_measure_ids() {
                list.push(id.clone());
            }
        }
        list
    }

    /// Returns all calculated simulation results across all domains and sectors
    /// as a single, hierarchical JavaScript object.
    pub fn get_results_object(&self) -> Result<JsValue, JsError> {
        let results = SimulationResults {
            start_year: self.start_year,
            end_year: self.end_year,
            buildings: &self.buildings.results,
            energy: &self.energy.results,
            mobility: &self.mobility.results,
            economy: &self.economy,
            stakeholders: &self.stakeholders,
        };
        to_value(&results).map_err(|e| JsError::new(&e.to_string()))
    }

    /// Returns the full input parameter configuration across all domains and sectors
    /// as a single, hierarchical JavaScript object.
    pub fn get_inputs_object(&self) -> Result<JsValue, JsError> {
        let inputs = SimulationInputs {
            start_year: self.start_year,
            end_year: self.end_year,
            buildings: &self.buildings.inputs,
            energy: &self.energy.inputs,
            mobility: &self.mobility.inputs,
        };
        to_value(&inputs).map_err(|e| JsError::new(&e.to_string()))
    }

    /// Set input parameters in bulk using a nested JavaScript object.
    /// Example: { buildings: { n_buildings: { private: 44000.0 }, price_oil__eur_per_L: 0.82 } }
    pub fn set_inputs(&mut self, inputs: JsValue) -> Result<(), JsError> {
        let val: serde_json::Value = serde_wasm_bindgen::from_value(inputs)
            .map_err(|e| JsError::new(&format!("Invalid inputs object: {e}")))?;
        apply_json_inputs(self, &val)
    }

    /// Set input parameters in bulk using a JSON string.
    pub fn set_inputs_json(&mut self, json_str: &str) -> Result<(), JsError> {
        let val: serde_json::Value = serde_json::from_str(json_str)
            .map_err(|e| JsError::new(&format!("Invalid JSON: {e}")))?;
        apply_json_inputs(self, &val)
    }

    /// Add multiple measures in bulk using an array of measure objects:
    /// [{ id: "pv_exp", inputId: "energy/inputs/sol_rf_installed__M__Wp/private", startYear: 2024, endYear: 2035, delta: -20.0 }]
    pub fn add_measures(&mut self, measures: JsValue) -> Result<(), JsError> {
        let configs: Vec<MeasureConfig> = serde_wasm_bindgen::from_value(measures)
            .map_err(|e| JsError::new(&format!("Invalid measure configuration: {e}")))?;
        for m in configs {
            self.new_measure(&m.id, &m.input_id, m.start_year, m.end_year, m.delta)?;
        }
        Ok(())
    }
}

#[derive(Serialize)]
struct SimulationResults<'a> {
    pub start_year: u32,
    pub end_year: u32,
    pub buildings: &'a buildings::ResultsBuildings,
    pub energy: &'a energy::ResultsEnergy,
    pub mobility: &'a mobility::ResultsMobility,
    pub economy: &'a economy::Economy,
    pub stakeholders: &'a stakeholders::Stakeholders,
}

#[derive(Serialize)]
struct SimulationInputs<'a> {
    pub start_year: u32,
    pub end_year: u32,
    pub buildings: &'a buildings::InputsBuildings,
    pub energy: &'a energy::InputsEnergy,
    pub mobility: &'a mobility::InputsMobility,
}

#[derive(Deserialize)]
struct MeasureConfig {
    pub id: String,
    #[serde(alias = "inputId", alias = "input_id")]
    pub input_id: String,
    #[serde(alias = "startYear", alias = "start_year")]
    pub start_year: u32,
    #[serde(alias = "endYear", alias = "end_year")]
    pub end_year: u32,
    pub delta: f64,
}

fn apply_json_inputs(calc: &mut Calculator, val: &serde_json::Value) -> Result<(), JsError> {
    if let serde_json::Value::Object(domains) = val {
        for (domain_name, domain_val) in domains {
            let vars_obj = if let serde_json::Value::Object(inner) = domain_val {
                if let Some(inputs_val) = inner.get("inputs") {
                    inputs_val
                } else {
                    domain_val
                }
            } else {
                domain_val
            };

            if let serde_json::Value::Object(vars) = vars_obj {
                for (var_name, var_val) in vars {
                    match var_val {
                        serde_json::Value::Number(num) => {
                            if let Some(f) = num.as_f64() {
                                let id = format!("{domain_name}/inputs/{var_name}");
                                calc.set_input(&id, f)?;
                            }
                        }
                        serde_json::Value::Object(sectors) => {
                            for (sector_name, sector_val) in sectors {
                                if let Some(f) = sector_val.as_f64() {
                                    let id = format!("{domain_name}/inputs/{var_name}/{sector_name}");
                                    calc.set_input(&id, f)?;
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }
    Ok(())
}


#[cfg(test)]
mod integration_tests{
    use super::*;
    extern crate wasm_bindgen_test;
    use wasm_bindgen_test::*;
    wasm_bindgen_test_configure!(run_in_browser);
    use crate::buildings::tests::buildings_test_case::create_buildings;
    use crate::energy::tests::energy_test_case::create_energy;
    use crate::mobility::tests::mobility_test_case::create_mobility;
    use web_sys::console;

    #[wasm_bindgen_test]
    fn test_calculator(){
        let start_year: u32 = 2022 as u32;
        let end_year: u32 = 2045 as u32;
        let buildings = create_buildings(start_year, end_year);
        let energy = create_energy(start_year, end_year);
        let mobility = create_mobility(start_year, end_year);
        let mut calculator = Calculator::new(start_year, end_year);
        calculator.buildings = buildings;
        calculator.energy = energy;
        calculator.mobility = mobility;
        calculator.calculate_over_years();
        console::log_1(&to_value(&calculator.list_result_ids()).unwrap());
        console::log_1(&to_value(&calculator.get_results("economy/results/invest_heating_material").unwrap()).unwrap());
        console::log_1(&to_value(&calculator.economy.invest_heating_material.values).unwrap());
        console::log_1(&to_value(&calculator.get_results("buildings/results/floor_A__k__m2/private").unwrap()).unwrap());
        console::log_1(&to_value(&calculator.buildings.results.floor_A__k__m2.private.values).unwrap());
    }
}

#[cfg(test)]
mod unit_tests{
    use super::*;

    #[test]
    fn test_calculator_get_results_by_id() {
        let mut calculator: Calculator = Calculator::new(2022, 2025);
        assert!(!calculator.get_results_by_id("buildings/results/floor_A__k__m2/private").is_none());
        assert!(!calculator.get_results_by_id("economy/results/invest_heating_material").is_none());
    }

    #[test]
    fn test_calculator_error_handling() {
        let mut calculator: Calculator = Calculator::new(2022, 2025);
        assert!(calculator.get_results("non_existent_id").is_err());
        assert!(calculator.get_input("invalid/input/path").is_err());
        assert!(calculator.set_input("invalid/input/path", 12.0).is_err());
        assert!(calculator.new_measure("m1", "invalid/path", 2023, 2024, 1.0).is_err());
    }

    #[test]
    fn test_set_inputs_json() {
        let mut calculator = Calculator::new(2022, 2025);
        let config = r#"{
            "buildings": {
                "n_buildings": {
                    "private": 44000.0,
                    "industry": 5180.0
                },
                "price_oil__eur_per_L": 0.85
            },
            "energy": {
                "sol_rf_installed__M__Wp": {
                    "private": 36.26
                }
            }
        }"#;
        assert!(calculator.set_inputs_json(config).is_ok());
        assert_eq!(calculator.get_input("buildings/inputs/n_buildings/private").unwrap(), 44000.0);
        assert_eq!(calculator.get_input("buildings/inputs/n_buildings/industry").unwrap(), 5180.0);
        assert_eq!(calculator.get_input("buildings/inputs/price_oil__eur_per_L").unwrap(), 0.85);
        assert_eq!(calculator.get_input("energy/inputs/sol_rf_installed__M__Wp/private").unwrap(), 36.26);
    }

    #[test]
    fn test_calculator_results_object_serialization() {
        let mut calculator = Calculator::new(2022, 2025);
        calculator.calculate_over_years();
        let results = SimulationResults {
            start_year: calculator.start_year,
            end_year: calculator.end_year,
            buildings: &calculator.buildings.results,
            energy: &calculator.energy.results,
            mobility: &calculator.mobility.results,
            economy: &calculator.economy,
            stakeholders: &calculator.stakeholders,
        };
        let json = serde_json::to_string(&results).unwrap();
        assert!(json.contains("buildings"));
        assert!(json.contains("floor_A__k__m2"));
        assert!(json.contains("economy"));
        assert!(json.contains("invest_heating_material"));
        assert!(json.contains("stakeholders"));
    }
}


