"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";

type Payment = { id: number; amount: number; method: string; paidAt: string };
type Invoice = {
  id: number;
  room?: { code: string };
  tenant?: { fullName: string };
  total?: number;
  status?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const load = async () => {
    const res = await api.get("/invoices");
    setInvoices(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const loadPayments = async (id: string) => {
    if (!id) return;
    const res = await api.get(`/payments/invoice/${id}`);
    setPayments(res.data);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/payments", {
      invoice: { id: Number(invoiceId) },
      amount: Number(amount),
      method,
    });
    setAmount("");
    loadPayments(invoiceId);
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Ghi nhận thanh toán</h2>
        <div className="card">
          <form onSubmit={create} className="grid grid-3">
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
                  #{i.id} - {i.room?.code} - {i.tenant?.fullName} ({i.status})
                </option>
              ))}
            </select>
            <input
              placeholder="Số tiền"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
            </select>
            <button className="btn" type="submit">
              Ghi nhận
            </button>
          </form>
        </div>
        <div className="card">
          <SimpleTable
            data={payments}
            columns={[
              { header: "ID", render: (p) => p.id },
              { header: "Số tiền", render: (p) => p.amount },
              { header: "Hình thức", render: (p) => p.method },
              { header: "Ngày", render: (p) => p.paidAt },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
