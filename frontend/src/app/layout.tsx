import "../styles/globals.css";
import React from "react";
import VoUngDung from "@/components/VoUngDung";

export const metadata = {
  title: "iTro",
  description: "Hệ thống quản lý nhà trọ iTro",
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
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="main-content">
          <VoUngDung>{children}</VoUngDung>
        </main>
      </body>
    </html>
  );
}
