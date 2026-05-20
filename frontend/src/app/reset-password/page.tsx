"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

function NoiDungChuyenHuong() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t: tr } = useCaiDat();
  const s = tr.pages.shared;
  const c = tr.common;

  useEffect(() => {
    const token = searchParams.get("token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    router.replace(`/dat-lai-mat-khau${query}`);
  }, [router, searchParams]);

  return <div className="page-shell page-table">{s.redirecting}</div>;
}

export default function TrangChuyenHuongDatLaiMatKhau() {
  const { t: tr } = useCaiDat();
  const c = tr.common;

  return (
    <Suspense fallback={<div className="page-shell page-table">{c.loading}</div>}>
      <NoiDungChuyenHuong />
    </Suspense>
  );
}
