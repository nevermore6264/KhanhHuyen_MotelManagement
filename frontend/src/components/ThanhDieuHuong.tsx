"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dangXuatApp, getName, getRole } from "@/lib/auth";
import ChuongPopoverThongBao from "./ChuongPopoverThongBao";
import { IconLogout, IconSettings } from "./Icons";

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

const TEN_VAI_TRO: Record<string, string> = {
  ADMIN: "Quản trị",
  STAFF: "Nhân viên",
  TENANT: "Khách thuê",
};

function layChuCai(ten: string) {
  const p = ten.trim().charAt(0);
  return p ? p.toUpperCase() : "U";
}

export default function ThanhDieuHuong() {
  const pathname = usePathname();
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const [ten, setTen] = useState("User");

  useEffect(() => {
    setVaiTro(getRole() || "ADMIN");
    setTen(getName() || "User");
  }, []);

  const hienThiChuong = vaiTro === "TENANT" || vaiTro === "STAFF";
  const menu = vaiTro != null ? menuTheoVaiTro[vaiTro] : [];

  const active = (href: string) =>
    pathname === href || (href !== "/tong-quan" && pathname.startsWith(href));

  const nhomActive = (nhom: NhomMenu) => {
    if (nhom.href) return active(nhom.href);
    return nhom.items?.some((m) => active(m.href)) ?? false;
  };

  const linkClass = (href: string, extra = "") =>
    `app-navbar__link${active(href) ? " app-navbar__link--active" : ""}${extra ? ` ${extra}` : ""}`;

  return (
    <header className="app-navbar">
      <div className="app-navbar__inner">
        <Link href="/tong-quan" className="app-navbar__brand">
          <Image
            className="app-navbar__logo"
            src="/logo.svg"
            alt="iTro"
            width={36}
            height={36}
            priority
          />
          <span className="app-navbar__brand-text">
            <strong>iTro</strong>
            <small>Quản lý nhà trọ</small>
          </span>
        </Link>

        <nav className="app-navbar__menu" aria-label="Menu chính">
          {menu.map((nhom) => (
            <div key={nhom.label} className="app-navbar__item">
              {nhom.href ? (
                <Link href={nhom.href} className={linkClass(nhom.href)}>
                  {nhom.label}
                </Link>
              ) : (
                <>
                  <span
                    className={`app-navbar__link app-navbar__link--group${nhomActive(nhom) ? " app-navbar__link--active" : ""}`}
                    tabIndex={0}
                  >
                    {nhom.label}
                  </span>
                  <div className="app-navbar__dropdown">
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
        </nav>

        <div className="app-navbar__actions">
          {hienThiChuong ? <ChuongPopoverThongBao /> : null}

          <span className="app-navbar__divider" aria-hidden />

          <Link href="/cai-dat" className="app-navbar__ghost">
            <IconSettings />
            <span>Cài đặt</span>
          </Link>

          <Link href="/tai-khoan" className="app-navbar__user">
            <span className="app-navbar__avatar" aria-hidden>
              {layChuCai(ten)}
            </span>
            <span className="app-navbar__user-meta">
              <strong>{ten}</strong>
              <small>{vaiTro ? TEN_VAI_TRO[vaiTro] ?? vaiTro : ""}</small>
            </span>
          </Link>

          <button
            type="button"
            className="app-navbar__logout"
            onClick={() => dangXuatApp()}
            aria-label="Đăng xuất khỏi hệ thống"
          >
            <IconLogout />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
