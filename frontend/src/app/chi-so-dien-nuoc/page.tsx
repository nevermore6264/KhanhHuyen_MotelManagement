"use client";

import { useEffect, useMemo, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconCheck } from "@/components/Icons";
import api from "@/lib/api";
import { useToast } from "@/components/NhaCungCapToast";

type Area = { id: number; name: string };
type Room = { id: number; code: string; area?: Area };
type MeterReading = {
  id: number;
  room?: Room;
  month: number;
  year: number;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  totalCost?: number;
};

const dinhDangTien = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

/** Chỉ cho phép tháng hiện tại hoặc tháng trước đó */
const laThangChoPhep = (thang: number, nam: number): boolean => {
  const bayGio = new Date();
  const thangHienTai = bayGio.getMonth() + 1;
  const namHienTai = bayGio.getFullYear();
  if (nam === namHienTai && thang === thangHienTai) return true;
  if (thangHienTai === 1) {
    return nam === namHienTai - 1 && thang === 12;
  }
  return nam === namHienTai && thang === thangHienTai - 1;
};

export default function TrangChiSoDienNuoc() {
  const [danhSachChiSo, setDanhSachChiSo] = useState<MeterReading[]>([]);
  const [danhSachPhong, setDanhSachPhong] = useState<Room[]>([]);
  const [danhSachKhu, setDanhSachKhu] = useState<Area[]>([]);
  const [idKhu, setIdKhu] = useState("");
  const [phongDangChon, setPhongDangChon] = useState<Room | null>(null);
  const [idPhong, setIdPhong] = useState("");
  const [thang, setThang] = useState("");
  const [nam, setNam] = useState("");
  const [dienCu, setDienCu] = useState("");
  const [dienMoi, setDienMoi] = useState("");
  const [nuocCu, setNuocCu] = useState("");
  const [nuocMoi, setNuocMoi] = useState("");
  const [loi, setLoi] = useState("");
  const [idKhuLoc, setIdKhuLoc] = useState("");
  const [idPhongLoc, setIdPhongLoc] = useState("");
  const { notify } = useToast();

  const tai = async () => {
    const [resChiSo, resPhong, resKhu] = await Promise.all([
      api.get("/chi-so-dien-nuoc"),
      api.get("/phong"),
      api.get("/khu-vuc"),
    ]);
    setDanhSachChiSo(resChiSo.data);
    setDanhSachPhong(resPhong.data);
    setDanhSachKhu(resKhu.data);
  };

  useEffect(() => {
    tai();
  }, []);

  const phongTheoKhu = useMemo(() => {
    if (!idKhu) return danhSachPhong;
    return danhSachPhong.filter((r) => String(r.area?.id) === idKhu);
  }, [danhSachPhong, idKhu]);

  const lichSuPhong = useMemo(() => {
    if (!phongDangChon) return [];
    return danhSachChiSo
      .filter((r) => r.room?.id === phongDangChon.id)
      .sort((a, b) =>
        a.year === b.year ? b.month - a.month : b.year - a.year,
      );
  }, [danhSachChiSo, phongDangChon]);

  const danhSachChiSoLoc = useMemo(() => {
    if (!idPhongLoc) return danhSachChiSo;
    return danhSachChiSo.filter((r) => String(r.room?.id) === idPhongLoc);
  }, [danhSachChiSo, idPhongLoc]);

  const phongTheoKhuLoc = useMemo(() => {
    if (!idKhuLoc) return danhSachPhong;
    return danhSachPhong.filter((r) => String(r.area?.id) === idKhuLoc);
  }, [danhSachPhong, idKhuLoc]);

  useEffect(() => {
    if (!phongDangChon) return;
    setIdPhong(String(phongDangChon.id));
    const bayGio = new Date();
    setThang(String(bayGio.getMonth() + 1));
    setNam(String(bayGio.getFullYear()));
    const moiNhat = lichSuPhong[0];
    setDienCu(moiNhat ? String(moiNhat.newElectric ?? 0) : "");
    setNuocCu(moiNhat ? String(moiNhat.newWater ?? 0) : "");
    setDienMoi("");
    setNuocMoi("");
    setLoi("");
  }, [phongDangChon, lichSuPhong]);

  const tao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPhong) {
      setLoi("Vui lòng chọn phòng");
      return;
    }
    if (!thang || !nam) {
      setLoi("Vui lòng nhập tháng và năm");
      return;
    }
    const m = Number(thang);
    const y = Number(nam);
    if (!laThangChoPhep(m, y)) {
      setLoi("Chỉ được nhập chỉ số cho tháng hiện tại hoặc tháng trước đó.");
      return;
    }
    setLoi("");
    try {
      await api.post("/chi-so-dien-nuoc", {
        phong: { id: Number(idPhong) },
        thang: m,
        nam: y,
        dienCu: Number(dienCu || 0),
        dienMoi: Number(dienMoi || 0),
        nuocCu: Number(nuocCu || 0),
        nuocMoi: Number(nuocMoi || 0),
      });
      notify("Lưu chỉ số thành công", "success");
      setIdPhong("");
      setThang("");
      setNam("");
      setDienCu("");
      setDienMoi("");
      setNuocCu("");
      setNuocMoi("");
      setPhongDangChon(null);
      tai();
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const status = ax?.response?.status;
      const thongBao =
        status === 403
          ? "Bạn không có quyền thao tác"
          : status === 400
            ? "Chỉ được nhập chỉ số cho tháng hiện tại hoặc tháng trước đó."
            : "Lưu chỉ số thất bại";
      setLoi(thongBao);
      notify(thongBao, "error");
    }
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Nhập chỉ số điện nước</h2>
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Chọn khu & phòng</h3>
              <p className="card-subtitle">Chọn khu để xem danh sách phòng</p>
            </div>
          </div>
          <div className="area-selector">
            <button
              className={`area-pill ${idKhu === "" ? "active" : ""}`}
              onClick={() => setIdKhu("")}
            >
              Tất cả
            </button>
            {danhSachKhu.map((a) => (
              <button
                key={a.id}
                className={`area-pill ${String(a.id) === idKhu ? "active" : ""}`}
                onClick={() => setIdKhu(String(a.id))}
              >
                {a.name}
              </button>
            ))}
          </div>
          <div className="room-list">
            {phongTheoKhu.map((r) => (
              <button
                key={r.id}
                className={`room-row ${phongDangChon?.id === r.id ? "active" : ""}`}
                onClick={() => setPhongDangChon(r)}
              >
                <span>{r.code}</span>
                <span className="room-sub">Xem chỉ số</span>
              </button>
            ))}
            {phongTheoKhu.length === 0 && (
              <div className="room-empty">Không có phòng trong khu này.</div>
            )}
          </div>
        </div>

        {phongDangChon && (
          <div className="card meter-panel">
            <div className="card-header">
              <div>
                <h3>Phòng {phongDangChon.code}</h3>
                <p className="card-subtitle">
                  Xem lịch sử và nhập chỉ số tháng hiện tại
                </p>
              </div>
            </div>
            <div className="meter-grid">
              <div className="meter-history">
                <div className="chart-title">Các tháng trước</div>
                <div className="history-list">
                  {lichSuPhong.length === 0 && (
                    <div className="history-empty">Chưa có dữ liệu.</div>
                  )}
                  {lichSuPhong.map((r) => (
                    <div key={r.id} className="history-row">
                      <div className="history-title">
                        {r.month}/{r.year}
                      </div>
                      <div className="history-meta">
                        Điện: {r.oldElectric}-{r.newElectric} • Nước:{" "}
                        {r.oldWater}-{r.newWater}
                      </div>
                      <div className="history-total">
                        Tổng: {dinhDangTien(r.totalCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">Tháng</label>
                  <input
                    placeholder="Tháng"
                    value={thang}
                    onChange={(e) => setThang(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Năm</label>
                  <input
                    placeholder="Năm"
                    value={nam}
                    onChange={(e) => setNam(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số điện cũ</label>
                  <input
                    placeholder="Số điện cũ"
                    value={dienCu}
                    onChange={(e) => setDienCu(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số điện mới</label>
                  <input
                    placeholder="Số điện mới"
                    value={dienMoi}
                    onChange={(e) => setDienMoi(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số nước cũ</label>
                  <input
                    placeholder="Số nước cũ"
                    value={nuocCu}
                    onChange={(e) => setNuocCu(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số nước mới</label>
                  <input
                    placeholder="Số nước mới"
                    value={nuocMoi}
                    onChange={(e) => setNuocMoi(e.target.value)}
                  />
                </div>
                {loi && <div className="form-error">{loi}</div>}
                <div className="form-actions">
                  <button className="btn" type="submit">
                    <IconCheck /> Lưu chỉ số
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div
            className="form-grid"
            style={{ marginBottom: 16, maxWidth: 400 }}
          >
            <div>
              <label className="field-label">Lọc theo khu</label>
              <select
                value={idKhuLoc}
                onChange={(e) => {
                  setIdKhuLoc(e.target.value);
                  setIdPhongLoc("");
                }}
              >
                <option value="">Tất cả khu</option>
                {danhSachKhu.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Lọc theo phòng</label>
              <select
                value={idPhongLoc}
                onChange={(e) => setIdPhongLoc(e.target.value)}
              >
                <option value="">Tất cả phòng</option>
                {phongTheoKhuLoc.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}
                    {r.area?.name ? ` (${r.area.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <BangDonGian
            data={danhSachChiSoLoc}
            columns={[
              { header: "ID", render: (r: MeterReading) => r.id },
              {
                header: "Phòng",
                render: (r: MeterReading) => r.room?.code ?? "—",
              },
              {
                header: "Tháng/Năm",
                render: (r: MeterReading) => `${r.month}/${r.year}`,
              },
              {
                header: "Điện (cũ → mới)",
                render: (r: MeterReading) =>
                  `${r.oldElectric} → ${r.newElectric}`,
              },
              {
                header: "Nước (cũ → mới)",
                render: (r: MeterReading) => `${r.oldWater} → ${r.newWater}`,
              },
              {
                header: "Tổng tiền",
                render: (r: MeterReading) => dinhDangTien(r.totalCost),
              },
            ]}
          />
        </div>
      </div>
    </TrangBaoVe>
  );
}
