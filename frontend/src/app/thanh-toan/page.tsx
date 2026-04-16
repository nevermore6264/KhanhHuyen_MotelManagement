"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconPencil, IconTimes, IconCheck } from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { khachCuaHoaDon, mapHoaDonFromApi } from "@/lib/mapHoaDonApi";

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

/** JSON thanh toán từ API (soTien có thể là số hoặc chuỗi). */
function soTienThanhToan(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number" && !isNaN(v)) return v;
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const invoiceStatusLabel = (value?: string) => {
  switch (value) {
    case "UNPAID":
      return "Chưa thanh toán";
    case "PARTIAL":
      return "Thanh toán một phần";
    case "PAID":
      return "Đã thanh toán";
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
    const tong = inv.total ?? 0;
    setConLai(Math.max(0, Math.round(tong)));
    try {
      const res = await api.get(`/thanh-toan/hoa-don/${inv.id}`);
      const list = Array.isArray(res.data) ? res.data : [];
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
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (conLai > 0 && value > conLai) {
      setError(
        `Số tiền không được vượt quá phần còn lại (${formatMoney(conLai)}).`,
      );
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/thanh-toan", {
        invoiceId: updatingInvoice.id,
        amount: value,
        method,
      });
      notify("Đã ghi nhận thanh toán.", "success");
      setUpdatingInvoice(null);
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const message =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền ghi nhận thanh toán"
          : "Ghi nhận thất bại");
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
        <h2>Ghi nhận thanh toán</h2>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Danh sách hóa đơn theo kỳ (tháng/năm). Có thể ghi nhận{" "}
            <strong>một phần</strong> hoặc <strong>đủ số còn lại</strong> mỗi lần.
          </p>
          <BangDonGian
            data={invoices}
            columns={[
              {
                header: "Phòng",
                render: (i: Invoice) => i.room?.code ?? "—",
              },
              {
                header: "Khách thuê",
                render: (i: Invoice) => {
                  const list = khachCuaHoaDon(i);
                  if (!list.length) {
                    return (
                      <span
                        className="text-muted"
                        title="Chưa gắn khách theo hợp đồng trong kỳ."
                      >
                        —
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
                header: "Kỳ",
                render: (i: Invoice) => `${i.month}/${i.year}`,
              },
              {
                header: "Tổng",
                render: (i: Invoice) => formatMoney(i.total),
              },
              {
                header: "Trạng thái",
                render: (i: Invoice) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {invoiceStatusLabel(i.status)}
                  </span>
                ),
              },
              {
                header: "Thao tác",
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
                          ? "Hóa đơn đã thanh toán đủ"
                          : "Ghi nhận thanh toán thủ công"
                      }
                      onClick={enabled ? () => openUpdate(i) : undefined}
                    >
                      <IconPencil /> Cập nhật thủ công
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
                  <h3>Ghi nhận thanh toán thủ công</h3>
                  <p className="card-subtitle">
                    Hóa đơn #{updatingInvoice.id} — Phòng{" "}
                    {updatingInvoice.room?.code} — Kỳ {updatingInvoice.month}/
                    {updatingInvoice.year}
                  </p>
                  <p className="card-subtitle" style={{ marginTop: 8 }}>
                    Tổng hóa đơn: {formatMoney(updatingInvoice.total)}
                    {loadingModal ? (
                      " — Đang tải lịch sử thu…"
                    ) : (
                      <>
                        {" "}
                        — Đã thu: {formatMoney(daThu)} — Còn lại:{" "}
                        <strong>{formatMoney(conLai)}</strong>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <form onSubmit={submitPayment} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">Số tiền lần này (VNĐ)</label>
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
                    <span>VNĐ</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: 6 }}>
                    Nhập một phần hoặc đủ số còn lại. Không được vượt quá phần
                    còn lại.
                  </p>
                </div>
                <div className="form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={conLai <= 0 || loadingModal}
                    onClick={fillFullRemain}
                  >
                    Điền đủ số còn lại
                  </button>
                </div>
                <div className="form-span-2">
                  <label className="field-label">Hình thức</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    disabled={conLai <= 0 || loadingModal}
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="TRANSFER">Chuyển khoản</option>
                  </select>
                </div>
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
                    <IconTimes /> Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting || conLai <= 0 || loadingModal}
                  >
                    {submitting ? (
                      "Đang ghi..."
                    ) : (
                      <>
                        <IconCheck /> Ghi nhận
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
