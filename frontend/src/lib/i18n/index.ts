import en from "./en";
import vi from "./vi";
import type { AppLang } from "../caiDatGiaoDien";

const dict = { vi, en } as const;

export type Dict = (typeof dict)[AppLang];

export function layTuDien(lang: AppLang): Dict {
  return dict[lang];
}

export function thayMauChuoi(
  mau: string,
  vars: Record<string, string | number>,
): string {
  let ketQua = mau;
  for (const [k, v] of Object.entries(vars)) {
    ketQua = ketQua.split(`{${k}}`).join(String(v));
  }
  return ketQua;
}
