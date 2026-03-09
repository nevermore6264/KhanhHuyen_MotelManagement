"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
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

type ServicePrice = {
  id: number;
  giaPhong?: number;
  giaDien?: number;
  giaNuoc?: number;
  hieuLucTu?: string;
};

const dinhDangTien = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

const dinhDangNgayDMY = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const dinhDangNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
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
      setLoi("Vui lòng nhập đầy đủ giá điện, giá nước và ngày hiệu lực");
      return;
    }
    setLoi("");
    await api.post("/bang-gia-dich-vu", {
      giaPhong: null,
      giaDien: gd,
      giaNuoc: gn,
      hieuLucTu: ngayHieuLuc,
    });
    notify("Thêm bảng giá thành công", "success");
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
        ? dinhDangNhapTien(String(phanTu.giaDien))
        : "",
    );
    setGiaNuocSua(
      phanTu.giaNuoc != null
        ? dinhDangNhapTien(String(phanTu.giaNuoc))
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
      setLoiSua("Vui lòng nhập đầy đủ giá điện, giá nước và ngày hiệu lực");
      return;
    }
    setLoiSua("");
    await api.put(`/bang-gia-dich-vu/${phanTuDangSua.id}`, {
      giaPhong: null,
      giaDien: gd,
      giaNuoc: gn,
      hieuLucTu: ngayHieuLucSua,
    });
    notify("Cập nhật bảng giá thành công", "success");
    setPhanTuDangSua(null);
    tai();
  };

  const xoaPhanTu = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bảng giá này?")) return;
    await api.delete(`/bang-gia-dich-vu/${id}`);
    notify("Đã xóa bảng giá", "success");
    tai();
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Bảng giá dịch vụ</h2>
        <div className="card service-price-intro">
          <p className="service-price-intro-title">
            Màn hình này dùng để làm gì?
          </p>
          <ul className="service-price-intro-list">
            <li>
              <strong>Giá điện (VNĐ/kWh) và giá nước (VNĐ/m³)</strong> — Dùng để
              tính tiền điện, nước trong hóa đơn khi bạn nhập số công tơ (ở mục{" "}
              <strong>Ghi số điện nước</strong> hoặc khi lập hóa đơn). Hệ thống
              sẽ chọn bảng giá có <strong>ngày hiệu lực</strong> phù hợp với
              tháng tính tiền.
            </li>
            <li>
              <strong>Giá phòng</strong> — Không cấu hình ở đây. Giá thuê phòng
              được đặt theo từng phòng trong mục <strong>Phòng</strong> (khi
              thêm/sửa phòng).
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>Bảng giá hiện hành</h3>
              <p className="card-subtitle">
                {danhSach.length === 0
                  ? "Chưa có giá. Bấm bên phải để thiết lập giá điện và giá nước (chỉ cần một bộ giá)."
                  : "Chỉ cần một bộ giá điện + giá nước. Dùng Sửa để cập nhật, không cần thêm bản ghi mới."}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {laQuanTri && danhSach.length === 0 && (
                <button className="btn" onClick={() => setHienThiTaoMoi(true)}>
                  <IconPlus /> Thiết lập giá điện & nước
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Giá điện (VNĐ/kWh) và giá nước (VNĐ/m³) dùng để tính tiền theo số
            công tơ. Giá phòng lấy theo từng phòng (cấu hình ở mục Phòng).
          </p>
          <BangDonGian
            data={danhSach}
            columns={[
              { header: "ID", render: (i: ServicePrice) => i.id },
              {
                header: "Giá điện (VNĐ/kWh)",
                render: (i: ServicePrice) => dinhDangTien(i.giaDien),
              },
              {
                header: "Giá nước (VNĐ/m³)",
                render: (i: ServicePrice) => dinhDangTien(i.giaNuoc),
              },
              {
                header: "Ngày hiệu lực",
                render: (i: ServicePrice) => dinhDangNgayDMY(i.hieuLucTu),
              },
              ...(laQuanTri
                ? [
                    {
                      header: "Thao tác",
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
                            <IconPencil /> Sửa
                          </button>
                          {danhSach.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => xoaPhanTu(i.id)}
                            >
                              <IconTrash /> Xóa
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
                  <h3>Thêm bảng giá</h3>
                  <p className="card-subtitle">Thiết lập giá dịch vụ</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">
                    Giá điện (VNĐ/kWh) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 3.500"
                      inputMode="numeric"
                      value={giaDien}
                      onChange={(e) =>
                        setGiaDien(dinhDangNhapTien(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá nước (VNĐ/m³) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 15.000"
                      inputMode="numeric"
                      value={giaNuoc}
                      onChange={(e) =>
                        setGiaNuoc(dinhDangNhapTien(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Ngày hiệu lực <span className="required">*</span>
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
                    <IconTimes /> Hủy
                  </button>
                  <button className="btn" type="submit">
                    <IconCheck /> Lưu bảng giá
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
                  <h3>Sửa bảng giá</h3>
                  <p className="card-subtitle">
                    Cập nhật giá dịch vụ (hiệu lực từ ngày)
                  </p>
                </div>
              </div>
              <form onSubmit={luuSua} className="form-grid">
                <div>
                  <label className="field-label">
                    Giá điện (VNĐ/kWh) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 3.500"
                      inputMode="numeric"
                      value={giaDienSua}
                      onChange={(e) =>
                        setGiaDienSua(dinhDangNhapTien(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá nước (VNĐ/m³) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 15.000"
                      inputMode="numeric"
                      value={giaNuocSua}
                      onChange={(e) =>
                        setGiaNuocSua(dinhDangNhapTien(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Ngày hiệu lực <span className="required">*</span>
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
                    <IconTimes /> Hủy
                  </button>
                  <button className="btn" type="submit">
                    <IconCheck /> Lưu thay đổi
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
