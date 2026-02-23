"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import { IconCheck } from "@/components/Icons";
import api from "@/lib/api";

type Invoice = {
  id: number;
  room?: { code: string };
  month: number;
  year: number;
  total?: number;
  status?: string;
};

const formatVND = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
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

const canPay = (status?: string) => status === "UNPAID" || status === "PARTIAL";

export default function MyInvoicesPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "fail" | "cancel";
    text: string;
  } | null>(null);

  useEffect(() => {
    api.get("/invoices/me").then((res) => setItems(res.data || []));
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success")
      setMessage({ type: "success", text: "Thanh toán thành công." });
    if (payment === "cancel")
      setMessage({ type: "cancel", text: "Bạn đã hủy thanh toán." });
  }, [searchParams]);

  const handlePay = async (invoiceId: number) => {
    setPayingId(invoiceId);
    setMessage(null);
    try {
      const res = await api.post<{ paymentUrl: string }>(
        "/payments/create-payment-url",
        { invoiceId },
      );
      const url = res.data?.paymentUrl;
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      setMessage({
        type: "fail",
        text: "Không tạo được link thanh toán. Kiểm tra cấu hình PayOS hoặc thử lại.",
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hóa đơn của tôi</h2>
        {message && (
          <div
            className="card"
            style={{
              marginBottom: 16,
              backgroundColor:
                message.type === "success"
                  ? "#ecfdf5"
                  : message.type === "cancel"
                    ? "#fefce8"
                    : "#fef2f2",
              color:
                message.type === "success"
                  ? "#065f46"
                  : message.type === "cancel"
                    ? "#854d0e"
                    : "#991b1b",
            }}
          >
            {message.text}
          </div>
        )}
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (i) => i.id },
              { header: "Phòng", render: (i) => i.room?.code ?? "—" },
              { header: "Tháng/Năm", render: (i) => `${i.month}/${i.year}` },
              { header: "Tổng", render: (i) => formatVND(i.total) },
              {
                header: "Trạng thái",
                render: (i) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {invoiceStatusLabel(i.status)}
                  </span>
                ),
              },
              {
                header: "Thao tác",
                render: (i) =>
                  canPay(i.status) ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={payingId === i.id}
                      onClick={() => handlePay(i.id)}
                    >
                      {payingId === i.id ? (
                        "Đang chuyển..."
                      ) : (
                        <>
                          <IconCheck /> Thanh toán
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
                  ),
              },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
