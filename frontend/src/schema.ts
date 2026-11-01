export type SectorKey = 'private' | 'industry' | 'public';
export type DomainKey = 'buildings' | 'mobility' | 'energy' | 'economy';

export interface InputDefinition {
  id: string;
  domain: DomainKey;
  param: string;
  sector: SectorKey | null;
  label: string;
  unit: string;
  isExtrinsic: boolean;
  baseValue: number;
  description: string;
}

export interface SectorParamGroup {
  domain: DomainKey;
  param: string;
  label: string;
  unit: string;
  isExtrinsic: boolean;
  description: string;
  subCategory: string;
}

export interface ScalarParamGroup {
  id: string;
  domain: DomainKey;
  param: string;
  label: string;
  unit: string;
  isExtrinsic: boolean;
  baseValue: number;
  description: string;
  subCategory: string;
}

export const REFERENCE_POPULATION = 11238;

export const SECTOR_GROUPS: SectorParamGroup[] = [
  { domain: 'buildings', param: 'n_buildings', label: "Gebäudeanzahl", unit: 'Gebäude', isExtrinsic: true, description: "Anzahl der Gebäude je Sektor", subCategory: "1. Gebäudestruktur & Flächen" },
  { domain: 'buildings', param: 'floor_A_building__m2', label: "Gebäudefläche je Gebäude", unit: 'm²', isExtrinsic: false, description: "Durchschnittliche Nutzfläche je Gebäude", subCategory: "1. Gebäudestruktur & Flächen" },
  { domain: 'buildings', param: 'heat_dmd__kWh_per_m2_a', label: "Spezifischer Heizbedarf", unit: 'kWh / (m² · a)', isExtrinsic: false, description: "Heizwärmebedarf pro m² Nutzfläche", subCategory: "2. Energiebedarf & Strom" },
  { domain: 'buildings', param: 'hot_water_dmd__kWh_per_person_a', label: "Warmwasserbedarf", unit: 'kWh / (Person · a)', isExtrinsic: false, description: "Spezifischer Wärmebedarf für Warmwasser", subCategory: "2. Energiebedarf & Strom" },
  { domain: 'buildings', param: 'elec_dmd_capita__kWh_per_a', label: "Strombedarf je Einwohner", unit: 'kWh / a', isExtrinsic: false, description: "Spezifischer Haushaltsstromverbrauch", subCategory: "2. Energiebedarf & Strom" },
  { domain: 'buildings', param: 'n_inhabitants__k__', label: "Einwohnerzahl (Gebäude)", unit: '1.000 Einwohner', isExtrinsic: true, description: "Einwohner bzw. Gebäudenutzer je Sektor", subCategory: "1. Gebäudestruktur & Flächen" },
  { domain: 'buildings', param: 'A_heat_oil__k__m2', label: "Heizfläche Öl", unit: '1.000 m²', isExtrinsic: true, description: "Beheizte Fläche mit Ölheizung", subCategory: "3. Heizsysteme & Wärmeerzeuger" },
  { domain: 'buildings', param: 'A_heat_gas__k__m2', label: "Heizfläche Gas", unit: '1.000 m²', isExtrinsic: true, description: "Beheizte Fläche mit Gasheizung", subCategory: "3. Heizsysteme & Wärmeerzeuger" },
  { domain: 'buildings', param: 'A_heat_district_heating__k__m2', label: "Heizfläche Fernwärme", unit: '1.000 m²', isExtrinsic: true, description: "Beheizte Fläche an Fernwärmenetz angeschlossen", subCategory: "3. Heizsysteme & Wärmeerzeuger" },
  { domain: 'buildings', param: 'A_heat_heat_pump_air__k__m2', label: "Heizfläche Luft-Wärmepumpe", unit: '1.000 m²', isExtrinsic: true, description: "Beheizte Fläche mit Luft-Wärmepumpe", subCategory: "3. Heizsysteme & Wärmeerzeuger" },
  { domain: 'buildings', param: 'A_heat_heat_pump_ground__k__m2', label: "Heizfläche Erd-Wärmepumpe", unit: '1.000 m²', isExtrinsic: true, description: "Beheizte Fläche mit Erd-Wärmepumpe", subCategory: "3. Heizsysteme & Wärmeerzeuger" },
  { domain: 'mobility', param: 'n_inhabitants__k__', label: "Einwohnerzahl (Mobilität)", unit: '1.000 Einwohner', isExtrinsic: true, description: "Einwohner für Mobilitätsmodellierung", subCategory: "1. Fahrzeugflotte & Bestand" },
  { domain: 'mobility', param: 'n_cars__k__', label: "Pkw-Bestand Verbrenner", unit: '1.000 Pkw', isExtrinsic: true, description: "Anzahl registrierter fossiler Pkw", subCategory: "1. Fahrzeugflotte & Bestand" },
  { domain: 'mobility', param: 'n_bev__k__', label: "Bestand Elektro-Pkw (BEV)", unit: '1.000 Pkw', isExtrinsic: true, description: "Anzahl reiner Batterie-Elektrofahrzeuge", subCategory: "1. Fahrzeugflotte & Bestand" },
  { domain: 'mobility', param: 'car_mileage_per_vehicle__k__km_per_a', label: "Fahrleistung je Pkw", unit: '1.000 km / a', isExtrinsic: false, description: "Jährliche Fahrleistung pro Pkw", subCategory: "1. Fahrzeugflotte & Bestand" },
  { domain: 'energy', param: 'solar_roof_installed__MWp', label: "Installierte PV-Dachleistung", unit: 'MWp', isExtrinsic: true, description: "Bereits installierte PV-Leistung auf Dächern", subCategory: "1. Dach-Photovoltaik" },
  { domain: 'energy', param: 'solar_roof_self_consumption_part', label: "Eigenverbrauchsanteil Dach-PV", unit: 'Anteil (0–1)', isExtrinsic: false, description: "Anteil des PV-Stroms für Eigenverbrauch vor Ort (0-1)", subCategory: "1. Dach-Photovoltaik" },
];

export const INPUT_DEFINITIONS: InputDefinition[] = [];

// Populate INPUT_DEFINITIONS for the 3 active sectors
const SECTOR_KEYS: SectorKey[] = ['private', 'industry', 'public'];
for (const group of SECTOR_GROUPS) {
  for (const sec of SECTOR_KEYS) {
    INPUT_DEFINITIONS.push({
      id: `${group.domain}/inputs/${group.param}/${sec}`,
      domain: group.domain,
      param: group.param,
      sector: sec,
      label: `${group.label} (${sec === 'private' ? 'Privat' : sec === 'industry' ? 'GHD' : 'Kommune'})`,
      unit: group.unit,
      isExtrinsic: group.isExtrinsic,
      baseValue: 0,
      description: group.description,
    });
  }
}

// Backwards-compatible aliases for legacy imports
export const V5_SECTOR_GROUPS = SECTOR_GROUPS;
export const V5_SCALAR_GROUPS: ScalarParamGroup[] = [];
export const V5_INPUT_DEFINITIONS = INPUT_DEFINITIONS;
export const V5_REFERENCE_POPULATION = REFERENCE_POPULATION;
