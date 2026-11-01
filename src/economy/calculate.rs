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
        let start_year = self.start_year;
        let results = &mut *self;

        // heat
        let invest_heat_sources__M__eur_per_a =
            buildings.invest_heat_sources__M__eur_per_a().get_year(year).sum();

        crate::equation! {
            /// Material investment share for heating systems
            results.invest_heating_material__M__eur_per_a[year] =
                invest_heat_sources__M__eur_per_a * constants::material::invest_local::heating_heatpump;
        }

        crate::equation! {
            /// Labor and installation investment share for heating systems
            results.invest_heating_work__M__eur_per_a[year] = invest_heat_sources__M__eur_per_a
                * (1.0 - constants::material::invest_local::heating_heatpump);
        }

        crate::equation! {
            /// Local craftsmanship turnover from heating systems installation
            results.turnover_heating_crafting_local__M__eur_per_a[year] = invest_heating_work__M__eur_per_a
                * constants::invest_work::loacal_value_add::heating_heatpump;
        }

        crate::equation! {
            /// National craftsmanship turnover from heating systems installation
            results.turnover_heating_crafting_national__M__eur_per_a[year] = invest_heating_work__M__eur_per_a
                * constants::invest_work::national_added_value::heating_heatpump;
        }

        crate::equation! {
            /// National industrial manufacturing turnover for heating equipment
            results.turnover_heating_production_national__M__eur_per_a[year] = invest_heating_material__M__eur_per_a
                * constants::material::invest_national::heating_heatpump;
        }

        // energetic renovation
        let invest_energetic_renovation__M__eur_per_a = buildings
            .invest_energetic_renovation__M__eur_per_a()
            .get_year(year)
            .sum();

        crate::equation! {
            /// Material investment share for energetic renovation
            results.invest_heat_demand_material__M__eur_per_a[year] = invest_energetic_renovation__M__eur_per_a
                * constants::material::invest_local::energetic_restoration;
        }

        crate::equation! {
            /// Craftsmanship labor investment share for energetic renovation
            results.invest_heat_demand_work__M__eur_per_a[year] = invest_energetic_renovation__M__eur_per_a
                * (1.0 - constants::material::invest_local::energetic_restoration);
        }

        crate::equation! {
            /// Local craftsmanship turnover from building renovation
            results.turnover_heat_demand_crafting_local__M__eur_per_a[year] = invest_heat_demand_work__M__eur_per_a
                * constants::invest_work::loacal_value_add::energetic_restoration;
        }

        crate::equation! {
            /// National craftsmanship turnover from building renovation
            results.turnover_heat_demand_crafting_national__M__eur_per_a[year] = invest_heat_demand_work__M__eur_per_a
                * constants::invest_work::national_added_value::energetic_restoration;
        }

        crate::equation! {
            /// National production turnover for insulation and building materials
            results.turnover_heat_demand_production_national__M__eur_per_a[year] = invest_heat_demand_material__M__eur_per_a
                * constants::material::invest_national::heating_heatpump;
        }

        // solar roof
        let sol_rf_invest__M__eur_per_a =
            energy.sol_rf_invest__M__eur_per_a().get_year(year).sum();

        crate::equation! {
            /// Material investment share for rooftop solar systems
            results.invest_solar_roof_material__M__eur_per_a[year] =
                sol_rf_invest__M__eur_per_a * constants::material::invest_local::solar_roof;
        }

        crate::equation! {
            /// Installation labor investment share for rooftop solar systems
            results.invest_solar_roof_work__M__eur_per_a[year] = sol_rf_invest__M__eur_per_a
                * (1.0 - constants::material::invest_local::solar_roof);
        }

        // Excel row 388: Wartung PV auf Dach Arbeit = SUM($D266:D266)*0.02
        let maintenance_solar_roof_work = energy
            .sol_rf_om__M__eur_per_a()
            .get_year(year)
            .sum();
        results.maintenance_solar_roof_work__M__eur_per_a
            .set_year_value(year, maintenance_solar_roof_work);

        // Excel row 389: D388 * 0.3
        crate::equation! {
            /// Local craftsmanship turnover from rooftop solar maintenance
            results.turnover_solar_roof_crafting_local__M__eur_per_a[year] = maintenance_solar_roof_work
                * constants::invest_work::loacal_value_add::solar_roof;
        }

        // Excel row 390: D388 * 1.0
        crate::equation! {
            /// National craftsmanship turnover from rooftop solar maintenance
            results.turnover_solar_roof_crafting_national__M__eur_per_a[year] = maintenance_solar_roof_work
                * constants::invest_work::national_added_value::solar_roof;
        }

        // Excel row 391: D387 * 0.5 (invest work * 0.5)
        crate::equation! {
            /// National manufacturing turnover for rooftop solar components
            results.turnover_solar_roof_production_national__M__eur_per_a[year] = invest_solar_roof_work__M__eur_per_a
                * constants::material::invest_national::solar_roof;
        }

        // solar landscape
        let sol_os_invest__M__eur_per_a =
            energy.sol_os_invest__M__eur_per_a().get_year(year).sum();

        // Excel row 392: D299 * 0.65
        crate::equation! {
            /// Material investment share for open-space solar
            results.invest_solar_landscape_material__M__eur_per_a[year] =
                sol_os_invest__M__eur_per_a * constants::material::invest_local::solar_landscape;
        }

        // Excel row 393: D299 * 0.35
        crate::equation! {
            /// Installation labor investment share for open-space solar
            results.invest_solar_landscape_work__M__eur_per_a[year] = sol_os_invest__M__eur_per_a
                * (1.0 - constants::material::invest_local::solar_landscape);
        }

        // Excel row 394: Wartung PV Freifläche Arbeit = SUM($D299:D299)*0.02
        let maintenance_solar_landscape_work = energy
            .sol_os_om__M__eur_per_a()
            .get_year(year)
            .sum();
        results.maintenance_solar_landscape_work__M__eur_per_a
            .set_year_value(year, maintenance_solar_landscape_work);

        // Excel row 395: D394 * 0.15
        crate::equation! {
            /// Local craftsmanship turnover from open-space solar maintenance
            results.turnover_solar_landscape_crafting_local__M__eur_per_a[year] = maintenance_solar_landscape_work
                * constants::invest_work::loacal_value_add::solar_landscape;
        }

        // Excel row 396: D394 * 1.0
        crate::equation! {
            /// National craftsmanship turnover from open-space solar maintenance
            results.turnover_solar_landscape_crafting_national__M__eur_per_a[year] = maintenance_solar_landscape_work
                * constants::invest_work::national_added_value::solar_landscape;
        }

        // Excel row 397: D393 * 0.5 (invest work * 0.5)
        crate::equation! {
            /// National manufacturing turnover for open-space solar components
            results.turnover_solar_landscape_production_national__M__eur_per_a[year] = invest_solar_landscape_work__M__eur_per_a
                * constants::material::invest_national::solar_landscape;
        }

        // jobs (Excel rows 398-401 divide by the FTE factor)
        crate::equation! {
            /// Local employment generated by craft installations and maintenance
            results.n_jobs_crafting_local[year] = turnover_heating_crafting_local__M__eur_per_a
                / constants::fte_per_million_turnover::work::heating_heatpump
                + turnover_heat_demand_crafting_local__M__eur_per_a
                    / constants::fte_per_million_turnover::work::energetic_restoration
                + turnover_solar_roof_crafting_local__M__eur_per_a
                    / constants::fte_per_million_turnover::work::solar_roof
                + turnover_solar_landscape_crafting_local__M__eur_per_a
                    / constants::fte_per_million_turnover::work::solar_landscape;
        }

        crate::equation! {
            /// National craft employment generated across Germany
            results.n_jobs_crafting_national[year] = turnover_heating_crafting_national__M__eur_per_a
                / constants::fte_per_million_turnover::work::heating_heatpump
                + turnover_heat_demand_crafting_national__M__eur_per_a
                    / constants::fte_per_million_turnover::work::energetic_restoration
                + turnover_solar_roof_crafting_national__M__eur_per_a
                    / constants::fte_per_million_turnover::work::solar_roof
                + turnover_solar_landscape_crafting_national__M__eur_per_a
                    / constants::fte_per_million_turnover::work::solar_landscape;
        }

        crate::equation! {
            /// National manufacturing employment generated across Germany
            results.n_jobs_production_national[year] = turnover_heating_production_national__M__eur_per_a
                / constants::fte_per_million_turnover::material::heating_heatpump
                + turnover_heat_demand_production_national__M__eur_per_a
                    / constants::fte_per_million_turnover::material::energetic_restoration
                + turnover_solar_roof_production_national__M__eur_per_a
                    / constants::fte_per_million_turnover::material::solar_roof
                + turnover_solar_landscape_production_national__M__eur_per_a
                    / constants::fte_per_million_turnover::material::solar_landscape;
        }

        crate::equation! {
            /// Total direct and indirect national employment across Germany
            results.n_jobs_production_sum_national[year] = n_jobs_crafting_national + n_jobs_production_national;
        }

        results.energy_tax_oil__eur_per_L
            .set_year_value(year, constants::energy_taxes::oil);
        results.energy_tax_gas__eur_per_kWh
            .set_year_value(year, constants::energy_taxes::gas);
        results.energy_tax_fuel__eur_per_L
            .set_year_value(year, constants::energy_taxes::fuel);

        // taxes & income
        crate::equation! {
            /// Total employee compensation generated within the municipality
            results.income_local__M__eur_per_a[year] = n_jobs_crafting_local * constants::tax::income_per_fte;
        }

        crate::equation! {
            /// Total employee compensation generated at national level
            results.income_national__M__eur_per_a[year] = (n_jobs_crafting_national + n_jobs_production_national)
                * constants::tax::income_per_fte;
        }

        crate::equation! {
            /// Municipal share of income tax revenue
            results.income_tax_local__M__eur_per_a[year] = income_local__M__eur_per_a * constants::tax::income_tax_local_per_fte;
        }

        crate::equation! {
            /// Total federal and state income tax revenue
            results.income_tax_national__M__eur_per_a[year] = income_national__M__eur_per_a * constants::tax::income_tax_per_fte;
        }

        crate::equation! {
            /// Total economic turnover generated within the municipality
            results.turnover_local__M__eur_per_a[year] = turnover_heating_crafting_local__M__eur_per_a
                + invest_heating_material__M__eur_per_a
                    * constants::invest_work::loacal_value_add::heating_heatpump
                + turnover_heat_demand_crafting_local__M__eur_per_a
                + invest_heat_demand_material__M__eur_per_a
                    * constants::invest_work::loacal_value_add::energetic_restoration
                + turnover_solar_roof_crafting_local__M__eur_per_a
                + invest_solar_roof_material__M__eur_per_a * constants::invest_work::loacal_value_add::solar_roof
                + turnover_solar_landscape_crafting_local__M__eur_per_a
                + invest_solar_landscape_material__M__eur_per_a
                    * constants::invest_work::loacal_value_add::solar_landscape;
        }

        crate::equation! {
            /// Operating profits and margins retained locally by municipal firms
            results.revenue_local__M__eur_per_a[year] = turnover_local__M__eur_per_a * constants::revenue_local_part;
        }

        crate::equation! {
            /// Total national turnover across all climate protection measures
            results.turnover_national__M__eur_per_a[year] = invest_heat_sources__M__eur_per_a
                + invest_energetic_renovation__M__eur_per_a
                + sol_rf_invest__M__eur_per_a
                + sol_os_invest__M__eur_per_a;
        }

        crate::equation! {
            /// Municipal share of value-added / turnover tax revenue
            results.turnover_tax_local__M__eur_per_a[year] = turnover_local__M__eur_per_a
                * constants::tax::turnover_tax
                * constants::tax::turnover_tax_local_part;
        }

        crate::equation! {
            /// Federal turnover / value-added tax revenue
            results.turnover_tax_national__M__eur_per_a[year] = income_national__M__eur_per_a * constants::tax::turnover_tax;
        }

        crate::equation! {
            /// Municipal business tax revenue (Gewerbesteuer)
            results.business_tax_local__M__eur_per_a[year] = turnover_local__M__eur_per_a * constants::tax::business_tax;
        }

        crate::equation! {
            /// National business tax revenue (Gewerbesteuer Umlage)
            results.business_tax_national__M__eur_per_a[year] = turnover_national__M__eur_per_a * constants::tax::business_tax;
        }

        crate::equation! {
            /// Federal corporate income tax revenue (Körperschaftsteuer)
            results.corporate_tax_national__M__eur_per_a[year] = turnover_national__M__eur_per_a * constants::tax::corporate_tax;
        }

        if year != start_year {
            let cnsmp_oil__M__L_per_a =
                buildings.results.cnsmp_oil__M__L_per_a.get_year(year).sum();
            let cnsmp_oil__M__L_per_a_first_year = buildings
                .results
                .cnsmp_oil__M__L_per_a
                .get_year(start_year)
                .sum();

            let cnsmp_gas__G__W_h_per_a =
                buildings.results.cnsmp_gas__G__W_h_per_a.get_year(year).sum();
            let cnsmp_gas__G__W_h_per_a_first_year = buildings
                .results
                .cnsmp_gas__G__W_h_per_a
                .get_year(start_year)
                .sum();

            let cars_fuel_dmd__M__L_per_a =
                mobility.results.cars_fuel_dmd__M__L_per_a.get_year(year).sum();
            let cars_fuel_dmd__M__L_per_a_first_year = mobility
                .results
                .cars_fuel_dmd__M__L_per_a
                .get_year(start_year)
                .sum();

            crate::equation! {
                /// Avoided / net change in federal energy tax revenue from fossil phase-out
                results.energy_tax_national__M__eur_per_a[year] = (cnsmp_oil__M__L_per_a_first_year - cnsmp_oil__M__L_per_a)
                    * constants::energy_taxes::oil
                    + (cnsmp_gas__G__W_h_per_a_first_year - cnsmp_gas__G__W_h_per_a)
                        * constants::energy_taxes::gas
                    + (cars_fuel_dmd__M__L_per_a_first_year - cars_fuel_dmd__M__L_per_a)
                        * constants::energy_taxes::fuel;
            }
        } else {
            results.energy_tax_national__M__eur_per_a.set_year_value(year, 0.0);
        }
    }
}
