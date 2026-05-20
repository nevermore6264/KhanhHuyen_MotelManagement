import type { AppLang } from "./caiDatGiaoDien";

export function layLocaleTag(lang: AppLang): string {
  return lang === "en" ? "en-US" : "vi-VN";
}

export function dinhDangSo(value: number, lang: AppLang): string {
  return new Intl.NumberFormat(layLocaleTag(lang)).format(value);
}

export function dinhDangTien(
  value: number,
  lang: AppLang,
  opts?: { short?: boolean },
): string {
  const n = Math.round(Number(value));
  const formatted = dinhDangSo(n, lang);
  if (lang === "en") {
    return opts?.short ? `${formatted} VND` : `${formatted} VND`;
  }
  return opts?.short ? `${formatted} đ` : `${formatted} VNĐ`;
}

export function dinhDangNgay(dateStr?: string, lang: AppLang = "vi"): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(layLocaleTag(lang));
}

export function dinhDangThangNam(
  month: number,
  year: number,
  lang: AppLang,
): string {
  if (lang === "en") {
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return `Tháng ${month}/${year}`;
}
