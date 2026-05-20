"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apDungCaiDatBanDau,
  layNgonNgu,
  layTheme,
  luuNgonNgu,
  luuTheme,
  type AppLang,
  type ThemeMode,
} from "@/lib/caiDatGiaoDien";
import { layTuDien, type Dict } from "@/lib/i18n";

type CaiDatCtx = {
  theme: ThemeMode;
  lang: AppLang;
  t: Dict;
  setTheme: (v: ThemeMode) => void;
  setLang: (v: AppLang) => void;
};

const Ctx = createContext<CaiDatCtx | null>(null);

export function useCaiDat() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCaiDat must be used within NhaCungCapCaiDat");
  }
  return ctx;
}

export default function NhaCungCapCaiDat({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [lang, setLangState] = useState<AppLang>("vi");
  useEffect(() => {
    apDungCaiDatBanDau();
    setThemeState(layTheme());
    setLangState(layNgonNgu());
  }, []);

  const setTheme = useCallback((v: ThemeMode) => {
    setThemeState(v);
    luuTheme(v);
  }, []);

  const setLang = useCallback((v: AppLang) => {
    setLangState(v);
    luuNgonNgu(v);
  }, []);

  const t = useMemo(() => layTuDien(lang), [lang]);

  const value = useMemo(
    () => ({ theme, lang, t, setTheme, setLang }),
    [theme, lang, t, setTheme, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
