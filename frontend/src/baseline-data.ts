export * from './schema';
import { SectorKey, REFERENCE_POPULATION } from './schema';
import { DEFAULT_EXTRACTOR_INPUTS, ExtractorInputs } from './default-inputs';

export interface CityBaseline {
  cityName: string;
  population: number;
  startYear: number;
  endYear: number;
  
  // Fuel prices & scenario
  priceCO2: number;        // €/t
  priceOil: number;        // €/l
  priceGas: number;        // €/m³
  pricePetrol: number;     // €/l

  // Individual annual escalation rates (% per year)
  escCO2: number;          // %/a for CO2
  escOil: number;          // %/a for Heizöl
  escGas: number;          // %/a for Heizgas
  escPetrol: number;       // %/a for Benzin
  fossilEscalation: number;// % per year fallback
  escalationStart: number;
  escalationEnd: number;

  // The structured baseline inputs matching extraction_webfassung.py
  extractorInputs: ExtractorInputs;

  // Expert Mode custom overrides
  expertOverrides: Record<string, number>;

  // Measures configuration
  measures: {
    // Sector 1: Buildings & Heating
    heatDmd: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // kWh/m² (default 76, from 94.8)
      targetGHD: number;     // kWh/m² (default 76.5, from 95.6)
      targetKommune: number; // kWh/m² (default 76.5, from 95.6)
    };
    gasPhaseout: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // tsd m² remaining (default 0)
      subWpPrivate: number;  // % heat pump (default 50)
      subFwPrivate: number;  // % district heating (default 50)
      targetGHD: number;     // default 0
      subWpGHD: number;
      subFwGHD: number;
      targetKommune: number; // default 0
      subWpKommune: number;
      subFwKommune: number;
    };
    oilPhaseout: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // tsd m² remaining (default 0)
      subWpPrivate: number;
      subFwPrivate: number;
      targetGHD: number;
      subWpGHD: number;
      subFwGHD: number;
      targetKommune: number;
      subWpKommune: number;
      subFwKommune: number;
    };
    districtHeating: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      capacityGWh: number;   // default 5456.6
      shareRenewable: number;// % renewable (default 100%)
    };

    // Sector 2: Energy & Electricity
    pvRoof: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // MWp (default 11.5)
      targetGHD: number;     // MWp (default 10.7)
      targetKommune: number; // MWp (default 0.6)
      selfConsumptionPart?: number; // default 0.6
    };
    pvOpen: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // MWp
      targetGHD: number;     // MWp (default 8.2)
      targetKommune: number; // MWp (default 0.4)
    };
    wind: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number;
      targetGHD: number;     // MWp (default 16.5)
      targetKommune: number; // MWp (default 0.9)
    };
    biomass: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetGHD: number;     // MWp (default 2.35)
      targetKommune: number; // MWp (default 0.12)
    };
    storage: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      capacityMWh: number;   // MWh (default 20.0)
    };
    variableTariffs: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      customerShare: number; // % (default 20%)
    };

    // Sector 3: Mobility & Fleet
    evCars: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetPrivate: number; // tsd vehicles (default 5.9)
      targetGHD: number;     // tsd vehicles (default 0.7)
      targetKommune: number; // tsd vehicles (default 0.04)
    };

    // Sector 4: Municipal Infrastructure
    streetLighting: {
      enabled: boolean;
      startYear?: number;
      endYear?: number;
      targetKommune: number; // tsd LED points (default 1.21)
    };
  };
}

export function createDefaultState(): CityBaseline {
  return {
    cityName: 'Kassel',
    population: 11.238,
    startYear: 2026,
    endYear: 2040,

    priceCO2: 50.0,
    priceOil: 1.00,
    priceGas: 1.13,
    pricePetrol: 1.67,
    escCO2: 5,
    escOil: 3,
    escGas: 3,
    escPetrol: 2,
    fossilEscalation: 3,
    escalationStart: 2026,
    escalationEnd: 2045,

    extractorInputs: JSON.parse(JSON.stringify(DEFAULT_EXTRACTOR_INPUTS)),
    expertOverrides: {},

    measures: {
      heatDmd: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 76,
        targetGHD: 76,
        targetKommune: 76,
      },
      gasPhaseout: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 0,
        subWpPrivate: 50,
        subFwPrivate: 50,
        targetGHD: 0,
        subWpGHD: 50,
        subFwGHD: 50,
        targetKommune: 0,
        subWpKommune: 50,
        subFwKommune: 50,
      },
      oilPhaseout: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 0,
        subWpPrivate: 50,
        subFwPrivate: 50,
        targetGHD: 0,
        subWpGHD: 50,
        subFwGHD: 50,
        targetKommune: 0,
        subWpKommune: 50,
        subFwKommune: 50,
      },
      districtHeating: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        capacityGWh: 5456.6,
        shareRenewable: 100,
      },
      pvRoof: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 11.5,
        targetGHD: 10.7,
        targetKommune: 0.6,
        selfConsumptionPart: 0.6,
      },
      pvOpen: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 0.0,
        targetGHD: 8.2,
        targetKommune: 0.4,
      },
      wind: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 0.0,
        targetGHD: 16.5,
        targetKommune: 0.9,
      },
      biomass: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetGHD: 2.35,
        targetKommune: 0.12,
      },
      storage: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        capacityMWh: 20.0,
      },
      variableTariffs: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        customerShare: 20,
      },
      evCars: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetPrivate: 5.9,
        targetGHD: 0.7,
        targetKommune: 0.04,
      },
      streetLighting: {
        enabled: true,
        startYear: 2026,
        endYear: 2040,
        targetKommune: 1.21,
      },
    },
  };
}

export function exportStateInputs(state: CityBaseline): any {
  return {
    start_year: state.startYear,
    end_year: state.endYear,
    inputs: JSON.parse(JSON.stringify(state.extractorInputs)),
    measures: (state as any).extractorMeasures || {},
  };
}

export function importStateInputs(
  state: CityBaseline,
  rawJsonOrObj: any
): { success: boolean; message: string; modifiedCount: number } {
  let data = typeof rawJsonOrObj === 'string' ? JSON.parse(rawJsonOrObj) : rawJsonOrObj;
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'Ungültiges Datenformat. Erwartet wird ein JSON-Objekt.', modifiedCount: 0 };
  }

  const rootData = data;
  // Handle if wrapped in { "inputs": { ... } } (e.g. from extraction_webfassung.py fixture)
  if (data.inputs && typeof data.inputs === 'object' && (data.inputs.buildings || data.inputs.energy)) {
    data = data.inputs;
  }

  let domainCount = 0;
  let keyCount = 0;

  const domains = ['buildings', 'mobility', 'energy', 'economy'] as const;
  for (const dom of domains) {
    if (data[dom] && typeof data[dom] === 'object') {
      domainCount++;
      for (const [key, val] of Object.entries(data[dom])) {
        (state.extractorInputs as any)[dom][key] = JSON.parse(JSON.stringify(val));
        keyCount++;
      }
    }
  }

  if (domainCount === 0) {
    return {
      success: false,
      message: 'Keine gültigen Domänen (buildings, mobility, energy, economy) im JSON gefunden.',
      modifiedCount: 0,
    };
  }

  // Update time horizon if present
  if (rootData.start_year) state.startYear = rootData.start_year;
  if (rootData.end_year) state.endYear = rootData.end_year;

  // Update measures if present
  if (rootData.measures && typeof rootData.measures === 'object') {
    (state as any).extractorMeasures = JSON.parse(JSON.stringify(rootData.measures));
    const m = rootData.measures;
    // Fossil fuel prices from measures.fossil_prices if present
    if (m.fossil_prices?.petrol?.ist != null) {
      state.pricePetrol = m.fossil_prices.petrol.ist;
    }
    if (m.fossil_prices?.gas?.ist != null) {
      state.priceGas = m.fossil_prices.gas.ist;
    }

    // Heat demand
    if (m.private?.heat_demand?.target_kWh_per_m2_a != null) {
      state.measures.heatDmd.targetPrivate = Math.round(m.private.heat_demand.target_kWh_per_m2_a);
    }
    if (m.industry?.heat_demand?.target_kWh_per_m2_a != null) {
      state.measures.heatDmd.targetGHD = Math.round(m.industry.heat_demand.target_kWh_per_m2_a);
    }
    if (m.public?.heat_demand?.target_kWh_per_m2_a != null) {
      state.measures.heatDmd.targetKommune = Math.round(m.public.heat_demand.target_kWh_per_m2_a);
    }
    if (m.private?.heat_demand?.active != null) {
      state.measures.heatDmd.enabled = Boolean(m.private.heat_demand.active);
    }
    if (m.private?.heat_demand?.start_year != null) state.measures.heatDmd.startYear = m.private.heat_demand.start_year;
    if (m.private?.heat_demand?.end_year != null) state.measures.heatDmd.endYear = m.private.heat_demand.end_year;

    // Gas phaseout
    if (m.private?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetPrivate = Math.round(m.private.heat_sources_targets__k__m2.gas);
    }
    if (m.industry?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetGHD = Math.round(m.industry.heat_sources_targets__k__m2.gas);
    }
    if (m.public?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetKommune = Math.round(m.public.heat_sources_targets__k__m2.gas);
    }
    if (m.private?.gas_phaseout?.active != null) {
      state.measures.gasPhaseout.enabled = Boolean(m.private.gas_phaseout.active);
    }
    if (m.private?.gas_phaseout?.start_year != null) state.measures.gasPhaseout.startYear = m.private.gas_phaseout.start_year;
    if (m.private?.gas_phaseout?.end_year != null) state.measures.gasPhaseout.endYear = m.private.gas_phaseout.end_year;

    // Oil phaseout
    if (m.private?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetPrivate = Math.round(m.private.heat_sources_targets__k__m2.oil);
    }
    if (m.industry?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetGHD = Math.round(m.industry.heat_sources_targets__k__m2.oil);
    }
    if (m.public?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetKommune = Math.round(m.public.heat_sources_targets__k__m2.oil);
    }
    if (m.private?.oil_phaseout?.active != null) {
      state.measures.oilPhaseout.enabled = Boolean(m.private.oil_phaseout.active);
    }
    if (m.private?.oil_phaseout?.start_year != null) state.measures.oilPhaseout.startYear = m.private.oil_phaseout.start_year;
    if (m.private?.oil_phaseout?.end_year != null) state.measures.oilPhaseout.endYear = m.private.oil_phaseout.end_year;

    // District heating
    if (m.municipal_utility?.heating_network_capacity?.target != null) {
      state.measures.districtHeating.capacityGWh = Number(m.municipal_utility.heating_network_capacity.target.toFixed(1));
    } else if (m.municipal_utility?.heating_network_capacity__GWh_per_a != null) {
      state.measures.districtHeating.capacityGWh = Number(m.municipal_utility.heating_network_capacity__GWh_per_a.toFixed(1));
    }
    if (m.municipal_utility?.heating_network_capacity?.active != null) {
      state.measures.districtHeating.enabled = Boolean(m.municipal_utility.heating_network_capacity.active);
    }
    if (m.municipal_utility?.heating_network_capacity?.start_year != null) {
      state.measures.districtHeating.startYear = m.municipal_utility.heating_network_capacity.start_year;
    }
    if (m.municipal_utility?.heating_network_capacity?.end_year != null) {
      state.measures.districtHeating.endYear = m.municipal_utility.heating_network_capacity.end_year;
    }
    if (m.municipal_utility?.district_heating_sources) {
      const s = m.municipal_utility.district_heating_sources;
      const renSum = (s.biomass?.target ?? 0) + (s.waste_heat?.target ?? 0) + (s.river_heat?.target ?? 0) + (s.geothermal_shallow?.target ?? 0) + (s.geothermal_deep?.target ?? 0);
      if (renSum > 0) state.measures.districtHeating.shareRenewable = Math.round(renSum * 100);
    }

    // PV Roof
    if (m.private?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetPrivate = Number(m.private.pv_roof.target_installed__MWp.toFixed(1));
    }
    if (m.industry?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetGHD = Number(m.industry.pv_roof.target_installed__MWp.toFixed(1));
    }
    if (m.public?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetKommune = Number(m.public.pv_roof.target_installed__MWp.toFixed(1));
    }
    if (m.private?.pv_roof?.installed_settings?.active != null) {
      state.measures.pvRoof.enabled = Boolean(m.private.pv_roof.installed_settings.active);
    }
    if (m.private?.pv_roof?.installed_settings?.start_year != null) {
      state.measures.pvRoof.startYear = m.private.pv_roof.installed_settings.start_year;
    }
    if (m.private?.pv_roof?.installed_settings?.end_year != null) {
      state.measures.pvRoof.endYear = m.private.pv_roof.installed_settings.end_year;
    }

    // PV Open
    if (m.industry?.renewables?.solar_ground_target__MWp != null) {
      state.measures.pvOpen.targetGHD = Number(m.industry.renewables.solar_ground_target__MWp.toFixed(1));
    } else if (m.industry?.solar_ground?.target != null) {
      state.measures.pvOpen.targetGHD = Number(m.industry.solar_ground.target.toFixed(1));
    }
    if (m.municipal_utility?.pv_ground_target__MWp != null) {
      state.measures.pvOpen.targetKommune = Number(m.municipal_utility.pv_ground_target__MWp.toFixed(1));
    } else if (m.municipal_utility?.pv_ground?.target != null) {
      state.measures.pvOpen.targetKommune = Number(m.municipal_utility.pv_ground.target.toFixed(1));
    }
    if (m.industry?.solar_ground?.active != null) {
      state.measures.pvOpen.enabled = Boolean(m.industry.solar_ground.active);
    }
    if (m.industry?.solar_ground?.start_year != null) state.measures.pvOpen.startYear = m.industry.solar_ground.start_year;
    if (m.industry?.solar_ground?.end_year != null) state.measures.pvOpen.endYear = m.industry.solar_ground.end_year;

    // Wind
    if (m.industry?.renewables?.wind_target__MWp != null) {
      state.measures.wind.targetGHD = Number(m.industry.renewables.wind_target__MWp.toFixed(1));
    } else if (m.industry?.wind?.target != null) {
      state.measures.wind.targetGHD = Number(m.industry.wind.target.toFixed(1));
    }
    if (m.municipal_utility?.wind_target__MWp != null) {
      state.measures.wind.targetKommune = Number(m.municipal_utility.wind_target__MWp.toFixed(1));
    } else if (m.municipal_utility?.wind?.target != null) {
      state.measures.wind.targetKommune = Number(m.municipal_utility.wind.target.toFixed(1));
    }
    if (m.industry?.wind?.active != null) {
      state.measures.wind.enabled = Boolean(m.industry.wind.active);
    }
    if (m.industry?.wind?.start_year != null) state.measures.wind.startYear = m.industry.wind.start_year;
    if (m.industry?.wind?.end_year != null) state.measures.wind.endYear = m.industry.wind.end_year;

    // Biomass
    if (m.industry?.renewables?.biomass_target__MWp != null) {
      state.measures.biomass.targetGHD = Number((m.industry.renewables.biomass_target__MWp / 1000).toFixed(2));
    } else if (m.industry?.biomass?.target != null) {
      state.measures.biomass.targetGHD = Number((m.industry.biomass.target / 1000).toFixed(2));
    }
    if (m.municipal_utility?.biomass_target__MWp != null) {
      state.measures.biomass.targetKommune = Number((m.municipal_utility.biomass_target__MWp / 1000).toFixed(2));
    } else if (m.municipal_utility?.biomass?.target != null) {
      state.measures.biomass.targetKommune = Number((m.municipal_utility.biomass.target / 1000).toFixed(2));
    }
    if (m.industry?.biomass?.active != null) {
      state.measures.biomass.enabled = Boolean(m.industry.biomass.active);
    }
    if (m.industry?.biomass?.start_year != null) state.measures.biomass.startYear = m.industry.biomass.start_year;
    if (m.industry?.biomass?.end_year != null) state.measures.biomass.endYear = m.industry.biomass.end_year;

    // Storage
    if (m.municipal_utility?.grid_battery?.target != null) {
      state.measures.storage.capacityMWh = Number(m.municipal_utility.grid_battery.target.toFixed(1));
    } else if (m.municipal_utility?.grid_battery_capacity_target__MWh != null) {
      state.measures.storage.capacityMWh = Number(m.municipal_utility.grid_battery_capacity_target__MWh.toFixed(1));
    }
    if (m.municipal_utility?.grid_battery?.active != null) {
      state.measures.storage.enabled = Boolean(m.municipal_utility.grid_battery.active);
    }
    if (m.municipal_utility?.grid_battery?.start_year != null) state.measures.storage.startYear = m.municipal_utility.grid_battery.start_year;
    if (m.municipal_utility?.grid_battery?.end_year != null) state.measures.storage.endYear = m.municipal_utility.grid_battery.end_year;

    // Variable Tariffs
    if (m.municipal_utility?.variable_tariffs?.target != null) {
      state.measures.variableTariffs.customerShare = Math.round(m.municipal_utility.variable_tariffs.target * 100);
    } else if (m.municipal_utility?.variable_tariffs_customer_share != null) {
      state.measures.variableTariffs.customerShare = Math.round(m.municipal_utility.variable_tariffs_customer_share * 100);
    }
    if (m.municipal_utility?.variable_tariffs?.active != null) {
      state.measures.variableTariffs.enabled = Boolean(m.municipal_utility.variable_tariffs.active);
    }
    if (m.municipal_utility?.variable_tariffs?.start_year != null) state.measures.variableTariffs.startYear = m.municipal_utility.variable_tariffs.start_year;
    if (m.municipal_utility?.variable_tariffs?.end_year != null) state.measures.variableTariffs.endYear = m.municipal_utility.variable_tariffs.end_year;

    // EV Cars
    if (m.private?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetPrivate = Number(m.private.mobility.bev_count_target__k__.toFixed(1));
    } else if (m.private?.bev_cars?.target != null) {
      state.measures.evCars.targetPrivate = Number(m.private.bev_cars.target.toFixed(1));
    }
    if (m.industry?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetGHD = Number(m.industry.mobility.bev_count_target__k__.toFixed(1));
    } else if (m.industry?.bev_cars?.target != null) {
      state.measures.evCars.targetGHD = Number(m.industry.bev_cars.target.toFixed(1));
    }
    if (m.public?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetKommune = Number(m.public.mobility.bev_count_target__k__.toFixed(1));
    } else if (m.public?.bev_cars?.target != null) {
      state.measures.evCars.targetKommune = Number(m.public.bev_cars.target.toFixed(1));
    }
    if (m.private?.bev_cars?.active != null) {
      state.measures.evCars.enabled = Boolean(m.private.bev_cars.active);
    }
    if (m.private?.bev_cars?.start_year != null) state.measures.evCars.startYear = m.private.bev_cars.start_year;
    if (m.private?.bev_cars?.end_year != null) state.measures.evCars.endYear = m.private.bev_cars.end_year;

    // Street Lighting
    if (m.public?.street_lighting?.target != null) {
      state.measures.streetLighting.targetKommune = Number((m.public.street_lighting.target / 1000).toFixed(2));
    } else if (m.public?.lighting?.led_points_target__k__ != null) {
      state.measures.streetLighting.targetKommune = Number((m.public.lighting.led_points_target__k__ / 1000).toFixed(2));
    }
    if (m.public?.street_lighting?.active != null) {
      state.measures.streetLighting.enabled = Boolean(m.public.street_lighting.active);
    }
    if (m.public?.street_lighting?.start_year != null) state.measures.streetLighting.startYear = m.public.street_lighting.start_year;
    if (m.public?.street_lighting?.end_year != null) state.measures.streetLighting.endYear = m.public.street_lighting.end_year;
  }

  // If population is present in the imported data, sync top-level population (in 1.000 Ew. dimension)
  if (state.extractorInputs.buildings?.n_inhabitants__k__?.private) {
    const popK = state.extractorInputs.buildings.n_inhabitants__k__.private;
    state.population = popK >= 1000 ? popK / 1000 : popK;
  }

  return {
    success: true,
    message: `${keyCount} Parameter aus ${domainCount} Domänen erfolgreich importiert.`,
    modifiedCount: keyCount,
  };
}

export interface ScaledBaselines {
  popScale: number;
  buildings: {
    heatDmdBase: { private: number; ghd: number; kommune: number };
    gasAreaBase: { private: number; ghd: number; kommune: number };
    oilAreaBase: { private: number; ghd: number; kommune: number };
    districtHeatingBase: { private: number; ghd: number; kommune: number };
  };
  energy: {
    pvRoofBase: { private: number; ghd: number; kommune: number };
    pvOpenBase: { private: number; ghd: number; kommune: number };
    windBase: { private: number; ghd: number; kommune: number };
    biomassBase: { ghd: number; kommune: number };
    storageBase: number;
    variableTariffsBase: number;
  };
  mobility: {
    carsCountBase: { private: number; ghd: number; kommune: number };
    evCountBase: { private: number; ghd: number; kommune: number };
  };
  infrastructure: {
    lightingBase: number;
    districtHeatingCapacityBase: number;
  };
}

export function computeScaledBaselines(population: number): ScaledBaselines {
  const popScale = population / REFERENCE_POPULATION;
  return {
    popScale,
    buildings: {
      heatDmdBase: { private: 94.8, ghd: 95.6, kommune: 95.6 },
      gasAreaBase: {
        private: 279034.69 * popScale,
        ghd: 114352.29 * popScale,
        kommune: 2359.32 * popScale,
      },
      oilAreaBase: {
        private: 104028.47 * popScale,
        ghd: 21453.36 * popScale,
        kommune: 442.63 * popScale,
      },
      districtHeatingBase: {
        private: 83439.50 * popScale,
        ghd: 5314.13 * popScale,
        kommune: 109.64 * popScale,
      },
    },
    energy: {
      pvRoofBase: {
        private: 3837.27 * popScale,
        ghd: 5347.19 * popScale,
        kommune: 281.43 * popScale,
      },
      pvOpenBase: {
        private: 0.0,
        ghd: 4081.59 * popScale,
        kommune: 214.82 * popScale,
      },
      windBase: {
        private: 0.0,
        ghd: 8268.54 * popScale,
        kommune: 435.19 * popScale,
      },
      biomassBase: {
        ghd: 1176.03 * popScale,
        kommune: 61.90 * popScale,
      },
      storageBase: 0.0,
      variableTariffsBase: 10.0,
    },
    mobility: {
      carsCountBase: {
        private: 5870.12 * popScale,
        ghd: 731.77 * popScale,
        kommune: 38.51 * popScale,
      },
      evCountBase: {
        private: 196.50 * popScale,
        ghd: 24.50 * popScale,
        kommune: 1.29 * popScale,
      },
    },
    infrastructure: {
      lightingBase: 605.64 * popScale,
      districtHeatingCapacityBase: 0.0,
    },
  };
}

export function getBaselineValueForId(
  id: string,
  population: number,
  customInputs?: any
): number {
  const parts = id.split('/');
  const domain = parts[0];
  let param = parts[2];
  const sector = parts[3] as SectorKey | undefined;

  const inputs = customInputs || (DEFAULT_EXTRACTOR_INPUTS as any);
  if (!inputs[domain]) {
    return 0;
  }

  // Handle unit and parameter name aliases between Calculator and Extractor
  if (param === 'heat_dmd__k__W_h_per_m2_a') param = 'heat_dmd__kWh_per_m2_a';
  if (param === 'elec_dmd_capita__k_W_h_per_a') param = 'elec_dmd_capita__kWh_per_a';
  if (param === 'sol_rf_installed__M__Wp') param = 'solar_roof_installed__MWp';
  if (param === 'sol_rf_self_cnsmp_part') param = 'solar_roof_self_consumption_part';
  if (param === 'A_heat_heat_pump__k__m2') {
    const sec = sector || 'private';
    const air = inputs.buildings?.A_heat_heat_pump_air__k__m2?.[sec] || 0;
    const ground = inputs.buildings?.A_heat_heat_pump_ground__k__m2?.[sec] || 0;
    const baseVal = air + ground;
    if (population > 0) return (baseVal * population) / REFERENCE_POPULATION;
    return baseVal;
  }
  if (param === 'hot_water_dmd__k__W_h_per_m2_a') {
    const sec = sector || 'private';
    const hwPerPerson = inputs.buildings?.hot_water_dmd__kWh_per_person_a?.[sec] || 0;
    const inh = inputs.buildings?.n_inhabitants__k__?.[sec] || 0;
    const fl = inputs.buildings?.floor_A_total__k__m2?.[sec] || 1;
    return fl > 0 ? (hwPerPerson * inh) / fl : 0;
  }

  if (!inputs[domain][param]) {
    return 0;
  }

  const val = inputs[domain][param];
  let baseVal = 0;
  if (sector && typeof val === 'object' && val !== null) {
    baseVal = val[sector] || 0;
  } else if (typeof val === 'number') {
    baseVal = val;
  }

  const isExtrinsic = id.includes('n_') || id.includes('floor_A_total') || id.includes('installed') || id.includes('A_heat_');
  if (isExtrinsic && population > 0) {
    return (baseVal * population) / REFERENCE_POPULATION;
  }

  return baseVal;
}

export function calculateProjectedPrices(s: CityBaseline) {
  const targetYear = s.endYear;
  const compoundYears =
    targetYear >= s.escalationStart && targetYear <= s.escalationEnd
      ? targetYear - s.escalationStart
      : targetYear > s.escalationEnd
      ? s.escalationEnd - s.escalationStart
      : 0;

  const escCO2Rate = (s.escCO2 ?? s.fossilEscalation ?? 0) / 100;
  const escOilRate = (s.escOil ?? s.fossilEscalation ?? 0) / 100;
  const escGasRate = (s.escGas ?? s.fossilEscalation ?? 0) / 100;
  const escPetrolRate = (s.escPetrol ?? s.fossilEscalation ?? 0) / 100;

  const projCO2 = s.priceCO2 * Math.pow(1 + escCO2Rate, compoundYears);
  const deltaCO2 = Math.max(0, projCO2 - s.priceCO2);

  // Carbon surcharge based on German BEHG emissions factors:
  // Heating oil: 0.00266 t CO2/L
  // Natural gas: ~0.0020 t CO2/m3
  // Petrol: ~0.00237 t CO2/L
  const projOil = s.priceOil * Math.pow(1 + escOilRate, compoundYears) + deltaCO2 * 0.00266;
  const projGas = s.priceGas * Math.pow(1 + escGasRate, compoundYears) + deltaCO2 * 0.0020;
  const projPetrol = s.pricePetrol * Math.pow(1 + escPetrolRate, compoundYears) + deltaCO2 * 0.00237;

  return {
    compoundYears,
    targetYear,
    projCO2,
    pctCO2: s.priceCO2 > 0 ? ((projCO2 - s.priceCO2) / s.priceCO2) * 100 : 0,
    projOil,
    pctOil: s.priceOil > 0 ? ((projOil - s.priceOil) / s.priceOil) * 100 : 0,
    projGas,
    pctGas: s.priceGas > 0 ? ((projGas - s.priceGas) / s.priceGas) * 100 : 0,
    projPetrol,
    pctPetrol: s.pricePetrol > 0 ? ((projPetrol - s.pricePetrol) / s.pricePetrol) * 100 : 0,
  };
}

