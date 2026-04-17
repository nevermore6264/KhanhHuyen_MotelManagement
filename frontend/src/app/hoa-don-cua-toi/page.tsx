"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconCheck, IconEye, IconTimes } from "@/components/Icons";
import api from "@/lib/api";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { mapHoaDonFromApi } from "@/lib/mapHoaDonApi";

const formatVND = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
};

const formatMoneyLine = (n?: number | null) => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} đ`;
};

const formatChiSo = (n?: number) =>
  n != null && Number.isFinite(n)
    ? new Intl.NumberFormat("vi-VN").format(n)
    : "—";

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

export default function TrangHoaDonCuaToi() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [xemChiTiet, setXemChiTiet] = useState<Invoice | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "fail" | "cancel";
    text: string;
  } | null>(null);

  useEffect(() => {
    api.get("/hoa-don/cua-toi").then((res) => {
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr.map((x) => mapHoaDonFromApi(x as RawJson)));
    });
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success")
      setMessage({ type: "success", text: "Thanh toán thành công." });
    if (payment === "cancel")
      setMessage({ type: "cancel", text: "Bạn đã hủy thanh toán." });
  }, [searchParams]);

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    setMessage(null);
    try {
      const res = await api.post<{ paymentUrl: string }>(
        "/thanh-toan/tao-link",
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
    <TrangBaoVe>
      <ThanhDieuHuong />
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
          <BangDonGian
            data={items}
            columns={[
              {
                header: "ID",
                render: (i) => (
                  <span title={i.id}>
                    {i.id.length > 10 ? `${i.id.slice(0, 8)}…` : i.id}
                  </span>
                ),
              },
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
                render: (i) => (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setXemChiTiet(i)}
                    >
                      <IconEye /> Chi tiết
                    </button>
                    {canPay(i.status) ? (
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
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {xemChiTiet && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => setXemChiTiet(null)}
          >
            <div
              className="modal-card form-card"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div>
                  <h3>Chi tiết hóa đơn</h3>
                  <p className="card-subtitle">
                    Phòng {xemChiTiet.room?.code ?? "—"} — Kỳ{" "}
                    {xemChiTiet.month}/{xemChiTiet.year}
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
                  <span>Tiền phòng</span>
                  <strong>{formatMoneyLine(xemChiTiet.roomCost)}</strong>
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
                  <span>Số điện cũ</span>
                  <strong>{formatChiSo(xemChiTiet.electricOld)}</strong>
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
                  <span>Số điện mới</span>
                  <strong>{formatChiSo(xemChiTiet.electricNew)}</strong>
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
                  <span>Tiền điện</span>
                  <strong>{formatMoneyLine(xemChiTiet.electricityCost)}</strong>
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
                  <span>Số nước cũ</span>
                  <strong>{formatChiSo(xemChiTiet.waterOld)}</strong>
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
                  <span>Số nước mới</span>
                  <strong>{formatChiSo(xemChiTiet.waterNew)}</strong>
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
                  <span>Tiền nước</span>
                  <strong>{formatMoneyLine(xemChiTiet.waterCost)}</strong>
                </div>
                {xemChiTiet.lineItems &&
                  xemChiTiet.lineItems.length > 0 &&
                  xemChiTiet.lineItems.map((l) => (
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
                      <strong>{formatMoneyLine(l.soTien)}</strong>
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
                  <span>Tổng</span>
                  <strong>{formatMoneyLine(xemChiTiet.total)}</strong>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setXemChiTiet(null)}
                >
                  <IconTimes /> Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
