#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let quit: CustomMenuItem = CustomMenuItem::new("quit".to_string(), "退出");
    let submenu: Submenu = Submenu::new("文件", Menu::new().add_item(quit));
    let menu: Menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "隐藏"))
        .add_submenu(submenu);

    let system_tray_menu_item_quit: CustomMenuItem = CustomMenuItem::new("quit".to_string(), "退出");
    let system_tray_menu: SystemTrayMenu = SystemTrayMenu::new().add_item(system_tray_menu_item_quit);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "quit" => std::process::exit(0),
            _ => {}
        })
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
