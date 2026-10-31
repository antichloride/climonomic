#!/usr/bin/env python3
"""
Excel Version 5 Extraction Tool for climcalc-core
Extracts all baseline inputs, measures, and annual calculation outputs from
'Rechnung Parameter v5.xlsx' into a complete, standalone JSON test fixture.

Zero external dependencies: uses Python standard library (zipfile + xml.etree.ElementTree).
"""

import sys
import os
import json
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, List, Any, Optional

NS = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


class ExcelWorkbookV5:
    """Zero-dependency parser for Excel .xlsx files based on OpenXML packaging."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.zip = zipfile.ZipFile(filepath, 'r')
        self.shared_strings = self._load_shared_strings()
        self.sheet_targets = self._load_sheet_targets()

    def _load_shared_strings(self) -> List[str]:
        strings = []
        if 'xl/sharedStrings.xml' in self.zip.namelist():
            sst = ET.fromstring(self.zip.read('xl/sharedStrings.xml'))
            for si in sst.findall('main:si', NS):
                t = si.find('main:t', NS)
                if t is not None:
                    strings.append(t.text or '')
                else:
                    parts = [rt.text or '' for rt in si.findall('.//main:t', NS)]
                    strings.append(''.join(parts))
        return strings

    def _load_sheet_targets(self) -> Dict[str, str]:
        rels = ET.fromstring(self.zip.read('xl/_rels/workbook.xml.rels'))
        rel_map = {r.attrib['Id']: r.attrib['Target'] for r in rels}

        wb = ET.fromstring(self.zip.read('xl/workbook.xml'))
        targets = {}
        for s in wb.findall('.//main:sheet', NS):
            name = s.attrib['name']
            rId = s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            target = rel_map.get(rId, '')
            if not target.startswith('xl/'):
                target = 'xl/' + target
            targets[name] = target
        return targets

    def get_sheet_rows(self, sheet_name: str) -> Dict[int, Dict[str, Any]]:
        target = self.sheet_targets.get(sheet_name)
        if not target or target not in self.zip.namelist():
            raise ValueError(f"Sheet '{sheet_name}' not found in {self.filepath}")

        sheet_xml = ET.fromstring(self.zip.read(target))
        rows_data = {}

        for row in sheet_xml.findall('.//main:row', NS):
            r_idx = int(row.attrib['r'])
            cols = {}
            for c in row.findall('main:c', NS):
                coord = c.attrib['r']
                col_letter = ''.join([ch for ch in coord if ch.isalpha()])
                t = c.attrib.get('t')
                v = c.find('main:v', NS)
                val = v.text if v is not None else None

                if val is not None:
                    if t == 's':
                        idx = int(val)
                        val = self.shared_strings[idx] if idx < len(self.shared_strings) else ''
                    elif t == 'b':
                        val = val == '1'
                    else:
                        try:
                            val = float(val) if ('.' in val or 'e' in val.lower()) else int(val)
                        except ValueError:
                            pass
                cols[col_letter] = val
            rows_data[r_idx] = cols

        return rows_data

    def close(self):
        self.zip.close()


def extract_v5(excel_path: str, output_path: str):
    print(f"Opening Excel Version 5 workbook: {excel_path}")
    wb = ExcelWorkbookV5(excel_path)

    # -------------------------------------------------------------
    # 1. Timeline & Years Discovery (Rechenwerk Sheet)
    # -------------------------------------------------------------
    rechenwerk = wb.get_sheet_rows("Rechenwerk")
    row1 = rechenwerk.get(1, {})

    year_cols = []
    years = []
    for col_idx in range(ord('C'), ord('Z') + 1):
        col_letter = chr(col_idx)
        val = row1.get(col_letter)
        if val is not None:
            try:
                year = int(val)
                years.append(year)
                year_cols.append((col_letter, year))
            except ValueError:
                pass

    start_year = min(years) if years else 2022
    end_year = max(years) if years else 2045
    print(f"Simulation Year Range: {start_year} - {end_year} ({len(years)} years)")

    # -------------------------------------------------------------
    # 2. Extract ALL Inputs from 'Eingabe Ist' (Version 5 Structure)
    # -------------------------------------------------------------
    eingabe = wb.get_sheet_rows("Eingabe Ist")

    def val(row_idx: int, col: str, default: Any = 0.0) -> Any:
        r = eingabe.get(row_idx, {})
        v = r.get(col)
        if v is None or str(v).strip() == '':
            return default
        try:
            return float(v)
        except (ValueError, TypeError):
            return v

    def s4(row_idx: int) -> Dict[str, float]:
        """Read 4 sectors: Wohnen (private), GHD (industry), Schulen (schools), Kommune (public)."""
        return {
            "private": float(val(row_idx, "B", 0.0)),
            "industry": float(val(row_idx, "C", 0.0)),
            "schools": float(val(row_idx, "D", 0.0)),
            "public": float(val(row_idx, "E", 0.0)),
        }

    def s3(row_idx: int) -> Dict[str, float]:
        """Read 3 sectors: Wohnen (private), GHD (industry), Kommune (public); pad schools=0.0."""
        return {
            "private": float(val(row_idx, "B", 0.0)),
            "industry": float(val(row_idx, "C", 0.0)),
            "schools": 0.0,
            "public": float(val(row_idx, "D", 0.0)),
        }

    def s2(row_idx: int) -> Dict[str, float]:
        """Read 2 sectors: GHD (industry), Kommune (public); pad private=0.0, schools=0.0."""
        return {
            "private": 0.0,
            "industry": float(val(row_idx, "C", 0.0)),
            "schools": 0.0,
            "public": float(val(row_idx, "D", 0.0)),
        }

    # All inputs organized into clean domains and sub-structures
    all_inputs = {
        "buildings": {
            # Core sector parameters
            "n_inhabitants__k__": s4(5),
            "n_buildings": s4(6),
            "floor_A_building__m2": s4(7),
            "floor_A_total__k__m2": s4(8),
            "heat_dmd__k__W_h_per_m2_a": s4(9),
            "hot_water_dmd__k__W_h_per_m2_a": s4(10),
            "total_heat_dmd_baseline__G__W_h_per_a": s4(11),
            "elec_dmd_capita__k_W_h_per_a": s4(17),
            "elec_dmd_baseline__G__W_h_per_a": s4(18),
            # Heating area distribution by system
            "A_heat_oil__k__m2": s4(12),
            "A_heat_oil_condensing__k__m2": s4(13),
            "A_heat_gas__k__m2": s4(14),
            "A_heat_heat_pump__k__m2": s4(15),
            "A_heat_other__k__m2": s4(16),
            "A_heat_district_heating__k__m2": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            # Tariffs & fuel prices
            "price_oil__eur_per_L": float(val(15, "J", 0.9)),
            "price_gas__eur_per_m3": float(val(16, "J", 0.9)),
            "price_other_output_nrg__m__eur_per_W_h": float(val(17, "J", 0.9)),
            "price_district_heating__m__eur_per_W_h": 0.08,
            "district_heating_renewable_part": 0.0,
            # Heating efficiencies and CapEx constants in Excel v5
            "tech_specs": {
                "oil_no_condensing": {"efficiency": float(val(5, "J", 0.7)), "invest__eur_per_kWh_a": float(val(5, "K", 0.5))},
                "oil_with_condensing": {"efficiency": float(val(6, "J", 0.9)), "invest__eur_per_kWh_a": float(val(6, "K", 1.0)), "grant_part": float(val(6, "L", 0.1))},
                "gas": {"efficiency": float(val(7, "J", 0.9)), "invest__eur_per_kWh_a": float(val(7, "K", 0.5)), "grant_part": float(val(7, "L", 0.2))},
                "heat_pump": {"cop_jaz": float(val(8, "J", 3.0)), "invest__eur_per_kWh_a": float(val(8, "K", 2.0)), "grant_part": float(val(8, "L", 0.3))},
                "renovation": {"invest__eur_per_kWh_a": float(val(10, "K", 2.5)), "grant_part": float(val(10, "L", 0.3))},
                "energy_content": {"oil_fuel__kWh_per_L": float(val(12, "J", 10.0)), "gas__kWh_per_m3": float(val(13, "J", 5.0))},
                "emission_factors": {"oil_fuel__kg_co2_per_L": float(val(15, "M", 3.0)), "gas__kg_co2_per_m3": float(val(16, "M", 2.0))}
            }
        },
        "mobility": {
            # Demographics and passenger car fleet
            "n_inhabitants__k__": s4(5),
            "n_cars__k__": s3(24),
            "n_bev__k__": s3(25),
            "car_mileage_per_vehicle__k__km_per_a": s3(26),
            "traveld_dist_per_person__m__m_per_a": float(val(23, "J", 15.0)),
            "mean_persons_per_car": float(val(27, "B", 1.214)),
            "modal_split": {
                "car": float(val(27, "J", 0.8)),
                "pedestrian": float(val(24, "J", 0.05)),
                "bicycle": float(val(25, "J", 0.05)),
                "public_transport": float(val(26, "J", 0.10))
            },
            "price_fuel__eur_per_L": float(val(23, "M", 1.7)),
            # Street lighting
            "n_sl__k__": float(val(30, "D", 9.0)),
            "nrg_cnsmp_per_sl__k__W_h_per_a": float(val(31, "D", 500.0)),
            "om_costs_per_sl__eur_per_a": float(val(32, "D", 200.0)),
            # Vehicle lifecycle cost parameters (LCC)
            "vehicle_specs": {
                "bev": {
                    "purchase_price__k__eur": float(val(31, "J", 35.0)),
                    "grant_subsidy__k__eur": float(val(31, "K", 9.0)),
                    "nrg_consumption__kWh_per_100km": float(val(31, "M", 24.0)),
                    "power_price__eur_per_kWh": float(val(31, "N", 0.3)),
                    "variable_om__eur_per_km": float(val(31, "P", 0.05)),
                    "fixed_om__k__eur_per_a": float(val(31, "Q", 1.0)),
                    "lifetime__a": float(val(31, "R", 10.0))
                },
                "combustor": {
                    "purchase_price__k__eur": float(val(32, "J", 30.0)),
                    "fuel_consumption__kWh_per_100km": float(val(32, "M", 70.0)),
                    "fuel_price__eur_per_kWh": float(val(32, "N", 0.17)),
                    "variable_om__eur_per_km": float(val(32, "P", 0.05)),
                    "fixed_om__k__eur_per_a": float(val(32, "Q", 1.0)),
                    "lifetime__a": float(val(32, "R", 10.0))
                }
            }
        },
        "energy": {
            # Solar rooftop capacity & potential
            "rf_A__ha": s3(38),
            "sol_rf_suitable_A_part": s3(39),
            "sol_rf_potential__M__Wp": s3(40),
            "sol_rf_installed__M__Wp": s3(41),
            "sol_rf_generated_baseline__G__W_h_per_a": s3(42),
            "sol_rf_self_cnsmp_part": s3(43),
            # Open-space solar
            "sol_os_potential_A__ha": float(val(47, "E", 150.0)),
            "sol_os_installed_A__ha": s2(48),
            "sol_os_installed__M__Wp": s2(49),
            "sol_os_self_cnsmp_part": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            # Wind energy
            "wind_suitable_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "wind_installed_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            # Grid power purchases and tariffs
            "prchsd_renewable_nrg__G__W_h_per_a": s3(52),
            "renewable_nrg_price__m__eur_per_W_h": s3(53),
            "heat_pump_discount_part": float(val(54, "E", 0.2)),
            "nrg_mix_price__m__eur_per_W_h": s3(55),
            # Technical and CapEx parameters
            "tech_specs": {
                "solar_roof": {
                    "invest__eur_per_kWp": float(val(38, "J", 1500.0)),
                    "grant__eur_per_kWp": float(val(38, "K", 500.0)),
                    "om_rate_invest_part": float(val(38, "L", 0.02)),
                    "lifetime__a": float(val(38, "M", 30.0)),
                    "annual_yield__kWh_per_kWp": float(val(38, "N", 900.0)),
                    "feed_in_tariff__eur_per_kWh": float(val(41, "J", 0.07037)),
                    "power_density__MWp_per_k_m2": float(val(43, "J", 0.16667))
                },
                "solar_landscape": {
                    "invest__eur_per_kWp": float(val(39, "J", 1200.0)),
                    "grant__eur_per_kWp": float(val(39, "K", 500.0)),
                    "om_rate_invest_part": float(val(39, "L", 0.02)),
                    "lifetime__a": float(val(39, "M", 30.0)),
                    "annual_yield__kWh_per_kWp": float(val(39, "N", 900.0)),
                    "feed_in_tariff__eur_per_kWh": float(val(42, "J", 0.07037)),
                    "power_density__MWp_per_k_m2": float(val(44, "J", 0.08333))
                },
                "wind_onshore": {
                    "invest__eur_per_kWp": float(val(40, "J", 2000.0)),
                    "grant__eur_per_kWp": float(val(40, "K", 750.0)),
                    "om_rate_invest_part": float(val(40, "L", 0.02)),
                    "lifetime__a": float(val(40, "M", 20.0)),
                    "annual_yield__kWh_per_kWp": float(val(40, "N", 1300.0))
                },
                "grid_mix_emissions": {
                    "coal": {"share": float(val(47, "J", 0.297)), "intensity__to_co2_per_GWh": float(val(47, "K", 1000.0))},
                    "gas": {"share": float(val(48, "J", 0.105)), "intensity__to_co2_per_GWh": float(val(48, "K", 600.0))},
                    "nuclear": {"share": float(val(49, "J", 0.133)), "intensity__to_co2_per_GWh": 0.0},
                    "pv": {"share": float(val(50, "J", 0.099)), "intensity__to_co2_per_GWh": 0.0},
                    "wind": {"share": float(val(51, "J", 0.230)), "intensity__to_co2_per_GWh": 0.0},
                    "other": {"share": float(val(52, "J", 0.136)), "intensity__to_co2_per_GWh": 0.0}
                }
            }
        },
        "economy_and_taxes": {
            "profit_share_turnover": float(val(57, "B", 0.05)),
            "trade_tax_share_turnover": float(val(58, "B", 0.0076125)),
            "corporate_tax_share_turnover": float(val(59, "B", 0.15)),
            "income_per_fte_job__k__eur": float(val(60, "B", 50.0)),
            "income_tax_per_fte_job__k__eur": float(val(61, "B", 7.5)),
            "income_tax_local_share__k__eur": float(val(62, "B", 1.125)),
            "vat_rate": float(val(63, "B", 0.19)),
            "vat_local_share": float(val(64, "B", 0.0038)),
            "multiplier_effect_avoided_oil_imports": float(val(65, "B", 1.0)),
            "energy_taxes": {
                "oil__eur_per_L": float(val(67, "B", 0.61)),
                "gas__eur_per_kWh": float(val(68, "B", 0.55)),
                "fuel__eur_per_L": float(val(69, "B", 0.65))
            },
            # Crafting vs manufacturing value addition splits
            "domain_value_creation": {
                "heating_wp": {
                    "material_share": float(val(59, "J", 0.5)), "work_share": float(val(59, "L", 0.3)),
                    "national_production_share": float(val(59, "K", 0.5)), "national_crafting_share": float(val(59, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(59, "N", 10.0)), "work_fte_per_m_eur": float(val(59, "O", 20.0))
                },
                "energetic_renovation": {
                    "material_share": float(val(60, "J", 0.3)), "work_share": float(val(60, "L", 0.3)),
                    "national_production_share": float(val(60, "K", 0.5)), "national_crafting_share": float(val(60, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(60, "N", 10.0)), "work_fte_per_m_eur": float(val(60, "O", 20.0))
                },
                "solar_roof": {
                    "material_share": float(val(62, "J", 0.5)), "work_share": float(val(62, "L", 0.3)),
                    "national_production_share": float(val(62, "K", 0.5)), "national_crafting_share": float(val(62, "M", 1.0)),
                    "om_local_share": float(val(62, "P", 0.3)), "om_national_share": float(val(62, "Q", 1.0))
                },
                "solar_landscape": {
                    "material_share": float(val(63, "J", 0.65)), "work_share": float(val(63, "L", 0.15)),
                    "national_production_share": float(val(63, "K", 0.5)), "national_crafting_share": float(val(63, "M", 1.0)),
                    "om_local_share": float(val(63, "P", 0.2)), "om_national_share": float(val(63, "Q", 1.0))
                }
            }
        }
    }

    # -------------------------------------------------------------
    # 3. Extract ALL Measures from 'Eingabe MN' (Version 5 Structure)
    # -------------------------------------------------------------
    eingabe_mn = wb.get_sheet_rows("Eingabe MN")
    measures = []

    # Map rows to target variables and standard semantics
    measure_rows = [
        (3, "heat_dmd_reduction_private", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/private", "reduction"),
        (4, "heat_dmd_reduction_industry", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry", "reduction"),
        (5, "heat_dmd_reduction_schools", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/schools", "reduction"),
        (6, "heat_dmd_reduction_public", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/public", "reduction"),
        (7, "oil_phaseout_private", "buildings/inputs/A_heat_oil__k__m2/private", "reduction"),
        (8, "oil_condensing_phaseout_private", "buildings/inputs/A_heat_oil_condensing__k__m2/private", "reduction"),
        (9, "gas_phaseout_private", "buildings/inputs/A_heat_gas__k__m2/private", "reduction"),
        (10, "heat_pump_expansion_private", "buildings/inputs/A_heat_heat_pump__k__m2/private", "expansion"),
        (11, "bev_expansion_private", "mobility/inputs/n_bev__k__/private", "expansion"),
        (12, "bev_expansion_industry", "mobility/inputs/n_bev__k__/industry", "expansion"),
        (13, "bev_expansion_public", "mobility/inputs/n_bev__k__/public", "expansion"),
        (14, "sol_rf_expansion_private", "energy/inputs/sol_rf_installed__M__Wp/private", "expansion"),
        (15, "sol_rf_expansion_industry", "energy/inputs/sol_rf_installed__M__Wp/industry", "expansion"),
        (16, "sol_rf_expansion_public", "energy/inputs/sol_rf_installed__M__Wp/public", "expansion"),
        (17, "sol_os_expansion_industry", "energy/inputs/sol_os_installed_A__ha/industry", "expansion"),
        (18, "sol_os_expansion_public", "energy/inputs/sol_os_installed_A__ha/public", "expansion"),
    ]

    for row_idx, m_id, input_id, m_type in measure_rows:
        r = eingabe_mn.get(row_idx, {})
        d_val = r.get("D") # baseline (2022)
        s_val = r.get("S") # 2035 target delta

        delta = 0.0
        if s_val is not None and isinstance(s_val, (int, float)):
            delta = abs(float(s_val)) if m_type == "reduction" else -abs(float(s_val))

        measures.append({
            "id": m_id,
            "excel_row": row_idx,
            "input_id": input_id,
            "measure_type": m_type,
            "start_year": 2022,
            "end_year": 2035,
            "delta": delta,
            "baseline_2022": float(d_val) if isinstance(d_val, (int, float)) else 0.0,
            "target_delta_2035": float(s_val) if isinstance(s_val, (int, float)) else 0.0,
        })

    # -------------------------------------------------------------
    # 4. Extract ALL Outputs from 'Rechenwerk' (Version 5 Structure)
    # -------------------------------------------------------------
    # Helper to extract an annual time series for any row in Rechenwerk
    def extract_series(row_idx: int) -> List[float]:
        r = rechenwerk.get(row_idx, {})
        series = []
        for col, _ in year_cols:
            val = r.get(col, 0.0)
            if val is None or str(val).strip().lower() == 'nan':
                val = 0.0
            series.append(float(val))
        return series

    expected_outputs = {}

    def extract_sector_series(base_row: int, var_id: str, n_sectors: int = 4):
        zero_series = [0.0] * len(year_cols)
        if n_sectors == 4:
            expected_outputs[f"{var_id}/private"] = extract_series(base_row)
            expected_outputs[f"{var_id}/industry"] = extract_series(base_row + 1)
            expected_outputs[f"{var_id}/schools"] = extract_series(base_row + 2)
            expected_outputs[f"{var_id}/public"] = extract_series(base_row + 3)
        elif n_sectors == 3:
            expected_outputs[f"{var_id}/private"] = extract_series(base_row)
            expected_outputs[f"{var_id}/industry"] = extract_series(base_row + 1)
            expected_outputs[f"{var_id}/schools"] = zero_series
            expected_outputs[f"{var_id}/public"] = extract_series(base_row + 2)
        elif n_sectors == 2:
            expected_outputs[f"{var_id}/private"] = zero_series
            expected_outputs[f"{var_id}/industry"] = extract_series(base_row)
            expected_outputs[f"{var_id}/schools"] = zero_series
            expected_outputs[f"{var_id}/public"] = extract_series(base_row + 1)

    # --- Buildings Domain (Mapped) ---
    extract_sector_series(16, "buildings/results/floor_A__k__m2", 4)
    extract_sector_series(29, "buildings/results/total_heat_dmd__G__W_h_per_a", 4)
    extract_sector_series(39, "buildings/results/elec_dmd__G__W_h_per_a", 4)
    extract_sector_series(69, "buildings/results/cnsmp_oil__G__W_h_per_a", 4)
    extract_sector_series(74, "buildings/results/cnsmp_oil_condensing__G__W_h_per_a", 4)
    extract_sector_series(79, "buildings/results/cnsmp_oil__M__L_per_a", 4)
    extract_sector_series(84, "buildings/results/cnsmp_gas__G__W_h_per_a", 4)
    extract_sector_series(89, "buildings/results/cnsmp_gas__M__m3_per_a", 4)
    extract_sector_series(94, "buildings/results/cnsmp_elec_heat_pump__G__W_h_per_a", 4)
    extract_sector_series(99, "buildings/results/cnsmp_other__G__W_h_per_a", 4)
    extract_sector_series(112, "buildings/results/costs_oil__M__eur_per_a", 4)
    extract_sector_series(117, "buildings/results/costs_gas__M__eur_per_a", 4)
    extract_sector_series(122, "buildings/results/costs_heat_pump__M__eur", 4)
    extract_sector_series(143, "buildings/results/invest_heat_sources__M__eur_per_a", 4)
    extract_sector_series(148, "buildings/results/invest_energetic_renovation__M__eur_per_a", 4)
    extract_sector_series(164, "buildings/results/grant_heat_sources__M__eur_per_a", 4)
    extract_sector_series(169, "buildings/results/grant_energetic_renovation__M__eur_per_a", 4)
    extract_sector_series(356, "buildings/results/ems_oil__k__to_coe_per_a", 3)
    extract_sector_series(360, "buildings/results/ems_gas__k__to_coe_per_a", 3)

    # --- Mobility Domain (Mapped) ---
    extract_sector_series(196, "mobility/results/traveld_dist_car__M__m_per_a", 3)
    extract_sector_series(201, "mobility/results/cars_grant__M__eur_per_a", 3)
    extract_sector_series(209, "mobility/results/bev_elec_nrg_dmd__G__W_h_per_a", 3)
    extract_sector_series(213, "mobility/results/cars_fuel_dmd__M__L_per_a", 3)
    extract_sector_series(217, "mobility/results/bev_elec_nrg_price__G__W_h_per_a", 3)
    extract_sector_series(221, "mobility/results/cars_fuel_costs__M__eur_per_a", 3)
    extract_sector_series(368, "mobility/results/cars_ems__k__to_coe_per_a", 3)
    expected_outputs["mobility/results/sl_nrg_costs__M__eur_per_a"] = extract_series(228)
    expected_outputs["mobility/results/sl_om_costs__M__eur_per_a"] = extract_series(229)
    expected_outputs["mobility/results/sl_total_costs__M__eur_per_a"] = extract_series(230)

    # --- Energy Domain (Mapped) ---
    extract_sector_series(235, "energy/results/elec_nrg_dmd__G__W_h_per_a", 3)
    extract_sector_series(241, "energy/results/sol_rf_potential__M__Wp", 3)
    extract_sector_series(249, "energy/results/sol_rf_nrg__G__W_h_per_a", 3)
    extract_sector_series(257, "energy/results/sol_rf_self_cnsmp__G__W_h_per_a", 3)
    extract_sector_series(263, "energy/results/sol_rf_invest__M__eur_per_a", 3)
    extract_sector_series(267, "energy/results/sol_rf_grant__M__eur_per_a", 3)
    extract_sector_series(271, "energy/results/sol_rf_om__M__eur_per_a", 3)
    extract_sector_series(276, "energy/results/sol_rf_revenue__M__eur_per_a", 3)

    extract_sector_series(293, "energy/results/sol_os_installed__M__Wp", 2)
    extract_sector_series(296, "energy/results/sol_os_nrg__G__W_h_per_a", 2)
    extract_sector_series(301, "energy/results/sol_os_invest__M__eur_per_a", 2)
    extract_sector_series(304, "energy/results/sol_os_grant__M__eur_per_a", 2)
    extract_sector_series(307, "energy/results/sol_os_om__M__eur_per_a", 2)
    extract_sector_series(310, "energy/results/sol_os_prod_costs__M__eur_per_a", 2)
    extract_sector_series(314, "energy/results/sol_os_turnover_buyback__M__eur_per_a", 2)
    extract_sector_series(317, "energy/results/sol_os_revenue__M__eur_per_a", 2)

    extract_sector_series(328, "energy/results/prchsd_renewable_nrg__M__eur_per_a", 3)
    extract_sector_series(333, "energy/results/prchsd_nrg_mix__G__W_h_per_a", 3)
    extract_sector_series(340, "energy/results/prchsd_nrg_mix_costs__M__eur_per_a", 3)
    extract_sector_series(364, "energy/results/prchsd_nrg_mix_ems__k__to_coe_per_a", 3)

    # --- Economy Domain (Mapped) ---
    economy_rows = [
        ("invest_heating_material", 380),
        ("invest_heating_work", 381),
        ("turnover_heating_crafting_local", 382),
        ("turnover_heating_crafting_national", 383),
        ("turnover_heating_production_national", 384),
        ("invest_heat_demand_material", 385),
        ("invest_heat_demand_work", 386),
        ("turnover_heat_demand_crafting_local", 387),
        ("turnover_heat_demand_crafting_national", 388),
        ("turnover_heat_demand_production_national", 389),
        ("invest_solar_roof_material", 390),
        ("invest_solar_roof_work", 391),
        ("maintenance_solar_roof_work", 392),
        ("turnover_solar_roof_crafting_local", 393),
        ("turnover_solar_roof_crafting_national", 394),
        ("invest_solar_landscape_material", 396),
        ("invest_solar_landscape_work", 397),
        ("maintenance_solar_landscape_work", 398),
        ("turnover_solar_landscape_crafting_local", 399),
        ("turnover_solar_landscape_crafting_national", 400),
        ("turnover_solar_landscape_production_national", 401),
        ("n_jobs_crafting_local", 402),
        ("n_jobs_crafting_national", 403),
        ("n_jobs_production_national", 404),
        ("income_local", 407),
        ("income_national", 408),
        ("income_tax_local", 409),
        ("income_tax_national", 410),
        ("turnover_local", 411),
        ("revenue_local", 412),
        ("turnover_national", 413),
        ("turnover_tax_national", 414),
        ("turnover_tax_local", 415),
        ("business_tax_local", 416),
        ("business_tax_national", 417),
        ("corporate_tax_national", 418),
        ("energy_tax_national", 423),
    ]
    for var_name, r_idx in economy_rows:
        expected_outputs[f"economy/results/{var_name}"] = extract_series(r_idx)

    # --- Stakeholders Domain (Mapped) ---
    stakeholder_rows = [
        ("private_invest", 426),
        ("private_effect_of_measures", 427),
        ("private_cash_flow_netto", 428),
        ("industry_invest", 430),
        ("industry_effect_of_measures", 431),
        ("industry_profit_from_measures", 432),
        ("industry_cash_flow_netto", 433),
        ("community_invest", 435),
        ("community_effect_of_measures", 436),
        ("community_tax_income_from_measures", 437),
        ("community_cash_flow_netto", 438),
        ("federal_additional_expenses", 440),
        ("federal_additional_tax_income", 441),
        ("federal_cash_flow_netto", 442),
    ]
    for var_name, r_idx in stakeholder_rows:
        expected_outputs[f"stakeholders/results/{var_name}"] = extract_series(r_idx)

    # -------------------------------------------------------------
    # 5. Extract COMPLETE Rechenwerk Raw Rows (Every Row from v5)
    # -------------------------------------------------------------
    # This guarantees that ANY output row in Excel v5 is preserved
    # and directly accessible for upcoming calculator updates.
    all_rechenwerk_rows = {}
    current_section = ""

    for r_idx in sorted(rechenwerk.keys()):
        r = rechenwerk[r_idx]
        a = (r.get("A") or "").strip()
        b = (r.get("B") or "").strip()
        c = r.get("C")

        if a and not b and c is None:
            current_section = a
            continue

        # Check if row has data in year columns
        has_data = any(r.get(col) is not None for col, _ in year_cols)
        if has_data:
            series = extract_series(r_idx)
            # Create a slug/key for this raw row
            row_key = f"row_{r_idx:03d}"
            all_rechenwerk_rows[row_key] = {
                "excel_row": r_idx,
                "section": current_section,
                "label": a,
                "sector_or_sublabel": b,
                "series": series
            }

    print(f"Extracted {len(all_rechenwerk_rows)} calculation rows from Rechenwerk")

    # -------------------------------------------------------------
    # 6. Build and Save the Final Complete Fixture Bundle
    # -------------------------------------------------------------
    fixture = {
        "name": os.path.basename(excel_path),
        "excel_version": "v5",
        "source": excel_path,
        "start_year": start_year,
        "end_year": end_year,
        "years": years,
        "inputs": all_inputs,
        "measures": measures,
        "expected_outputs": expected_outputs,
        "all_rechenwerk_rows": all_rechenwerk_rows,
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fixture, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated Version 5 fixture at: {output_path}")
    print(f"  - Inputs: Buildings, Mobility, Energy, Economy & Taxes, Tech Specs, Values & Splits")
    print(f"  - Measures: {len(measures)} transition policy measures")
    print(f"  - Mapped Outputs: {len(expected_outputs)} series")
    print(f"  - Complete Rechenwerk Rows: {len(all_rechenwerk_rows)} series")
    wb.close()


if __name__ == "__main__":
    excel_file = sys.argv[1] if len(sys.argv) > 1 else "examples/data/Rechnung Parameter v5.xlsx"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "tests/fixtures/v5_rechnung.json"
    extract_v5(excel_file, out_file)
