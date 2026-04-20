"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type MucKhachThue = {
  id: string;
  fullName: string;
  phone?: string | null;
  user?: { id: string } | null;
};

type Props = {
  danhSach: MucKhachThue[];
  value: string;
  onChange: (idKhach: string) => void;
  /** Chỉ danh sách khách chưa có tài khoản (dùng khi tạo tài khoản TENANT). */
  chiChuaCoTaiKhoan?: boolean;
  /** ID người dùng đang liên kết — hiện nhãn ✓ đang gắn trên dòng khớp. */
  idNguoiDungGan?: string | null;
  disabled?: boolean;
  placeholderChuaChon?: string;
  placeholderTim?: string;
};

type ViTri = { top: number; left: number; width: number };

function dongHienThi(t: MucKhachThue): string {
  const sdt = (t.phone ?? "").trim();
  return sdt ? `${t.fullName.trim()} — ${sdt}` : t.fullName.trim();
}

export default function ChonKhachThueCombobox({
  danhSach,
  value,
  onChange,
  chiChuaCoTaiKhoan = false,
  idNguoiDungGan = null,
  disabled = false,
  placeholderChuaChon = "— Chọn khách thuê —",
  placeholderTim = "Tìm theo tên hoặc số điện thoại…",
}: Props) {
  const [mo, setMo] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const [viTri, setViTri] = useState<ViTri | null>(null);
  const [sanSangPortal, setSanSangPortal] = useState(false);

  const refGoc = useRef<HTMLDivElement>(null);
  const refNut = useRef<HTMLButtonElement>(null);
  const refPanel = useRef<HTMLDivElement>(null);

  const nguon = useMemo(
    () =>
      chiChuaCoTaiKhoan
        ? danhSach.filter((t) => !t.user)
        : [...danhSach],
    [danhSach, chiChuaCoTaiKhoan],
  );

  const danhSachLoc = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    const qSo = q.replace(/\D/g, "");
    if (!q) return nguon;
    return nguon.filter((t) => {
      const ten = t.fullName.toLowerCase();
      const sdt = (t.phone ?? "").toLowerCase().replace(/\s/g, "");
      if (ten.includes(q) || sdt.includes(q.replace(/\s/g, ""))) return true;
      if (qSo.length >= 2 && sdt.includes(qSo)) return true;
      return String(t.id).includes(q.trim());
    });
  }, [nguon, tuKhoa]);

  const mucDaChon = useMemo(() => {
    if (!value) return undefined;
    const trongNguon = nguon.find((t) => String(t.id) === value);
    if (trongNguon) return trongNguon;
    return danhSach.find((t) => String(t.id) === value);
  }, [value, nguon, danhSach]);
  const chuoiDaChon = mucDaChon ? dongHienThi(mucDaChon) : "";

  const capNhatViTri = useCallback(() => {
    const el = refNut.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setViTri({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 280),
    });
  }, []);

  useEffect(() => {
    setSanSangPortal(true);
  }, []);

  useLayoutEffect(() => {
    if (!mo || disabled) {
      setViTri(null);
      return;
    }
    capNhatViTri();
    window.addEventListener("scroll", capNhatViTri, true);
    window.addEventListener("resize", capNhatViTri);
    return () => {
      window.removeEventListener("scroll", capNhatViTri, true);
      window.removeEventListener("resize", capNhatViTri);
    };
  }, [mo, disabled, capNhatViTri]);

  useEffect(() => {
    if (!mo) {
      setTuKhoa("");
      return;
    }
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (refGoc.current?.contains(t)) return;
      if (refPanel.current?.contains(t)) return;
      setMo(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mo]);

  useEffect(() => {
    if (!mo) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMo(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mo]);

  const chon = (id: string) => {
    onChange(id);
    setMo(false);
    setTuKhoa("");
  };

  const hienPortal =
    sanSangPortal && mo && !disabled && viTri && typeof document !== "undefined";

  return (
    <div
      className={`combobox-khu ${disabled ? "combobox-khu-disabled" : ""}`}
      ref={refGoc}
    >
      <button
        ref={refNut}
        type="button"
        className="combobox-khu-trigger"
        disabled={disabled}
        aria-expanded={mo}
        aria-haspopup="listbox"
        onClick={() => !disabled && setMo((v) => !v)}
      >
        <span className={chuoiDaChon ? "" : "combobox-khu-placeholder"}>
          {chuoiDaChon || placeholderChuaChon}
        </span>
        <span className="combobox-khu-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {hienPortal &&
        createPortal(
          <div
            ref={refPanel}
            className="combobox-khu-panel combobox-khu-panel-portal"
            role="listbox"
            style={{
              position: "fixed",
              top: viTri.top,
              left: viTri.left,
              width: viTri.width,
              zIndex: 10050,
              maxHeight: `min(360px, calc(100vh - ${viTri.top + 8}px))`,
            }}
          >
            <input
              type="search"
              className="combobox-khu-search"
              placeholder={placeholderTim}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              autoFocus
            />
            <ul className="combobox-khu-list">
              <li>
                <button
                  type="button"
                  className="combobox-khu-item combobox-khu-item-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => chon("")}
                >
                  {placeholderChuaChon}
                </button>
              </li>
              {danhSachLoc.length === 0 ? (
                <li className="combobox-khu-empty">Không có khách phù hợp</li>
              ) : (
                danhSachLoc.map((t) => {
                  const gan =
                    idNguoiDungGan != null && t.user?.id === idNguoiDungGan;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`combobox-khu-item ${
                          String(t.id) === value ? "combobox-khu-item-active" : ""
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => chon(String(t.id))}
                      >
                        {dongHienThi(t)}
                        {gan ? (
                          <span className="combobox-khu-item-muted">
                            {" "}
                            · đang gắn
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
