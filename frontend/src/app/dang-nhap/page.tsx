"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { IconHome } from "@/components/Icons";

export default function TrangDangNhap() {
  const router = useRouter();
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
      setLoi("Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.");
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
        Quay về trang chủ
      </Link>

      <div className="login-layout">
        <section className="login-panel-hero">
          <h1>
            Quản lý nhà trọ
            <br />
            <span>nhẹ nhàng hơn mỗi ngày</span>
          </h1>
          <p>
            iTro giúp bạn theo dõi phòng, hợp đồng, hóa đơn và trao đổi với
            khách thuê — trên một nền tảng gọn gàng, dễ dùng.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span className="login-feature-icon" aria-hidden>
                🏠
              </span>
              <div>
                <strong>Toàn cảnh một màn hình</strong>
                <span>Phòng, khách, hợp đồng và thanh toán liên kết thống nhất.</span>
              </div>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon" aria-hidden>
                🔔
              </span>
              <div>
                <strong>Nhắc việc tự động</strong>
                <span>Hạn hợp đồng, hóa đơn và thông báo realtime.</span>
              </div>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon" aria-hidden>
                📊
              </span>
              <div>
                <strong>Báo cáo rõ ràng</strong>
                <span>Xuất Excel, PDF — đối soát nhanh từng kỳ.</span>
              </div>
            </div>
          </div>

          <div className="login-stats-row">
            <div className="login-stat-pill">
              <strong>24/7</strong>
              <span>Hỗ trợ vận hành</span>
            </div>
            <div className="login-stat-pill">
              <strong>3</strong>
              <span>Vai trò người dùng</span>
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
              <h2>Đăng nhập</h2>
              <p>Chào mừng trở lại — nhập tài khoản để tiếp tục</p>
            </header>

            <form onSubmit={gui} className="login-form">
              <div className="login-field">
                <label htmlFor="username">Tài khoản</label>
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
                    placeholder="Tên đăng nhập"
                    autoComplete="username"
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Mật khẩu</label>
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
                    placeholder="Mật khẩu"
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
                {dangGui ? "Đang đăng nhập…" : "Đăng nhập"}
              </button>

              <div className="login-demo">
                Tài khoản demo: <strong>admin / admin123</strong>
              </div>

              <p className="login-forgot">
                <Link href="/quen-mat-khau">Quên mật khẩu?</Link>
              </p>
            </form>
          </div>
        </section>
      </div>

      <p className="login-page-footer">
        © 2026 iTro · Quản lý nhà trọ thông minh
      </p>
    </div>
  );
}
