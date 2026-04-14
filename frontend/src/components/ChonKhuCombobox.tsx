"use client";

import { useEffect, useRef, useState } from "react";

export type MucKhu = { id: number; ten: string };

type Props = {
  danhSachKhu: MucKhu[];
  value: string;
  onChange: (idKhu: string) => void;
  disabled?: boolean;
  placeholderChuaChon?: string;
  placeholderTim?: string;
};

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
  const refGoc = useRef<HTMLDivElement>(null);

  const tenDaChon =
    value && danhSachKhu.find((k) => String(k.id) === value)?.ten;

  const danhSachLoc = danhSachKhu.filter((k) => {
    const q = tuKhoa.trim().toLowerCase();
    if (!q) return true;
    return (
      k.ten.toLowerCase().includes(q) || String(k.id).includes(q.trim())
    );
  });

  useEffect(() => {
    if (!mo) {
      setTuKhoa("");
      return;
    }
    const handler = (e: MouseEvent) => {
      if (!refGoc.current?.contains(e.target as Node)) {
        setMo(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mo]);

  const chon = (id: string) => {
    onChange(id);
    setMo(false);
    setTuKhoa("");
  };

  return (
    <div
      className={`combobox-khu ${disabled ? "combobox-khu-disabled" : ""}`}
      ref={refGoc}
    >
      <button
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
      {mo && !disabled && (
        <div className="combobox-khu-panel" role="listbox">
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
        </div>
      )}
    </div>
  );
}
