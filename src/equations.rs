use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EquationMetadata {
    pub id: &'static str,
    pub sector: &'static str,
    pub description: &'static str,
    pub formula: &'static str,
}

/// Local statement macro for calculation code.
/// Expands directly into standard Rust assignments while making the equation
/// and its docstring discoverable by build.rs without duplicate catalogs.
#[macro_export]
macro_rules! equation {
    // Form 1: results.var[year] = expr;
    (
        $(#[doc = $doc:expr])*
        $target:ident . $id:ident [ $year:expr ] = $expr:expr;
    ) => {
        let $id = $expr;
        $target.$id.set_year_values($year, &$id);
    };

    // Form 2: var = expr; (pure local assignment without setting results)
    (
        $(#[doc = $doc:expr])*
        $id:ident = $expr:expr;
    ) => {
        let $id = $expr;
    };

    // Form 3: let var = expr;
    (
        $(#[doc = $doc:expr])*
        let $id:ident = $expr:expr;
    ) => {
        let $id = $expr;
    };

    // Form 4: let mut var = expr;
    (
        $(#[doc = $doc:expr])*
        let mut $id:ident = $expr:expr;
    ) => {
        let mut $id = $expr;
    };
}

// Automatically generated at compile-time by build.rs from equation! macros in src/**/calculate.rs
include!(concat!(env!("OUT_DIR"), "/equations.rs"));

/// Returns metadata for a specific equation / variable ID
pub fn get_equation_metadata(id: &str) -> Option<&'static EquationMetadata> {
    let clean_id = id.rsplit('/').next().unwrap_or(id);
    EQUATIONS.iter().find(|eq| eq.id == clean_id)
}

/// Returns metadata for all registered equations in the engine
pub fn list_equations() -> &'static [EquationMetadata] {
    EQUATIONS
}
