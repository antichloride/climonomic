#![allow(non_snake_case)]

use crate::buildings::Buildings;
use crate::constants::economy as constants;
use crate::energy::Energy;
use crate::mobility::Mobility;

use super::Economy;

impl Economy {
    pub fn calculate(
        &mut self,
        year: u32,
        buildings: &Buildings,
        energy: &Energy,
        mobility: &Mobility,
    ) {
        // heat
        let invest_heat_sources__M__eur_per_a =
            buildings.invest_heat_sources__M__eur_per_a().get_year(year).sum();

        let invest_heating_material =
            invest_heat_sources__M__eur_per_a * constants::material::invest_local::heating_heatpump;
        self.invest_heating_material__M__eur_per_a
            .set_year_value(year, invest_heating_material);

        let invest_heating_work = invest_heat_sources__M__eur_per_a
            * (1.0 - constants::material::invest_local::heating_heatpump);
        self.invest_heating_work__M__eur_per_a
            .set_year_value(year, invest_heating_work);

        let turnover_heating_crafting_local = invest_heating_work
            * constants::invest_work::loacal_value_add::heating_heatpump;
        self.turnover_heating_crafting_local__M__eur_per_a
            .set_year_value(year, turnover_heating_crafting_local);

        let turnover_heating_crafting_national = invest_heating_work
            * constants::invest_work::national_added_value::heating_heatpump;
        self.turnover_heating_crafting_national__M__eur_per_a
            .set_year_value(year, turnover_heating_crafting_national);

        let turnover_heating_production_national = invest_heating_material
            * constants::material::invest_national::heating_heatpump;
        self.turnover_heating_production_national__M__eur_per_a
            .set_year_value(year, turnover_heating_production_national);

        // energetic renovation
        let invest_energetic_renovation__M__eur_per_a = buildings
            .invest_energetic_renovation__M__eur_per_a()
            .get_year(year)
            .sum();

        let invest_heat_demand_material = invest_energetic_renovation__M__eur_per_a
            * constants::material::invest_local::energetic_restoration;
        self.invest_heat_demand_material__M__eur_per_a
            .set_year_value(year, invest_heat_demand_material);

        let invest_heat_demand_work = invest_energetic_renovation__M__eur_per_a
            * (1.0 - constants::material::invest_local::energetic_restoration);
        self.invest_heat_demand_work__M__eur_per_a
            .set_year_value(year, invest_heat_demand_work);

        let turnover_heat_demand_crafting_local = invest_heat_demand_work
            * constants::invest_work::loacal_value_add::energetic_restoration;
        self.turnover_heat_demand_crafting_local__M__eur_per_a
            .set_year_value(year, turnover_heat_demand_crafting_local);

        let turnover_heat_demand_crafting_national = invest_heat_demand_work
            * constants::invest_work::national_added_value::energetic_restoration;
        self.turnover_heat_demand_crafting_national__M__eur_per_a
            .set_year_value(year, turnover_heat_demand_crafting_national);

        let turnover_heat_demand_production_national = invest_heat_demand_material
            * constants::material::invest_national::heating_heatpump;
        self.turnover_heat_demand_production_national__M__eur_per_a
            .set_year_value(year, turnover_heat_demand_production_national);

        // solar roof
        let sol_rf_invest__M__eur_per_a =
            energy.sol_rf_invest__M__eur_per_a().get_year(year).sum();

        let invest_solar_roof_material =
            sol_rf_invest__M__eur_per_a * constants::material::invest_local::solar_roof;
        self.invest_solar_roof_material__M__eur_per_a
            .set_year_value(year, invest_solar_roof_material);

        let invest_solar_roof_work = sol_rf_invest__M__eur_per_a
            * (1.0 - constants::material::invest_local::solar_roof);
        self.invest_solar_roof_work__M__eur_per_a
            .set_year_value(year, invest_solar_roof_work);

        // Excel row 388: Wartung PV auf Dach Arbeit = SUM($D266:D266)*0.02
        let maintenance_solar_roof_work = energy
            .sol_rf_om__M__eur_per_a()
            .get_year(year)
            .sum();
        self.maintenance_solar_roof_work__M__eur_per_a
            .set_year_value(year, maintenance_solar_roof_work);

        // Excel row 389: D388 * 0.3
        let turnover_solar_roof_crafting_local = maintenance_solar_roof_work
            * constants::invest_work::loacal_value_add::solar_roof;
        self.turnover_solar_roof_crafting_local__M__eur_per_a
            .set_year_value(year, turnover_solar_roof_crafting_local);

        // Excel row 390: D388 * 1.0
        let turnover_solar_roof_crafting_national = maintenance_solar_roof_work
            * constants::invest_work::national_added_value::solar_roof;
        self.turnover_solar_roof_crafting_national__M__eur_per_a
            .set_year_value(year, turnover_solar_roof_crafting_national);

        // Excel row 391: D387 * 0.5 (invest work * 0.5)
        let turnover_solar_roof_production_national = invest_solar_roof_work
            * constants::material::invest_national::solar_roof;
        self.turnover_solar_roof_production_national__M__eur_per_a
            .set_year_value(year, turnover_solar_roof_production_national);

        // solar landscape
        let sol_os_invest__M__eur_per_a =
            energy.sol_os_invest__M__eur_per_a().get_year(year).sum();

        // Excel row 392: D299 * 0.65
        let invest_solar_landscape_material =
            sol_os_invest__M__eur_per_a * constants::material::invest_local::solar_landscape;
        self.invest_solar_landscape_material__M__eur_per_a
            .set_year_value(year, invest_solar_landscape_material);

        // Excel row 393: D299 * 0.35
        let invest_solar_landscape_work = sol_os_invest__M__eur_per_a
            * (1.0 - constants::material::invest_local::solar_landscape);
        self.invest_solar_landscape_work__M__eur_per_a
            .set_year_value(year, invest_solar_landscape_work);

        // Excel row 394: Wartung PV Freifläche Arbeit = SUM($D299:D299)*0.02
        let maintenance_solar_landscape_work = energy
            .sol_os_om__M__eur_per_a()
            .get_year(year)
            .sum();
        self.maintenance_solar_landscape_work__M__eur_per_a
            .set_year_value(year, maintenance_solar_landscape_work);

        // Excel row 395: D394 * 0.15
        let turnover_solar_landscape_crafting_local = maintenance_solar_landscape_work
            * constants::invest_work::loacal_value_add::solar_landscape;
        self.turnover_solar_landscape_crafting_local__M__eur_per_a
            .set_year_value(year, turnover_solar_landscape_crafting_local);

        // Excel row 396: D394 * 1.0
        let turnover_solar_landscape_crafting_national = maintenance_solar_landscape_work
            * constants::invest_work::national_added_value::solar_landscape;
        self.turnover_solar_landscape_crafting_national__M__eur_per_a
            .set_year_value(year, turnover_solar_landscape_crafting_national);

        // Excel row 397: D393 * 0.5 (invest work * 0.5)
        let turnover_solar_landscape_production_national = invest_solar_landscape_work
            * constants::material::invest_national::solar_landscape;
        self.turnover_solar_landscape_production_national__M__eur_per_a
            .set_year_value(year, turnover_solar_landscape_production_national);

        // jobs (Excel rows 398-401 divide by the FTE factor)
        let n_jobs_crafting_local = turnover_heating_crafting_local
            / constants::fte_per_million_turnover::work::heating_heatpump
            + turnover_heat_demand_crafting_local
                / constants::fte_per_million_turnover::work::energetic_restoration
            + turnover_solar_roof_crafting_local
                / constants::fte_per_million_turnover::work::solar_roof
            + turnover_solar_landscape_crafting_local
                / constants::fte_per_million_turnover::work::solar_landscape;
        self.n_jobs_crafting_local
            .set_year_value(year, n_jobs_crafting_local);

        let n_jobs_crafting_national = turnover_heating_crafting_national
            / constants::fte_per_million_turnover::work::heating_heatpump
            + turnover_heat_demand_crafting_national
                / constants::fte_per_million_turnover::work::energetic_restoration
            + turnover_solar_roof_crafting_national
                / constants::fte_per_million_turnover::work::solar_roof
            + turnover_solar_landscape_crafting_national
                / constants::fte_per_million_turnover::work::solar_landscape;
        self.n_jobs_crafting_national
            .set_year_value(year, n_jobs_crafting_national);

        let n_jobs_production_national = turnover_heating_production_national
            / constants::fte_per_million_turnover::material::heating_heatpump
            + turnover_heat_demand_production_national
                / constants::fte_per_million_turnover::material::energetic_restoration
            + turnover_solar_roof_production_national
                / constants::fte_per_million_turnover::material::solar_roof
            + turnover_solar_landscape_production_national
                / constants::fte_per_million_turnover::material::solar_landscape;
        self.n_jobs_production_national
            .set_year_value(year, n_jobs_production_national);

        let n_jobs_production_sum_national = n_jobs_crafting_national + n_jobs_production_national;
        self.n_jobs_production_sum_national
            .set_year_value(year, n_jobs_production_sum_national);

        self.energy_tax_oil__eur_per_L
            .set_year_value(year, constants::energy_taxes::oil);
        self.energy_tax_gas__eur_per_kWh
            .set_year_value(year, constants::energy_taxes::gas);
        self.energy_tax_fuel__eur_per_L
            .set_year_value(year, constants::energy_taxes::fuel);

        // taxes & income
        let income_local = n_jobs_crafting_local * constants::tax::income_per_fte;
        self.income_local__M__eur_per_a.set_year_value(year, income_local);

        let income_national = (n_jobs_crafting_national + n_jobs_production_national)
            * constants::tax::income_per_fte;
        self.income_national__M__eur_per_a.set_year_value(year, income_national);

        let income_tax_local = income_local * constants::tax::income_tax_local_per_fte;
        self.income_tax_local__M__eur_per_a
            .set_year_value(year, income_tax_local);

        let income_tax_national = income_national * constants::tax::income_tax_per_fte;
        self.income_tax_national__M__eur_per_a
            .set_year_value(year, income_tax_national);

        let turnover_local = turnover_heating_crafting_local
            + invest_heating_material
                * constants::invest_work::loacal_value_add::heating_heatpump
            + turnover_heat_demand_crafting_local
            + invest_heat_demand_material
                * constants::invest_work::loacal_value_add::energetic_restoration
            + turnover_solar_roof_crafting_local
            + invest_solar_roof_material * constants::invest_work::loacal_value_add::solar_roof
            + turnover_solar_landscape_crafting_local
            + invest_solar_landscape_material
                * constants::invest_work::loacal_value_add::solar_landscape;
        self.turnover_local__M__eur_per_a.set_year_value(year, turnover_local);

        let revenue_local = turnover_local * constants::revenue_local_part;
        self.revenue_local__M__eur_per_a.set_year_value(year, revenue_local);

        let turnover_national = invest_heat_sources__M__eur_per_a
            + invest_energetic_renovation__M__eur_per_a
            + sol_rf_invest__M__eur_per_a
            + sol_os_invest__M__eur_per_a;
        self.turnover_national__M__eur_per_a
            .set_year_value(year, turnover_national);

        let turnover_tax_local = turnover_local
            * constants::tax::turnover_tax
            * constants::tax::turnover_tax_local_part;
        self.turnover_tax_local__M__eur_per_a
            .set_year_value(year, turnover_tax_local);

        let turnover_tax_national = income_national * constants::tax::turnover_tax;
        self.turnover_tax_national__M__eur_per_a
            .set_year_value(year, turnover_tax_national);

        let business_tax_local = turnover_local * constants::tax::business_tax;
        self.business_tax_local__M__eur_per_a
            .set_year_value(year, business_tax_local);

        let business_tax_national = turnover_national * constants::tax::business_tax;
        self.business_tax_national__M__eur_per_a
            .set_year_value(year, business_tax_national);

        let corporate_tax_national = turnover_national * constants::tax::corporate_tax;
        self.corporate_tax_national__M__eur_per_a
            .set_year_value(year, corporate_tax_national);

        if year != self.start_year {
            let cnsmp_oil__M__L_per_a =
                buildings.results.cnsmp_oil__M__L_per_a.get_year(year).sum();
            let cnsmp_oil__M__L_per_a_first_year = buildings
                .results
                .cnsmp_oil__M__L_per_a
                .get_year(self.start_year)
                .sum();

            let cnsmp_gas__G__W_h_per_a =
                buildings.results.cnsmp_gas__G__W_h_per_a.get_year(year).sum();
            let cnsmp_gas__G__W_h_per_a_first_year = buildings
                .results
                .cnsmp_gas__G__W_h_per_a
                .get_year(self.start_year)
                .sum();

            let cars_fuel_dmd__M__L_per_a =
                mobility.results.cars_fuel_dmd__M__L_per_a.get_year(year).sum();
            let cars_fuel_dmd__M__L_per_a_first_year = mobility
                .results
                .cars_fuel_dmd__M__L_per_a
                .get_year(self.start_year)
                .sum();

            let energy_tax_national = (cnsmp_oil__M__L_per_a_first_year - cnsmp_oil__M__L_per_a)
                * constants::energy_taxes::oil
                + (cnsmp_gas__G__W_h_per_a_first_year - cnsmp_gas__G__W_h_per_a)
                    * constants::energy_taxes::gas
                + (cars_fuel_dmd__M__L_per_a_first_year - cars_fuel_dmd__M__L_per_a)
                    * constants::energy_taxes::fuel;
            self.energy_tax_national__M__eur_per_a
                .set_year_value(year, energy_tax_national);
        } else {
            self.energy_tax_national__M__eur_per_a.set_year_value(year, 0.0);
        }
    }
}
