"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

/** Bọc trang cần đăng nhập: không có token thì chuyển hướng về /dang-nhap. */
export default function TrangBaoVe({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/dang-nhap");
    }
  }, [router]);

  return <>{children}</>;
}
