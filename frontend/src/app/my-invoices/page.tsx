"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type Invoice = { id: number; room?: { code: string }; month: number; year: number; total?: number; status?: string };

const invoiceStatusLabel = (value?: string) => {
  switch (value) {
    case "UNPAID": return "Chưa thanh toán";
    case "PARTIAL": return "Thanh toán một phần";
    case "PAID": return "Đã thanh toán";
    default: return value || "-";
  }
};
const invoiceStatusBadge = (value?: string) => {
  switch (value) {
    case "PAID": return "status-available";
    case "PARTIAL": return "status-maintenance";
    case "UNPAID": return "status-occupied";
    default: return "status-unknown";
  }
};

export default function MyInvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);

  useEffect(() => {
    api.get('/invoices/me').then((res) => setItems(res.data));
  }, []);

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hóa đơn của tôi</h2>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: 'ID', render: (i) => i.id },
              { header: 'Phòng', render: (i) => i.room?.code },
              { header: 'Tháng/Năm', render: (i) => `${i.month}/${i.year}` },
              { header: 'Tổng', render: (i) => i.total },
              { header: 'Trạng thái', render: (i) => (
                <span className={`status-badge ${invoiceStatusBadge(i.status)}`}>
                  {invoiceStatusLabel(i.status)}
                </span>
              ) }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
