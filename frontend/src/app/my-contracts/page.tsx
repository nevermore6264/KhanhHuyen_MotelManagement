"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type Contract = { id: number; room?: { code: string }; startDate?: string; endDate?: string; status?: string };

export default function MyContractsPage() {
  const [items, setItems] = useState<Contract[]>([]);

  useEffect(() => {
    api.get('/contracts/me').then((res) => setItems(res.data));
  }, []);

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hợp đồng của tôi</h2>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: 'ID', render: (c) => c.id },
              { header: 'Phòng', render: (c) => c.room?.code },
              { header: 'Bắt đầu', render: (c) => c.startDate },
              { header: 'Kết thúc', render: (c) => c.endDate },
              { header: 'Trạng thái', render: (c) => c.status }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
