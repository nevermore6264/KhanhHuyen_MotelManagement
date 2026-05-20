"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TrangBaoVe from "@/components/TrangBaoVe";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { useToast } from "@/components/NhaCungCapToast";
import { IconCheck, IconSettings } from "@/components/Icons";
import type { AppLang, ThemeMode } from "@/lib/caiDatGiaoDien";

function ThemePreview({ mode }: { mode: ThemeMode }) {
  return (
    <div
      className={`settings-option__preview settings-option__preview--${mode}`}
      aria-hidden
    >
      <div className={`settings-preview-bar settings-preview-bar--${mode}`} />
      <div className="settings-preview-body">
        <span className="settings-preview-line" />
        <span className="settings-preview-line settings-preview-line--short" />
        <span className="settings-preview-line" />
      </div>
    </div>
  );
}

export default function TrangCaiDat() {
  const { theme, lang, t, setTheme, setLang } = useCaiDat();
  const [themeLocal, setThemeLocal] = useState<ThemeMode>(theme);
  const [langLocal, setLangLocal] = useState<AppLang>(lang);
  const { notify } = useToast();

  useEffect(() => {
    setThemeLocal(theme);
    setLangLocal(lang);
  }, [theme, lang]);

  const coThayDoi = themeLocal !== theme || langLocal !== lang;

  const hoanTac = () => {
    setThemeLocal(theme);
    setLangLocal(lang);
  };

  const luu = () => {
    setTheme(themeLocal);
    setLang(langLocal);
    notify(t.settings.saved, "success");
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-settings">
        <header className="settings-hero">
          <div className="settings-hero__icon" aria-hidden>
            <IconSettings />
          </div>
          <div>
            <h1 className="settings-hero__title">{t.settings.title}</h1>
            <p className="settings-hero__lead">{t.settings.subtitle}</p>
          </div>
        </header>

        <Link href="/tai-khoan" className="settings-profile-link">
          <div className="settings-profile-link__text">
            <strong>{t.settings.goProfile}</strong>
            <span>{t.settings.profileHint}</span>
          </div>
          <span className="settings-profile-link__arrow" aria-hidden>
            →
          </span>
        </Link>

        <section className="settings-card">
          <h2 className="settings-card__title">{t.settings.theme}</h2>
          <p className="settings-card__hint">{t.settings.themeHint}</p>
          <div
            className="settings-picker settings-picker--theme"
            role="radiogroup"
            aria-label={t.settings.theme}
          >
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={themeLocal === mode}
                className={`settings-option${themeLocal === mode ? " is-active" : ""}`}
                onClick={() => setThemeLocal(mode)}
              >
                <ThemePreview mode={mode} />
                <div className="settings-option__row">
                  <span className="settings-option__label">
                    {mode === "light" ? t.settings.light : t.settings.dark}
                  </span>
                  <span className="settings-option__check" aria-hidden>
                    <IconCheck />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <h2 className="settings-card__title">{t.settings.language}</h2>
          <p className="settings-card__hint">{t.settings.langHint}</p>
          <div
            className="settings-picker settings-picker--lang"
            role="radiogroup"
            aria-label={t.settings.language}
          >
            {(
              [
                { value: "vi" as const, flag: "🇻🇳", name: t.lang.vi },
                { value: "en" as const, flag: "🇬🇧", name: t.lang.en },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={langLocal === opt.value}
                className={`settings-option${langLocal === opt.value ? " is-active" : ""}`}
                onClick={() => setLangLocal(opt.value)}
              >
                <span className="settings-lang-flag" aria-hidden>
                  {opt.flag}
                </span>
                <div className="settings-option__row">
                  <div>
                    <div className="settings-lang-name">{opt.name}</div>
                    <div className="settings-lang-code">{opt.value}</div>
                  </div>
                  <span className="settings-option__check" aria-hidden>
                    <IconCheck />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="settings-footer">
          <span
            className={`settings-footer__status${coThayDoi ? " is-dirty" : ""}`}
          >
            {coThayDoi ? t.settings.unsaved : t.settings.noChanges}
          </span>
          <div className="settings-footer__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={hoanTac}
              disabled={!coThayDoi}
            >
              {t.settings.reset}
            </button>
            <button
              type="button"
              className="btn"
              onClick={luu}
              disabled={!coThayDoi}
            >
              <IconCheck /> {t.settings.save}
            </button>
          </div>
        </footer>
      </div>
    </TrangBaoVe>
  );
}
