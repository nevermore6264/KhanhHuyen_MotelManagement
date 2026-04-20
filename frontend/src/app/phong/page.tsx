"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconTimes,
  IconCheck,
  IconEye,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import ChonKhuCombobox from "@/components/ChonKhuCombobox";

type Area = { id: string; ten: string };
type Room = {
  id: string;
  maPhong: string;
  tang?: string;
  trangThai: string;
  khuVuc?: Area;
  giaHienTai?: number;
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

const statusLabel = (value?: string) => {
  switch (value) {
    case "AVAILABLE":
      return "Trống";
    case "OCCUPIED":
      return "Đang thuê";
    case "MAINTENANCE":
      return "Bảo trì";
    default:
      return value || "-";
  }
};

const statusClass = (value?: string) => {
  switch (value) {
    case "AVAILABLE":
      return "status-available";
    case "OCCUPIED":
      return "status-occupied";
    case "MAINTENANCE":
      return "status-maintenance";
    default:
      return "status-unknown";
  }
};

const isLockedStatus = (value?: string) =>
  value === "OCCUPIED" || value === "MAINTENANCE";

export default function TrangPhong() {
  const [danhSachPhong, setDanhSachPhong] = useState<Room[]>([]);
  const [danhSachKhu, setDanhSachKhu] = useState<Area[]>([]);
  const [maPhong, setMaPhong] = useState("");
  const [tang, setTang] = useState("");
  const [trangThaiPhong, setTrangThaiPhong] = useState("AVAILABLE");
  const [idKhu, setIdKhu] = useState("");
  const [gia, setGia] = useState("");
  const [loi, setLoi] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const [phanTuDangSua, setPhanTuDangSua] = useState<Room | null>(null);
  const [maPhongSua, setMaPhongSua] = useState("");
  const [tangSua, setTangSua] = useState("");
  const [trangThaiSua, setTrangThaiSua] = useState("AVAILABLE");
  const [idKhuSua, setIdKhuSua] = useState("");
  const [giaSua, setGiaSua] = useState("");
  const [loiSua, setLoiSua] = useState("");
  const [idXacNhanXoa, setIdXacNhanXoa] = useState<string | null>(null);
  const [tenXacNhanXoa, setTenXacNhanXoa] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("");
  const [mounted, setMounted] = useState(false);
  const vaiTro = mounted ? getRole() : null;
  const laQuanTri = vaiTro === "ADMIN";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useToast();

  const areaIdTuUrl = searchParams.get("areaId");
  const locIdKhu = areaIdTuUrl?.trim() ? areaIdTuUrl.trim() : "";

  const doiLocKhu = (value: string) => {
    if (value === "") {
      router.replace("/phong");
    } else {
      router.replace(`/phong?areaId=${encodeURIComponent(value)}`);
    }
  };

  const moHopThoaiThemPhong = () => {
    setIdKhu(locIdKhu || "");
    setHienThiTaoMoi(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const tai = async () => {
    const [resPhong, resKhu] = await Promise.all([
      api.get("/phong"),
      api.get("/khu-vuc"),
    ]);
    setDanhSachPhong(resPhong.data);
    setDanhSachKhu(resKhu.data);
  };

  useEffect(() => {
    tai();
  }, []);

  const tao = async (e: React.FormEvent) => {
    e.preventDefault();
    const ma = maPhong.trim();
    const giaSo = parseNhapTien(gia);
    if (!ma || !idKhu || !giaSo) {
      setLoi("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setLoi("");
    try {
      await api.post("/phong", {
        maPhong: ma,
        tang: tang.trim() || null,
        trangThai: trangThaiPhong,
        giaHienTai: giaSo,
        khuVuc: idKhu ? { id: idKhu } : null,
      });
      notify("Thêm phòng thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm phòng thất bại";
      setLoi(thongBao);
      notify(thongBao, "error");
      return;
    }
    setMaPhong("");
    setTang("");
    setGia("");
    setHienThiTaoMoi(false);
    tai();
  };

  const dinhDangSo = (value?: number) =>
    value == null ? "" : new Intl.NumberFormat("vi-VN").format(value);

  const batDauSua = (phong: Room) => {
    setPhanTuDangSua(phong);
    setMaPhongSua(phong.maPhong || "");
    setTangSua(phong.tang || "");
    setTrangThaiSua(phong.trangThai || "AVAILABLE");
    setIdKhuSua(phong.khuVuc?.id ? String(phong.khuVuc.id) : "");
    setGiaSua(
      phong.giaHienTai != null
        ? dinhDangNhapTien(String(phong.giaHienTai))
        : "",
    );
    setLoiSua("");
  };

  const luuSua = async () => {
    if (!phanTuDangSua) return;
    const ma = maPhongSua.trim();
    const giaSo = parseNhapTien(giaSua);
    if (!ma || !idKhuSua || !giaSo) {
      setLoiSua("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setLoiSua("");
    try {
      await api.put(`/phong/${phanTuDangSua.id}`, {
        maPhong: ma,
        tang: tangSua.trim() || null,
        trangThai: trangThaiSua,
        giaHienTai: giaSo,
        khuVuc: idKhuSua ? { id: idKhuSua } : null,
      });
      notify("Cập nhật phòng thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại";
      setLoiSua(thongBao);
      notify(thongBao, "error");
      return;
    }
    setPhanTuDangSua(null);
    setMaPhongSua("");
    setTangSua("");
    setGiaSua("");
    setIdKhuSua("");
    tai();
  };

  const huySua = () => {
    setPhanTuDangSua(null);
    setMaPhongSua("");
    setTangSua("");
    setGiaSua("");
    setIdKhuSua("");
    setLoiSua("");
  };

  const yeuCauXoa = (phong: Room) => {
    if (isLockedStatus(phong.trangThai)) {
      notify("Phòng đang cho thuê/bảo trì, không thể xóa", "error");
      return;
    }
    setIdXacNhanXoa(phong.id);
    setTenXacNhanXoa(phong.maPhong);
  };

  const xacNhanXoa = async () => {
    if (idXacNhanXoa == null) return;
    const phong = danhSachPhong.find((r) => r.id === idXacNhanXoa);
    if (isLockedStatus(phong?.trangThai)) {
      notify("Phòng đang cho thuê/bảo trì, không thể xóa", "error");
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      return;
    }
    try {
      await api.delete(`/phong/${idXacNhanXoa}`);
      notify("Xóa phòng thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      const thongBao =
        ax?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Xóa thất bại";
      setLoi(thongBao);
      notify(thongBao, "error");
      return;
    }
    setIdXacNhanXoa(null);
    setTenXacNhanXoa("");
    tai();
  };

  const huyXoa = () => {
    setIdXacNhanXoa(null);
    setTenXacNhanXoa("");
  };

  const danhSachLoc = danhSachPhong.filter((phong) => {
    const q = tuKhoa.trim().toLowerCase();
    const khopTuKhoa = !q
      ? true
      : phong.maPhong?.toLowerCase().includes(q) ||
        phong.tang?.toLowerCase().includes(q) ||
        phong.trangThai?.toLowerCase().includes(q) ||
        phong.khuVuc?.ten?.toLowerCase().includes(q);
    const khopTrangThai = locTrangThai
      ? phong.trangThai === locTrangThai
      : true;
    const khopKhu =
      locIdKhu === "" ? true : phong.khuVuc?.id === locIdKhu;
    return khopTuKhoa && khopTrangThai && khopKhu;
  });

  const tenKhuLoc = locIdKhu
    ? danhSachKhu.find((a) => a.id === locIdKhu)?.ten ?? `Khu #${locIdKhu}`
    : null;

  const khoaSua = phanTuDangSua
    ? isLockedStatus(phanTuDangSua.trangThai)
    : false;

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Quản lý phòng</h2>
        {tenKhuLoc && (
          <div className="card card-inline" style={{ marginBottom: 12 }}>
            <span>
              Đang xem phòng thuộc khu: <strong>{tenKhuLoc}</strong>
            </span>
            <Link
              href="/phong"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 12 }}
            >
              <IconEye /> Xem tất cả phòng
            </Link>
          </div>
        )}
        <div className="card">
          <div className="grid grid-4">
            <input
              placeholder="Tìm kiếm theo mã, tầng, khu, trạng thái..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <select
              value={locTrangThai}
              onChange={(e) => setLocTrangThai(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Trống</option>
              <option value="OCCUPIED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            <div aria-label="Lọc theo khu">
              <ChonKhuCombobox
                danhSachKhu={danhSachKhu}
                value={locIdKhu}
                onChange={doiLocKhu}
                placeholderChuaChon="Tất cả khu"
                placeholderTim="Tìm khu để lọc…"
              />
            </div>
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={moHopThoaiThemPhong}>
                  <IconPlus /> Thêm phòng mới
                </button>
              </div>
            )}
          </div>
          {!laQuanTri && (
            <div className="form-error" style={{ marginTop: 12 }}>
              Bạn chỉ có quyền xem dữ liệu.
            </div>
          )}
        </div>
        <div className="card">
          <BangDonGian
            data={danhSachLoc}
            columns={[
              { header: "ID", render: (r) => r.id },
              { header: "Mã", render: (r) => r.maPhong },
              { header: "Tầng", render: (r) => r.tang },
              {
                header: "Trạng thái",
                render: (r) => (
                  <span className={`status-badge ${statusClass(r.trangThai)}`}>
                    {statusLabel(r.trangThai)}
                  </span>
                ),
              },
              { header: "Khu", render: (r) => r.khuVuc?.ten },
              {
                header: "Giá",
                render: (r) =>
                  r.giaHienTai == null ? "" : `${dinhDangSo(r.giaHienTai)} VNĐ`,
              },
              ...(laQuanTri
                ? [
                    {
                      header: "Thao tác",
                      render: (r: Room) => {
                        const locked = isLockedStatus(r.trangThai);
                        const dangChoThue = r.trangThai === "OCCUPIED";
                        return (
                          <div className="table-actions">
                            <button
                              type="button"
                              className={`btn ${dangChoThue ? "btn-disabled" : ""}`}
                              disabled={dangChoThue}
                              onClick={() => batDauSua(r)}
                              title={
                                dangChoThue
                                  ? "Phòng đang cho thuê, không thể chỉnh sửa"
                                  : undefined
                              }
                            >
                              <IconPencil /> Sửa
                            </button>
                            <button
                              className={`btn btn-secondary ${locked ? "btn-disabled" : ""}`}
                              onClick={() => yeuCauXoa(r)}
                              title={
                                locked
                                  ? "Phòng đang cho thuê/bảo trì, không thể xóa"
                                  : undefined
                              }
                            >
                              <IconTrash /> Xóa
                            </button>
                          </div>
                        );
                      },
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {hienThiTaoMoi && laQuanTri && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm phòng mới</h3>
                  <p className="card-subtitle">Điền thông tin phòng</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <ChonKhuCombobox
                    danhSachKhu={danhSachKhu}
                    value={idKhu}
                    onChange={setIdKhu}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: P101"
                    value={maPhong}
                    onChange={(e) => setMaPhong(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Ví dụ: Tầng 1"
                    value={tang}
                    onChange={(e) => setTang(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={trangThaiPhong}
                    onChange={(e) => setTrangThaiPhong(e.target.value)}
                    disabled
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Ví dụ: 2.500.000"
                      value={gia}
                      onChange={(e) => setGia(dinhDangNhapTien(e.target.value))}
                    />
                    <span>VNĐ</span>
                  </div>
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
                    <IconPlus /> Thêm phòng
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
                  <h3>Chỉnh sửa phòng</h3>
                  <p className="card-subtitle">
                    Chọn khu trước, sau đó chỉnh sửa các thông tin khác.
                  </p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <ChonKhuCombobox
                    danhSachKhu={danhSachKhu}
                    value={idKhuSua}
                    onChange={setIdKhuSua}
                    disabled={khoaSua}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Mã phòng"
                    value={maPhongSua}
                    onChange={(e) => setMaPhongSua(e.target.value)}
                    disabled={khoaSua}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Tầng"
                    value={tangSua}
                    onChange={(e) => setTangSua(e.target.value)}
                    disabled={khoaSua}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={trangThaiSua}
                    onChange={(e) => setTrangThaiSua(e.target.value)}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Giá phòng"
                      value={giaSua}
                      onChange={(e) =>
                        setGiaSua(dinhDangNhapTien(e.target.value))
                      }
                      disabled={khoaSua}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                {khoaSua && (
                  <div className="form-error">
                    Phòng đang cho thuê/bảo trì, chỉ cho phép đổi trạng thái.
                  </div>
                )}
                {loiSua && <div className="form-error">{loiSua}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={huySua}>
                  <IconTimes /> Hủy
                </button>
                <button className="btn" onClick={luuSua}>
                  <IconCheck /> Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {idXacNhanXoa != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa phòng{" "}
                <strong>{tenXacNhanXoa || "này"}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={huyXoa}>
                  <IconTimes /> Hủy
                </button>
                <button className="btn" onClick={xacNhanXoa}>
                  <IconTrash /> Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
