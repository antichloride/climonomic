#![allow(non_snake_case)]

use crate::constants::buildings as constants;
use crate::constants::energy::evu_discount_heat_pump;
use crate::sectors::SectorsRawValues;
use crate::sectors::SectorsResult;

use super::types::InputsBuildings;
use super::Buildings;

pub(crate) fn compute_A_heat_other__k__m2(inputs: &InputsBuildings, year: u32) -> SectorsRawValues {
    let floor_A_building__m2 = inputs.floor_A_building__m2.get_year(year);
    let n_buildings = inputs.n_buildings.get_year(year);
    let A_heat_oil__k__m2 = inputs.A_heat_oil__k__m2.get_year(year);
    let A_heat_oil_condensing__k__m2 = inputs.A_heat_oil_condensing__k__m2.get_year(year);
    let A_heat_gas__k__m2 = inputs.A_heat_gas__k__m2.get_year(year);
    let A_heat_district_heating__k__m2 = inputs.A_heat_district_heating__k__m2.get_year(year);
    let A_heat_heat_pump__k__m2 = inputs.A_heat_heat_pump__k__m2.get_year(year);
    (floor_A_building__m2 * n_buildings * 1e-3)
        - (A_heat_oil__k__m2
            + A_heat_oil_condensing__k__m2
            + A_heat_gas__k__m2
            + A_heat_heat_pump__k__m2
            + A_heat_district_heating__k__m2)
            .copy()
}

impl Buildings {
    pub fn calculate(&mut self, year: u32) {
        let inputs = &self.inputs;
        let results = &mut self.results;

        let floor_A_building__m2 = inputs.floor_A_building__m2.get_year(year);
        let n_buildings = inputs.n_buildings.get_year(year);
        let n_inhabitants__k__ = inputs.n_inhabitants__k__.get_year(year);
        let heat_dmd__k__W_h_per_m2_a = inputs.heat_dmd__k__W_h_per_m2_a.get_year(year);
        let hot_water_dmd__k__W_h_per_m2_a = inputs.hot_water_dmd__k__W_h_per_m2_a.get_year(year);
        let elec_dmd_capita__k_W_h_per_a = inputs.elec_dmd_capita__k_W_h_per_a.get_year(year);

        let floor_A__k__m2 = &floor_A_building__m2 * &n_buildings * 1e-3;
        results.floor_A__k__m2.set_year_values(year, &floor_A__k__m2);

        let total_heat_dmd__G__W_h_per_a = (&n_inhabitants__k__ * &hot_water_dmd__k__W_h_per_m2_a
            + &heat_dmd__k__W_h_per_m2_a * &floor_A__k__m2)
            * 1e-3;
        results
            .total_heat_dmd__G__W_h_per_a
            .set_year_values(year, &total_heat_dmd__G__W_h_per_a);

        let elec_dmd__G__W_h_per_a =
            &elec_dmd_capita__k_W_h_per_a * &n_inhabitants__k__ * 1e-3;
        results
            .elec_dmd__G__W_h_per_a
            .set_year_values(year, &elec_dmd__G__W_h_per_a);

        // Energy Consumption of different heating types
        let total_heat_dmd__M__W_h_per_m2_a =
            &total_heat_dmd__G__W_h_per_a / &floor_A__k__m2;

        macro_rules! implement_heat_types_input_consumption {
            ($((
                $heat_type: ident,
                $heat_type_A: ident,
                $heat_type_cnsmp_in: ident
            )),*) => {
                $(
                    let $heat_type_A =
                        self.inputs.$heat_type_A.get_year(year);
                    let $heat_type_cnsmp_in = &$heat_type_A
                        * &total_heat_dmd__M__W_h_per_m2_a
                        / constants::$heat_type.efficency;
                    results.$heat_type_cnsmp_in
                        .set_year_values(year, &$heat_type_cnsmp_in);
                )*

                let A_heat_other__k__m2 =
                    compute_A_heat_other__k__m2(&self.inputs, year);
                let cnsmp_other__G__W_h_per_a = &A_heat_other__k__m2
                    * &total_heat_dmd__M__W_h_per_m2_a
                    / constants::other.efficency;
                results.cnsmp_other__G__W_h_per_a
                    .set_year_values(year, &cnsmp_other__G__W_h_per_a);

                let price_other_output_nrg__m__eur_per_W_h =
                    self.inputs.price_other_output_nrg__m__eur_per_W_h.get_year(year);
                let costs_other__M__eur_per_a = &cnsmp_other__G__W_h_per_a
                    * price_other_output_nrg__m__eur_per_W_h;
                results.costs_other__M__eur_per_a
                    .set_year_values(year, &costs_other__M__eur_per_a);
            }
        }

        implement_heat_types_input_consumption! {
            (
                oil_no_condensing,
                A_heat_oil__k__m2,
                cnsmp_oil__G__W_h_per_a
            ),
            (
                oil_with_condensing,
                A_heat_oil_condensing__k__m2,
                cnsmp_oil_condensing__G__W_h_per_a
            ),
            (
                gas,
                A_heat_gas__k__m2,
                cnsmp_gas__G__W_h_per_a
            ),
            (
                district_heating,
                A_heat_district_heating__k__m2,
                cnsmp_district_heating__G__W_h_per_a
            ),
            (
                heat_pump,
                A_heat_heat_pump__k__m2,
                cnsmp_elec_heat_pump__G__W_h_per_a
            )
        }

        let cnsmp_oil__M__L_per_a =
            (&cnsmp_oil__G__W_h_per_a + &cnsmp_oil_condensing__G__W_h_per_a)
                / constants::EnergySource::oil::energy_density__k__W_h_per_L;
        results
            .cnsmp_oil__M__L_per_a
            .set_year_values(year, &cnsmp_oil__M__L_per_a);

        let cnsmp_gas__M__m3_per_a = &cnsmp_gas__G__W_h_per_a
            / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        results
            .cnsmp_gas__M__m3_per_a
            .set_year_values(year, &cnsmp_gas__M__m3_per_a);

        let district_heating_renewable_part =
            self.inputs.district_heating_renewable_part.get_year(year);
        let cnsmp_gas_district_heating__M__m3_per_a = (1.0 - &district_heating_renewable_part)
            * &cnsmp_district_heating__G__W_h_per_a
            / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        results
            .cnsmp_gas_district_heating__M__m3_per_a
            .set_year_values(year, &cnsmp_gas_district_heating__M__m3_per_a);

        // Costs
        let price_oil__eur_per_L = self.inputs.price_oil__eur_per_L.get_year(year);
        let price_gas__eur_per_m3 = self.inputs.price_gas__eur_per_m3.get_year(year);
        let price_district_heating__m__eur_per_W_h =
            self.inputs.price_district_heating__m__eur_per_W_h.get_year(year);

        let costs_oil__M__eur_per_a = &cnsmp_oil__M__L_per_a * price_oil__eur_per_L;
        results
            .costs_oil__M__eur_per_a
            .set_year_values(year, &costs_oil__M__eur_per_a);

        let costs_gas__M__eur_per_a = &cnsmp_gas__M__m3_per_a * price_gas__eur_per_m3;
        results
            .costs_gas__M__eur_per_a
            .set_year_values(year, &costs_gas__M__eur_per_a);

        let costs_client_district_heating__M__eur_per_a =
            &cnsmp_district_heating__G__W_h_per_a * price_district_heating__m__eur_per_W_h;
        results
            .costs_client_district_heating__M__eur_per_a
            .set_year_values(year, &costs_client_district_heating__M__eur_per_a);

        // Invests and Grants
        // invest and grants are computed by the differences of certain kpis
        // from one year to another. Therefore, they are not computed for the
        // start year.
        if year != self.start_year {
            // invest/grant heat sources
            let mut invest_heat_sources__M__eur_per_a = SectorsRawValues::new();
            let mut grant_heat_sources__M__eur_per_a = SectorsRawValues::new();
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                self.inputs.heat_dmd__k__W_h_per_m2_a.get_year(year - 1);

            macro_rules! implement_invest_calculation_heating {
                ($(($heat_type: ident, $heat_type_A__k__m2: ident)),*) => {
                    let mut A_this_year__k__m2: SectorsRawValues;
                    let mut A_prev_year__k__m2: SectorsRawValues;
                    let mut invest_heat_source__M__eur_per_a: SectorsRawValues;
                    let mut grant_heat_source__M__eur_per_a: SectorsRawValues;

                    $(
                        A_this_year__k__m2 =
                            self.inputs.$heat_type_A__k__m2.get_year(year);
                        A_prev_year__k__m2 =
                            self.inputs.$heat_type_A__k__m2.get_year(year - 1);

                        invest_heat_source__M__eur_per_a = 1e-3
                            * (&A_this_year__k__m2 - &A_prev_year__k__m2)
                            * constants::$heat_type.invest__m__eur_per_W_h
                            * &heat_dmd_prev_year__k__W_h_per_m2_a
                            * A_this_year__k__m2.is_greater(&A_prev_year__k__m2);

                        grant_heat_source__M__eur_per_a =
                            &invest_heat_source__M__eur_per_a * constants::$heat_type.grant;

                        invest_heat_sources__M__eur_per_a =
                            invest_heat_sources__M__eur_per_a + invest_heat_source__M__eur_per_a;

                        grant_heat_sources__M__eur_per_a =
                            grant_heat_sources__M__eur_per_a + grant_heat_source__M__eur_per_a;
                    )*

                    A_this_year__k__m2 =
                        compute_A_heat_other__k__m2(&self.inputs, year);
                    A_prev_year__k__m2 =
                        compute_A_heat_other__k__m2(&self.inputs, year - 1);

                    invest_heat_source__M__eur_per_a = 1e-3
                        * (&A_this_year__k__m2 - &A_prev_year__k__m2)
                        * constants::other.invest__m__eur_per_W_h
                        * &heat_dmd_prev_year__k__W_h_per_m2_a
                        * A_this_year__k__m2.is_greater(&A_prev_year__k__m2);

                    grant_heat_source__M__eur_per_a =
                        &invest_heat_source__M__eur_per_a * constants::other.grant;

                    invest_heat_sources__M__eur_per_a =
                        invest_heat_sources__M__eur_per_a + invest_heat_source__M__eur_per_a;

                    grant_heat_sources__M__eur_per_a =
                        grant_heat_sources__M__eur_per_a + grant_heat_source__M__eur_per_a;

                    results
                        .invest_heat_sources__M__eur_per_a
                        .set_year_values(year, &invest_heat_sources__M__eur_per_a);
                    results
                        .grant_heat_sources__M__eur_per_a
                        .set_year_values(year, &grant_heat_sources__M__eur_per_a);
                }
            }

            implement_invest_calculation_heating! {
                (oil_no_condensing, A_heat_oil__k__m2),
                (oil_with_condensing, A_heat_oil_condensing__k__m2),
                (gas, A_heat_gas__k__m2),
                (district_heating, A_heat_district_heating__k__m2),
                (heat_pump, A_heat_heat_pump__k__m2)
            }

            // invest/grant energetic renovation
            let heat_dmd_this_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year);
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year - 1);

            let invest_energetic_renovation__k__eur_per_a = (&heat_dmd_prev_year__k__W_h_per_m2_a
                - &heat_dmd_this_year__k__W_h_per_m2_a)
                * constants::energetic_restoration::invest__m__eur_per_W_h_m2
                * &floor_A__k__m2
                / 1000.0
                * heat_dmd_prev_year__k__W_h_per_m2_a
                    .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
            results
                .invest_energetic_renovation__M__eur_per_a
                .set_year_values(year, &invest_energetic_renovation__k__eur_per_a);

            let grant_energetic_renovation__M__eur_per_a =
                &invest_energetic_renovation__k__eur_per_a
                    * constants::energetic_restoration::grant;

            results
                .grant_energetic_renovation__M__eur_per_a
                .set_year_values(year, &grant_energetic_renovation__M__eur_per_a);
        }
    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        nrg_own_mix_price__m__eur_per_W_h: &SectorsResult,
    ) {
        let cnsmp_elec_heat_pump__G__W_h_per_a = self
            .results
            .cnsmp_elec_heat_pump__G__W_h_per_a
            .get_year(year);
        let nrg_own_mix_price__m__eur_per_W_h =
            nrg_own_mix_price__m__eur_per_W_h.get_year(year);

        let costs_heat_pump__M__eur = &cnsmp_elec_heat_pump__G__W_h_per_a
            * &nrg_own_mix_price__m__eur_per_W_h
            * (1.0 - evu_discount_heat_pump);
        self.results
            .costs_heat_pump__M__eur
            .set_year_values(year, &costs_heat_pump__M__eur);

        let costs_oil__M__eur_per_a = self.results.costs_oil__M__eur_per_a.get_year(year);
        let costs_gas__M__eur_per_a = self.results.costs_gas__M__eur_per_a.get_year(year);
        let costs_client_district_heating__M__eur_per_a = self
            .results
            .costs_client_district_heating__M__eur_per_a
            .get_year(year);
        let costs_other__M__eur_per_a = self.results.costs_other__M__eur_per_a.get_year(year);
        let costs_total__M__eur = costs_oil__M__eur_per_a
            + costs_gas__M__eur_per_a
            + costs_client_district_heating__M__eur_per_a
            + costs_heat_pump__M__eur
            + costs_other__M__eur_per_a;
        self.results
            .costs_total__M__eur
            .set_year_values(year, &costs_total__M__eur);
    }

    pub fn calculate_emissions(&mut self, year: u32) {
        let cnsmp_oil__M__L_per_a = self.results.cnsmp_oil__M__L_per_a.get_year(year);
        let cnsmp_gas__M__m3_per_a = self.results.cnsmp_gas__M__m3_per_a.get_year(year);

        let mut ems_oil__k__to_coe_per_a =
            cnsmp_oil__M__L_per_a * constants::EnergySource::oil::emission__kg_coe_per_L;
        // oil emissions of public sector are missing in excel.
        ems_oil__k__to_coe_per_a.public =
            &ems_oil__k__to_coe_per_a.schools + ems_oil__k__to_coe_per_a.public;
        ems_oil__k__to_coe_per_a.schools = 0.0;

        self.results
            .ems_oil__k__to_coe_per_a
            .set_year_values(year, &ems_oil__k__to_coe_per_a);

        let mut ems_gas__k__to_coe_per_a =
            cnsmp_gas__M__m3_per_a * constants::EnergySource::gas::emission__kg_coe_per_m3;
        ems_gas__k__to_coe_per_a.public =
            &ems_gas__k__to_coe_per_a.schools + ems_gas__k__to_coe_per_a.public;
        ems_gas__k__to_coe_per_a.schools = 0.0;

        self.results
            .ems_gas__k__to_coe_per_a
            .set_year_values(year, &ems_gas__k__to_coe_per_a);
    }
}
