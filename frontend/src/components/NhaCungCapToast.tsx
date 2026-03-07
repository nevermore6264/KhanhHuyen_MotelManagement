"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type LoaiToast = "success" | "error" | "info";
type MucToast = { id: string; thongDiep: string; loai: LoaiToast };
type GiaTriNgonNguToast = {
  thongBao: (thongDiep: string, loai?: LoaiToast) => void;
};

const NgonNguToast = createContext<GiaTriNgonNguToast | null>(null);

export function useToast() {
  const ctx = useContext(NgonNguToast);
  if (!ctx) {
    throw new Error("useToast phải dùng bên trong NhaCungCapToast");
  }
  return { notify: ctx.thongBao };
}

/** Provider toast: hiển thị thông báo nhanh (thành công/lỗi/thông tin). */
export default function NhaCungCapToast({
  children,
}: {
  children: React.ReactNode;
}) {
  const [danhSach, setDanhSach] = useState<MucToast[]>([]);

  const thongBao = useCallback(
    (thongDiep: string, loai: LoaiToast = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const muc: MucToast = { id, thongDiep, loai };
      setDanhSach((truoc) => [...truoc, muc]);
      setTimeout(() => {
        setDanhSach((truoc) => truoc.filter((m) => m.id !== id));
      }, 3200);
    },
    [],
  );

  const giaTri = useMemo(() => ({ thongBao }), [thongBao]);

  return (
    <NgonNguToast.Provider value={giaTri}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {danhSach.map((m) => (
          <div key={m.id} className={`toast toast-${m.loai}`}>
            {m.thongDiep}
          </div>
        ))}
      </div>
    </NgonNguToast.Provider>
  );
}
