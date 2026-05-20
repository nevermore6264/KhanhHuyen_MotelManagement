import "../styles/globals.css";
import React from "react";
import VoUngDung from "@/components/VoUngDung";
import Script from "next/script";

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
        <Script id="cai-dat-ban-dau" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("motel_theme");var l=localStorage.getItem("motel_lang");if(t==="dark")document.documentElement.setAttribute("data-theme","dark");if(l==="en")document.documentElement.setAttribute("lang","en");}catch(e){}})();`}
        </Script>
        <main className="main-content">
          <VoUngDung>{children}</VoUngDung>
        </main>
      </body>
    </html>
  );
}
