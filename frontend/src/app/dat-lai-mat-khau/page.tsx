"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Link đặt lại mật khẩu không hợp lệ (thiếu token).");
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) return;
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/xac-thuc/dat-lai-mat-khau", {
        token,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => router.replace("/dang-nhap"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-success-box">
        <p className="login-success-message">
          Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập…
        </p>
        <Link
          href="/dang-nhap"
          className="btn login-btn"
          style={{ marginTop: "1rem" }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="login-success-box">
        <p className="login-error">
          Link đặt lại mật khẩu không hợp lệ. Vui lòng thử lại từ trang quên mật
          khẩu.
        </p>
        <Link
          href="/quen-mat-khau"
          className="btn login-btn"
          style={{ marginTop: "1rem" }}
        >
          Quên mật khẩu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="login-form">
      <div className="login-field">
        <label htmlFor="password">Mật khẩu mới</label>
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
            id="password"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="login-field">
        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
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
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      {error && <div className="login-error">{error}</div>}
      <button className="btn login-btn" type="submit" disabled={loading}>
        {loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}
      </button>
      <p className="login-forgot-wrap">
        <Link href="/dang-nhap" className="login-forgot-link">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <span>Hệ thống quản lý nhà trọ</span>
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
            <span className="login-subtitle">Đặt lại mật khẩu</span>
          </div>
          <Suspense fallback={<p className="login-forgot-desc">Đang tải…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <footer className="login-footer">
        <span>© 2026 iTro. All rights reserved.</span>
      </footer>
    </div>
  );
}
