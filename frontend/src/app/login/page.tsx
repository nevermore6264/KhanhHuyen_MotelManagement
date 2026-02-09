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
      <div className="login-shell">
        <div className="login-hero">
          <div className="login-hero-badge logo-badge">
            <img src="/logo.svg" alt="iTro" />
            <span>iTro</span>
          </div>
          <h1>Quản lý nhà trọ thông minh</h1>
          <p>
            Theo dõi phòng, hợp đồng, điện nước và hóa đơn nhanh gọn trong một
            nền tảng duy nhất.
          </p>
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
        </div>

        <div className="login-card">
          <div className="login-brand">
            <div className="login-badge">
              <img className="login-logo" src="/logo.svg" alt="iTro" />
            </div>
            <div>
              <h2>Đăng nhập</h2>
              <p>Chào mừng trở lại! Hãy tiếp tục công việc.</p>
            </div>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Tài khoản</label>
              <input
                id="username"
                placeholder="Nhập tài khoản"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn login-btn" type="submit">
              Đăng nhập
            </button>

            <div className="login-hint">
              Demo: <strong>admin / admin123</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
