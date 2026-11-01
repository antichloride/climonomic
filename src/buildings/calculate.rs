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

        crate::equation! {
            /// Total floor area across all buildings in the municipality
            results.floor_A__k__m2[year] = &floor_A_building__m2 * &n_buildings * 1e-3;
        }

        results
            .specific_heat_dmd__kWh_per_m2_a
            .set_year_values(year, &heat_dmd__k__W_h_per_m2_a);
        results
            .specific_hot_water_dmd__kWh_per_a
            .set_year_values(year, &hot_water_dmd__k__W_h_per_m2_a);

        // Excel row 29: (C16*C21 + C3*C25) / 1000
        crate::equation! {
            /// Total space heating demand
            results.total_heat_dmd__G__W_h_per_a[year] = (&n_inhabitants__k__ * &hot_water_dmd__k__W_h_per_m2_a
                + &heat_dmd__k__W_h_per_m2_a * &floor_A__k__m2)
                * 1e-3;
        }

        crate::equation! {
            /// Electricity demand across all inhabitants
            results.elec_dmd__G__W_h_per_a[year] = &elec_dmd_capita__k_W_h_per_a * &n_inhabitants__k__ * 1e-3;
        }

        // Energy Consumption of different heating types
        crate::equation! {
            /// Specific heat demand per unit floor area
            total_heat_dmd__M__W_h_per_m2_a = &total_heat_dmd__G__W_h_per_a / &floor_A__k__m2;
        }

        let A_heat_oil__k__m2 = self.inputs.A_heat_oil__k__m2.get_year(year);
        crate::equation! {
            /// Space heating fuel consumption from non-condensing oil systems
            results.cnsmp_oil__G__W_h_per_a[year] = &A_heat_oil__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::oil_no_condensing.efficency;
        }

        let A_heat_oil_condensing__k__m2 =
            self.inputs.A_heat_oil_condensing__k__m2.get_year(year);
        crate::equation! {
            /// Space heating fuel consumption from condensing oil systems
            results.cnsmp_oil_condensing__G__W_h_per_a[year] = &A_heat_oil_condensing__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::oil_with_condensing.efficency;
        }

        let A_heat_gas__k__m2 = self.inputs.A_heat_gas__k__m2.get_year(year);
        crate::equation! {
            /// Space heating fuel consumption from natural gas systems
            results.cnsmp_gas__G__W_h_per_a[year] = &A_heat_gas__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::gas.efficency;
        }

        let A_heat_district_heating__k__m2 =
            self.inputs.A_heat_district_heating__k__m2.get_year(year);
        crate::equation! {
            /// Thermal energy supplied by district heating networks
            results.cnsmp_district_heating__G__W_h_per_a[year] = &A_heat_district_heating__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::district_heating.efficency;
        }

        let A_heat_heat_pump__k__m2 = self.inputs.A_heat_heat_pump__k__m2.get_year(year);
        crate::equation! {
            /// Electricity consumption of heat pump heating systems
            results.cnsmp_elec_heat_pump__G__W_h_per_a[year] = &A_heat_heat_pump__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::heat_pump.efficency;
        }

        let A_heat_other__k__m2 = compute_A_heat_other__k__m2(&self.inputs, year);
        crate::equation! {
            /// Other heating fuel consumption
            results.cnsmp_other__G__W_h_per_a[year] = &A_heat_other__k__m2
                * &total_heat_dmd__M__W_h_per_m2_a
                / constants::other.efficency;
        }

        let price_other_output_nrg__m__eur_per_W_h =
            self.inputs.price_other_output_nrg__m__eur_per_W_h.get_year(year);
        crate::equation! {
            /// Other heating fuel expenditures
            results.costs_other__M__eur_per_a[year] = &cnsmp_other__G__W_h_per_a
                * price_other_output_nrg__m__eur_per_W_h;
        }

        // Excel row 79: (C69 + C74) / 10.0 (in Mio. L)
        crate::equation! {
            /// Heating oil consumption in million liters
            results.cnsmp_oil__M__L_per_a[year] = (&results.cnsmp_oil__G__W_h_per_a.get_year(year) + &results.cnsmp_oil_condensing__G__W_h_per_a.get_year(year))
                / constants::EnergySource::oil::energy_density__k__W_h_per_L;
        }

        // Excel row 89: C84 / 5.0 (in Mio. m3)
        crate::equation! {
            /// Natural gas heating fuel consumption in million cubic meters
            results.cnsmp_gas__M__m3_per_a[year] = &results.cnsmp_gas__G__W_h_per_a.get_year(year)
                / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        }

        let district_heating_renewable_part =
            self.inputs.district_heating_renewable_part.get_year(year);
        crate::equation! {
            /// Natural gas consumed for district heating generation
            results.cnsmp_gas_district_heating__M__m3_per_a[year] = (1.0 - &district_heating_renewable_part)
                * &results.cnsmp_district_heating__G__W_h_per_a.get_year(year)
                / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        }

        // Store areas in results (Excel rows 44, 49, 54, 59, 64)
        results.A_heat_oil__k__m2.set_year_values(year, &self.inputs.A_heat_oil__k__m2.get_year(year));
        results.A_heat_oil_condensing__k__m2.set_year_values(year, &self.inputs.A_heat_oil_condensing__k__m2.get_year(year));
        results.A_heat_gas__k__m2.set_year_values(year, &self.inputs.A_heat_gas__k__m2.get_year(year));
        results.A_heat_heat_pump__k__m2.set_year_values(year, &self.inputs.A_heat_heat_pump__k__m2.get_year(year));
        let A_other = compute_A_heat_other__k__m2(&self.inputs, year);
        results.A_heat_other__k__m2.set_year_values(year, &A_other);

        // Excel row 104-107: Total heat consumption
        let c_oil_cond = results.cnsmp_oil_condensing__G__W_h_per_a.get_year(year);
        let c_gas = results.cnsmp_gas__G__W_h_per_a.get_year(year);
        let c_hp = results.cnsmp_elec_heat_pump__G__W_h_per_a.get_year(year);
        let c_other = results.cnsmp_other__G__W_h_per_a.get_year(year);
        let cnsmp_total_heat__G__W_h_per_a = SectorsRawValues {
            private: c_oil_cond.private + c_gas.private + c_hp.private + c_other.private,
            industry: c_oil_cond.industry + c_gas.industry + c_hp.industry + c_other.industry,
            schools: c_oil_cond.schools + c_gas.schools + c_hp.schools + c_other.schools,
            public: c_oil_cond.sum() + c_gas.public + c_hp.sum() + c_other.public,
        };
        results
            .cnsmp_total_heat__G__W_h_per_a
            .set_year_values(year, &cnsmp_total_heat__G__W_h_per_a);

        // Costs
        let price_oil__eur_per_L = self.inputs.price_oil__eur_per_L.get_year(year);
        let price_gas__eur_per_m3 = self.inputs.price_gas__eur_per_m3.get_year(year);
        let price_district_heating__m__eur_per_W_h =
            self.inputs.price_district_heating__m__eur_per_W_h.get_year(year);

        crate::equation! {
            /// Total annual expenditures on heating oil
            results.costs_oil__M__eur_per_a[year] = &cnsmp_oil__M__L_per_a * price_oil__eur_per_L;
        }

        crate::equation! {
            /// Total annual expenditures on natural gas
            results.costs_gas__M__eur_per_a[year] = &cnsmp_gas__M__m3_per_a * price_gas__eur_per_m3;
        }

        crate::equation! {
            /// Total client costs for district heating
            results.costs_client_district_heating__M__eur_per_a[year] = &results.cnsmp_district_heating__G__W_h_per_a.get_year(year) * price_district_heating__m__eur_per_W_h;
        }

        // Invests and Grants (Excel rows 143, 148, 164, 169)
        if year != self.start_year {
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                self.inputs.heat_dmd__k__W_h_per_m2_a.get_year(year - 1);

            // 1. Oil non-condensing
            let A_oil_now = self.inputs.A_heat_oil__k__m2.get_year(year);
            let A_oil_prev = self.inputs.A_heat_oil__k__m2.get_year(year - 1);
            let invest_oil_no_condensing = 1e-3
                * (&A_oil_now - &A_oil_prev)
                * constants::oil_no_condensing.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_oil_now.is_greater(&A_oil_prev);
            let grant_oil_no_condensing = (&A_oil_now - &A_oil_prev)
                * constants::oil_no_condensing.invest__m__eur_per_W_h
                * constants::oil_no_condensing.grant
                * A_oil_now.is_greater(&A_oil_prev);

            // 2. Oil condensing
            let A_oil_cond_now = self.inputs.A_heat_oil_condensing__k__m2.get_year(year);
            let A_oil_cond_prev = self.inputs.A_heat_oil_condensing__k__m2.get_year(year - 1);
            let invest_oil_with_condensing = 1e-3
                * (&A_oil_cond_now - &A_oil_cond_prev)
                * constants::oil_with_condensing.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_oil_cond_now.is_greater(&A_oil_cond_prev);
            let grant_oil_with_condensing = (&A_oil_cond_now - &A_oil_cond_prev)
                * constants::oil_with_condensing.invest__m__eur_per_W_h
                * constants::oil_with_condensing.grant
                * A_oil_cond_now.is_greater(&A_oil_cond_prev);

            // 3. Gas
            let A_gas_now = self.inputs.A_heat_gas__k__m2.get_year(year);
            let A_gas_prev = self.inputs.A_heat_gas__k__m2.get_year(year - 1);
            let invest_gas = 1e-3
                * (&A_gas_now - &A_gas_prev)
                * constants::gas.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_gas_now.is_greater(&A_gas_prev);
            let grant_gas = (&A_gas_now - &A_gas_prev)
                * constants::gas.invest__m__eur_per_W_h
                * constants::gas.grant
                * A_gas_now.is_greater(&A_gas_prev);

            // 4. District heating
            let A_dist_now = self.inputs.A_heat_district_heating__k__m2.get_year(year);
            let A_dist_prev = self.inputs.A_heat_district_heating__k__m2.get_year(year - 1);
            let invest_district_heating = 1e-3
                * (&A_dist_now - &A_dist_prev)
                * constants::district_heating.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_dist_now.is_greater(&A_dist_prev);
            let grant_district_heating = (&A_dist_now - &A_dist_prev)
                * constants::district_heating.invest__m__eur_per_W_h
                * constants::district_heating.grant
                * A_dist_now.is_greater(&A_dist_prev);

            // 5. Heat pump
            let A_hp_now = self.inputs.A_heat_heat_pump__k__m2.get_year(year);
            let A_hp_prev = self.inputs.A_heat_heat_pump__k__m2.get_year(year - 1);
            let invest_heat_pump = 1e-3
                * (&A_hp_now - &A_hp_prev)
                * constants::heat_pump.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_hp_now.is_greater(&A_hp_prev);
            let grant_heat_pump = (&A_hp_now - &A_hp_prev)
                * constants::heat_pump.invest__m__eur_per_W_h
                * constants::heat_pump.grant
                * A_hp_now.is_greater(&A_hp_prev);

            // 6. Other heating
            let A_other_now = compute_A_heat_other__k__m2(&self.inputs, year);
            let A_other_prev = compute_A_heat_other__k__m2(&self.inputs, year - 1);
            let invest_other = 1e-3
                * (&A_other_now - &A_other_prev)
                * constants::other.invest__m__eur_per_W_h
                * &heat_dmd_prev_year__k__W_h_per_m2_a
                * A_other_now.is_greater(&A_other_prev);
            let grant_other = (&A_other_now - &A_other_prev)
                * constants::other.invest__m__eur_per_W_h
                * constants::other.grant
                * A_other_now.is_greater(&A_other_prev);

            crate::equation! {
                /// Total annual capital expenditure for heating system transitions
                results.invest_heat_sources__M__eur_per_a[year] = invest_oil_no_condensing
                    + invest_oil_with_condensing
                    + invest_gas
                    + invest_district_heating
                    + invest_heat_pump
                    + invest_other;
            }

            crate::equation! {
                /// Total annual subsidies and grants for heating system transitions
                results.grant_heat_sources__M__eur_per_a[year] = grant_oil_no_condensing
                    + grant_oil_with_condensing
                    + grant_gas
                    + grant_district_heating
                    + grant_heat_pump
                    + grant_other;
            }

            // Excel row 148: (heat_dmd_prev - heat_dmd_this) * 2.5 * floor_A / 1000
            let heat_dmd_this_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year);
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year - 1);

            crate::equation! {
                /// Building energetic renovation investment expenditures
                results.invest_energetic_renovation__M__eur_per_a[year] = (&heat_dmd_prev_year__k__W_h_per_m2_a
                    - &heat_dmd_this_year__k__W_h_per_m2_a)
                    * constants::energetic_restoration::invest__m__eur_per_W_h_m2
                    * &floor_A__k__m2
                    / 1000.0
                    * heat_dmd_prev_year__k__W_h_per_m2_a
                        .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
            }

            // Excel row 169: (heat_dmd_prev - heat_dmd_this) * floor_A * 2.5 * 0.3
            crate::equation! {
                /// Public grants for building energetic renovation
                results.grant_energetic_renovation__M__eur_per_a[year] = (&heat_dmd_prev_year__k__W_h_per_m2_a
                    - &heat_dmd_this_year__k__W_h_per_m2_a)
                    * &floor_A__k__m2
                    * constants::energetic_restoration::invest__m__eur_per_W_h_m2
                    * constants::energetic_restoration::grant
                    * heat_dmd_prev_year__k__W_h_per_m2_a
                        .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
            }

            // Excel row 153: Invest Total = Invest Heat Sources + Invest Renovation
            crate::equation! {
                /// Total investment in building heating systems and renovation
                results.invest_total__M__eur_per_a[year] = &invest_heat_sources__M__eur_per_a
                    + &invest_energetic_renovation__M__eur_per_a;
            }

            // Excel row 174: Grant Total = Grant Heat Sources + Grant Renovation
            crate::equation! {
                /// Total grants for heating transitions and renovations
                results.grant_total__M__eur_per_a[year] = &grant_heat_sources__M__eur_per_a
                    + &grant_energetic_renovation__M__eur_per_a;
            }
        } else {
            let zero = SectorsRawValues::new();
            results.invest_heat_sources__M__eur_per_a.set_year_values(year, &zero);
            results.invest_energetic_renovation__M__eur_per_a.set_year_values(year, &zero);
            results.invest_total__M__eur_per_a.set_year_values(year, &zero);
            results.grant_heat_sources__M__eur_per_a.set_year_values(year, &zero);
            results.grant_energetic_renovation__M__eur_per_a.set_year_values(year, &zero);
            results.grant_total__M__eur_per_a.set_year_values(year, &zero);
        }
    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        nrg_own_mix_price__m__eur_per_W_h: &SectorsResult,
    ) {
        let results = &mut self.results;
        let cnsmp_elec_heat_pump__G__W_h_per_a = results
            .cnsmp_elec_heat_pump__G__W_h_per_a
            .get_year(year);
        let nrg_own_mix_price__m__eur_per_W_h =
            nrg_own_mix_price__m__eur_per_W_h.get_year(year);

        let mut costs_heat_pump__M__eur = &cnsmp_elec_heat_pump__G__W_h_per_a
            * &nrg_own_mix_price__m__eur_per_W_h
            * (1.0 - evu_discount_heat_pump);
        // Excel row 125: Cell D125 has formula =D98*D$347*(1-D$348) referencing the total sum D98
        costs_heat_pump__M__eur.public = cnsmp_elec_heat_pump__G__W_h_per_a.sum()
            * nrg_own_mix_price__m__eur_per_W_h.public
            * (1.0 - evu_discount_heat_pump);
        results
            .costs_heat_pump__M__eur
            .set_year_values(year, &costs_heat_pump__M__eur);

        let costs_oil__M__eur_per_a = results.costs_oil__M__eur_per_a.get_year(year);
        let costs_gas__M__eur_per_a = results.costs_gas__M__eur_per_a.get_year(year);
        let costs_client_district_heating__M__eur_per_a = results
            .costs_client_district_heating__M__eur_per_a
            .get_year(year);
        let costs_other__M__eur_per_a = results.costs_other__M__eur_per_a.get_year(year);
        crate::equation! {
            /// Total building energy and heating expenditures
            results.costs_total__M__eur[year] = costs_oil__M__eur_per_a
                + costs_gas__M__eur_per_a
                + costs_client_district_heating__M__eur_per_a
                + costs_heat_pump__M__eur
                + costs_other__M__eur_per_a;
        }
    }

    pub fn calculate_emissions(&mut self, year: u32) {
        let results = &mut self.results;
        let cnsmp_oil__M__L_per_a = results.cnsmp_oil__M__L_per_a.get_year(year);
        let cnsmp_gas__G__W_h_per_a = results.cnsmp_gas__G__W_h_per_a.get_year(year);

        // Excel row 352: D79 * 3.0
        let mut ems_oil__k__to_coe_per_a =
            cnsmp_oil__M__L_per_a * constants::EnergySource::oil::emission__kg_coe_per_L;
        // In Excel row 354, cell D354 has formula =D81*'Eingabe Ist'!$M$16 (schools only)
        ems_oil__k__to_coe_per_a.public = ems_oil__k__to_coe_per_a.schools;
        ems_oil__k__to_coe_per_a.schools = 0.0;

        results
            .ems_oil__k__to_coe_per_a
            .set_year_values(year, &ems_oil__k__to_coe_per_a);

        // Excel row 356: D84 * 2.0 (GWh * 2.0)
        let mut ems_gas__k__to_coe_per_a =
            cnsmp_gas__G__W_h_per_a * constants::EnergySource::gas::emission__kg_coe_per_m3;
        // In Excel row 358, cell D358 has formula =D86*'Eingabe Ist'!$M$16 (schools only)
        ems_gas__k__to_coe_per_a.public = ems_gas__k__to_coe_per_a.schools;
        ems_gas__k__to_coe_per_a.schools = 0.0;

        results
            .ems_gas__k__to_coe_per_a
            .set_year_values(year, &ems_gas__k__to_coe_per_a);
    }
}
