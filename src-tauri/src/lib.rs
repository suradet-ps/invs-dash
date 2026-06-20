mod db;
mod commands;

use db::DbState;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(DbState(Arc::new(Mutex::new(None))))
        .invoke_handler(tauri::generate_handler![
            commands::connect_invs_db,
            commands::get_drug_monthly_value,
            commands::get_top_drugs_by_value,
            commands::get_available_years,
            commands::get_drug_list,
            commands::get_year_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
