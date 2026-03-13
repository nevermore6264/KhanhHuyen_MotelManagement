"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

type Area = {
  id: number;
  ten: string;
  diaChi?: string;
  moTa?: string;
  soPhong?: number;
  coTheXoa?: boolean;
};

export default function TrangKhuVuc() {
  const [daMount, setDaMount] = useState(false);
  const [danhSach, setDanhSach] = useState<Area[]>([]);
  const [ten, setTen] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [moTa, setMoTa] = useState("");
  const [loi, setLoi] = useState("");
  const [idXacNhanXoa, setIdXacNhanXoa] = useState<number | null>(null);
  const [tenXacNhanXoa, setTenXacNhanXoa] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [phanTuDangSua, setPhanTuDangSua] = useState<Area | null>(null);
  const [tenSua, setTenSua] = useState("");
  const [diaChiSua, setDiaChiSua] = useState("");
  const [moTaSua, setMoTaSua] = useState("");
  const [loiSua, setLoiSua] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const vaiTro = daMount ? getRole() : null;
  const laQuanTri = vaiTro === "ADMIN";
  const { notify } = useToast();

  useEffect(() => {
    setDaMount(true);
  }, []);

  const tai = async () => {
    const phanHoi = await api.get("/khu-vuc");
    setDanhSach(phanHoi.data);
  };

  useEffect(() => {
    if (daMount) tai();
  }, [daMount]);

  const tao = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = ten.trim();
    const dc = diaChi.trim();
    const mt = moTa.trim();
    if (!t || !dc || !mt) {
      setLoi("Vui lòng nhập đầy đủ Tên khu, Địa chỉ, Mô tả");
      return;
    }
    setLoi("");
    try {
      await api.post("/khu-vuc", { ten: t, diaChi: dc, moTa: mt });
      notify("Thêm khu thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm khu thất bại";
      setLoi(thongBao);
      notify(thongBao, "error");
      return;
    }
    setTen("");
    setDiaChi("");
    setMoTa("");
    setHienThiTaoMoi(false);
    tai();
  };

  const yeuCauXoa = (khu: Area) => {
    if (khu.coTheXoa === false) {
      notify("Khu còn phòng đang thuê, không thể xóa", "error");
      return;
    }
    setIdXacNhanXoa(khu.id);
    setTenXacNhanXoa(khu.ten);
  };

  const batDauSua = (khu: Area) => {
    setPhanTuDangSua(khu);
    setTenSua(khu.ten || "");
    setDiaChiSua(khu.diaChi || "");
    setMoTaSua(khu.moTa || "");
    setLoiSua("");
  };

  const luuSua = async () => {
    if (!phanTuDangSua) return;
    const t = tenSua.trim();
    const dc = diaChiSua.trim();
    const mt = moTaSua.trim();
    if (!t || !dc || !mt) {
      setLoiSua("Vui lòng nhập đầy đủ Tên khu, Địa chỉ, Mô tả");
      return;
    }
    setLoiSua("");
    try {
      await api.put(`/khu-vuc/${phanTuDangSua.id}`, {
        ten: t,
        diaChi: dc,
        moTa: mt,
      });
      notify("Cập nhật khu thành công", "success");
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
    setTenSua("");
    setDiaChiSua("");
    setMoTaSua("");
    tai();
  };

  const huySua = () => {
    setPhanTuDangSua(null);
    setTenSua("");
    setDiaChiSua("");
    setMoTaSua("");
    setLoiSua("");
  };

  const xacNhanXoa = async () => {
    if (idXacNhanXoa == null) return;
    const khu = danhSach.find((a) => a.id === idXacNhanXoa);
    if (khu?.coTheXoa === false) {
      notify("Khu còn phòng đang thuê, không thể xóa", "error");
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      return;
    }
    try {
      await api.delete(`/khu-vuc/${idXacNhanXoa}`);
      notify("Xóa khu thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: unknown } };
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      const status = ax?.response?.status;
      const resData = ax?.response?.data;
      const thongBao =
        status === 403
          ? "Bạn không có quyền thao tác"
          : status === 400 &&
              (typeof resData === "string" ||
                (resData &&
                  typeof (resData as { message?: string }).message ===
                    "string"))
            ? typeof resData === "string"
              ? resData
              : (resData as { message: string }).message
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

  const danhSachLoc = danhSach.filter((phanTu) => {
    const q = tuKhoa.trim().toLowerCase();
    if (!q) return true;
    return (
      phanTu.ten?.toLowerCase().includes(q) ||
      phanTu.diaChi?.toLowerCase().includes(q) ||
      phanTu.moTa?.toLowerCase().includes(q)
    );
  });

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Quản lý khu</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder="Tìm kiếm theo tên, địa chỉ, mô tả..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setHienThiTaoMoi(true)}>
                  <IconPlus /> Thêm khu mới
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
              { header: "Tên", render: (r) => r.ten },
              { header: "Địa chỉ", render: (r) => r.diaChi },
              {
                header: "Mô tả",
                render: (r) => (
                  <span className="table-ellipsis" title={r.moTa || ""}>
                    {r.moTa || ""}
                  </span>
                ),
              },
              {
                header: "Số phòng",
                render: (r: Area) => (
                  <span>{typeof r.soPhong === "number" ? r.soPhong : "—"}</span>
                ),
              },
              {
                header: "Phòng",
                render: (r: Area) => (
                  <Link
                    href={`/phong?areaId=${r.id}`}
                    className="btn btn-secondary"
                  >
                    <IconEye /> Xem phòng
                  </Link>
                ),
              },
              ...(laQuanTri
                ? [
                    {
                      header: "Thao tác",
                      render: (r: Area) => {
                        const locked = r.coTheXoa === false;
                        return (
                          <div className="table-actions">
                            <button
                              className="btn"
                              onClick={() => batDauSua(r)}
                            >
                              <IconPencil /> Sửa
                            </button>
                            <button
                              className={`btn btn-secondary ${locked ? "btn-disabled" : ""}`}
                              onClick={() => yeuCauXoa(r)}
                              title={
                                locked
                                  ? "Khu còn phòng đang thuê, không thể xóa"
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

        {idXacNhanXoa != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa khu{" "}
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

        {phanTuDangSua && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa khu</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    Tên khu <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Tên khu"
                    value={tenSua}
                    onChange={(e) => setTenSua(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Địa chỉ"
                    value={diaChiSua}
                    onChange={(e) => setDiaChiSua(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Mô tả <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Mô tả"
                    value={moTaSua}
                    onChange={(e) => setMoTaSua(e.target.value)}
                  />
                </div>
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

        {hienThiTaoMoi && laQuanTri && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm khu mới</h3>
                  <p className="card-subtitle">Điền thông tin cơ bản của khu</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">
                    Tên khu <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: Khu A"
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Số nhà, đường, phường..."
                    value={diaChi}
                    onChange={(e) => setDiaChi(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Mô tả <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ghi chú thêm về khu"
                    value={moTa}
                    onChange={(e) => setMoTa(e.target.value)}
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
                    <IconPlus /> Thêm khu
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
