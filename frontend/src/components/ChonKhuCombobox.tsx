"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type MucKhu = { id: number; ten: string };

type Props = {
  danhSachKhu: MucKhu[];
  value: string;
  onChange: (idKhu: string) => void;
  disabled?: boolean;
  placeholderChuaChon?: string;
  placeholderTim?: string;
};

type ViTri = { top: number; left: number; width: number };

export default function ChonKhuCombobox({
  danhSachKhu,
  value,
  onChange,
  disabled = false,
  placeholderChuaChon = "Chọn khu",
  placeholderTim = "Tìm theo tên khu hoặc mã…",
}: Props) {
  const [mo, setMo] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const [viTri, setViTri] = useState<ViTri | null>(null);
  const [sanSangPortal, setSanSangPortal] = useState(false);

  const refGoc = useRef<HTMLDivElement>(null);
  const refNut = useRef<HTMLButtonElement>(null);
  const refPanel = useRef<HTMLDivElement>(null);

  const tenDaChon =
    value && danhSachKhu.find((k) => String(k.id) === value)?.ten;

  const danhSachLoc = danhSachKhu.filter((k) => {
    const q = tuKhoa.trim().toLowerCase();
    if (!q) return true;
    return (
      k.ten.toLowerCase().includes(q) || String(k.id).includes(q.trim())
    );
  });

  const capNhatViTri = useCallback(() => {
    const el = refNut.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setViTri({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 200),
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
        <span className={tenDaChon ? "" : "combobox-khu-placeholder"}>
          {tenDaChon || placeholderChuaChon}
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
              maxHeight: `min(320px, calc(100vh - ${viTri.top + 8}px))`,
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
                <li className="combobox-khu-empty">Không có khu phù hợp</li>
              ) : (
                danhSachLoc.map((k) => (
                  <li key={k.id}>
                    <button
                      type="button"
                      className={`combobox-khu-item ${
                        String(k.id) === value ? "combobox-khu-item-active" : ""
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => chon(String(k.id))}
                    >
                      {k.ten}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
