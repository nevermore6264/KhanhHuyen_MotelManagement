"use client";

import { useCallback, useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import { IconSend, IconEye, IconTimes } from "@/components/Icons";
import { useToast } from "@/components/NhaCungCapToast";
import { chuanHoaYeuCau, type YeuCauHang } from "@/lib/chuanHoaYeuCau";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiYeuCau } from "@/lib/trangThai";
import { layLocaleTag } from "@/lib/locale";

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

const formatNgay = (iso?: string, locale = "vi-VN") => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TrangYeuCau() {
  const { t: tr, lang } = useCaiDat();
  const localeTag = layLocaleTag(lang);
  const p = tr.pages.yeuCau;
  const pStaff = tr.pages.yeuCauHoTro;
  const s = tr.pages.shared;
  const c = tr.common;
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
      notify(pStaff.errLoad, "error");
    }
  }, [notify, pStaff.errLoad]);

  useEffect(() => {
    tai();
  }, [tai]);

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    const td = tieuDe.trim();
    if (!td) {
      notify(p.errTitle, "error");
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
      setThongBao(p.okSend);
      notify(p.okSend, "success");
      await tai();
    } catch {
      notify(p.errSend, "error");
    } finally {
      setDangGui(false);
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
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
              <IconSend /> {dangGui ? c.loading : p.send}
            </button>
            {thongBao && <div className="text-muted">{thongBao}</div>}
          </form>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>
            Danh sách yêu cầu của bạn
          </h3>
          {danhSach.length === 0 ? (
            <p className="text-muted">{p.empty}</p>
          ) : (
            <BangDonGian
              data={danhSach}
              columns={[
                { header: s.id, render: (r) => r.id },
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
                      {nhanTrangThaiYeuCau(tr, r.trangThai)}
                    </span>
                  ),
                },
                {
                  header: "Ngày gửi",
                  render: (r) => formatNgay(r.ngayTao, localeTag),
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
              {formatNgay(xemMoTa.ngayTao, localeTag)} ·{" "}
              {nhanTrangThaiYeuCau(tr, xemMoTa.trangThai)}
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
                <IconTimes /> {c.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </TrangBaoVe>
  );
}
