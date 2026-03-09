"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function TrangQuenMatKhau() {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [thanhCong, setThanhCong] = useState<{
    message: string;
    resetLink?: string;
  } | null>(null);

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");
    setThanhCong(null);
    if (!tenDangNhap.trim()) {
      setLoi("Vui lòng nhập tài khoản.");
      return;
    }
    setDangTai(true);
    try {
      const gocUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:4002";
      const phanHoi = await api.post("/xac-thuc/quen-mat-khau", {
        tenDangNhap: tenDangNhap.trim(),
        resetBaseUrl: gocUrl,
      });
      setThanhCong({
        message: phanHoi.data.message,
        resetLink: phanHoi.data.resetLink ?? undefined,
      });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setLoi(ax?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setDangTai(false);
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

          {thanhCong ? (
            <div className="login-success-box">
              <p className="login-success-message">{thanhCong.message}</p>
              {thanhCong.resetLink && (
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
                href="/dang-nhap"
                className="btn login-btn"
                style={{ marginTop: "1rem" }}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={gui} className="login-form">
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
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    disabled={dangTai}
                  />
                </div>
              </div>
              {loi && <div className="login-error">{loi}</div>}
              <button
                className="btn login-btn"
                type="submit"
                disabled={dangTai}
              >
                {dangTai ? "Đang xử lý…" : "Gửi yêu cầu"}
              </button>
              <p className="login-forgot-wrap">
                <Link href="/dang-nhap" className="login-forgot-link">
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
