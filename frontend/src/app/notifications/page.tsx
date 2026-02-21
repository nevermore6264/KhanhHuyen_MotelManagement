"use client";

import { useEffect, useRef, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  createNotificationClient,
  type NotificationPayload,
} from "@/lib/notificationSocket";
import { useToast } from "@/components/ToastProvider";
import { useNotification } from "@/components/NotificationProvider";

type Notification = {
  id: number;
  message: string;
  readFlag: boolean;
  sentAt: string;
};
type User = { id: number; username: string; fullName?: string };

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const role = mounted ? getRole() : null;
  const isAdmin = role === "ADMIN";
  const { notify } = useToast();
  const notificationContext = useNotification();
  const clientRef = useRef<ReturnType<typeof createNotificationClient>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = async () => {
    const res = await api.get("/notifications");
    const data = res.data || [];
    setItems(data);
    notificationContext?.refetchUnread(data);
  };

  useEffect(() => {
    if (mounted) load();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !notificationContext?.lastIncoming) return;
    const p = notificationContext.lastIncoming;
    setItems((prev) => [
      {
        id: p.id,
        message: p.message,
        readFlag: p.readFlag ?? false,
        sentAt: p.sentAt || new Date().toISOString(),
      },
      ...prev,
    ]);
    notificationContext.clearLastIncoming();
  }, [mounted, notificationContext?.lastIncoming]);

  useEffect(() => {
    if (!mounted || !isAdmin) return;
    const loadUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data || []);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, [mounted, isAdmin]);

  useEffect(() => {
    if (!mounted || !isAdmin) return;
    const client = createNotificationClient(
      (payload: NotificationPayload) => {
        setItems((prev) => [
          {
            id: payload.id,
            message: payload.message,
            readFlag: payload.readFlag ?? false,
            sentAt: payload.sentAt || new Date().toISOString(),
          },
          ...prev,
        ]);
        notify(
          "Bạn có thông báo mới: " +
            payload.message.slice(0, 50) +
            (payload.message.length > 50 ? "…" : ""),
          "info",
        );
      },
      () => {},
      () => {},
    );
    if (client) {
      client.activate();
      clientRef.current = client;
    }
    return () => {
      clientRef.current?.deactivate?.();
      clientRef.current = null;
    };
  }, [mounted, isAdmin, notify]);

  const markRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    await load();
    notificationContext?.refetchUnread();
  };

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Vui lòng nhập nội dung thông báo");
      return;
    }
    setError("");
    setCreating(true);
    try {
      await api.post("/notifications", {
        message: trimmed,
        userId: userId ? Number(userId) : null,
      });
      notify("Đã gửi thông báo", "success");
      setMessage("");
      setUserId("");
      setShowCreate(false);
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền"
          : "Gửi thông báo thất bại");
      setError(msg);
      notify(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Thông báo</h2>
        {mounted && isAdmin && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowCreate(true);
                  setError("");
                }}
              >
                Tạo thông báo
              </button>
            </div>
          </div>
        )}
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (n) => n.id },
              { header: "Nội dung", render: (n) => n.message },
              {
                header: "Trạng thái",
                render: (n) => (n.readFlag ? "Đã đọc" : "Chưa đọc"),
              },
              {
                header: "Hành động",
                render: (n) => (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => markRead(n.id)}
                  >
                    Đánh dấu đã đọc
                  </button>
                ),
              },
            ]}
          />
        </div>

        {mounted && showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Tạo thông báo</h3>
                  <p className="card-subtitle">
                    Gửi cho tất cả hoặc một người dùng. Người nhận sẽ thấy thông
                    báo realtime.
                  </p>
                </div>
              </div>
              <form onSubmit={createNotification} className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">
                    Nội dung <span className="required">*</span>
                  </label>
                  <textarea
                    placeholder="Nội dung thông báo..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gửi đến</label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="">Tất cả người dùng</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} {u.fullName ? `(${u.fullName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div className="form-error form-span-2">{error}</div>}
                <div className="form-actions form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreate(false);
                      setError("");
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn" disabled={creating}>
                    {creating ? "Đang gửi…" : "Gửi thông báo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
