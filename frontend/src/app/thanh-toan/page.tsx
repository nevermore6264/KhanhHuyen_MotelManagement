"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconPencil, IconTimes, IconCheck, IconDownload } from "@/components/Icons";
import api from "@/lib/api";
import { taiFileTuApi } from "@/lib/taiFile";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { khachCuaHoaDon, mapHoaDonFromApi } from "@/lib/mapHoaDonApi";

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "â€”";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNÄ`;
};


function soTienThanhToan(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number" && !isNaN(v)) return v;
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const invoiceStatusLabel = (value?: string) => {
  switch (value) {
    case "UNPAID":
      return "ChÆ°a thanh toÃ¡n";
    case "PARTIAL":
      return "Thanh toÃ¡n má»™t pháº§n";
    case "PAID":
      return "ÄÃ£ thanh toÃ¡n";
    default:
      return value || "-";
  }
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
        (s, row) => s + soTienThanhToan((row as { soTien?: unknown }).soTien),
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

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(digits));
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
      setError("Vui lÃ²ng nháº­p sá»‘ tiá»n há»£p lá»‡");
      return;
    }
    if (conLai > 0 && value > conLai) {
      setError(
        `Sá»‘ tiá»n khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ pháº§n cÃ²n láº¡i (${formatMoney(conLai)}).`,
      );
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
      notify("ÄÃ£ ghi nháº­n thanh toÃ¡n.", "success");
      if (saved?.id) {
        try {
          await taiFileTuApi(
            `/thanh-toan/${saved.id}/phieu-thu-pdf`,
            `phieu-thu-${saved.id}.pdf`,
          );
        } catch {
          notify("ÄÃ£ ghi nháº­n; táº£i phiáº¿u thu tháº¥t báº¡i.", "error");
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
        (ax?.response?.status === 403
          ? "Báº¡n khÃ´ng cÃ³ quyá»n ghi nháº­n thanh toÃ¡n"
          : "Ghi nháº­n tháº¥t báº¡i");
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
      <ThanhDieuHuong />
      <div className="container">
        <h2>Ghi nháº­n thanh toÃ¡n</h2>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Danh sÃ¡ch hÃ³a Ä‘Æ¡n theo ká»³ (thÃ¡ng/nÄƒm). CÃ³ thá»ƒ ghi nháº­n{" "}
            <strong>má»™t pháº§n</strong> hoáº·c <strong>Ä‘á»§ sá»‘ cÃ²n láº¡i</strong> má»—i láº§n.
          </p>
          <BangDonGian
            data={invoices}
            columns={[
              {
                header: "PhÃ²ng",
                render: (i: Invoice) => i.room?.code ?? "â€”",
              },
              {
                header: "KhÃ¡ch thuÃª",
                render: (i: Invoice) => {
                  const list = khachCuaHoaDon(i);
                  if (!list.length) {
                    return (
                      <span
                        className="text-muted"
                        title="ChÆ°a gáº¯n khÃ¡ch theo há»£p Ä‘á»“ng trong ká»³."
                      >
                        â€”
                      </span>
                    );
                  }
                  if (list.length === 1) {
                    return list[0].fullName?.trim() || "â€”";
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
                          {t.fullName?.trim() || `KhÃ¡ch ${t.id}`}
                        </li>
                      ))}
                    </ul>
                  );
                },
              },
              {
                header: "Ká»³",
                render: (i: Invoice) => `${i.month}/${i.year}`,
              },
              {
                header: "Tá»•ng",
                render: (i: Invoice) => formatMoney(i.total),
              },
              {
                header: "Tráº¡ng thÃ¡i",
                render: (i: Invoice) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {invoiceStatusLabel(i.status)}
                  </span>
                ),
              },
              {
                header: "Thao tÃ¡c",
                render: (i: Invoice) => {
                  const enabled = coTheThu(i);
                  return (
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-primary${enabled ? "" : " btn-disabled"}`}
                      disabled={!enabled}
                      aria-disabled={!enabled}
                      title={
                        !enabled
                          ? "HÃ³a Ä‘Æ¡n Ä‘Ã£ thanh toÃ¡n Ä‘á»§"
                          : "Ghi nháº­n thanh toÃ¡n thá»§ cÃ´ng"
                      }
                      onClick={enabled ? () => openUpdate(i) : undefined}
                    >
                      <IconPencil /> Cáº­p nháº­t thá»§ cÃ´ng
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
                  <h3>Ghi nháº­n thanh toÃ¡n thá»§ cÃ´ng</h3>
                  <p className="card-subtitle">
                    HÃ³a Ä‘Æ¡n #{updatingInvoice.id} â€” PhÃ²ng{" "}
                    {updatingInvoice.room?.code} â€” Ká»³ {updatingInvoice.month}/
                    {updatingInvoice.year}
                  </p>
                  <p className="card-subtitle" style={{ marginTop: 8 }}>
                    Tá»•ng hÃ³a Ä‘Æ¡n: {formatMoney(updatingInvoice.total)}
                    {loadingModal ? (
                      " â€” Äang táº£i lá»‹ch sá»­ thuâ€¦"
                    ) : (
                      <>
                        {" "}
                        â€” ÄÃ£ thu: {formatMoney(daThu)} â€” CÃ²n láº¡i:{" "}
                        <strong>{formatMoney(conLai)}</strong>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <form onSubmit={submitPayment} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">Sá»‘ tiá»n láº§n nÃ y (VNÄ)</label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 1.500.000"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) =>
                        setAmount(formatCurrencyInput(e.target.value))
                      }
                      disabled={conLai <= 0 || loadingModal}
                    />
                    <span>VNÄ</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: 6 }}>
                    Nháº­p má»™t pháº§n hoáº·c Ä‘á»§ sá»‘ cÃ²n láº¡i. KhÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ pháº§n
                    cÃ²n láº¡i.
                  </p>
                </div>
                <div className="form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={conLai <= 0 || loadingModal}
                    onClick={fillFullRemain}
                  >
                    Äiá»n Ä‘á»§ sá»‘ cÃ²n láº¡i
                  </button>
                </div>
                <div className="form-span-2">
                  <label className="field-label">HÃ¬nh thá»©c</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    disabled={conLai <= 0 || loadingModal}
                  >
                    <option value="CASH">Tiá»n máº·t</option>
                    <option value="TRANSFER">Chuyá»ƒn khoáº£n</option>
                  </select>
                </div>
                {lichSuThu.length > 0 && (
                  <div className="form-span-2">
                    <label className="field-label">Lịch sử thu</label>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {lichSuThu.map((tt) => (
                        <li key={tt.id} style={{ marginBottom: 6 }}>
                          {formatMoney(tt.soTien)} — {tt.phuongThuc ?? "—"}
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
                              <IconDownload /> Phiếu thu
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )},
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
                    <IconTimes /> Há»§y
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting || conLai <= 0 || loadingModal}
                  >
                    {submitting ? (
                      "Äang ghi..."
                    ) : (
                      <>
                        <IconCheck /> Ghi nháº­n
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
