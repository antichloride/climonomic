#!/usr/bin/env python3
"""
Climonomic Calculator Equation Extractor and Markdown Generator

This script parses all mathematical and physical equations from the Rust calculation
engine across all sectors (Buildings, Energy, Mobility, Economy, Stakeholders),
performs dimensional and scale factor verification, and generates a comprehensive,
human-readable Markdown document (docs/equations.md) with LaTeX formulas and
variable/unit tables.

Usage:
    python3 scripts/export_equations_md.py [--output docs/equations.md]
"""

import ast
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set

# Import verification logic from verify_units.py
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from verify_units import (
    verify_equation,
    parse_var_name_units,
    extract_equations_from_rust_file,
    UNIT_DEFINITIONS,
    SI_PREFIXES,
    UnitQuantity,
)

# Human-readable LaTeX formatted units
UNIT_LATEX_MAP: Dict[str, str] = {
    'G__W_h_per_a': r'\text{GWh}/\text{a}',
    'M__W_h_per_m2_a': r'\text{MWh}/(\text{m}^2\cdot\text{a})',
    'k__W_h_per_m2_a': r'\text{kWh}/(\text{m}^2\cdot\text{a})',
    'k_W_h_per_a': r'\text{kWh}/\text{a}',
    'k__W_h_per_a': r'\text{kWh}/\text{a}',
    'M__eur_per_a': r'\text{M€}/\text{a}',
    'M__eur': r'\text{M€}',
    'eur_per_kWh': r'\text{€}/\text{kWh}',
    'eur_per_L': r'\text{€}/\text{L}',
    'eur_per_m3': r'\text{€}/\text{m}^3',
    'm__eur_per_W_h': r'\text{m€}/\text{Wh}',
    'm__eur_per_Wp': r'\text{m€}/\text{W}_{\text{peak}}',
    'm__eur_per_W_h_m2': r'\text{m€}/(\text{Wh}\cdot\text{m}^2)',
    'M__L_per_a': r'\text{Mio. L}/\text{a}',
    'M__m3_per_a': r'\text{Mio. m}^3/\text{a}',
    'k__m2': r'10^3\text{ m}^2',
    'm2': r'\text{m}^2',
    'ha': r'\text{ha}',
    'k__km_per_a': r'10^3\text{ km}/\text{a}',
    'M__m_per_a': r'10^6\text{ m}/\text{a}',
    '1em2__W_h_per_m': r'10^{-2}\text{ Wh}/\text{m}',
    'k__to_coe_per_a': r'\text{kt }\text{CO}_2\text{e}/\text{a}',
    'kg_coe_per_L': r'\text{kg }\text{CO}_2\text{e}/\text{L}',
    'kg_coe_per_m3': r'\text{kg }\text{CO}_2\text{e}/\text{m}^3',
    'k__': r'10^3\text{ (thousands)}',
    'M__Wp': r'\text{MW}_{\text{peak}}',
    'M__WP': r'\text{MW}_{\text{peak}}',
    'k__Wp_per_m2': r'\text{kW}_{\text{peak}}/\text{m}^2',
}

DIMENSION_HUMAN_NAMES: Dict[str, str] = {
    'length': 'Length',
    'area': 'Area',
    'volume': 'Volume',
    'time_s': 'Time (seconds)',
    'time_h': 'Time (hours)',
    'time_a': 'Time (annual)',
    'power': 'Power',
    'power_peak': 'Peak Power (PV / Wind)',
    'currency': 'Financial Currency (€)',
    'mass': 'Mass',
    'co2_equivalent': 'Greenhouse Gas Emissions (CO₂e)',
    'employment': 'Employment (FTE)',
}


def clean_rust_expr(raw_expr: str) -> str:
    """Cleans Rust-specific syntax, references, and accessor methods into pure arithmetic."""
    expr = re.sub(r'//[^\n]*', '', raw_expr)  # inline comments
    expr = re.sub(r'&\s*', '', expr)          # reference ampersands
    expr = re.sub(r'\.get_year\([^)]*\)', '', expr)
    expr = re.sub(r'\.copy\(\)', '', expr)
    expr = re.sub(r'\.sum\(\)', '', expr)
    # Strip step comparison functions
    expr = re.sub(r'\s*\*\s*[a-zA-Z0-9_]+\.is_greater\([^)]*\)', '', expr)
    expr = re.sub(r'constants::(?:[a-zA-Z0-9_]+::)+', '', expr)
    expr = re.sub(r'constants::', '', expr)
    expr = re.sub(r'(?:self\.)?(?:inputs|results)\.', '', expr)
    expr = re.sub(r'\.(?:private|industry|schools|public)', '', expr)
    expr = ' '.join(expr.split())
    return expr


class LatexFormulaConverter(ast.NodeVisitor):
    """Converts an arithmetic Python AST into a clean LaTeX mathematical expression."""
    def visit_Name(self, node: ast.Name) -> str:
        name = node.id
        base_name = name.split('__')[0]
        # Clean underscores
        clean_symbol = base_name.replace('_', r'\_')
        return r'\mathrm{' + clean_symbol + r'}'

    def visit_Constant(self, node: ast.Constant) -> str:
        val = node.value
        if isinstance(val, (int, float)):
            if val == 1e-3:
                return r'10^{-3}'
            elif val == 1e-2:
                return r'10^{-2}'
            elif val == 1e-1:
                return r'10^{-1}'
            elif val == 1e1:
                return r'10'
            elif val == 1e2:
                return r'100'
            elif val == 1e3:
                return r'1\,000'
            elif isinstance(val, float) and val.is_integer():
                return f'{int(val)}'
            return f'{val:g}'
        return str(val)

    def visit_Num(self, node: ast.Num) -> str:
        return self.visit_Constant(node)

    def visit_UnaryOp(self, node: ast.UnaryOp) -> str:
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.USub):
            return f'-{operand}'
        return operand

    def visit_BinOp(self, node: ast.BinOp) -> str:
        left = self.visit(node.left)
        right = self.visit(node.right)

        if isinstance(node.op, ast.Div):
            return rf'\frac{{{left}}}{{{right}}}'
        elif isinstance(node.op, ast.Mult):
            # Wrap parenthesized additions
            if isinstance(node.left, ast.BinOp) and isinstance(node.left.op, (ast.Add, ast.Sub)):
                left = rf'\left({left}\right)'
            if isinstance(node.right, ast.BinOp) and isinstance(node.right.op, (ast.Add, ast.Sub)):
                right = rf'\left({right}\right)'
            return rf'{left} \cdot {right}'
        elif isinstance(node.op, ast.Add):
            return rf'{left} + {right}'
        elif isinstance(node.op, ast.Sub):
            if isinstance(node.right, ast.BinOp) and isinstance(node.right.op, (ast.Add, ast.Sub)):
                right = rf'\left({right}\right)'
            return rf'{left} - {right}'
        return rf'{left} \star {right}'


def expr_to_latex(lhs_var: str, rhs_expr: str) -> str:
    """Converts a formula into a clean, complete LaTeX display equation."""
    lhs_base = lhs_var.split('__')[0].replace('_', r'\_')
    lhs_latex = rf'\mathrm{{{lhs_base}}}'
    try:
        tree = ast.parse(rhs_expr, mode='eval')
        rhs_latex = LatexFormulaConverter().visit(tree.body)
        return rf'{lhs_latex} = {rhs_latex}'
    except Exception:
        # Fallback to plain formatting
        return rf'{lhs_latex} = \text{{{rhs_expr}}}'


def extract_variables_from_expr(expr_str: str) -> List[str]:
    """Finds all unique identifier variable names in an expression."""
    try:
        tree = ast.parse(expr_str, mode='eval')
        vars_found = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                if node.id not in vars_found:
                    vars_found.append(node.id)
        return vars_found
    except Exception:
        # Fallback regex
        return sorted(set(re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', expr_str)))


def get_latex_unit(var_name: str) -> str:
    """Extracts and formats the LaTeX unit string for a variable."""
    if '__' not in var_name:
        return r'\text{dimensionless}'
    
    parts = var_name.split('__')[1:]
    suffix = '__'.join(parts)
    
    for k, v in UNIT_LATEX_MAP.items():
        if k == suffix or suffix.endswith(k) or k in suffix:
            return v
    
    qty = parse_var_name_units(var_name)
    if qty.is_dimensionless():
        if qty.scale != 1.0:
            return rf'{qty.scale:g}\text{ (scale)}'
        return r'\text{dimensionless}'
    
    dims_str = " \\cdot ".join(
        rf'\text{{{k}}}^{{{v}}}' if v != 1 else rf'\text{{{k}}}'
        for k, v in sorted(qty.dims.items())
    )
    return dims_str or r'\text{dimensionless}'


def get_physical_dimension_label(var_name: str) -> str:
    """Returns a readable label of the physical dimension."""
    qty = parse_var_name_units(var_name)
    if qty.is_dimensionless():
        return "Dimensionless / Count"
    
    dims_labels = []
    for k, v in sorted(qty.dims.items()):
        name = DIMENSION_HUMAN_NAMES.get(k, k.replace('_', ' ').capitalize())
        if v == 1:
            dims_labels.append(name)
        elif v == -1:
            dims_labels.append(f"1 / {name}")
        else:
            dims_labels.append(f"{name}^{v}")
    
    return ", ".join(dims_labels)


import json
import subprocess


def load_equations_from_wasm_or_rust() -> List[Dict[str, str]]:
    """
    Loads equation metadata directly from the Wasm / Rust single source of truth.
    Eliminates regex scraping of raw source calculation files.
    """
    try:
        cmd = [
            "node", "-e",
            "import('./pkg/climcalc_core.js').then(pkg => { const c = new pkg.Calculator(2022, 2030); console.log(JSON.stringify(c.list_equations())); })"
        ]
        out = subprocess.check_output(cmd, cwd=ROOT_DIR, text=True, stderr=subprocess.DEVNULL)
        return json.loads(out)
    except Exception:
        # Fallback reading directly from src/equations.rs declarative macro
        eq_file = ROOT_DIR / "src" / "equations.rs"
        content = eq_file.read_text(encoding="utf-8")
        pattern = re.compile(r'///([^\n]+)\n\s*([a-zA-Z0-9_]+)::([a-zA-Z0-9_]+)\s*=\s*([^;]+);')
        results = []
        for m in pattern.finditer(content):
            results.append({
                "description": m.group(1).strip(),
                "sector": m.group(2).strip(),
                "id": m.group(3).strip(),
                "formula": " ".join(m.group(4).split()),
            })
        return results


def generate_markdown(output_path: Path):
    """Generates the full equations documentation Markdown document."""
    sectors_config = [
        ("buildings", "Buildings Sector", "src/buildings/calculate.rs", "Space heating demand, hot water, boiler fuel consumption, energetic renovations, heat pump electricity demand, and building sector emissions."),
        ("energy", "Energy & Renewables Sector", "src/energy/calculate.rs", "Rooftop photovoltaics (PV), open-space ground-mounted solar, onshore wind generation, electricity grid mix procurement, and renewable feed-in."),
        ("mobility", "Mobility Sector", "src/mobility/calculate.rs", "Vehicle fleet mileage, battery electric vehicle (BEV) power demand, combustion fuel consumption, street lighting infrastructure, and tailpipe emissions."),
        ("economy", "Macroeconomics Sector", "src/economy/calculate.rs", "Capital expenditure splits (material vs. labor), local vs. national turnover, full-time equivalent (FTE) jobs, municipal business taxes, and tax revenues."),
        ("stakeholders", "Stakeholders Sector", "src/stakeholders/calculate.rs", "Net annual cash flows, financial effects of climate measures, and capital expenditure balances across Private, Industry, and Municipal stakeholders."),
    ]

    all_eqs = load_equations_from_wasm_or_rust()
    eqs_by_sector: Dict[str, List[Dict[str, str]]] = {}
    for eq in all_eqs:
        eqs_by_sector.setdefault(eq['sector'].lower(), []).append(eq)

    lines = []
    lines.append("# Climonomic Engine — Mathematical & Physical Formulation Catalog\n")
    lines.append("> Auto-generated documentation of all mathematical calculations, equations, and physical units in the Climonomic simulation core.\n")
    lines.append("## Overview\n")
    var_naming_rel = os.path.relpath(ROOT_DIR / "variables_naming_convention.md", output_path.parent)
    lines.append(f"Every variable in the Climonomic calculator encodes its physical unit and SI scale directly into its name using double underscores (`__`), as specified in [variables_naming_convention.md]({var_naming_rel}).")
    lines.append("Equations are declared via declarative Rust macros (`src/equations.rs`) as a **single source of truth** and exposed directly through the WebAssembly API (`calc.get_equation_metadata(id)`).\n")
    lines.append("Each calculation is statically verified for:\n")
    lines.append("1. **Dimensional Consistency**: The physical dimensions of the resulting quantity must match the combined dimensions of the input arguments.")
    lines.append("2. **Scale Factor Balance**: Numeric factors in code ($K_{\\text{code}}$) must balance the SI prefixes of the variables according to the physical balance law:")
    lines.append("   $$K_{\\text{code}} \\times \\text{scale}(\\text{LHS}) = \\text{scale}(\\text{RHS}_{\\text{variables}})$$\n")
    lines.append("---\n")
    lines.append("## Table of Contents\n")

    for _, title, _, _ in sectors_config:
        anchor = title.lower().replace('&', '').replace(' ', '-').replace('--', '-')
        lines.append(f"- [{title}](#{anchor})")
    lines.append("\n---\n")

    total_eqs = 0
    total_verified = 0

    for sector_key, title, rel_src, desc in sectors_config:
        file_path = ROOT_DIR / rel_src
        rel_to_doc = os.path.relpath(file_path, output_path.parent)
        lines.append(f"## {title}\n")
        lines.append(f"**Source Implementation:** [`{rel_src}`]({rel_to_doc})\n")
        lines.append(f"*{desc}*\n")

        sector_eqs = eqs_by_sector.get(sector_key, [])
        if not sector_eqs:
            lines.append("*No equations registered for this sector.*\n")
            continue

        for eq in sector_eqs:
            total_eqs += 1
            lhs = eq['id']
            rhs = eq['formula']
            eq_desc = eq.get('description', '')
            clean_rhs = clean_rust_expr(rhs)

            ok, v_msg = verify_equation(lhs, clean_rhs)
            if ok:
                total_verified += 1
                status_badge = "✅ **Verified Physical Balance**"
            else:
                status_badge = f"⚠️ **Discrepancy Note**: {v_msg}"

            latex_block = expr_to_latex(lhs, clean_rhs)
            lhs_unit_latex = get_latex_unit(lhs)
            lhs_dim = get_physical_dimension_label(lhs)

            lines.append(f"### `{lhs}`\n")
            if eq_desc:
                lines.append(f"> **Description:** {eq_desc}\n")
            lines.append(f"**Source:** Declarative Macro (`src/equations.rs` &rarr; Wasm API)\n")
            lines.append(f"$$\n{latex_block}\n$$\n")
            lines.append(f"**Formula Expression:**\n```rust\n{lhs} = {rhs};\n```\n")
            lines.append(f"**Verification Status:** {status_badge}\n")

            # Table of variables
            lines.append("#### Variable & Unit Breakdown\n")
            lines.append("| Variable / Argument | Role | Encoded Unit | LaTeX Unit | Physical Dimension |")
            lines.append("| :--- | :--- | :--- | :--- | :--- |")
            lines.append(f"| `{lhs}` | **LHS (Result)** | `{lhs.split('__', 1)[-1] if '__' in lhs else 'none'}` | ${lhs_unit_latex}$ | {lhs_dim} |")

            rhs_vars = extract_variables_from_expr(clean_rhs)
            for r_var in rhs_vars:
                r_unit = get_latex_unit(r_var)
                r_dim = get_physical_dimension_label(r_var)
                role = "Input / Variable" if '__' in r_var else "Parameter / Constant"
                raw_u = r_var.split('__', 1)[-1] if '__' in r_var else 'none'
                lines.append(f"| `{r_var}` | {role} | `{raw_u}` | ${r_unit}$ | {r_dim} |")

            lines.append("\n---\n")

    lines.append("## Summary Statistics\n")
    lines.append(f"- **Total Equations Extracted:** {total_eqs}")
    lines.append(f"- **Equations Verified (100% Dimensional & Scale Balance):** {total_verified}")
    lines.append(f"- **Verification Pass Rate:** {(total_verified / total_eqs * 100) if total_eqs else 0:.1f}%\n")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Successfully generated equations documentation at: {output_path}")
    print(f"Total equations cataloged: {total_eqs} (Verified: {total_verified})")


def main():
    out_file = ROOT_DIR / "docs" / "equations.md"
    if len(sys.argv) > 1 and sys.argv[1].endswith(".md"):
        out_file = Path(sys.argv[1])
    generate_markdown(out_file)


if __name__ == "__main__":
    main()
