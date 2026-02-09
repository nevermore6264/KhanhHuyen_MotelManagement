import "../styles/globals.css";
import React from "react";
import AppShell from "@/components/AppShell";

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
    <html lang="vi">
      <body>
        <main className="main-content">
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}
