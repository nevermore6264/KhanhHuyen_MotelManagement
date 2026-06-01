"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { IconHome } from "@/components/Icons";
import FooterHienDai from "@/components/FooterHienDai";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

export default function TrangDangNhap() {
  const router = useRouter();
  const { t: tr } = useCaiDat();
  const a = tr.pages.auth;
  const [tenDangNhap, setTenDangNhap] = useState("admin");
  const [matKhau, setMatKhau] = useState("admin123");
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");
    setDangGui(true);
    try {
      const phanHoi = await api.post("/xac-thuc/dang-nhap", {
        tenDangNhap,
        matKhau,
      });
      setAuth(
        phanHoi.data.token,
        phanHoi.data.vaiTro,
        phanHoi.data.hoTen,
        phanHoi.data.nguoiDungId,
      );
      router.replace("/tong-quan");
    } catch {
      setLoi(a.errLogin);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__bg" aria-hidden>
        <div className="login-page__blob login-page__blob--1" />
        <div className="login-page__blob login-page__blob--2" />
      </div>

      <Link href="/" className="login-back-home">
        <IconHome />
        {a.backHome}
      </Link>

      <div className="login-page__main">
        <div className="login-layout">
          <section className="login-panel-hero">
            <h1>
              {a.loginTitle}
              <br />
              <span>{a.loginTitleAccent}</span>
            </h1>
            <p>{a.loginLead}</p>

            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  🏠
                </span>
                <div>
                  <strong>{a.feat1Title}</strong>
                  <span>{a.feat1Desc}</span>
                </div>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  🔔
                </span>
                <div>
                  <strong>{a.feat2Title}</strong>
                  <span>{a.feat2Desc}</span>
                </div>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  📊
                </span>
                <div>
                  <strong>{a.feat3Title}</strong>
                  <span>{a.feat3Desc}</span>
                </div>
              </div>
            </div>

            <div className="login-stats-row">
              <div className="login-stat-pill">
                <strong>24/7</strong>
                <span>{a.support247}</span>
              </div>
              <div className="login-stat-pill">
                <strong>3</strong>
                <span>
                  {tr.roles.ADMIN} · {tr.roles.STAFF} · {tr.roles.TENANT}
                </span>
              </div>
            </div>
          </section>

          <section className="login-panel-form">
            <div className="login-card">
              <header className="login-card-head">
                <Image
                  src="/logo.svg"
                  alt="iTro"
                  width={52}
                  height={52}
                  className="login-card-logo"
                  priority
                />
                <h2>{a.signIn}</h2>
                <p>{a.loginLead}</p>
              </header>

              <form onSubmit={gui} className="login-form">
                <div className="login-field">
                  <label htmlFor="username">{a.username}</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M4 20a8 8 0 0 1 16 0"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <input
                      id="username"
                      className="login-input"
                      placeholder={a.username}
                      autoComplete="username"
                      value={tenDangNhap}
                      onChange={(e) => setTenDangNhap(e.target.value)}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="password">{a.password}</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M8 10V8a4 4 0 0 1 8 0v2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <input
                      id="password"
                      className="login-input"
                      type="password"
                      placeholder={a.password}
                      autoComplete="current-password"
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                    />
                  </div>
                </div>

                {loi && <div className="login-error">{loi}</div>}

                <button
                  className="btn login-submit"
                  type="submit"
                  disabled={dangGui}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {dangGui ? a.signingIn : a.signIn}
                </button>

                <p className="login-forgot">
                  <Link href="/quen-mat-khau">{a.forgotPw}</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>

      <FooterHienDai variant="auth" />
    </div>
  );
}
