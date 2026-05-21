"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import { IconPencil, IconTimes, IconCheck, IconDownload } from "@/components/Icons";
import api from "@/lib/api";
import { taiFileTuApi } from "@/lib/taiFile";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiHoaDon, nhanPhuongThucThanhToan } from "@/lib/trangThai";
import { dinhDangTien, layLocaleTag } from "@/lib/locale";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { khachCuaHoaDon, mapHoaDonFromApi } from "@/lib/mapHoaDonApi";
import { classBadgeHoaDon } from "@/lib/badgeTrangThai";

function soTienThanhToan(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number" && !isNaN(v)) return v;
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function TrangThanhToan() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [updatingInvoice, setUpdatingInvoice] = useState<Invoice | null>(null);
  const [daThu, setDaThu] = useState(0);
  const [conLai, setConLai] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [lichSuThu, setLichSuThu] = useState<
    { id: string; soTien?: number; phuongThuc?: string; thoiGianThanhToan?: string }[]
  >([]);
  const [error, setError] = useState("");
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.thanhToan;
  const hp = tr.pages.hoaDon;
  const s = tr.pages.shared;
  const c = tr.common;

  const formatMoney = (n?: number | null) => {
    if (n == null || isNaN(Number(n))) return "—";
    return dinhDangTien(Math.round(Number(n)), lang);
  };

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat(layLocaleTag(lang)).format(Number(digits));
  };

  const load = async () => {
    const role = getRole();
    if (role !== "ADMIN" && role !== "STAFF") {
      setInvoices([]);
      return;
    }
    try {
      const res = await api.get("/hoa-don");
      const arr = Array.isArray(res.data) ? res.data : [];
      setInvoices(arr.map((x) => mapHoaDonFromApi(x as RawJson)));
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openUpdate = async (inv: Invoice) => {
    setUpdatingInvoice(inv);
    setAmount("");
    setMethod("CASH");
    setError("");
    setLoadingModal(true);
    setDaThu(0);
    setLichSuThu([]);
    const tong = inv.total ?? 0;
    setConLai(Math.max(0, Math.round(tong)));
    try {
      const res = await api.get(`/thanh-toan/hoa-don/${inv.id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setLichSuThu(
        list.map((row) => {
          const r = row as {
            id?: string;
            soTien?: unknown;
            phuongThuc?: string;
            thoiGianThanhToan?: string;
          };
          return {
            id: String(r.id ?? ""),
            soTien: soTienThanhToan(r.soTien),
            phuongThuc: r.phuongThuc,
            thoiGianThanhToan: r.thoiGianThanhToan,
          };
        }),
      );
      const paid = list.reduce(
        (sum, row) => sum + soTienThanhToan((row as { soTien?: unknown }).soTien),
        0,
      );
      const remain = Math.max(0, Math.round(tong - paid));
      setDaThu(Math.round(paid));
      setConLai(remain);
    } catch {
      setDaThu(0);
      setConLai(Math.max(0, Math.round(tong)));
      setLichSuThu([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const fillFullRemain = () => {
    if (conLai <= 0) return;
    setAmount(formatCurrencyInput(String(conLai)));
    setError("");
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingInvoice) return;
    const num = amount.replace(/\D/g, "");
    const value = Number(num);
    if (!num || value <= 0) {
      setError(p.errInvalidAmount);
      return;
    }
    if (conLai > 0 && value > conLai) {
      setError(p.errExceedRemain.replace("{amount}", formatMoney(conLai)));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/thanh-toan", {
        invoiceId: updatingInvoice.id,
        amount: value,
        method,
      });
      const saved = res.data as { id?: string };
      notify(p.okRecord, "success");
      if (saved?.id) {
        try {
          await taiFileTuApi(
            `/thanh-toan/${saved.id}/phieu-thu-pdf`,
            `phieu-thu-${saved.id}.pdf`,
          );
        } catch {
          notify(p.errRecordPartial, "error");
        }
      }
      setUpdatingInvoice(null);
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const message =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403 ? p.errRecordPerm : p.errRecord);
      setError(message);
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const coTheThu = (i: Invoice) =>
    i.status === "UNPAID" || i.status === "PARTIAL";

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.record}</h2>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            {p.lead}
          </p>
          <BangDonGian
            data={invoices}
            columns={[
              {
                header: hp.room,
                render: (i: Invoice) => i.room?.code ?? "—",
              },
              {
                header: hp.tenant,
                render: (i: Invoice) => {
                  const list = khachCuaHoaDon(i);
                  if (!list.length) {
                    return <span className="text-muted">—</span>;
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
                header: hp.period,
                render: (i: Invoice) => `${i.month}/${i.year}`,
              },
              {
                header: hp.total,
                render: (i: Invoice) => formatMoney(i.total),
              },
              {
                header: hp.status,
                render: (i: Invoice) => (
                  <span
                    className={classBadgeHoaDon(i.status)}
                  >
                    {nhanTrangThaiHoaDon(tr, i.status)}
                  </span>
                ),
              },
              {
                header: s.actions,
                render: (i: Invoice) => {
                  const enabled = coTheThu(i);
                  return (
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-primary${enabled ? "" : " btn-disabled"}`}
                      disabled={!enabled}
                      aria-disabled={!enabled}
                      title={!enabled ? p.paidFullTitle : p.recordManualHint}
                      onClick={enabled ? () => openUpdate(i) : undefined}
                    >
                      <IconPencil /> {p.updateManual}
                    </button>
                  );
                },
              },
            ]}
          />
        </div>

        {updatingInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.recordManual}</h3>
                  <p className="card-subtitle">
                    {p.modalSub
                      .replace("{id}", String(updatingInvoice.id))
                      .replace("{room}", updatingInvoice.room?.code ?? "—")
                      .replace(
                        "{period}",
                        `${updatingInvoice.month}/${updatingInvoice.year}`,
                      )}
                  </p>
                  <p className="card-subtitle" style={{ marginTop: 8 }}>
                    {p.invoiceTotal}: {formatMoney(updatingInvoice.total)}
                    {loadingModal ? (
                      ` — ${p.loadingHistory}`
                    ) : (
                      <>
                        {" "}
                        — {p.paidAmount}: {formatMoney(daThu)} — {p.remaining}:{" "}
                        <strong>{formatMoney(conLai)}</strong>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <form onSubmit={submitPayment} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">{p.amountLabel}</label>
                  <div className="input-suffix">
                    <input
                      placeholder={p.amountPh}
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) =>
                        setAmount(formatCurrencyInput(e.target.value))
                      }
                      disabled={conLai <= 0 || loadingModal}
                    />
                    <span>{lang === "en" ? "VND" : "VNĐ"}</span>
                  </div>
                  <p
                    className="text-muted"
                    style={{ fontSize: "0.85rem", marginTop: 6 }}
                  >
                    {p.amountHint}
                  </p>
                </div>
                <div className="form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={conLai <= 0 || loadingModal}
                    onClick={fillFullRemain}
                  >
                    {p.fillRemain}
                  </button>
                </div>
                <div className="form-span-2">
                  <label className="field-label">{p.method}</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    disabled={conLai <= 0 || loadingModal}
                  >
                    <option value="CASH">
                      {nhanPhuongThucThanhToan(tr, "CASH")}
                    </option>
                    <option value="TRANSFER">
                      {nhanPhuongThucThanhToan(tr, "TRANSFER")}
                    </option>
                  </select>
                </div>
                {lichSuThu.length > 0 && (
                  <div className="form-span-2">
                    <label className="field-label">{p.paymentHistory}</label>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {lichSuThu.map((tt) => (
                        <li key={tt.id} style={{ marginBottom: 6 }}>
                          {formatMoney(tt.soTien)} —{" "}
                          {nhanPhuongThucThanhToan(tr, tt.phuongThuc)}
                          {tt.id ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              style={{ marginLeft: 8 }}
                              onClick={() =>
                                void taiFileTuApi(
                                  `/thanh-toan/${tt.id}/phieu-thu-pdf`,
                                  `phieu-thu-${tt.id}.pdf`,
                                )
                              }
                            >
                              <IconDownload /> {p.receipt}
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {error && <div className="form-error form-span-2">{error}</div>}
                <div className="form-actions form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setUpdatingInvoice(null);
                      setError("");
                    }}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting || conLai <= 0 || loadingModal}
                  >
                    {submitting ? (
                      p.recording
                    ) : (
                      <>
                        <IconCheck /> {p.recordBtn}
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
