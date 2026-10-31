#![allow(non_snake_case)]

use crate::result::Results;
// use crate::buildings::ResultsBuildings;
// use crate::energy::ResultsEnergy;
// use crate::mobility::ResultsMobility;
use crate::constants::economy as constants;
use crate::constants::energy as constants_energy;
//use crate::sectors::SectorsResult;
use crate::energy::Energy;
use crate::buildings::Buildings;
use crate::mobility::Mobility;

macro_rules! implement_economy{
    ($($field:ident),*) => {

        #[derive(serde::Serialize)]
        pub struct Economy{
            #[serde(skip)]
            start_year: u32,
            $(
                pub $field: Results,
             )*
        }

        impl Economy{
            pub fn new(start_year: u32, end_year: u32) -> Economy {
                return Economy{
                    start_year: start_year,
                    $(
                        $field: Results::new("economy/results/".to_owned()+stringify!($field), start_year, end_year),
                     )*
                }
            }

            pub fn get_results(& self) -> Vec<&Results>{
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.push(&self.$field);
                 )*
                return results;
            }

            pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
                match id{
                    $(
                        stringify!($field)=> Some(&mut self.$field),
                     )*
                    _ => None,
                }
            }
        }
    }
}

implement_economy!{
    invest_heating_material,
    invest_heating_work,
    turnover_heating_crafting_local,
    turnover_heating_crafting_national,
    turnover_heating_production_national,
    invest_heat_demand_material,
    invest_heat_demand_work,
    turnover_heat_demand_crafting_local,
    turnover_heat_demand_crafting_national,
    turnover_heat_demand_production_national,
    invest_solar_roof_material,
    invest_solar_roof_work,
    maintenance_solar_roof_work,
    turnover_solar_roof_crafting_local,
    turnover_solar_roof_crafting_national,
    turnover_solar_roof_production_national,
    invest_solar_landscape_material,
    invest_solar_landscape_work,
    maintenance_solar_landscape_work,
    turnover_solar_landscape_crafting_local,
    turnover_solar_landscape_crafting_national,
    turnover_solar_landscape_production_national,
    n_jobs_crafting_local,
    n_jobs_crafting_national,
    n_jobs_production_national,
    income_local,
    income_national,
    income_tax_local,
    income_tax_national,
    turnover_local,
    revenue_local,
    turnover_national,
    turnover_tax_local,
    turnover_tax_national,
    business_tax_local,
    business_tax_national,
    corporate_tax_national,
    energy_tax_national
}


impl Economy{
    pub fn turnover_local__M__eur(&self) -> &Results{
        return &self.turnover_local;
    }
    pub fn income_tax_local__M__eur(&self) -> &Results{
        return &self.income_tax_local;
    }
    pub fn business_tax_local__M__eur(&self) -> &Results{
        return &self.business_tax_local;
    }
    pub fn income_tax_national__M__eur(&self) -> &Results{
        return &self.income_tax_national;
    }
    pub fn turnover_tax_national__M__eur(&self) -> &Results{
        return &self.turnover_tax_national;
    }
    pub fn business_tax_national__M__eur(&self) -> &Results{
        return &self.business_tax_national;
    }
    pub fn corporate_tax_national__M__eur(&self) -> &Results{
        return &self.corporate_tax_national;
    }
}


impl Economy{
    pub fn calculate(
        &mut self,
        year: u32,
        buildings: &Buildings,
        energy: &Energy,
        mobility: &Mobility,
    ){

        // heat
        let invest_heat_sources__M__eur_per_a =
            buildings.invest_heat_sources__M__eur_per_a().get_year(year).sum();

        let invest_heating_material = invest_heat_sources__M__eur_per_a *
            constants::material::invest_local::heating_heatpump;
        self.invest_heating_material
            .set_year_value(year, invest_heating_material);

        let invest_heating_work = invest_heat_sources__M__eur_per_a *
            (1.0 - constants::material::invest_local::heating_heatpump);
        self.invest_heating_work
            .set_year_value(year, invest_heating_work);

        let turnover_heating_crafting_local = invest_heating_work *
            constants::invest_work::loacal_value_add::heating_heatpump;
        self.turnover_heating_crafting_local
            .set_year_value(year, turnover_heating_crafting_local);

        let turnover_heating_crafting_national = invest_heating_work *
            constants::invest_work::national_added_value::heating_heatpump;
        self.turnover_heating_crafting_national
            .set_year_value(year, turnover_heating_crafting_national);

        let turnover_heating_production_national = invest_heating_material *
            constants::material::invest_national::heating_heatpump;
        self.turnover_heating_production_national
            .set_year_value(year, turnover_heating_production_national);


        // energetic renovation
        let invest_energetic_renovation__M__eur_per_a =
            buildings.invest_energetic_renovation__M__eur_per_a()
            .get_year(year).sum();

        let invest_heat_demand_material =
            invest_energetic_renovation__M__eur_per_a
            * constants::material::invest_local::energetic_restoration;
        self.invest_heat_demand_material
            .set_year_value(year, invest_heat_demand_material);

        let invest_heat_demand_work = invest_energetic_renovation__M__eur_per_a
            * (1.0 - constants::material::invest_local::energetic_restoration);
        self.invest_heat_demand_work
            .set_year_value(year, invest_heat_demand_work);

        let turnover_heat_demand_crafting_local = invest_heat_demand_work *
            constants::invest_work::loacal_value_add::energetic_restoration;
        self.turnover_heat_demand_crafting_local
            .set_year_value(year, turnover_heat_demand_crafting_local);

        let turnover_heat_demand_crafting_national = invest_heat_demand_work *
            constants::invest_work::national_added_value::energetic_restoration;
        self.turnover_heat_demand_crafting_national
            .set_year_value(year, turnover_heat_demand_crafting_national);

        let turnover_heat_demand_production_national =
            invest_heat_demand_material
            * constants::material::invest_national::heating_heatpump;
        self.turnover_heat_demand_production_national
            .set_year_value(year, turnover_heat_demand_production_national);


        // solar roof
        let sol_rf_invest__M__eur_per_a =
            energy.sol_rf_invest__M__eur_per_a().get_year(year).sum();

        let invest_solar_roof_material = sol_rf_invest__M__eur_per_a *
            constants::material::invest_local::solar_roof;
        self.invest_solar_roof_material
            .set_year_value(year, invest_solar_roof_material);

        let invest_solar_roof_work = sol_rf_invest__M__eur_per_a *
            (1.0 - constants::material::invest_local::solar_roof);
        self.invest_solar_roof_work
            .set_year_value(year, invest_solar_roof_work);

        let maintenance_solar_roof_work = energy.sol_rf_om__M__eur_per_a()
            .sum_years(self.start_year, year).sum();
        self.maintenance_solar_roof_work
            .set_year_value(year, maintenance_solar_roof_work);

        let turnover_solar_roof_crafting_local = invest_solar_roof_work *
            constants::invest_work::loacal_value_add::solar_roof;
        self.turnover_solar_roof_crafting_local
            .set_year_value(year, turnover_solar_roof_crafting_local);

        let turnover_solar_roof_crafting_national = invest_solar_roof_work *
            constants::invest_work::national_added_value::solar_roof;
        self.turnover_solar_roof_crafting_national
            .set_year_value(year, turnover_solar_roof_crafting_national);

        let turnover_solar_roof_production_national = invest_solar_roof_material *
            constants::material::invest_national::solar_roof;
        self.turnover_solar_roof_production_national
            .set_year_value(year, turnover_solar_roof_production_national);



        // solar landscape
        let sol_om_invest__M__eur_per_a =
            energy.sol_os_invest__M__eur_per_a().get_year(year).sum();

        let invest_solar_landscape_material = sol_om_invest__M__eur_per_a *
            constants::material::invest_local::solar_landscape;
        self.invest_solar_landscape_material
            .set_year_value(year, invest_solar_landscape_material);

        let invest_solar_landscape_work = sol_om_invest__M__eur_per_a *
            (1.0 - constants::material::invest_local::solar_landscape);
        self.invest_solar_landscape_work
            .set_year_value(year, invest_solar_landscape_work);

        let maintenance_solar_landscape_work = energy.sol_os_invest__M__eur_per_a()
            .sum_years(self.start_year, year).sum()
            * constants_energy::solar_landscape.operation_costs;
        self.maintenance_solar_landscape_work
            .set_year_value(year, maintenance_solar_landscape_work);

        let turnover_solar_landscape_crafting_local = maintenance_solar_landscape_work *
            constants::invest_work::loacal_value_add::solar_landscape;
        self.turnover_solar_landscape_crafting_local
            .set_year_value(year, turnover_solar_landscape_crafting_local);

        let turnover_solar_landscape_crafting_national = maintenance_solar_landscape_work *
            constants::invest_work::national_added_value::solar_landscape;
        self.turnover_solar_landscape_crafting_national
            .set_year_value(year, turnover_solar_landscape_crafting_national);

        let turnover_solar_landscape_production_national = invest_solar_landscape_work *
            constants::material::invest_national::solar_landscape;
        self.turnover_solar_landscape_production_national
            .set_year_value(year, turnover_solar_landscape_production_national);


        // jobs
        let n_jobs_crafting_local =
            &turnover_heating_crafting_local
            * constants::fte_per_million_turnover::work::heating_heatpump
            + &turnover_heat_demand_crafting_local
            * constants::fte_per_million_turnover::work::energetic_restoration
            + &turnover_solar_roof_crafting_local
            * constants::fte_per_million_turnover::work::solar_roof
            + &turnover_solar_landscape_crafting_local
            * constants::fte_per_million_turnover::work::solar_landscape;
        self.n_jobs_crafting_local.set_year_value(year, n_jobs_crafting_local);

        let n_jobs_crafting_national =
            &turnover_heating_crafting_national
            * constants::fte_per_million_turnover::work::heating_heatpump
            + &turnover_heat_demand_crafting_national
            * constants::fte_per_million_turnover::work::energetic_restoration
            + &turnover_solar_roof_crafting_national
            * constants::fte_per_million_turnover::work::solar_roof
            + &turnover_solar_landscape_crafting_national
            * constants::fte_per_million_turnover::work::solar_landscape;
        self.n_jobs_crafting_national
            .set_year_value(year, n_jobs_crafting_national);

        let n_jobs_production_national =
            &turnover_heating_production_national
            * constants::fte_per_million_turnover::material::heating_heatpump
            + &turnover_heat_demand_production_national
            * constants::fte_per_million_turnover::material::energetic_restoration
            + &turnover_solar_roof_production_national
            * constants::fte_per_million_turnover::material::solar_roof
            + &turnover_solar_landscape_production_national
            * constants::fte_per_million_turnover::material::solar_landscape;
        self.n_jobs_production_national
            .set_year_value(year, n_jobs_production_national);


        // taxes
        let income_local = n_jobs_crafting_local
            * constants::tax::income_per_fte * 1e-3;
        self.income_local.set_year_value(year, income_local);

        let income_national = n_jobs_crafting_national
            * constants::tax::income_tax_per_fte * 1e-3;
        self.income_national.set_year_value(year, income_national);

        let income_tax_local = n_jobs_crafting_local
            * constants::tax::income_tax_local_per_fte * 1e-3;
        self.income_tax_local.set_year_value(year, income_tax_local);

        let income_tax_national = n_jobs_crafting_national
            * constants::tax::turnover_tax * 1e-3;
        self.income_tax_national.set_year_value(year, income_tax_national);

        let turnover_local =
            &turnover_heating_crafting_local
            + &invest_heating_material
            * constants::invest_work::loacal_value_add::heating_heatpump
            + &turnover_heat_demand_crafting_local
            + &invest_heat_demand_material
            * constants::invest_work::loacal_value_add::energetic_restoration
            + &turnover_solar_roof_crafting_local
            + &invest_solar_roof_material
            * constants::invest_work::loacal_value_add::solar_roof
            + &turnover_solar_landscape_crafting_local
            + &invest_solar_landscape_material
            * constants::invest_work::loacal_value_add::solar_landscape;
        self.turnover_local.set_year_value(year, turnover_local);

        let revenue_local = turnover_local * constants::revenue_local_part;
        self.revenue_local.set_year_value(year, revenue_local);

        let turnover_national = invest_heat_sources__M__eur_per_a
            + invest_energetic_renovation__M__eur_per_a
            + sol_rf_invest__M__eur_per_a + sol_om_invest__M__eur_per_a;
        self.turnover_national.set_year_value(year, turnover_national);

        let turnover_tax_local = turnover_local
            * constants::tax::turnover_tax_local_part
            * constants::tax::turnover_tax;
        self.turnover_tax_local.set_year_value(year, turnover_tax_local);

        let turnover_tax_national = income_national
            * constants::tax::turnover_tax;
        self.turnover_tax_national.set_year_value(year, turnover_tax_national);

        let business_tax_local = turnover_local
            * constants::tax::business_tax;
        self.business_tax_local.set_year_value(year, business_tax_local);

        let business_tax_national = turnover_national
            * constants::tax::business_tax;
        self.business_tax_national.set_year_value(year, business_tax_national);

        let corporate_tax_national = turnover_national
            * constants::tax::corporate_tax;
        self.corporate_tax_national.set_year_value(year, corporate_tax_national);


        if year != self.start_year{

            let cnsmp_oil__M__L_per_a =
                buildings.results.cnsmp_oil__M__L_per_a.get_year(year).sum();
            let cnsmp_oil__M__L_per_a_fist_year =
                buildings.results.cnsmp_oil__M__L_per_a
                .get_year(self.start_year).sum();

            let cnsmp_gas__G__W_h_per_a =
                buildings.results.cnsmp_gas__G__W_h_per_a
                .get_year(year).sum();
            let cnsmp_gas__G__W_h_per_a_first_year =
                buildings.results.cnsmp_gas__G__W_h_per_a
                .get_year(self.start_year).sum();

            let cars_fuel_dmd__M__L_per_a =
                mobility.results.cars_fuel_dmd__M__L_per_a
                .get_year(year).sum();
            let cars_fuel_dmd__M__L_per_a_first_year =
                mobility.results.cars_fuel_dmd__M__L_per_a
                .get_year(self.start_year).sum();

            let prchsd_renewable_nrg__G__W_h_per_a =
                energy.results.prchsd_renewable_nrg__M__eur_per_a
                .get_year(year).sum();
            let prchsd_renewable_nrg__G__W_h_per_a_first_year =
                energy.results.prchsd_renewable_nrg__M__eur_per_a
                .get_year(self.start_year).sum();

            let prchsd_nrg_mix__G__W_h_per_a =
                energy.results.prchsd_nrg_mix__G__W_h_per_a
                .get_year(year).private;
            let prchsd_nrg_mix__G__W_h_per_a_first_year =
                energy.results.prchsd_nrg_mix__G__W_h_per_a
                .get_year(self.start_year).private;

            // TDOD:
            let energy_tax_national =
                (&cnsmp_oil__M__L_per_a
                    - &cnsmp_oil__M__L_per_a_fist_year)
                * constants::energy_taxes::gas
                + (&cnsmp_gas__G__W_h_per_a
                    - &cnsmp_gas__G__W_h_per_a_first_year)
                * constants::energy_taxes::fuel
                + (&cars_fuel_dmd__M__L_per_a
                    - &cars_fuel_dmd__M__L_per_a_first_year)
                * constants::energy_taxes::electric
                + (&prchsd_renewable_nrg__G__W_h_per_a
                    - &prchsd_renewable_nrg__G__W_h_per_a_first_year)
                * constants::energy_taxes::electric
                + (&prchsd_nrg_mix__G__W_h_per_a
                    - &prchsd_nrg_mix__G__W_h_per_a_first_year)
                * constants::energy_taxes::electric;
            self.energy_tax_national.set_year_value(year, energy_tax_national);

        }

    }
}

#[cfg(test)]
mod tests{
    extern crate wasm_bindgen_test;
    mod compare_with_excel;
}
