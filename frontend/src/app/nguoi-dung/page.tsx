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
  IconLink,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";

type User = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  active: boolean;
  /** SĐT trên tài khoản (nếu API có). */
  phone?: string | null;
};
type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  user?: { id: number };
};

type RawJson = Record<string, unknown>;

/** Spring trả camelCase tiếng Việt: tenDangNhap, hoTen, vaiTro, kichHoat… */
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

  const sdt = r.soDienThoai ?? r.phone;
  return {
    id: Number(r.id),
    username: String(
      r.tenDangNhap ?? r.username ?? r["tendangnhap"] ?? "",
    ).trim(),
    fullName: String(r.hoTen ?? r.fullName ?? r["hoten"] ?? "").trim(),
    role,
    active,
    phone:
      sdt != null && String(sdt).trim() !== "" ? String(sdt).trim() : null,
  };
}

function chuanHoaKhachThueTuApi(raw: RawJson): Tenant {
  const nd = raw.nguoiDung as { id?: number } | undefined;
  const userObj = raw.user as { id?: number } | undefined;
  const userId = nd?.id ?? userObj?.id;
  return {
    id: Number(raw.id),
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
    user: userId != null ? { id: Number(userId) } : undefined,
  };
}

const roleLabel = (value?: string) => {
  switch (value) {
    case "ADMIN":
      return "Quản trị";
    case "STAFF":
      return "Nhân viên";
    case "TENANT":
      return "Khách thuê";
    default:
      return value || "-";
  }
};

const statusBadge = (active: boolean) =>
  active ? "status-available" : "status-maintenance";

const roleBadge = (value?: string) => {
  switch (value) {
    case "ADMIN":
      return "status-occupied";
    case "STAFF":
      return "status-available";
    case "TENANT":
      return "status-maintenance";
    default:
      return "status-unknown";
  }
};

const validateTenant = (data: {
  fullName: string;
  phone: string;
  idNumber: string;
  address: string;
  email: string;
}) => {
  if (!data.fullName.trim()) return "Vui lòng nhập họ tên";
  if (!data.phone.trim()) return "Vui lòng nhập số điện thoại";
  if (!/^\d{9,11}$/.test(data.phone.trim())) return "SĐT không hợp lệ";
  if (!data.idNumber.trim()) return "Vui lòng nhập CCCD/CMND";
  if (!/^\d{9,12}$/.test(data.idNumber.trim())) return "CCCD/CMND không hợp lệ";
  if (!data.address.trim()) return "Vui lòng nhập địa chỉ";
  if (
    data.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return "Email không hợp lệ";
  }
  return "";
};

export default function TrangNguoiDung() {
  const [danhSach, setDanhSach] = useState<User[]>([]);
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
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
      setLoi("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }
    setLoi("");
    try {
      await api.post("/nguoi-dung", {
        tenDangNhap: ten,
        matKhau,
        hoTen: "",
        vaiTro,
        kichHoat: true,
        maKhachThue:
          vaiTro === "TENANT" && idKhachThue ? Number(idKhachThue) : null,
      });
      notify("Tạo tài khoản thành công", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo tài khoản thất bại";
      setLoi(thongBao);
      notify(thongBao, "error");
      return;
    }
    setTenDangNhap("");
    setMatKhau("");
    setVaiTro("STAFF");
    setIdKhachThue("");
    setHienThiTaoMoi(false);
    tai();
  };

  const batDauSua = (user: User) => {
    setPhanTuDangSua(user);
    setHoTenSua(user.fullName || "");
    setSdtSua((user as User & { phone?: string }).phone || "");
    setIdKhachThueSua("");
    setMatKhauSua("");
    setLoiSua("");
    taiKhachThue();
  };

  useEffect(() => {
    if (phanTuDangSua && danhSachKhachThue.length > 0) {
      const lienKet = danhSachKhachThue.find(
        (t) => t.user?.id === phanTuDangSua.id,
      );
      setIdKhachThueSua(lienKet ? String(lienKet.id) : "");
    }
  }, [phanTuDangSua?.id, danhSachKhachThue]);

  const luuSua = async () => {
    if (!phanTuDangSua) return;
    try {
      await api.put(`/nguoi-dung/${phanTuDangSua.id}`, {
        hoTen: hoTenSua.trim(),
        soDienThoai: sdtSua.trim() || null,
        vaiTro: phanTuDangSua.role,
        kichHoat: phanTuDangSua.active,
        matKhau: matKhauSua.trim() || null,
      });
      await api.put(`/nguoi-dung/${phanTuDangSua.id}/khach-thue`, {
        tenantId: idKhachThueSua ? Number(idKhachThueSua) : null,
      });
      notify("Cập nhật người dùng thành công", "success");
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
        tenantId: idKhachThueLienKet ? Number(idKhachThueLienKet) : null,
      });
      notify("Gắn khách thuê thành công", "success");
      setNguoiDungLienKet(null);
      setIdKhachThueLienKet("");
      tai();
    } catch (err: any) {
      const msg =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Gắn khách thuê thất bại";
      setLoiLienKet(msg);
      notify(msg, "error");
    }
  };

  const createAndLinkTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiDungLienKet) return;
    const msg = validateTenant({
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
      notify("Tạo khách thuê và gắn tài khoản thành công", "success");
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
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo khách thuê thất bại";
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
      notify(
        user.active
          ? "Khóa tài khoản thành công"
          : "Mở khóa tài khoản thành công",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại";
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
      <ThanhDieuHuong />
      <div className="container">
        <h2>Quản lý người dùng</h2>
        <div className="card">
          <div className="grid grid-3">
            <input
              placeholder="Tìm kiếm theo tài khoản, họ tên, chức vụ..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <select
              value={locVaiTro}
              onChange={(e) => setLocVaiTro(e.target.value)}
            >
              <option value="">Tất cả chức vụ</option>
              <option value="ADMIN">Quản trị</option>
              <option value="STAFF">Nhân viên</option>
              <option value="TENANT">Khách thuê</option>
            </select>
            {laQuanTri && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn"
                  onClick={() => {
                    setHienThiTaoMoi(true);
                    taiKhachThue();
                  }}
                >
                  <IconPlus /> Tạo tài khoản
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
            data={filtered}
            columns={[
              { header: "ID", render: (u) => u.id },
              { header: "Tài khoản", render: (u) => u.username },
              {
                header: "Họ tên",
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  return linked?.fullName ?? u.fullName ?? "—";
                },
              },
              {
                header: "SĐT",
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  const sdtNguoi = u.phone?.trim();
                  return linked?.phone?.trim() || sdtNguoi || "—";
                },
              },
              {
                header: "CCCD",
                render: (u) => {
                  const linked = danhSachKhachThue.find(
                    (t) => t.user?.id === u.id,
                  );
                  return linked?.idNumber ?? "—";
                },
              },
              {
                header: "Chức vụ",
                render: (u) => (
                  <span className={`status-badge ${roleBadge(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                ),
              },
              {
                header: "Trạng thái",
                render: (u) => (
                  <span className={`status-badge ${statusBadge(u.active)}`}>
                    {u.active ? "Hoạt động" : "Đã khóa"}
                  </span>
                ),
              },
              ...(laQuanTri
                ? [
                    {
                      header: "Thao tác",
                      render: (u: User) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => batDauSua(u)}>
                            <IconPencil /> Sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => moModalLienKet(u)}
                            title="Gắn tài khoản với khách thuê"
                          >
                            <IconLink /> Gắn người dùng
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => toggleLock(u)}
                          >
                            {u.active ? (
                              <>
                                <IconTrash /> Khóa
                              </>
                            ) : (
                              <>
                                <IconCheck /> Mở
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
                  <h3>Tạo tài khoản</h3>
                  <p className="card-subtitle">Thiết lập thông tin đăng nhập</p>
                </div>
              </div>
              <form onSubmit={tao} className="form-grid">
                <div>
                  <label className="field-label">Tài khoản</label>
                  <input
                    placeholder="Nhập tên đăng nhập"
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="field-label">Mật khẩu</label>
                  <input
                    placeholder="Nhập mật khẩu"
                    type="password"
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Chức vụ</label>
                  <select
                    value={vaiTro}
                    onChange={(e) => {
                      setVaiTro(e.target.value);
                      if (e.target.value !== "TENANT") setIdKhachThue("");
                    }}
                  >
                    <option value="ADMIN">Quản trị</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="TENANT">Khách thuê</option>
                  </select>
                </div>
                {vaiTro === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">
                      Gắn với khách thuê (người được thuê)
                    </label>
                    <select
                      value={idKhachThue}
                      onChange={(e) => setIdKhachThue(e.target.value)}
                    >
                      <option value="">— Không gắn / Tạo mới —</option>
                      {danhSachKhachThue
                        .filter((t) => !t.user)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} (ID: {t.id})
                          </option>
                        ))}
                    </select>
                    <p className="card-subtitle" style={{ marginTop: 4 }}>
                      Chọn khách thuê có sẵn trong hệ thống để tài khoản đăng
                      nhập được gắn với hồ sơ đó.
                    </p>
                  </div>
                )}
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
                    <IconPlus /> Tạo tài khoản
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
                  <h3>Gắn người dùng với khách thuê</h3>
                  <p className="card-subtitle">
                    Tài khoản: <strong>{nguoiDungLienKet.username}</strong>
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
                  <span>Chọn khách thuê có sẵn</span>
                </label>
                <label className="link-mode-radio">
                  <input
                    type="radio"
                    name="cheDoLienKet"
                    checked={cheDoLienKet === "new"}
                    onChange={() => setCheDoLienKet("new")}
                  />
                  <span>Tạo khách thuê mới</span>
                </label>
              </div>

              {cheDoLienKet === "existing" ? (
                <>
                  <div className="form-grid">
                    <div className="form-span-2">
                      <label className="field-label">Khách thuê</label>
                      <select
                        value={idKhachThueLienKet}
                        onChange={(e) => setIdKhachThueLienKet(e.target.value)}
                      >
                        <option value="">— Không gắn —</option>
                        {danhSachKhachThue.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} (ID: {t.id})
                            {t.user?.id === nguoiDungLienKet.id
                              ? " ✓ đang gắn"
                              : ""}
                          </option>
                        ))}
                      </select>
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
                      <IconTimes /> Hủy
                    </button>
                    <button className="btn" onClick={saveLinkTenant}>
                      <IconCheck /> Lưu
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
                    <label className="field-label">Họ tên</label>
                    <input
                      placeholder="Họ tên"
                      value={hoTenKhachMoi}
                      onChange={(e) => setHoTenKhachMoi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">SĐT</label>
                    <input
                      placeholder="SĐT 9–11 số"
                      value={sdtKhachMoi}
                      onChange={(e) => setSdtKhachMoi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">CCCD/CMND</label>
                    <input
                      placeholder="CCCD/CMND"
                      value={cccdKhachMoi}
                      onChange={(e) => setCccdKhachMoi(e.target.value)}
                    />
                  </div>
                  <div className="form-span-2">
                    <label className="field-label">Địa chỉ</label>
                    <input
                      placeholder="Địa chỉ thường trú / tạm trú"
                      value={diaChiKhachMoi}
                      onChange={(e) => setDiaChiKhachMoi(e.target.value)}
                    />
                  </div>
                  <div className="form-span-2">
                    <label className="field-label">Email</label>
                    <input
                      placeholder="Email (không bắt buộc)"
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
                      <IconTimes /> Hủy
                    </button>
                    <button className="btn" type="submit">
                      <IconPlus /> Tạo khách thuê và gắn
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
              <h3>Chỉnh sửa người dùng</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">Họ tên</label>
                  <input
                    placeholder="Họ tên"
                    value={hoTenSua}
                    onChange={(e) => setHoTenSua(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">SĐT</label>
                  <input
                    placeholder="SĐT"
                    value={sdtSua}
                    onChange={(e) => setSdtSua(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Chức vụ</label>
                  <div className="readonly-field">
                    {phanTuDangSua ? roleLabel(phanTuDangSua.role) : "—"}
                  </div>
                </div>
                <div>
                  <label className="field-label">Mật khẩu mới</label>
                  <input
                    placeholder="Để trống nếu không đổi"
                    type="password"
                    value={matKhauSua}
                    onChange={(e) => setMatKhauSua(e.target.value)}
                  />
                </div>
                {phanTuDangSua?.role === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">
                      Gắn với khách thuê (người được thuê)
                    </label>
                    <select
                      value={idKhachThueSua}
                      onChange={(e) => setIdKhachThueSua(e.target.value)}
                    >
                      <option value="">— Không gắn —</option>
                      {danhSachKhachThue.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} (ID: {t.id})
                          {t.user?.id === phanTuDangSua?.id
                            ? " ✓ đang gắn"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {loiSua && <div className="form-error">{loiSua}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  <IconTimes /> Hủy
                </button>
                <button className="btn" onClick={luuSua}>
                  <IconCheck /> Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
