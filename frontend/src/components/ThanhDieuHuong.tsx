"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getName, getRole } from "@/lib/auth";
import ChuongPopoverThongBao from "./ChuongPopoverThongBao";
import { IconLogout } from "./Icons";

type MucMenu = { label: string; href: string };

type NhomMenu = { label: string; href?: string; items?: MucMenu[] };

const menuTheoVaiTro: Record<string, NhomMenu[]> = {
  ADMIN: [
    { label: "Tổng quan", href: "/tong-quan" },
    {
      label: "Nhà trọ",
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
        { href: "/tin-nhan", label: "Tin nhắn" },
      ],
    },
  ],
  STAFF: [
    { label: "Tổng quan", href: "/tong-quan" },
    {
      label: "Nhà trọ",
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
        { href: "/tin-nhan", label: "Tin nhắn" },
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
        { href: "/tai-khoan", label: "Hồ sơ cá nhân" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/yeu-cau", label: "Yêu cầu" },
        { href: "/thong-bao", label: "Thông báo" },
        { href: "/tin-nhan", label: "Tin nhắn" },
      ],
    },
  ],
};

export default function ThanhDieuHuong() {
  const pathname = usePathname();
  const router = useRouter();
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const [ten, setTen] = useState("User");

  useEffect(() => {
    setVaiTro(getRole() || "ADMIN");
    setTen(getName() || "User");
  }, []);

  const hienThiChuong = vaiTro === "TENANT" || vaiTro === "STAFF";
  const menu = vaiTro != null ? menuTheoVaiTro[vaiTro] : [];

  const dangXuat = () => {
    clearAuth();
    router.replace("/dang-nhap");
  };

  const active = (href: string) =>
    pathname === href || (href !== "/tong-quan" && pathname.startsWith(href));

  const navClass = (href: string) =>
    `nav-link${active(href) ? " nav-link-active" : ""}`;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/tong-quan" className="navbar-brand">
          <img className="nav-logo" src="/logo.svg" alt="iTro" />
          <span>iTro</span>
        </Link>

        <div className="nav-menu">
          {menu.map((nhom) => (
            <div key={nhom.label} className="nav-item">
              {nhom.href ? (
                <Link className={navClass(nhom.href)} href={nhom.href}>
                  {nhom.label}
                </Link>
              ) : (
                <>
                  <span className="nav-link nav-link-group">{nhom.label}</span>
                  <div className="nav-dropdown">
                    {nhom.items?.map((muc) => (
                      <Link
                        key={muc.href}
                        href={muc.href}
                        className={active(muc.href) ? "active" : ""}
                      >
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
          {hienThiChuong && <ChuongPopoverThongBao />}
          <Link href="/cai-dat" className="btn btn-nav btn-nav-ghost">
            Cài đặt
          </Link>
          <Link href="/tai-khoan" className="btn btn-nav btn-nav-ghost">
            Hồ sơ
          </Link>
          <span className="nav-user">
            {ten}
            {vaiTro != null ? ` · ${vaiTro}` : ""}
          </span>
          <button type="button" className="btn btn-nav" onClick={dangXuat}>
            <IconLogout /> Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
