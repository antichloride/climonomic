#![allow(non_snake_case)]

use crate::constants::energy as constants;
use crate::sectors::SectorsRawValues;

use super::Energy;

impl Energy {
    pub fn calculate(&mut self, year: u32) {
        // --- Rooftop Solar (Excel rows 241-282) ---
        let rf_A__ha = self.inputs.rf_A__ha.get_year(year);
        let sol_rf_suitable_A_part = self.inputs.sol_rf_suitable_A_part.get_year(year);
        let sol_rf_installed__M__Wp = self.inputs.sol_rf_installed__M__Wp.get_year(year);
        let sol_rf_self_cnsmp_part = self.inputs.sol_rf_self_cnsmp_part.get_year(year);

        // Excel row 241: rf_A * suitable * 0.1666667
        let sol_rf_potential__M__Wp = &rf_A__ha
            * &sol_rf_suitable_A_part
            * constants::solar_roof.power_per_area__k__Wp_per_m2;
        self.results
            .sol_rf_potential__M__Wp
            .set_year_values(year, &sol_rf_potential__M__Wp);

        self.results
            .sol_rf_installed__M__Wp
            .set_year_values(year, &sol_rf_installed__M__Wp);

        self.results
            .sol_rf_self_cnsmp_part
            .set_year_values(year, &sol_rf_self_cnsmp_part);

        // Excel row 249: sol_rf_installed * 900.0 (in Excel, MWp * 900)
        let sol_rf_nrg__G__W_h_per_a =
            &sol_rf_installed__M__Wp * constants::solar_roof.Wp_to_W_h_per_a;
        self.results
            .sol_rf_nrg__G__W_h_per_a
            .set_year_values(year, &sol_rf_nrg__G__W_h_per_a);

        // Excel row 257: sol_rf_nrg * sol_rf_self_cnsmp_part
        // @eq: sol_rf_self_cnsmp__G__W_h_per_a = sol_rf_nrg__G__W_h_per_a * sol_rf_self_cnsmp_part
        let sol_rf_self_cnsmp__G__W_h_per_a =
            &sol_rf_nrg__G__W_h_per_a * &sol_rf_self_cnsmp_part;
        self.results
            .sol_rf_self_cnsmp__G__W_h_per_a
            .set_year_values(year, &sol_rf_self_cnsmp__G__W_h_per_a);

        if year != self.start_year {
            let sol_rf_installed__M__Wp_this_year =
                self.inputs.sol_rf_installed__M__Wp.get_year(year);
            let sol_rf_installed__M__Wp_prev_year =
                self.inputs.sol_rf_installed__M__Wp.get_year(year - 1);

            // Excel row 263: delta_installed * 1500.0
            let sol_rf_invest__M__eur_per_a = (&sol_rf_installed__M__Wp_this_year
                - &sol_rf_installed__M__Wp_prev_year)
                * constants::solar_roof.invest__m__eur_per_Wp
                * sol_rf_installed__M__Wp_this_year
                    .is_greater(&sol_rf_installed__M__Wp_prev_year);
            self.results
                .sol_rf_invest__M__eur_per_a
                .set_year_values(year, &sol_rf_invest__M__eur_per_a);

            // Excel row 267: delta_installed * 500.0
            let sol_rf_grant__M__eur_per_a = (&sol_rf_installed__M__Wp_this_year
                - &sol_rf_installed__M__Wp_prev_year)
                * constants::solar_roof.grant__m__eur_per_Wp
                * sol_rf_installed__M__Wp_this_year
                    .is_greater(&sol_rf_installed__M__Wp_prev_year);
            self.results
                .sol_rf_grant__M__eur_per_a
                .set_year_values(year, &sol_rf_grant__M__eur_per_a);

            let sol_rf_om__M__eur_per_a_last_year =
                self.results.sol_rf_om__M__eur_per_a.get_year(year - 1);
            let sol_rf_om__M__eur_per_a = &sol_rf_om__M__eur_per_a_last_year
                + &(&sol_rf_invest__M__eur_per_a * constants::solar_roof.operation_costs);
            self.results
                .sol_rf_om__M__eur_per_a
                .set_year_values(year, &sol_rf_om__M__eur_per_a);
        }

        // Excel row 272: (sol_rf_nrg - sol_rf_self_cnsmp) * buyback_price
        let sol_rf_revenue__M__eur_per_a = (&sol_rf_nrg__G__W_h_per_a
            - &sol_rf_self_cnsmp__G__W_h_per_a)
            * constants::solar_roof.buyback_price__m__eur_per_W_h;
        self.results
            .sol_rf_revenue__M__eur_per_a
            .set_year_values(year, &sol_rf_revenue__M__eur_per_a);

        // --- Open-Space Solar (Excel rows 284-315) ---
        let sol_os_installed_A__ha = self.inputs.sol_os_installed_A__ha.get_year(year);
        let sol_os_self_cnsmp_part = self.inputs.sol_os_self_cnsmp_part.get_year(year);

        // Excel row 289: hectares * 0.08333333 / 10
        let sol_os_installed__M__Wp = 1e-1
            * &sol_os_installed_A__ha
            * constants::solar_landscape.power_per_area__k__Wp_per_m2;
        self.results
            .sol_os_installed__M__Wp
            .set_year_values(year, &sol_os_installed__M__Wp);

        // Excel row 292: MWp * 900 / 1000
        let sol_os_nrg__G__W_h_per_a = 1e-3
            * &sol_os_installed__M__Wp
            * constants::solar_landscape.Wp_to_W_h_per_a;
        self.results
            .sol_os_nrg__G__W_h_per_a
            .set_year_values(year, &sol_os_nrg__G__W_h_per_a);

        let sol_os_self_cnsmp__G__W_h_per_a =
            &sol_os_nrg__G__W_h_per_a * &sol_os_self_cnsmp_part;
        self.results
            .sol_os_self_cnsmp__G__W_h_per_a
            .set_year_values(year, &sol_os_self_cnsmp__G__W_h_per_a);

        if year != self.start_year {
            let sol_os_installed__M__Wp_this_year =
                self.results.sol_os_installed__M__Wp.get_year(year);
            let sol_os_installed__M__Wp_prev_year =
                self.results.sol_os_installed__M__Wp.get_year(year - 1);

            // Excel row 297: (MWp_this - MWp_prev) * 1200
            let sol_os_invest__M__eur_per_a = (&sol_os_installed__M__Wp_this_year
                - &sol_os_installed__M__Wp_prev_year)
                * constants::solar_landscape.invest__m__eur_per_Wp
                * sol_os_installed__M__Wp_this_year
                    .is_greater(&sol_os_installed__M__Wp_prev_year);
            self.results
                .sol_os_invest__M__eur_per_a
                .set_year_values(year, &sol_os_invest__M__eur_per_a);

            // Excel row 300: (MWp_this - MWp_prev) * 500
            let sol_os_grant__M__eur_per_a = (&sol_os_installed__M__Wp_this_year
                - &sol_os_installed__M__Wp_prev_year)
                * constants::solar_landscape.grant__m__eur_per_Wp
                * sol_os_installed__M__Wp_this_year
                    .is_greater(&sol_os_installed__M__Wp_prev_year);
            self.results
                .sol_os_grant__M__eur_per_a
                .set_year_values(year, &sol_os_grant__M__eur_per_a);

            let sol_os_om__M__eur_per_a_last_year =
                self.results.sol_os_om__M__eur_per_a.get_year(year - 1);
            let sol_os_om__M__eur_per_a = &sol_os_om__M__eur_per_a_last_year
                + &(&sol_os_invest__M__eur_per_a * constants::solar_landscape.operation_costs);
            self.results
                .sol_os_om__M__eur_per_a
                .set_year_values(year, &sol_os_om__M__eur_per_a);
        }

        // Excel row 310: generation * 0.07037
        // @eq: sol_os_turnover_buyback__M__eur_per_a = sol_os_nrg__G__W_h_per_a * buyback_price__m__eur_per_W_h
        let sol_os_turnover_buyback__M__eur_per_a = &sol_os_nrg__G__W_h_per_a
            * constants::solar_landscape.buyback_price__m__eur_per_W_h;
        self.results
            .sol_os_turnover_buyback__M__eur_per_a
            .set_year_values(year, &sol_os_turnover_buyback__M__eur_per_a);

        // Excel row 306: generation * 0.07037 (generation cost)
        let sol_os_prod_costs__M__eur_per_a = &sol_os_nrg__G__W_h_per_a
            * constants::solar_landscape.costs;
        self.results
            .sol_os_prod_costs__M__eur_per_a
            .set_year_values(year, &sol_os_prod_costs__M__eur_per_a);

        // Excel row 313: buyback - prod_costs (profit = 0 in v5)
        // @eq: sol_os_revenue__M__eur_per_a = sol_os_turnover_buyback__M__eur_per_a - sol_os_prod_costs__M__eur_per_a
        let sol_os_revenue__M__eur_per_a =
            &sol_os_turnover_buyback__M__eur_per_a - &sol_os_prod_costs__M__eur_per_a;
        self.results
            .sol_os_revenue__M__eur_per_a
            .set_year_values(year, &sol_os_revenue__M__eur_per_a);

        self.results
            .sol_os_installed_A__ha
            .set_year_values(year, &sol_os_installed_A__ha);

        self.results
            .sol_os_profit__M__eur_per_a
            .set_year_values(year, &sol_os_revenue__M__eur_per_a);

        // --- Wind Energy ---
        let mut wind_om__M__eur_per_a = SectorsRawValues::new();
        let wind_installed_A__ha = self.inputs.wind_installed_A__ha.get_year(year);

        let wind_installed__M__WP = 1e1
            * &wind_installed_A__ha
            * constants::wind_onshore.power_per_area__k__Wp_per_m2;
        self.results
            .wind_installed__M__WP
            .set_year_values(year, &wind_installed__M__WP);

        let wind_nrg__G__W_h_per_a =
            1e-3 * &wind_installed__M__WP * constants::wind_onshore.Wp_to_W_h_per_a;
        self.results
            .wind_nrg__G__W_h_per_a
            .set_year_values(year, &wind_nrg__G__W_h_per_a);

        if year != self.start_year {
            let wind_installed__M__WP_this_year =
                self.results.wind_installed__M__WP.get_year(year);
            let wind_installed__M__WP_prev_year =
                self.results.wind_installed__M__WP.get_year(year - 1);

            let wind_invest__M__eur_per_a = 1e-3
                * (&wind_installed__M__WP_this_year - &wind_installed__M__WP_prev_year)
                * constants::wind_onshore.invest__m__eur_per_Wp
                * wind_installed__M__WP_this_year
                    .is_greater(&wind_installed__M__WP_prev_year);
            self.results
                .wind_invest__M__eur_per_a
                .set_year_values(year, &wind_invest__M__eur_per_a);

            let wind_grant__M__eur_per_a = 1e-3
                * (&wind_installed__M__WP_this_year - &wind_installed__M__WP_prev_year)
                * constants::wind_onshore.grant__m__eur_per_Wp
                * wind_installed__M__WP_this_year
                    .is_greater(&wind_installed__M__WP_prev_year);
            self.results
                .wind_grant__M__eur_per_a
                .set_year_values(year, &wind_grant__M__eur_per_a);

            let wind_om__M__eur_per_a_last_year =
                self.results.wind_om__M__eur_per_a.get_year(year - 1);
            wind_om__M__eur_per_a = &wind_om__M__eur_per_a_last_year
                + &(&wind_invest__M__eur_per_a * constants::wind_onshore.operation_costs);
            self.results
                .wind_om__M__eur_per_a
                .set_year_values(year, &wind_om__M__eur_per_a);
        }

        // @eq: wind_turnover_buyback__M__eur_per_a = wind_nrg__G__W_h_per_a * buyback_price__m__eur_per_W_h
        let wind_turnover_buyback__M__eur_per_a =
            &wind_nrg__G__W_h_per_a * constants::wind_onshore.buyback_price__m__eur_per_W_h;
        self.results
            .wind_turnover_buyback__M__eur_per_a
            .set_year_values(year, &wind_turnover_buyback__M__eur_per_a);

        // @eq: wind_revenue__M__eur_per_a = wind_turnover_buyback__M__eur_per_a - wind_om__M__eur_per_a
        let wind_revenue__M__eur_per_a =
            &wind_turnover_buyback__M__eur_per_a - &wind_om__M__eur_per_a;
        self.results
            .wind_revenue__M__eur_per_a
            .set_year_values(year, &wind_revenue__M__eur_per_a);

        // --- Purchase of Renewable Energy (Excel rows 317-327) ---
        let prchsd_renewable_nrg__G__W_h_per_a =
            self.inputs.prchsd_renewable_nrg__G__W_h_per_a.get_year(year);
        self.results
            .prchsd_renewable_nrg__G__W_h_per_a
            .set_year_values(year, &prchsd_renewable_nrg__G__W_h_per_a);

        let renewable_nrg_price__m__eur_per_W_h =
            self.inputs.renewable_nrg_price__m__eur_per_W_h.get_year(year);

        // @eq: prchsd_renewable_nrg__M__eur_per_a = prchsd_renewable_nrg__G__W_h_per_a * renewable_nrg_price__m__eur_per_W_h
        let prchsd_renewable_nrg__M__eur_per_a =
            &prchsd_renewable_nrg__G__W_h_per_a * &renewable_nrg_price__m__eur_per_W_h;
        self.results
            .prchsd_renewable_nrg__M__eur_per_a
            .set_year_values(year, &prchsd_renewable_nrg__M__eur_per_a);

        self.results
            .prchsd_renewable_nrg_price__eur_per_kWh
            .set_year_values(year, &renewable_nrg_price__m__eur_per_W_h);
    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        electric_power_demand_buildings: SectorsRawValues,
        energy_heating_heat_pump: SectorsRawValues,
        bev_electric_power_demand: SectorsRawValues,
        _sl_nrg_dmd__G__W_h_per_a: f64,
    ) {
        // Excel row 235-238: Buildings + Heat pump + BEV
        let mut elec_nrg_dmd__G__W_h_per_a =
            &electric_power_demand_buildings + &energy_heating_heat_pump + bev_electric_power_demand;
        // Public sector includes schools (Excel row 237)
        elec_nrg_dmd__G__W_h_per_a.public += elec_nrg_dmd__G__W_h_per_a.schools;
        elec_nrg_dmd__G__W_h_per_a.schools = 0.0;
        self.results
            .elec_nrg_dmd__G__W_h_per_a
            .set_year_values(year, &elec_nrg_dmd__G__W_h_per_a);

        let sol_rf_self_cnsmp__G__W_h_per_a =
            self.results.sol_rf_self_cnsmp__G__W_h_per_a.get_year(year);
        let sol_os_self_cnsmp__G__W_h_per_a =
            self.results.sol_os_self_cnsmp__G__W_h_per_a.get_year(year);
        let prchsd_renewable_nrg__G__W_h_per_a =
            self.inputs.prchsd_renewable_nrg__G__W_h_per_a.get_year(year);

        // Excel row 329: IF(elec_nrg_dmd - sol_rf_self_cnsmp - green_direct > 0, ...)
        let mut prchsd_nrg_mix__G__W_h_per_a = &elec_nrg_dmd__G__W_h_per_a
            - &sol_rf_self_cnsmp__G__W_h_per_a
            - &sol_os_self_cnsmp__G__W_h_per_a
            - &prchsd_renewable_nrg__G__W_h_per_a;
        if prchsd_nrg_mix__G__W_h_per_a.private < 0.0 { prchsd_nrg_mix__G__W_h_per_a.private = 0.0; }
        if prchsd_nrg_mix__G__W_h_per_a.industry < 0.0 { prchsd_nrg_mix__G__W_h_per_a.industry = 0.0; }
        if prchsd_nrg_mix__G__W_h_per_a.schools < 0.0 { prchsd_nrg_mix__G__W_h_per_a.schools = 0.0; }
        if prchsd_nrg_mix__G__W_h_per_a.public < 0.0 { prchsd_nrg_mix__G__W_h_per_a.public = 0.0; }

        self.results
            .prchsd_nrg_mix__G__W_h_per_a
            .set_year_values(year, &prchsd_nrg_mix__G__W_h_per_a);

        let nrg_mix_price__m__eur_per_W_h =
            self.inputs.nrg_mix_price__m__eur_per_W_h.get_year(year);

        // @eq: prchsd_nrg_mix_costs__M__eur_per_a = prchsd_nrg_mix__G__W_h_per_a * nrg_mix_price__m__eur_per_W_h
        let prchsd_nrg_mix_costs__M__eur_per_a = &prchsd_nrg_mix__G__W_h_per_a
            * &nrg_mix_price__m__eur_per_W_h;
        self.results
            .prchsd_nrg_mix_costs__M__eur_per_a
            .set_year_values(year, &prchsd_nrg_mix_costs__M__eur_per_a);

        let prchsd_renewable_nrg__M__eur_per_a = self
            .results
            .prchsd_renewable_nrg__M__eur_per_a
            .get_year(year);

        let sol_rf_revenue__M__eur_per_a =
            self.results.sol_rf_revenue__M__eur_per_a.get_year(year);

        // Excel row 276: sol_rf_self_cnsmp * 0.07037 - sol_rf_revenue
        let sol_rf_costs__M__eur_per_a =
            &sol_rf_self_cnsmp__G__W_h_per_a * constants::solar_roof.buyback_price__m__eur_per_W_h
                - &sol_rf_revenue__M__eur_per_a;
        self.results
            .sol_rf_costs__M__eur_per_a
            .set_year_values(year, &sol_rf_costs__M__eur_per_a);

        // Excel row 280: sol_rf_costs / sol_rf_self_cnsmp
        // @eq: sol_rf_costs__eur_per_kWh = sol_rf_costs__M__eur_per_a / sol_rf_self_cnsmp__G__W_h_per_a
        let mut sol_rf_costs__eur_per_kWh = &sol_rf_costs__M__eur_per_a / &sol_rf_self_cnsmp__G__W_h_per_a;
        if sol_rf_self_cnsmp__G__W_h_per_a.private == 0.0 { sol_rf_costs__eur_per_kWh.private = 0.0; }
        if sol_rf_self_cnsmp__G__W_h_per_a.industry == 0.0 { sol_rf_costs__eur_per_kWh.industry = 0.0; }
        if sol_rf_self_cnsmp__G__W_h_per_a.public == 0.0 { sol_rf_costs__eur_per_kWh.public = 0.0; }
        if sol_rf_self_cnsmp__G__W_h_per_a.schools == 0.0 { sol_rf_costs__eur_per_kWh.schools = 0.0; }
        self.results
            .sol_rf_costs__eur_per_kWh
            .set_year_values(year, &sol_rf_costs__eur_per_kWh);

        self.results
            .prchsd_nrg_mix_price__eur_per_kWh
            .set_year_values(year, &nrg_mix_price__m__eur_per_W_h);

        // Excel row 347: (sol_rf_costs + green_direct_costs + grid_mix_costs) / (sol_rf_self_cnsmp + green_direct + grid_mix)
        let total_nrg_costs__M__eur_per_a = SectorsRawValues {
            private: prchsd_renewable_nrg__M__eur_per_a.private + prchsd_nrg_mix_costs__M__eur_per_a.private + sol_rf_costs__M__eur_per_a.private,
            industry: prchsd_renewable_nrg__M__eur_per_a.industry + prchsd_nrg_mix_costs__M__eur_per_a.industry + sol_rf_costs__M__eur_per_a.industry,
            schools: prchsd_renewable_nrg__M__eur_per_a.schools + prchsd_nrg_mix_costs__M__eur_per_a.schools + sol_rf_costs__M__eur_per_a.schools,
            public: prchsd_renewable_nrg__M__eur_per_a.public + prchsd_nrg_mix_costs__M__eur_per_a.public + sol_rf_costs__M__eur_per_a.public,
        };

        let total_nrg_volume__G__W_h_per_a = SectorsRawValues {
            private: sol_rf_self_cnsmp__G__W_h_per_a.private + prchsd_renewable_nrg__G__W_h_per_a.private + prchsd_nrg_mix__G__W_h_per_a.private,
            industry: sol_rf_self_cnsmp__G__W_h_per_a.industry + prchsd_renewable_nrg__G__W_h_per_a.industry + prchsd_nrg_mix__G__W_h_per_a.industry,
            schools: sol_rf_self_cnsmp__G__W_h_per_a.schools + prchsd_renewable_nrg__G__W_h_per_a.schools + prchsd_nrg_mix__G__W_h_per_a.schools,
            public: sol_rf_self_cnsmp__G__W_h_per_a.public + prchsd_renewable_nrg__G__W_h_per_a.public + prchsd_nrg_mix__G__W_h_per_a.public,
        };

        let mut nrg_own_mix_price__m__eur_per_W_h =
            &total_nrg_costs__M__eur_per_a / &total_nrg_volume__G__W_h_per_a;
        if total_nrg_volume__G__W_h_per_a.private == 0.0 {
            nrg_own_mix_price__m__eur_per_W_h.private = 0.04062335;
        }
        if total_nrg_volume__G__W_h_per_a.industry == 0.0 {
            nrg_own_mix_price__m__eur_per_W_h.industry = 0.04062335;
        }
        if total_nrg_volume__G__W_h_per_a.public == 0.0 {
            nrg_own_mix_price__m__eur_per_W_h.public = 0.04062335;
        }
        nrg_own_mix_price__m__eur_per_W_h.schools =
            nrg_own_mix_price__m__eur_per_W_h.public;

        self.results
            .nrg_own_mix_price__m__eur_per_W_h
            .set_year_values(year, &nrg_own_mix_price__m__eur_per_W_h);
    }

    pub fn calculate_emissions(&mut self, year: u32) {
        let prchsd_nrg_mix__G__W_h_per_a =
            self.results.prchsd_nrg_mix__G__W_h_per_a.get_year(year);

        // Excel row 360: D329 * 360 / 1000 (in k to CO2/a)
        let prchsd_nrg_mix_ems__k__to_coe_per_a = &prchsd_nrg_mix__G__W_h_per_a
            * constants::evu_emissions::weighted_average
            * 1e-3;

        self.results
            .prchsd_nrg_mix_ems__k__to_coe_per_a
            .set_year_values(year, &prchsd_nrg_mix_ems__k__to_coe_per_a);

        // Feed-in total (Excel row 372): Private PV * (1 - self_consumption)
        let sol_rf_nrg = self.results.sol_rf_nrg__G__W_h_per_a.get_year(year);
        let sol_rf_self_cnsmp_part = self.inputs.sol_rf_self_cnsmp_part.get_year(year);
        let feed_in_total = sol_rf_nrg.private * (1.0 - sol_rf_self_cnsmp_part.private);
        self.feed_in_total__G__W_h_per_a.set_year_value(year, feed_in_total);

        // Feed-in emissions avoided (Excel row 373):
        // feed_in_total * (D340 * 1000 + D341 * 600) / (D340 + D341) / 1000
        let coal_share = constants::evu_power_mix::coal;
        let gas_share = constants::evu_power_mix::gas;
        let coal_factor = constants::evu_emissions::coal;
        let gas_factor = constants::evu_emissions::gas;
        let avoidance_factor = (coal_share * coal_factor + gas_share * gas_factor) / (coal_share + gas_share) / 1000.0;
        let feed_in_ems_avoided = feed_in_total * avoidance_factor;
        self.feed_in_ems_avoided__k__to_coe_per_a.set_year_value(year, feed_in_ems_avoided);
    }
}
