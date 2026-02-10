"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      setAuth(res.data.token, res.data.role, res.data.fullName);
      router.replace("/dashboard");
    } catch (err: any) {
      setError("Đăng nhập thất bại");
    }
  };

  return (
    <div className="login-page">
      <div className="snowflakes" aria-hidden="true">
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
      </div>
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
        <div className="login-header-actions">
          <span className="login-pill">Bảo mật nhiều lớp</span>
          <span className="login-pill">Hỗ trợ 24/7</span>
        </div>
      </header>
      <div className="login-shell">
        <div className="login-hero">
          <div className="login-hero-list">
            <div className="login-hero-item">
              <span className="login-hero-dot" />
              <div>
                <strong>Quản lý tập trung</strong>
                <p>Tất cả phòng, hợp đồng và hóa đơn trong một màn hình.</p>
              </div>
            </div>
            <div className="login-hero-item">
              <span className="login-hero-dot" />
              <div>
                <strong>Nhắc nhở tự động</strong>
                <p>Hạn hợp đồng và hóa đơn luôn được theo dõi sát.</p>
              </div>
            </div>
            <div className="login-hero-item">
              <span className="login-hero-dot" />
              <div>
                <strong>Báo cáo trực quan</strong>
                <p>Biểu đồ rõ ràng giúp ra quyết định nhanh.</p>
              </div>
            </div>
          </div>
          <div className="login-hero-stats">
            <div>
              <strong>24/7</strong>
              <span>Hỗ trợ vận hành</span>
            </div>
            <div>
              <strong>+35%</strong>
              <span>Tiết kiệm thời gian</span>
            </div>
            <div>
              <strong>1 chạm</strong>
              <span>Xuất hóa đơn</span>
            </div>
          </div>
          <div className="login-trust">
            <span>Chuẩn hóa dữ liệu</span>
            <span>Bảo mật nhiều lớp</span>
            <span>Vận hành thông minh</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-brand">
            <div className="login-title">
              <img src="/logo.svg" alt="iTro" className="login-title-logo" />
              <span>iTro</span>
            </div>
            <span className="login-subtitle">Đăng nhập</span>
          </div>

          <form onSubmit={submit} className="login-form">
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
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Mật khẩu</label>
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
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn login-btn" type="submit">
              <span className="login-btn-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Đăng nhập
            </button>

            <div className="login-hint">
              Demo: <strong>admin / admin123</strong>
            </div>
          </form>
        </div>
      </div>
      <footer className="login-footer">
        <span>© 2026 iTro. All rights reserved.</span>
        <span>Hotline: 1900 6868 • support@itro.vn</span>
      </footer>
    </div>
  );
}
