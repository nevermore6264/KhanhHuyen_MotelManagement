"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TrangBaoVe from "@/components/TrangBaoVe";
import api from "@/lib/api";
import { getName, getRole, getToken, setAuth } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { IconCheck } from "@/components/Icons";
import { nhanVaiTro } from "@/lib/trangThai";

type HoSoCaNhan = {
  id?: string;
  tenDangNhap?: string;
  hoTen?: string;
  soDienThoai?: string;
  email?: string;
  vaiTro?: string;
  kichHoat?: boolean;
  khachThueId?: string;
  soGiayTo?: string;
  diaChi?: string;
};

const vaiTroBadgeClass = (v?: string) => {
  switch (v) {
    case "ADMIN":
      return "profile-badge--admin";
    case "STAFF":
      return "profile-badge--staff";
    case "TENANT":
      return "profile-badge--tenant";
    default:
      return "";
  }
};

const layChuCaiDau = (ten: string) => {
  const parts = ten.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const IconUserProfile = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function TrangHoSoCaNhan() {
  const [hoSo, setHoSo] = useState<HoSoCaNhan | null>(null);
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [soGiayTo, setSoGiayTo] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [dangLuuHoSo, setDangLuuHoSo] = useState(false);
  const [dangDoiMk, setDangDoiMk] = useState(false);
  const { notify } = useToast();
  const { t } = useCaiDat();
  const ac = t.account;

  const laKhachThue = hoSo?.vaiTro === "TENANT" && !!hoSo?.khachThueId;

  const chuCaiAvatar = useMemo(
    () => layChuCaiDau(hoTen || hoSo?.hoTen || getName() || ""),
    [hoTen, hoSo?.hoTen],
  );

  const taiHoSo = useCallback(async () => {
    setDangTai(true);
    try {
      const res = await api.get("/tai-khoan/cua-toi");
      const p = res.data as HoSoCaNhan;
      setHoSo(p);
      setHoTen(p.hoTen ?? "");
      setSoDienThoai(p.soDienThoai ?? "");
      setEmail(p.email ?? "");
      setSoGiayTo(p.soGiayTo ?? "");
      setDiaChi(p.diaChi ?? "");
    } catch {
      notify(ac.errLoad, "error");
    } finally {
      setDangTai(false);
    }
  }, [notify]);

  useEffect(() => {
    taiHoSo();
  }, [taiHoSo]);

  const luuHoSo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      notify(ac.errName, "error");
      return;
    }
    setDangLuuHoSo(true);
    try {
      const res = await api.put("/tai-khoan/cua-toi", {
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim() || null,
        email: email.trim() || null,
        soGiayTo: laKhachThue ? soGiayTo.trim() || null : undefined,
        diaChi: laKhachThue ? diaChi.trim() || null : undefined,
      });
      const data = res.data as { profile?: HoSoCaNhan; message?: string };
      const p = data.profile ?? (res.data as HoSoCaNhan);
      if (p) {
        setHoSo(p);
        const token = getToken();
        const role = getRole();
        if (token && role) {
          setAuth(token, role, p.hoTen ?? hoTen.trim());
        }
      }
      notify(data.message ?? ac.okProfile, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(ax?.response?.data?.message ?? ac.errProfile, "error");
    } finally {
      setDangLuuHoSo(false);
    }
  };

  const doiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhauMoi.length < 6) {
      notify(ac.errPwLen, "error");
      return;
    }
    if (matKhauMoi !== xacNhan) {
      notify(ac.errPwMatch, "error");
      return;
    }
    setDangDoiMk(true);
    try {
      await api.post("/xac-thuc/doi-mat-khau", {
        matKhauCu,
        matKhauMoi,
      });
      setMatKhauCu("");
      setMatKhauMoi("");
      setXacNhan("");
      notify(ac.okPw, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(
        ax?.response?.data?.message ??
          ac.errPw,
        "error",
      );
    } finally {
      setDangDoiMk(false);
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-profile">
        <header className="profile-hero">
          <div className="profile-hero__orb" aria-hidden />
          <div className="profile-hero__avatar" aria-hidden>
            {chuCaiAvatar}
          </div>
          <div className="profile-hero__body">
            <h1 className="profile-hero__title">{ac.title}</h1>
            <p className="profile-hero__lead">{ac.lead}</p>
            {!dangTai && hoSo && (
              <div className="profile-hero__meta">
                <span
                  className={`profile-badge profile-badge--role ${vaiTroBadgeClass(hoSo.vaiTro)}`}
                >
                  {nhanVaiTro(t, hoSo.vaiTro)}
                </span>
                <span
                  className={`profile-badge ${
                    hoSo.kichHoat !== false
                      ? "profile-badge--active"
                      : "profile-badge--inactive"
                  }`}
                >
                  {hoSo.kichHoat !== false ? ac.active : ac.locked}
                </span>
              </div>
            )}
          </div>
        </header>

        <Link href="/cai-dat" className="profile-quick-link">
          <div>
            <strong>{ac.settingsTitle}</strong>
            <span>{ac.settingsHint}</span>
          </div>
          <span className="profile-quick-link__arrow" aria-hidden>
            →
          </span>
        </Link>

        {dangTai ? (
          <div className="profile-loading">
            <div className="profile-skeleton profile-skeleton--aside" />
            <div className="profile-skeleton profile-skeleton--main" />
          </div>
        ) : (
          <div className="profile-layout">
            <aside className="profile-aside">
              <div className="profile-aside__avatar-lg" aria-hidden>
                {chuCaiAvatar}
              </div>
              <p className="profile-aside__name">
                {hoTen.trim() || hoSo?.hoTen || "—"}
              </p>
              <p className="profile-aside__user">@{hoSo?.tenDangNhap || "—"}</p>
              <div className="profile-aside__badges">
                <span
                  className={`profile-badge profile-badge--role ${vaiTroBadgeClass(hoSo?.vaiTro)}`}
                >
                  {nhanVaiTro(t, hoSo?.vaiTro)}
                </span>
              </div>
              <ul className="profile-info-list">
                <li>
                  <span>{ac.username}</span>
                  <strong>{hoSo?.tenDangNhap || "—"}</strong>
                </li>
                <li>
                  <span>{ac.email}</span>
                  <strong>{email.trim() || t.common.notSet}</strong>
                </li>
                <li>
                  <span>{ac.phone}</span>
                  <strong>{soDienThoai.trim() || t.common.notSet}</strong>
                </li>
                {laKhachThue && (
                  <>
                    <li>
                      <span>{ac.idDoc}</span>
                      <strong>{soGiayTo.trim() || t.common.notSet}</strong>
                    </li>
                    <li>
                      <span>{ac.address}</span>
                      <strong>{diaChi.trim() || t.common.notSet}</strong>
                    </li>
                  </>
                )}
              </ul>
            </aside>

            <div className="profile-main">
              <section className="profile-card">
                <div className="profile-card__head">
                  <div>
                    <h2 className="profile-card__title">{ac.general}</h2>
                    <p className="profile-card__hint">{ac.generalHint}</p>
                  </div>
                  <div className="profile-card__icon" aria-hidden>
                    <IconUserProfile />
                  </div>
                </div>
                <form onSubmit={luuHoSo} className="profile-form-grid">
                  <div className="profile-field">
                    <label htmlFor="profile-username">{ac.username}</label>
                    <input
                      id="profile-username"
                      value={hoSo?.tenDangNhap ?? ""}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-role">{ac.role}</label>
                    <input
                      id="profile-role"
                      value={nhanVaiTro(t, hoSo?.vaiTro)}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="profile-field profile-field--full">
                    <label htmlFor="profile-name">{ac.fullName}</label>
                    <input
                      id="profile-name"
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      placeholder={ac.fullNamePh}
                      required
                    />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-phone">{ac.phone}</label>
                    <input
                      id="profile-phone"
                      value={soDienThoai}
                      onChange={(e) => setSoDienThoai(e.target.value)}
                      placeholder={ac.phonePh}
                    />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-email">{ac.email}</label>
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  {laKhachThue && (
                    <>
                      <div className="profile-field">
                        <label htmlFor="profile-id">{ac.idDoc}</label>
                        <input
                          id="profile-id"
                          value={soGiayTo}
                          onChange={(e) => setSoGiayTo(e.target.value)}
                          placeholder={ac.idPh}
                        />
                      </div>
                      <div className="profile-field profile-field--full">
                        <label htmlFor="profile-address">{ac.address}</label>
                        <input
                          id="profile-address"
                          value={diaChi}
                          onChange={(e) => setDiaChi(e.target.value)}
                          placeholder={ac.addressPh}
                        />
                      </div>
                    </>
                  )}
                  <div className="profile-form-actions">
                    <button className="btn" type="submit" disabled={dangLuuHoSo}>
                      <IconCheck />{" "}
                      {dangLuuHoSo ? t.common.saving : ac.saveProfile}
                    </button>
                  </div>
                </form>
              </section>

              <section className="profile-card profile-card--password">
                <div className="profile-card__head">
                  <div>
                    <h2 className="profile-card__title">{ac.security}</h2>
                    <p className="profile-card__hint">{ac.securityHint}</p>
                  </div>
                  <div className="profile-card__icon" aria-hidden>
                    <IconLock />
                  </div>
                </div>
                <form onSubmit={doiMatKhau} className="profile-form-grid">
                  <div className="profile-field profile-field--full">
                    <label htmlFor="profile-pw-old">{ac.currentPw}</label>
                    <input
                      id="profile-pw-old"
                      type="password"
                      value={matKhauCu}
                      onChange={(e) => setMatKhauCu(e.target.value)}
                      placeholder={ac.currentPwPh}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-pw-new">{ac.newPw}</label>
                    <input
                      id="profile-pw-new"
                      type="password"
                      value={matKhauMoi}
                      onChange={(e) => setMatKhauMoi(e.target.value)}
                      placeholder={ac.newPwPh}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-pw-confirm">{ac.confirmPw}</label>
                    <input
                      id="profile-pw-confirm"
                      type="password"
                      value={xacNhan}
                      onChange={(e) => setXacNhan(e.target.value)}
                      placeholder={ac.confirmPwPh}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button
                      className="btn btn-secondary"
                      type="submit"
                      disabled={dangDoiMk}
                    >
                      <IconCheck />{" "}
                      {dangDoiMk ? ac.changingPw : ac.changePw}
                    </button>
                  </div>
                </form>
                <div className="profile-security-tips">
                  <strong>{ac.tipsTitle}</strong>
                  <ul>
                    <li>{ac.tip1}</li>
                    <li>{ac.tip2}</li>
                    <li>{ac.tip3}</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
