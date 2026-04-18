"use client";

import Link from "next/link";
import { IconLogout } from "@/components/Icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getName, getRole } from "@/lib/auth";
import { useThongBao } from "./NhaCungCapThongBao";

/** Một mục menu (nhãn + đường dẫn) */
type MucMenu = { label: string; href: string };
/** Nhóm menu (có thể có mục con hoặc link trực tiếp) */
type NhomMenu = { label: string; href?: string; items?: MucMenu[] };

/** Cấu hình menu theo vai trò: ADMIN, STAFF, TENANT */
const menuTheoVaiTro: Record<string, NhomMenu[]> = {
  ADMIN: [
    { label: "Tổng quan", href: "/tong-quan" },
    {
      label: "Quản lý",
      items: [
        { href: "/khu-vuc", label: "Khu" },
        { href: "/phong", label: "Phòng" },
        { href: "/khach-thue", label: "Khách thuê" },
        { href: "/hop-dong", label: "Hợp đồng" },
        { href: "/nguoi-dung", label: "Người dùng" },
      ],
    },
    {
      label: "Tài chính",
      items: [
        { href: "/bang-gia-dich-vu", label: "Bảng giá" },
        { href: "/chi-so-dien-nuoc", label: "Điện nước" },
        { href: "/hoa-don", label: "Hóa đơn" },
        { href: "/thanh-toan", label: "Thanh toán" },
        { href: "/bao-cao", label: "Báo cáo" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/yeu-cau-ho-tro", label: "Yêu cầu" },
        { href: "/thong-bao", label: "Thông báo" },
      ],
    },
  ],
  STAFF: [
    { label: "Tổng quan", href: "/tong-quan" },
    {
      label: "Quản lý",
      items: [
        { href: "/phong", label: "Phòng" },
        { href: "/hop-dong", label: "Hợp đồng" },
      ],
    },
    {
      label: "Tài chính",
      items: [
        { href: "/chi-so-dien-nuoc", label: "Điện nước" },
        { href: "/hoa-don", label: "Hóa đơn" },
        { href: "/thanh-toan", label: "Thanh toán" },
        { href: "/bao-cao", label: "Báo cáo" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/yeu-cau-ho-tro", label: "Yêu cầu" },
        { href: "/thong-bao", label: "Thông báo" },
      ],
    },
  ],
  TENANT: [
    { label: "Tổng quan", href: "/tong-quan" },
    {
      label: "Tài khoản",
      items: [
        { href: "/hop-dong-cua-toi", label: "Hợp đồng" },
        { href: "/hoa-don-cua-toi", label: "Hóa đơn" },
        { href: "/thanh-toan-cua-toi", label: "Thanh toán" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/yeu-cau", label: "Yêu cầu" },
        { href: "/thong-bao", label: "Thông báo" },
      ],
    },
  ],
};

/** Thanh điều hướng chính: menu theo vai trò, chuông thông báo, đăng xuất. */
export default function ThanhDieuHuong() {
  const router = useRouter();
  /** null = chưa đọc localStorage — tránh một khung hình menu ADMIN rồi prefetch link nhân viên (403 với JWT khách). */
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const [ten, setTen] = useState("User");
  const contextThongBao = useThongBao();

  useEffect(() => {
    setVaiTro(getRole() || "ADMIN");
    setTen(getName() || "User");
  }, []);

  const hienThiChuong =
    vaiTro === "TENANT" || vaiTro === "STAFF" || vaiTro === "ADMIN";
  const soChuaDoc = contextThongBao?.unreadCount ?? 0;

  const dangXuat = () => {
    clearAuth();
    router.replace("/dang-nhap");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <img className="nav-logo" src="/logo.svg" alt="iTro" />
          <span>iTro</span>
        </div>

        <div className="nav-menu">
          {vaiTro != null &&
            menuTheoVaiTro[vaiTro]?.map((nhom) => (
              <div key={nhom.label} className="nav-item">
                {nhom.href ? (
                  <Link className="nav-link" href={nhom.href}>
                    {nhom.label}
                  </Link>
                ) : (
                  <>
                    <span className="nav-link">{nhom.label}</span>
                    <div className="nav-dropdown">
                      {nhom.items?.map((muc) => (
                        <Link key={muc.href} href={muc.href}>
                          {muc.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>

        <div className="nav-actions">
          {hienThiChuong && (
            <Link
              href="/thong-bao"
              className="nav-bell"
              title="Thông báo"
              aria-label={
                soChuaDoc > 0 ? `${soChuaDoc} thông báo chưa đọc` : "Thông báo"
              }
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {soChuaDoc > 0 && (
                <span className="nav-bell-badge" aria-hidden="true">
                  {soChuaDoc > 99 ? "99+" : soChuaDoc}
                </span>
              )}
            </Link>
          )}
          <span className="nav-user">
            {ten}
            {vaiTro != null ? ` (${vaiTro})` : ""}
          </span>
          <button className="btn btn-secondary" onClick={dangXuat}>
            <IconLogout /> Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
