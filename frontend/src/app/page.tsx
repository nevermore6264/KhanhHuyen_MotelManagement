"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function TrangChu() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    router.replace(token ? "/tong-quan" : "/dang-nhap");
  }, [router]);

  return <div className="container">Đang chuyển hướng...</div>;
}
