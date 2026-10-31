pub struct Input{
    pub id: String,
    values: Vec<f64>,
    pub measures: Vec<Measure>,
    start_year: u32,
    end_year: u32,
}

impl Input{

    pub fn new(id: String, start_year: u32, end_year: u32) -> Input{
        return Input{
            id: id,
            values: vec![0.0; (end_year-start_year+1) as usize],
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
        for year_index in 1..(self.end_year-self.start_year+1) {
            self.values[year_index as usize] =
                self.values[(year_index - 1) as usize];
            for measure in &self.measures {
                self.values[year_index as usize] +=
                   measure.delta_per_year(year_index + self.start_year);
            }
        }
    }

    pub fn set_values(&mut self, value: f64){
        self.values = vec![value; (self.end_year-self.start_year+1) as usize];
        self.apply_measures();
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
}
