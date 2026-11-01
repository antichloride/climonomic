use crate::energy::Energy;


pub fn create_energy(start_year: u32, end_year: u32) -> Energy{

    let mut energy = Energy::new(start_year, end_year);

    // [start:inputs]
    energy.inputs.rf_A__ha.set(6369.158653846154, 8875.352163461539, 467.1237980769231);
    energy.inputs.sol_rf_suitable_A_part.set(0.2, 0.2, 0.2);
    energy.inputs.sol_rf_installed__M__Wp.set(36.26212389624195, 50.53086871683937, 2.6595194061494407);
    energy.inputs.sol_rf_self_cnsmp_part.set(0.0006520432692307692, 0.0006520432692307692, 0.0006520432692307692);
    energy.inputs.sol_os_installed_A__ha.set(0.0, 10.0, 4.0);
    energy.inputs.sol_os_self_cnsmp_part.set(0.0, 0.0, 0.0);
    energy.inputs.prchsd_renewable_nrg__G__W_h_per_a.set(97.02403846153847, 89.94284855769232, 4.7338341346153845);
    energy.inputs.renewable_nrg_price__m__eur_per_W_h.set(0.3263, 0.2323, 0.2323);
    energy.inputs.nrg_mix_price__m__eur_per_W_h.set(0.3263, 0.2323, 0.2323);
    // [end:inputs]


    // [start:measures]

	//Private
	energy.inputs.sol_rf_installed__M__Wp.private.add_measure("sol_rf_installed__M__Wp", 2024, 2035, 20.0);

	//Industry
	//energy.inputs.sol_rf_installed__M__Wp.industry.add_measure("sol_rf_installed__M__Wp", 2024, 2025, -19.999999999999993);
	energy.inputs.sol_os_installed_A__ha.industry.add_measure("sol_os_installed_A__ha", 2024, 2040, -50.0);

	//Schools

	//Public
	//energy.inputs.sol_rf_installed__M__Wp.public.add_measure("sol_rf_installed__M__Wp", 2024, 2025, 20.0);
	energy.inputs.sol_os_installed_A__ha.public.add_measure("sol_os_installed_A__ha", 2024, 2040, -36.0);

    // [end:measures]

    return energy
}
