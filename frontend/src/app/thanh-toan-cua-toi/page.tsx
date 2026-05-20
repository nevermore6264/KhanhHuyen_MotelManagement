"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { mapHoaDonFromApi } from "@/lib/mapHoaDonApi";
import {
  chuanHoaThanhToanTuApi,
  type PaymentRow,
} from "@/lib/chuanHoaThanhToanTuApi";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanPhuongThucThanhToan } from "@/lib/trangThai";
import { dinhDangTien, dinhDangNgay } from "@/lib/locale";

export default function TrangThanhToanCuaToi() {
  const searchParams = useSearchParams();
  const appliedUrlRef = useRef(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.thanhToanCuaToi;
  const s = tr.pages.shared;

  const formatMoney = (value?: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return dinhDangTien(Math.round(Number(value)), lang);
  };

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
      <div className="page-shell page-table">
        <h2>{p.historyTitle}</h2>
        <div className="card">
          <select
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value);
              loadPayments(e.target.value);
            }}
          >
            <option value="">{p.selectInvoice}</option>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>
                {p.invoiceOption
                  .replace("{id}", String(i.id))
                  .replace("{period}", `${i.month}/${i.year}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="card">
          <BangDonGian
            data={payments}
            columns={[
              { header: s.id, render: (row) => row.id },
              { header: p.amount, render: (row) => formatMoney(row.amount) },
              {
                header: p.method,
                render: (row) => nhanPhuongThucThanhToan(tr, row.method),
              },
              {
                header: p.date,
                render: (row) =>
                  row.paidAt ? dinhDangNgay(row.paidAt, lang) : "—",
              },
            ]}
          />
        </div>
      </div>
    </TrangBaoVe>
  );
}
