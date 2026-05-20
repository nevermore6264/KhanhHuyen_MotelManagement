"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { IconHome } from "@/components/Icons";
import FooterHienDai from "@/components/FooterHienDai";

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
      <div className="login-page__bg" aria-hidden>
        <div className="login-page__blob login-page__blob--1" />
        <div className="login-page__blob login-page__blob--2" />
      </div>

      <Link href="/" className="login-back-home">
        <IconHome />
        Quay về trang chủ
      </Link>

      <div className="login-page__main">
        <div className="login-layout">
          <section className="login-panel-hero">
            <h1>
              Khôi phục mật khẩu
              <br />
              <span>nhanh và an toàn</span>
            </h1>
            <p>
              Nhập tài khoản đã đăng ký — hệ thống gửi hướng dẫn đặt lại mật
              khẩu để bạn quay lại quản lý nhà trọ trên iTro.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  🔐
                </span>
                <div>
                  <strong>Bảo mật tài khoản</strong>
                  <span>Link đặt lại có thời hạn — chỉ dùng một lần.</span>
                </div>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  ✉️
                </span>
                <div>
                  <strong>Hướng dẫn rõ ràng</strong>
                  <span>Nhận link trực tiếp trên màn hình (môi trường demo).</span>
                </div>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon" aria-hidden>
                  ↩️
                </span>
                <div>
                  <strong>Quay lại đăng nhập</strong>
                  <span>Nhớ mật khẩu? Trở về form đăng nhập bất cứ lúc nào.</span>
                </div>
              </div>
            </div>

            <div className="login-stats-row">
              <div className="login-stat-pill">
                <strong>iTro</strong>
                <span>Quản lý nhà trọ</span>
              </div>
              <div className="login-stat-pill">
                <strong>Demo</strong>
                <span>Hỗ trợ đồ án</span>
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
                <h2>Quên mật khẩu</h2>
                <p>Nhập tài khoản để nhận hướng dẫn đặt lại mật khẩu</p>
              </header>

              {thanhCong ? (
                <div className="login-success">
                  <p className="login-success-message">{thanhCong.message}</p>
                  {thanhCong.resetLink ? (
                    <div className="login-reset-link-box">
                      <span className="login-reset-link-label">
                        Link đặt lại mật khẩu:
                      </span>
                      <a
                        href={thanhCong.resetLink}
                        className="login-reset-link"
                        target="_self"
                        rel="noopener noreferrer"
                      >
                        {thanhCong.resetLink}
                      </a>
                    </div>
                  ) : null}
                  <Link href="/dang-nhap" className="btn login-submit">
                    Quay lại đăng nhập
                  </Link>
                </div>
              ) : (
                <form onSubmit={gui} className="login-form">
                  <p className="login-hint">
                    Dùng đúng tên đăng nhập bạn hay dùng khi đăng nhập iTro.
                  </p>
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
                        disabled={dangTai}
                      />
                    </div>
                  </div>

                  {loi ? <div className="login-error">{loi}</div> : null}

                  <button
                    className="btn login-submit"
                    type="submit"
                    disabled={dangTai}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M4 12h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 4v16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {dangTai ? "Đang xử lý…" : "Gửi yêu cầu"}
                  </button>

                  <p className="login-forgot">
                    <Link href="/dang-nhap">← Quay lại đăng nhập</Link>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>

      <FooterHienDai variant="auth" />
    </div>
  );
}
