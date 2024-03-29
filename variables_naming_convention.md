
1. Abbrevations
    Abbrevatrions can be used if a word occurs a least 3 times in variables
    or if it is a common abbrevation

    energy -> nrg
    consumption -> cnsmp
    heating, heater -> heat
    emissions -> ems
    dmd -> demand
    A -> area
    electricity -> elec
    solar -> sol
    roof -> rf
    open space -> os
    portion -> part
    om -> operation and maintenance
    production -> prod
    purchased -> prchsd
    street light -> sl


2. Units
    1. start of units is indicated by double underscores:
        "time__s" for seconds
    2. multiple units are separated by a single underscore:
        "power__W_s" for W*s (watt second)
    3. units in the denominator are written after a "_per_":
        "velocity__m_per_s" for m/s or "force__kg_m_per_s_s" for kg*m/(s*s)
    4. square or cubic units a simply indicated by a number after the unit:
        "force__kg_m_per_s2" for kg*m/s^2
    5.  1. powers are in the very front of the unit declaration and another double score after it:
            "velocity__1e3__m_per_h" for km/h
        2. negative powers are denoted by an "m" for "minus":
            "length__1em-3__m" for milli meter
        3. alternatively SI-prefixes can be used:
            "velocity__k__m_per_h" or "length__m__m"

            n -> nano,
            mik -> mikro,
            m -> milli,
            c -> centi,
            d -> dezi,
            k -> kilo,
            M -> Mega,
            G -> Giga,
            T -> Tera,
        4. if there is no unit, but just a power the notation is
            "number__k__" for number * 1000

    6. Units in this project are:
        - m -> meter
        - W -> watt
        - h -> hours
        - L -> liter
        - eur -> euro
        - to -> tonne
        - coe -> co2 equivalent
        - hektar -> ha
        - Wp -> power peak


Buildings:
    Inputs:
        n_buildings,
        floor_A_building__m2,
        heat_dmd__k__W_h_per_m2,
        n_inhabitants__k__,
        hot_water_dmd_capita__k__W_h_per_a,
        elec_dmd_capita__k_W_per_a,
        A_heat_oil__k__m2,
        A_heat_oil_condensing__k__m2,
        A_heat_gas__k__m2,
        A_heat_heat_pump__k__m2
    Results:
        floor_A__k__m2,
        total_heat_dmd__G__W_h_per_a,
        elec_dmd__G__W_h_per_a,
        cnsmp_oil__G__W_h_per_a,
        cnsmp_oil_condendsing__G__W_h_per_a,
        cnsmp_gas__G__W_h_per_a,
        cnsmp_elec_heat_pump__G__W_h_per_a,
        cnsmp_other__G__W_h_per_a,
        cnsmp_oil__M__L,
        cnsmp_gas__M__m3,
        costs_oil__M__eur,
        costs_gas__M__eur,
        invest_heat_sources__M__eur,
        invest_energetic_renovation__M__eur,
        grant_heat_sources__M__eur,
        grant_energetic_renovation__M__eur,
        costs_heat_pump__M__eur,
        ems_oil__k__to_coe_per_a,
        ems_gas__k__to_coe_per_a,

Energy:
    Inputs:
        rf_A__ha,
        sol_rf_suitable_A_part,
        sol_rf_installed__M__Wp,
        sol_rf_self_cnsmp_part,
        sol_os_installed_A__ha,
        prchsd_renewable_nrg__G__W_h_per_a,
        renewable_nrg_price__m__eur_per_W_h,
        nrg_mix_price__m__eur_per_W_h,
        nrg_mix_ems__m__kg_per_W_h
    Results:
        sol_rf_installed__M__Wp,
        sol_rf_nrg__G__W_h_per_a,
        sol_rf_self_cnsmp__G__W_h_per_a,
        sol_rf_invest__M__eur_per_a,
        sol_rf_grant__M__eur_per_a,
        sol_rf_om_costs__M__eur_per_a,
        sol_rf_revenue__M__eur_per_a,
        sol_os_installed__M__Wp,
        sol_os_nrg__G__W_h_per_a,
        sol_os_invest__M__eur_per_a,
        sol_os_grant__M__eur_per_a,
        sol_os_om_costs__M__eur_per_a,
        sol_os_prod_costs__M__eur_per_a,
        prchsd_renweable_nrg__M__eur_per_a,
        elec_nrg_dmd__G__W_h_per_a,
        prchsd_nrg_mix__G__W_h_per_a,
        prchsd_nrg_mix_costs__M__eur_per_a,
        prchsd_nrg_mix_ems__k__to_coe_per_a,

Mobility:
    Inputs:
        n_cars__k__,
        n_bev__k__,
        traveld_dist_car__M__m_per_a
        n_laterns__k__
        nrg_cnsmp_lantern__k__W_h_per_a,
        sl_om_costs__eur_per_a,
    Results:
        cars_grant__M__eur_per_a,
        bev_elec_nrg_dmd__G__W_h_per_a,
        cars_fuel_dmd__M__L_per_a
        cars_fuel_costs__M__eur_per_a,
        bev_nrg_costs__M__eur_per_a,
        cars_ems__k__to_coe_per_a
        sl_nrg_costs__M__eur_per_a
        sl_om_costs__M__eur_per_a
        sl_total_costs__M__eur_per_a

Economy:
    inv_heat_material__M__eur_per_a,
    inv_heat_work__M__eur_per_a,
    to_heat_craft_loc__M__eur_per_a,
    to_heat_craft_nat,
    to_heat_prod_nat,
    inv_heat_dmd_material,
    inv_heat_dmd_work,
    to_heat_dmd_craft_loc,
    to_heat_dmd_craft_nat,
    to_heat_dmd_prod_nat,
    inv_sol_roof_material,
    inv_sol_roof_work,
    om_sol_roof_work,
    to_solar_roof_crafting_loc,
    to_solar_roof_crafting_national,
    to_solar_roof_production_national,
    inv_solar_landscape_material,
    inv_solar_landscape_work,
    maintenance_solar_landscape_work,
    to_solar_landscape_crafting_local,
    to_solar_landscape_crafting_national,
    to_solar_landscape_production_national,
    jobs_crafting_local,
    jobs_crafting_national,
    jobs_production_national,
    income_local,
    income_national,
    income_tax_local,
    income_tax_national,
    to_local_with_local_part_of_material,
    to_national,
    to_tax_local,
    to_tax_national,
    business_tax_local,
    business_tax_national,
    corporate_tax_national
