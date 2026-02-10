"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getName, getRole } from "@/lib/auth";

type MenuItem = { label: string; href: string };
type MenuGroup = { label: string; href?: string; items?: MenuItem[] };

const roleMenus: Record<string, MenuGroup[]> = {
  ADMIN: [
    { label: "Tổng quan", href: "/dashboard" },
    {
      label: "Quản lý",
      items: [
        { href: "/areas", label: "Khu" },
        { href: "/rooms", label: "Phòng" },
        { href: "/tenants", label: "Khách thuê" },
        { href: "/contracts", label: "Hợp đồng" },
        { href: "/users", label: "Người dùng" },
      ],
    },
    {
      label: "Tài chính",
      items: [
        { href: "/service-prices", label: "Bảng giá" },
        { href: "/meter-readings", label: "Điện nước" },
        { href: "/invoices", label: "Hóa đơn" },
        { href: "/payments", label: "Thanh toán" },
        { href: "/reports", label: "Báo cáo" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/support-requests", label: "Yêu cầu" },
        { href: "/notifications", label: "Thông báo" },
      ],
    },
  ],
  STAFF: [
    { label: "Tổng quan", href: "/dashboard" },
    {
      label: "Quản lý",
      items: [
        { href: "/rooms", label: "Phòng" },
        { href: "/contracts", label: "Hợp đồng" },
      ],
    },
    {
      label: "Tài chính",
      items: [
        { href: "/meter-readings", label: "Điện nước" },
        { href: "/invoices", label: "Hóa đơn" },
        { href: "/payments", label: "Thanh toán" },
        { href: "/reports", label: "Báo cáo" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/support-requests", label: "Yêu cầu" },
        { href: "/notifications", label: "Thông báo" },
      ],
    },
  ],
  TENANT: [
    { label: "Tổng quan", href: "/dashboard" },
    {
      label: "Tài khoản",
      items: [
        { href: "/my-contracts", label: "Hợp đồng" },
        { href: "/my-invoices", label: "Hóa đơn" },
        { href: "/my-payments", label: "Thanh toán" },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [
        { href: "/support", label: "Yêu cầu" },
        { href: "/notifications", label: "Thông báo" },
      ],
    },
  ],
};

export default function NavBar() {
  const router = useRouter();
  const [role, setRole] = useState("ADMIN");
  const [name, setName] = useState("User");

  useEffect(() => {
    setRole(getRole() || "ADMIN");
    setName(getName() || "User");
  }, []);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <img className="nav-logo" src="/logo.svg" alt="iTro" />
          <span>iTro</span>
        </div>

        <div className="nav-menu">
          {roleMenus[role]?.map((group) => (
            <div key={group.label} className="nav-item">
              {group.href ? (
                <Link className="nav-link" href={group.href}>
                  {group.label}
                </Link>
              ) : (
                <>
                  <span className="nav-link">{group.label}</span>
                  <div className="nav-dropdown">
                    {group.items?.map((item) => (
                      <Link key={item.href} href={item.href}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="nav-actions">
          <span className="nav-user">
            {name} ({role})
          </span>
          <button className="btn btn-secondary" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
