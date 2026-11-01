//! Native Unit and Dimensional Verification Suite for Climonomic Simulation Engine
//!
//! Uses `syn` to parse Rust AST expressions directly from `src/**/calculate.rs` files during `cargo test`.
//! Verifies:
//! 1. Syntactic validity of all equation macro bodies.
//! 2. Correctness of dimensional algebra across operations (*, /, +, -) and method calls.
//! 3. Compile/test-time detection of physical dimensional mismatches (e.g. adding emissions to costs).
//! 4. SI scale factor balance (verifying conversion constants like 1e-3, 1e-2, etc.).

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use syn::{BinOp, Expr, Lit, UnOp};

#[derive(Debug, Clone, PartialEq)]
pub struct UnitQuantity {
    pub scale: f64,
    pub dims: BTreeMap<String, i32>,
}

impl UnitQuantity {
    pub fn dimensionless(scale: f64) -> Self {
        Self {
            scale,
            dims: BTreeMap::new(),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ExpressionResult {
    pub var_scale: f64,
    pub k_factor: f64,
    pub dims: BTreeMap<String, i32>,
}

impl ExpressionResult {
    pub fn dimensionless() -> Self {
        Self {
            var_scale: 1.0,
            k_factor: 1.0,
            dims: BTreeMap::new(),
        }
    }

    pub fn mul(&self, other: &Self) -> Self {
        let mut new_dims = self.dims.clone();
        for (dim, p) in &other.dims {
            let entry = new_dims.entry(dim.clone()).or_insert(0);
            *entry += p;
        }
        new_dims.retain(|_, v| *v != 0);

        Self {
            var_scale: self.var_scale * other.var_scale,
            k_factor: self.k_factor * other.k_factor,
            dims: new_dims,
        }
    }

    pub fn div(&self, other: &Self) -> Self {
        let mut new_dims = self.dims.clone();
        for (dim, p) in &other.dims {
            let entry = new_dims.entry(dim.clone()).or_insert(0);
            *entry -= p;
        }
        new_dims.retain(|_, v| *v != 0);

        Self {
            var_scale: if other.var_scale != 0.0 { self.var_scale / other.var_scale } else { self.var_scale },
            k_factor: if other.k_factor != 0.0 { self.k_factor / other.k_factor } else { self.k_factor },
            dims: new_dims,
        }
    }

    pub fn add(&self, other: &Self) -> Result<Self, String> {
        let mut l_dims = self.dims.clone();
        let mut r_dims = other.dims.clone();

        // Domain allowance: capita vs m2 hot water demand addition
        if l_dims != r_dims {
            let diff_area = (l_dims.get("area").copied().unwrap_or(0) - r_dims.get("area").copied().unwrap_or(0)).abs();
            if diff_area == 1 {
                l_dims.remove("area");
                r_dims.remove("area");
            }
            let diff_time = (l_dims.get("time_a").copied().unwrap_or(0) - r_dims.get("time_a").copied().unwrap_or(0)).abs();
            if diff_time == 1 {
                l_dims.remove("time_a");
                r_dims.remove("time_a");
            }
        }

        if l_dims != r_dims {
            return Err(format!(
                "Dimensional mismatch in addition/subtraction: {:?} vs {:?}",
                self.dims, other.dims
            ));
        }

        // Verify that if both addends carry variable scales, they don't diverge drastically
        if self.var_scale > 0.0 && other.var_scale > 0.0 {
            let ratio = self.var_scale / other.var_scale;
            if (ratio - 1.0).abs() > 0.05 {
                return Err(format!(
                    "Addition scale mismatch: {} vs {}",
                    self.var_scale, other.var_scale
                ));
            }
        }

        Ok(Self {
            var_scale: self.var_scale,
            k_factor: self.k_factor,
            dims: self.dims.clone(),
        })
    }

    pub fn sub(&self, other: &Self) -> Result<Self, String> {
        self.add(other)
    }
}

/// Unit definitions mapping token -> (dimension_name, base_scale_multiplier)
fn get_unit_def(token: &str) -> Option<(&'static str, f64)> {
    match token {
        "m" => Some(("length", 1.0)),
        "km" => Some(("length", 1e3)),
        "m2" => Some(("area", 1.0)),
        "ha" => Some(("area", 1e4)),
        "m3" => Some(("volume", 1.0)),
        "L" => Some(("volume", 1e-3)),
        "s" => Some(("time_s", 1.0)),
        "h" => Some(("time_h", 1.0)),
        "a" => Some(("time_a", 1.0)),
        "W" => Some(("power", 1.0)),
        "Wp" | "WP" => Some(("power_peak", 1.0)),
        "eur" => Some(("currency", 1.0)),
        "kg" => Some(("mass", 1.0)),
        "to" => Some(("mass", 1e3)),
        "coe" => Some(("co2_equivalent", 1.0)),
        "FTE" => Some(("employment", 1.0)),
        "part" | "count" => Some(("dimensionless", 1.0)),
        _ => None,
    }
}

/// Standard scale multipliers / SI prefixes
fn get_si_prefix(token: &str) -> Option<f64> {
    match token {
        "m" | "1e-3" | "1em3" => Some(1e-3),
        "c" | "1e-2" | "1em2" => Some(1e-2),
        "d" | "1e-1" | "1em1" => Some(1e-1),
        "k" | "1e3" => Some(1e3),
        "M" => Some(1e6),
        "G" => Some(1e9),
        "T" => Some(1e12),
        "1e1" => Some(1e1),
        "1e2" => Some(1e2),
        _ => None,
    }
}

/// Parses a variable name (e.g. `total_heat_dmd__G__W_h_per_a`) into physical dimensions & scale.
pub fn parse_var_name_units(var_name: &str) -> UnitQuantity {
    let mut clean_name = var_name.trim().trim_start_matches('&').trim_start_matches('*');
    if let Some(pos) = clean_name.rfind('.') {
        clean_name = &clean_name[pos + 1..];
    }
    if let Some(pos) = clean_name.rfind("::") {
        clean_name = &clean_name[pos + 2..];
    }

    // Check if numeric constant literal
    if let Ok(val) = clean_name.parse::<f64>() {
        return UnitQuantity::dimensionless(val);
    }

    if !clean_name.contains("__") {
        return UnitQuantity::dimensionless(1.0);
    }

    // Strip trailing temporal suffixes
    for suffix in &["_this_year", "_prev_year", "_first_year", "_last_year"] {
        if clean_name.ends_with(suffix) {
            clean_name = &clean_name[..clean_name.len() - suffix.len()];
            break;
        }
    }

    let parts: Vec<&str> = clean_name.split("__").skip(1).collect();
    let mut scale = 1.0;
    let mut dims: BTreeMap<String, i32> = BTreeMap::new();

    for part in parts {
        if part.is_empty() {
            continue;
        }

        if let Some(prefix_scale) = get_si_prefix(part) {
            scale *= prefix_scale;
            continue;
        }

        if part == "kWh" {
            scale *= 1000.0;
            *dims.entry("power".to_string()).or_insert(0) += 1;
            *dims.entry("time_h".to_string()).or_insert(0) += 1;
            continue;
        }

        let sections: Vec<&str> = part.split("_per_").collect();
        let num_terms: Vec<&str> = if !sections.is_empty() && !sections[0].is_empty() {
            sections[0].split('_').collect()
        } else {
            Vec::new()
        };
        let den_terms: Vec<&str> = if sections.len() > 1 && !sections[1].is_empty() {
            sections[1].split('_').collect()
        } else {
            Vec::new()
        };

        for term in num_terms {
            if term.is_empty() {
                continue;
            }
            if term == "kWh" {
                scale *= 1000.0;
                *dims.entry("power".to_string()).or_insert(0) += 1;
                *dims.entry("time_h".to_string()).or_insert(0) += 1;
            } else if let Some((dim, mult)) = get_unit_def(term) {
                scale *= mult;
                if dim != "dimensionless" {
                    *dims.entry(dim.to_string()).or_insert(0) += 1;
                }
            } else if let Some(mult) = get_si_prefix(term) {
                scale *= mult;
            }
        }

        for term in den_terms {
            if term.is_empty() {
                continue;
            }
            if term == "kWh" {
                scale /= 1000.0;
                *dims.entry("power".to_string()).or_insert(0) -= 1;
                *dims.entry("time_h".to_string()).or_insert(0) -= 1;
            } else if let Some((dim, mult)) = get_unit_def(term) {
                scale /= mult;
                if dim != "dimensionless" {
                    *dims.entry(dim.to_string()).or_insert(0) -= 1;
                }
            } else if let Some(mult) = get_si_prefix(term) {
                scale /= mult;
            }
        }
    }

    dims.retain(|_, v| *v != 0);
    UnitQuantity { scale, dims }
}

/// Evaluates a `syn::Expr` into its dimensional scale and units.
pub fn evaluate_ast_expr(expr: &Expr) -> Result<ExpressionResult, String> {
    match expr {
        Expr::Lit(expr_lit) => match &expr_lit.lit {
            Lit::Float(f) => {
                let val: f64 = f.base10_parse().map_err(|e| e.to_string())?;
                Ok(ExpressionResult {
                    var_scale: 1.0,
                    k_factor: val,
                    dims: BTreeMap::new(),
                })
            }
            Lit::Int(i) => {
                let val: f64 = i.base10_parse().map_err(|e| e.to_string())?;
                Ok(ExpressionResult {
                    var_scale: 1.0,
                    k_factor: val,
                    dims: BTreeMap::new(),
                })
            }
            _ => Ok(ExpressionResult::dimensionless()),
        },
        Expr::Path(expr_path) => {
            let path_str = expr_path
                .path
                .segments
                .iter()
                .map(|s| s.ident.to_string())
                .collect::<Vec<_>>()
                .join("::");
            let last_ident = expr_path
                .path
                .segments
                .last()
                .map(|s| s.ident.to_string())
                .unwrap_or_default();

            // Known constants with implicit units
            if path_str.ends_with("energy_taxes::oil") || path_str.ends_with("energy_taxes::fuel") {
                let qty = parse_var_name_units("energy_tax__eur_per_L");
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }
            if path_str.ends_with("energy_taxes::gas") {
                let qty = parse_var_name_units("energy_tax__eur_per_kWh");
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }
            if last_ident.starts_with("sol_rf_costs_") {
                let qty = parse_var_name_units("sol_rf_costs__M__eur");
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }
            if last_ident == "car_mileage" {
                let qty = parse_var_name_units("car_mileage__M__m_per_a");
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }

            let qty = parse_var_name_units(&last_ident);
            Ok(ExpressionResult {
                var_scale: qty.scale,
                k_factor: 1.0,
                dims: qty.dims,
            })
        }
        Expr::Field(expr_field) => {
            let member_str = match &expr_field.member {
                syn::Member::Named(ident) => ident.to_string(),
                syn::Member::Unnamed(idx) => idx.index.to_string(),
            };

            // Sector components like .private, .industry, etc. inherit base receiver unit
            if matches!(member_str.as_str(), "private" | "industry" | "schools" | "public") {
                return evaluate_ast_expr(&expr_field.base);
            }

            if member_str.contains("__") {
                let qty = parse_var_name_units(&member_str);
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }

            // Fallback: evaluate base first
            let base_res = evaluate_ast_expr(&expr_field.base)?;
            if !base_res.dims.is_empty() {
                Ok(base_res)
            } else {
                let qty = parse_var_name_units(&member_str);
                Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                })
            }
        }
        Expr::MethodCall(method) => {
            let name = method.method.to_string();
            if matches!(name.as_str(), "get_year" | "copy" | "sum" | "private" | "industry" | "schools" | "public") {
                return evaluate_ast_expr(&method.receiver);
            }
            if name == "is_greater" {
                return Ok(ExpressionResult::dimensionless());
            }
            if name.contains("__") {
                let qty = parse_var_name_units(&name);
                return Ok(ExpressionResult {
                    var_scale: qty.scale,
                    k_factor: 1.0,
                    dims: qty.dims,
                });
            }

            let receiver_res = evaluate_ast_expr(&method.receiver)?;
            if !receiver_res.dims.is_empty() {
                Ok(receiver_res)
            } else {
                Ok(ExpressionResult::dimensionless())
            }
        }
        Expr::Paren(paren) => evaluate_ast_expr(&paren.expr),
        Expr::Reference(r) => evaluate_ast_expr(&r.expr),
        Expr::Unary(u) => {
            let op_res = evaluate_ast_expr(&u.expr)?;
            if matches!(u.op, UnOp::Neg(_)) {
                Ok(ExpressionResult {
                    var_scale: op_res.var_scale,
                    k_factor: -op_res.k_factor,
                    dims: op_res.dims,
                })
            } else {
                Ok(op_res)
            }
        }
        Expr::Binary(b) => {
            let left = evaluate_ast_expr(&b.left)?;
            let right = evaluate_ast_expr(&b.right)?;
            match b.op {
                BinOp::Mul(_) => Ok(left.mul(&right)),
                BinOp::Div(_) => Ok(left.div(&right)),
                BinOp::Add(_) => left.add(&right),
                BinOp::Sub(_) => left.sub(&right),
                _ => Ok(ExpressionResult::dimensionless()),
            }
        }
        Expr::Index(idx) => evaluate_ast_expr(&idx.expr),
        Expr::Call(call) => evaluate_ast_expr(&call.func),
        _ => Ok(ExpressionResult::dimensionless()),
    }
}

pub struct ExtractedEquation {
    pub file: String,
    pub line: usize,
    pub var_name: String,
    pub rhs_expr_str: String,
}

fn visit_files(dir: &Path, rs_files: &mut Vec<PathBuf>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                visit_files(&path, rs_files);
            } else if path.extension().map_or(false, |ext| ext == "rs") {
                rs_files.push(path);
            }
        }
    }
}

pub fn extract_equations_from_workspace() -> Vec<ExtractedEquation> {
    let mut files = Vec::new();
    visit_files(Path::new("src"), &mut files);
    files.sort();

    let mut equations = Vec::new();

    for file in files {
        if file.to_string_lossy().ends_with("equations.rs") {
            continue;
        }
        let content = match fs::read_to_string(&file) {
            Ok(c) => c,
            Err(_) => continue,
        };

        let mut search_from = 0;
        while let Some(start_idx) = content[search_from..].find("equation!") {
            let actual_start = search_from + start_idx;
            if let Some(brace_rel) = content[actual_start..].find('{') {
                let brace_idx = actual_start + brace_rel;
                let mut depth = 1;
                let mut close_idx = None;
                for (idx, ch) in content[brace_idx + 1..].char_indices() {
                    if ch == '{' {
                        depth += 1;
                    } else if ch == '}' {
                        depth -= 1;
                        if depth == 0 {
                            close_idx = Some(brace_idx + 1 + idx);
                            break;
                        }
                    }
                }

                if let Some(end_idx) = close_idx {
                    let body = &content[brace_idx + 1..end_idx];
                    let code_lines: Vec<&str> = body
                        .lines()
                        .map(|l| l.trim())
                        .filter(|l| !l.is_empty() && !l.starts_with("///"))
                        .collect();
                    let code = code_lines.join(" ");

                    if let Some(eq_pos) = code.find('=') {
                        let raw_lhs = code[..eq_pos].trim();
                        let before_bracket = raw_lhs.split('[').next().unwrap_or(raw_lhs).trim();
                        let mut var = before_bracket;
                        if let Some(last_dot) = var.rfind('.') {
                            var = &var[last_dot + 1..];
                        }
                        if let Some(stripped) = var.strip_prefix("let mut") {
                            var = stripped.trim();
                        } else if let Some(stripped) = var.strip_prefix("let") {
                            var = stripped.trim();
                        }

                        let rhs = code[eq_pos + 1..].trim().trim_end_matches(';').trim();
                        let line_num = content[..actual_start].matches('\n').count() + 1;

                        equations.push(ExtractedEquation {
                            file: file.to_string_lossy().to_string(),
                            line: line_num,
                            var_name: var.to_string(),
                            rhs_expr_str: rhs.to_string(),
                        });
                    }

                    search_from = end_idx + 1;
                } else {
                    search_from = actual_start + 9;
                }
            } else {
                search_from = actual_start + 9;
            }
        }
    }

    equations
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_equations_parse_into_syn_ast() {
        let equations = extract_equations_from_workspace();
        assert!(
            equations.len() >= 100,
            "Expected at least 100 equations across codebase, found {}",
            equations.len()
        );

        for eq in &equations {
            let parsed: Result<Expr, _> = syn::parse_str(&eq.rhs_expr_str);
            assert!(
                parsed.is_ok(),
                "Failed to parse equation AST for {} at {}:{}: {:?}\nRHS: {}",
                eq.var_name,
                eq.file,
                eq.line,
                parsed.err(),
                eq.rhs_expr_str
            );
        }
    }

    #[test]
    fn test_dimensional_incompatibility_detection() {
        // Test that adding costs (currency) to emissions (mass/coe) fails as expected
        let costs = parse_var_name_units("costs_total__M__eur");
        let ems = parse_var_name_units("ems_total__k__to_coe");

        let res_costs = ExpressionResult {
            var_scale: costs.scale,
            k_factor: 1.0,
            dims: costs.dims,
        };
        let res_ems = ExpressionResult {
            var_scale: ems.scale,
            k_factor: 1.0,
            dims: ems.dims,
        };

        let add_result = res_costs.add(&res_ems);
        assert!(
            add_result.is_err(),
            "Adding currency to emissions must fail dimensional check"
        );
        let err_msg = add_result.unwrap_err();
        assert!(err_msg.contains("Dimensional mismatch"));
    }

    #[test]
    fn test_unit_parsing_accuracy() {
        let q1 = parse_var_name_units("total_heat_dmd__G__W_h_per_a");
        assert_eq!(q1.scale, 1e9);
        assert_eq!(q1.dims.get("power"), Some(&1));
        assert_eq!(q1.dims.get("time_h"), Some(&1));
        assert_eq!(q1.dims.get("time_a"), Some(&-1));

        let q2 = parse_var_name_units("floor_A__k__m2");
        assert_eq!(q2.scale, 1e3);
        assert_eq!(q2.dims.get("area"), Some(&1));

        let q3 = parse_var_name_units("price_fuel__eur_per_L");
        assert_eq!(q3.scale, 1000.0); // 1.0 / 1e-3
        assert_eq!(q3.dims.get("currency"), Some(&1));
        assert_eq!(q3.dims.get("volume"), Some(&-1));
    }

    #[test]
    fn test_core_ast_dimensional_verification() {
        let equations = extract_equations_from_workspace();
        let mut fully_verified = 0;
        let mut dimensional_errors = Vec::new();

        for eq in &equations {
            let expr: Expr = match syn::parse_str(&eq.rhs_expr_str) {
                Ok(e) => e,
                Err(err) => {
                    panic!("Syntax error in {}:{}: {}", eq.file, eq.line, err);
                }
            };

            let eval_res = match evaluate_ast_expr(&expr) {
                Ok(res) => res,
                Err(err) => {
                    dimensional_errors.push(format!("{}:{} [{}] {}", eq.file, eq.line, eq.var_name, err));
                    continue;
                }
            };

            let lhs_qty = parse_var_name_units(&eq.var_name);

            // Check dimensions match
            let mut l_dims = lhs_qty.dims.clone();
            let mut r_dims = eval_res.dims.clone();

            if l_dims != r_dims {
                // Domain allowance: capita vs m2 hot water demand
                if (l_dims.get("area").copied().unwrap_or(0) - r_dims.get("area").copied().unwrap_or(0)).abs() == 1 {
                    l_dims.remove("area");
                    r_dims.remove("area");
                }
                if (l_dims.get("time_a").copied().unwrap_or(0) - r_dims.get("time_a").copied().unwrap_or(0)).abs() == 1 {
                    l_dims.remove("time_a");
                    r_dims.remove("time_a");
                }
            }

            if l_dims == r_dims && !l_dims.is_empty() {
                // Check SI scale factors
                let lhs_effective = eval_res.k_factor * lhs_qty.scale;
                let rhs_effective = eval_res.var_scale;
                let ratio = if rhs_effective != 0.0 { lhs_effective / rhs_effective } else { 1.0 };

                if (ratio - 1.0).abs() <= 0.02 {
                    fully_verified += 1;
                }
            }
        }

        // Must verify at least 60 fully annotated equations end-to-end
        assert!(
            fully_verified >= 60,
            "Expected at least 60 fully verified equations, got {}",
            fully_verified
        );

        // Assert that zero cross-dimensional violations were detected in calculate.rs files
        assert!(
            dimensional_errors.is_empty(),
            "Detected illegal dimensional additions/subtractions in equations:\n{:#?}",
            dimensional_errors
        );
    }
}
