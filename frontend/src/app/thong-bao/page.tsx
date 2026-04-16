"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  createNotificationClient,
  type NotificationPayload,
} from "@/lib/notificationSocket";
import { useToast } from "@/components/NhaCungCapToast";
import { useThongBao } from "@/components/NhaCungCapThongBao";
import { IconPlus, IconTimes, IconSend, IconCheck } from "@/components/Icons";
import type { ThongBaoUi } from "@/lib/mapThongBaoApi";
import { mapThongBaoFromApi } from "@/lib/mapThongBaoApi";
type User = {
  id: number;
  username: string;
  fullName?: string;
  role?: string;
  phongHienThue?: string;
  khuHienThue?: string;
};

function tenVaiTroApi(code: string): string {
  const c = code.toUpperCase();
  if (c === "ADMIN") return "Quản trị";
  if (c === "STAFF") return "Nhân viên";
  if (c === "TENANT") return "Khách thuê";
  return code;
}

function mapNguoiDungChoThongBaoFromApi(raw: Record<string, unknown>): User | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const username = String(raw.tenDangNhap ?? raw.username ?? "").trim();
  if (!username) return null;
  const fullName = String(raw.hoTen ?? raw.fullName ?? "").trim();
  const role = String(raw.vaiTro ?? raw.role ?? "").trim();
  const phongHienThue = String(raw.phongHienThue ?? "").trim();
  const khuHienThue = String(raw.khuHienThue ?? "").trim();
  return {
    id,
    username,
    fullName: fullName || undefined,
    role: role || undefined,
    phongHienThue: phongHienThue || undefined,
    khuHienThue: khuHienThue || undefined,
  };
}

function mapNguoiDungFromApi(raw: Record<string, unknown>): User | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const username = String(raw.tenDangNhap ?? raw.username ?? "").trim();
  if (!username) return null;
  const fullName = String(raw.hoTen ?? raw.fullName ?? "").trim();
  const role = String(raw.vaiTro ?? raw.role ?? "").trim();
  return {
    id,
    username,
    fullName: fullName || undefined,
    role: role || undefined,
  };
}

function chuoiHienThiNguoiDung(u: User): string {
  const hoTen = u.fullName ? ` (${u.fullName})` : "";
  const vai = u.role ? ` — ${tenVaiTroApi(u.role)}` : "";
  const phongKhu =
    u.phongHienThue || u.khuHienThue
      ? ` · ${[u.phongHienThue, u.khuHienThue].filter(Boolean).join(" · ")}`
      : "";
  return `${u.username}${hoTen}${vai}${phongKhu}`;
}

function chuoiLocNguoiDung(u: User): string {
  return [
    u.username,
    u.fullName ?? "",
    u.role ?? "",
    u.role ? tenVaiTroApi(u.role) : "",
    u.phongHienThue ?? "",
    u.khuHienThue ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export default function TrangThongBao() {
  const [daMount, setDaMount] = useState(false);
  const [danhSach, setDanhSach] = useState<ThongBaoUi[]>([]);
  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState<User[]>([]);
  const [locNguoiNhan, setLocNguoiNhan] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [idNguoiNhan, setIdNguoiNhan] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangTao, setDangTao] = useState(false);
  const vaiTro = daMount ? getRole() : null;
  const laQuanTri = vaiTro === "ADMIN";
  const camDanhDauDaDoc = vaiTro === "ADMIN" || vaiTro === "STAFF";
  const { notify } = useToast();
  const contextThongBao = useThongBao();
  const clientRef = useRef<ReturnType<typeof createNotificationClient>>(null);

  useEffect(() => {
    setDaMount(true);
  }, []);

  const tai = async () => {
    const phanHoi = await api.get("/thong-bao");
    const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
    const mapped = duLieu.map((x) =>
      mapThongBaoFromApi(x as Record<string, unknown>),
    );
    setDanhSach(mapped);
    contextThongBao?.refetchUnread(mapped);
  };

  useEffect(() => {
    if (daMount) tai();
  }, [daMount]);

  useEffect(() => {
    if (!daMount || !contextThongBao?.lastIncoming) return;
    const p = contextThongBao.lastIncoming;
    setDanhSach((prev) => [
      {
        id: p.id,
        message: p.message,
        readFlag: p.readFlag ?? false,
        sentAt: p.sentAt || new Date().toISOString(),
      },
      ...prev,
    ]);
    contextThongBao.clearLastIncoming();
  }, [daMount, contextThongBao?.lastIncoming]);

  useEffect(() => {
    if (!daMount || !laQuanTri) return;
    const taiNguoiDung = async () => {
      try {
        const phanHoi = await api.get("/nguoi-dung/cho-thong-bao");
        const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
        const mapped = duLieu
          .map((x) => mapNguoiDungChoThongBaoFromApi(x as Record<string, unknown>))
          .filter((u): u is User => u != null);
        setDanhSachNguoiDung(mapped);
      } catch {
        try {
          const phanHoi = await api.get("/nguoi-dung");
          const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
          const mapped = duLieu
            .map((x) => mapNguoiDungFromApi(x as Record<string, unknown>))
            .filter((u): u is User => u != null);
          setDanhSachNguoiDung(mapped);
        } catch {
          setDanhSachNguoiDung([]);
        }
      }
    };
    taiNguoiDung();
  }, [daMount, laQuanTri]);

  const danhSachNguoiDungLoc = useMemo(() => {
    const q = locNguoiNhan.trim().toLowerCase();
    const locTheoChuoi = q
      ? danhSachNguoiDung.filter((u) => chuoiLocNguoiDung(u).includes(q))
      : danhSachNguoiDung;
    const selId = idNguoiNhan ? Number(idNguoiNhan) : NaN;
    if (!Number.isFinite(selId) || selId <= 0) return locTheoChuoi;
    if (locTheoChuoi.some((u) => u.id === selId)) return locTheoChuoi;
    const dangChon = danhSachNguoiDung.find((u) => u.id === selId);
    return dangChon ? [dangChon, ...locTheoChuoi] : locTheoChuoi;
  }, [danhSachNguoiDung, locNguoiNhan, idNguoiNhan]);

  useEffect(() => {
    if (!daMount || !laQuanTri) return;
    const client = createNotificationClient(
      (payload: NotificationPayload) => {
        setDanhSach((prev) => [
          {
            id: payload.id,
            message: payload.message,
            readFlag: payload.readFlag ?? false,
            sentAt: payload.sentAt || new Date().toISOString(),
          },
          ...prev,
        ]);
        notify(
          "Bạn có thông báo mới: " +
            payload.message.slice(0, 50) +
            (payload.message.length > 50 ? "…" : ""),
          "info",
        );
      },
      () => {},
      () => {},
    );
    if (client) {
      client.activate();
      clientRef.current = client;
    }
    return () => {
      clientRef.current?.deactivate?.();
      clientRef.current = null;
    };
  }, [daMount, laQuanTri, notify]);

  const danhDauDaDoc = async (id: number) => {
    await api.put(`/thong-bao/${id}/da-doc`);
    await tai();
    contextThongBao?.refetchUnread();
  };

  const taoThongBao = async (e: React.FormEvent) => {
    e.preventDefault();
    const nd = noiDung.trim();
    if (!nd) {
      setLoi("Vui lòng nhập nội dung thông báo");
      return;
    }
    setLoi("");
    setDangTao(true);
    try {
      await api.post("/thong-bao", {
        message: nd,
        userId: idNguoiNhan ? Number(idNguoiNhan) : null,
      });
      notify("Đã gửi thông báo", "success");
      setNoiDung("");
      setIdNguoiNhan("");
      setHienThiTaoMoi(false);
      tai();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const thongBao =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền"
          : "Gửi thông báo thất bại");
      setLoi(thongBao);
      notify(thongBao, "error");
    } finally {
      setDangTao(false);
    }
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Thông báo</h2>
        {daMount && laQuanTri && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setHienThiTaoMoi(true);
                  setLocNguoiNhan("");
                  setLoi("");
                }}
              >
                <IconPlus /> Tạo thông báo
              </button>
            </div>
          </div>
        )}
        <div className="card">
          <BangDonGian
            data={danhSach}
            columns={[
              { header: "ID", render: (n) => n.id },
              { header: "Nội dung", render: (n) => n.message },
              {
                header: "Trạng thái",
                render: (n) => (n.readFlag ? "Đã đọc" : "Chưa đọc"),
              },
              {
                header: "Hành động",
                render: (n) => (
                  <button
                    type="button"
                    className="btn"
                    disabled={camDanhDauDaDoc}
                    title={
                      camDanhDauDaDoc
                        ? "Chỉ khách thuê mới đánh dấu đã đọc thông báo của mình."
                        : undefined
                    }
                    onClick={() => danhDauDaDoc(n.id)}
                  >
                    <IconCheck /> Đánh dấu đã đọc
                  </button>
                ),
              },
            ]}
          />
        </div>

        {daMount && hienThiTaoMoi && laQuanTri && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Tạo thông báo</h3>
                  <p className="card-subtitle">
                    Gửi cho tất cả hoặc một người dùng. Người nhận sẽ thấy thông
                    báo realtime.
                  </p>
                </div>
              </div>
              <form onSubmit={taoThongBao} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    Nội dung <span className="required">*</span>
                  </label>
                  <textarea
                    placeholder="Nội dung thông báo..."
                    value={noiDung}
                    onChange={(e) => setNoiDung(e.target.value)}
                    rows={4}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gửi đến</label>
                  <input
                    type="search"
                    placeholder="Lọc theo tên đăng nhập, họ tên, phòng, khu, vai trò…"
                    value={locNguoiNhan}
                    onChange={(e) => setLocNguoiNhan(e.target.value)}
                    aria-label="Lọc danh sách người nhận"
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                  <select
                    value={idNguoiNhan}
                    onChange={(e) => setIdNguoiNhan(e.target.value)}
                  >
                    <option value="">Tất cả người dùng</option>
                    {danhSachNguoiDungLoc.map((u) => (
                      <option key={u.id} value={u.id}>
                        {chuoiHienThiNguoiDung(u)}
                      </option>
                    ))}
                  </select>
                </div>
                {loi && <div className="form-error form-span-2">{loi}</div>}
                <div className="form-actions form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setHienThiTaoMoi(false);
                      setLocNguoiNhan("");
                      setLoi("");
                    }}
                  >
                    <IconTimes /> Hủy
                  </button>
                  <button type="submit" className="btn" disabled={dangTao}>
                    {dangTao ? (
                      "Đang gửi…"
                    ) : (
                      <>
                        <IconSend /> Gửi thông báo
                      </>
                    )}
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
