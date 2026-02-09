"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type Invoice = { id: number; month: number; year: number };
type Payment = { id: number; amount: number; method: string; paidAt: string };

export default function MyPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    api.get('/invoices/me').then((res) => setInvoices(res.data));
  }, []);

  const loadPayments = async (id: string) => {
    if (!id) return;
    const res = await api.get(`/payments/invoice/${id}`);
    setPayments(res.data);
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Lịch sử thanh toán</h2>
        <div className="card">
          <select value={invoiceId} onChange={(e) => { setInvoiceId(e.target.value); loadPayments(e.target.value); }}>
            <option value="">Chọn hóa đơn</option>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>Hóa đơn #{i.id} ({i.month}/{i.year})</option>
            ))}
          </select>
        </div>
        <div className="card">
          <SimpleTable
            data={payments}
            columns={[
              { header: 'ID', render: (p) => p.id },
              { header: 'Số tiền', render: (p) => p.amount },
              { header: 'Hình thức', render: (p) => p.method },
              { header: 'Ngày', render: (p) => p.paidAt }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
