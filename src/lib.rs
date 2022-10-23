use wasm_bindgen::prelude::*;
use std::ops;

mod buildings;
use buildings::Buildings;
mod input;
mod result;
use result::Results;
use input::Input;
mod sectors;
use sectors::SectorsInputs;
mod constants;

#[wasm_bindgen]
pub struct Calculator {
    buildings: Buildings,
    pub start_year: u32,
    pub end_year: u32,
}


#[wasm_bindgen]
impl Calculator{
    pub fn new(start_year: u32, end_year: u32) -> Calculator {
        let calculator = Calculator {
            buildings: Buildings::new(start_year, end_year),
            start_year: start_year,
            end_year: end_year,
        };
        return calculator;
    }

    pub fn calculate_over_years(&mut self){
        for year in self.start_year..self.end_year + 1{
            self.buildings.calculate(year);
        }
    }

    fn get_inputs(&self) -> Vec<&Input> {
        return self.buildings.get_inputs();
    }

    pub fn list_input_ids(&self) -> JsValue{
        let vec: Vec<_> = self.get_inputs().iter().map(|&a| &a.id).collect();
        return JsValue::from_serde(&vec).unwrap();
    }

    fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
        let binding = id.to_string();
        let splitted_id: Vec<&str> = binding.split("/").collect();
        let binding_b = &splitted_id[2..].join("/");
        let remaining_id = binding_b.as_str();

        match splitted_id[0]{
            "buildings" => self.buildings.get_input_by_id(&remaining_id),
            _ => None,
        }
    }

    pub fn set_input(&mut self, id: &str, value: f32){
        let res = self.get_input_by_id(id);
        match res{
            Some(input) => {
                input.set_values(value);
            },
            None => (),
        }

    }

    pub fn get_input(&mut self, id: &str) -> Option<f32>{
        let res = self.get_input_by_id(id);
        match res{
            Some(input) => {
                return Some(input.get_value());
            },
            None => None,
        }

    }

    fn get_results_list(&self) -> Vec<&Results> {
        return self.buildings.get_results();
    }

    pub fn list_result_ids(&self) -> JsValue{
        let vec: Vec<_> = self.get_results_list().iter().map(|&a| &a.id).collect();
        return JsValue::from_serde(&vec).unwrap();
    }

    fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
        let binding = id.to_string();
        let splitted_id: Vec<&str> = binding.split("/").collect();
        let binding_b = &splitted_id[2..].join("/");
        let remaining_id = binding_b.as_str();

        match splitted_id[0]{
            "buildings" => self.buildings.get_results_by_id(&remaining_id),
            _ => None,
        }
    }


    pub fn get_results(&mut self, id: &str) -> Vec<f32>{
        let res = self.get_results_by_id(id);
        match res{
            Some(results) => {
                return results.get_values().clone();
            },
            None => Vec::from([]),
        }

    }

    pub fn new_measure(
        &mut self,
        id: &str,
        input_id: &str,
        start_year: u32,
        end_year: u32,
        delta: f32,
        ){
        let res = self.get_input_by_id(input_id);
        match res{
            Some(input) => {
                input.add_measure(id, start_year, end_year, delta);
            },
            None => (),
        }
    }

    pub fn update_measure(
        &mut self,
        id: &str,
        input_id: &str,
        start_year: u32,
        end_year: u32,
        delta: f32,
        ){
        let res = self.get_input_by_id(input_id);
        match res{
            Some(input) => {
                input.update_measure(id, start_year, end_year, delta);
            },
            None => (),
        }

    }

    pub fn delete_measure(
        &mut self,
        id: &str,
        input_id: &str,
        ){
        let res = self.get_input_by_id(input_id);
        match res{
            Some(input) => {
                input.delete_measure(id);
            },
            None => (),
        }
    }

    pub fn list_measure_ids(&self) -> JsValue{
        let vec: Vec<_> = self.get_inputs().iter().map(|&a| a.list_measure_ids()).collect();
        return JsValue::from_serde(&vec).unwrap();
    }
}


