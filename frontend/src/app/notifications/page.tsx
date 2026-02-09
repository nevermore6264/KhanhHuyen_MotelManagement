"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type Notification = { id: number; message: string; readFlag: boolean; sentAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    const res = await api.get('/notifications');
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Thông báo</h2>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: 'ID', render: (n) => n.id },
              { header: 'Nội dung', render: (n) => n.message },
              { header: 'Trạng thái', render: (n) => (n.readFlag ? 'Đã đọc' : 'Chưa đọc') },
              { header: 'Hành động', render: (n) => <button className="btn" onClick={() => markRead(n.id)}>Đánh dấu</button> }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
