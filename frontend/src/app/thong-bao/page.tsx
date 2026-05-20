"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  createNotificationClient,
  type NotificationPayload,
} from "@/lib/notificationSocket";
import { useToast } from "@/components/NhaCungCapToast";
import { useThongBao } from "@/components/NhaCungCapThongBao";
import {
  IconPlus,
  IconTimes,
  IconSend,
  IconCheck,
  IconTrash,
} from "@/components/Icons";
import type { ThongBaoUi } from "@/lib/mapThongBaoApi";
import { mapThongBaoFromApi } from "@/lib/mapThongBaoApi";
import {
  type BoLocThongBao,
  dinhDangThoiGian,
  locThongBao,
  nhomTheoNgay,
  thoiGianTuongDoi,
} from "@/lib/thongBaoHienThi";
type User = {
  id: string;
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
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) return null;
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
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) return null;
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


function duocChonLamNguoiNhanThongBao(u: User): boolean {
  return String(u.role ?? "").toUpperCase() !== "ADMIN";
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
  const [dangXoaId, setDangXoaId] = useState<string | null>(null);
  const [danhSachMau, setDanhSachMau] = useState<
    { id: string; tieuDe: string; noiDung: string }[]
  >([]);
  const [mauId, setMauId] = useState("");
  const [boLoc, setBoLoc] = useState<BoLocThongBao>("all");
  const [dangDanhDauTatCa, setDangDanhDauTatCa] = useState(false);
  const vaiTro = daMount ? getRole() : null;
  const laQuanTri = vaiTro === "ADMIN";
  const camDanhDauDaDoc = vaiTro === "ADMIN" || vaiTro === "STAFF";
  const { notify } = useToast();
  const contextThongBao = useThongBao();
  const clientRef = useRef<ReturnType<typeof createNotificationClient>>(null);

  useEffect(() => {
    setDaMount(true);
  }, []);

  useEffect(() => {
    if (!daMount || !laQuanTri) return;
    api
      .get("/thong-bao/mau")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setDanhSachMau(
          arr.map((x) => {
            const r = x as { id?: string; tieuDe?: string; noiDung?: string };
            return {
              id: String(r.id ?? ""),
              tieuDe: String(r.tieuDe ?? ""),
              noiDung: String(r.noiDung ?? ""),
            };
          }),
        );
      })
      .catch(() => setDanhSachMau([]));
  }, [daMount, laQuanTri]);

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
        id: String(p.id),
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
          .filter((u): u is User => u != null)
          .filter(duocChonLamNguoiNhanThongBao);
        setDanhSachNguoiDung(mapped);
      } catch {
        try {
          const phanHoi = await api.get("/nguoi-dung");
          const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
          const mapped = duLieu
            .map((x) => mapNguoiDungFromApi(x as Record<string, unknown>))
            .filter((u): u is User => u != null)
            .filter(duocChonLamNguoiNhanThongBao);
          setDanhSachNguoiDung(mapped);
        } catch {
          setDanhSachNguoiDung([]);
        }
      }
    };
    taiNguoiDung();
  }, [daMount, laQuanTri]);

  useEffect(() => {
    if (!idNguoiNhan.trim()) return;
    if (!danhSachNguoiDung.some((u) => u.id === idNguoiNhan)) {
      setIdNguoiNhan("");
    }
  }, [danhSachNguoiDung, idNguoiNhan]);

  const danhSachSapXep = useMemo(
    () =>
      [...danhSach].sort(
        (a, b) =>
          new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime(),
      ),
    [danhSach],
  );

  const soChuaDoc = useMemo(
    () => danhSachSapXep.filter((n) => !n.readFlag).length,
    [danhSachSapXep],
  );
  const soDaDoc = useMemo(
    () => danhSachSapXep.filter((n) => n.readFlag).length,
    [danhSachSapXep],
  );
  const danhSachLoc = useMemo(
    () => locThongBao(danhSachSapXep, boLoc),
    [danhSachSapXep, boLoc],
  );
  const nhomNgay = useMemo(() => nhomTheoNgay(danhSachLoc), [danhSachLoc]);

  const danhDauTatCaDaDoc = async () => {
    const chuaDoc = danhSach.filter((n) => !n.readFlag);
    if (chuaDoc.length === 0) return;
    setDangDanhDauTatCa(true);
    try {
      await Promise.all(
        chuaDoc.map((n) => api.put(`/thong-bao/${n.id}/da-doc`)),
      );
      notify("Đã đánh dấu tất cả là đã đọc", "success");
      await tai();
      contextThongBao?.refetchUnread();
    } catch {
      notify("Không cập nhật được trạng thái", "error");
    } finally {
      setDangDanhDauTatCa(false);
    }
  };

  const danhSachNguoiDungLoc = useMemo(() => {
    const q = locNguoiNhan.trim().toLowerCase();
    const locTheoChuoi = q
      ? danhSachNguoiDung.filter((u) => chuoiLocNguoiDung(u).includes(q))
      : danhSachNguoiDung;
    const selId = idNguoiNhan.trim();
    if (!selId) return locTheoChuoi;
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
            id: String(payload.id),
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

  const danhDauDaDoc = async (id: string) => {
    await api.put(`/thong-bao/${id}/da-doc`);
    await tai();
    contextThongBao?.refetchUnread();
  };

  const xoaThongBao = async (id: string) => {
    if (!laQuanTri) return;
    if (!window.confirm("Xóa thông báo này? Hành động không hoàn tác.")) return;
    setDangXoaId(id);
    try {
      await api.delete(`/thong-bao/${id}`);
      notify("Đã xóa thông báo", "success");
      await tai();
      contextThongBao?.refetchUnread();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền xóa"
          : "Xóa thông báo thất bại");
      notify(msg, "error");
    } finally {
      setDangXoaId(null);
    }
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
        userId: idNguoiNhan.trim() ? idNguoiNhan.trim() : null,
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
      <div className="page-shell page-thong-bao">
        <header className="tb-page-header">
          <div>
            <h2>Thông báo</h2>
            <p>
              {laQuanTri
                ? "Gửi thông báo tới người dùng và theo dõi trạng thái đã đọc."
                : "Cập nhật từ ban quản lý — đánh dấu đã đọc khi bạn đã xem."}
            </p>
          </div>
          <div className="tb-header-actions">
            {!camDanhDauDaDoc && soChuaDoc > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={dangDanhDauTatCa}
                onClick={() => void danhDauTatCaDaDoc()}
              >
                <IconCheck />{" "}
                {dangDanhDauTatCa ? "Đang cập nhật…" : "Đọc tất cả"}
              </button>
            )}
            {daMount && laQuanTri && (
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
            )}
          </div>
        </header>

        <div className="tb-stats">
          <div className="tb-stat">
            <strong>{danhSachSapXep.length}</strong>
            <span>Tổng số</span>
          </div>
          <div className="tb-stat unread">
            <strong>{soChuaDoc}</strong>
            <span>Chưa đọc</span>
          </div>
          <div className="tb-stat">
            <strong>{soDaDoc}</strong>
            <span>Đã đọc</span>
          </div>
        </div>

        <div className="tb-filters" role="tablist" aria-label="Lọc thông báo">
          {(
            [
              { key: "all" as const, label: "Tất cả", count: danhSachSapXep.length },
              { key: "unread" as const, label: "Chưa đọc", count: soChuaDoc },
              { key: "read" as const, label: "Đã đọc", count: soDaDoc },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={boLoc === f.key}
              className={`tb-filter${boLoc === f.key ? " active" : ""}`}
              onClick={() => setBoLoc(f.key)}
            >
              {f.label}
              <span className="tb-filter-count">({f.count})</span>
            </button>
          ))}
        </div>

        <div className="tb-feed">
          {danhSachLoc.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon" aria-hidden>
                🔔
              </div>
              <h3>
                {boLoc === "unread"
                  ? "Không còn thông báo chưa đọc"
                  : boLoc === "read"
                    ? "Chưa có thông báo đã đọc"
                    : "Chưa có thông báo"}
              </h3>
              <p>
                {laQuanTri
                  ? "Bấm «Tạo thông báo» để gửi tin tới người dùng."
                  : "Khi có cập nhật mới, bạn sẽ thấy tại đây."}
              </p>
            </div>
          ) : (
            nhomNgay.map((nhom) => (
              <section key={nhom.nhan}>
                <h3 className="tb-group-label">{nhom.nhan}</h3>
                <div className="tb-list">
                  {nhom.items.map((n) => (
                    <article
                      key={n.id}
                      className={`tb-card${n.readFlag ? "" : " unread"}`}
                    >
                      <div className="tb-card-icon" aria-hidden>
                        {n.readFlag ? "📬" : "🔔"}
                      </div>
                      <div className="tb-card-body">
                        <div className="tb-card-top">
                          <span
                            className={`tb-badge${n.readFlag ? " read" : " unread"}`}
                          >
                            {n.readFlag ? "Đã đọc" : "Mới"}
                          </span>
                          {n.sentAt && (
                            <time
                              className="tb-card-time"
                              dateTime={n.sentAt}
                              title={dinhDangThoiGian(n.sentAt)}
                            >
                              <abbr>{thoiGianTuongDoi(n.sentAt)}</abbr>
                            </time>
                          )}
                        </div>
                        <p className="tb-card-message">{n.message}</p>
                      </div>
                      <div className="tb-card-actions">
                        {!camDanhDauDaDoc && !n.readFlag && (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => void danhDauDaDoc(n.id)}
                          >
                            <IconCheck /> Đã đọc
                          </button>
                        )}
                        {laQuanTri && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={dangXoaId === n.id}
                            title="Xóa thông báo"
                            onClick={() => void xoaThongBao(n.id)}
                          >
                            <IconTrash />{" "}
                            {dangXoaId === n.id ? "…" : "Xóa"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {daMount && hienThiTaoMoi && laQuanTri && (
          <div className="modal-backdrop">
            <div className="modal-card form-card tb-compose-modal">
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
                {danhSachMau.length > 0 && (
                  <div className="form-span-2">
                    <label className="field-label">Mẫu thông báo</label>
                    <select
                      value={mauId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setMauId(id);
                        const m = danhSachMau.find((x) => x.id === id);
                        if (m) setNoiDung(m.noiDung);
                      }}
                    >
                      <option value="">— Chọn mẫu —</option>
                      {danhSachMau.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.tieuDe}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
