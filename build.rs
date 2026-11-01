use std::env;
use std::fs;
use std::path::{Path, PathBuf};

fn visit_dirs(dir: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                visit_dirs(&path, files)?;
            } else if path.extension().map_or(false, |ext| ext == "rs") {
                files.push(path);
            }
        }
    }
    Ok(())
}

fn parse_equations(content: &str, sector: &str) -> Vec<(String, String, String, String)> {
    let mut results = Vec::new();
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
                let mut doc_lines = Vec::new();
                let mut code_lines = Vec::new();

                for line in body.lines() {
                    let trimmed = line.trim();
                    if trimmed.starts_with("///") {
                        doc_lines.push(trimmed.trim_start_matches("///").trim().to_string());
                    } else if !trimmed.is_empty() {
                        code_lines.push(trimmed.to_string());
                    }
                }

                let doc = doc_lines.join(" ");
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
                    let formula = code[eq_pos + 1..].trim().trim_end_matches(';').trim();

                    if !var.is_empty() && !formula.is_empty() {
                        results.push((var.to_string(), sector.to_string(), doc, formula.to_string()));
                    }
                }

                search_from = end_idx + 1;
            } else {
                search_from = actual_start + 9;
            }
        } else {
            search_from = actual_start + 9;
        }
    }

    results
}

fn main() {
    println!("cargo:rerun-if-changed=src");

    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("equations.rs");

    let mut files = Vec::new();
    let src_dir = Path::new("src");
    if src_dir.exists() {
        let _ = visit_dirs(src_dir, &mut files);
    }

    // Sort files deterministically
    files.sort();

    let mut all_eqs = Vec::new();

    for file in files {
        let path_str = file.to_string_lossy();
        if path_str.ends_with("equations.rs") {
            continue;
        }

        let sector = if path_str.contains("buildings") {
            "buildings"
        } else if path_str.contains("energy") {
            "energy"
        } else if path_str.contains("mobility") {
            "mobility"
        } else if path_str.contains("economy") {
            "economy"
        } else if path_str.contains("stakeholders") {
            "stakeholders"
        } else {
            "general"
        };

        if let Ok(content) = fs::read_to_string(&file) {
            let eqs = parse_equations(&content, sector);
            all_eqs.extend(eqs);
        }
    }

    let mut out = String::new();
    out.push_str("pub static EQUATIONS: &[EquationMetadata] = &[\n");
    for (id, sector, doc, formula) in all_eqs {
        let escaped_doc = doc.replace('\\', "\\\\").replace('\"', "\\\"");
        let escaped_formula = formula.replace('\\', "\\\\").replace('\"', "\\\"");
        out.push_str(&format!(
            "    EquationMetadata {{\n        id: \"{id}\",\n        sector: \"{sector}\",\n        description: \"{escaped_doc}\",\n        formula: \"{escaped_formula}\",\n    }},\n"
        ));
    }
    out.push_str("];\n");

    fs::write(&dest_path, out).unwrap();
}
