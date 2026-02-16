"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Room = { id: number; code: string };
type Tenant = { id: number; fullName: string };
type Invoice = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  month: number;
  year: number;
  total?: number;
  status?: string;
};

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

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

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [updatingInvoice, setUpdatingInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { notify } = useToast();

  const load = async () => {
    const role = getRole();
    if (role !== "ADMIN" && role !== "STAFF") {
      setInvoices([]);
      return;
    }
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openUpdate = (inv: Invoice) => {
    setUpdatingInvoice(inv);
    setAmount("");
    setMethod("CASH");
    setError("");
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingInvoice) return;
    const num = amount.replace(/\D/g, "");
    if (!num || Number(num) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/payments", {
        invoice: { id: updatingInvoice.id },
        amount: Number(num),
        method,
      });
      notify("Ghi nhận thanh toán thành công", "success");
      setUpdatingInvoice(null);
      load();
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      setError(
        ax?.response?.status === 403
          ? "Bạn không có quyền ghi nhận thanh toán"
          : "Ghi nhận thất bại",
      );
      notify("Ghi nhận thanh toán thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(digits));
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Ghi nhận thanh toán</h2>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Danh sách hóa đơn theo kỳ (tháng/năm). Bấm &quot;Cập nhật thủ
            công&quot; để ghi nhận thanh toán cho từng hóa đơn.
          </p>
          <SimpleTable
            data={invoices}
            columns={[
              {
                header: "Phòng",
                render: (i: Invoice) => i.room?.code ?? "—",
              },
              {
                header: "Khách thuê",
                render: (i: Invoice) => i.tenant?.fullName ?? "—",
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
                render: (i: Invoice) => (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openUpdate(i)}
                  >
                    Cập nhật thủ công
                  </button>
                ),
              },
            ]}
          />
        </div>

        {updatingInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Cập nhật thủ công</h3>
                  <p className="card-subtitle">
                    Hóa đơn #{updatingInvoice.id} — Phòng{" "}
                    {updatingInvoice.room?.code} — Kỳ {updatingInvoice.month}/
                    {updatingInvoice.year} — Tổng{" "}
                    {formatMoney(updatingInvoice.total)}
                  </p>
                </div>
              </div>
              <form onSubmit={submitPayment} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">Số tiền (VNĐ)</label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 1.500.000"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) =>
                        setAmount(formatCurrencyInput(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div className="form-span-2">
                  <label className="field-label">Hình thức</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
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
                    Hủy
                  </button>
                  <button type="submit" className="btn" disabled={submitting}>
                    {submitting ? "Đang ghi..." : "Ghi nhận"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
