export type ThemeMode = "light" | "dark";
export type AppLang = "vi" | "en";

const KEY_THEME = "motel_theme";
const KEY_LANG = "motel_lang";

export function layTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(KEY_THEME);
  return v === "dark" ? "dark" : "light";
}

export function luuTheme(theme: ThemeMode) {
  localStorage.setItem(KEY_THEME, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function layNgonNgu(): AppLang {
  if (typeof window === "undefined") return "vi";
  const v = localStorage.getItem(KEY_LANG);
  return v === "en" ? "en" : "vi";
}

export function luuNgonNgu(lang: AppLang) {
  localStorage.setItem(KEY_LANG, lang);
  document.documentElement.lang = lang;
}

export function apDungCaiDatBanDau() {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", layTheme());
  document.documentElement.lang = layNgonNgu();
}
