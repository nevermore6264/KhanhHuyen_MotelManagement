"use client";

import { useCallback, useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import api from "@/lib/api";
import { getRole, getToken, setAuth } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { IconCheck } from "@/components/Icons";

type HoSoCaNhan = {
  id?: string;
  tenDangNhap?: string;
  hoTen?: string;
  soDienThoai?: string;
  email?: string;
  vaiTro?: string;
  kichHoat?: boolean;
  khachThueId?: string;
  soGiayTo?: string;
  diaChi?: string;
};

const vaiTroLabel = (v?: string) => {
  switch (v) {
    case "ADMIN":
      return "Quản trị";
    case "STAFF":
      return "Nhân viên";
    case "TENANT":
      return "Khách thuê";
    default:
      return v || "—";
  }
};

export default function TrangHoSoCaNhan() {
  const [hoSo, setHoSo] = useState<HoSoCaNhan | null>(null);
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [soGiayTo, setSoGiayTo] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [dangLuuHoSo, setDangLuuHoSo] = useState(false);
  const [dangDoiMk, setDangDoiMk] = useState(false);
  const { notify } = useToast();

  const laKhachThue = hoSo?.vaiTro === "TENANT" && !!hoSo?.khachThueId;

  const taiHoSo = useCallback(async () => {
    setDangTai(true);
    try {
      const res = await api.get("/tai-khoan/cua-toi");
      const p = res.data as HoSoCaNhan;
      setHoSo(p);
      setHoTen(p.hoTen ?? "");
      setSoDienThoai(p.soDienThoai ?? "");
      setEmail(p.email ?? "");
      setSoGiayTo(p.soGiayTo ?? "");
      setDiaChi(p.diaChi ?? "");
    } catch {
      notify("Không tải được hồ sơ cá nhân.", "error");
    } finally {
      setDangTai(false);
    }
  }, [notify]);

  useEffect(() => {
    taiHoSo();
  }, [taiHoSo]);

  const luuHoSo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      notify("Họ tên không được để trống.", "error");
      return;
    }
    setDangLuuHoSo(true);
    try {
      const res = await api.put("/tai-khoan/cua-toi", {
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim() || null,
        email: email.trim() || null,
        soGiayTo: laKhachThue ? soGiayTo.trim() || null : undefined,
        diaChi: laKhachThue ? diaChi.trim() || null : undefined,
      });
      const data = res.data as { profile?: HoSoCaNhan; message?: string };
      const p = data.profile ?? (res.data as HoSoCaNhan);
      if (p) {
        setHoSo(p);
        const token = getToken();
        const role = getRole();
        if (token && role) {
          setAuth(token, role, p.hoTen ?? hoTen.trim());
        }
      }
      notify(data.message ?? "Đã cập nhật hồ sơ.", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(ax?.response?.data?.message ?? "Cập nhật hồ sơ thất bại.", "error");
    } finally {
      setDangLuuHoSo(false);
    }
  };

  const doiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhauMoi.length < 6) {
      notify("Mật khẩu mới tối thiểu 6 ký tự.", "error");
      return;
    }
    if (matKhauMoi !== xacNhan) {
      notify("Xác nhận mật khẩu không khớp.", "error");
      return;
    }
    setDangDoiMk(true);
    try {
      await api.post("/xac-thuc/doi-mat-khau", {
        matKhauCu,
        matKhauMoi,
      });
      setMatKhauCu("");
      setMatKhauMoi("");
      setXacNhan("");
      notify("Đã đổi mật khẩu thành công.", "success");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(
        ax?.response?.data?.message ??
          "Đổi mật khẩu thất bại. Kiểm tra mật khẩu hiện tại.",
        "error",
      );
    } finally {
      setDangDoiMk(false);
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-account">
        <h2>Hồ sơ cá nhân</h2>
        <p className="text-muted" style={{ marginTop: -8, marginBottom: 20 }}>
          Xem và cập nhật thông tin tài khoản của bạn.
        </p>

        {dangTai ? (
          <p className="text-muted">Đang tải hồ sơ…</p>
        ) : (
          <div className="grid" style={{ gap: 24, maxWidth: 560 }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Thông tin chung</h3>
              <form onSubmit={luuHoSo} className="grid">
                <div>
                  <label className="field-label">Tên đăng nhập</label>
                  <input
                    value={hoSo?.tenDangNhap ?? ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="field-label">Vai trò</label>
                  <input
                    value={vaiTroLabel(hoSo?.vaiTro)}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="field-label">Họ và tên</label>
                  <input
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Số điện thoại</label>
                  <input
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    placeholder="VD: 0901234567"
                  />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                {laKhachThue && (
                  <>
                    <div>
                      <label className="field-label">Số CCCD / CMND</label>
                      <input
                        value={soGiayTo}
                        onChange={(e) => setSoGiayTo(e.target.value)}
                        placeholder="Số giấy tờ tùy thân"
                      />
                    </div>
                    <div>
                      <label className="field-label">Địa chỉ</label>
                      <input
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.target.value)}
                        placeholder="Địa chỉ thường trú / liên hệ"
                      />
                    </div>
                  </>
                )}
                <button className="btn" type="submit" disabled={dangLuuHoSo}>
                  <IconCheck /> {dangLuuHoSo ? "Đang lưu…" : "Lưu hồ sơ"}
                </button>
              </form>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Đổi mật khẩu</h3>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Đổi mật khẩu khi đã đăng nhập (khác với quên mật khẩu qua email).
              </p>
              <form onSubmit={doiMatKhau} className="grid">
                <div>
                  <label className="field-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={matKhauCu}
                    onChange={(e) => setMatKhauCu(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="field-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={matKhauMoi}
                    onChange={(e) => setMatKhauMoi(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="field-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={xacNhan}
                    onChange={(e) => setXacNhan(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button className="btn btn-secondary" type="submit" disabled={dangDoiMk}>
                  <IconCheck /> {dangDoiMk ? "Đang đổi…" : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
