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

        let results = &mut *self;
        let prev = year - 1;

        // Row 419: Invest Privat = D153 - D174 + D263 - D267
        crate::equation! {
            /// Total private capital expenditure for climate protection measures
            results.private_invest__M__eur_per_a[year] = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).private
                + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).private)
                - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).private
                    + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).private)
                + energy.sol_rf_invest__M__eur_per_a().get_year(year).private
                - energy.sol_rf_grant__M__eur_per_a().get_year(year).private;
        }

        // Row 420: Mehr-Einnahmen - Mehr-Ausgaben Privat
        let sol_rf_costs_prev_private = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).private
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).private;
        let sol_rf_costs_curr_private = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).private
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).private;

        crate::equation! {
            /// Net annual operational savings for private households
            results.private_effect_of_measures__M__eur_per_a[year] = (buildings.results.costs_total__M__eur.get_year(prev).private
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
        }

        // Row 421: Cash Flow Netto Privat
        crate::equation! {
            /// Net annual cash flow balance for private households
            results.private_cash_flow_netto__M__eur_per_a[year] = private_effect_of_measures__M__eur_per_a + private_invest__M__eur_per_a;
        }

        // Row 423: Gewinne GHD
        crate::equation! {
            /// Operating profit for commercial and industrial businesses
            results.industry_profit_from_measures__M__eur_per_a[year] = economy.turnover_local__M__eur().get_year(year)
                * constants::economy::revenue_margin;
        }

        // Row 424: Invest GHD = (D154--D175) + (D264-D268) + (D297-D300)
        crate::equation! {
            /// Capital expenditure for commercial and industrial enterprises
            results.industry_invest__M__eur_per_a[year] = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).industry
                + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).industry)
                + (buildings.grant_heat_sources__M__eur_per_a().get_year(year).industry
                    + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).industry)
                + (energy.sol_rf_invest__M__eur_per_a().get_year(year).industry
                    - energy.sol_rf_grant__M__eur_per_a().get_year(year).industry)
                + (energy.sol_os_invest__M__eur_per_a().get_year(year).industry
                    - energy.sol_os_grant__M__eur_per_a().get_year(year).industry);
        }

        // Row 425: Mehr-Einnahmen - Mehr-Ausgaben GHD
        let sol_rf_costs_prev_industry = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).industry
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).industry;
        let sol_rf_costs_curr_industry = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).industry
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).industry;

        crate::equation! {
            /// Operational financial effects and savings for commercial sector
            results.industry_effect_of_measures__M__eur_per_a[year] = (buildings.results.costs_total__M__eur.get_year(prev).industry
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
        }

        // Row 426: Cash Flow Netto GHD
        crate::equation! {
            /// Net annual cash flow balance for commercial and industrial sector
            results.industry_cash_flow_netto__M__eur_per_a[year] = industry_profit_from_measures__M__eur_per_a + industry_invest__M__eur_per_a + industry_effect_of_measures__M__eur_per_a;
        }

        // Row 428: Invest Kommune = (D155-D176) + (D265-D269) + (D298-D301)
        crate::equation! {
            /// Municipal capital expenditure for public buildings and infrastructure
            results.community_invest__M__eur_per_a[year] = (buildings.invest_heat_sources__M__eur_per_a().get_year(year).public
                + buildings.invest_energetic_renovation__M__eur_per_a().get_year(year).public)
                - (buildings.grant_heat_sources__M__eur_per_a().get_year(year).public
                    + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).public)
                + (energy.sol_rf_invest__M__eur_per_a().get_year(year).public
                    - energy.sol_rf_grant__M__eur_per_a().get_year(year).public)
                + (energy.sol_os_invest__M__eur_per_a().get_year(year).public
                    - energy.sol_os_grant__M__eur_per_a().get_year(year).public);
        }

        // Row 429: Mehr-Einnahmen - Mehr-Ausgaben Kommune
        let sol_rf_costs_prev_public = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(prev).public
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(prev).public;
        let sol_rf_costs_curr_public = energy.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year).public
            * constants::energy::solar_roof.buyback_price__m__eur_per_W_h
            - energy.results.sol_rf_revenue__M__eur_per_a.get_year(year).public;

        crate::equation! {
            /// Operational financial effects and savings for the municipality
            results.community_effect_of_measures__M__eur_per_a[year] = (buildings.results.costs_total__M__eur.get_year(prev).public
                - buildings.results.costs_total__M__eur.get_year(year).public)
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
        }

        // Row 430: Mehr-Einnahmen aus Steuern und Abgaben Kommune
        crate::equation! {
            /// Additional municipal tax revenue generated by climate measures
            results.community_tax_income_from_measures__M__eur_per_a[year] = economy.income_tax_local__M__eur().get_year(year)
                + economy.business_tax_local__M__eur().get_year(year);
        }

        // Row 431: Cash Flow Netto Kommune
        crate::equation! {
            /// Net annual municipal cash flow balance
            results.community_cash_flow_netto__M__eur_per_a[year] = community_tax_income_from_measures__M__eur_per_a
                + community_effect_of_measures__M__eur_per_a
                + community_invest__M__eur_per_a;
        }

        // Row 433: Mehr-Ausgaben Bund/Land = -(D168+D173+D204+D270+D302)
        crate::equation! {
            /// Total federal and state grant expenditures for climate measures
            results.federal_additional_expenses__M__eur_per_a[year] = -(buildings.grant_heat_sources__M__eur_per_a().get_year(year).sum()
                + buildings.grant_energetic_renovation__M__eur_per_a().get_year(year).sum()
                + mobility.cars_grant__M__eur_per_a().get_year(year).sum()
                + energy.sol_rf_grant__M__eur_per_a().get_year(year).sum()
                + energy.sol_os_grant__M__eur_per_a().get_year(year).sum());
        }

        // Row 434: Mehr-Einnahmen aus Steuern und Abgaben Bund/Land = D406+D409+D412+D413+D417
        crate::equation! {
            /// Additional federal and state tax revenue from climate activities
            results.federal_additional_tax_income__M__eur_per_a[year] = economy.income_tax_national__M__eur().get_year(year)
                + economy.turnover_tax_national__M__eur().get_year(year)
                + economy.business_tax_national__M__eur().get_year(year)
                + economy.corporate_tax_national__M__eur().get_year(year)
                + economy.energy_tax_national__M__eur().get_year(year);
        }

        // Row 435: Cash Flow Netto Bund/Land
        crate::equation! {
            /// Net annual federal and state cash flow balance
            results.federal_cash_flow_netto__M__eur_per_a[year] = federal_additional_expenses__M__eur_per_a + federal_additional_tax_income__M__eur_per_a;
        }
    }
}
