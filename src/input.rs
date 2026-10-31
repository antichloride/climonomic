use serde::{Serialize, Serializer};

pub struct Input{
    pub id: String,
    base_values: Vec<f64>,
    values: Vec<f64>,
    pub measures: Vec<Measure>,
    start_year: u32,
    end_year: u32,
}

impl Serialize for Input {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.values.serialize(serializer)
    }
}

impl Input{

    pub fn new(id: String, start_year: u32, end_year: u32) -> Input{
        let len = (end_year - start_year + 1) as usize;
        return Input{
            id: id,
            base_values: vec![0.0; len],
            values: vec![0.0; len],
            measures: Vec::from([]),
            start_year: start_year,
            end_year: end_year,
        }
    }

    pub fn get_year(&self, year: u32) -> f64{
        if year < self.start_year || year > self.end_year {
            return 0.0;
        }
        return self.values[(year-self.start_year) as usize];
    }

    pub fn apply_measures(&mut self) {
        self.values = self.base_values.clone();
        let mut cumulative_delta = 0.0;
        for year_index in 1..(self.end_year - self.start_year + 1) {
            let current_year = year_index + self.start_year;
            for measure in &self.measures {
                cumulative_delta += measure.delta_per_year(current_year);
            }
            self.values[year_index as usize] += cumulative_delta;
        }
    }

    pub fn set_values(&mut self, value: f64){
        self.base_values = vec![value; (self.end_year-self.start_year+1) as usize];
        self.apply_measures();
    }

    pub fn set_custom_values(&mut self, values: &[f64]) -> Result<(), String> {
        let expected_len = (self.end_year - self.start_year + 1) as usize;
        if values.len() != expected_len {
            return Err(format!(
                "Expected {} values for years {}..={}, got {}",
                expected_len, self.start_year, self.end_year, values.len()
            ));
        }
        self.base_values = values.to_vec();
        self.apply_measures();
        Ok(())
    }

    pub fn get_value(& self) -> f64{
        return self.values[0];
    }

    pub fn get_values(& self) -> &Vec<f64>{
        return & self.values;
    }

    pub fn add_measure(&mut self, id: &str, start_year: u32, end_year: u32, delta: f64){
        self.measures.push(Measure{
            id: (self.id.to_owned()+"/"+id).to_string(),
            start_year: start_year,
            end_year: end_year,
            delta: delta,
        });
        self.apply_measures();
    }

    fn get_measure_by_id(&mut self, measure_id: &str) -> Option<&mut Measure>{
        let full_id = format!("{}/{}", self.id, measure_id);
        self.measures.iter_mut().find(|m| m.id == measure_id || m.id == full_id)
    }

    pub fn update_measure(&mut self, measure_id: &str, start_year: u32, end_year: u32, delta: f64){
        let res = self.get_measure_by_id(measure_id);
        match res{
            Some(measure) => {
                measure.update(start_year, end_year, delta);
            },
            None => (),
        }
        self.apply_measures();
    }

    fn get_measure_index_by_id(&self, measure_id: &str) -> Option<usize>{
        let full_id = format!("{}/{}", self.id, measure_id);
        self.measures.iter().position(|m| m.id == measure_id || m.id == full_id)
    }

    pub fn delete_measure(&mut self, measure_id: &str){
        let res = self.get_measure_index_by_id(measure_id);
        match res{
            Some(index) => {
                self.measures.remove(index);
            },
            None => (),
        }
        self.apply_measures();
    }

    pub fn list_measure_ids(&self) -> Vec<&String>{
        return self.measures.iter().map(|a| &a.id).collect();
    }

}

pub struct Measure {
    pub id: String,
    pub start_year: u32,
    pub end_year: u32,
    pub delta: f64,
}

impl Measure{

    pub fn delta_per_year(&self, year: u32) -> f64{
        // start_year is the first year in which the measure is applied
        // end_year is the last year in which the measure is applied
        // the target delta is reached at the end of the end_year
        if year < self.start_year || year > self.end_year{
            return 0.0;
        }
        return self.delta / (self.start_year as f64 - self.end_year as f64 - 1.0)
    }

    pub fn update(&mut self, start_year: u32, end_year: u32, delta: f64){
        self.start_year = start_year;
        self.end_year = end_year;
        self.delta = delta;
    }

}

pub trait InputFields{
    fn get_inputs(& self) -> Vec<&Input>;
    fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>;
}


#[cfg(test)]
mod tests{
    use crate::input::Input;

    #[test]
    fn test_get_year() {
        let mut input = Input::new("test".to_string(), 2023, 2025);
        assert!(input.get_year(2023)==0.0);
        assert!(input.get_year(2024)==0.0);
        assert!(input.get_year(2025)==0.0);
        input.set_values(10.0);
        assert!(input.get_year(2023)==10.0);
        assert!(input.get_year(2024)==10.0);
        assert!(input.get_year(2025)==10.0);
        input.add_measure(&"measure".to_string(), 2024, 2025, 10.0);
        assert!(input.get_year(2023)==10.0);
        assert!(input.get_year(2024)==5.0);
        assert!(input.get_year(2025)==0.0);
    }

    #[test]
    fn test_delete_measure() {
        let mut input = Input::new("buildings/inputs/heat_dmd".to_string(), 2023, 2025);
        input.set_values(10.0);
        input.add_measure("measure", 2024, 2025, 10.0);
        assert_eq!(input.measures.len(), 1);
        assert_eq!(input.get_year(2025), 0.0);

        // Test deleting by short ID
        input.delete_measure("measure");
        assert_eq!(input.measures.len(), 0);
        assert_eq!(input.get_year(2025), 10.0);

        // Test deleting by full ID
        input.add_measure("measure2", 2024, 2025, 10.0);
        assert_eq!(input.measures.len(), 1);
        input.delete_measure("buildings/inputs/heat_dmd/measure2");
        assert_eq!(input.measures.len(), 0);
        assert_eq!(input.get_year(2025), 10.0);
    }

    #[test]
    fn test_set_custom_values() {
        let mut input = Input::new("test".to_string(), 2022, 2025);
        let trajectory = vec![0.80, 0.85, 0.95, 1.10];
        assert!(input.set_custom_values(&trajectory).is_ok());
        assert_eq!(input.get_year(2022), 0.80);
        assert_eq!(input.get_year(2023), 0.85);
        assert_eq!(input.get_year(2024), 0.95);
        assert_eq!(input.get_year(2025), 1.10);

        // Invalid length
        assert!(input.set_custom_values(&[0.80, 0.85]).is_err());

        // With measure on top of custom trajectory
        // measure from 2024 to 2025 with delta 1.0 -> -0.5 per year
        input.add_measure("policy", 2024, 2025, 1.0);
        assert_eq!(input.get_year(2022), 0.80);
        assert_eq!(input.get_year(2023), 0.85);
        assert_eq!(input.get_year(2024), 0.95 - 0.5);
        assert_eq!(input.get_year(2025), 1.10 - 1.0);
    }
}
