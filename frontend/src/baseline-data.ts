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
    // Sector 1: Buildings
    heatDmd: {
      enabled: boolean;
      targetPrivate: number; // kWh/m² (default 88, from 114)
      targetGHD: number;     // kWh/m² (default 75, from 96)
      targetKommune: number; // kWh/m² (default 75, from 96)
    };
    gasPhaseout: {
      enabled: boolean;
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

    // Sector 2: Energy
    pvRoof: {
      enabled: boolean;
      targetPrivate: number; // MWp (default 14.2, from 8.4)
      targetGHD: number;     // MWp (default 19.8, from 11.6)
      targetKommune: number; // MWp (default 1.0, from 0.6)
    };
    pvOpen: {
      enabled: boolean;
      targetPrivate: number; // ha
      targetGHD: number;     // ha (default 76.2, from 18.0)
      targetKommune: number; // ha (default 60.0, from 0.0)
    };
    wind: {
      enabled: boolean;
      targetPrivate: number;
      targetGHD: number;     // ha (default 164.9, from 144.9)
      targetKommune: number; // ha (default 20.0, from 0.0)
    };
    greenPower: {
      enabled: boolean;
      targetPrivate: number; // GWh (default 159.5, from 22.4)
      targetGHD: number;     // GWh (default 91.7, from 20.7)
      targetKommune: number; // GWh (default 5.9, from 1.1)
    };

    // Sector 3: Mobility
    evCars: {
      enabled: boolean;
      targetPrivate: number; // tsd vehicles (default 25.3, from 0.6)
      targetGHD: number;     // tsd vehicles (default 2.9, from 0.1)
      targetKommune: number; // tsd vehicles (default 0.2, from 0.0)
    };
    transitShare: {
      enabled: boolean;
      targetPrivate: number; // % (default 14.5)
      targetGHD: number;     // % (default 14.5)
      targetKommune: number; // % (default 29.0)
    };
    bikeShare: {
      enabled: boolean;
      targetPrivate: number; // % (default 3.2)
      targetGHD: number;     // % (default 3.2)
      targetKommune: number; // % (default 6.4)
    };
  };
}

export function createDefaultState(): CityBaseline {
  return {
    cityName: 'Kassel',
    population: 11238,
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
        targetPrivate: 88,
        targetGHD: 75,
        targetKommune: 75,
      },
      gasPhaseout: {
        enabled: true,
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
      pvRoof: {
        enabled: true,
        targetPrivate: 14.2,
        targetGHD: 19.8,
        targetKommune: 1.0,
      },
      pvOpen: {
        enabled: true,
        targetPrivate: 0.0,
        targetGHD: 76.2,
        targetKommune: 60.0,
      },
      wind: {
        enabled: true,
        targetPrivate: 0.0,
        targetGHD: 164.9,
        targetKommune: 20.0,
      },
      greenPower: {
        enabled: true,
        targetPrivate: 159.5,
        targetGHD: 91.7,
        targetKommune: 5.9,
      },
      evCars: {
        enabled: true,
        targetPrivate: 25.3,
        targetGHD: 2.9,
        targetKommune: 0.2,
      },
      transitShare: {
        enabled: true,
        targetPrivate: 14.5,
        targetGHD: 14.5,
        targetKommune: 29.0,
      },
      bikeShare: {
        enabled: true,
        targetPrivate: 3.2,
        targetGHD: 3.2,
        targetKommune: 6.4,
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

    if (m.private?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetPrivate = Math.round(m.private.heat_sources_targets__k__m2.gas);
    }
    if (m.industry?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetGHD = Math.round(m.industry.heat_sources_targets__k__m2.gas);
    }
    if (m.public?.heat_sources_targets__k__m2?.gas != null) {
      state.measures.gasPhaseout.targetKommune = Math.round(m.public.heat_sources_targets__k__m2.gas);
    }

    if (m.private?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetPrivate = Math.round(m.private.heat_sources_targets__k__m2.oil);
    }
    if (m.industry?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetGHD = Math.round(m.industry.heat_sources_targets__k__m2.oil);
    }
    if (m.public?.heat_sources_targets__k__m2?.oil != null) {
      state.measures.oilPhaseout.targetKommune = Math.round(m.public.heat_sources_targets__k__m2.oil);
    }

    if (m.private?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetPrivate = Number(m.private.pv_roof.target_installed__MWp.toFixed(1));
    }
    if (m.industry?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetGHD = Number(m.industry.pv_roof.target_installed__MWp.toFixed(1));
    }
    if (m.public?.pv_roof?.target_installed__MWp != null) {
      state.measures.pvRoof.targetKommune = Number(m.public.pv_roof.target_installed__MWp.toFixed(1));
    }

    if (m.industry?.renewables?.solar_ground_target__MWp != null) {
      state.measures.pvOpen.targetGHD = Number(m.industry.renewables.solar_ground_target__MWp.toFixed(1));
    }
    if (m.municipal_utility?.pv_ground_target__MWp != null) {
      state.measures.pvOpen.targetKommune = Number(m.municipal_utility.pv_ground_target__MWp.toFixed(1));
    }

    if (m.industry?.renewables?.wind_target__MWp != null) {
      state.measures.wind.targetGHD = Number(m.industry.renewables.wind_target__MWp.toFixed(1));
    }
    if (m.municipal_utility?.wind_target__MWp != null) {
      state.measures.wind.targetKommune = Number(m.municipal_utility.wind_target__MWp.toFixed(1));
    }

    if (m.private?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetPrivate = Number(m.private.mobility.bev_count_target__k__.toFixed(1));
    }
    if (m.industry?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetGHD = Number(m.industry.mobility.bev_count_target__k__.toFixed(1));
    }
    if (m.public?.mobility?.bev_count_target__k__ != null) {
      state.measures.evCars.targetKommune = Number(m.public.mobility.bev_count_target__k__.toFixed(1));
    }

    if (m.private?.mobility?.modal_split_pt_part != null) {
      state.measures.transitShare.targetPrivate = Number((m.private.mobility.modal_split_pt_part * 100).toFixed(1));
    }
    if (m.private?.mobility?.modal_split_bike_part != null) {
      state.measures.bikeShare.targetPrivate = Number((m.private.mobility.modal_split_bike_part * 100).toFixed(1));
    }
  }

  // If population is present in the imported data, sync top-level population (in 1.000 Ew. dimension)
  if (state.extractorInputs.buildings?.n_inhabitants__k__?.private) {
    const popK = state.extractorInputs.buildings.n_inhabitants__k__.private;
    state.population = Math.round(popK);
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
  };
  energy: {
    pvRoofBase: { private: number; ghd: number; kommune: number };
    pvOpenBase: { private: number; ghd: number; kommune: number };
    windBase: { private: number; ghd: number; kommune: number };
    greenPowerBase: { private: number; ghd: number; kommune: number };
  };
  mobility: {
    carsCountBase: { private: number; ghd: number; kommune: number };
    evCountBase: { private: number; ghd: number; kommune: number };
    transitShareBase: { private: number; ghd: number; kommune: number };
    bikeShareBase: { private: number; ghd: number; kommune: number };
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
    },
    energy: {
      pvRoofBase: {
        private: 3837.27 * popScale,
        ghd: 5347.19 * popScale,
        kommune: 281.43 * popScale,
      },
      pvOpenBase: {
        private: 0.0,
        ghd: 18.0 * (popScale * 224.76),
        kommune: 0.0,
      },
      windBase: {
        private: 0.0,
        ghd: 144.9 * (popScale * 224.76),
        kommune: 0.0,
      },
      greenPowerBase: {
        private: 22.4 * (popScale * 224.76),
        ghd: 20.7 * (popScale * 224.76),
        kommune: 1.1 * (popScale * 224.76),
      },
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
      transitShareBase: { private: 14.5, ghd: 14.5, kommune: 29.0 },
      bikeShareBase: { private: 3.2, ghd: 3.2, kommune: 6.4 },
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

