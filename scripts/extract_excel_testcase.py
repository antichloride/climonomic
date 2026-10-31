#!/usr/bin/env python3
"""
Excel Test Case Extractor for climcalc-core
Extracts baseline inputs, policy measures, and annual calculation results from
Excel workbooks (e.g. 'Rechnung Parameter v5.xlsx') into a standalone, versionable
JSON fixture for end-to-end testing (in TypeScript / Rust).

Zero external dependencies: uses Python standard library (zipfile + xml.etree.ElementTree).
"""

import sys
import os
import json
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, List, Any, Optional

NS = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


class ExcelWorkbook:
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
                # An si can have a direct 't' or multiple 'r'/'t' children
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


def extract_testcase(excel_path: str, output_path: str):
    print(f"Opening workbook: {excel_path}")
    wb = ExcelWorkbook(excel_path)

    # 1. Inspect Rechenwerk for years
    rechenwerk = wb.get_sheet_rows("Rechenwerk")
    row1 = rechenwerk.get(1, {})

    # Columns C to Z are simulation years (2022 to 2045)
    year_cols = []
    years = []
    # Generate column letters C..Z
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

    # 2. Extract Baseline Inputs (from Eingabe Ist & Rechenwerk 2022)
    eingabe = wb.get_sheet_rows("Eingabe Ist")

    # Helper to read sector row from Eingabe Ist (B: Wohnen, C: GHD, D: Schulen, E: Kommune)
    def read_sectors_4(row_idx: int) -> Dict[str, float]:
        r = eingabe.get(row_idx, {})
        return {
            "private": float(r.get("B", 0.0) or 0.0),
            "industry": float(r.get("C", 0.0) or 0.0),
            "schools": float(r.get("D", 0.0) or 0.0),
            "public": float(r.get("E", 0.0) or 0.0),
        }

    # Helper to read 3-sector row from Eingabe Ist (B: Wohnen, C: GHD, D: Kommune) -> pad schools=0.0
    def read_sectors_3(row_idx: int) -> Dict[str, float]:
        r = eingabe.get(row_idx, {})
        return {
            "private": float(r.get("B", 0.0) or 0.0),
            "industry": float(r.get("C", 0.0) or 0.0),
            "schools": 0.0,
            "public": float(r.get("D", 0.0) or 0.0),
        }

    # Helper to read 2-sector row (C: GHD, D: Kommune) -> pad private=0.0, schools=0.0
    def read_sectors_2(row_idx: int) -> Dict[str, float]:
        r = eingabe.get(row_idx, {})
        return {
            "private": 0.0,
            "industry": float(r.get("C", 0.0) or 0.0),
            "schools": 0.0,
            "public": float(r.get("D", 0.0) or 0.0),
        }

    # Baseline Inputs
    # Note: Rooftop area in Excel row 38 is in 1.000 qm. In Rust rf_A__ha is in hectares.
    # 1 ha = 10.000 qm = 10 * (1.000 qm) -> ha = qm_k * 0.1
    # But in the Excel formulas, rf_A was directly used as 1000 qm. We maintain the standard conversion.
    inputs = {
        "buildings": {
            "n_inhabitants__k__": read_sectors_4(5),
            "n_buildings": read_sectors_4(6),
            "floor_A_building__m2": read_sectors_4(7),
            "heat_dmd__k__W_h_per_m2_a": read_sectors_4(9),
            "hot_water_dmd__k__W_h_per_m2_a": read_sectors_4(10),
            "elec_dmd_capita__k_W_h_per_a": read_sectors_4(17),
            "A_heat_oil__k__m2": read_sectors_4(12),
            "A_heat_oil_condensing__k__m2": read_sectors_4(13),
            "A_heat_gas__k__m2": read_sectors_4(14),
            "A_heat_heat_pump__k__m2": read_sectors_4(15),
            "A_heat_district_heating__k__m2": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "price_oil__eur_per_L": float(eingabe.get(15, {}).get("J", 0.9) or 0.9),
            "price_gas__eur_per_m3": float(eingabe.get(16, {}).get("J", 0.9) or 0.9),
            "price_district_heating__m__eur_per_W_h": 0.08,
            "price_other_output_nrg__m__eur_per_W_h": float(eingabe.get(17, {}).get("J", 0.9) or 0.9),
            "district_heating_renewable_part": 0.0,
        },
        "energy": {
            "rf_A__ha": read_sectors_3(38),
            "sol_rf_suitable_A_part": read_sectors_3(39),
            "sol_rf_installed__M__Wp": read_sectors_3(41),
            "sol_rf_self_cnsmp_part": read_sectors_3(43),
            "sol_os_installed_A__ha": read_sectors_2(48),
            "sol_os_self_cnsmp_part": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "wind_suitable_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "wind_installed_A__ha": {
                "private": 0.0, "industry": 0.0, "schools": 0.0, "public": 0.0
            },
            "prchsd_renewable_nrg__G__W_h_per_a": read_sectors_3(52),
            "renewable_nrg_price__m__eur_per_W_h": read_sectors_3(53),
            "nrg_mix_price__m__eur_per_W_h": read_sectors_3(55),
        },
        "mobility": {
            "n_inhabitants__k__": read_sectors_4(5),
            "n_cars__k__": read_sectors_3(24),
            "n_bev__k__": read_sectors_3(25),
            "traveld_dist_per_person__m__m_per_a": float(eingabe.get(23, {}).get("J", 15.0) or 15.0),
            "mean_persons_per_car": float(eingabe.get(27, {}).get("B", 1.214) or 1.214),
            "modal_split_car": float(eingabe.get(27, {}).get("J", 0.8) or 0.8),
            "n_sl__k__": float(eingabe.get(30, {}).get("D", 9.0) or 9.0),
            "nrg_cnsmp_per_sl__k__W_h_per_a": float(eingabe.get(31, {}).get("D", 500.0) or 500.0),
            "om_costs_per_sl__eur_per_a": float(eingabe.get(32, {}).get("D", 200.0) or 200.0),
            "price_fuel__eur_per_L": float(eingabe.get(23, {}).get("M", 1.7) or 1.7),
        }
    }

    # 3. Extract Measures from Eingabe MN
    # In Eingabe MN, the transition from 2022 to 2035 defines the linear measures
    eingabe_mn = wb.get_sheet_rows("Eingabe MN")
    measures = []

    # Map Eingabe MN rows to climcalc-core input IDs
    # (row, action_name, input_id, delta_multiplier)
    # Note: In climcalc-core:
    #   Positive delta = reduction
    #   Negative delta = increase / addition
    measure_definitions = [
        # Buildings Space Heating Reduction
        (3, "heat_dmd_reduction_private", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/private", 20.0),
        (4, "heat_dmd_reduction_industry", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/industry", 20.0),
        (5, "heat_dmd_reduction_schools", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/schools", 20.0),
        (6, "heat_dmd_reduction_public", "buildings/inputs/heat_dmd__k__W_h_per_m2_a/public", 20.0),

        # Heating System Conversion (private sector)
        (7, "oil_phaseout_private", "buildings/inputs/A_heat_oil__k__m2/private", 1080.0),
        (8, "oil_condensing_phaseout_private", "buildings/inputs/A_heat_oil_condensing__k__m2/private", 1800.0),
        (9, "gas_phaseout_private", "buildings/inputs/A_heat_gas__k__m2/private", 540.0),
        (10, "heat_pump_expansion_private", "buildings/inputs/A_heat_heat_pump__k__m2/private", -3420.0),

        # Electric Vehicle Adoption (BEV)
        (11, "bev_expansion_private", "mobility/inputs/n_bev__k__/private", -40.0),
        (12, "bev_expansion_industry", "mobility/inputs/n_bev__k__/industry", -5.0),
        (13, "bev_expansion_public", "mobility/inputs/n_bev__k__/public", -1.0),

        # Rooftop Solar PV Expansion (MWp)
        (14, "sol_rf_expansion_private", "energy/inputs/sol_rf_installed__M__Wp/private", -21.0),
        (15, "sol_rf_expansion_industry", "energy/inputs/sol_rf_installed__M__Wp/industry", -2.1),
        (16, "sol_rf_expansion_public", "energy/inputs/sol_rf_installed__M__Wp/public", -0.525),

        # Open-Space Solar PV Expansion (ha)
        (17, "sol_os_expansion_industry", "energy/inputs/sol_os_installed_A__ha/industry", -10.0),
        (18, "sol_os_expansion_public", "energy/inputs/sol_os_installed_A__ha/public", -5.0),
    ]

    for row_idx, m_id, input_id, default_delta in measure_definitions:
        r = eingabe_mn.get(row_idx, {})
        s_val = r.get("S") # 2035 accumulated delta in Eingabe MN
        
        delta = default_delta
        if s_val is not None and isinstance(s_val, (int, float)):
            # Sign convention in climcalc-core:
            # For heating demand/oil/gas: positive delta = reduction
            # For heat pump / solar / BEV: negative delta = expansion
            if "reduction" in m_id or "phaseout" in m_id:
                delta = abs(float(s_val))
            else:
                delta = -abs(float(s_val))

        measures.append({
            "id": m_id,
            "input_id": input_id,
            "start_year": 2022,
            "end_year": 2035,
            "delta": delta,
        })

    # 4. Extract Expected Outputs from Rechenwerk
    expected_outputs = {}

    def extract_time_series(row_idx: int) -> List[float]:
        r = rechenwerk.get(row_idx, {})
        series = []
        for col, _ in year_cols:
            val = r.get(col, 0.0)
            if val is None or str(val).lower() == 'nan':
                val = 0.0
            series.append(float(val))
        return series

    def extract_sector_series(base_row: int, var_id: str, n_sectors: int = 4):
        # n_sectors = 4: private, industry, schools, public
        # n_sectors = 3: private, industry, public (schools = 0.0)
        # n_sectors = 2: industry, public (private = 0.0, schools = 0.0)
        zero_series = [0.0] * len(year_cols)

        if n_sectors == 4:
            expected_outputs[f"{var_id}/private"] = extract_time_series(base_row)
            expected_outputs[f"{var_id}/industry"] = extract_time_series(base_row + 1)
            expected_outputs[f"{var_id}/schools"] = extract_time_series(base_row + 2)
            expected_outputs[f"{var_id}/public"] = extract_time_series(base_row + 3)
        elif n_sectors == 3:
            expected_outputs[f"{var_id}/private"] = extract_time_series(base_row)
            expected_outputs[f"{var_id}/industry"] = extract_time_series(base_row + 1)
            expected_outputs[f"{var_id}/schools"] = zero_series
            expected_outputs[f"{var_id}/public"] = extract_time_series(base_row + 2)
        elif n_sectors == 2:
            expected_outputs[f"{var_id}/private"] = zero_series
            expected_outputs[f"{var_id}/industry"] = extract_time_series(base_row)
            expected_outputs[f"{var_id}/schools"] = zero_series
            expected_outputs[f"{var_id}/public"] = extract_time_series(base_row + 1)

    # --- Buildings Domain Results ---
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

    # --- Mobility Domain Results ---
    extract_sector_series(196, "mobility/results/traveld_dist_car__M__m_per_a", 3)
    extract_sector_series(201, "mobility/results/cars_grant__M__eur_per_a", 3)
    extract_sector_series(209, "mobility/results/bev_elec_nrg_dmd__G__W_h_per_a", 3)
    extract_sector_series(213, "mobility/results/cars_fuel_dmd__M__L_per_a", 3)
    extract_sector_series(217, "mobility/results/bev_elec_nrg_price__G__W_h_per_a", 3)
    extract_sector_series(221, "mobility/results/cars_fuel_costs__M__eur_per_a", 3)
    extract_sector_series(368, "mobility/results/cars_ems__k__to_coe_per_a", 3)

    expected_outputs["mobility/results/sl_nrg_costs__M__eur_per_a"] = extract_time_series(228)
    expected_outputs["mobility/results/sl_om_costs__M__eur_per_a"] = extract_time_series(229)
    expected_outputs["mobility/results/sl_total_costs__M__eur_per_a"] = extract_time_series(230)

    # --- Energy Domain Results ---
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

    # --- Economy Domain Results ---
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
        expected_outputs[f"economy/results/{var_name}"] = extract_time_series(r_idx)

    # --- Stakeholders Domain Results ---
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
        expected_outputs[f"stakeholders/results/{var_name}"] = extract_time_series(r_idx)

    # Build final fixture object
    fixture = {
        "name": os.path.basename(excel_path),
        "source": excel_path,
        "start_year": start_year,
        "end_year": end_year,
        "years": years,
        "inputs": inputs,
        "measures": measures,
        "expected_outputs": expected_outputs,
    }

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fixture, f, indent=2, ensure_ascii=False)

    print(f"Successfully extracted {len(expected_outputs)} result series to {output_path}")
    wb.close()


if __name__ == "__main__":
    excel_file = sys.argv[1] if len(sys.argv) > 1 else "examples/data/Rechnung Parameter v5.xlsx"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "tests/fixtures/v5_rechnung.json"
    extract_testcase(excel_file, out_file)
