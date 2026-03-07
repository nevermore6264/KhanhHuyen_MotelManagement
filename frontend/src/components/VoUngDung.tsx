"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NhaCungCapToast from "./NhaCungCapToast";
import NhaCungCapThongBao from "./NhaCungCapThongBao";

/** Vỏ ứng dụng: bọc toàn bộ nội dung, ẩn footer trên trang đăng nhập/quên mật khẩu. */
export default function VoUngDung({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const laTrangXacThuc =
    pathname === "/dang-nhap" ||
    pathname === "/quen-mat-khau" ||
    pathname === "/dat-lai-mat-khau";

  useEffect(() => {
    const lopThan = "login-body";
    if (laTrangXacThuc) {
      document.body.classList.add(lopThan);
    } else {
      document.body.classList.remove(lopThan);
    }
    return () => document.body.classList.remove(lopThan);
  }, [laTrangXacThuc]);

  return (
    <NhaCungCapToast>
      <NhaCungCapThongBao>
        <div className="app-shell-body">
          <div className="app-shell-content">{children}</div>
          {!laTrangXacThuc && (
            <footer className="main-footer">
              © 2026 iTro • Hỗ trợ: support@motel.vn
            </footer>
          )}
        </div>
      </NhaCungCapThongBao>
    </NhaCungCapToast>
  );
}
