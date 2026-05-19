"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  mapThongBaoFromApi,
  type ThongBaoUi,
} from "@/lib/mapThongBaoApi";
import { useThongBao } from "./NhaCungCapThongBao";
import { IconCheck } from "@/components/Icons";

const TOI_DA_HIEN_THI = 25;

function dinhDangThoiGianGui(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}


export default function ChuongPopoverThongBao() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mo, setMo] = useState(false);
  const [danhSach, setDanhSach] = useState<ThongBaoUi[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const contextThongBao = useThongBao();
  const soChuaDoc = contextThongBao?.unreadCount ?? 0;
  const lastIncoming = contextThongBao?.lastIncoming;
  const tenantDocDuocDanhDau = vaiTro === "TENANT";

  useEffect(() => {
    setVaiTro(getRole());
  }, []);

  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    try {
      const phanHoi = await api.get("/thong-bao");
      const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
      const mapped = duLieu.map((x) =>
        mapThongBaoFromApi(x as Record<string, unknown>),
      );
      setDanhSach(mapped);
      contextThongBao?.refetchUnread(mapped);
    } catch {
      setDanhSach([]);
    } finally {
      setDangTai(false);
    }
  }, [contextThongBao]);


  useEffect(() => {
    if (!mo) return;
    taiDanhSach();
  }, [mo, lastIncoming, taiDanhSach]);

  useEffect(() => {
    const dong = (e: MouseEvent) => {
      if (!mo) return;
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setMo(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMo(false);
    };
    document.addEventListener("mousedown", dong);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", dong);
      document.removeEventListener("keydown", esc);
    };
  }, [mo]);

  const hienThi = useMemo(
    () => danhSach.slice(0, TOI_DA_HIEN_THI),
    [danhSach],
  );

  const danhDauDaDoc = async (id: string) => {
    try {
      await api.put(`/thong-bao/${id}/da-doc`);
      setDanhSach((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n)),
      );
      await contextThongBao?.refetchUnread();
    } catch {

    }
  };

  return (
    <div className="nav-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`nav-bell${mo ? " nav-bell-open" : ""}`}
        title="Thông báo"
        aria-label={
          soChuaDoc > 0 ? `${soChuaDoc} thông báo chưa đọc` : "Thông báo"
        }
        aria-expanded={mo}
        aria-haspopup="dialog"
        onClick={() => setMo((v) => !v)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {soChuaDoc > 0 && (
          <span className="nav-bell-badge" aria-hidden="true">
            {soChuaDoc > 99 ? "99+" : soChuaDoc}
          </span>
        )}
      </button>

      {mo && (
        <div
          className="nav-thong-bao-popover"
          role="dialog"
          aria-label="Danh sách thông báo"
        >
          <div className="nav-thong-bao-popover-head">
            <span className="nav-thong-bao-popover-title">Thông báo</span>
          </div>
          <div className="nav-thong-bao-popover-body">
            {dangTai && (
              <p className="nav-thong-bao-popover-empty">Đang tải…</p>
            )}
            {!dangTai && hienThi.length === 0 && (
              <p className="nav-thong-bao-popover-empty">Chưa có thông báo.</p>
            )}
            {!dangTai &&
              hienThi.map((n) => (
                <div
                  key={n.id}
                  className={`nav-thong-bao-item${n.readFlag ? "" : " nav-thong-bao-item-unread"}`}
                >
                  <div className="nav-thong-bao-item-main">
                    <p className="nav-thong-bao-item-text">{n.message}</p>
                    <time
                      className="nav-thong-bao-item-time"
                      dateTime={n.sentAt || undefined}
                    >
                      {dinhDangThoiGianGui(n.sentAt)}
                    </time>
                  </div>
                  {tenantDocDuocDanhDau && !n.readFlag && (
                    <button
                      type="button"
                      className="btn btn-secondary nav-thong-bao-item-action"
                      title="Đánh dấu đã đọc"
                      onClick={() => danhDauDaDoc(n.id)}
                    >
                      <IconCheck /> Đã đọc
                    </button>
                  )}
                </div>
              ))}
          </div>
          <div className="nav-thong-bao-popover-foot">
            <Link
              href="/thong-bao"
              className="nav-thong-bao-popover-link"
              onClick={() => setMo(false)}
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
