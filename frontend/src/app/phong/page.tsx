"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import ChonKhuCombobox from "@/components/ChonKhuCombobox";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiPhong } from "@/lib/trangThai";
import { classBadgePhong } from "@/lib/badgeTrangThai";
import { layLocaleTag, dinhDangTien } from "@/lib/locale";

type Area = { id: string; ten: string };
type Room = {
  id: string;
  maPhong: string;
  tang?: string;
  trangThai: string;
  khuVuc?: Area;
  giaHienTai?: number;
};

const parseNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
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
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.phong;
  const s = tr.pages.shared;
  const c = tr.common;
  const localeTag = layLocaleTag(lang);
  const dinhDangNhapTien = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat(localeTag).format(Number(digits));
  };

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
      setLoi(s.requiredHint);
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
      notify(p.okAdd, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : p.errAdd;
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
      setLoiSua(s.requiredHint);
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
      notify(p.cannotDelete, "error");
      return;
    }
    setIdXacNhanXoa(phong.id);
    setTenXacNhanXoa(phong.maPhong);
  };

  const xacNhanXoa = async () => {
    if (idXacNhanXoa == null) return;
    const phong = danhSachPhong.find((r) => r.id === idXacNhanXoa);
    if (isLockedStatus(phong?.trangThai)) {
      notify(p.cannotDelete, "error");
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      return;
    }
    try {
      await api.delete(`/phong/${idXacNhanXoa}`);
      notify(p.okDelete, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      setIdXacNhanXoa(null);
      setTenXacNhanXoa("");
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : p.errDelete;
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
      <div className="page-shell page-table">
        <header className="page-top">
          <div className="page-top-text">
            <h1 className="page-heading">{p.title}</h1>
            <p className="page-lead">{p.lead}</p>
          </div>
        </header>
        {tenKhuLoc && (
          <div className="card card-inline" style={{ marginBottom: 12 }}>
            <span>
              {s.viewingArea} <strong>{tenKhuLoc}</strong>
            </span>
            <Link
              href="/phong"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 12 }}
            >
              <IconEye /> {s.viewAllRooms}
            </Link>
          </div>
        )}
        <div className="card">
          <div className="grid grid-4">
            <input
              placeholder={p.searchPh}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <select
              value={locTrangThai}
              onChange={(e) => setLocTrangThai(e.target.value)}
            >
              <option value="">{s.allStatus}</option>
              <option value="AVAILABLE">{nhanTrangThaiPhong(tr, "AVAILABLE")}</option>
              <option value="OCCUPIED">{nhanTrangThaiPhong(tr, "OCCUPIED")}</option>
              <option value="MAINTENANCE">{nhanTrangThaiPhong(tr, "MAINTENANCE")}</option>
            </select>
            <div aria-label={s.filterByArea}>
              <ChonKhuCombobox
                danhSachKhu={danhSachKhu}
                value={locIdKhu}
                onChange={doiLocKhu}
                placeholderChuaChon={s.allAreas}
                placeholderTim={s.searchArea}
              />
            </div>
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={moHopThoaiThemPhong}>
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
              { header: p.code, render: (r) => r.maPhong },
              { header: p.floor, render: (r) => r.tang },
              {
                header: p.status,
                render: (r) => (
                  <span className={classBadgePhong(r.trangThai)}>
                    {nhanTrangThaiPhong(tr, r.trangThai)}
                  </span>
                ),
              },
              { header: p.area, render: (r) => r.khuVuc?.ten },
              {
                header: p.price,
                render: (r) =>
                  r.giaHienTai == null ? "" : dinhDangTien(r.giaHienTai, lang),
              },
              ...(laQuanTri
                ? [
                    {
                      header: s.actions,
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
                                dangChoThue ? p.cannotDelete : undefined
                              }
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

        {hienThiTaoMoi && laQuanTri && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.addTitle}</h3>
                  <p className="card-subtitle">{p.lead}</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    {p.area} <span className="required">*</span>
                  </label>
                  <ChonKhuCombobox
                    danhSachKhu={danhSachKhu}
                    value={idKhu}
                    onChange={setIdKhu}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {p.code} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.code}
                    value={maPhong}
                    onChange={(e) => setMaPhong(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">{p.floor}</label>
                  <input
                    placeholder={p.floor}
                    value={tang}
                    onChange={(e) => setTang(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {p.status} <span className="required">*</span>
                  </label>
                  <select
                    value={trangThaiPhong}
                    onChange={(e) => setTrangThaiPhong(e.target.value)}
                    disabled
                  >
                    <option value="AVAILABLE">{nhanTrangThaiPhong(tr, "AVAILABLE")}</option>
                    <option value="OCCUPIED">{nhanTrangThaiPhong(tr, "OCCUPIED")}</option>
                    <option value="MAINTENANCE">{nhanTrangThaiPhong(tr, "MAINTENANCE")}</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    {p.price} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.pricePh}
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
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconPlus /> {p.addRoom}
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
                  <p className="card-subtitle">{p.lead}</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    {p.area} <span className="required">*</span>
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
                    {p.code} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.code}
                    value={maPhongSua}
                    onChange={(e) => setMaPhongSua(e.target.value)}
                    disabled={khoaSua}
                  />
                </div>
                <div>
                  <label className="field-label">{p.floor}</label>
                  <input
                    placeholder={p.floor}
                    value={tangSua}
                    onChange={(e) => setTangSua(e.target.value)}
                    disabled={khoaSua}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {p.status} <span className="required">*</span>
                  </label>
                  <select
                    value={trangThaiSua}
                    onChange={(e) => setTrangThaiSua(e.target.value)}
                  >
                    <option value="AVAILABLE">{nhanTrangThaiPhong(tr, "AVAILABLE")}</option>
                    <option value="OCCUPIED">{nhanTrangThaiPhong(tr, "OCCUPIED")}</option>
                    <option value="MAINTENANCE">{nhanTrangThaiPhong(tr, "MAINTENANCE")}</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    {p.price} <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.pricePh}
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
                  <div className="form-error">{p.cannotDelete}</div>
                )}
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

        {idXacNhanXoa != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>{s.confirmDelete}</h3>
              <p>
                {p.confirmDeleteRoom}{" "}
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
      </div>
    </TrangBaoVe>
  );
}
