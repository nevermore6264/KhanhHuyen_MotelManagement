"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dangXuatApp, getName, getRole } from "@/lib/auth";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { layMenuNav } from "@/lib/layMenuNav";
import ChuongPopoverThongBao from "./ChuongPopoverThongBao";
import { IconLogout, IconSettings } from "./Icons";

function layChuCai(ten: string) {
  const p = ten.trim().charAt(0);
  return p ? p.toUpperCase() : "U";
}

export default function ThanhDieuHuong() {
  const pathname = usePathname();
  const { t, lang } = useCaiDat();
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const [ten, setTen] = useState("User");

  useEffect(() => {
    setVaiTro(getRole() || "ADMIN");
    setTen(getName() || "User");
  }, [lang]);

  const menu = useMemo(
    () => (vaiTro != null ? layMenuNav(vaiTro, t.menu) : []),
    [vaiTro, t.menu, lang],
  );

  const hienThiChuong = vaiTro === "TENANT" || vaiTro === "STAFF";

  const active = (href: string) =>
    pathname === href || (href !== "/tong-quan" && pathname.startsWith(href));

  const nhomActive = (nhom: (typeof menu)[0]) => {
    if (nhom.href) return active(nhom.href);
    return nhom.items?.some((m) => active(m.href)) ?? false;
  };

  const linkClass = (href: string, extra = "") =>
    `app-navbar__link${active(href) ? " app-navbar__link--active" : ""}${extra ? ` ${extra}` : ""}`;

  const tenVaiTro =
    vaiTro && vaiTro in t.roles
      ? t.roles[vaiTro as keyof typeof t.roles]
      : vaiTro ?? "";

  return (
    <header className="app-navbar">
      <div className="app-navbar__inner">
        <Link href="/tong-quan" className="app-navbar__brand">
          <Image
            className="app-navbar__logo"
            src="/logo.svg"
            alt="iTro"
            width={36}
            height={36}
            priority
          />
          <span className="app-navbar__brand-text">
            <strong>iTro</strong>
            <small>{t.brand.subtitle}</small>
          </span>
        </Link>

        <nav className="app-navbar__menu" aria-label={t.aria.mainMenu}>
          {menu.map((nhom) => (
            <div key={nhom.label} className="app-navbar__item">
              {nhom.href ? (
                <Link href={nhom.href} className={linkClass(nhom.href)}>
                  {nhom.label}
                </Link>
              ) : (
                <>
                  <span
                    className={`app-navbar__link app-navbar__link--group${nhomActive(nhom) ? " app-navbar__link--active" : ""}`}
                    tabIndex={0}
                  >
                    {nhom.label}
                  </span>
                  <div className="app-navbar__dropdown">
                    {nhom.items?.map((muc) => (
                      <Link
                        key={muc.href}
                        href={muc.href}
                        className={active(muc.href) ? "active" : ""}
                      >
                        {muc.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="app-navbar__actions">
          {hienThiChuong ? <ChuongPopoverThongBao /> : null}

          <span className="app-navbar__divider" aria-hidden />

          <Link href="/cai-dat" className="app-navbar__ghost">
            <IconSettings />
            <span>{t.nav.settings}</span>
          </Link>

          <Link href="/tai-khoan" className="app-navbar__user">
            <span className="app-navbar__avatar" aria-hidden>
              {layChuCai(ten)}
            </span>
            <span className="app-navbar__user-meta">
              <strong>{ten}</strong>
              <small>{tenVaiTro}</small>
            </span>
          </Link>

          <button
            type="button"
            className="app-navbar__logout"
            onClick={() => dangXuatApp()}
            aria-label={t.aria.logout}
          >
            <IconLogout />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
