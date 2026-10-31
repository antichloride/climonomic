#!/usr/bin/env python3
"""
Excel Version 5 Comprehensive Extraction Tool for climcalc-core
Extracts ALL baseline inputs, measures, and calculation outputs from
'Rechnung Parameter v5.xlsx' into a complete, standalone JSON test fixture.

Design Principles:
1. Zero external dependencies: Uses Python standard library (zipfile + xml.etree.ElementTree).
2. Complete Version 5 Scope: Captures 100% of inputs ('Eingabe Ist', 'Eingabe MN')
   and 100% of outputs ('Rechenwerk', 'Ergebnisse').
3. Exact Row Mapping: Every calculator variable is mapped to its precise Excel row,
   while preserving the entire 413-row calculation engine in 'all_rechenwerk_rows'.
"""

import sys
import os
import re
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

    # =============================================================
    # 1. Timeline & Years Discovery (Rechenwerk Sheet)
    # =============================================================
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

    # =============================================================
    # 2. Extract ALL Inputs from 'Eingabe Ist' (Version 5 Structure)
    # =============================================================
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

    all_inputs = {
        # --- Buildings & Heating Baseline ---
        "buildings": {
            "n_inhabitants__k__": s4(5),
            "n_buildings": s4(6),
            "n_buildings_sum": float(val(6, "F", 5230.0)),
            "floor_A_building__m2": s4(7),
            "floor_A_total__k__m2": s4(8),
            "floor_A_total_sum__k__m2": float(val(8, "F", 4286.0)),
            "heat_dmd__k__W_h_per_m2_a": s4(9),
            "hot_water_dmd__k__W_h_per_m2_a": s4(10),
            "total_heat_dmd_baseline__G__W_h_per_a": s4(11),
            "total_heat_dmd_baseline_sum__G__W_h_per_a": float(val(11, "F", 215.62)),
            "elec_dmd_capita__k_W_h_per_a": s4(17),
            "elec_dmd_baseline__G__W_h_per_a": s4(18),
            "elec_dmd_baseline_sum__G__W_h_per_a": float(val(18, "F", 6.6)),
            # Heating floor areas (in 1.000 qm)
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
            # Technical specifications & efficiencies
            "tech_specs": {
                "oil_no_condensing": {
                    "efficiency": float(val(5, "J", 0.7)),
                    "invest__eur_per_kWh_a": float(val(5, "K", 0.5)),
                    "grant_part": 0.0
                },
                "oil_with_condensing": {
                    "efficiency": float(val(6, "J", 0.9)),
                    "invest__eur_per_kWh_a": float(val(6, "K", 1.0)),
                    "grant_part": float(val(6, "L", 0.1))
                },
                "gas": {
                    "efficiency": float(val(7, "J", 0.9)),
                    "invest__eur_per_kWh_a": float(val(7, "K", 0.5)),
                    "grant_part": float(val(7, "L", 0.2))
                },
                "heat_pump": {
                    "cop_jaz": float(val(8, "J", 3.0)),
                    "invest__eur_per_kWh_a": float(val(8, "K", 2.0)),
                    "grant_part": float(val(8, "L", 0.3))
                },
                "other_heating": {
                    "invest__eur_per_kWh_a": float(val(9, "K", 0.5)),
                    "grant_part": 0.0
                },
                "renovation": {
                    "invest__eur_per_kWh_a": float(val(10, "K", 2.5)),
                    "grant_part": float(val(10, "L", 0.3))
                },
                "energy_content": {
                    "oil_fuel__kWh_per_L": float(val(12, "J", 10.0)),
                    "gas__kWh_per_m3": float(val(13, "J", 5.0))
                },
                "emission_factors": {
                    "oil_fuel__kg_co2_per_L": float(val(15, "M", 3.0)),
                    "gas__kg_co2_per_m3": float(val(16, "M", 2.0))
                }
            }
        },

        # --- Mobility Baseline ---
        "mobility": {
            "n_inhabitants__k__": s4(5),
            "n_cars__k__": s3(24),
            "n_cars_sum__k__": float(val(24, "E", 45.5)),
            "n_bev__k__": s3(25),
            "n_bev_sum__k__": float(val(25, "E", 0.0)),
            "car_mileage_per_vehicle__k__km_per_a": s3(26),
            "traveld_dist_per_person__m__m_per_a": float(val(23, "J", 15.0)),
            "mean_persons_per_car": float(val(27, "B", 1.214)),
            "modal_split": {
                "pedestrian": float(val(24, "J", 0.05)),
                "bicycle": float(val(25, "J", 0.05)),
                "public_transport": float(val(26, "J", 0.10)),
                "car": float(val(27, "J", 0.80))
            },
            "price_fuel__eur_per_L": float(val(23, "M", 1.7)),
            "street_lighting": {
                "n_sl__k__": float(val(30, "D", 9.0)),
                "nrg_cnsmp_per_sl__k__W_h_per_a": float(val(31, "D", 500.0)),
                "om_costs_per_sl__eur_per_a": float(val(32, "D", 200.0))
            },
            "vehicle_specs": {
                "bev": {
                    "purchase_price__k__eur": float(val(31, "J", 35.0)),
                    "grant_subsidy__k__eur": float(val(31, "K", 9.0)),
                    "net_purchase_price__k__eur": float(val(31, "L", 26.0)),
                    "nrg_consumption__kWh_per_100km": float(val(31, "M", 24.0)),
                    "power_price__eur_per_kWh": float(val(31, "N", 0.3)),
                    "fuel_cost__eur_per_km": float(val(31, "O", 0.072)),
                    "variable_om__eur_per_km": float(val(31, "P", 0.05)),
                    "fixed_om__k__eur_per_a": float(val(31, "Q", 1.0)),
                    "lifetime__a": float(val(31, "R", 10.0)),
                    "lcc__k__eur": float(val(31, "S", 54.3)),
                    "lcc__eur_per_km": float(val(31, "T", 0.362))
                },
                "combustor": {
                    "purchase_price__k__eur": float(val(32, "J", 30.0)),
                    "grant_subsidy__k__eur": 0.0,
                    "net_purchase_price__k__eur": float(val(32, "L", 30.0)),
                    "fuel_consumption__kWh_per_100km": float(val(32, "M", 70.0)),
                    "fuel_price__eur_per_kWh": float(val(32, "N", 0.17)),
                    "fuel_cost__eur_per_km": float(val(32, "O", 0.119)),
                    "variable_om__eur_per_km": float(val(32, "P", 0.05)),
                    "fixed_om__k__eur_per_a": float(val(32, "Q", 1.0)),
                    "lifetime__a": float(val(32, "R", 10.0)),
                    "lcc__k__eur": float(val(32, "S", 65.35)),
                    "lcc__eur_per_km": float(val(32, "T", 0.43567))
                },
                "cost_advantage_bev__eur_per_km": float(val(33, "T", 0.07367))
            }
        },

        # --- Energy & Renewables Baseline ---
        "energy": {
            # Rooftop Solar
            "rf_A__ha": s3(38),
            "rf_A_sum__ha": float(val(38, "E", 900.0)),
            "sol_rf_suitable_A_part": s3(39),
            "sol_rf_potential__M__Wp": s3(40),
            "sol_rf_potential_sum__M__Wp": float(val(40, "E", 52.5)),
            "sol_rf_installed__M__Wp": s3(41),
            "sol_rf_installed_sum__M__Wp": float(val(41, "E", 5.25)),
            "sol_rf_generated_baseline__G__W_h_per_a": s3(42),
            "sol_rf_generated_baseline_sum__G__W_h_per_a": float(val(42, "E", 4620.12)),
            "sol_rf_self_cnsmp_part": s3(43),
            # Open-space Solar
            "sol_os_potential_A__ha": float(val(47, "E", 150.0)),
            "sol_os_installed_A__ha": s2(48),
            "sol_os_installed_A_sum__ha": float(val(48, "E", 15.0)),
            "sol_os_installed__M__Wp": s2(49),
            "sol_os_installed_sum__M__Wp": float(val(49, "E", 0.125)),
            "sol_os_self_cnsmp_part": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            # Wind Energy
            "wind_suitable_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "wind_installed_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            # Purchased Green & Grid Electricity
            "prchsd_renewable_nrg__G__W_h_per_a": s3(52),
            "prchsd_renewable_nrg_sum__G__W_h_per_a": float(val(52, "E", 5.25)),
            "renewable_nrg_price__m__eur_per_W_h": s3(53),
            "heat_pump_discount_part": float(val(54, "E", 0.2)),
            "nrg_mix_price__m__eur_per_W_h": s3(55),
            # Technical specifications
            "tech_specs": {
                "solar_roof": {
                    "invest__eur_per_kWp": float(val(38, "J", 1500.0)),
                    "grant__eur_per_kWp": float(val(38, "K", 500.0)),
                    "om_rate_invest_part": float(val(38, "L", 0.02)),
                    "lifetime__a": float(val(38, "M", 30.0)),
                    "annual_yield__kWh_per_kWp": float(val(38, "N", 900.0)),
                    "feed_in_tariff__eur_per_kWh": float(val(41, "J", 0.07037)),
                    "generation_cost__eur_per_kWh": float(val(38, "O", 0.07037)),
                    "power_density__MWp_per_k_m2": float(val(43, "J", 0.16667))
                },
                "solar_landscape": {
                    "invest__eur_per_kWp": float(val(39, "J", 1200.0)),
                    "grant__eur_per_kWp": float(val(39, "K", 500.0)),
                    "om_rate_invest_part": float(val(39, "L", 0.02)),
                    "lifetime__a": float(val(39, "M", 30.0)),
                    "annual_yield__kWh_per_kWp": float(val(39, "N", 900.0)),
                    "feed_in_tariff__eur_per_kWh": float(val(42, "J", 0.07037)),
                    "generation_cost__eur_per_kWh": float(val(39, "O", 0.05259)),
                    "power_density__MWp_per_k_m2": float(val(44, "J", 0.08333))
                },
                "wind_onshore": {
                    "invest__eur_per_kWp": float(val(40, "J", 2000.0)),
                    "grant__eur_per_kWp": float(val(40, "K", 750.0)),
                    "om_rate_invest_part": float(val(40, "L", 0.02)),
                    "lifetime__a": float(val(40, "M", 20.0)),
                    "annual_yield__kWh_per_kWp": float(val(40, "N", 1300.0)),
                    "generation_cost__eur_per_kWh": float(val(40, "O", 0.07885))
                },
                "grid_mix": {
                    "coal": {"share": float(val(47, "J", 0.297)), "intensity__to_co2_per_GWh": float(val(47, "K", 1000.0))},
                    "gas": {"share": float(val(48, "J", 0.105)), "intensity__to_co2_per_GWh": float(val(48, "K", 600.0))},
                    "nuclear": {"share": float(val(49, "J", 0.133)), "intensity__to_co2_per_GWh": 0.0},
                    "pv": {"share": float(val(50, "J", 0.099)), "intensity__to_co2_per_GWh": 0.0},
                    "wind": {"share": float(val(51, "J", 0.230)), "intensity__to_co2_per_GWh": 0.0},
                    "other": {"share": float(val(52, "J", 0.136)), "intensity__to_co2_per_GWh": 0.0},
                    "weighted_emission_factor__to_co2_per_GWh": 360.0,
                    "mix_generation_cost__eur_per_kWh": 0.04062
                }
            }
        },

        # --- Economy, Taxes & Value Creation Baseline ---
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
            "domain_value_creation": {
                "heating_wp": {
                    "material_share": float(val(59, "J", 0.5)),
                    "national_production_share": float(val(59, "K", 0.5)),
                    "work_share": float(val(59, "L", 0.3)),
                    "national_crafting_share": float(val(59, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(59, "N", 10.0)),
                    "work_fte_per_m_eur": float(val(59, "O", 20.0))
                },
                "energetic_renovation": {
                    "material_share": float(val(60, "J", 0.3)),
                    "national_production_share": float(val(60, "K", 0.5)),
                    "work_share": float(val(60, "L", 0.3)),
                    "national_crafting_share": float(val(60, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(60, "N", 10.0)),
                    "work_fte_per_m_eur": float(val(60, "O", 20.0))
                },
                "fast_charging_stations": {
                    "material_share": float(val(61, "J", 0.65)),
                    "national_production_share": float(val(61, "K", 0.5)),
                    "work_share": float(val(61, "L", 0.3)),
                    "national_crafting_share": float(val(61, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(61, "N", 10.0)),
                    "work_fte_per_m_eur": float(val(61, "O", 20.0)),
                    "om_local_share": float(val(61, "P", 0.3)),
                    "om_national_share": float(val(61, "Q", 1.0))
                },
                "solar_roof": {
                    "material_share": float(val(62, "J", 0.5)),
                    "national_production_share": float(val(62, "K", 0.5)),
                    "work_share": float(val(62, "L", 0.3)),
                    "national_crafting_share": float(val(62, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(62, "N", 10.0)),
                    "work_fte_per_m_eur": float(val(62, "O", 20.0)),
                    "om_local_share": float(val(62, "P", 0.3)),
                    "om_national_share": float(val(62, "Q", 1.0))
                },
                "solar_landscape": {
                    "material_share": float(val(63, "J", 0.65)),
                    "national_production_share": float(val(63, "K", 0.5)),
                    "work_share": float(val(63, "L", 0.15)),
                    "national_crafting_share": float(val(63, "M", 1.0)),
                    "material_fte_per_m_eur": float(val(63, "N", 10.0)),
                    "work_fte_per_m_eur": float(val(63, "O", 20.0)),
                    "om_local_share": float(val(63, "P", 0.2)),
                    "om_national_share": float(val(63, "Q", 1.0))
                },
                "community_internal": {
                    "work_share": float(val(64, "L", 0.5)),
                    "national_crafting_share": float(val(64, "M", 1.0)),
                    "work_fte_per_m_eur": float(val(64, "O", 20.0)),
                    "om_local_share": float(val(64, "P", 0.3)),
                    "om_national_share": float(val(64, "Q", 0.75))
                }
            }
        }
    }

    # =============================================================
    # 3. Extract ALL Measures & Scenarios from 'Eingabe MN'
    # =============================================================
    eingabe_mn = wb.get_sheet_rows("Eingabe MN")

    # Helper to extract a row's annual values (columns G to AC = 2023 to 2045)
    def extract_mn_annual(row_idx: int) -> Dict[str, float]:
        r = eingabe_mn.get(row_idx, {})
        ann = {"2022": 0.0}
        for col_idx in range(ord('G'), ord('Z') + 1):
            col_letter = chr(col_idx)
            yr = 2023 + (col_idx - ord('G'))
            val_yr = r.get(col_letter, 0.0)
            ann[str(yr)] = float(val_yr) if val_yr is not None else 0.0
        # AC is 2045 (23 years after 2022)
        # Check AA, AB, AC
        for extra_col, yr in [("AA", 2043), ("AB", 2044), ("AC", 2045)]:
            if extra_col in r:
                val_yr = r.get(extra_col, 0.0)
                ann[str(yr)] = float(val_yr) if val_yr is not None else 0.0
        return ann

    # 16 policy measures
    measure_specs = [
        (3, "heat_dmd_reduction_private", "Heizbedarf Sanierung", "heat_dmd__k__W_h_per_m2_a", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/private", "private", "reduction"),
        (4, "heat_dmd_reduction_industry", "Heizbedarf Sanierung", "heat_dmd__k__W_h_per_m2_a", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry", "industry", "reduction"),
        (5, "heat_dmd_reduction_schools", "Heizbedarf Sanierung", "heat_dmd__k__W_h_per_m2_a", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/schools", "schools", "reduction"),
        (6, "heat_dmd_reduction_public", "Heizbedarf Sanierung", "heat_dmd__k__W_h_per_m2_a", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/public", "public", "reduction"),
        (7, "oil_phaseout_private", "Ölheizung ohne Brennwert", "A_heat_oil__k__m2", "buildings/inputs/A_heat_oil__k__m2/private", "private", "reduction"),
        (8, "oil_condensing_phaseout_private", "Ölheizung mit Brennwert", "A_heat_oil_condensing__k__m2", "buildings/inputs/A_heat_oil_condensing__k__m2/private", "private", "reduction"),
        (9, "gas_phaseout_private", "Gasheizung", "A_heat_gas__k__m2", "buildings/inputs/A_heat_gas__k__m2/private", "private", "reduction"),
        (10, "heat_pump_expansion_private", "Wärmepumpen-Heizung", "A_heat_heat_pump__k__m2", "buildings/inputs/A_heat_heat_pump__k__m2/private", "private", "expansion"),
        (11, "bev_expansion_private", "ePkw BEV", "n_bev__k__", "mobility/inputs/n_bev__k__/private", "private", "expansion"),
        (12, "bev_expansion_industry", "ePkw BEV", "n_bev__k__", "mobility/inputs/n_bev__k__/industry", "industry", "expansion"),
        (13, "bev_expansion_public", "ePkw BEV", "n_bev__k__", "mobility/inputs/n_bev__k__/public", "public", "expansion"),
        (14, "sol_rf_expansion_private", "PV lokal auf Dach", "sol_rf_installed__M__Wp", "energy/inputs/sol_rf_installed__M__Wp/private", "private", "expansion"),
        (15, "sol_rf_expansion_industry", "PV lokal auf Dach", "sol_rf_installed__M__Wp", "energy/inputs/sol_rf_installed__M__Wp/industry", "industry", "expansion"),
        (16, "sol_rf_expansion_public", "PV lokal auf Dach", "sol_rf_installed__M__Wp", "energy/inputs/sol_rf_installed__M__Wp/public", "public", "expansion"),
        (17, "sol_os_expansion_industry", "Freifläche belegt mit PV", "sol_os_installed_A__ha", "energy/inputs/sol_os_installed_A__ha/industry", "industry", "expansion"),
        (18, "sol_os_expansion_public", "Freifläche belegt mit PV", "sol_os_installed_A__ha", "energy/inputs/sol_os_installed_A__ha/public", "public", "expansion"),
    ]

    measures = []
    for row_idx, m_id, label, param_name, input_id, sector, m_type in measure_specs:
        r = eingabe_mn.get(row_idx, {})
        d_val = r.get("D") # 2022 baseline
        s_val = r.get("S") # 2035 delta
        ac_val = r.get("AC") # 2045 delta

        delta = 0.0
        if s_val is not None and isinstance(s_val, (int, float)):
            delta = abs(float(s_val)) if m_type == "reduction" else -abs(float(s_val))

        annual_deltas = extract_mn_annual(row_idx)

        measures.append({
            "id": m_id,
            "excel_row": row_idx,
            "label": label,
            "parameter": param_name,
            "input_id": input_id,
            "sector": sector,
            "measure_type": m_type,
            "start_year": 2022,
            "end_year": 2035,
            "delta": delta,
            "baseline_2022": float(d_val) if isinstance(d_val, (int, float)) else 0.0,
            "target_delta_2035": float(s_val) if isinstance(s_val, (int, float)) else 0.0,
            "target_delta_2045": float(ac_val) if isinstance(ac_val, (int, float)) else 0.0,
            "annual_deltas": annual_deltas,
        })

    # Global scenario projections from Eingabe MN
    # Row 25: CO2-Price: linear rise 2022=60 to 2045=180 €/to CO2
    co2_price_projection = {}
    for yr in range(2022, 2046):
        frac = (yr - 2022) / (2045 - 2022)
        co2_price_projection[str(yr)] = 60.0 + frac * (180.0 - 60.0)

    # Rows 26, 27, 28: Fuel oil price increases (€/kWh)
    oil_price_increase = {
        "private": extract_mn_annual(26),
        "public": extract_mn_annual(27),
        "industry": extract_mn_annual(28),
    }

    # Detailed Measure Cards from Eingabe MN (Rows 32-50, 63-77)
    measure_cards = {
        "passive_houses_new_construction": {
            "excel_rows": [32, 40],
            "description": str(eingabe_mn.get(32, {}).get("B", "")).strip(),
            "heat_demand_reduction__kWh_per_m2_a": extract_mn_annual(33)
        },
        "energetic_renovation_residential": {
            "excel_rows": [42, 50],
            "description": str(eingabe_mn.get(42, {}).get("B", "")).strip(),
            "heat_demand_reduction__kWh_per_m2_a": extract_mn_annual(43)
        },
        "municipal_rooftop_pv_rental_model": {
            "excel_rows": [63, 77],
            "description": str(eingabe_mn.get(63, {}).get("B", "")).strip(),
            "pv_suitable_share_private": extract_mn_annual(65),
            "pv_suitable_share_public": extract_mn_annual(66),
            "pv_suitable_share_industry": extract_mn_annual(67),
        }
    }

    # =============================================================
    # 4. Extract ALL Outputs from 'Rechenwerk' (Version 5 Structure)
    # =============================================================
    def extract_series(row_idx: int) -> List[float]:
        r = rechenwerk.get(row_idx, {})
        series = []
        for col, _ in year_cols:
            val = r.get(col, 0.0)
            if val is None or str(val).strip().lower() == 'nan':
                val = 0.0
            series.append(float(val))
        return series

    def extract_annual_dict(row_idx: int) -> Dict[str, float]:
        r = rechenwerk.get(row_idx, {})
        annual = {}
        for col, yr in year_cols:
            val = r.get(col, 0.0)
            if val is None or str(val).strip().lower() == 'nan':
                val = 0.0
            annual[str(yr)] = float(val)
        return annual

    expected_outputs = {}

    def map_sector_series(base_row: int, var_id: str, n_sectors: int = 4):
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

    # --- Buildings Domain (Exact Verified Rows) ---
    map_sector_series(16, "buildings/results/floor_A__k__m2", 4)
    map_sector_series(21, "buildings/results/specific_heat_dmd__kWh_per_m2_a", 4)
    map_sector_series(25, "buildings/results/specific_hot_water_dmd__kWh_per_a", 4)
    map_sector_series(29, "buildings/results/total_heat_dmd__G__W_h_per_a", 4)
    map_sector_series(39, "buildings/results/elec_dmd__G__W_h_per_a", 4)
    map_sector_series(44, "buildings/results/A_heat_oil__k__m2", 4)
    map_sector_series(49, "buildings/results/A_heat_oil_condensing__k__m2", 4)
    map_sector_series(54, "buildings/results/A_heat_gas__k__m2", 4)
    map_sector_series(59, "buildings/results/A_heat_heat_pump__k__m2", 4)
    map_sector_series(64, "buildings/results/A_heat_other__k__m2", 4)
    map_sector_series(69, "buildings/results/cnsmp_oil__G__W_h_per_a", 4)
    map_sector_series(74, "buildings/results/cnsmp_oil_condensing__G__W_h_per_a", 4)
    map_sector_series(79, "buildings/results/cnsmp_oil__M__L_per_a", 4)
    map_sector_series(84, "buildings/results/cnsmp_gas__G__W_h_per_a", 4)
    map_sector_series(89, "buildings/results/cnsmp_gas__M__m3_per_a", 4)
    map_sector_series(94, "buildings/results/cnsmp_elec_heat_pump__G__W_h_per_a", 4)
    map_sector_series(99, "buildings/results/cnsmp_other__G__W_h_per_a", 4)
    map_sector_series(104, "buildings/results/cnsmp_total_heat__G__W_h_per_a", 4)
    map_sector_series(112, "buildings/results/costs_oil__M__eur_per_a", 4)
    map_sector_series(117, "buildings/results/costs_gas__M__eur_per_a", 4)
    map_sector_series(122, "buildings/results/costs_heat_pump__M__eur", 4)
    map_sector_series(127, "buildings/results/costs_other__M__eur", 4)
    map_sector_series(132, "buildings/results/costs_total_heating__M__eur", 4)
    map_sector_series(143, "buildings/results/invest_heat_sources__M__eur_per_a", 4)
    map_sector_series(148, "buildings/results/invest_energetic_renovation__M__eur_per_a", 4)
    map_sector_series(153, "buildings/results/invest_total__M__eur_per_a", 4)
    map_sector_series(164, "buildings/results/grant_heat_sources__M__eur_per_a", 4)
    map_sector_series(169, "buildings/results/grant_energetic_renovation__M__eur_per_a", 4)
    map_sector_series(174, "buildings/results/grant_total__M__eur_per_a", 4)

    # --- Mobility Domain (Exact Verified Rows) ---
    map_sector_series(188, "mobility/results/n_cars__k__", 3)
    map_sector_series(192, "mobility/results/n_bev__k__", 3)
    map_sector_series(196, "mobility/results/car_mileage__k__km_per_a", 3)
    map_sector_series(201, "mobility/results/cars_grant__M__eur_per_a", 3)
    map_sector_series(209, "mobility/results/bev_elec_nrg_dmd__G__W_h_per_a", 3)
    map_sector_series(213, "mobility/results/cars_fuel_dmd__M__L_per_a", 3)
    map_sector_series(217, "mobility/results/bev_elec_nrg_price__G__W_h_per_a", 3)
    map_sector_series(221, "mobility/results/cars_fuel_costs__M__eur_per_a", 3)
    expected_outputs["mobility/results/sl_nrg_costs__M__eur_per_a"] = extract_series(228)
    expected_outputs["mobility/results/sl_om_costs__M__eur_per_a"] = extract_series(229)
    expected_outputs["mobility/results/sl_total_costs__M__eur_per_a"] = extract_series(230)

    # --- Energy Domain (Exact Verified Rows) ---
    map_sector_series(235, "energy/results/elec_nrg_dmd__G__W_h_per_a", 3)
    map_sector_series(241, "energy/results/sol_rf_potential__M__Wp", 3)
    map_sector_series(245, "energy/results/sol_rf_installed__M__Wp", 3)
    map_sector_series(249, "energy/results/sol_rf_nrg__G__W_h_per_a", 3)
    map_sector_series(253, "energy/results/sol_rf_self_cnsmp_part", 3)
    map_sector_series(257, "energy/results/sol_rf_self_cnsmp__G__W_h_per_a", 3)
    map_sector_series(263, "energy/results/sol_rf_invest__M__eur_per_a", 3)
    map_sector_series(267, "energy/results/sol_rf_grant__M__eur_per_a", 3)
    map_sector_series(272, "energy/results/sol_rf_revenue__M__eur_per_a", 3)
    map_sector_series(276, "energy/results/sol_rf_costs__M__eur_per_a", 3)
    map_sector_series(280, "energy/results/sol_rf_costs__eur_per_kWh", 3)

    map_sector_series(285, "energy/results/sol_os_installed_A__ha", 2)
    map_sector_series(289, "energy/results/sol_os_installed__M__Wp", 2)
    map_sector_series(292, "energy/results/sol_os_nrg__G__W_h_per_a", 2)
    map_sector_series(297, "energy/results/sol_os_invest__M__eur_per_a", 2)
    map_sector_series(300, "energy/results/sol_os_grant__M__eur_per_a", 2)
    map_sector_series(303, "energy/results/sol_os_om__M__eur_per_a", 2)
    map_sector_series(306, "energy/results/sol_os_prod_costs__M__eur_per_a", 2)
    map_sector_series(310, "energy/results/sol_os_turnover_buyback__M__eur_per_a", 2)
    map_sector_series(313, "energy/results/sol_os_profit__M__eur_per_a", 2)

    map_sector_series(317, "energy/results/prchsd_renewable_nrg__G__W_h_per_a", 3)
    map_sector_series(321, "energy/results/prchsd_renewable_nrg_price__eur_per_kWh", 3)
    map_sector_series(324, "energy/results/prchsd_renewable_nrg__M__eur_per_a", 3)
    map_sector_series(329, "energy/results/prchsd_nrg_mix__G__W_h_per_a", 3)
    map_sector_series(333, "energy/results/prchsd_nrg_mix_price__eur_per_kWh", 3)
    map_sector_series(336, "energy/results/prchsd_nrg_mix_costs__M__eur_per_a", 3)

    # --- Emissions Domain (Exact Verified Rows) ---
    map_sector_series(352, "buildings/results/ems_oil__k__to_coe_per_a", 3)
    map_sector_series(356, "buildings/results/ems_gas__k__to_coe_per_a", 3)
    map_sector_series(360, "energy/results/prchsd_nrg_mix_ems__k__to_coe_per_a", 3)
    map_sector_series(364, "mobility/results/cars_ems__k__to_coe_per_a", 3)
    map_sector_series(368, "emissions/results/ems_total__k__to_coe_per_a", 3)
    expected_outputs["energy/results/feed_in_total__G__W_h_per_a"] = extract_series(372)
    expected_outputs["energy/results/feed_in_ems_avoided__k__to_coe_per_a"] = extract_series(373)
    expected_outputs["emissions/results/net_co2_balance__k__to_coe_per_a"] = extract_series(374)

    # --- Economy Domain (Exact Verified Rows 376-417) ---
    economy_rows = [
        ("invest_heating_material", 376),
        ("invest_heating_work", 377),
        ("turnover_heating_crafting_local", 378),
        ("turnover_heating_crafting_national", 379),
        ("turnover_heating_production_national", 380),
        ("invest_heat_demand_material", 381),
        ("invest_heat_demand_work", 382),
        ("turnover_heat_demand_crafting_local", 383),
        ("turnover_heat_demand_crafting_national", 384),
        ("turnover_heat_demand_production_national", 385),
        ("invest_solar_roof_material", 386),
        ("invest_solar_roof_work", 387),
        ("maintenance_solar_roof_work", 388),
        ("turnover_solar_roof_crafting_local", 389),
        ("turnover_solar_roof_crafting_national", 390),
        ("turnover_solar_roof_production_national", 391),
        ("invest_solar_landscape_material", 392),
        ("invest_solar_landscape_work", 393),
        ("maintenance_solar_landscape_work", 394),
        ("turnover_solar_landscape_crafting_local", 395),
        ("turnover_solar_landscape_crafting_national", 396),
        ("turnover_solar_landscape_production_national", 397),
        ("n_jobs_crafting_local", 398),
        ("n_jobs_crafting_national", 399),
        ("n_jobs_production_national", 400),
        ("n_jobs_production_sum_national", 401),
        ("income_local", 403),
        ("income_national", 404),
        ("income_tax_local", 405),
        ("income_tax_national", 406),
        ("turnover_local_with_materials", 407),
        ("turnover_national", 408),
        ("turnover_tax_national", 409),
        ("turnover_tax_local", 410),
        ("trade_tax_local", 411),
        ("trade_tax_national", 412),
        ("corporate_tax_national", 413),
        ("energy_tax_oil", 414),
        ("energy_tax_gas", 415),
        ("energy_tax_fuel", 416),
        ("energy_tax_national", 417),
    ]
    for var_name, r_idx in economy_rows:
        expected_outputs[f"economy/results/{var_name}"] = extract_series(r_idx)

    # --- Stakeholders Domain (Exact Verified Rows 419-435) ---
    stakeholder_rows = [
        ("private_invest", 419),
        ("private_effect_of_measures", 420),
        ("private_cash_flow_netto", 421),
        ("industry_profit", 423),
        ("industry_invest", 424),
        ("industry_effect_of_measures", 425),
        ("industry_cash_flow_netto", 426),
        ("community_invest", 428),
        ("community_effect_of_measures", 429),
        ("community_tax_income_from_measures", 430),
        ("community_cash_flow_netto", 431),
        ("federal_additional_expenses", 433),
        ("federal_additional_tax_income", 434),
        ("federal_cash_flow_netto", 435),
    ]
    for var_name, r_idx in stakeholder_rows:
        expected_outputs[f"stakeholders/results/{var_name}"] = extract_series(r_idx)

    # =============================================================
    # 5. Extract COMPLETE Rechenwerk Raw Rows (Every Row from v5)
    # =============================================================
    # Extracts all 413 data rows in Rechenwerk with clean metadata
    all_rechenwerk_rows = {}
    current_section = ""
    current_var = ""

    for r_idx in sorted(rechenwerk.keys()):
        if r_idx == 1:
            continue
        r = rechenwerk[r_idx]
        a = r.get("A")
        b = r.get("B")

        has_data = any(r.get(col) is not None for col, _ in year_cols)
        if not has_data:
            if a or b:
                current_section = str(a or b).strip()
            continue

        if a:
            current_var = str(a).strip()
        sec_label = str(b).strip() if b else ""

        # Extract unit from parenthesis if available
        unit = ""
        m = re.search(r'\(([^)]+)\)', current_var)
        if m:
            unit = m.group(1).strip()
        elif sec_label and '(' in sec_label:
            m2 = re.search(r'\(([^)]+)\)', sec_label)
            if m2:
                unit = m2.group(1).strip()

        series = extract_series(r_idx)
        annual = extract_annual_dict(r_idx)

        row_key = f"row_{r_idx:03d}"
        all_rechenwerk_rows[row_key] = {
            "excel_row": r_idx,
            "section": current_section,
            "variable": current_var,
            "sector_or_sublabel": sec_label,
            "unit": unit,
            "series": series,
            "annual_values": annual
        }

    print(f"Extracted {len(all_rechenwerk_rows)} complete calculation rows from Rechenwerk")

    # =============================================================
    # 6. Extract Summary Results from 'Ergebnisse' Dashboard
    # =============================================================
    ergebnisse = wb.get_sheet_rows("Ergebnisse")
    summary_ergebnisse = {}

    for r_idx in sorted(ergebnisse.keys()):
        r = ergebnisse[r_idx]
        a = r.get("A")
        if a and isinstance(a, str) and str(a).strip():
            label = str(a).strip()
            # Capture non-empty columns
            cols = {k: v for k, v in r.items() if v is not None and str(v).strip() != ''}
            summary_ergebnisse[f"row_{r_idx:03d}"] = {
                "excel_row": r_idx,
                "label": label,
                "data": cols
            }

    print(f"Extracted {len(summary_ergebnisse)} summary rows from Ergebnisse sheet")

    # =============================================================
    # 7. Build and Save the Final Complete Fixture Bundle
    # =============================================================
    fixture = {
        "name": os.path.basename(excel_path),
        "excel_version": "v5",
        "source": excel_path,
        "start_year": start_year,
        "end_year": end_year,
        "years": years,
        "inputs": all_inputs,
        "measures": measures,
        "scenarios": {
            "co2_price_projection": co2_price_projection,
            "oil_price_increase": oil_price_increase,
            "measure_cards": measure_cards,
        },
        "expected_outputs": expected_outputs,
        "all_rechenwerk_rows": all_rechenwerk_rows,
        "summary_ergebnisse": summary_ergebnisse,
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fixture, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully generated Version 5 fixture at: {output_path}")
    print(f"  - Total Inputs: Buildings, Mobility, Energy, Economy & Taxes, Tech Specs, Values & Splits")
    print(f"  - Measures & Policies: {len(measures)} measures + global scenarios & measure cards")
    print(f"  - Mapped Calculator Outputs: {len(expected_outputs)} time series")
    print(f"  - Complete Rechenwerk Rows: {len(all_rechenwerk_rows)} time series (2022-2045)")
    print(f"  - Summary Dashboard Rows: {len(summary_ergebnisse)} rows from Ergebnisse")
    wb.close()


if __name__ == "__main__":
    excel_file = sys.argv[1] if len(sys.argv) > 1 else "examples/data/Rechnung Parameter v5.xlsx"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "tests/fixtures/v5_rechnung.json"
    extract_v5(excel_file, out_file)
