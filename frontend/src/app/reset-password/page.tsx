"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ChuyenHuong() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace("/quen-mat-khau");
  }, [router, searchParams]);

  return null;
}

export default function TrangResetPasswordRedirect() {
  return (
    <Suspense fallback={null}>
      <ChuyenHuong />
    </Suspense>
  );
}
