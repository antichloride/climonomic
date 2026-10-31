
pub struct Results{
    pub id: String,
    pub values: Vec<f64>,
    start_year: u32,
}

impl Results{

    pub fn new(id: String, start_year: u32, end_year: u32) -> Results{
        return Results{
            id: id,
            values: vec![0.0; (end_year-start_year+1) as usize],
            start_year: start_year,
        }
    }

    pub fn get_year(&self, year: u32) -> f64{
        if year < self.start_year || (year - self.start_year) as usize >= self.values.len() {
            return 0.0;
        }
        return self.values[(year-self.start_year) as usize];
    }

    pub fn sum_years(&self, start_year: u32, end_year: u32) -> f64{
        let start_idx = (start_year.saturating_sub(self.start_year)) as usize;
        let end_idx = ((end_year.saturating_sub(self.start_year) + 1) as usize).min(self.values.len());
        if start_idx >= self.values.len() || start_idx >= end_idx {
            return 0.0;
        }
        return self.values[start_idx..end_idx].iter().sum();
    }

    pub fn set_year_value(&mut self, year: u32, value: f64){
        if year >= self.start_year {
            let year_index = (year - self.start_year) as usize;
            if year_index < self.values.len() {
                self.values[year_index] = value;
            }
        }
    }

    pub fn get_values(& self) -> &Vec<f64>{
        return & self.values;
    }
}

