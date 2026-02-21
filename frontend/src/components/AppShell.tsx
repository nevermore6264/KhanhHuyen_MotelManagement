"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";
import NotificationProvider from "./NotificationProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  useEffect(() => {
    const className = "login-body";
    if (isLogin) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => document.body.classList.remove(className);
  }, [isLogin]);

  return (
    <ToastProvider>
      <NotificationProvider>
        {children}
        {!isLogin && (
          <footer className="main-footer">
            © 2026 iTro • Hỗ trợ: support@motel.vn
          </footer>
        )}
      </NotificationProvider>
    </ToastProvider>
  );
}
