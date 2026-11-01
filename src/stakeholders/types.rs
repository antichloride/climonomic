#![allow(non_snake_case)]

use crate::result::Results;

macro_rules! implement_stakeholders {
    ($($field:ident),* $(,)?) => {
        #[derive(serde::Serialize)]
        pub struct Stakeholders {
            #[serde(skip)]
            pub(crate) start_year: u32,
            $(
                pub $field: Results,
            )*
        }

        impl Stakeholders {
            pub fn new(start_year: u32, end_year: u32) -> Stakeholders {
                Stakeholders {
                    start_year,
                    $(
                        $field: Results::new(
                            "stakeholders/results/".to_owned() + stringify!($field),
                            start_year,
                            end_year,
                        ),
                    )*
                }
            }

            pub fn get_results(&self) -> Vec<&Results> {
                let mut results: Vec<&Results> = Vec::from([]);
                $(
                    results.push(&self.$field);
                )*
                results
            }

            pub fn get_results_by_id(&mut self, id: &str) -> Option<&mut Results> {
                match id {
                    $(
                        stringify!($field) => Some(&mut self.$field),
                    )*
                    _ => None,
                }
            }
        }
    };
}

implement_stakeholders! {
    private_invest__M__eur_per_a,
    private_effect_of_measures__M__eur_per_a,
    private_cash_flow_netto__M__eur_per_a,
    industry_invest__M__eur_per_a,
    industry_effect_of_measures__M__eur_per_a,
    industry_profit_from_measures__M__eur_per_a,
    industry_cash_flow_netto__M__eur_per_a,
    community_invest__M__eur_per_a,
    community_effect_of_measures__M__eur_per_a,
    community_tax_income_from_measures__M__eur_per_a,
    community_cash_flow_netto__M__eur_per_a,
    federal_additional_expenses__M__eur_per_a,
    federal_additional_tax_income__M__eur_per_a,
    federal_cash_flow_netto__M__eur_per_a
}
