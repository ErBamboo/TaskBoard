fn main() {
    println!("cargo:rerun-if-env-changed=NEXT_PUBLIC_DESKTOP_APP_URL");

    if let Ok(desktop_app_url) = std::env::var("NEXT_PUBLIC_DESKTOP_APP_URL") {
        println!("cargo:rustc-env=DESKTOP_APP_URL={desktop_app_url}");
    }

    tauri_build::build()
}
