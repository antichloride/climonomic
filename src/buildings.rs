#![allow(non_snake_case)]

use crate::sectors::SectorsInputs;
use crate::sectors::SectorsResult;
use crate::sectors::SectorsRawValues;
use crate::result::Results;
use crate::input::Input;
use crate::input::InputFields;
use crate::constants::buildings as constants;
use crate::constants::energy::evu_discount_heat_pump;

pub struct Buildings {
    inputs: InputsBuildings,
    pub results: ResultsBuildings,
    start_year: u32,
}

impl Buildings{

    pub fn new(start_year: u32, end_year: u32) -> Buildings{
        return Buildings{
            inputs: InputsBuildings
                ::new("buildings/inputs", start_year, end_year),
            results: ResultsBuildings
                ::new("buildings/results", start_year, end_year),
            start_year: start_year,
        }
    }


    pub fn get_inputs(& self) -> Vec<&Input>{
        return self.inputs.get_inputs();
    }

    pub fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
        return self.inputs.get_input_by_id(id);
    }


    pub fn get_results(& self) -> Vec<&Results>{
        return self.results.get_results();
    }

    pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
        return self.results.get_results_by_id(id);
    }
}



// Implement getter functions

impl Buildings{
    pub fn elec_dmd__G__W_h_per_a(&self) -> &SectorsResult{
        return &self.results.elec_dmd__G__W_h_per_a;
    }
    pub fn cnsmp_elec_heat_pump__G__W_h_per_a(&self) -> &SectorsResult{
        return &self.results.cnsmp_elec_heat_pump__G__W_h_per_a;
    }
    pub fn invest_heat_sources__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.invest_heat_sources__M__eur_per_a;
    }
    pub fn invest_energetic_renovation__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.invest_energetic_renovation__M__eur_per_a;
    }
    pub fn grant_heat_sources__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.grant_heat_sources__M__eur_per_a;
    }
    pub fn grant_energetic_renovation__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.grant_energetic_renovation__M__eur_per_a;
    }
    pub fn costs_oil__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.costs_oil__M__eur_per_a;
    }
    pub fn costs_gas__M__eur_per_a(&self) -> &SectorsResult{
        return &self.results.costs_gas__M__eur_per_a;
    }
}

fn compute_A_heat_other__k__m2(inputs: &InputsBuildings, year: u32) -> SectorsRawValues{
    let floor_A_building__m2 = inputs.floor_A_building__m2.get_year(year);
    let n_buildings = inputs.n_buildings.get_year(year);
    let A_heat_oil__k__m2 = inputs.A_heat_oil__k__m2.get_year(year);
    let A_heat_oil_condensing__k__m2 = inputs.A_heat_oil_condensing__k__m2.get_year(year);
    let A_heat_gas__k__m2 = inputs.A_heat_gas__k__m2.get_year(year);
    let A_heat_district_heating__k__m2 = inputs.A_heat_district_heating__k__m2.get_year(year);
    let A_heat_heat_pump__k__m2 = inputs.A_heat_heat_pump__k__m2.get_year(year);
    return  ( floor_A_building__m2 * n_buildings * 1e-3 )
        - (
            A_heat_oil__k__m2 + A_heat_oil_condensing__k__m2
            + A_heat_gas__k__m2 + A_heat_heat_pump__k__m2
            + A_heat_district_heating__k__m2
        ).copy();
}

impl Buildings{


    pub fn calculate(&mut self, year: u32){
        let inputs = &self.inputs;
        let results = &mut self.results;

        let floor_A_building__m2 =
            self.inputs.floor_A_building__m2.get_year(year);
        let n_buildings = self.inputs.n_buildings.get_year(year);
        let n_inhabitants__k__ = self.inputs.n_inhabitants__k__.get_year(year);
        let heat_dmd__k__W_h_per_m2_a =
            self.inputs.heat_dmd__k__W_h_per_m2_a.get_year(year);
        let hot_water_dmd__k__W_h_per_m2_a =
            self.inputs.hot_water_dmd__k__W_h_per_m2_a.get_year(year);
        let elec_dmd_capita__k_W_h_per_a =
            self.inputs.elec_dmd_capita__k_W_h_per_a.get_year(year);

        let floor_A__k__m2 = &floor_A_building__m2 * &n_buildings * 1e-3;
        results.floor_A__k__m2.set_year_values(year, &floor_A__k__m2);

        let total_heat_dmd__G__W_h_per_a =
            (&n_inhabitants__k__ * &hot_water_dmd__k__W_h_per_m2_a
            + &heat_dmd__k__W_h_per_m2_a * &floor_A__k__m2) * 1e-3;
        results.total_heat_dmd__G__W_h_per_a
            .set_year_values(year, &total_heat_dmd__G__W_h_per_a);

        let elec_dmd__G__W_h_per_a = &elec_dmd_capita__k_W_h_per_a
            * &n_inhabitants__k__ * 1e-3;
        results.elec_dmd__G__W_h_per_a
            .set_year_values(year, &elec_dmd__G__W_h_per_a);


        // Energy Consumption of different heating types
        let total_heat_dmd__M__W_h_per_m2_a =
            &total_heat_dmd__G__W_h_per_a / &floor_A__k__m2;

        macro_rules! implement_heat_types_input_consumption{
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
                            .set_year_values(year,&$heat_type_cnsmp_in);
                     )*

                    let A_heat_other__k__m2 =
                        compute_A_heat_other__k__m2(&self.inputs, year);
                    let cnsmp_other__G__W_h_per_a = &A_heat_other__k__m2
                        * &total_heat_dmd__M__W_h_per_m2_a
                        / constants::other.efficency;
                    results.cnsmp_other__G__W_h_per_a
                        .set_year_values(year,&cnsmp_other__G__W_h_per_a);

                    let price_other_output_nrg__m__eur_per_W_h =
                        self.inputs.price_other_output_nrg__m__eur_per_W_h.get_year(year);
                    let costs_other__M__eur_per_a = &cnsmp_other__G__W_h_per_a
                        * price_other_output_nrg__m__eur_per_W_h;
                    results.costs_other__M__eur_per_a
                        .set_year_values(year, &costs_other__M__eur_per_a);
            }
        }

        implement_heat_types_input_consumption!{
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
            // (
            //     other,
            //     A_heat_other__k__m2,
            //     cnsmp_other__G__W_h_per_a
            // )
        }


        let cnsmp_oil__M__L_per_a =
            (&cnsmp_oil__G__W_h_per_a + &cnsmp_oil_condensing__G__W_h_per_a)
            / constants::EnergySource::oil::energy_density__k__W_h_per_L;
        results.cnsmp_oil__M__L_per_a
            .set_year_values(year, &cnsmp_oil__M__L_per_a);

        let cnsmp_gas__M__m3_per_a = &cnsmp_gas__G__W_h_per_a
            / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        results.cnsmp_gas__M__m3_per_a
            .set_year_values(year, &cnsmp_gas__M__m3_per_a);

        let district_heating_renewable_part =
            self.inputs.district_heating_renewable_part.get_year(year);
        let cnsmp_gas_district_heating__M__m3_per_a =
            (1.0 - &district_heating_renewable_part)
            * &cnsmp_district_heating__G__W_h_per_a
            / constants::EnergySource::gas::energy_density__k__W_h_per_m3;
        results.cnsmp_gas_district_heating__M__m3_per_a
            .set_year_values(year, &cnsmp_gas_district_heating__M__m3_per_a);


        // Costs
        let price_oil__eur_per_L =
            self.inputs.price_oil__eur_per_L.get_year(year);
        let price_gas__eur_per_m3 =
            self.inputs.price_gas__eur_per_m3.get_year(year);
        let price_district_heating__m__eur_per_W_h =
            self.inputs.price_district_heating__m__eur_per_W_h.get_year(year);

        let costs_oil__M__eur_per_a = &cnsmp_oil__M__L_per_a
            * price_oil__eur_per_L;
        results.costs_oil__M__eur_per_a
            .set_year_values(year, &costs_oil__M__eur_per_a);

        let costs_gas__M__eur_per_a = &cnsmp_gas__M__m3_per_a
            * price_gas__eur_per_m3;
        results.costs_gas__M__eur_per_a
            .set_year_values(year, &costs_gas__M__eur_per_a);

        let costs_client_district_heating__M__eur_per_a =
            &cnsmp_district_heating__G__W_h_per_a
            * price_district_heating__m__eur_per_W_h;
        results.costs_client_district_heating__M__eur_per_a.set_year_values(
                year, &costs_client_district_heating__M__eur_per_a);




        // Invests and Grants
        // invest and grants are computed by the differences of certain kpis
        // from one year to another. Therefore, they are not computed for the
        // start year.
        if year != self.start_year{

            // invest/grant heat sources
            // this is calculated by the change of the area of the corresponding
            // heat types from the year before to the current one.
            // This calculaiton uses the total heat demand (heat and hot water),
            // because it is assumed that the heater also produces the hot
            // water.
            let mut invest_heat_sources__M__eur_per_a = SectorsRawValues::new();
            let mut grant_heat_sources__M__eur_per_a = SectorsRawValues::new();
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                self.inputs.heat_dmd__k__W_h_per_m2_a.get_year(year-1);

            macro_rules! implement_invest_calculation_heating{
                ($(($heat_type: ident, $heat_type_A__k__m2: ident)),*) => {

                    let mut A_this_year__k__m2: SectorsRawValues;
                    let mut A_prev_year__k__m2: SectorsRawValues;

                    let mut invest_heat_source__M__eur_per_a: SectorsRawValues;
                    let mut grant_heat_source__M__eur_per_a: SectorsRawValues;


                    $(

                        A_this_year__k__m2 =
                            self.inputs.$heat_type_A__k__m2.get_year(year);
                        A_prev_year__k__m2 =
                            self.inputs.$heat_type_A__k__m2.get_year(year-1);

                        invest_heat_source__M__eur_per_a = 1e-3
                            * (&A_this_year__k__m2 - &A_prev_year__k__m2)
                            * constants::$heat_type.invest__m__eur_per_W_h
                            * &heat_dmd_prev_year__k__W_h_per_m2_a
                            * A_this_year__k__m2
                                .is_greater(&A_prev_year__k__m2);

                        if (invest_heat_source__M__eur_per_a.private != 0.0){


                            println!(
                                "year={0} heat_type={1:20} invest={2:.3} is_greater={3:.3} A_this_year={4:.3} A_prev_year={5:.3}",
                                 year,
                                 String::from(stringify!($heat_type)),
                                 invest_heat_sources__M__eur_per_a.private,
                                 A_this_year__k__m2
                                    .is_greater(&A_prev_year__k__m2).private,
                                 A_this_year__k__m2.private,
                                 A_prev_year__k__m2.private,
                            );
                        }

                        grant_heat_source__M__eur_per_a =
                            &invest_heat_source__M__eur_per_a
                            * constants::$heat_type.grant;

                        invest_heat_sources__M__eur_per_a =
                            invest_heat_sources__M__eur_per_a +
                            invest_heat_source__M__eur_per_a;

                        grant_heat_sources__M__eur_per_a =
                            grant_heat_sources__M__eur_per_a +
                            grant_heat_source__M__eur_per_a;


                     )*

                    A_this_year__k__m2 =
                        compute_A_heat_other__k__m2(&self.inputs, year);
                    A_prev_year__k__m2 =
                        compute_A_heat_other__k__m2(&self.inputs, year-1);

                    invest_heat_source__M__eur_per_a = 1e-3
                        * (&A_this_year__k__m2 - &A_prev_year__k__m2)
                        * constants::other.invest__m__eur_per_W_h
                        * &heat_dmd_prev_year__k__W_h_per_m2_a
                        * A_this_year__k__m2
                            .is_greater(&A_prev_year__k__m2);

                    if (invest_heat_source__M__eur_per_a.industry != 0.0){
                        println!(
                            "year={0} heat_type={1:20} invest={2:.3} is_greater={3:.3} A_this_year={4:.3} A_prev_year={5:.3} total_head_dmd={6:.3}  invest_costs_const={7}",
                             year,
                             String::from("other"),
                             invest_heat_source__M__eur_per_a.industry,
                             A_this_year__k__m2
                                .is_greater(&A_prev_year__k__m2).industry,
                             A_this_year__k__m2.industry,
                             A_prev_year__k__m2.industry,
                             heat_dmd__k__W_h_per_m2_a.industry,
                             constants::other.invest__m__eur_per_W_h,
                        );
                    }


                    grant_heat_source__M__eur_per_a =
                        &invest_heat_source__M__eur_per_a
                        * constants::other.grant;

                    invest_heat_sources__M__eur_per_a =
                        invest_heat_sources__M__eur_per_a +
                        invest_heat_source__M__eur_per_a;

                    grant_heat_sources__M__eur_per_a =
                        grant_heat_sources__M__eur_per_a +
                        grant_heat_source__M__eur_per_a;


                    results.invest_heat_sources__M__eur_per_a
                        .set_year_values(year, &invest_heat_sources__M__eur_per_a);
                    results.grant_heat_sources__M__eur_per_a
                        .set_year_values(year, &grant_heat_sources__M__eur_per_a);

                }
            }

            implement_invest_calculation_heating!{
                (oil_no_condensing, A_heat_oil__k__m2),
                (oil_with_condensing, A_heat_oil_condensing__k__m2),
                (gas, A_heat_gas__k__m2),
                (district_heating, A_heat_district_heating__k__m2),
                (heat_pump, A_heat_heat_pump__k__m2)
                // (other, A_heat_other__k__m2)
            }

            // invest/grant energetic renovation
            // This calculation looks for the change of heat demand from one
            // year to the next.
            let heat_dmd_this_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year);
            let heat_dmd_prev_year__k__W_h_per_m2_a =
                inputs.heat_dmd__k__W_h_per_m2_a.get_year(year - 1);

            let invest_energetic_renovation__k__eur_per_a =
                (&heat_dmd_prev_year__k__W_h_per_m2_a
                 - &heat_dmd_this_year__k__W_h_per_m2_a)
                * constants::energetic_restoration::invest__m__eur_per_W_h_m2
                * &floor_A__k__m2 / 1000.0 // TODO: Check this factor of k, units don't fit
                * heat_dmd_prev_year__k__W_h_per_m2_a
                    .is_greater(&heat_dmd_this_year__k__W_h_per_m2_a);
            results.invest_energetic_renovation__M__eur_per_a
                .set_year_values(
                    year,
                    &invest_energetic_renovation__k__eur_per_a
                );

            let grant_energetic_renovation__M__eur_per_a =
                &invest_energetic_renovation__k__eur_per_a
                * constants::energetic_restoration::grant;

            results.grant_energetic_renovation__M__eur_per_a
                .set_year_values(
                    year,
                    &grant_energetic_renovation__M__eur_per_a
                );

        }
    }

    pub fn calculate_second_stage(
        &mut self,
        year: u32,
        nrg_own_mix_price__m__eur_per_W_h: &SectorsResult,
        ){

        let cnsmp_elec_heat_pump__G__W_h_per_a =
            self.results.cnsmp_elec_heat_pump__G__W_h_per_a.get_year(year);
        let nrg_own_mix_price__m__eur_per_W_h =
            nrg_own_mix_price__m__eur_per_W_h.get_year(year);

        let costs_heat_pump__M__eur = &cnsmp_elec_heat_pump__G__W_h_per_a
            * &nrg_own_mix_price__m__eur_per_W_h * (1.0 - evu_discount_heat_pump);
        self.results.costs_heat_pump__M__eur
            .set_year_values(year, &costs_heat_pump__M__eur);
        // println!("Year:{0} energy_consumption:{1} energy_price:{2} evu:{3}", year, &cnsmp_elec_heat_pump__G__W_h_per_a.private, &nrg_own_mix_price__m__eur_per_W_h.private, evu_discount_heat_pump)

        let costs_oil__M__eur_per_a =
            self.results.costs_oil__M__eur_per_a.get_year(year);
        let costs_gas__M__eur_per_a =
            self.results.costs_gas__M__eur_per_a.get_year(year);
        let costs_client_district_heating__M__eur_per_a = self.results
            .costs_client_district_heating__M__eur_per_a.get_year(year);
        let costs_other__M__eur_per_a = self.results
            .costs_other__M__eur_per_a.get_year(year);
        let costs_total__M__eur = costs_oil__M__eur_per_a
            + costs_gas__M__eur_per_a
            + costs_client_district_heating__M__eur_per_a
            + costs_heat_pump__M__eur
            + costs_other__M__eur_per_a;
        self.results.costs_total__M__eur
            .set_year_values(year, &costs_total__M__eur);
    }

    pub fn calculate_emissions(&mut self, year: u32){
        let cnsmp_oil__M__L_per_a = self.results.cnsmp_oil__M__L_per_a
            .get_year(year);
        let cnsmp_gas__M__m3_per_a = self.results.cnsmp_gas__M__m3_per_a
            .get_year(year);

        let mut ems_oil__k__to_coe_per_a = cnsmp_oil__M__L_per_a
            * constants::EnergySource::oil::emission__kg_coe_per_L;
        // TODO: oil emissions of public sector are missing in excel.
        ems_oil__k__to_coe_per_a.public = &ems_oil__k__to_coe_per_a.schools
            + ems_oil__k__to_coe_per_a.public;
        ems_oil__k__to_coe_per_a.schools = 0.0;

        self.results.ems_oil__k__to_coe_per_a
            .set_year_values(year, &ems_oil__k__to_coe_per_a);

        let mut ems_gas__k__to_coe_per_a = cnsmp_gas__M__m3_per_a
            * constants::EnergySource::gas::emission__kg_coe_per_m3;
        ems_gas__k__to_coe_per_a.public = &ems_gas__k__to_coe_per_a.schools
            + ems_gas__k__to_coe_per_a.public;
        ems_gas__k__to_coe_per_a.schools = 0.0;

        self.results.ems_gas__k__to_coe_per_a
            .set_year_values(year, &ems_gas__k__to_coe_per_a);

    }
}





macro_rules! implement_inputs_buildings{
    ($($field:ident),*) => {

        struct InputsBuildings{
            $(
                $field: SectorsInputs,
             )*
            price_oil__eur_per_L: Input,
            price_gas__eur_per_m3: Input,
            price_district_heating__m__eur_per_W_h: Input,
            price_other_output_nrg__m__eur_per_W_h: Input,
            district_heating_renewable_part: Input,
        }

        impl InputsBuildings{
            fn new(
                id: &str,
                start_year: u32,
                end_year: u32
            ) -> InputsBuildings {
                return InputsBuildings{
                    $(
                        $field: SectorsInputs::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                        price_oil__eur_per_L: Input::new(
                            id.to_owned()+"/price_oil__eur_per_L",
                            start_year,
                            end_year,
                        ),
                        price_gas__eur_per_m3: Input::new(
                            id.to_owned()+"/price_gas__eur_per_m3",
                            start_year,
                            end_year,
                        ),
                        price_district_heating__m__eur_per_W_h: Input::new(
                            id.to_owned()+"/price_district_heating__m__eur_per_W_h",
                            start_year,
                            end_year,
                        ),
                        price_other_output_nrg__m__eur_per_W_h: Input::new(
                            id.to_owned()+"/price_other_output_nrg__m__eur_per_W_h",
                            start_year,
                            end_year,
                        ),
                        district_heating_renewable_part: Input::new(
                            id.to_owned()+"/district_heating_renewable_part",
                            start_year,
                            end_year,
                        ),
                }
            }
        }

        impl InputFields for InputsBuildings{

            fn get_inputs(& self) -> Vec<&Input>{
                let mut inputs: Vec<&Input> = Vec::from([]);
                $(
                    inputs.extend(self.$field.get_inputs());
                 )*
                inputs.push(&self.price_oil__eur_per_L);
                inputs.push(&self.price_gas__eur_per_m3);
                inputs.push(&self.price_district_heating__m__eur_per_W_h);
                inputs.push(&self.price_other_output_nrg__m__eur_per_W_h);
                inputs.push(&self.district_heating_renewable_part);
                return inputs
            }

            fn get_input_by_id(&mut self, id: &str) -> Option<&mut Input>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field)
                            => self.$field.get_input_by_id(remaining_id),
                     )*
                    "price_oil__eur_per_L"=> Some(
                        &mut self.price_oil__eur_per_L),
                    "price_gas__eur_per_m3"=> Some(
                        &mut self.price_gas__eur_per_m3),
                    "price_district_heating__m__eur_per_W_h"=> Some(
                        &mut self.price_district_heating__m__eur_per_W_h),
                    "price_other_output_nrg__m__eur_per_W_h"=> Some(
                        &mut self.price_other_output_nrg__m__eur_per_W_h),
                    "district_heating_renewable_part"=> Some(
                        &mut self.district_heating_renewable_part),
                    _ => None,
                }
            }
        }
    }
}

implement_inputs_buildings!{
    n_buildings,
    floor_A_building__m2,
    heat_dmd__k__W_h_per_m2_a,
    n_inhabitants__k__,
    hot_water_dmd__k__W_h_per_m2_a,
    elec_dmd_capita__k_W_h_per_a,
    A_heat_oil__k__m2,
    A_heat_oil_condensing__k__m2,
    A_heat_gas__k__m2,
    A_heat_district_heating__k__m2,
    A_heat_heat_pump__k__m2
}

macro_rules! implement_results_buildings{
    ($($field:ident),*) => {

        pub struct ResultsBuildings{
            $(
                pub $field: SectorsResult,
             )*
        }

        impl ResultsBuildings{
            fn new(
                id: &str,
                start_year: u32,
                end_year: u32
            ) -> ResultsBuildings{
                return ResultsBuildings{
                    $(
                        $field: SectorsResult::new(
                            id.to_owned()+"/"+stringify!($field),
                            start_year,
                            end_year
                        ),
                     )*
                }
            }

            pub fn get_results(& self) -> Vec<&Results>{
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.extend(self.$field.get_results());
                 )*
                return results
            }

            fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results>{
                let (prefix, remaining_id) = match id.split_once('/') {
                    Some((p, r)) => (p, r),
                    None => (id, ""),
                };

                match prefix{
                    $(
                        stringify!($field)
                            => self.$field.get_results_by_id(remaining_id),
                     )*
                    _ => None,

                }

            }
        }


    }
}

implement_results_buildings!{
    floor_A__k__m2,
    total_heat_dmd__G__W_h_per_a,
    elec_dmd__G__W_h_per_a,
    cnsmp_oil__G__W_h_per_a,
    cnsmp_oil_condensing__G__W_h_per_a,
    cnsmp_gas__G__W_h_per_a,
    cnsmp_district_heating__G__W_h_per_a,
    cnsmp_elec_heat_pump__G__W_h_per_a,
    cnsmp_other__G__W_h_per_a,
    cnsmp_oil__M__L_per_a,
    cnsmp_gas__M__m3_per_a,
    cnsmp_gas_district_heating__M__m3_per_a,
    costs_oil__M__eur_per_a,
    costs_gas__M__eur_per_a,
    costs_client_district_heating__M__eur_per_a,
    invest_heat_sources__M__eur_per_a,
    invest_energetic_renovation__M__eur_per_a,
    grant_heat_sources__M__eur_per_a,
    grant_energetic_renovation__M__eur_per_a,
    costs_heat_pump__M__eur,
    costs_other__M__eur_per_a,
    costs_total__M__eur,
    ems_oil__k__to_coe_per_a,
    ems_gas__k__to_coe_per_a
}





#[cfg(test)]
pub mod tests{
    use super::*;
    extern crate wasm_bindgen_test;
    pub mod buildings_test_case;
    mod compare_with_excel;





    #[test]
    fn test_buildings_get_results_by_id() {
        let mut buildings: Buildings = Buildings::new(2022,2025);

        assert!(!buildings.get_results_by_id("floor_A__k__m2/private").is_none());
    }

    #[test]
    fn test_results_buildings_get_results_by_id() {
        let mut results_buildings: ResultsBuildings = ResultsBuildings::new("buildings/results",2022,2025);

        assert!(!results_buildings.get_results_by_id("floor_A__k__m2/private").is_none());
    }
}



