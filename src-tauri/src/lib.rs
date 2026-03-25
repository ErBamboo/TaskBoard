use tauri::webview::WebviewWindowBuilder;
use tauri::{Manager, Url, WebviewUrl};

const DEFAULT_DEVELOPMENT_URL: &str = "http://127.0.0.1:3000";
const DEFAULT_PRODUCTION_URL: &str = "https://task-board.example.com";

fn resolve_desktop_app_url() -> &'static str {
  option_env!("DESKTOP_APP_URL").unwrap_or(if cfg!(debug_assertions) {
    DEFAULT_DEVELOPMENT_URL
  } else {
    DEFAULT_PRODUCTION_URL
  })
}

fn build_desktop_user_agent() -> String {
  format!("RobotTaskBoardDesktop/{}", env!("CARGO_PKG_VERSION"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let desktop_app_url = Url::parse(resolve_desktop_app_url())?;

      if app.get_webview_window("main").is_none() {
        WebviewWindowBuilder::new(app, "main", WebviewUrl::External(desktop_app_url))
          .title("Robot Task Board")
          .inner_size(1440.0, 900.0)
          .min_inner_size(1280.0, 760.0)
          .resizable(true)
          .user_agent(&build_desktop_user_agent())
          .build()?;
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
  use super::build_desktop_user_agent;

  #[test]
  fn desktop_user_agent_uses_package_version() {
    assert_eq!(
      build_desktop_user_agent(),
      format!("RobotTaskBoardDesktop/{}", env!("CARGO_PKG_VERSION"))
    );
  }
}
