"use client";

import { useEffect, useMemo, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import {
  IconTimes,
  IconEye,
  IconRefresh,
  IconPlus,
  IconDownload,
} from "@/components/Icons";
import { taiFileTuApi } from "@/lib/taiFile";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiHoaDon } from "@/lib/trangThai";
import {
  dinhDangTien,
  dinhDangNgay,
  dinhDangSo,
  layLocaleTag,
} from "@/lib/locale";
import type { Invoice, RawJson, Room, Tenant } from "@/lib/mapHoaDonApi";
import {
  chuanHoaKhachThueTuApi,
  chuanHoaPhongTuApi,
  khachCuaHoaDon,
  mapHoaDonFromApi,
} from "@/lib/mapHoaDonApi";


const parseNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};


const tenantOptionLabel = (t: Tenant) => {
  const name = t.fullName || `Khách ${t.id}`;
  const extra = t.phone || t.idNumber;
  return extra ? `${name} — ${extra}` : name;
};

const invoiceStatusBadge = (value?: string) => {
  switch (value) {
    case "PAID":
      return "status-available";
    case "PARTIAL":
      return "status-maintenance";
    case "UNPAID":
      return "status-occupied";
    default:
      return "status-unknown";
  }
};

export default function TrangHoaDon() {
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [viewReminderInvoice, setViewReminderInvoice] =
    useState<Invoice | null>(null);
  const [viewDetailInvoice, setViewDetailInvoice] = useState<Invoice | null>(
    null,
  );
  const [dongChinhSuaChiTiet, setDongChinhSuaChiTiet] = useState<
    { tenKhoan: string; soTien: string }[]
  >([]);
  const [dangLuuChiTiet, setDangLuuChiTiet] = useState(false);
  const [generating, setGenerating] = useState(false);
  const role = mounted ? getRole() : null;
  const isTenant = role === "TENANT";
  const isAdmin = role === "ADMIN";
  const canRemind = (isAdmin || role === "STAFF") && !isTenant;
  const canSuaChiTiet = (isAdmin || role === "STAFF") && !isTenant;
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.hoaDon;
  const s = tr.pages.shared;
  const c = tr.common;

  const formatMoney = (n?: number | null) => {
    if (n == null || isNaN(Number(n))) return "—";
    return dinhDangTien(Math.round(Number(n)), lang);
  };
  const formatChiSo = (n?: number) =>
    n != null && Number.isFinite(n) ? dinhDangSo(n, lang) : "—";
  const dinhDangNhapTien = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat(layLocaleTag(lang)).format(Number(digits));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendReminder = async (invoiceId: string) => {
    setRemindingId(invoiceId);
    try {
      const res = await api.post<{ message?: string }>(
        `/hoa-don/${invoiceId}/nhac-no`,
        {
          channel: "email",
        },
      );
      notify(res.data?.message || p.okReminder, "success");
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const message =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403 ? p.errReminderPerm : p.errReminder);
      notify(message, "error");
    } finally {
      setRemindingId(null);
    }
  };

  const load = async () => {
    if (role == null) {
      setInvoices([]);
      return;
    }
    try {
      if (role === "TENANT") {
        const res = await api.get("/hoa-don/cua-toi");
        const mangHd = Array.isArray(res.data) ? res.data : [];
        setInvoices(mangHd.map((x) => mapHoaDonFromApi(x as RawJson)));
        setRooms([]);
        setTenants([]);
        return;
      }
      if (role === "ADMIN" || role === "STAFF") {
        const [iRes, rRes, tRes] = await Promise.all([
          api.get("/hoa-don"),
          api.get("/phong"),
          api.get("/khach-thue"),
        ]);
        const mangHd = Array.isArray(iRes.data) ? iRes.data : [];
        const mangPhong = Array.isArray(rRes.data) ? rRes.data : [];
        const mangKhach = Array.isArray(tRes.data) ? tRes.data : [];
        setInvoices(mangHd.map((x) => mapHoaDonFromApi(x as RawJson)));
        setRooms(mangPhong.map((x) => chuanHoaPhongTuApi(x as RawJson)));
        setTenants(mangKhach.map((x) => chuanHoaKhachThueTuApi(x as RawJson)));
        return;
      }
      setInvoices([]);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const message =
        ax?.response?.status === 403 ? p.errViewList : p.errLoad;
      notify(message, "error");
    }
  };

  useEffect(() => {
    if (mounted) load();
  }, [mounted, role]);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (filterStatus) {
      list = list.filter((i) => i.status === filterStatus);
    }
    if (filterRoomId) {
      list = list.filter((i) => String(i.room?.id) === filterRoomId);
    }
    return list;
  }, [invoices, filterStatus, filterRoomId]);

  const khoiTaoDongChiTietTuHoaDon = (i: Invoice) => {
    const co = i.lineItems && i.lineItems.length > 0;
    setDongChinhSuaChiTiet(
      co
        ? i.lineItems!.map((l) => ({
            tenKhoan: l.tenKhoan,
            soTien: dinhDangNhapTien(
              String(
                l.soTien != null && !Number.isNaN(Number(l.soTien))
                  ? Math.round(Number(l.soTien))
                  : 0,
              ),
            ),
          }))
        : [{ tenKhoan: "", soTien: "" }],
    );
  };

  const luuChiTietHoaDon = async () => {
    if (!viewDetailInvoice || !canSuaChiTiet) return;
    setDangLuuChiTiet(true);
    try {
      await api.put(`/hoa-don/${viewDetailInvoice.id}/chi-tiet`, {
        dong: dongChinhSuaChiTiet
          .filter((r) => r.tenKhoan.trim())
          .map((r) => ({
            tenKhoan: r.tenKhoan.trim(),
            soTien: parseNhapTien(r.soTien) ?? 0,
          })),
      });
      notify(p.okSaveDetail, "success");
      await load();
      setViewDetailInvoice(null);
    } catch {
      notify(p.errSaveDetail, "error");
    } finally {
      setDangLuuChiTiet(false);
    }
  };

  const runGenerateInvoices = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ message?: string; created?: number }>(
        "/hoa-don/sinh",
      );
      notify(res.data?.message ?? p.okGenerate, "success");
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const msg =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403 ? s.noPermission : p.errGenerate);
      notify(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card">
          <div>
            <h3>{p.listTitle}</h3>
            <p className="card-subtitle">{p.listLead}</p>
          </div>
          {!isTenant && (
            <div className="invoice-job-note">
              <span>{p.autoGenNote}</span>
              {mounted && (isAdmin || role === "STAFF") && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={runGenerateInvoices}
                  disabled={generating}
                >
                  {generating ? (
                    p.generating
                  ) : (
                    <>
                      <IconRefresh /> {p.generateNow}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          {!isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant ? p.viewOwn : s.viewOnly}
            </div>
          )}
        </div>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            {isTenant ? p.tenantLead : p.adminLead}
          </p>
          {isAdmin && !isTenant && (
            <div
              className="form-grid"
              style={{ marginBottom: 16, maxWidth: 500 }}
            >
              <div>
                <label className="field-label">{p.filterStatus}</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">{c.all}</option>
                  <option value="UNPAID">
                    {nhanTrangThaiHoaDon(tr, "UNPAID")}
                  </option>
                  <option value="PARTIAL">
                    {nhanTrangThaiHoaDon(tr, "PARTIAL")}
                  </option>
                  <option value="PAID">
                    {nhanTrangThaiHoaDon(tr, "PAID")}
                  </option>
                </select>
              </div>
              <div>
                <label className="field-label">{p.filterRoom}</label>
                <select
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                >
                  <option value="">{p.allRooms}</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <BangDonGian
            data={filteredInvoices}
            columns={[
              { header: p.room, render: (i: Invoice) => i.room?.code ?? "—" },
              {
                header: p.tenant,
                render: (i: Invoice) => {
                  const list = khachCuaHoaDon(i);
                  if (!list.length) {
                    return (
                      <span className="text-muted" title={p.noTenantHint}>
                        {p.noTenantInPeriod}
                      </span>
                    );
                  }
                  if (list.length === 1) {
                    return list[0].fullName?.trim() || "—";
                  }
                  return (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        textAlign: "left",
                      }}
                    >
                      {list.map((t) => (
                        <li key={t.id}>
                          {t.fullName?.trim() || `Khách ${t.id}`}
                        </li>
                      ))}
                    </ul>
                  );
                },
              },
              {
                header: p.period,
                render: (i: Invoice) => `${i.month}/${i.year}`,
              },
              {
                header: p.total,
                render: (i: Invoice) => (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {formatMoney(i.total)}
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ padding: "2px 8px" }}
                      onClick={() => {
                        setViewDetailInvoice(i);
                        khoiTaoDongChiTietTuHoaDon(i);
                      }}
                      title={p.viewDetailTitle}
                    >
                      <IconEye /> {p.viewDetail}
                    </button>
                  </span>
                ),
              },
              {
                header: p.status,
                render: (i: Invoice) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {nhanTrangThaiHoaDon(tr, i.status)}
                  </span>
                ),
              },
              {
                header: p.reminded,
                render: (i: Invoice) => {
                  const emailAt = i.lastReminderEmailAt
                    ? dinhDangNgay(i.lastReminderEmailAt, lang)
                    : "";
                  const emailCount = i.reminderEmailCount ?? 0;
                  const hasAny = emailAt || emailCount > 0;
                  if (!hasAny) return "—";
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      {emailAt && (
                        <span style={{ whiteSpace: "nowrap" }}>
                          {p.emailReminderMeta
                            .replace("{count}", String(emailCount || 1))
                            .replace("{date}", emailAt)}
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ marginTop: 4, padding: "2px 8px" }}
                        onClick={() => setViewReminderInvoice(i)}
                      >
                        {p.viewReminderSent}
                      </button>
                    </span>
                  );
                },
              },
              ...(canRemind
                ? [
                    {
                      header: p.remind,
                      render: (i: Invoice) => {
                        const unpaid =
                          i.status === "UNPAID" || i.status === "PARTIAL";
                        const ds = khachCuaHoaDon(i);
                        const hasEmail = ds.some(
                          (t) => t.email && String(t.email).trim(),
                        );
                        const loading = remindingId === i.id;
                        return (
                          <span
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={!unpaid || !hasEmail || loading}
                              title={
                                !unpaid
                                  ? p.remindUnpaidOnly
                                  : !hasEmail
                                    ? p.remindNoEmail
                                    : p.remindViaEmail
                              }
                              onClick={() => sendReminder(i.id)}
                            >
                              {loading ? "..." : p.emailReminder}
                            </button>
                          </span>
                        );
                      },
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {viewDetailInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.detailTitle}</h3>
                  <p className="card-subtitle">
                    {p.detailSub
                      .replace("{room}", viewDetailInvoice.room?.code ?? "—")
                      .replace(
                        "{period}",
                        `${viewDetailInvoice.month}/${viewDetailInvoice.year}`,
                      )}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.roomRent}</span>
                  <strong>{formatMoney(viewDetailInvoice.roomCost)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricOld}</span>
                  <strong>{formatChiSo(viewDetailInvoice.electricOld)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricNew}</span>
                  <strong>{formatChiSo(viewDetailInvoice.electricNew)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricCost}</span>
                  <strong>
                    {formatMoney(viewDetailInvoice.electricityCost)}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterOld}</span>
                  <strong>{formatChiSo(viewDetailInvoice.waterOld)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterNew}</span>
                  <strong>{formatChiSo(viewDetailInvoice.waterNew)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterCost}</span>
                  <strong>{formatMoney(viewDetailInvoice.waterCost)}</strong>
                </div>
                {viewDetailInvoice.lineItems &&
                  viewDetailInvoice.lineItems.length > 0 &&
                  viewDetailInvoice.lineItems.map((l) => (
                    <div
                      key={l.id ?? `${l.tenKhoan}-${l.soTien}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <span>{l.tenKhoan}</span>
                      <strong>{formatMoney(l.soTien)}</strong>
                    </div>
                  ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0 0",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#102a5c",
                  }}
                >
                  <span>{p.total}</span>
                  <strong>{formatMoney(viewDetailInvoice.total)}</strong>
                </div>
              </div>
              {canSuaChiTiet && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1rem" }}>
                    {p.editExtraTitle}
                  </h4>
                  <p
                    className="card-subtitle"
                    style={{ marginBottom: 10, fontSize: "0.85rem" }}
                  >
                    {p.editExtraHint}
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.9rem",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>
                          {p.lineName}
                        </th>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>
                          {p.lineAmount}
                        </th>
                        <th style={{ width: 72 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {dongChinhSuaChiTiet.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "6px 4px" }}>
                            <input
                              style={{ width: "100%" }}
                              value={row.tenKhoan}
                              onChange={(e) => {
                                const v = e.target.value;
                                setDongChinhSuaChiTiet((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, tenKhoan: v } : r,
                                  ),
                                );
                              }}
                              placeholder={p.lineNamePh}
                            />
                          </td>
                          <td style={{ padding: "6px 4px", minWidth: 160 }}>
                            <div className="input-suffix">
                              <input
                                placeholder={p.lineAmountPh}
                                inputMode="numeric"
                                autoComplete="off"
                                style={{ width: "100%", minWidth: 0 }}
                                value={row.soTien}
                                onChange={(e) => {
                                  const v = dinhDangNhapTien(e.target.value);
                                  setDongChinhSuaChiTiet((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, soTien: v } : r,
                                    ),
                                  );
                                }}
                              />
                              <span>VNĐ</span>
                            </div>
                          </td>
                          <td style={{ padding: "6px 4px" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              disabled={dongChinhSuaChiTiet.length <= 1}
                              onClick={() =>
                                setDongChinhSuaChiTiet((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                            >
                              {c.delete}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() =>
                      setDongChinhSuaChiTiet((prev) => [
                        ...prev,
                        { tenKhoan: "", soTien: "" },
                      ])
                    }
                  >
                    <IconPlus /> {p.addLine}
                  </button>
                </div>
              )}
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    void taiFileTuApi(
                      `/hoa-don/${viewDetailInvoice.id}/xuat-pdf`,
                      `hoa-don-${viewDetailInvoice.id}.pdf`,
                    ).catch(() => notify(p.errDownloadPdf, "error"))
                  }
                >
                  <IconDownload /> {p.downloadPdf}
                </button>
                {canSuaChiTiet && (
                  <button
                    type="button"
                    className="btn"
                    disabled={dangLuuChiTiet}
                    onClick={() => void luuChiTietHoaDon()}
                  >
                    {dangLuuChiTiet ? c.saving : p.saveDetail}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewDetailInvoice(null)}
                >
                  <IconTimes /> {c.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewReminderInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.reminderTitle}</h3>
                  <p className="card-subtitle">
                    {p.detailSub
                      .replace("{room}", viewReminderInvoice.room?.code ?? "—")
                      .replace(
                        "{period}",
                        `${viewReminderInvoice.month}/${viewReminderInvoice.year}`,
                      )}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {viewReminderInvoice.lastReminderEmailAt && (
                  <div>
                    <div className="field-label" style={{ marginBottom: 6 }}>
                      {p.reminderEmailLabel
                        .replace(
                          "{count}",
                          String(viewReminderInvoice.reminderEmailCount ?? 1),
                        )
                        .replace(
                          "{date}",
                          dinhDangNgay(
                            viewReminderInvoice.lastReminderEmailAt,
                            lang,
                          ),
                        )}
                    </div>
                    <div
                      className="readonly-field"
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {viewReminderInvoice.lastReminderEmailMessage?.trim() ||
                        p.reminderNoContent}
                    </div>
                  </div>
                )}
                {!viewReminderInvoice.lastReminderEmailAt && (
                  <p className="card-subtitle">
                    {p.reminderNoHistory}
                  </p>
                )}
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewReminderInvoice(null)}
                >
                  <IconTimes /> {c.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
