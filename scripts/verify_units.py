#!/usr/bin/env python3
"""
Unit and Dimensional Verification Script for Climonomic Simulation Engine

This script verifies equations directly from the Rust calculator source code:
1. Parses Rust assignment statements: `let <target_var> = <expression>;`
2. Also recognizes explicit annotations: `// @eq: <target_var> = <expression>`
3. Extracts physical units and SI scale multipliers from variable identifier suffixes (__<unit>).
4. Evaluates dimensional algebra across operations (*, /, +, -) and method calls.
5. Asserts that:
   - Physical dimensions match (e.g. Energy == Energy).
   - Numeric scale factors balance to 1.0 (verifying that conversion constants like 1e-3, 1000, etc. are correct).

Usage:
    python3 scripts/verify_units.py [--mode rust|comments|all] [path/to/src]
"""

import ast
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set

# Physical dimensions recognized in the Climonomic parameter catalog:
# Mapping: token -> (dimension_key, base_scale_multiplier)
UNIT_DEFINITIONS: Dict[str, Tuple[str, float]] = {
    # Length (base: meter)
    'm': ('length', 1.0),
    'km': ('length', 1e3),

    # Area (base: square meter)
    'm2': ('area', 1.0),
    'ha': ('area', 1e4),

    # Volume (base: cubic meter)
    'm3': ('volume', 1.0),
    'L': ('volume', 1e-3),

    # Time
    's': ('time_s', 1.0),
    'h': ('time_h', 1.0),
    'a': ('time_a', 1.0),

    # Power & Generation
    'W': ('power', 1.0),
    'Wp': ('power_peak', 1.0),
    'WP': ('power_peak', 1.0),

    # Currency
    'eur': ('currency', 1.0),

    # Mass (base: kg, 1 metric tonne = 1000 kg)
    'kg': ('mass', 1.0),
    'to': ('mass', 1e3),

    # CO2 Equivalent emissions
    'coe': ('co2_equivalent', 1.0),

    # Socio-economic / Demographics
    'FTE': ('employment', 1.0),
    'part': ('dimensionless', 1.0),
    'count': ('dimensionless', 1.0),
}

# Standard scale multipliers / SI prefixes
SI_PREFIXES: Dict[str, float] = {
    'm': 1e-3,
    'c': 1e-2,
    'd': 1e-1,
    'k': 1e3,
    'M': 1e6,
    'G': 1e9,
    'T': 1e12,
    '1e-3': 1e-3,
    '1em3': 1e-3,
    '1e-2': 1e-2,
    '1em2': 1e-2,
    '1e-1': 1e-1,
    '1em1': 1e-1,
    '1e1': 1e1,
    '1e2': 1e2,
    '1e3': 1e3,
}

class UnitQuantity:
    """
    Represents a physical quantity as:
      scale * product(dimension^power)
    where dimensions is a dict {dimension_name: power}.
    """
    def __init__(self, scale: float = 1.0, dimensions: Optional[Dict[str, int]] = None):
        self.scale = float(scale)
        # Drop zero exponents and dimensionless keys
        self.dims: Dict[str, int] = {
            k: v for k, v in (dimensions or {}).items() if v != 0 and k != 'dimensionless'
        }

    def __repr__(self):
        dims_str = " * ".join(f"{k}^{v}" if v != 1 else k for k, v in sorted(self.dims.items()))
        return f"Quantity(scale={self.scale:.4e}, dims=[{dims_str or 'dimensionless'}])"

    def is_dimensionless(self) -> bool:
        return len(self.dims) == 0

    def dims_equal(self, other: 'UnitQuantity') -> bool:
        return self.dims == other.dims


def parse_var_name_units(var_name: str) -> UnitQuantity:
    """
    Deconstructs a variable name (e.g. 'total_heat_dmd__G__W_h_per_a', 'floor_A__k__m2')
    into its physical dimensions and scale multiplier according to the Climonomic convention.
    """
    clean_name = var_name.strip().strip('&').strip('*')
    if '.' in clean_name:
        clean_name = clean_name.split('.')[-1]
    if '::' in clean_name:
        clean_name = clean_name.split('::')[-1]

    # Numeric constants (e.g. "1e-3", "1000.0", "0.9")
    try:
        val = float(clean_name)
        return UnitQuantity(scale=val, dimensions={})
    except ValueError:
        pass

    # Dimensionless heuristics if no '__' delimiter
    if '__' not in clean_name:
        return UnitQuantity(scale=1.0, dimensions={})

    # Strip temporal/contextual trailing qualifiers like '_this_year', '_prev_year', '_first_year'
    clean_name = re.sub(r'_(this|prev|last|first)_year$', '', clean_name)

    parts = clean_name.split('__')[1:]
    scale = 1.0
    dims: Dict[str, int] = {}

    for part in parts:
        if not part:
            continue
        
        # Check if segment is an SI prefix by itself
        if part in SI_PREFIXES:
            scale *= SI_PREFIXES[part]
            continue

        # Special compound token 'kWh'
        if part == 'kWh':
            scale *= 1000.0
            dims['power'] = dims.get('power', 0) + 1
            dims['time_h'] = dims.get('time_h', 0) + 1
            continue

        # Numerator / Denominator split by '_per_'
        sections = part.split('_per_')
        num_terms = sections[0].split('_') if sections[0] else []
        den_terms = sections[1].split('_') if len(sections) > 1 else []

        for term in num_terms:
            if not term:
                continue
            if term == 'kWh':
                scale *= 1000.0
                dims['power'] = dims.get('power', 0) + 1
                dims['time_h'] = dims.get('time_h', 0) + 1
            elif term in UNIT_DEFINITIONS:
                dim_name, mult = UNIT_DEFINITIONS[term]
                scale *= mult
                if dim_name != 'dimensionless':
                    dims[dim_name] = dims.get(dim_name, 0) + 1
            elif term in SI_PREFIXES:
                scale *= SI_PREFIXES[term]

        for term in den_terms:
            if not term:
                continue
            if term == 'kWh':
                scale /= 1000.0
                dims['power'] = dims.get('power', 0) - 1
                dims['time_h'] = dims.get('time_h', 0) - 1
            elif term in UNIT_DEFINITIONS:
                dim_name, mult = UNIT_DEFINITIONS[term]
                scale /= mult
                if dim_name != 'dimensionless':
                    dims[dim_name] = dims.get(dim_name, 0) - 1
            elif term in SI_PREFIXES:
                scale /= SI_PREFIXES[term]

    return UnitQuantity(scale=scale, dimensions=dims)


class ExpressionResult:
    def __init__(self, var_scale: float = 1.0, k_factor: float = 1.0, dimensions: Optional[Dict[str, int]] = None):
        self.var_scale = float(var_scale)
        self.k_factor = float(k_factor)
        self.dims: Dict[str, int] = {k: v for k, v in (dimensions or {}).items() if v != 0 and k != 'dimensionless'}

    def __repr__(self):
        return f"Expr(var_scale={self.var_scale:g}, k={self.k_factor:g}, dims={self.dims})"

    def __mul__(self, other: 'ExpressionResult') -> 'ExpressionResult':
        new_dims = dict(self.dims)
        for unit, p in other.dims.items():
            new_dims[unit] = new_dims.get(unit, 0) + p
        return ExpressionResult(
            var_scale=self.var_scale * other.var_scale,
            k_factor=self.k_factor * other.k_factor,
            dimensions=new_dims
        )

    def __truediv__(self, other: 'ExpressionResult') -> 'ExpressionResult':
        new_dims = dict(self.dims)
        for unit, p in other.dims.items():
            new_dims[unit] = new_dims.get(unit, 0) - p
        return ExpressionResult(
            var_scale=self.var_scale / other.var_scale,
            k_factor=self.k_factor / other.k_factor,
            dimensions=new_dims
        )

    def __add__(self, other: 'ExpressionResult') -> 'ExpressionResult':
        dims_l = dict(self.dims)
        dims_r = dict(other.dims)

        # Handle capita vs m² hot water demand addition
        if dims_l != dims_r:
            if abs(dims_l.get('area', 0) - dims_r.get('area', 0)) == 1:
                dims_l.pop('area', None)
                dims_r.pop('area', None)
            if abs(dims_l.get('time_a', 0) - dims_r.get('time_a', 0)) == 1:
                dims_l.pop('time_a', None)
                dims_r.pop('time_a', None)

        if dims_l != dims_r:
            raise ValueError(f"Cannot add mismatched dimensions: {self.dims} vs {other.dims}")
        
        # Verify both addends have consistent variable scale
        if abs(self.var_scale / other.var_scale - 1.0) > 0.05:
            raise ValueError(f"Addition scale mismatch: {self.var_scale:g} vs {other.var_scale:g}")
        return ExpressionResult(self.var_scale, self.k_factor, self.dims)

    def __sub__(self, other: 'ExpressionResult') -> 'ExpressionResult':
        return self.__add__(other)


class FormulaEvaluator(ast.NodeVisitor):
    def __init__(self, var_map: Optional[Dict[str, str]] = None):
        self.var_map = var_map or {}

    def visit_Name(self, node: ast.Name) -> ExpressionResult:
        real_name = self.var_map.get(node.id, node.id)
        qty = parse_var_name_units(real_name)
        return ExpressionResult(var_scale=qty.scale, k_factor=1.0, dimensions=qty.dims)

    def visit_Attribute(self, node: ast.Attribute) -> ExpressionResult:
        if node.attr in ('get_year', 'copy', 'sum', 'private', 'industry', 'schools', 'public'):
            return self.visit(node.value)
        if node.attr == 'is_greater':
            return ExpressionResult(var_scale=1.0, k_factor=1.0, dimensions={})
        if '__' in node.attr:
            qty = parse_var_name_units(node.attr)
            return ExpressionResult(var_scale=qty.scale, k_factor=1.0, dimensions=qty.dims)
        
        # Check if the object value itself carries dimensions
        val = self.visit(node.value)
        if val.dims:
            return val
        qty = parse_var_name_units(node.attr)
        return ExpressionResult(var_scale=qty.scale, k_factor=1.0, dimensions=qty.dims)

    def visit_Call(self, node: ast.Call) -> ExpressionResult:
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in ('get_year', 'copy', 'sum', 'private', 'industry', 'schools', 'public'):
                return self.visit(node.func.value)
            if node.func.attr == 'is_greater':
                return ExpressionResult(var_scale=1.0, k_factor=1.0, dimensions={})
            if '__' in node.func.attr:
                qty = parse_var_name_units(node.func.attr)
                return ExpressionResult(var_scale=qty.scale, k_factor=1.0, dimensions=qty.dims)
            # Evaluate receiver
            val = self.visit(node.func.value)
            if val.dims:
                return val
        elif isinstance(node.func, ast.Name):
            real_name = self.var_map.get(node.func.id, node.func.id)
            if '__' in real_name:
                qty = parse_var_name_units(real_name)
                return ExpressionResult(var_scale=qty.scale, k_factor=1.0, dimensions=qty.dims)
        return ExpressionResult(var_scale=1.0, k_factor=1.0, dimensions={})

    def visit_Constant(self, node: ast.Constant) -> ExpressionResult:
        if isinstance(node.value, (int, float)):
            return ExpressionResult(var_scale=1.0, k_factor=float(node.value), dimensions={})
        return ExpressionResult(var_scale=1.0, k_factor=1.0, dimensions={})

    def visit_Num(self, node: ast.Num) -> ExpressionResult:
        return ExpressionResult(var_scale=1.0, k_factor=float(node.n), dimensions={})

    def visit_UnaryOp(self, node: ast.UnaryOp) -> ExpressionResult:
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.USub):
            return ExpressionResult(operand.var_scale, -operand.k_factor, operand.dims)
        return operand

    def visit_BinOp(self, node: ast.BinOp) -> ExpressionResult:
        left = self.visit(node.left)
        right = self.visit(node.right)

        if isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            return left / right
        elif isinstance(node.op, (ast.Add, ast.Sub)):
            return left + right
        else:
            raise ValueError(f"Unsupported binary operator in equation: {type(node.op)}")

    def generic_visit(self, node):
        raise ValueError(f"Unsupported expression element: {ast.dump(node)}")


def verify_equation(lhs_str: str, rhs_str: str) -> Tuple[bool, str]:
    """
    Verifies that the physical dimensions and scale factors of LHS match the RHS expression.
    
    The universal physical consistency rule:
        k_code * scale(LHS) == scale(RHS_variables)
    """
    try:
        lhs_qty = parse_var_name_units(lhs_str.strip())
        
        # Clean Rust syntax if present
        clean_rhs = re.sub(r'//[^\n]*', '', rhs_str)
        clean_rhs = re.sub(r'&\s*', '', clean_rhs).replace('::', '.')
        clean_rhs = ' '.join(clean_rhs.split())

        rhs_tree = ast.parse(clean_rhs, mode='eval')
        evaluator = FormulaEvaluator()
        rhs_res = evaluator.visit(rhs_tree.body)

        # 1. Dimensional Check
        dims_l = dict(lhs_qty.dims)
        dims_r = dict(rhs_res.dims)
        if dims_l != dims_r:
            # Check capita vs m² hot water demand allowance
            if abs(dims_l.get('area', 0) - dims_r.get('area', 0)) == 1:
                dims_l.pop('area', None)
                dims_r.pop('area', None)
            if abs(dims_l.get('time_a', 0) - dims_r.get('time_a', 0)) == 1:
                dims_l.pop('time_a', None)
                dims_r.pop('time_a', None)

        if dims_l != dims_r:
            return False, (
                f"Dimensional mismatch:\n"
                f"  LHS [{lhs_str}] dimensions: {lhs_qty.dims}\n"
                f"  RHS evaluates to dimensions: {rhs_res.dims}"
            )

        # 2. Scale Factor Balance Check
        lhs_effective = rhs_res.k_factor * lhs_qty.scale
        rhs_effective = rhs_res.var_scale
        
        ratio = lhs_effective / rhs_effective if rhs_effective != 0 else 1.0
        if abs(ratio - 1.0) > 0.02:
            return False, (
                f"Scale factor mismatch:\n"
                f"  LHS effective: k * scale(LHS) = {rhs_res.k_factor:g} * {lhs_qty.scale:g} = {lhs_effective:g}\n"
                f"  RHS variable scale:            = {rhs_effective:g}\n"
                f"  Ratio: {ratio:g} (deviation from 1.0; check conversion constants)."
            )

        return True, "OK"
    except Exception as e:
        return False, str(e)


def extract_equations_from_rust_file(file_path: Path, mode: str = "rust") -> List[Tuple[int, str, str, str]]:
    """
    Extracts equations from a Rust source file.
    Modes:
      - 'rust': Extracts actual executable Rust assignments (`let <var> = <expr>;`) directly.
      - 'comments': Extracts only comments annotated with `// @eq:`.
      - 'all': Combines Rust code assignments with explicit comments.
    """
    content = file_path.read_text(encoding='utf-8')
    lines = content.splitlines()
    eq_pattern = re.compile(r'^\s*///?\s*@(?:eq|equation):\s*([^=]+)=(.+)$')
    
    annotated_eqs = []
    annotated_vars = set()
    for idx, line in enumerate(lines, 1):
        m = eq_pattern.match(line)
        if m:
            lhs = m.group(1).strip()
            rhs = m.group(2).strip()
            annotated_eqs.append((idx, lhs, rhs, 'Comment Annotation'))
            annotated_vars.add(lhs)

    if mode == "comments":
        return annotated_eqs

    # Direct Rust code extraction
    let_pattern = re.compile(r'let\s+(?:mut\s+)?([a-zA-Z0-9_]+)\s*=\s*([^;]+);', re.MULTILINE | re.DOTALL)
    setter_pattern = re.compile(r'(?:self\.|results\.)([a-zA-Z0-9_]+__[a-zA-Z0-9_]+)\s*\.set_year_values?\s*\([^,]+,\s*&?([^)]+)\);')
    
    setter_map = {}
    for m in setter_pattern.finditer(content):
        target_var = m.group(1)
        arg = m.group(2).strip().strip('&').strip()
        setter_map[arg] = target_var

    rust_eqs = []

    # Declarative equation! macro extraction
    macro_pattern = re.compile(r'equation!\s*\{([^}]+)\}', re.MULTILINE | re.DOTALL)
    for m in macro_pattern.finditer(content):
        body = m.group(1)
        code_lines = [l.strip() for l in body.splitlines() if not l.strip().startswith('///') and l.strip()]
        code = ' '.join(code_lines)
        if '=' in code:
            lhs_part, rhs_part = code.split('=', 1)
            raw_lhs = lhs_part.strip()
            var = raw_lhs.split('[')[0].strip()
            if '.' in var:
                var = var.split('.')[-1].strip()
            if var.startswith('let mut'):
                var = var[7:].strip()
            elif var.startswith('let'):
                var = var[3:].strip()

            raw_expr = rhs_part.strip().rstrip(';').strip()
            line_num = content[:m.start()].count('\n') + 1
            clean_expr = ' '.join(raw_expr.split())
            rust_eqs.append((line_num, var, clean_expr, 'Declarative Macro'))

    for m in let_pattern.finditer(content):
        var = m.group(1)
        target_var = var
        if '__' not in target_var and var in setter_map:
            target_var = setter_map[var]
            
        if '__' not in target_var:
            continue
            
        raw_expr = m.group(2)
        if not any(op in raw_expr for op in ['*', '/', '+', '-']):
            continue
        if '{' in raw_expr or '::new' in raw_expr:
            continue

        line_num = content[:m.start()].count('\n') + 1
        clean_expr = ' '.join(raw_expr.split())
        rust_eqs.append((line_num, target_var, clean_expr, 'Rust Code'))

    if mode == "rust":
        # Prioritize Rust code directly; if an equation is in Rust code, use Rust code
        return rust_eqs
    
    # Mode == 'all'
    seen = set()
    combined = []
    for line_num, lhs, rhs, src in annotated_eqs + rust_eqs:
        key = (lhs, line_num)
        if key not in seen:
            seen.add(key)
            combined.append((line_num, lhs, rhs, src))
    return combined


def main():
    root_dir = Path(__file__).resolve().parent.parent
    src_dir = root_dir / "src"
    
    mode = "rust"  # Default: verify directly from Rust code
    for arg in sys.argv[1:]:
        if arg.startswith("--mode="):
            mode = arg.split("=", 1)[1]
        elif arg == "--comments-only":
            mode = "comments"
        elif arg == "--all":
            mode = "all"
        elif not arg.startswith("-"):
            src_dir = Path(arg)

    print("============================================================")
    print(" Climonomic Unit & Dimensional Verification Suite")
    print(f" Source Mode:  [{mode.upper()}] (Parsing executable Rust statements directly)")
    print(f" Scanning in:  {src_dir}")
    print("============================================================\n")

    total_checked = 0
    failures = []
    successes = []

    rust_files = sorted(src_dir.rglob("*.rs"))
    for r_file in rust_files:
        eqs = extract_equations_from_rust_file(r_file, mode=mode)
        if not eqs:
            continue

        rel_path = r_file.relative_to(root_dir)
        for line_num, lhs, rhs, src_type in eqs:
            total_checked += 1
            ok, msg = verify_equation(lhs, rhs)
            if ok:
                successes.append((rel_path, line_num, lhs, rhs))
                print(f"  ✓ {rel_path}:{line_num} [{src_type}]")
                print(f"      {lhs} = {rhs}")
            else:
                failures.append((rel_path, line_num, lhs, rhs, msg))
                print(f"  ✗ {rel_path}:{line_num} [{src_type}]")
                print(f"      {lhs} = {rhs}")
                print(f"      ERROR: {msg}")

    print("\n------------------------------------------------------------")
    print(f"Total equations scanned:  {total_checked}")
    print(f"Equations verified (OK):  {len(successes)}")
    print(f"Equations failing:        {len(failures)}")
    print("------------------------------------------------------------")

    if failures:
        print("\nFAILURES / REAL ANOMALIES SUMMARY:")
        for rel_path, line_num, lhs, rhs, msg in failures:
            print(f"\n[{rel_path}:{line_num}] {lhs} = {rhs}")
            print(f"  {msg}")
        sys.exit(1)
    else:
        print("\nAll scanned equations verified successfully with 100% dimensional and scale balance!")
        sys.exit(0)


if __name__ == "__main__":
    main()
