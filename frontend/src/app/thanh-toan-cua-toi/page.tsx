"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { mapHoaDonFromApi } from "@/lib/mapHoaDonApi";
import {
  chuanHoaThanhToanTuApi,
  type PaymentRow,
} from "@/lib/chuanHoaThanhToanTuApi";

const formatVND = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
};

export default function TrangThanhToanCuaToi() {
  const searchParams = useSearchParams();
  const appliedUrlRef = useRef(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoiceId, setInvoiceId] = useState("");

  useEffect(() => {
    api.get("/hoa-don/cua-toi").then((res) => {
      const arr = Array.isArray(res.data) ? res.data : [];
      setInvoices(arr.map((x) => mapHoaDonFromApi(x as RawJson)));
    });
  }, []);

  useEffect(() => {
    if (appliedUrlRef.current || invoices.length === 0) return;
    const fromUrl = searchParams.get("invoice");
    if (!fromUrl) return;
    const id = String(fromUrl);
    if (invoices.some((i) => String(i.id) === id)) {
      appliedUrlRef.current = true;
      setInvoiceId(id);
      api
        .get(`/thanh-toan/hoa-don/${id}`)
        .then((res) =>
          setPayments(
            (Array.isArray(res.data) ? res.data : []).map((x) =>
              chuanHoaThanhToanTuApi(x as Record<string, unknown>),
            ),
          ),
        );
    }
  }, [searchParams, invoices]);

  const loadPayments = async (id: string) => {
    if (!id) return;
    const res = await api.get(`/thanh-toan/hoa-don/${id}`);
    setPayments(
      (Array.isArray(res.data) ? res.data : []).map((x) =>
        chuanHoaThanhToanTuApi(x as Record<string, unknown>),
      ),
    );
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Lịch sử thanh toán</h2>
        <div className="card">
          <select
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value);
              loadPayments(e.target.value);
            }}
          >
            <option value="">Chọn hóa đơn</option>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>
                Hóa đơn #{i.id} ({i.month}/{i.year})
              </option>
            ))}
          </select>
        </div>
        <div className="card">
          <BangDonGian
            data={payments}
            columns={[
              { header: "ID", render: (p) => p.id },
              { header: "Số tiền", render: (p) => formatVND(p.amount) },
              {
                header: "Hình thức",
                render: (p) =>
                  p.method === "TRANSFER"
                    ? "Chuyển khoản"
                    : p.method === "CASH"
                      ? "Tiền mặt"
                      : p.method,
              },
              {
                header: "Ngày",
                render: (p) =>
                  p.paidAt
                    ? new Date(p.paidAt).toLocaleDateString("vi-VN")
                    : "—",
              },
            ]}
          />
        </div>
      </div>
    </TrangBaoVe>
  );
}
