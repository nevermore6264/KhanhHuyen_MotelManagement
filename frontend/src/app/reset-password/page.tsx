"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function NoiDungChuyenHuong() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    router.replace(`/dat-lai-mat-khau${query}`);
  }, [router, searchParams]);

  return <div className="page-shell page-table">Đang chuyển hướng…</div>;
}


export default function TrangChuyenHuongDatLaiMatKhau() {
  return (
    <Suspense fallback={<div className="page-shell page-table">Đang tải…</div>}>
      <NoiDungChuyenHuong />
    </Suspense>
  );
}
