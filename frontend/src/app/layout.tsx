import "../styles/globals.css";
import React from "react";
import VoUngDung from "@/components/VoUngDung";

export const metadata = {
  title: "iTro — Quản lý nhà trọ thông minh",
  description:
    "iTro: giải pháp quản lý nhà trọ gọn gàng, đẹp mắt — phòng, hợp đồng, hóa đơn, chat & báo cáo.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="main-content">
          <VoUngDung>{children}</VoUngDung>
        </main>
      </body>
    </html>
  );
}
