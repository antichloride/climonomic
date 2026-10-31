#![allow(non_upper_case_globals, non_snake_case, dead_code)]

pub mod buildings{
    pub struct HeatType {
        pub efficency: f64,
        pub invest__m__eur_per_W_h: f64,
        pub grant: f64,
    }

    pub const oil_no_condensing: HeatType = HeatType {
        efficency: 0.87,
        invest__m__eur_per_W_h: 0.5,
        grant: 0.0,
    };
    pub const oil_with_condensing: HeatType = HeatType {
        efficency: 0.98,
        invest__m__eur_per_W_h: 1.0,
        grant: 0.1,
    };
    pub const gas: HeatType = HeatType {
        efficency: (0.87+0.98)/2.0, // TODO: This is the mean from oil condensing and not condensing (how
                                 // make this sense?)
        invest__m__eur_per_W_h: 0.5,
        grant: 0.2,
    };
    pub const district_heating: HeatType = HeatType {
        efficency: 0.88,
        invest__m__eur_per_W_h: 0.4,
        grant: 0.2,
    };
    pub const heat_pump: HeatType = HeatType {
        efficency: 3.0,
        invest__m__eur_per_W_h: 2.0,
        grant: 0.3,
    };
    pub const other: HeatType = HeatType {
        efficency: 1.0,
        invest__m__eur_per_W_h: 0.5,
        grant: 0.0,
    };

    pub mod EnergySource{

        pub mod oil{
            pub const energy_density__k__W_h_per_L: f64 = (40000000.0*0.833/3600.0/1000.0+43500000.0*0.748/3600.0/1000.0)/2.0;
            pub const price__eur_per_L: f64 = 0.82;
            pub const emission__kg_coe_per_L: f64 = 2.8;
        }

        pub mod gas{
            pub const energy_density__k__W_h_per_m3: f64 = 11.0;
            pub const price__eur_per_m3: f64 = 11.0*0.0668;
            pub const emission__kg_coe_per_m3: f64 = 2.0;
        }

        pub mod other{
            pub const energy_density: f64 = 0.0;
            pub const price: f64 = 0.82;
            pub const emission: f64 = 0.0;
        }

    }

    pub mod energetic_restoration{
        pub const invest__m__eur_per_W_h_m2: f64 = 2.5;
        pub const grant: f64 = 0.3;
    }



}

pub mod mobility{

        pub const price_fuel: f64 = 1.87;

        pub mod bev{
            pub const price: f64 = 35.0;
            pub const grant_per_car__k__eur: f64 = 9.0;
            pub const nrg_cnsmp__1em2__W_h_per_m: f64 = 15.65;
            pub const om_costs: f64 = 0.05;
            pub const fuel_costs: f64 = 0.05;
            pub const taxes_and_checks: f64 = 1.0;
            pub const lifecycle: f64 = 10.0;
        }

        pub mod combustor{
            pub const price: f64 = 30.0;
            pub const grant_per_car__k__eur: f64 = 0.0;
            pub const nrg_cnsmp__1em2__W_h_per_m: f64 = 5.7*(40000000.0*0.833/3600.0/1000.0+43500000.0*0.748/3600.0/1000.0)/2.0;            pub const fuel_costs: f64 = 0.07;
            pub const om_costs: f64 = 0.05;
            pub const taxes_and_checks: f64 = 1.0;
            pub const lifecycle: f64 = 10.0;
        }

}

pub mod energy{

    pub struct RenewableEnergy{
        pub invest__m__eur_per_Wp: f64,
        pub grant__m__eur_per_Wp: f64,
        pub operation_costs: f64,
        pub lifecycle: f64,
        pub Wp_to_W_h_per_a: f64,
        pub buyback_price__m__eur_per_W_h: f64,
        pub power_per_area__k__Wp_per_m2: f64,
        pub costs: f64,
        pub invest_and_om_costs__m__eur_per_W_h: f64,
    }

    pub const solar_roof: RenewableEnergy = RenewableEnergy{
        invest__m__eur_per_Wp: 1300.0,
        grant__m__eur_per_Wp: 0.0,
        operation_costs: 0.02,
        lifecycle: 30.0,
        Wp_to_W_h_per_a: 0.75*1105.0,
        buyback_price__m__eur_per_W_h: (0.086+0.075)/2.0,
        power_per_area__k__Wp_per_m2: 0.2,
        costs: 0.07,
        invest_and_om_costs__m__eur_per_W_h: 0.08366013,
    };

    pub const solar_landscape: RenewableEnergy = RenewableEnergy{
        invest__m__eur_per_Wp: 665.0,
        grant__m__eur_per_Wp: 0.0,
        operation_costs: 0.02,
        lifecycle: 30.0,
        Wp_to_W_h_per_a: 1105.0,
        buyback_price__m__eur_per_W_h: 0.0565,
        power_per_area__k__Wp_per_m2: 0.008333333333,
        costs: 0.05,
        invest_and_om_costs__m__eur_per_W_h: 0.0320965309200603,
    };

    pub const wind_onshore: RenewableEnergy = RenewableEnergy{
        invest__m__eur_per_Wp: 1700.0,
        grant__m__eur_per_Wp: 750.0,
        operation_costs: 0.02,
        lifecycle: 20.0,
        Wp_to_W_h_per_a: 1800.0,
        buyback_price__m__eur_per_W_h: 0.06,
        power_per_area__k__Wp_per_m2: 0.0240963855422,
        costs: 0.08,
        invest_and_om_costs__m__eur_per_W_h: 0.05,
    };

    pub mod evu_power_mix{
        pub const coal: f64 = (46.0+99.0)/489.6;
        pub const gas: f64 = 51.0/489.6;
        pub const atom: f64 = 65.0/489.6;
        pub const pv: f64 = 48.5/489.6;
        pub const wind: f64 = (89.5+24.0)/489.6;
        pub const other: f64 = 4.0/489.6;
    }

    pub mod evu_emissions{
        pub const coal: f64 = 999.0;
        pub const gas: f64 = 397.0;
    }

    pub const evu_discount_heat_pump: f64 = 1.0-0.238/0.3263;

}

pub mod economy{

    pub const revenue_margin: f64 = 0.05;
    pub const revenue_local_part: f64 = 0.073;

    pub mod material{
        pub mod invest_local{
            pub const heating_heatpump: f64 = 0.5;
            pub const energetic_restoration: f64 = 0.3;
            pub const fast_charging_stations: f64 = 0.65;
            pub const solar_roof: f64 = 0.5;
            pub const solar_landscape: f64 = 0.65;
        }
        pub mod invest_national{
            pub const heating_heatpump: f64 = 0.5;
            pub const energetic_restoration: f64 = 0.3;
            pub const fast_charging_stations: f64 = 0.65;
            pub const solar_roof: f64 = 0.5;
            pub const solar_landscape: f64 = 0.5;
        }
    }
    pub mod invest_work{
        pub mod loacal_value_add{
            pub const heating_heatpump: f64 = 0.3;
            pub const energetic_restoration: f64 = 0.3;
            pub const fast_charging_stations: f64 = 0.3;
            pub const solar_roof: f64 = 0.3;
            pub const solar_landscape: f64 = 0.15;
            pub const community: f64 = 0.5;
        }
        pub mod national_added_value{
            pub const heating_heatpump: f64 = 1.0;
            pub const energetic_restoration: f64 = 1.0;
            pub const fast_charging_stations: f64 = 1.0;
            pub const solar_roof: f64 = 1.0;
            pub const solar_landscape: f64 = 1.0;
            pub const community: f64 = 1.0;
        }
    }
    pub mod fte_per_million_turnover{
        pub mod material{
            pub const heating_heatpump: f64 = 1.0/204000.0*1000000.0;
            pub const energetic_restoration: f64 = 1.0/204000.0*1000000.0;
            pub const fast_charging_stations: f64 = 1.0/204000.0*1000000.0;
            pub const solar_roof: f64 = 1.0/204000.0*1000000.0;
            pub const solar_landscape: f64 = 1.0/204000.0*1000000.0;
        }
        pub mod work{
            pub const heating_heatpump: f64 = 386700.0/50.1/1000.0;
            pub const energetic_restoration: f64 = 386700.0/50.1/1000.0;
            pub const fast_charging_stations: f64 = 386700.0/50.1/1000.0;
            pub const solar_roof: f64 = 386700.0/50.1/1000.0;
            pub const solar_landscape: f64 = 386700.0/50.1/1000.0;
        }
    }
    pub mod maintenance_community_costs{
        pub mod loacal_value_add{
            pub const fast_charging_stations: f64 = 0.3;
            pub const solar_roof: f64 = 0.3;
            pub const solar_landscape: f64 = 0.2;
            pub const community: f64 = 0.75;
        }
        pub mod national_added_value{
            pub const fast_charging_stations: f64 = 1.0;
            pub const solar_roof: f64 = 1.0;
            pub const solar_landscape: f64 = 1.0;
            pub const community: f64 = 0.75;
        }
    }

    pub mod tax{
        pub const business_tax: f64 = 0.073*0.035*4.35;
        pub const income_per_fte: f64 = 1777.0/44.8;
        pub const income_tax_per_fte: f64 = 343.0/44.8;
        pub const income_tax_local_per_fte: f64 = 343.0/44.8*0.15;
        pub const turnover_tax: f64 = 0.19;
        pub const turnover_tax_local_part: f64 = 0.19*0.02;
        pub const corporate_tax: f64 = 0.0;
    }

    pub mod energy_taxes{
        pub const oil: f64 = 0.13*0.84;
        pub const gas: f64 = 0.0318;
        pub const fuel: f64 = 0.721;
        pub const electric: f64 = 0.0205;
    }
}
