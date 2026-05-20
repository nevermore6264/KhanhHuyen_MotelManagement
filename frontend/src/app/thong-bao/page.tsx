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
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { useThongBao } from "@/components/NhaCungCapThongBao";
import type { Dict } from "@/lib/i18n";
import { nhanVaiTro } from "@/lib/trangThai";
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

function chuoiHienThiNguoiDung(t: Dict, u: User): string {
  const hoTen = u.fullName ? ` (${u.fullName})` : "";
  const vai = u.role ? ` — ${nhanVaiTro(t, u.role)}` : "";
  const phongKhu =
    u.phongHienThue || u.khuHienThue
      ? ` · ${[u.phongHienThue, u.khuHienThue].filter(Boolean).join(" · ")}`
      : "";
  return `${u.username}${hoTen}${vai}${phongKhu}`;
}

function chuoiLocNguoiDung(t: Dict, u: User): string {
  return [
    u.username,
    u.fullName ?? "",
    u.role ?? "",
    u.role ? nhanVaiTro(t, u.role) : "",
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
  const { t: tr } = useCaiDat();
  const p = tr.pages.thongBao;
  const s = tr.pages.shared;
  const c = tr.common;
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
      notify(p.okMarkAll, "success");
      await tai();
      contextThongBao?.refetchUnread();
    } catch {
      notify(p.errUpdate, "error");
    } finally {
      setDangDanhDauTatCa(false);
    }
  };

  const danhSachNguoiDungLoc = useMemo(() => {
    const q = locNguoiNhan.trim().toLowerCase();
    const locTheoChuoi = q
      ? danhSachNguoiDung.filter((u) => chuoiLocNguoiDung(tr, u).includes(q))
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
          p.newPrefix +
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
    if (!window.confirm(p.confirmDelete)) return;
    setDangXoaId(id);
    try {
      await api.delete(`/thong-bao/${id}`);
      notify(p.okDelete, "success");
      await tai();
      contextThongBao?.refetchUnread();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403 ? p.errDeletePerm : p.errDelete);
      notify(msg, "error");
    } finally {
      setDangXoaId(null);
    }
  };

  const taoThongBao = async (e: React.FormEvent) => {
    e.preventDefault();
    const nd = noiDung.trim();
    if (!nd) {
      setLoi(p.errContent);
      return;
    }
    setLoi("");
    setDangTao(true);
    try {
      await api.post("/thong-bao", {
        message: nd,
        userId: idNguoiNhan.trim() ? idNguoiNhan.trim() : null,
      });
      notify(p.okSend, "success");
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
        (ax?.response?.status === 403 ? p.errNoPerm : p.errSend);
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
            <h2>{p.title}</h2>
            <p>{laQuanTri ? p.leadAdmin : p.leadUser}</p>
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
                {dangDanhDauTatCa ? p.markingAll : p.readAll}
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
                <IconPlus /> {p.create}
              </button>
            )}
          </div>
        </header>

        <div className="tb-stats">
          <div className="tb-stat">
            <strong>{danhSachSapXep.length}</strong>
            <span>{p.total}</span>
          </div>
          <div className="tb-stat unread">
            <strong>{soChuaDoc}</strong>
            <span>{p.unread}</span>
          </div>
          <div className="tb-stat">
            <strong>{soDaDoc}</strong>
            <span>{p.read}</span>
          </div>
        </div>

        <div className="tb-filters" role="tablist" aria-label={p.filterAria}>
          {(
            [
              {
                key: "all" as const,
                label: p.filterAll,
                count: danhSachSapXep.length,
              },
              { key: "unread" as const, label: p.filterUnread, count: soChuaDoc },
              { key: "read" as const, label: p.filterRead, count: soDaDoc },
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
                  ? p.emptyUnread
                  : boLoc === "read"
                    ? p.emptyRead
                    : p.empty}
              </h3>
              <p>
                {laQuanTri ? p.emptyHintAdmin : p.emptyHintUser}
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
                            {n.readFlag ? p.badgeRead : p.badgeNew}
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
                            <IconCheck /> {p.markRead}
                          </button>
                        )}
                        {laQuanTri && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={dangXoaId === n.id}
                            title={p.deleteTitle}
                            onClick={() => void xoaThongBao(n.id)}
                          >
                            <IconTrash />{" "}
                            {dangXoaId === n.id ? "…" : s.delete}
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
                  <h3>{p.composeTitle}</h3>
                  <p className="card-subtitle">{p.composeSub}</p>
                </div>
              </div>
              <form onSubmit={taoThongBao} className="form-grid">
                {danhSachMau.length > 0 && (
                  <div className="form-span-2">
                    <label className="field-label">{p.template}</label>
                    <select
                      value={mauId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setMauId(id);
                        const m = danhSachMau.find((x) => x.id === id);
                        if (m) setNoiDung(m.noiDung);
                      }}
                    >
                      <option value="">{p.pickTemplate}</option>
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
                    {p.content} <span className="required">*</span>
                  </label>
                  <textarea
                    placeholder={p.contentPh}
                    value={noiDung}
                    onChange={(e) => setNoiDung(e.target.value)}
                    rows={4}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">{p.sendTo}</label>
                  <input
                    type="search"
                    placeholder={p.filterPh}
                    value={locNguoiNhan}
                    onChange={(e) => setLocNguoiNhan(e.target.value)}
                    aria-label={p.filterRecipientsAria}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                  <select
                    value={idNguoiNhan}
                    onChange={(e) => setIdNguoiNhan(e.target.value)}
                  >
                    <option value="">{p.allUsers}</option>
                    {danhSachNguoiDungLoc.map((u) => (
                      <option key={u.id} value={u.id}>
                        {chuoiHienThiNguoiDung(tr, u)}
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
                    <IconTimes /> {c.cancel}
                  </button>
                  <button type="submit" className="btn" disabled={dangTao}>
                    {dangTao ? (
                      p.sending
                    ) : (
                      <>
                        <IconSend /> {p.send}
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
