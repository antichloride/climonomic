#![allow(non_snake_case)]

pub mod types;
mod calculate;

pub use types::*;

use crate::result::Results;

// Getters for cross-sector calculations
impl Economy {
    pub fn turnover_local__M__eur(&self) -> &Results {
        &self.turnover_local__M__eur_per_a
    }
    pub fn income_tax_local__M__eur(&self) -> &Results {
        &self.income_tax_local__M__eur_per_a
    }
    pub fn business_tax_local__M__eur(&self) -> &Results {
        &self.business_tax_local__M__eur_per_a
    }
    pub fn income_tax_national__M__eur(&self) -> &Results {
        &self.income_tax_national__M__eur_per_a
    }
    pub fn turnover_tax_national__M__eur(&self) -> &Results {
        &self.turnover_tax_national__M__eur_per_a
    }
    pub fn business_tax_national__M__eur(&self) -> &Results {
        &self.business_tax_national__M__eur_per_a
    }
    pub fn corporate_tax_national__M__eur(&self) -> &Results {
        &self.corporate_tax_national__M__eur_per_a
    }
    pub fn energy_tax_national__M__eur(&self) -> &Results {
        &self.energy_tax_national__M__eur_per_a
    }
}
