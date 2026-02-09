"use client";

import { useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import api from '@/lib/api';

export default function SupportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/support-requests', { title, description });
    setTitle('');
    setDescription('');
    setMessage('Đã gửi yêu cầu hỗ trợ');
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Gửi yêu cầu hỗ trợ</h2>
        <div className="card">
          <form onSubmit={submit} className="grid">
            <input placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="btn" type="submit">Gửi yêu cầu</button>
            {message && <div>{message}</div>}
          </form>
        </div>
      </div>
    </ProtectedPage>
  );
}
