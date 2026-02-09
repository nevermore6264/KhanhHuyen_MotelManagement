"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";

type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  email?: string;
  user?: { id: number; username: string };
};
type User = { id: number; username: string; role: string };

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIdNumber, setEditIdNumber] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const role = getRole();
  const isAdmin = role === "ADMIN";

  const load = async () => {
    const [tRes, uRes] = await Promise.all([
      api.get("/tenants"),
      api.get("/users"),
    ]);
    setTenants(tRes.data);
    setUsers(uRes.data.filter((u: User) => u.role === "TENANT"));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    setError("");
    try {
      await api.post("/tenants", {
        fullName: trimmedName,
        phone: phone.trim() || null,
        idNumber: idNumber.trim() || null,
        address: address.trim() || null,
        email: email.trim() || null,
        user: userId ? { id: Number(userId) } : null,
      });
    } catch (err: any) {
      setError(
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm khách thuê thất bại",
      );
      return;
    }
    setFullName("");
    setPhone("");
    setIdNumber("");
    setAddress("");
    setEmail("");
    setUserId("");
    setShowCreate(false);
    load();
  };

  const startEdit = (tenant: Tenant) => {
    setEditing(tenant);
    setEditFullName(tenant.fullName || "");
    setEditPhone(tenant.phone || "");
    setEditIdNumber(tenant.idNumber || "");
    setEditAddress(tenant.address || "");
    setEditEmail(tenant.email || "");
    setEditUserId(tenant.user?.id ? String(tenant.user.id) : "");
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const trimmedName = editFullName.trim();
    if (!trimmedName) {
      setEditError("Vui lòng nhập họ tên");
      return;
    }
    setEditError("");
    try {
      await api.put(`/tenants/${editing.id}`, {
        fullName: trimmedName,
        phone: editPhone.trim() || null,
        idNumber: editIdNumber.trim() || null,
        address: editAddress.trim() || null,
        email: editEmail.trim() || null,
        user: editUserId ? { id: Number(editUserId) } : null,
      });
    } catch (err: any) {
      setEditError(
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại",
      );
      return;
    }
    setEditing(null);
    setEditFullName("");
    setEditPhone("");
    setEditIdNumber("");
    setEditAddress("");
    setEditEmail("");
    setEditUserId("");
    load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditFullName("");
    setEditPhone("");
    setEditIdNumber("");
    setEditAddress("");
    setEditEmail("");
    setEditUserId("");
    setEditError("");
  };

  const askRemove = (tenant: Tenant) => {
    setConfirmId(tenant.id);
    setConfirmName(tenant.fullName);
  };

  const confirmRemove = async () => {
    if (confirmId == null) return;
    try {
      await api.delete(`/tenants/${confirmId}`);
    } catch (err: any) {
      setConfirmId(null);
      setConfirmName("");
      setError(
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Xóa thất bại",
      );
      return;
    }
    setConfirmId(null);
    setConfirmName("");
    load();
  };

  const cancelRemove = () => {
    setConfirmId(null);
    setConfirmName("");
  };

  const filtered = tenants.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.phone?.toLowerCase().includes(q) ||
      t.idNumber?.toLowerCase().includes(q) ||
      t.address?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.user?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý khách thuê</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder="Tìm kiếm theo tên, SĐT, CCCD, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Thêm khách thuê
                </button>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              Bạn chỉ có quyền xem dữ liệu.
            </div>
          )}
        </div>
        <div className="card">
          <SimpleTable
            data={filtered}
            columns={[
              { header: "ID", render: (t) => t.id },
              { header: "Họ tên", render: (t) => t.fullName },
              { header: "SĐT", render: (t) => t.phone },
              { header: "CCCD", render: (t) => t.idNumber },
              { header: "Tài khoản", render: (t) => t.user?.username },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (t: Tenant) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => startEdit(t)}>
                            Sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => askRemove(t)}
                          >
                            Xóa
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm khách thuê</h3>
                  <p className="card-subtitle">Điền thông tin khách thuê</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">Họ tên</label>
                  <input
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">SĐT</label>
                  <input
                    placeholder="0987xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">CCCD/CMND</label>
                  <input
                    placeholder="0123456789"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Địa chỉ</label>
                  <input
                    placeholder="Địa chỉ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gán tài khoản</label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="">Chọn tài khoản</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowCreate(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn" type="submit">
                    Thêm khách thuê
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa khách thuê</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">Họ tên</label>
                  <input
                    placeholder="Họ tên"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">SĐT</label>
                  <input
                    placeholder="SĐT"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">CCCD/CMND</label>
                  <input
                    placeholder="CCCD/CMND"
                    value={editIdNumber}
                    onChange={(e) => setEditIdNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input
                    placeholder="Email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Địa chỉ</label>
                  <input
                    placeholder="Địa chỉ"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gán tài khoản</label>
                  <select
                    value={editUserId}
                    onChange={(e) => setEditUserId(e.target.value)}
                  >
                    <option value="">Chọn tài khoản</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>
                {editError && <div className="form-error">{editError}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Hủy
                </button>
                <button className="btn" onClick={saveEdit}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa khách thuê{" "}
                <strong>{confirmName || "này"}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelRemove}>
                  Hủy
                </button>
                <button className="btn" onClick={confirmRemove}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
