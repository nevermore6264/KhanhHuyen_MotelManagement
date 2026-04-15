"use client";

import { useEffect, useMemo, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconCheck, IconChevronDown, IconChevronUp } from "@/components/Icons";
import api from "@/lib/api";
import { useToast } from "@/components/NhaCungCapToast";
import ChonKhuCombobox from "@/components/ChonKhuCombobox";

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
  tienDien?: number;
  tienNuoc?: number;
};

type RawJson = Record<string, unknown>;

/** Spring: KhuVuc — ten; Phong — maPhong, khuVuc; ChiSoDienNuoc — phong, thang, nam, dienCu… */
function chuanHoaKhuTuApi(raw: RawJson): Area {
  const r = raw;
  return {
    id: Number(r.id),
    name: String(r.ten ?? r.name ?? "").trim(),
  };
}

function chuanHoaPhongTuApi(raw: RawJson): Room {
  const r = raw;
  const kv = r.khuVuc ?? r.area;
  const kvObj =
    kv && typeof kv === "object" ? (kv as RawJson) : undefined;
  return {
    id: Number(r.id),
    code: String(r.maPhong ?? r.ma_phong ?? r.code ?? "").trim(),
    area: kvObj
      ? {
          id: Number(kvObj.id),
          name: String(kvObj.ten ?? kvObj.name ?? "").trim(),
        }
      : undefined,
  };
}

/** Hiển thị: "Tên khu - Mã phòng" (dễ nhận diện khi nhiều khu). */
function tenKhuVaPhong(room?: Room | null): string {
  if (!room) return "—";
  const tenKhu = (room.area?.name || "").trim();
  const ma = (room.code || "").trim();
  if (tenKhu && ma) return `${tenKhu} - ${ma}`;
  return ma || tenKhu || "—";
}

function chuanHoaChiSoTuApi(raw: RawJson): MeterReading {
  const r = raw;
  const phongRaw = r.phong ?? r.room;
  const phongObj =
    phongRaw && typeof phongRaw === "object"
      ? chuanHoaPhongTuApi(phongRaw as RawJson)
      : undefined;
  return {
    id: Number(r.id),
    room: phongObj,
    month: Number(r.thang ?? r.month ?? 0),
    year: Number(r.nam ?? r.year ?? 0),
    oldElectric: Number(r.dienCu ?? r.oldElectric ?? 0),
    newElectric: Number(r.dienMoi ?? r.newElectric ?? 0),
    oldWater: Number(r.nuocCu ?? r.oldWater ?? 0),
    newWater: Number(r.nuocMoi ?? r.newWater ?? 0),
    tienDien:
      r.tienDien != null ? Number(r.tienDien) : undefined,
    tienNuoc:
      r.tienNuoc != null ? Number(r.tienNuoc) : undefined,
  };
}

const dinhDangTien = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

const tongTienDienNuoc = (r: MeterReading) => {
  const d = Number(r.tienDien ?? 0);
  const n = Number(r.tienNuoc ?? 0);
  if (!d && !n) return null;
  return d + n;
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
  /** true = hiện đầy đủ khu + lưới phòng; false = thu gọn tiết kiệm chỗ */
  const [moChonKhuPhong, setMoChonKhuPhong] = useState(true);
  const { notify } = useToast();

  const tai = async () => {
    const [resChiSo, resPhong, resKhu] = await Promise.all([
      api.get("/chi-so-dien-nuoc"),
      api.get("/phong"),
      api.get("/khu-vuc"),
    ]);
    const mangChiSo = Array.isArray(resChiSo.data) ? resChiSo.data : [];
    const mangPhong = Array.isArray(resPhong.data) ? resPhong.data : [];
    const mangKhu = Array.isArray(resKhu.data) ? resKhu.data : [];
    setDanhSachChiSo(mangChiSo.map((x) => chuanHoaChiSoTuApi(x as RawJson)));
    setDanhSachPhong(mangPhong.map((x) => chuanHoaPhongTuApi(x as RawJson)));
    setDanhSachKhu(mangKhu.map((x) => chuanHoaKhuTuApi(x as RawJson)));
  };

  useEffect(() => {
    tai();
  }, []);

  const phongTheoKhu = useMemo(() => {
    if (!idKhu) return danhSachPhong;
    return danhSachPhong.filter((r) => String(r.area?.id) === idKhu);
  }, [danhSachPhong, idKhu]);

  /** Gom phòng theo khu; thứ tự khu theo danh sách khu API, cuối là phòng chưa gán khu. */
  const phongNhomTheoKhu = useMemo(() => {
    const nhomMap = new Map<string, { ten: string; phong: Room[] }>();
    for (const p of phongTheoKhu) {
      const kid =
        p.area?.id != null ? String(p.area.id) : "_none";
      const ten = (p.area?.name || "").trim() || "Chưa gán khu";
      if (!nhomMap.has(kid)) {
        nhomMap.set(kid, { ten, phong: [] });
      }
      nhomMap.get(kid)!.phong.push(p);
    }
    for (const v of nhomMap.values()) {
      v.phong.sort((a, b) =>
        a.code.localeCompare(b.code, "vi", { numeric: true }),
      );
    }
    const thuTuKhu = new Map(
      danhSachKhu.map((k, i) => [String(k.id), i]),
    );
    const cap = [...nhomMap.entries()].sort(([idA], [idB]) => {
      if (idA === "_none") return 1;
      if (idB === "_none") return -1;
      const oa = thuTuKhu.get(idA);
      const ob = thuTuKhu.get(idB);
      if (oa !== undefined && ob !== undefined) return oa - ob;
      if (oa !== undefined) return -1;
      if (ob !== undefined) return 1;
      return nhomMap
        .get(idA)!
        .ten.localeCompare(nhomMap.get(idB)!.ten, "vi");
    });
    return cap.map(([kid, v]) => ({
      khuId: kid,
      tenKhu: v.ten,
      phong: v.phong,
    }));
  }, [phongTheoKhu, danhSachKhu]);

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

  const danhSachKhuCombo = useMemo(
    () => danhSachKhu.map((a) => ({ id: a.id, ten: a.name })),
    [danhSachKhu],
  );

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
        <div className="card meter-picker-card">
          <div className="card-header meter-picker-card-header">
            <div className="meter-picker-heading">
              <h3>Chọn khu & phòng</h3>
              <p className="card-subtitle">
                {moChonKhuPhong
                  ? "Chọn khu để xem danh sách phòng"
                  : phongDangChon
                    ? `Đang chọn: ${tenKhuVaPhong(phongDangChon)}`
                    : "Đã thu gọn — mở rộng để đổi khu hoặc phòng"}
              </p>
            </div>
            <button
              type="button"
              className="btn-toggle-meter-picker"
              onClick={() => setMoChonKhuPhong((v) => !v)}
              aria-expanded={moChonKhuPhong}
              aria-label={moChonKhuPhong ? "Thu gọn" : "Mở rộng"}
              title={moChonKhuPhong ? "Thu gọn" : "Mở rộng"}
            >
              {moChonKhuPhong ? <IconChevronUp /> : <IconChevronDown />}
            </button>
          </div>
          {moChonKhuPhong && (
            <>
              <div className="meter-area-picker">
                <label className="field-label">Khu vực</label>
                <ChonKhuCombobox
                  danhSachKhu={danhSachKhuCombo}
                  value={idKhu}
                  onChange={setIdKhu}
                  placeholderChuaChon="Tất cả khu"
                  placeholderTim="Tìm theo tên khu…"
                />
              </div>
              {phongTheoKhu.length === 0 ? (
                <div className="room-empty room-empty-standalone">
                  Không có phòng trong khu này.
                </div>
              ) : (
                <div className="room-list-by-area">
                  {phongNhomTheoKhu.map((nhom) => (
                    <section key={nhom.khuId} className="room-area-group">
                      <h4 className="room-area-title">{nhom.tenKhu}</h4>
                      <div className="room-list">
                        {nhom.phong.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={`room-row ${phongDangChon?.id === r.id ? "active" : ""}`}
                            onClick={() => setPhongDangChon(r)}
                          >
                            <span className="room-row-label">{r.code}</span>
                            <span className="room-sub">Xem chỉ số</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {phongDangChon && (
          <div className="card meter-panel">
            <div className="card-header">
              <div>
                <h3>{tenKhuVaPhong(phongDangChon)}</h3>
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
                        Tổng: {dinhDangTien(tongTienDienNuoc(r))}
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
                    {tenKhuVaPhong(r)}
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
                render: (r: MeterReading) => tenKhuVaPhong(r.room),
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
                header: "Tổng tiền (ĐN)",
                render: (r: MeterReading) => dinhDangTien(tongTienDienNuoc(r)),
              },
            ]}
          />
        </div>
      </div>
    </TrangBaoVe>
  );
}
