"use client";

import { useEffect, useRef, useState } from "react";
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

type Notification = {
  id: number;
  message: string;
  readFlag: boolean;
  sentAt: string;
};
type User = { id: number; username: string; fullName?: string };

export default function TrangThongBao() {
  const [daMount, setDaMount] = useState(false);
  const [danhSach, setDanhSach] = useState<Notification[]>([]);
  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState<User[]>([]);
  const [noiDung, setNoiDung] = useState("");
  const [idNguoiNhan, setIdNguoiNhan] = useState("");
  const [hienThiTaoMoi, setHienThiTaoMoi] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangTao, setDangTao] = useState(false);
  const vaiTro = daMount ? getRole() : null;
  const laQuanTri = vaiTro === "ADMIN";
  const { notify } = useToast();
  const contextThongBao = useThongBao();
  const clientRef = useRef<ReturnType<typeof createNotificationClient>>(null);

  useEffect(() => {
    setDaMount(true);
  }, []);

  const tai = async () => {
    const phanHoi = await api.get("/thong-bao");
    const duLieu = phanHoi.data || [];
    setDanhSach(duLieu);
    contextThongBao?.refetchUnread(duLieu);
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
        const phanHoi = await api.get("/nguoi-dung");
        setDanhSachNguoiDung(phanHoi.data || []);
      } catch {
        setDanhSachNguoiDung([]);
      }
    };
    taiNguoiDung();
  }, [daMount, laQuanTri]);

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
                  <select
                    value={idNguoiNhan}
                    onChange={(e) => setIdNguoiNhan(e.target.value)}
                  >
                    <option value="">Tất cả người dùng</option>
                    {danhSachNguoiDung.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} {u.fullName ? `(${u.fullName})` : ""}
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
