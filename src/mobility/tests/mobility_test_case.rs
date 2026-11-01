use crate::mobility::Mobility;

pub fn create_mobility(start_year: u32, end_year: u32) -> Mobility{

    let mut mobility = Mobility::new(start_year, end_year);

    // [start:inputs]
    mobility.inputs.n_inhabitants__k__.set(217.0, 116.7053125, 4.059360576923077);
    mobility.inputs.traveld_dist_per_person__m__m_per_a.set_values(14.975961538461538);
    mobility.inputs.mean_persons_per_car.set_values(1.2145695364238411);
    mobility.inputs.modal_split_car.set_values(0.62);
    mobility.inputs.n_cars__k__.set(87.0, 8.0, 0.5);
    mobility.inputs.n_bev__k__.set(0.000719691454326923, 7.315663633233172e-05, 3.9138800437797477e-07);
    mobility.inputs.n_sl__k__.set_values(24.12560096153846);
    mobility.inputs.nrg_cnsmp_per_sl__k__W_h_per_a.set_values(432.43243243243245);
    mobility.inputs.om_costs_per_sl__eur_per_a.set_values(119.54032432432432);
    mobility.inputs.price_fuel__eur_per_L.set_values(0.652*1.912+0.312*1.99);
    // [end:inputs]


    // [start:measures]

	//Private
	//mobility.inputs.n_cars__k__.private.add_measure("n_cars__k__", 2024, 2025, 20.0);
	mobility.inputs.n_bev__k__.private.add_measure("n_bev__k__", 2024, 2025, -20.0);

	//Industry
	//mobility.inputs.n_cars__k__.industry.add_measure("n_cars__k__", 2024, 2025, 20.0);
	mobility.inputs.n_bev__k__.industry.add_measure("n_bev__k__", 2024, 2025, -20.0);

	//Schools

	//Public
	//mobility.inputs.n_cars__k__.public.add_measure("n_cars__k__", 2024, 2025, 20.0);
	mobility.inputs.n_bev__k__.public.add_measure("n_bev__k__", 2024, 2025, -20.0);

    // [end:measures]

    return mobility
}

