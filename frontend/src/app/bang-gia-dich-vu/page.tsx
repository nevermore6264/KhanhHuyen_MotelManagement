"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconTimes,
  IconCheck,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { layLocaleTag, dinhDangTien as dinhDangTienLocale } from "@/lib/locale";

type ServicePrice = {
  id: string;
  giaPhong?: number;
  giaDien?: number;
  giaNuoc?: number;
  hieuLucTu?: string;
};

const dinhDangNgayDMY = (dateStr?: string, localeTag = "vi-VN") => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const dinhDangNhapTien = (value: string, localeTag: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat(localeTag).format(Number(digits));
};

const parseNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

export default function TrangBangGiaDichVu() {
  const [danhSach, setDanhSach] = useState<ServicePrice[]>([]);
  const [giaDien, setGiaDien] = useState("");
  const [giaNuoc, setGiaNuoc] = useState("");
  const [ngayHieuLuc, setNgayHieuLuc] = useState("");
  const [loi, setLoi] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const [phanTuDangSua, setPhanTuDangSua] = useState<ServicePrice | null>(null);
  const [giaDienSua, setGiaDienSua] = useState("");
  const [giaNuocSua, setGiaNuocSua] = useState("");
  const [ngayHieuLucSua, setNgayHieuLucSua] = useState("");
  const [loiSua, setLoiSua] = useState("");
  const [vaiTro, setVaiTro] = useState<string | null>(null);
  const laQuanTri = vaiTro === "ADMIN";
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.bangGia;
  const s = tr.pages.shared;
  const c = tr.common;
  const localeTag = layLocaleTag(lang);
  const dinhDangTien = (n?: number | null) =>
    n == null || isNaN(n) ? "—" : dinhDangTienLocale(Math.round(Number(n)), lang);

  useEffect(() => {
    setVaiTro(getRole());
  }, []);

  const tai = async () => {
    const phanHoi = await api.get("/bang-gia-dich-vu");
    setDanhSach(phanHoi.data);
  };

  useEffect(() => {
    if (vaiTro !== null) tai();
  }, [vaiTro]);

  const tao = async (e: React.FormEvent) => {
    e.preventDefault();
    const gd = parseNhapTien(giaDien);
    const gn = parseNhapTien(giaNuoc);
    if (gd == null || gn == null || !ngayHieuLuc) {
      setLoi(p.errRequired);
      return;
    }
    setLoi("");
    await api.post("/bang-gia-dich-vu", {
      giaPhong: null,
      giaDien: gd,
      giaNuoc: gn,
      hieuLucTu: ngayHieuLuc,
    });
    notify(p.okAdd, "success");
    setGiaDien("");
    setGiaNuoc("");
    setNgayHieuLuc("");
    setHienThiTaoMoi(false);
    tai();
  };

  const batDauSua = (phanTu: ServicePrice) => {
    setPhanTuDangSua(phanTu);
    setGiaDienSua(
      phanTu.giaDien != null
        ? dinhDangNhapTien(String(phanTu.giaDien), localeTag)
        : "",
    );
    setGiaNuocSua(
      phanTu.giaNuoc != null
        ? dinhDangNhapTien(String(phanTu.giaNuoc), localeTag)
        : "",
    );
    setNgayHieuLucSua(phanTu.hieuLucTu || "");
    setLoiSua("");
  };

  const luuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phanTuDangSua) return;
    const gd = parseNhapTien(giaDienSua);
    const gn = parseNhapTien(giaNuocSua);
    if (gd == null || gn == null || !ngayHieuLucSua) {
      setLoiSua(p.errRequired);
      return;
    }
    setLoiSua("");
    await api.put(`/bang-gia-dich-vu/${phanTuDangSua.id}`, {
      giaPhong: null,
      giaDien: gd,
      giaNuoc: gn,
      hieuLucTu: ngayHieuLucSua,
    });
    notify(p.okUpdate, "success");
    setPhanTuDangSua(null);
    tai();
  };

  const xoaPhanTu = async (id: string) => {
    if (!confirm(p.confirmDelete)) return;
    await api.delete(`/bang-gia-dich-vu/${id}`);
    notify(p.okDelete, "success");
    tai();
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card service-price-intro">
          <p className="service-price-intro-title">{p.introTitle}</p>
          <ul className="service-price-intro-list">
            <li>
              <strong>{p.introElecBold}</strong>
              {p.introElecRest}
            </li>
            <li>
              <strong>{p.introRoomBold}</strong>
              {p.introRoomRest}
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>{p.currentTitle}</h3>
              <p className="card-subtitle">
                {danhSach.length === 0 ? p.noPrice : p.noPrice}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {laQuanTri && danhSach.length === 0 && (
                <button className="btn" onClick={() => setHienThiTaoMoi(true)}>
                  <IconPlus /> {p.setupBtn}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            {p.tableNote}
          </p>
          <BangDonGian
            data={danhSach}
            columns={[
              { header: s.id, render: (i: ServicePrice) => i.id },
              {
                header: p.colElec,
                render: (i: ServicePrice) => dinhDangTien(i.giaDien),
              },
              {
                header: p.colWater,
                render: (i: ServicePrice) => dinhDangTien(i.giaNuoc),
              },
              {
                header: p.colEffective,
                render: (i: ServicePrice) =>
                  dinhDangNgayDMY(i.hieuLucTu, localeTag),
              },
              ...(laQuanTri
                ? [
                    {
                      header: s.actions,
                      render: (i: ServicePrice) => (
                        <span
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => batDauSua(i)}
                          >
                            <IconPencil /> {s.edit}
                          </button>
                          {danhSach.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => xoaPhanTu(i.id)}
                            >
                              <IconTrash /> {s.delete}
                            </button>
                          )}
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {hienThiTaoMoi && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.addTitle}</h3>
                  <p className="card-subtitle">{p.setupSub}</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">
                    {p.elecLabel} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.elecPh}
                      inputMode="numeric"
                      value={giaDien}
                      onChange={(e) =>
                        setGiaDien(dinhDangNhapTien(e.target.value, localeTag))
                      }
                    />
                    <span>{p.currency}</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    {p.waterLabel} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.waterPh}
                      inputMode="numeric"
                      value={giaNuoc}
                      onChange={(e) =>
                        setGiaNuoc(dinhDangNhapTien(e.target.value, localeTag))
                      }
                    />
                    <span>{p.currency}</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    {p.effectiveLabel} <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngayHieuLuc}
                    onChange={(e) => setNgayHieuLuc(e.target.value)}
                  />
                </div>
                {loi && <div className="form-error">{loi}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setHienThiTaoMoi(false)}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconCheck /> {p.savePrice}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {phanTuDangSua && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.editTitle}</h3>
                  <p className="card-subtitle">{p.editSub}</p>
                </div>
              </div>
              <form onSubmit={luuSua} className="form-grid">
                <div>
                  <label className="field-label">
                    {p.elecLabel} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.elecPh}
                      inputMode="numeric"
                      value={giaDienSua}
                      onChange={(e) =>
                        setGiaDienSua(
                          dinhDangNhapTien(e.target.value, localeTag),
                        )
                      }
                    />
                    <span>{p.currency}</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    {p.waterLabel} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.waterPh}
                      inputMode="numeric"
                      value={giaNuocSua}
                      onChange={(e) =>
                        setGiaNuocSua(
                          dinhDangNhapTien(e.target.value, localeTag),
                        )
                      }
                    />
                    <span>{p.currency}</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    {p.effectiveLabel} <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngayHieuLucSua}
                    onChange={(e) => setNgayHieuLucSua(e.target.value)}
                  />
                </div>
                {loiSua && <div className="form-error">{loiSua}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setPhanTuDangSua(null)}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconCheck /> {p.saveChanges}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
