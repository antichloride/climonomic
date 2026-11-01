// Default baseline inputs matching scripts/extraction_webfassung.py

export const DEFAULT_EXTRACTOR_INPUTS = {
  "buildings": {
    "n_inhabitants__k__": {
      "private": 11238.0,
      "industry": 6173.766898203593,
      "public": 234.0061149700599
    },
    "n_households__k__": {
      "private": 5517.790706586827,
      "industry": 0.0,
      "public": 0.0
    },
    "n_buildings": {
      "private": 2634881.533437126,
      "industry": 243687.48373652698,
      "public": 7643.006419161677
    },
    "n_buildings_sum": 2886212.023592815,
    "floor_A_building__m2": {
      "private": 205.63161117277184,
      "industry": 807.6728924785461,
      "public": 531.3089243158846
    },
    "floor_A_total__k__m2": {
      "private": 541814.9349700599,
      "industry": 196819.7748502994,
      "public": 4060.797519104192
    },
    "floor_A_total_sum__k__m2": 742695.5073394635,
    "heat_dmd__kWh_per_m2_a": {
      "private": 94.82479727455527,
      "industry": 95.625,
      "public": 95.625
    },
    "hot_water_dmd__kWh_per_person_a": {
      "private": 1329.3413173652696,
      "industry": 187.43913127210953,
      "public": 187.43913127210953
    },
    "total_heat_dmd_baseline__GWh_per_a": {
      "private": 66316.62909341317,
      "industry": 19978.096474135666,
      "public": 432.1756656666878
    },
    "total_heat_dmd_baseline_sum__GWh_per_a": 86726.90123321551,
    "elec_dmd_capita__kWh_per_a": {
      "private": 1293.4131736526947,
      "industry": 2419.7767701430066,
      "public": 2419.7767701430066
    },
    "elec_dmd_baseline__GWh_per_a": {
      "private": 14535.377245508984,
      "industry": 14939.1377245509,
      "public": 566.2425610759645
    },
    "elec_dmd_baseline_sum__GWh_per_a": 30040.75753113585,
    "A_heat_oil__k__m2": {
      "private": 104028.4675142515,
      "industry": 21453.355458682636,
      "public": 442.6269295823569
    },
    "A_heat_gas__k__m2": {
      "private": 279034.6915095809,
      "industry": 114352.28918802395,
      "public": 2359.3233585995354
    },
    "A_heat_wood__k__m2": {
      "private": 23298.04220371258,
      "industry": 44087.62956646707,
      "public": 909.6186442793389
    },
    "A_heat_heat_pump_air__k__m2": {
      "private": 18015.34658775449,
      "industry": 5609.363583233534,
      "public": 115.73272929446948
    },
    "A_heat_heat_pump_ground__k__m2": {
      "private": 948.1761361976049,
      "industry": 0.0,
      "public": 0.0
    },
    "A_heat_district_heating__k__m2": {
      "private": 83439.49998538922,
      "industry": 5314.133920958085,
      "public": 109.64153301581321
    },
    "A_heat_other__k__m2": {
      "private": 33050.711033173604,
      "industry": 6003.003132934129,
      "public": 123.8543243326776
    },
    "district_heating_sources_mix": {
      "gas_part": 0.447,
      "coal_part": 0.168,
      "waste_part": 0.091,
      "biomass_part": 0.186,
      "waste_heat_part": 0.076,
      "river_heat_part": 0.0,
      "air_heat_part": 0.0,
      "geothermal_shallow_part": 0.0,
      "geothermal_deep_part": 0.006,
      "other_part": 0.026000000000000134
    },
    "prices__eur_per_kWh": {
      "heating_oil": 0.1198593701600413,
      "natural_gas": 0.16,
      "wood_pellets": 0.0847875,
      "district_heating": 0.16659999999999997,
      "other_heating": 0.10072215979835404
    },
    "tech_specs": {
      "renovation_invest__eur_per_kWh_a": 0.0,
      "wood_invest__eur_per_kWh_a": 0.9,
      "air_heat_pump_invest__eur_per_kWh_a": 3.0,
      "ground_heat_pump_invest__eur_per_kWh_a": 3.6,
      "district_heating_invest__eur_per_kWh_a": 0.99
    }
  },
  "mobility": {
    "n_inhabitants__k__": {
      "private": 11238.0,
      "industry": 6173.766898203593,
      "public": 234.0061149700599
    },
    "n_cars__k__": {
      "private": 5870.115161641581,
      "industry": 731.7722746752287,
      "public": 38.51433024606467
    },
    "n_cars_sum__k__": 6640.401766562874,
    "n_bev__k__": {
      "private": 196.5038204318084,
      "industry": 24.496290737087424,
      "public": 1.2892784598467066
    },
    "n_bev_sum__k__": 222.28938962874255,
    "car_mileage_per_vehicle__k__km_per_a": {
      "private": 12.309,
      "industry": 15.331,
      "public": 10.0
    },
    "specific_consumption": {
      "bev__kWh_per_100km": 52.587,
      "ice__kWh_per_100km": 50.234
    }
  },
  "energy": {
    "solar_roof_installed__MWp": {
      "private": 3837.27028864184,
      "industry": 5347.193720401031,
      "public": 281.43124844215953
    },
    "solar_roof_self_consumption_part": {
      "private": 0.3,
      "industry": 0.3,
      "public": 0.3
    },
    "solar_ground_installed__MWp": {
      "industry": 4081.594494610779,
      "public": 0.0
    },
    "wind_installed__MWp": {
      "industry": 8268.543556886227,
      "public": 0.0
    },
    "biomass_installed__MWp": {
      "industry": 1176.033147305389,
      "public": 0.0
    },
    "utility_parameters": {
      "grid_feed_in_part": 0.5,
      "margin_electricity__eur_per_kWh": 0.01,
      "grid_operator_margin__eur_per_kWh": 0.006,
      "concession_fee__eur_per_kWh": 0.01,
      "grid_invest_per_peak_MW__M__eur": 2.1031626506024095,
      "grid_capacity_utilization": 0.5,
      "grid_asset_lifespan_years": 40.0,
      "grid_wacc": 0.0507,
      "grid_tariff_capitalization_part": 0.5
    }
  },
  "economy": {
    "procurement_shares": {
      "local_crafting_invest_part": 0.75,
      "local_crafting_material_part": 0.2,
      "local_crafting_work_part": 0.6,
      "maintenance_local_job_part": 0.8,
      "local_reinvestment_income_part": 0.5
    },
    "taxes": {
      "corporate_profit_part": 0.073,
      "trade_tax_part": 0.011114249999999999,
      "corporate_tax_part": 0.01095,
      "income_per_employee__k__eur_per_a": 39.66517857142858,
      "income_tax_per_employee__k__eur_per_a": 7.656250000000001,
      "turnover_tax_part": 0.19
    },
    "job_coefficients": {
      "employees_per_M_eur_turnover": 3.5817619475207025
    }
  }
} as const;

export type ExtractorInputs = typeof DEFAULT_EXTRACTOR_INPUTS;
