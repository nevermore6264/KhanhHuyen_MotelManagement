"use client";

import type { ReactNode } from "react";

type KieuTrang = "default" | "dashboard" | "table" | "report" | "account" | "chat";

export default function KhungTrang({
  title,
  subtitle,
  actions,
  kieu = "default",
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  kieu?: KieuTrang;
  children: ReactNode;
}) {
  return (
    <div className={`page-shell page-${kieu}`}>
      <header className="page-top">
        <div className="page-top-text">
          <h1 className="page-heading">{title}</h1>
          {subtitle ? <p className="page-lead">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-top-actions">{actions}</div> : null}
      </header>
      <div className="page-body">{children}</div>
    </div>
  );
}
