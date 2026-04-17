"use client";

import { useCallback, useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import { IconSend, IconEye, IconTimes } from "@/components/Icons";
import { useToast } from "@/components/NhaCungCapToast";

type YeuCauHang = {
  id: number;
  tieuDe: string;
  moTa?: string;
  trangThai: string;
  ngayTao?: string;
};

const statusLabel = (value?: string) => {
  switch (value) {
    case "OPEN":
      return "Mới";
    case "IN_PROGRESS":
      return "Đang xử lý";
    case "RESOLVED":
      return "Đã xử lý";
    case "CLOSED":
      return "Đã đóng";
    default:
      return value || "—";
  }
};

const statusClass = (value?: string) => {
  switch (value) {
    case "OPEN":
      return "status-occupied";
    case "IN_PROGRESS":
      return "status-maintenance";
    case "RESOLVED":
      return "status-available";
    case "CLOSED":
      return "status-unknown";
    default:
      return "status-unknown";
  }
};

function chuanHoaYeuCau(raw: unknown): YeuCauHang {
  const r = raw as Record<string, unknown>;
  const tt = r.trangThai;
  let trangThai = "";
  if (typeof tt === "string") trangThai = tt;
  else if (tt && typeof tt === "object" && "name" in tt) {
    trangThai = String((tt as { name?: string }).name ?? "");
  } else if (tt != null) trangThai = String(tt);
  let ngayStr: string | undefined;
  const nt = r.ngayTao;
  if (typeof nt === "string") ngayStr = nt;
  else if (Array.isArray(nt) && nt.length >= 3) {
    const y = Number(nt[0]);
    const m = Number(nt[1]);
    const d = Number(nt[2]);
    const h = nt.length > 3 ? Number(nt[3]) : 0;
    const mi = nt.length > 4 ? Number(nt[4]) : 0;
    const s = nt.length > 5 ? Number(nt[5]) : 0;
    if (y) ngayStr = new Date(y, m - 1, d, h, mi, s).toISOString();
  }
  return {
    id: Number(r.id),
    tieuDe: String(r.tieuDe ?? r.title ?? "").trim(),
    moTa:
      r.moTa != null
        ? String(r.moTa)
        : r.description != null
          ? String(r.description)
          : undefined,
    trangThai,
    ngayTao: ngayStr,
  };
}

const formatNgay = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TrangYeuCau() {
  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [danhSach, setDanhSach] = useState<YeuCauHang[]>([]);
  const [dangGui, setDangGui] = useState(false);
  const [xemMoTa, setXemMoTa] = useState<YeuCauHang | null>(null);
  const { notify } = useToast();

  const tai = useCallback(async () => {
    try {
      const res = await api.get("/yeu-cau-ho-tro");
      const arr = Array.isArray(res.data) ? res.data : [];
      setDanhSach(arr.map(chuanHoaYeuCau));
    } catch {
      setDanhSach([]);
      notify("Không tải được danh sách yêu cầu.", "error");
    }
  }, [notify]);

  useEffect(() => {
    tai();
  }, [tai]);

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    const td = tieuDe.trim();
    if (!td) {
      notify("Vui lòng nhập tiêu đề.", "error");
      return;
    }
    setDangGui(true);
    setThongBao("");
    try {
      await api.post("/yeu-cau-ho-tro", {
        tieuDe: td,
        moTa: moTa.trim() || undefined,
      });
      setTieuDe("");
      setMoTa("");
      setThongBao("Đã gửi yêu cầu hỗ trợ.");
      notify("Đã gửi yêu cầu.", "success");
      await tai();
    } catch {
      notify("Gửi yêu cầu thất bại. Thử lại sau.", "error");
    } finally {
      setDangGui(false);
    }
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Gửi yêu cầu hỗ trợ</h2>
        <div className="card">
          <form onSubmit={gui} className="grid">
            <input
              placeholder="Tiêu đề"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              required
            />
            <textarea
              placeholder="Mô tả"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              rows={4}
            />
            <button className="btn" type="submit" disabled={dangGui}>
              <IconSend /> {dangGui ? "Đang gửi…" : "Gửi yêu cầu"}
            </button>
            {thongBao && <div className="text-muted">{thongBao}</div>}
          </form>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>
            Danh sách yêu cầu của bạn
          </h3>
          {danhSach.length === 0 ? (
            <p className="text-muted">Chưa có yêu cầu nào.</p>
          ) : (
            <BangDonGian
              data={danhSach}
              columns={[
                { header: "ID", render: (r) => r.id },
                {
                  header: "Tiêu đề",
                  render: (r) => (
                    <span title={r.tieuDe}>
                      {r.tieuDe.length > 48
                        ? `${r.tieuDe.slice(0, 48)}…`
                        : r.tieuDe}
                    </span>
                  ),
                },
                {
                  header: "Trạng thái",
                  render: (r) => (
                    <span
                      className={`status-badge ${statusClass(r.trangThai)}`}
                    >
                      {statusLabel(r.trangThai)}
                    </span>
                  ),
                },
                {
                  header: "Ngày gửi",
                  render: (r) => formatNgay(r.ngayTao),
                },
                {
                  header: "",
                  render: (r) => (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setXemMoTa(r)}
                    >
                      <IconEye /> Mô tả
                    </button>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>

      {xemMoTa && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setXemMoTa(null)}
        >
          <div
            className="modal-card form-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Yêu cầu #{xemMoTa.id}</h3>
            <p>
              <strong>{xemMoTa.tieuDe}</strong>
            </p>
            <p className="text-muted" style={{ fontSize: 14 }}>
              {formatNgay(xemMoTa.ngayTao)} · {statusLabel(xemMoTa.trangThai)}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {xemMoTa.moTa?.trim() ? xemMoTa.moTa : "Không có mô tả."}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setXemMoTa(null)}
              >
                <IconTimes /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </TrangBaoVe>
  );
}
