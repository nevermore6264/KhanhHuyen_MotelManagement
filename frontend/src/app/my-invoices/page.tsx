"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type Invoice = { id: number; room?: { code: string }; month: number; year: number; total?: number; status?: string };

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
              { header: 'Trạng thái', render: (i) => i.status }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
