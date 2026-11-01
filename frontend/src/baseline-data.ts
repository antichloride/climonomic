export * from './v5-schema';

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
  fossilEscalation: number;// % per year
  escalationStart: number;
  escalationEnd: number;

  // Expert Mode custom overrides for all 116 input IDs
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
    population: 50000,
    startYear: 2026,
    endYear: 2040,

    priceCO2: 50.0,
    priceOil: 1.00,
    priceGas: 1.13,
    pricePetrol: 1.67,
    fossilEscalation: 0,
    escalationStart: 2026,
    escalationEnd: 2045,

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
  const popScale = population / 50000;
  return {
    popScale,
    buildings: {
      heatDmdBase: { private: 114, ghd: 96, kommune: 96 },
      gasAreaBase: {
        private: 1133 * popScale,
        ghd: 461 * popScale,
        kommune: 46 * popScale,
      },
      oilAreaBase: {
        private: 568 * popScale,
        ghd: 161 * popScale,
        kommune: 16 * popScale,
      },
    },
    energy: {
      pvRoofBase: {
        private: 8.4 * popScale,
        ghd: 11.6 * popScale,
        kommune: 0.6 * popScale,
      },
      pvOpenBase: {
        private: 0.0,
        ghd: 18.0 * popScale,
        kommune: 0.0,
      },
      windBase: {
        private: 0.0,
        ghd: 144.9 * popScale,
        kommune: 0.0,
      },
      greenPowerBase: {
        private: 22.4 * popScale,
        ghd: 20.7 * popScale,
        kommune: 1.1 * popScale,
      },
    },
    mobility: {
      carsCountBase: {
        private: 25.9 * popScale,
        ghd: 3.0 * popScale,
        kommune: 0.2 * popScale,
      },
      evCountBase: {
        private: 0.6 * popScale,
        ghd: 0.1 * popScale,
        kommune: 0.0,
      },
      transitShareBase: { private: 14.5, ghd: 14.5, kommune: 29.0 },
      bikeShareBase: { private: 3.2, ghd: 3.2, kommune: 6.4 },
    },
  };
}
