"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChuyenHuongQuenMk() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    const q = email ? `?email=${encodeURIComponent(email)}` : "";
    router.replace(`/quen-mat-khau${q}`);
  }, [router, searchParams]);

  return null;
}

export default function TrangDatLaiMatKhauRedirect() {
  return (
    <Suspense fallback={null}>
      <ChuyenHuongQuenMk />
    </Suspense>
  );
}
