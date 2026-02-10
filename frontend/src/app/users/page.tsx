"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type User = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  active: boolean;
};

const roleLabel = (value?: string) => {
  switch (value) {
    case "ADMIN":
      return "Quản trị";
    case "STAFF":
      return "Nhân viên";
    case "TENANT":
      return "Khách thuê";
    default:
      return value || "-";
  }
};

const statusBadge = (active: boolean) =>
  active ? "status-available" : "status-maintenance";

const roleBadge = (value?: string) => {
  switch (value) {
    case "ADMIN":
      return "status-occupied";
    case "STAFF":
      return "status-available";
    case "TENANT":
      return "status-maintenance";
    default:
      return "status-unknown";
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAFF");
  const [roleFilter, setRoleFilter] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("STAFF");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const roleCurrent = getRole();
  const isAdmin = roleCurrent === "ADMIN";
  const { notify } = useToast();

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      setError("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }
    setError("");
    try {
      await api.post("/users", {
        username: trimmedUsername,
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        role,
        active: true,
      });
      notify("Tạo tài khoản thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo tài khoản thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setUsername("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("STAFF");
    setShowCreate(false);
    load();
  };

  const startEdit = (user: User) => {
    setEditing(user);
    setEditFullName(user.fullName || "");
    setEditPhone((user as any).phone || "");
    setEditRole(user.role || "STAFF");
    setEditPassword("");
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.put(`/users/${editing.id}`, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        role: editRole,
        active: editing.active,
        password: editPassword.trim() || null,
      });
      notify("Cập nhật người dùng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại";
      setEditError(message);
      notify(message, "error");
      return;
    }
    setEditing(null);
    setEditFullName("");
    setEditPhone("");
    setEditRole("STAFF");
    setEditPassword("");
    load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditFullName("");
    setEditPhone("");
    setEditRole("STAFF");
    setEditPassword("");
    setEditError("");
  };

  const toggleLock = async (user: User) => {
    try {
      await api.put(`/users/${user.id}/${user.active ? "lock" : "unlock"}`);
      notify(
        user.active
          ? "Khóa tài khoản thành công"
          : "Mở khóa tài khoản thành công",
        "success",
      );
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    load();
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q
      ? true
      : u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesQuery && matchesRole;
  });

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý người dùng</h2>
        <div className="card">
          <div className="grid grid-3">
            <input
              placeholder="Tìm kiếm theo tài khoản, họ tên, chức vụ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả chức vụ</option>
              <option value="ADMIN">Quản trị</option>
              <option value="STAFF">Nhân viên</option>
              <option value="TENANT">Khách thuê</option>
            </select>
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Tạo tài khoản
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
              { header: "ID", render: (u) => u.id },
              { header: "Tài khoản", render: (u) => u.username },
              { header: "Họ tên", render: (u) => u.fullName },
              {
                header: "Chức vụ",
                render: (u) => (
                  <span className={`status-badge ${roleBadge(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                ),
              },
              {
                header: "Trạng thái",
                render: (u) => (
                  <span className={`status-badge ${statusBadge(u.active)}`}>
                    {u.active ? "Hoạt động" : "Đã khóa"}
                  </span>
                ),
              },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (u: User) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => startEdit(u)}>
                            Sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => toggleLock(u)}
                          >
                            {u.active ? "Khóa" : "Mở"}
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
                  <h3>Tạo tài khoản</h3>
                  <p className="card-subtitle">Thiết lập thông tin đăng nhập</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">Tài khoản</label>
                  <input
                    placeholder="Nhập tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Mật khẩu</label>
                  <input
                    placeholder="Nhập mật khẩu"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Họ tên</label>
                  <input
                    placeholder="Họ tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">SĐT</label>
                  <input
                    placeholder="SĐT"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="TENANT">TENANT</option>
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
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa người dùng</h3>
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
                  <label className="field-label">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="TENANT">TENANT</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Mật khẩu mới</label>
                  <input
                    placeholder="Để trống nếu không đổi"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
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
      </div>
    </ProtectedPage>
  );
}
