"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import NhaCungCapToast from "./NhaCungCapToast";
import NhaCungCapThongBao from "./NhaCungCapThongBao";
import NhaCungCapCaiDat from "./NhaCungCapCaiDat";
import ThanhDieuHuong from "./ThanhDieuHuong";

function loaiTrang(pathname: string): string {
  if (pathname === "/tong-quan") return "dashboard";
  if (pathname === "/bao-cao") return "report";
  if (
    pathname === "/tai-khoan" ||
    pathname === "/cai-dat" ||
    pathname.endsWith("-cua-toi")
  ) {
    return "account";
  }
  if (pathname === "/tin-nhan") return "chat";
  if (pathname === "/thong-bao") return "notifications";
  if (
    pathname.includes("dang-nhap") ||
    pathname.includes("mat-khau")
  ) {
    return "auth";
  }
  return "table";
}

export default function VoUngDung({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const laTrangLanding = pathname === "/";
  const laTrangXacThuc =
    pathname === "/dang-nhap" ||
    pathname === "/quen-mat-khau" ||
    pathname === "/dat-lai-mat-khau" ||
    pathname === "/reset-password";

  const pageKind = useMemo(() => loaiTrang(pathname), [pathname]);

  useEffect(() => {
    const lopLogin = "login-body";
    const lopLanding = "landing-body";
    document.body.classList.toggle(lopLogin, laTrangXacThuc);
    document.body.classList.toggle(lopLanding, laTrangLanding);
    return () => {
      document.body.classList.remove(lopLogin);
      document.body.classList.remove(lopLanding);
    };
  }, [laTrangXacThuc, laTrangLanding]);

  return (
    <NhaCungCapCaiDat>
      <NhaCungCapToast>
        <NhaCungCapThongBao>
          {laTrangXacThuc || laTrangLanding ? (
            <>{children}</>
          ) : (
            <div className="app-shell-body">
              <ThanhDieuHuong />
              <div className="app-shell-content" data-page={pageKind}>
                {children}
              </div>
              <footer className="main-footer">
                © 2026 iTro · Chúc bạn một ngày làm việc nhẹ nhàng ✨
              </footer>
            </div>
          )}
        </NhaCungCapThongBao>
      </NhaCungCapToast>
    </NhaCungCapCaiDat>
  );
}
