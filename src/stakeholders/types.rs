#![allow(non_snake_case)]

use crate::result::Results;

macro_rules! implement_stakeholders {
    ($($field:ident),*) => {
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
                    "industry_profit" => Some(&mut self.industry_profit_from_measures),
                    _ => None,
                }
            }
        }
    };
}

implement_stakeholders! {
    private_invest,
    private_effect_of_measures,
    private_cash_flow_netto,
    industry_invest,
    industry_effect_of_measures,
    industry_profit_from_measures,
    industry_cash_flow_netto,
    community_invest,
    community_effect_of_measures,
    community_tax_income_from_measures,
    community_cash_flow_netto,
    federal_additional_expenses,
    federal_additional_tax_income,
    federal_cash_flow_netto
}
