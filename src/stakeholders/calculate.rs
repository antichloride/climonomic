#![allow(non_snake_case)]

use crate::buildings::Buildings;
use crate::constants;
use crate::economy::Economy;
use crate::energy::Energy;
use crate::mobility::Mobility;

use super::Stakeholders;

impl Stakeholders {
    pub fn calculate(
        &mut self,
        year: u32,
        buildings: &Buildings,
        energy: &Energy,
        mobility: &Mobility,
        economy: &Economy,
    ) {
        if year == self.start_year {
            self.private_invest__M__eur_per_a.set_year_value(year, 0.0);
            self.private_effect_of_measures__M__eur_per_a.set_year_value(year, 0.0);
            self.private_cash_flow_netto__M__eur_per_a.set_year_value(year, 0.0);
            self.industry_profit_from_measures__M__eur_per_a.set_year_value(year, 0.0);
            self.industry_invest__M__eur_per_a.set_year_value(year, 0.0);
            self.industry_effect_of_measures__M__eur_per_a.set_year_value(year, 0.0);
            self.industry_cash_flow_netto__M__eur_per_a.set_year_value(year, 0.0);
            self.community_invest__M__eur_per_a.set_year_value(year, 0.0);
            self.community_effect_of_measures__M__eur_per_a.set_year_value(year, 0.0);
            self.community_tax_income_from_measures__M__eur_per_a.set_year_value(year, 0.0);
            self.community_cash_flow_netto__M__eur_per_a.set_year_value(year, 0.0);
            self.federal_additional_expenses__M__eur_per_a.set_year_value(year, 0.0);
            self.federal_additional_tax_income__M__eur_per_a.set_year_value(year, 0.0);
            self.federal_cash_flow_netto__M__eur_per_a.set_year_value(year, 0.0);
            return;
        }

        let prev = year - 1;

        // Row 419: Invest Privat = D153 - D174 + D263 - D267
        let private_invest = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).private
            + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).private)
            - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).private
                + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).private)
            + energy.sol_rf_invest__M__eur_per_a().get_year(year).private
            - energy.sol_rf_grant__M__eur_per_a().get_year(year).private;
        self.private_invest__M__eur_per_a.set_year_value(year, private_invest);

        // Row 420: Mehr-Einnahmen - Mehr-Ausgaben Privat
        let sol_rf_costs_prev_private = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).private
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).private;
        let sol_rf_costs_curr_private = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).private
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).private;

        let private_effect_of_measures = (buildings.results.costs_total__M__eur.get_year(prev).private
            - buildings.results.costs_total__M__eur.get_year(year).private)
            + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).private
                - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).private)
            + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).private
                - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).private)
            + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).private
                - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).private)
            + (sol_rf_costs_prev_private - sol_rf_costs_curr_private)
            + (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).private
                - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).private)
            - (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).private
                - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).private);
        self.private_effect_of_measures__M__eur_per_a.set_year_value(year, private_effect_of_measures);

        // Row 421: Cash Flow Netto Privat
        let private_cash_flow_netto = private_effect_of_measures + private_invest;
        self.private_cash_flow_netto__M__eur_per_a.set_year_value(year, private_cash_flow_netto);

        // Row 423: Gewinne GHD
        let industry_profit = economy.turnover_local__M__eur().get_year(year)
            * constants::economy::revenue_margin;
        self.industry_profit_from_measures__M__eur_per_a.set_year_value(year, industry_profit);

        // Row 424: Invest GHD = (D154--D175) + (D264-D268) + (D297-D300)
        let industry_invest = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).industry
            + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).industry)
            + (buildings.grant_heat_sources__M__eur_per_a().get_year(year).industry
                + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).industry)
            + (energy.sol_rf_invest__M__eur_per_a().get_year(year).industry
                - energy.sol_rf_grant__M__eur_per_a().get_year(year).industry)
            + (energy.sol_os_invest__M__eur_per_a().get_year(year).industry
                - energy.sol_os_grant__M__eur_per_a().get_year(year).industry);
        self.industry_invest__M__eur_per_a.set_year_value(year, industry_invest);

        // Row 425: Mehr-Einnahmen - Mehr-Ausgaben GHD
        let sol_rf_costs_prev_industry = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).industry
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).industry;
        let sol_rf_costs_curr_industry = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).industry
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).industry;

        let industry_effect_of_measures = (buildings.results.costs_total__M__eur.get_year(prev).industry
            - buildings.results.costs_total__M__eur.get_year(year).industry)
            + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).industry
                - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).industry)
            + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).industry
                - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).industry)
            + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).industry
                - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).industry)
            + (sol_rf_costs_prev_industry - sol_rf_costs_curr_industry)
            + (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).industry
                - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).industry)
            - (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).industry
                - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).industry);
        self.industry_effect_of_measures__M__eur_per_a.set_year_value(year, industry_effect_of_measures);

        // Row 426: Cash Flow Netto GHD
        let industry_cash_flow_netto = industry_profit + industry_invest + industry_effect_of_measures;
        self.industry_cash_flow_netto__M__eur_per_a.set_year_value(year, industry_cash_flow_netto);

        // Row 428: Invest Kommune = (D155-D176) + (D265-D269) + (D298-D301)
        let community_invest = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).schools
            + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).schools)
            - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).schools
                + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).schools)
            + (energy.sol_rf_invest__M__eur_per_a().get_year(year).public
                - energy.sol_rf_grant__M__eur_per_a().get_year(year).public)
            + (energy.sol_os_invest__M__eur_per_a().get_year(year).public
                - energy.sol_os_grant__M__eur_per_a().get_year(year).public);
        self.community_invest__M__eur_per_a.set_year_value(year, community_invest);

        // Row 429: Mehr-Einnahmen - Mehr-Ausgaben Kommune
        let sol_rf_costs_prev_public = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).public
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).public;
        let sol_rf_costs_curr_public = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).public
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).public;

        let community_effect_of_measures = (buildings.results.costs_total__M__eur.get_year(prev).schools
            - buildings.results.costs_total__M__eur.get_year(year).schools)
            + (mobility.results.bev_nrg_costs__M__eur_per_a.get_year(prev).public
                - mobility.results.bev_nrg_costs__M__eur_per_a.get_year(year).public)
            + (mobility.results.cars_fuel_costs__M__eur_per_a.get_year(prev).public
                - mobility.results.cars_fuel_costs__M__eur_per_a.get_year(year).public)
            + (energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).public
                - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).public)
            + (sol_rf_costs_prev_public - sol_rf_costs_curr_public)
            + (energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(prev).public
                - energy.results.prchsd_nrg_mix_costs__M__eur_per_a.get_year(year).public)
            - (energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(prev).public
                - energy.results.prchsd_renewable_nrg__M__eur_per_a.get_year(year).public);
        self.community_effect_of_measures__M__eur_per_a.set_year_value(year, community_effect_of_measures);

        // Row 430: Mehr-Einnahmen aus Steuern und Abgaben Kommune
        let community_tax_income_from_measures = economy.income_tax_local__M__eur().get_year(year)
            + economy.business_tax_local__M__eur().get_year(year);
        self.community_tax_income_from_measures__M__eur_per_a.set_year_value(year, community_tax_income_from_measures);

        // Row 431: Cash Flow Netto Kommune
        let community_cash_flow_netto = community_tax_income_from_measures
            + community_effect_of_measures
            + community_invest;
        self.community_cash_flow_netto__M__eur_per_a.set_year_value(year, community_cash_flow_netto);

        // Row 433: Mehr-Ausgaben Bund/Land = -(D168+D173+D204+D270+D302)
        let federal_additional_expenses = -(buildings.grant_heat_sources__M__eur_per_a().get_year(year).sum()
            + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).sum()
            + mobility.cars_grant__M__eur_per_a().get_year(year).sum()
            + energy.sol_rf_grant__M__eur_per_a().get_year(year).sum()
            + energy.sol_os_grant__M__eur_per_a().get_year(year).sum());
        self.federal_additional_expenses__M__eur_per_a.set_year_value(year, federal_additional_expenses);

        // Row 434: Mehr-Einnahmen aus Steuern und Abgaben Bund/Land = D406+D409+D412+D413+D417
        let federal_additional_tax_income = economy.income_tax_national__M__eur().get_year(year)
            + economy.turnover_tax_national__M__eur().get_year(year)
            + economy.business_tax_national__M__eur().get_year(year)
            + economy.corporate_tax_national__M__eur().get_year(year)
            + economy.energy_tax_national__M__eur().get_year(year);
        self.federal_additional_tax_income__M__eur_per_a.set_year_value(year, federal_additional_tax_income);

        // Row 435: Cash Flow Netto Bund/Land
        let federal_cash_flow_netto = federal_additional_expenses + federal_additional_tax_income;
        self.federal_cash_flow_netto__M__eur_per_a.set_year_value(year, federal_cash_flow_netto);
    }
}
