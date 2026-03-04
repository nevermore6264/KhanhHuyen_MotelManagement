"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    message: string;
    resetLink?: string;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    if (!username.trim()) {
      setError("Vui lòng nhập tài khoản.");
      return;
    }
    setLoading(true);
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:4002";
      const res = await api.post("/xac-thuc/quen-mat-khau", {
        username: username.trim(),
        resetBaseUrl: baseUrl,
      });
      setSuccess({
        message: res.data.message,
        resetLink: res.data.resetLink || undefined,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

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
            <span className="login-subtitle">Quên mật khẩu</span>
          </div>

          {success ? (
            <div className="login-success-box">
              <p className="login-success-message">{success.message}</p>
              {success.resetLink && (
                <div className="login-reset-link-box">
                  <label>
                    Link đặt lại mật khẩu (sao chép hoặc nhấn để mở):
                  </label>
                  <a
                    href={success.resetLink}
                    className="login-reset-link"
                    target="_self"
                    rel="noopener noreferrer"
                  >
                    {success.resetLink}
                  </a>
                </div>
              )}
              <Link
                href="/login"
                className="btn login-btn"
                style={{ marginTop: "1rem" }}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="login-form">
              <p className="login-forgot-desc">
                Nhập tài khoản để nhận hướng dẫn đặt lại mật khẩu.
              </p>
              <div className="login-field">
                <label htmlFor="username">Tài khoản</label>
                <div className="input-icon-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M4 20a8 8 0 0 1 16 0"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    id="username"
                    placeholder="Nhập tài khoản"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button
                className="btn login-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý…" : "Gửi yêu cầu"}
              </button>
              <p className="login-forgot-wrap">
                <Link href="/login" className="login-forgot-link">
                  ← Quay lại đăng nhập
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <footer className="login-footer">
        <span>© 2026 iTro. All rights reserved.</span>
      </footer>
    </div>
  );
}
