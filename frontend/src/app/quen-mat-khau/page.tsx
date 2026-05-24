"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { IconHome } from "@/components/Icons";
import FooterHienDai from "@/components/FooterHienDai";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

type Buoc = "email" | "otp";

const EMAIL_HOP_LE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hopLeEmail(email: string) {
  return EMAIL_HOP_LE.test(email.trim());
}

function IconEmail() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 8l8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOtp() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
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
  );
}

function NoiDungQuenMatKhau() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t: tr } = useCaiDat();
  const a = tr.pages.auth;
  const c = tr.common;
  const [buoc, setBuoc] = useState<Buoc>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  useEffect(() => {
    const tuUrl = searchParams.get("email")?.trim();
    if (tuUrl) setEmail(tuUrl);
  }, [searchParams]);

  const guiOtp = async () => {
    setLoi("");
    setThongBao("");
    const emailChuan = email.trim();
    if (!emailChuan) {
      setLoi(a.emailRequired);
      return;
    }
    if (!hopLeEmail(emailChuan)) {
      setLoi(a.emailInvalid);
      return;
    }
    setDangTai(true);
    try {
      const phanHoi = await api.post("/xac-thuc/quen-mat-khau", {
        email: emailChuan,
      });
      setEmail(emailChuan);
      setThongBao(phanHoi.data.message || a.otpSent);
      if (phanHoi.data.devOtp) {
        setOtp(String(phanHoi.data.devOtp));
      }
      setBuoc("otp");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setLoi(ax?.response?.data?.message || c.failed);
    } finally {
      setDangTai(false);
    }
  };

  const datLaiMk = async () => {
    setLoi("");
    const otpChuan = otp.replace(/\D/g, "");
    if (!otpChuan) {
      setLoi(a.otpRequired);
      return;
    }
    if (otpChuan.length !== 6) {
      setLoi(a.otpInvalid);
      return;
    }
    if (!matKhau.trim() || !xacNhanMatKhau.trim()) {
      setLoi(a.passwordRequired);
      return;
    }
    if (matKhau.length < 6) {
      setLoi(a.passwordMin);
      return;
    }
    if (matKhau !== xacNhanMatKhau) {
      setLoi(a.passwordMismatch);
      return;
    }
    setDangTai(true);
    try {
      await api.post("/xac-thuc/dat-lai-mat-khau", {
        email: email.trim(),
        otp: otpChuan,
        newPassword: matKhau,
      });
      setThongBao(a.resetSuccess);
      setTimeout(() => router.replace("/dang-nhap"), 2500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setLoi(ax?.response?.data?.message || c.failed);
    } finally {
      setDangTai(false);
    }
  };

  const quayLaiGuiOtp = () => {
    setBuoc("email");
    setOtp("");
    setMatKhau("");
    setXacNhanMatKhau("");
    setLoi("");
    setThongBao("");
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
              {a.forgotTitle}
              <br />
              <span>{a.loginTitleAccent}</span>
            </h1>
            <p>{a.forgotLead}</p>
            <p className="login-hint" style={{ marginTop: 8 }}>
              {a.forgotEmailHint}
            </p>
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
                <h2>
                  {buoc === "email" ? a.forgotTitle : a.resetTitle}
                </h2>
                <p>
                  {buoc === "email" ? a.forgotLead : a.otpSent}
                </p>
              </header>

              {buoc === "email" ? (
                <div className="login-form">
                  <div className="login-field">
                    <label htmlFor="email">{a.email}</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon" aria-hidden>
                        <IconEmail />
                      </span>
                      <input
                        id="email"
                        type="text"
                        className="login-input"
                        placeholder={a.emailPh}
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void guiOtp();
                          }
                        }}
                        disabled={dangTai}
                      />
                    </div>
                  </div>

                  {loi ? <div className="login-error">{loi}</div> : null}

                  <button
                    className="btn login-submit"
                    type="button"
                    disabled={dangTai}
                    onClick={() => void guiOtp()}
                  >
                    {dangTai ? c.loading : a.sendOtp}
                  </button>

                  <p className="login-forgot">
                    <Link href="/dang-nhap">← {a.backLogin}</Link>
                  </p>
                </div>
              ) : (
                <div className="login-form">
                  {thongBao ? (
                    <p className="login-success-message">{thongBao}</p>
                  ) : null}

                  <div className="login-field">
                    <label htmlFor="email-readonly">{a.email}</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon" aria-hidden>
                        <IconEmail />
                      </span>
                      <input
                        id="email-readonly"
                        type="text"
                        className="login-input login-input--readonly"
                        value={email}
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="otp">{a.otp}</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon" aria-hidden>
                        <IconOtp />
                      </span>
                      <input
                        id="otp"
                        type="text"
                        className="login-input"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder={a.otpPh}
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void datLaiMk();
                          }
                        }}
                        disabled={dangTai}
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="matKhau">{a.passwordNew}</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon" aria-hidden>
                        <IconLock />
                      </span>
                      <input
                        id="matKhau"
                        type="password"
                        className="login-input"
                        placeholder={a.passwordNewPh}
                        autoComplete="new-password"
                        value={matKhau}
                        onChange={(e) => setMatKhau(e.target.value)}
                        disabled={dangTai}
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="xacNhan">{a.passwordConfirm}</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon" aria-hidden>
                        <IconLock />
                      </span>
                      <input
                        id="xacNhan"
                        type="password"
                        className="login-input"
                        placeholder={a.passwordConfirmPh}
                        autoComplete="new-password"
                        value={xacNhanMatKhau}
                        onChange={(e) => setXacNhanMatKhau(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void datLaiMk();
                          }
                        }}
                        disabled={dangTai}
                      />
                    </div>
                  </div>

                  {loi ? <div className="login-error">{loi}</div> : null}

                  <button
                    className="btn login-submit"
                    type="button"
                    disabled={dangTai}
                    onClick={() => void datLaiMk()}
                  >
                    {dangTai ? c.loading : a.verifyAndReset}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "100%" }}
                    disabled={dangTai}
                    onClick={quayLaiGuiOtp}
                  >
                    {a.resendOtp}
                  </button>

                  <p className="login-forgot">
                    <Link href="/dang-nhap">← {a.backLogin}</Link>
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <FooterHienDai variant="auth" />
    </div>
  );
}

export default function TrangQuenMatKhau() {
  const { t: tr } = useCaiDat();
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <p className="login-hint" style={{ padding: 48, textAlign: "center" }}>
            {tr.common.loading}
          </p>
        </div>
      }
    >
      <NoiDungQuenMatKhau />
    </Suspense>
  );
}
