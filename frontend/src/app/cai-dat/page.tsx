"use client";

import { useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { useToast } from "@/components/NhaCungCapToast";
import { IconCheck } from "@/components/Icons";
import type { AppLang, ThemeMode } from "@/lib/caiDatGiaoDien";

export default function TrangCaiDat() {
  const { theme, lang, t, setTheme, setLang } = useCaiDat();
  const [themeLocal, setThemeLocal] = useState<ThemeMode>(theme);
  const [langLocal, setLangLocal] = useState<AppLang>(lang);
  const { notify } = useToast();

  const luu = () => {
    setTheme(themeLocal);
    setLang(langLocal);
    notify(t.settings.saved, "success");
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-account" style={{ maxWidth: 520 }}>
        <header className="page-top">
          <div className="page-top-text">
            <h1 className="page-heading">{t.settings.title}</h1>
            <p className="page-lead">{t.settings.subtitle}</p>
          </div>
        </header>
        <div className="card">
          <div className="grid" style={{ gap: 20 }}>
            <div>
              <label className="field-label">{t.settings.theme}</label>
              <select
                value={themeLocal}
                onChange={(e) => setThemeLocal(e.target.value as ThemeMode)}
              >
                <option value="light">{t.settings.light}</option>
                <option value="dark">{t.settings.dark}</option>
              </select>
            </div>
            <div>
              <label className="field-label">{t.settings.language}</label>
              <select
                value={langLocal}
                onChange={(e) => setLangLocal(e.target.value as AppLang)}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <button type="button" className="btn" onClick={luu}>
              <IconCheck /> Lưu
            </button>
          </div>
        </div>
      </div>
    </TrangBaoVe>
  );
}
