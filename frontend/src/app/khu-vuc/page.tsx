"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TrangBaoVe from "@/components/TrangBaoVe";
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
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

type Area = {
  id: string;
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
  const [idXacNhanXoa, setIdXacNhanXoa] = useState<string | null>(null);
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
  const { t: tr } = useCaiDat();
  const p = tr.pages.khuVuc;
  const s = tr.pages.shared;
  const c = tr.common;

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
      setLoi(p.errRequired);
      return;
    }
    setLoi("");
    try {
      await api.post("/khu-vuc", { ten: t, diaChi: dc, moTa: mt });
      notify(p.okAdd, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : p.errAdd;
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
      notify(p.cannotDelete, "error");
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
      notify(p.okUpdate, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : p.errUpdate;
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
      notify(p.cannotDelete, "error");
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      return;
    }
    try {
      await api.delete(`/khu-vuc/${idXacNhanXoa}`);
      notify(p.okDelete, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: unknown } };
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      const status = ax?.response?.status;
      const resData = ax?.response?.data;
      const thongBao =
        status === 403
          ? s.noPermission
          : status === 400 &&
              (typeof resData === "string" ||
                (resData &&
                  typeof (resData as { message?: string }).message ===
                    "string"))
            ? typeof resData === "string"
              ? resData
              : (resData as { message: string }).message
            : p.errDelete;
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
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder={p.searchPh}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setHienThiTaoMoi(true)}>
                  <IconPlus /> {p.addNew}
                </button>
              </div>
            )}
          </div>
          {!laQuanTri && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {s.viewOnly}
            </div>
          )}
        </div>
        <div className="card">
          <BangDonGian
            data={danhSachLoc}
            columns={[
              { header: s.id, render: (r) => r.id },
              { header: s.name, render: (r) => r.ten },
              { header: s.address, render: (r) => r.diaChi },
              {
                header: s.description,
                render: (r) => (
                  <span className="table-ellipsis" title={r.moTa || ""}>
                    {r.moTa || ""}
                  </span>
                ),
              },
              {
                header: s.roomCount,
                render: (r: Area) => (
                  <span>{typeof r.soPhong === "number" ? r.soPhong : "—"}</span>
                ),
              },
              {
                header: tr.menu.rooms,
                render: (r: Area) => (
                  <Link
                    href={`/phong?areaId=${r.id}`}
                    className="btn btn-secondary"
                  >
                    <IconEye /> {s.viewRooms}
                  </Link>
                ),
              },
              ...(laQuanTri
                ? [
                    {
                      header: s.actions,
                      render: (r: Area) => {
                        const locked = r.coTheXoa === false;
                        return (
                          <div className="table-actions">
                            <button
                              className="btn"
                              onClick={() => batDauSua(r)}
                            >
                              <IconPencil /> {s.edit}
                            </button>
                            <button
                              className={`btn btn-secondary ${locked ? "btn-disabled" : ""}`}
                              onClick={() => yeuCauXoa(r)}
                              title={locked ? p.cannotDelete : undefined}
                            >
                              <IconTrash /> {s.delete}
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
              <h3>{s.confirmDelete}</h3>
              <p>
                {s.confirmDeleteArea}{" "}
                <strong>{tenXacNhanXoa || s.thisItem}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={huyXoa}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={xacNhanXoa}>
                  <IconTrash /> {s.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        {phanTuDangSua && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>{p.editTitle}</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    {s.areaName} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.areaName}
                    value={tenSua}
                    onChange={(e) => setTenSua(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.address} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.address}
                    value={diaChiSua}
                    onChange={(e) => setDiaChiSua(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    {s.description} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.description}
                    value={moTaSua}
                    onChange={(e) => setMoTaSua(e.target.value)}
                  />
                </div>
                {loiSua && <div className="form-error">{loiSua}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={huySua}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={luuSua}>
                  <IconCheck /> {c.save}
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
                  <h3>{p.addTitle}</h3>
                  <p className="card-subtitle">{p.addSub}</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">
                    {s.areaName} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.namePh}
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.addressPh}
                    value={diaChi}
                    onChange={(e) => setDiaChi(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Mô tả <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.descPh}
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
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconPlus /> {p.addArea}
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
