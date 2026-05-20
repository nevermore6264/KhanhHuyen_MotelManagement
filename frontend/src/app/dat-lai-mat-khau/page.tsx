"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

function FormDatLaiMatKhau() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t: tr } = useCaiDat();
  const a = tr.pages.auth;
  const c = tr.common;
  const s = tr.pages.shared;
  const token = searchParams.get("token") || "";
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [thanhCong, setThanhCong] = useState(false);

  useEffect(() => {
    if (!token) setLoi(a.forgotLead);
  }, [token, a.forgotLead]);

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");
    if (!token) return;
    if (matKhau.length < 6) {
      setLoi(s.requiredHint);
      return;
    }
    if (matKhau !== xacNhanMatKhau) {
      setLoi(c.failed);
      return;
    }
    setDangTai(true);
    try {
      await api.post("/xac-thuc/dat-lai-mat-khau", {
        token,
        newPassword: matKhau,
      });
      setThanhCong(true);
      setTimeout(() => router.replace("/dang-nhap"), 2000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setLoi(ax?.response?.data?.message || c.failed);
    } finally {
      setDangTai(false);
    }
  };

  if (thanhCong) {
    return (
      <div className="login-success-box">
        <p className="login-success-message">
          {a.resetTitle} — {s.redirecting}
        </p>
        <Link
          href="/dang-nhap"
          className="btn login-btn"
          style={{ marginTop: "1rem" }}
        >
          {a.signIn}
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="login-success-box">
        <p className="login-error">{a.forgotLead}</p>
        <Link
          href="/quen-mat-khau"
          className="btn login-btn"
          style={{ marginTop: "1rem" }}
        >
          {a.forgotTitle}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={gui} className="login-form">
      <div className="login-field">
        <label htmlFor="matKhau">{a.password}</label>
        <div className="input-icon-wrap">
          <span className="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 10V8a4 4 0 0 1 8 0v2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="matKhau"
            type="password"
            placeholder={a.password}
            autoComplete="new-password"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            disabled={dangTai}
          />
        </div>
      </div>
      <div className="login-field">
        <label htmlFor="xacNhanMatKhau">{a.password}</label>
        <div className="input-icon-wrap">
          <span className="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 10V8a4 4 0 0 1 8 0v2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="xacNhanMatKhau"
            type="password"
            placeholder={a.password}
            autoComplete="new-password"
            value={xacNhanMatKhau}
            onChange={(e) => setXacNhanMatKhau(e.target.value)}
            disabled={dangTai}
          />
        </div>
      </div>
      {loi && <div className="login-error">{loi}</div>}
      <button className="btn login-btn" type="submit" disabled={dangTai}>
        {dangTai ? c.loading : a.resetTitle}
      </button>
      <p className="login-forgot-wrap">
        <Link href="/dang-nhap" className="login-forgot-link">
          ← {a.backLogin}
        </Link>
      </p>
    </form>
  );
}

export default function TrangDatLaiMatKhau() {
  const { t: tr } = useCaiDat();
  const a = tr.pages.auth;
  const c = tr.common;

  return (
    <div className="login-page">
      <div className="login-orbits" aria-hidden="true">
        <span className="login-orbit orbit-1" />
        <span className="login-orbit orbit-2" />
        <span className="login-orbit orbit-3" />
      </div>
      <header className="login-header">
        <div className="login-header-brand">
          <img src="/logo.svg" alt="iTro" />
          <div>
            <strong>iTro</strong>
            <span>{a.loginTitle}</span>
          </div>
        </div>
      </header>
      <div className="login-shell login-shell--single">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-title">
              <img src="/logo.svg" alt="iTro" className="login-title-logo" />
              <span>iTro</span>
            </div>
            <span className="login-subtitle">{a.resetTitle}</span>
          </div>
          <Suspense fallback={<p className="login-forgot-desc">{c.loading}</p>}>
            <FormDatLaiMatKhau />
          </Suspense>
        </div>
      </div>
      <footer className="login-footer">
        <span>© 2026 iTro. All rights reserved.</span>
      </footer>
    </div>
  );
}
