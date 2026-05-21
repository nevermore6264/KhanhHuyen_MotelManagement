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
  IconLink,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanVaiTro } from "@/lib/trangThai";
import {
  classBadgeNguoiDungActive,
  classBadgeVaiTro,
} from "@/lib/badgeTrangThai";
import ChonKhachThueCombobox from "@/components/ChonKhachThueCombobox";

type User = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  active: boolean;

  phone?: string | null;
};
type Tenant = {
  id: string;
  fullName: string;
  phone?: string;
  idNumber?: string;
  user?: { id: string };
};

type RawJson = Record<string, unknown>;


function chuanHoaNguoiDungTuApi(raw: RawJson): User {
  const r = raw as RawJson;
  const vaiTroRaw = r.vaiTro ?? r.role;
  let role = "";
  if (typeof vaiTroRaw === "string") role = vaiTroRaw;
  else if (vaiTroRaw && typeof vaiTroRaw === "object" && "name" in vaiTroRaw)
    role = String((vaiTroRaw as { name?: string }).name ?? "");
  else if (vaiTroRaw != null) role = String(vaiTroRaw);

  const kich = r.kichHoat ?? r.active;
  const active =
    kich === false ||
    kich === "false" ||
    kich === 0 ||
    kich === "0"
      ? false
      : true;

  const sdt = r.soDienThoai ?? r.so_dien_thoai ?? r.phone;
  return {
    id: r.id != null ? String(r.id) : "",
    username: String(
      r.tenDangNhap ??
        r.ten_dang_nhap ??
        r.username ??
        r["tendangnhap"] ??
        "",
    ).trim(),
    fullName: String(
      r.hoTen ?? r.ho_ten ?? r.fullName ?? r["hoten"] ?? "",
    ).trim(),
    role,
    active,
    phone:
      sdt != null && String(sdt).trim() !== "" ? String(sdt).trim() : null,
  };
}

function chuanHoaKhachThueTuApi(raw: RawJson): Tenant {
  const nd = raw.nguoiDung as { id?: string | number } | undefined;
  const userObj = raw.user as { id?: string | number } | undefined;
  const userId = nd?.id ?? userObj?.id;
  return {
    id: raw.id != null ? String(raw.id) : "",
    fullName: String(raw.hoTen ?? raw.fullName ?? "").trim(),
    phone:
      raw.soDienThoai != null
        ? String(raw.soDienThoai)
        : raw.phone != null
          ? String(raw.phone)
          : undefined,
    idNumber:
      raw.soGiayTo != null
        ? String(raw.soGiayTo)
        : raw.idNumber != null
          ? String(raw.idNumber)
          : undefined,
    user: userId != null ? { id: String(userId) } : undefined,
  };
}

type TenantValidateMsg = {
  errFullName: string;
  errPhone: string;
  errPhoneInvalid: string;
  errIdNumber: string;
  errIdNumberInvalid: string;
  errAddress: string;
  errEmailInvalid: string;
};

const validateTenant = (
  m: TenantValidateMsg,
  data: {
    fullName: string;
    phone: string;
    idNumber: string;
    address: string;
    email: string;
  },
) => {
  if (!data.fullName.trim()) return m.errFullName;
  if (!data.phone.trim()) return m.errPhone;
  if (!/^\d{9,11}$/.test(data.phone.trim())) return m.errPhoneInvalid;
  if (!data.idNumber.trim()) return m.errIdNumber;
  if (!/^\d{9,12}$/.test(data.idNumber.trim())) return m.errIdNumberInvalid;
  if (!data.address.trim()) return m.errAddress;
  if (
    data.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return m.errEmailInvalid;
  }
  return "";
};

function khachLienKetTheoNguoi(ds: Tenant[], idNguoi: string) {
  return ds.find((t) => t.user?.id === idNguoi);
}

export default function TrangNguoiDung() {
  const [danhSach, setDanhSach] = useState<User[]>([]);
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTenTaoMoi, setHoTenTaoMoi] = useState("");
  const [sdtTaoMoi, setSdtTaoMoi] = useState("");
  const [vaiTro, setVaiTro] = useState("STAFF");
  const [idKhachThue, setIdKhachThue] = useState("");
  const [danhSachKhachThue, setDanhSachKhachThue] = useState<Tenant[]>([]);
  const [locVaiTro, setLocVaiTro] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [loi, setLoi] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const [phanTuDangSua, setPhanTuDangSua] = useState<User | null>(null);
  const [hoTenSua, setHoTenSua] = useState("");
  const [sdtSua, setSdtSua] = useState("");
  const [idKhachThueSua, setIdKhachThueSua] = useState("");
  const [matKhauSua, setMatKhauSua] = useState("");
  const [loiSua, setLoiSua] = useState("");
  const [nguoiDungLienKet, setNguoiDungLienKet] = useState<User | null>(null);
  const [cheDoLienKet, setCheDoLienKet] = useState<"existing" | "new">(
    "existing",
  );
  const [idKhachThueLienKet, setIdKhachThueLienKet] = useState("");
  const [loiLienKet, setLoiLienKet] = useState("");
  const [hoTenKhachMoi, setHoTenKhachMoi] = useState("");
  const [sdtKhachMoi, setSdtKhachMoi] = useState("");
  const [cccdKhachMoi, setCccdKhachMoi] = useState("");
  const [diaChiKhachMoi, setDiaChiKhachMoi] = useState("");
  const [emailKhachMoi, setEmailKhachMoi] = useState("");
  const [loiKhachMoi, setLoiKhachMoi] = useState("");
  const [mounted, setMounted] = useState(false);
  const vaiTroHienTai = mounted ? getRole() : null;
  const laQuanTri = vaiTroHienTai === "ADMIN";
  const { notify } = useToast();
  const { t: tr } = useCaiDat();
  const p = tr.pages.nguoiDung;
  const s = tr.pages.shared;
  const c = tr.common;
  const valMsg: TenantValidateMsg = {
    errFullName: s.errFullName,
    errPhone: s.errPhone,
    errPhoneInvalid: s.errPhoneInvalid,
    errIdNumber: s.errIdNumber,
    errIdNumberInvalid: s.errIdNumberInvalid,
    errAddress: s.errAddress,
    errEmailInvalid: s.errEmailInvalid,
  };

  const tai = async () => {
    const phanHoi = await api.get("/nguoi-dung");
    const mang = Array.isArray(phanHoi.data) ? phanHoi.data : [];
    setDanhSach(mang.map((x) => chuanHoaNguoiDungTuApi(x as RawJson)));
  };

  const taiKhachThue = async () => {
    try {
      const phanHoi = await api.get("/khach-thue");
      const mang = Array.isArray(phanHoi.data) ? phanHoi.data : [];
      setDanhSachKhachThue(mang.map((x) => chuanHoaKhachThueTuApi(x as RawJson)));
    } catch {
      setDanhSachKhachThue([]);
    }
  };

  useEffect(() => {
    tai();
    taiKhachThue();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tao = async (e: React.FormEvent) => {
    e.preventDefault();
    const ten = tenDangNhap.trim();
    if (!ten || !matKhau.trim()) {
      setLoi(s.errCredentials);
      return;
    }
    setLoi("");
    try {
      await api.post("/nguoi-dung", {
        tenDangNhap: ten,
        matKhau,
        hoTen: vaiTro === "STAFF" ? hoTenTaoMoi.trim() : "",
        soDienThoai:
          vaiTro === "STAFF" ? (sdtTaoMoi.trim() || null) : null,
        vaiTro,
        kichHoat: true,
        maKhachThue:
          vaiTro === "TENANT" && idKhachThue.trim()
            ? idKhachThue.trim()
            : null,
      });
      notify(p.okCreate, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : p.errCreate;
      setLoi(thongBao);
      notify(thongBao, "error");
      return;
    }
    setTenDangNhap("");
    setMatKhau("");
    setHoTenTaoMoi("");
    setSdtTaoMoi("");
    setVaiTro("STAFF");
    setIdKhachThue("");
    setHienThiTaoMoi(false);
    tai();
  };

  const batDauSua = (user: User) => {
    setPhanTuDangSua(user);
    if (user.role === "STAFF") {
      setHoTenSua((user.fullName || "").trim());
      setSdtSua(((user as User & { phone?: string | null }).phone || "").trim());
    } else {
      setHoTenSua("");
      setSdtSua("");
    }
    setIdKhachThueSua("");
    setMatKhauSua("");
    setLoiSua("");
    taiKhachThue();
  };

  useEffect(() => {
    if (!phanTuDangSua || phanTuDangSua.role !== "TENANT") {
      if (phanTuDangSua && phanTuDangSua.role !== "TENANT") {
        setIdKhachThueSua("");
      }
      return;
    }
    if (danhSachKhachThue.length === 0) return;
    const lienKet = khachLienKetTheoNguoi(danhSachKhachThue, phanTuDangSua.id);
    setIdKhachThueSua(lienKet ? String(lienKet.id) : "");
  }, [phanTuDangSua, danhSachKhachThue]);

  const luuSua = async () => {
    if (!phanTuDangSua) return;
    const laNhanVien = phanTuDangSua.role === "STAFF";
    try {
      await api.put(`/nguoi-dung/${phanTuDangSua.id}`, {
        hoTen: laNhanVien
          ? hoTenSua.trim()
          : (phanTuDangSua.fullName || "").trim(),
        soDienThoai: laNhanVien
          ? sdtSua.trim() || null
          : (phanTuDangSua.phone || "").trim() || null,
        vaiTro: phanTuDangSua.role,
        kichHoat: phanTuDangSua.active,
        matKhau: matKhauSua.trim() || null,
      });
      await api.put(`/nguoi-dung/${phanTuDangSua.id}/khach-thue`, {
        tenantId: idKhachThueSua ? idKhachThueSua.trim() : null,
      });
      notify(p.okUpdate, "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403 ? s.noPermission : s.errUpdate;
      setLoiSua(thongBao);
      notify(thongBao, "error");
      return;
    }
    setPhanTuDangSua(null);
    setHoTenSua("");
    setSdtSua("");
    setIdKhachThueSua("");
    setMatKhauSua("");
    tai();
  };

  const moModalLienKet = (user: User) => {
    setNguoiDungLienKet(user);
    setCheDoLienKet("existing");
    setIdKhachThueLienKet("");
    setLoiLienKet("");
    setHoTenKhachMoi("");
    setSdtKhachMoi("");
    setCccdKhachMoi("");
    setDiaChiKhachMoi("");
    setEmailKhachMoi("");
    setLoiKhachMoi("");
    taiKhachThue();
  };

  useEffect(() => {
    if (
      nguoiDungLienKet &&
      danhSachKhachThue.length > 0 &&
      !idKhachThueLienKet
    ) {
      const linked = danhSachKhachThue.find(
        (t) => t.user?.id === nguoiDungLienKet.id,
      );
      setIdKhachThueLienKet(linked ? String(linked.id) : "");
    }
  }, [nguoiDungLienKet?.id, danhSachKhachThue]);

  const saveLinkTenant = async () => {
    if (!nguoiDungLienKet) return;
    setLoiLienKet("");
    try {
      await api.put(`/nguoi-dung/${nguoiDungLienKet.id}/khach-thue`, {
        tenantId: idKhachThueLienKet ? idKhachThueLienKet.trim() : null,
      });
      notify(p.okLink, "success");
      setNguoiDungLienKet(null);
      setIdKhachThueLienKet("");
      tai();
    } catch (err: any) {
      const msg =
        err?.response?.status === 403 ? s.noPermission : p.errLink;
      setLoiLienKet(msg);
      notify(msg, "error");
    }
  };

  const createAndLinkTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiDungLienKet) return;
    const msg = validateTenant(valMsg, {
      fullName: hoTenKhachMoi,
      phone: sdtKhachMoi,
      idNumber: cccdKhachMoi,
      address: diaChiKhachMoi,
      email: emailKhachMoi,
    });
    if (msg) {
      setLoiKhachMoi(msg);
      notify(msg, "error");
      return;
    }
    setLoiKhachMoi("");
    try {
      await api.post("/khach-thue", {
        fullName: hoTenKhachMoi.trim(),
        phone: sdtKhachMoi.trim() || null,
        idNumber: cccdKhachMoi.trim() || null,
        address: diaChiKhachMoi.trim() || null,
        email: emailKhachMoi.trim() || null,
        userId: nguoiDungLienKet.id,
      });
      notify(p.okCreateTenant, "success");
      setNguoiDungLienKet(null);
      setCheDoLienKet("existing");
      setHoTenKhachMoi("");
      setSdtKhachMoi("");
      setCccdKhachMoi("");
      setDiaChiKhachMoi("");
      setEmailKhachMoi("");
      tai();
      taiKhachThue();
    } catch (err: any) {
      const text =
        err?.response?.status === 403 ? s.noPermission : p.errCreateTenant;
      setLoiKhachMoi(text);
      notify(text, "error");
    }
  };

  const cancelEdit = () => {
    setPhanTuDangSua(null);
    setHoTenSua("");
    setSdtSua("");
    setIdKhachThueSua("");
    setMatKhauSua("");
    setLoiSua("");
  };

  const toggleLock = async (user: User) => {
    try {
      await api.put(
        `/nguoi-dung/${user.id}/${user.active ? "khoa" : "mo-khoa"}`,
      );
      notify(user.active ? p.okLock : p.okUnlock, "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? s.noPermission : s.errUpdate;
      setLoi(message);
      notify(message, "error");
      return;
    }
    tai();
  };

  const filtered = danhSach.filter((u) => {
    const q = tuKhoa.trim().toLowerCase();
    const matchesQuery = !q
      ? true
      : u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);
    const matchesRole = locVaiTro ? u.role === locVaiTro : true;
    return matchesQuery && matchesRole;
  });

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card">
          <div className="grid grid-3">
            <input
              placeholder={p.searchPh}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <select
              value={locVaiTro}
              onChange={(e) => setLocVaiTro(e.target.value)}
            >
              <option value="">{s.allRoles}</option>
              <option value="ADMIN">{nhanVaiTro(tr, "ADMIN")}</option>
              <option value="STAFF">{nhanVaiTro(tr, "STAFF")}</option>
              <option value="TENANT">{nhanVaiTro(tr, "TENANT")}</option>
            </select>
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn"
                  onClick={() => {
                    setHoTenTaoMoi("");
                    setSdtTaoMoi("");
                    setHienThiTaoMoi(true);
                    taiKhachThue();
                  }}
                >
                  <IconPlus /> {p.createAccount}
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
            data={filtered}
            columns={[
              { header: s.id, render: (u) => u.id },
              { header: s.account, render: (u) => u.username },
              {
                header: s.fullName,
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  return linked?.fullName ?? u.fullName ?? "—";
                },
              },
              {
                header: s.phone,
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  const sdtNguoi = u.phone?.trim();
                  return linked?.phone?.trim() || sdtNguoi || "—";
                },
              },
              {
                header: s.idNumber,
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  return linked?.idNumber ?? "—";
                },
              },
              {
                header: s.role,
                render: (u) => (
                  <span className={classBadgeVaiTro(u.role)}>
                    {nhanVaiTro(tr, u.role)}
                  </span>
                ),
              },
              {
                header: s.status,
                render: (u) => (
                  <span className={classBadgeNguoiDungActive(u.active)}>
                    {u.active ? s.active : s.locked}
                  </span>
                ),
              },
              ...(laQuanTri
                ? [
                    {
                      header: s.actions,
                      render: (u: User) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => batDauSua(u)}>
                            <IconPencil /> {s.edit}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => moModalLienKet(u)}
                            title={p.linkUserBtnTitle}
                          >
                            <IconLink /> {p.linkUser}
                          </button>
                          <button
                            type="button"
                            className={`btn ${u.active ? "btn-lock" : "btn-unlock"}`}
                            onClick={() => toggleLock(u)}
                            title={
                              u.active ? p.lockAccount : p.unlockAccount
                            }
                          >
                            {u.active ? (
                              <>
                                <IconTrash /> {p.lock}
                              </>
                            ) : (
                              <>
                                <IconCheck /> {p.unlock}
                              </>
                            )}
                          </button>
                        </div>
                      ),
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
                  <h3>{p.createAccount}</h3>
                  <p className="card-subtitle">{p.createSub}</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">{s.account}</label>
                  <input
                    placeholder={p.usernamePh}
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="field-label">{s.password}</label>
                  <input
                    placeholder={p.passwordPh}
                    type="password"
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">{s.role}</label>
                  <select
                    value={vaiTro}
                    onChange={(e) => {
                      const v = e.target.value;
                      setVaiTro(v);
                      if (v !== "TENANT") setIdKhachThue("");
                      if (v !== "STAFF") {
                        setHoTenTaoMoi("");
                        setSdtTaoMoi("");
                      }
                    }}
                  >
                    <option value="ADMIN">{nhanVaiTro(tr, "ADMIN")}</option>
                    <option value="STAFF">{nhanVaiTro(tr, "STAFF")}</option>
                    <option value="TENANT">{nhanVaiTro(tr, "TENANT")}</option>
                  </select>
                </div>
                {vaiTro === "STAFF" && (
                  <>
                    <div>
                      <label className="field-label">{s.fullName}</label>
                      <input
                        placeholder={p.displayNamePh}
                        value={hoTenTaoMoi}
                        onChange={(e) => setHoTenTaoMoi(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">{s.phone}</label>
                      <input
                        placeholder={p.phoneOptionalPh}
                        value={sdtTaoMoi}
                        onChange={(e) => setSdtTaoMoi(e.target.value)}
                      />
                    </div>
                  </>
                )}
                {vaiTro === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">{p.linkToTenant}</label>
                    <ChonKhachThueCombobox
                      danhSach={danhSachKhachThue}
                      value={idKhachThue}
                      onChange={setIdKhachThue}
                      chiChuaCoTaiKhoan
                      placeholderChuaChon={p.noLinkCreate}
                      placeholderTim={p.searchTenantPh}
                    />
                    <p className="card-subtitle" style={{ marginTop: 4 }}>
                      {p.linkToTenantHint}
                    </p>
                  </div>
                )}
                {loi && <div className="form-error">{loi}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      setHienThiTaoMoi(false);
                      setHoTenTaoMoi("");
                      setSdtTaoMoi("");
                    }}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconPlus /> {p.createAccount}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {nguoiDungLienKet && (
          <div className="modal-backdrop">
            <div className="modal-card form-card link-tenant-modal">
              <div className="card-header">
                <div>
                  <h3>{p.linkUserTitle}</h3>
                  <p className="card-subtitle">
                    {p.linkUserAccount}:{" "}
                    <strong>{nguoiDungLienKet.username}</strong>
                  </p>
                </div>
              </div>
              <div className="link-mode-radios">
                <label className="link-mode-radio">
                  <input
                    type="radio"
                    name="cheDoLienKet"
                    checked={cheDoLienKet === "existing"}
                    onChange={() => setCheDoLienKet("existing")}
                  />
                  <span>{p.pickExisting}</span>
                </label>
                <label className="link-mode-radio">
                  <input
                    type="radio"
                    name="cheDoLienKet"
                    checked={cheDoLienKet === "new"}
                    onChange={() => setCheDoLienKet("new")}
                  />
                  <span>{p.createNew}</span>
                </label>
              </div>

              {cheDoLienKet === "existing" ? (
                <>
                  <div className="form-grid">
                    <div className="form-span-2">
                      <label className="field-label">{p.linkTenant}</label>
                      <ChonKhachThueCombobox
                        danhSach={danhSachKhachThue}
                        value={idKhachThueLienKet}
                        onChange={setIdKhachThueLienKet}
                        idNguoiDungGan={nguoiDungLienKet.id}
                        placeholderChuaChon={p.noLink}
                        placeholderTim={p.searchTenantPh}
                      />
                    </div>
                    {loiLienKet && (
                      <div className="form-error form-span-2">{loiLienKet}</div>
                    )}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 16 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setNguoiDungLienKet(null);
                        setIdKhachThueLienKet("");
                        setLoiLienKet("");
                      }}
                    >
                      <IconTimes /> {c.cancel}
                    </button>
                    <button className="btn" onClick={saveLinkTenant}>
                      <IconCheck /> {c.save}
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={createAndLinkTenant}
                  className="form-grid"
                  style={{ marginTop: 8 }}
                >
                  <div>
                    <label className="field-label">{s.fullName}</label>
                    <input
                      placeholder={s.fullName}
                      value={hoTenKhachMoi}
                      onChange={(e) => setHoTenKhachMoi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">{s.phone}</label>
                    <input
                      placeholder={p.phoneDigitsPh}
                      value={sdtKhachMoi}
                      onChange={(e) => setSdtKhachMoi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">{s.idNumber}</label>
                    <input
                      placeholder={s.idNumber}
                      value={cccdKhachMoi}
                      onChange={(e) => setCccdKhachMoi(e.target.value)}
                    />
                  </div>
                  <div className="form-span-2">
                    <label className="field-label">{s.address}</label>
                    <input
                      placeholder={p.addressResidencePh}
                      value={diaChiKhachMoi}
                      onChange={(e) => setDiaChiKhachMoi(e.target.value)}
                    />
                  </div>
                  <div className="form-span-2">
                    <label className="field-label">{s.email}</label>
                    <input
                      placeholder={p.emailOptionalPh}
                      value={emailKhachMoi}
                      onChange={(e) => setEmailKhachMoi(e.target.value)}
                    />
                  </div>
                  {loiKhachMoi && (
                    <div className="form-error form-span-2">
                      {loiKhachMoi}
                    </div>
                  )}
                  <div
                    className="form-actions form-span-2"
                    style={{ marginTop: 8 }}
                  >
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => {
                        setNguoiDungLienKet(null);
                        setCheDoLienKet("existing");
                        setLoiKhachMoi("");
                      }}
                    >
                      <IconTimes /> {c.cancel}
                    </button>
                    <button className="btn" type="submit">
                      <IconPlus /> {p.createAndLink}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {phanTuDangSua && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>{p.editTitle}</h3>
              <div className="form-grid">
                {phanTuDangSua.role === "STAFF" && (
                  <>
                    <div>
                      <label className="field-label">{s.fullName}</label>
                      <input
                        placeholder={s.fullName}
                        value={hoTenSua}
                        onChange={(e) => setHoTenSua(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">{s.phone}</label>
                      <input
                        placeholder={s.phone}
                        value={sdtSua}
                        onChange={(e) => setSdtSua(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="field-label">{s.role}</label>
                  <div className="readonly-field">
                    {phanTuDangSua ? nhanVaiTro(tr, phanTuDangSua.role) : "—"}
                  </div>
                </div>
                <div>
                  <label className="field-label">{p.newPassword}</label>
                  <input
                    placeholder={p.pwOptional}
                    type="password"
                    value={matKhauSua}
                    onChange={(e) => setMatKhauSua(e.target.value)}
                  />
                </div>
                {phanTuDangSua?.role === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">{p.linkToTenant}</label>
                    <p className="card-subtitle" style={{ marginBottom: 8 }}>
                      {p.editTenantHint}
                    </p>
                    <ChonKhachThueCombobox
                      danhSach={danhSachKhachThue}
                      value={idKhachThueSua}
                      onChange={setIdKhachThueSua}
                      idNguoiDungGan={phanTuDangSua.id}
                      placeholderChuaChon={p.noLink}
                      placeholderTim={p.searchTenantPh}
                    />
                  </div>
                )}
                {loiSua && <div className="form-error">{loiSua}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={luuSua}>
                  <IconCheck /> {c.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
