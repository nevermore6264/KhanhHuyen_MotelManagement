import en from "./en";
import vi from "./vi";
import type { AppLang } from "../caiDatGiaoDien";

const dict = { vi, en } as const;

export type Dict = typeof vi;

export function layTuDien(lang: AppLang): Dict {
  return dict[lang];
}
