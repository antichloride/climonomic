#![allow(unused_imports)]
#![allow(dead_code)]

use crate::result::Results;
use crate::buildings::Buildings;
use crate::energy::Energy;
use crate::mobility::Mobility;
use crate::economy::Economy;
use crate::constants;


macro_rules! implement_stakeholders{
    ($($field:ident),*) => {

        pub struct Stakeholders{
            start_year: u32,
            $(
                pub $field: Results,
             )*
        }

        impl Stakeholders{
            pub fn new(start_year: u32, end_year: u32) -> Stakeholders {
                return Stakeholders{
                    start_year: start_year,
                    $(
                        $field: Results::new(
                            "stakeholders/results/".to_owned()+stringify!($field),
                            start_year,
                            end_year
                            ),
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

implement_stakeholders!{
    private_invest,
    private_effect_of_measures,
    private_cash_flow_netto,
    industry_invest,
    industry_effect_of_measures,
    industry_profit_from_measures,
    industry_cash_flow_netto,
    community_invest,
    community_effect_of_measures,
    community_tax_income_from_measures,
    community_cash_flow_netto,
    federal_additional_expenses,
    federal_additional_tax_income,
    federal_cash_flow_netto
}

impl Stakeholders{
    pub fn calculate(
        &mut self,
        year: u32,
        buildings: &Buildings,
        energy: &Energy,
        mobility: &Mobility,
        economy: &Economy,
    ){

        // local
        let invest_buildings =
            &buildings.invest_heat_sources__M__eur_per_a()
                .get_year(year)
            + &buildings.invest_energetic_renovation__M__eur_per_a()
                .get_year(year)
            - &buildings.grant_heat_sources__M__eur_per_a()
                .get_year(year)
            - &buildings.grant_energetic_renovation__M__eur_per_a()
                .get_year(year);

        let invest_energy =
            &energy.sol_rf_invest__M__eur_per_a().get_year(year)
            + &energy.sol_os_invest__M__eur_per_a().get_year(year)
            + energy.wind_invest__M__eur_per_a().get_year(year)
            - &energy.sol_rf_grant__M__eur_per_a().get_year(year)
            - &energy.sol_os_grant__M__eur_per_a().get_year(year)
            - energy.wind_grant__M__eur_per_a().get_year(year);

        let invest_total = invest_buildings + invest_energy;

        self.private_invest.set_year_value(year, invest_total.private);
        self.industry_invest.set_year_value(year, invest_total.industry);
        self.community_invest.set_year_value(year, invest_total.public + invest_total.schools);

        if year > self.start_year{

            let costs_heating_oil_diff =
                &buildings.costs_oil__M__eur_per_a().get_year(self.start_year)
                - &buildings.costs_oil__M__eur_per_a().get_year(year);
            let costs_heating_gas_diff =
                &buildings.costs_gas__M__eur_per_a().get_year(self.start_year)
                - &buildings.costs_gas__M__eur_per_a().get_year(year);
            let bev_electric_power_costs_diff =
                &mobility.bev_nrg_costs__M__eur_per_a().get_year(self.start_year)
                - &mobility.bev_nrg_costs__M__eur_per_a().get_year(year);
            let car_fuel_costs_diff =
                &mobility.cars_fuel_costs__M__eur_per_a().get_year(self.start_year)
                - &mobility.cars_fuel_costs__M__eur_per_a().get_year(year);
            let solar_roof_om_diff =
                &energy.sol_rf_om__M__eur_per_a().get_year(self.start_year)
                - &energy.sol_rf_om__M__eur_per_a().get_year(year);
            let solar_landscape_om_diff =
                &energy.sol_os_om__M__eur_per_a().get_year(self.start_year)
                - &energy.sol_os_om__M__eur_per_a().get_year(year);
            let solar_roof_revenue_diff =
                &energy.sol_rf_revenue__M__eur_per_a().get_year(self.start_year)
                - &energy.sol_rf_revenue__M__eur_per_a().get_year(year);
            let solar_landscape_revenue_diff =
                &energy.sol_os_revenue__M__eur_per_a().get_year(self.start_year)
                - &energy.sol_os_revenue__M__eur_per_a().get_year(year);
            let wind_revenue_diff =
                &energy.wind_revenue__M__eur_per_a().get_year(self.start_year)
                - &energy.wind_revenue__M__eur_per_a().get_year(year);
            let direct_aquisition_renable_energies_costs_diff =
                &energy.prchsd_renewable_nrg__M__eur_per_a().get_year(self.start_year)
                - &energy.prchsd_renewable_nrg__M__eur_per_a().get_year(year);
            let purchased_energy_mix_costs_diff =
                &energy.prchsd_nrg_mix_costs__M__eur_per_a().get_year(self.start_year)
                - &energy.prchsd_nrg_mix_costs__M__eur_per_a().get_year(year);

            let mut effect_of_measures = costs_heating_oil_diff
                + costs_heating_gas_diff
                //+ bev_electric_power_costs_diff
                + car_fuel_costs_diff
                + solar_roof_om_diff
                //+ solar_landscape_om_diff
                - &solar_roof_revenue_diff
                //- &solar_landscape_revenue_diff
                //+ wind_revenue_diff
                + direct_aquisition_renable_energies_costs_diff
                + purchased_energy_mix_costs_diff;

            effect_of_measures.private = effect_of_measures.private
                + &buildings.results.cnsmp_elec_heat_pump__G__W_h_per_a.get_year(year).private
                * &energy.inputs.renewable_nrg_price__m__eur_per_W_h.get_year(year).private
                * constants::energy::evu_discount_heat_pump;

            effect_of_measures.industry = effect_of_measures.industry
                + solar_landscape_om_diff.industry
                - solar_landscape_revenue_diff.industry
                - wind_revenue_diff.industry;
            println!("{0}, {1}, {2}", &effect_of_measures.industry, &solar_landscape_om_diff.industry, &solar_landscape_om_diff.industry);

            effect_of_measures.public = effect_of_measures.public
                + solar_landscape_om_diff.public
                - solar_landscape_revenue_diff.public
                - wind_revenue_diff.public;

            self.private_effect_of_measures
                .set_year_value(year, effect_of_measures.private);
            self.industry_effect_of_measures
                .set_year_value(year, effect_of_measures.industry);
            self.community_effect_of_measures
                .set_year_value(year, effect_of_measures.public + effect_of_measures.schools);


            let industry_profit_from_measures =
                economy.turnover_local__M__eur().get_year(year)
                * constants::economy::revenue_margin;
            self.industry_profit_from_measures
                .set_year_value(year, industry_profit_from_measures);

            let community_tax_income_from_measures =
                economy.business_tax_local__M__eur().get_year(year)
                + economy.income_tax_local__M__eur().get_year(year);
            self.industry_profit_from_measures
                .set_year_value(year, community_tax_income_from_measures);

            let cash_flow_netto = effect_of_measures - invest_total;

            self.private_cash_flow_netto
                .set_year_value(year, self.private_cash_flow_netto.get_year(year-1) + cash_flow_netto.private);

            let industry_cash_flow_netto = cash_flow_netto.industry
                + industry_profit_from_measures;
            self.industry_cash_flow_netto
                .set_year_value(year, self.industry_cash_flow_netto.get_year(year-1) +  industry_cash_flow_netto);
            let community_cash_flow_netto =
                cash_flow_netto.public
                +cash_flow_netto.schools
                +community_tax_income_from_measures;
            self.community_cash_flow_netto
                .set_year_value(year, self.community_cash_flow_netto.get_year(year-1) + community_cash_flow_netto);

        }


        // federal
        let federal_additional_expenses =
            - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).sum()
            + buildings.grant_energetic_renovation__M__eur_per_a()
                .get_year(year).sum()
            + energy.sol_rf_grant__M__eur_per_a().get_year(year).sum()
            + energy.sol_os_grant__M__eur_per_a().get_year(year).sum()
            + mobility.cars_fuel_costs__M__eur_per_a().get_year(year).sum());
        self.federal_additional_expenses.set_year_value(year, federal_additional_expenses);

        let federal_additional_tax_income =
            economy.income_tax_national__M__eur().get_year(year)
            + economy.turnover_tax_national__M__eur().get_year(year)
            + economy.business_tax_national__M__eur().get_year(year)
            + economy.corporate_tax_national__M__eur().get_year(year);
        self.federal_additional_tax_income
            .set_year_value(year, federal_additional_tax_income);

        let federal_cash_flow_netto = federal_additional_expenses
            + federal_additional_tax_income;
        self.federal_cash_flow_netto
            .set_year_value(year, federal_cash_flow_netto);

    }
}
