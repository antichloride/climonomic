#![allow(non_snake_case)]

use crate::constants::buildings::EnergySource::oil;
use crate::constants::mobility as constants;
use crate::sectors::SectorsRawValues;

use super::Mobility;

impl Mobility {
    pub fn calculate(&mut self, year: u32) {
        let n_bev__k__ = self.inputs.n_bev__k__.get_year(year);
        let n_cars__k__ = self.inputs.n_cars__k__.get_year(year);

        // In Excel Version 5 (rows 196-198), car mileage is an input parameter:
        // Private: 15,000 km, GHD: 10,000 km, Public: 10,000 km
        let mut car_mileage = self.inputs.car_mileage_per_vehicle__k__km_per_a.get_year(year);
        if car_mileage.private == 0.0 {
            car_mileage.private = 15.0;
        }
        if car_mileage.industry == 0.0 {
            car_mileage.industry = 10.0;
        }
        if car_mileage.public == 0.0 {
            car_mileage.public = 10.0;
        }
        car_mileage.schools = 0.0;

        let traveld_dist_car__M__m_per_a = car_mileage;
        self.results
            .traveld_dist_car__M__m_per_a
            .set_year_values(year, &traveld_dist_car__M__m_per_a);

        self.results
            .n_cars__k__
            .set_year_values(year, &n_cars__k__);
        self.results
            .n_bev__k__
            .set_year_values(year, &n_bev__k__);
        self.results
            .car_mileage__k__km_per_a
            .set_year_values(year, &traveld_dist_car__M__m_per_a);

        if year != self.start_year {
            let n_bev__k___this_year = self.inputs.n_bev__k__.get_year(year);
            let n_bev__k___prev_year = self.inputs.n_bev__k__.get_year(year - 1);

            let cars_grant__M__eur_per_a = (&n_bev__k___this_year - &n_bev__k___prev_year)
                * constants::bev::grant_per_car__k__eur
                * n_bev__k___this_year.is_greater(&n_bev__k___prev_year);
            self.results
                .cars_grant__M__eur_per_a
                .set_year_values(year, &cars_grant__M__eur_per_a);
        }

        // Excel row 209: D192 * D196 * D$205 / 100 (in GWh/a)
        let bev_elec_nrg_dmd__G__W_h_per_a = &n_bev__k__
            * &traveld_dist_car__M__m_per_a
            * constants::bev::nrg_cnsmp__1em2__W_h_per_m
            * 1e-2;
        self.results
            .bev_elec_nrg_dmd__G__W_h_per_a
            .set_year_values(year, &bev_elec_nrg_dmd__G__W_h_per_a);

        // Excel row 213: (D188 - D192) * D196 * D$206 / 100 / 10 (in Mio. L/a)
        let cars_fuel_dmd__M__L_per_a = (&n_cars__k__ - &n_bev__k__)
            * &traveld_dist_car__M__m_per_a
            * constants::combustor::nrg_cnsmp__1em2__W_h_per_m
            / oil::energy_density__k__W_h_per_L
            * 1e-2;
        self.results
            .cars_fuel_dmd__M__L_per_a
            .set_year_values(year, &cars_fuel_dmd__M__L_per_a);

        let price_fuel__eur_per_L = self.inputs.price_fuel__eur_per_L.get_year(year);
        let cars_fuel_costs__M__eur_per_a =
            &cars_fuel_dmd__M__L_per_a * price_fuel__eur_per_L;
        self.results
            .cars_fuel_costs__M__eur_per_a
            .set_year_values(year, &cars_fuel_costs__M__eur_per_a);

        // Street lighting (Excel rows 225-230)
        let n_sl__k__ = self.inputs.n_sl__k__.get_year(year);
        let nrg_cnsmp_per_sl__k__W_h_per_a =
            self.inputs.nrg_cnsmp_per_sl__k__W_h_per_a.get_year(year);

        let sl_nrg_dmd__G__W_h_per_a =
            n_sl__k__ * 1e-3 * nrg_cnsmp_per_sl__k__W_h_per_a;
        self.results
            .sl_nrg_dmd__G__W_h_per_a
            .set_year_value(year, sl_nrg_dmd__G__W_h_per_a);
    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        nrg_own_mix_price__m__eur_per_W_h: SectorsRawValues,
    ) {
        let bev_elec_nrg_dmd__G__W_h_per_a = self
            .results
            .bev_elec_nrg_dmd__G__W_h_per_a
            .get_year(year);

        let bev_elec_nrg_price__G__W_h_per_a =
            &bev_elec_nrg_dmd__G__W_h_per_a * &nrg_own_mix_price__m__eur_per_W_h;
        self.results
            .bev_elec_nrg_price__G__W_h_per_a
            .set_year_values(year, &bev_elec_nrg_price__G__W_h_per_a);
        self.results
            .bev_nrg_costs__M__eur_per_a
            .set_year_values(year, &bev_elec_nrg_price__G__W_h_per_a);

        // Street lighting
        let n_sl__k__ = self.inputs.n_sl__k__.get_year(year);
        let nrg_cnsmp_per_sl__k__W_h_per_a =
            self.inputs.nrg_cnsmp_per_sl__k__W_h_per_a.get_year(year);
        let om_costs_per_sl__eur_per_a =
            self.inputs.om_costs_per_sl__eur_per_a.get_year(year);

        let sl_nrg_costs__M__eur_per_a = n_sl__k__
            * nrg_cnsmp_per_sl__k__W_h_per_a
            * nrg_own_mix_price__m__eur_per_W_h.public
            * 1e-3;
        self.results
            .sl_nrg_costs__M__eur_per_a
            .set_year_value(year, sl_nrg_costs__M__eur_per_a);

        let sl_om_costs__M__eur_per_a =
            n_sl__k__ * om_costs_per_sl__eur_per_a * 1e-3;
        self.results
            .sl_om_costs__M__eur_per_a
            .set_year_value(year, sl_om_costs__M__eur_per_a);

        let sl_total_costs__M__eur_per_a =
            sl_nrg_costs__M__eur_per_a + sl_om_costs__M__eur_per_a;
        self.results
            .sl_total_costs__M__eur_per_a
            .set_year_value(year, sl_total_costs__M__eur_per_a);
    }

    pub fn calculate_emissions(&mut self, year: u32) {
        let cars_fuel_dmd__M__L_per_a =
            self.results.cars_fuel_dmd__M__L_per_a.get_year(year);
        let cars_ems__k__to_coe_per_a =
            cars_fuel_dmd__M__L_per_a * oil::emission__kg_coe_per_L;
        self.results
            .cars_ems__k__to_coe_per_a
            .set_year_values(year, &cars_ems__k__to_coe_per_a);
    }
}
