use crate::buildings::Buildings;
use crate::sectors::SectorsInputs;

impl SectorsInputs{
    pub fn set(&mut self, private: f64, industry:f64, public: f64){
        self.private.set_values(private);
        self.industry.set_values(industry);
        self.public.set_values(public);
    }
}

pub fn create_buildings(start_year: u32, end_year: u32) -> Buildings{

    let mut buildings = Buildings::new(start_year, end_year);

    // [start:inputs]

    buildings.inputs.n_inhabitants__k__.set(217.0, 116.7053125, 4.059360576923077);
    buildings.inputs.n_buildings.set(44000.0, 5180.149927884616, 334.386045673077);
    buildings.inputs.floor_A_building__m2.set(197.68294830471567, 1.9225230799595314, 0.8788371689773329);

    buildings.inputs.heat_dmd__k__W_h_per_m2_a.set(114.43569553805774, 50.0, 50.0);
    buildings.inputs.hot_water_dmd__k__W_h_per_m2_a.set(1237.9807692307693, 10.0, 10.0);
    buildings.inputs.elec_dmd_capita__k_W_h_per_a.set(1253.2091346153845, 50.0, 50.0);

    buildings.inputs.A_heat_oil__k__m2.set(1168.5182735522906, 330.4891601843849, 9.752139152981853);
    buildings.inputs.A_heat_oil_condensing__k__m2.set(1295.8923033707865, 366.51404494382024, 10.815168539325846);
    buildings.inputs.A_heat_gas__k__m2.set(4918.884014423077, 2000.0961538461538, 59.01923076923079);
    buildings.inputs.A_heat_heat_pump__k__m2.set(278.2399038461538, 0.0, 0.0);

    buildings.inputs.price_oil__eur_per_L.set_values(0.8156);
    buildings.inputs.price_gas__eur_per_m3.set_values(11.0*0.0668);

    // [end:inputs]

    // [start:set_others]

    // [end:set_others]

    // [start:measures]

	//Private
	buildings.inputs.heat_dmd__k__W_h_per_m2_a.private.add_measure("heat_dmd__k__W_h_per_m2_a", 2024, 2030, 20.0);
	buildings.inputs.A_heat_oil__k__m2.private.add_measure("A_heat_oil__k__m2", 2024, 2035, 100.0);
	buildings.inputs.A_heat_oil_condensing__k__m2.private.add_measure("A_heat_oil_condensing__k__m2", 2024, 2025, 20.0);
	buildings.inputs.A_heat_gas__k__m2.private.add_measure("A_heat_gas__k__m2", 2024, 2025, 20.0);
	buildings.inputs.A_heat_heat_pump__k__m2.private.add_measure("A_heat_heat_pump__k__m2", 2024, 2025, 20.0);

	//Industry
	//buildings.inputs.heat_dmd__k__W_h_per_m2_a.industry.add_measure("heat_dmd__k__W_h_per_m2_a", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil__k__m2.industry.add_measure("A_heat_oil__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil_condensing__k__m2.industry.add_measure("A_heat_oil_condensing__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_gas__k__m2.industry.add_measure("A_heat_gas__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_heat_pump__k__m2.industry.add_measure("A_heat_heat_pump__k__m2", 2024, 2025, -20.0);

	//Schools
	//buildings.inputs.heat_dmd__k__W_h_per_m2_a.schools.add_measure("heat_dmd__k__W_h_per_m2_a", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil__k__m2.schools.add_measure("A_heat_oil__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil_condensing__k__m2.schools.add_measure("A_heat_oil_condensing__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_gas__k__m2.schools.add_measure("A_heat_gas__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_heat_pump__k__m2.schools.add_measure("A_heat_heat_pump__k__m2", 2024, 2025, -20.0);

	//Public
	//buildings.inputs.heat_dmd__k__W_h_per_m2_a.public.add_measure("heat_dmd__k__W_h_per_m2_a", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil__k__m2.public.add_measure("A_heat_oil__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_oil_condensing__k__m2.public.add_measure("A_heat_oil_condensing__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_gas__k__m2.public.add_measure("A_heat_gas__k__m2", 2024, 2025, 20.0);
	//buildings.inputs.A_heat_heat_pump__k__m2.public.add_measure("A_heat_heat_pump__k__m2", 2024, 2025, -20.0);

    // [end:measures]

    return buildings;
}


