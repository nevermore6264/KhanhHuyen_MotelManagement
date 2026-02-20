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
type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  user?: { id: number };
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

const validateTenant = (data: {
  fullName: string;
  phone: string;
  idNumber: string;
  address: string;
  email: string;
}) => {
  if (!data.fullName.trim()) return "Vui lòng nhập họ tên";
  if (!data.phone.trim()) return "Vui lòng nhập số điện thoại";
  if (!/^\d{9,11}$/.test(data.phone.trim())) return "SĐT không hợp lệ";
  if (!data.idNumber.trim()) return "Vui lòng nhập CCCD/CMND";
  if (!/^\d{9,12}$/.test(data.idNumber.trim())) return "CCCD/CMND không hợp lệ";
  if (!data.address.trim()) return "Vui lòng nhập địa chỉ";
  if (
    data.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return "Email không hợp lệ";
  }
  return "";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [tenantId, setTenantId] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTenantId, setEditTenantId] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [linkUserModal, setLinkUserModal] = useState<User | null>(null);
  const [linkMode, setLinkMode] = useState<"existing" | "new">("existing");
  const [linkTenantId, setLinkTenantId] = useState("");
  const [linkError, setLinkError] = useState("");
  const [newTenantFullName, setNewTenantFullName] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantIdNumber, setNewTenantIdNumber] = useState("");
  const [newTenantAddress, setNewTenantAddress] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantError, setNewTenantError] = useState("");
  const roleCurrent = getRole();
  const isAdmin = roleCurrent === "ADMIN";
  const { notify } = useToast();

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const loadTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data || []);
    } catch {
      setTenants([]);
    }
  };

  useEffect(() => {
    load();
    loadTenants();
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
        role,
        active: true,
        tenantId: role === "TENANT" && tenantId ? Number(tenantId) : null,
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
    setRole("STAFF");
    setTenantId("");
    setShowCreate(false);
    load();
  };

  const startEdit = (user: User) => {
    setEditing(user);
    setEditFullName(user.fullName || "");
    setEditPhone((user as any).phone || "");
    setEditTenantId("");
    setEditPassword("");
    setEditError("");
    loadTenants();
  };

  useEffect(() => {
    if (editing && tenants.length > 0) {
      const linked = tenants.find((t) => t.user?.id === editing.id);
      setEditTenantId(linked ? String(linked.id) : "");
    }
  }, [editing?.id, tenants]);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.put(`/users/${editing.id}`, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        role: editing.role,
        active: editing.active,
        password: editPassword.trim() || null,
      });
      await api.put(`/users/${editing.id}/tenant`, {
        tenantId: editTenantId ? Number(editTenantId) : null,
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
    setEditTenantId("");
    setEditPassword("");
    load();
  };

  const openLinkModal = (user: User) => {
    setLinkUserModal(user);
    setLinkMode("existing");
    setLinkTenantId("");
    setLinkError("");
    setNewTenantFullName("");
    setNewTenantPhone("");
    setNewTenantIdNumber("");
    setNewTenantAddress("");
    setNewTenantEmail("");
    setNewTenantError("");
    loadTenants();
  };

  useEffect(() => {
    if (linkUserModal && tenants.length > 0 && !linkTenantId) {
      const linked = tenants.find((t) => t.user?.id === linkUserModal.id);
      setLinkTenantId(linked ? String(linked.id) : "");
    }
  }, [linkUserModal?.id, tenants]);

  const saveLinkTenant = async () => {
    if (!linkUserModal) return;
    setLinkError("");
    try {
      await api.put(`/users/${linkUserModal.id}/tenant`, {
        tenantId: linkTenantId ? Number(linkTenantId) : null,
      });
      notify("Gắn khách thuê thành công", "success");
      setLinkUserModal(null);
      setLinkTenantId("");
      load();
    } catch (err: any) {
      const msg =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Gắn khách thuê thất bại";
      setLinkError(msg);
      notify(msg, "error");
    }
  };

  const createAndLinkTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUserModal) return;
    const msg = validateTenant({
      fullName: newTenantFullName,
      phone: newTenantPhone,
      idNumber: newTenantIdNumber,
      address: newTenantAddress,
      email: newTenantEmail,
    });
    if (msg) {
      setNewTenantError(msg);
      notify(msg, "error");
      return;
    }
    setNewTenantError("");
    try {
      await api.post("/tenants", {
        fullName: newTenantFullName.trim(),
        phone: newTenantPhone.trim() || null,
        idNumber: newTenantIdNumber.trim() || null,
        address: newTenantAddress.trim() || null,
        email: newTenantEmail.trim() || null,
        userId: linkUserModal.id,
      });
      notify("Tạo khách thuê và gắn tài khoản thành công", "success");
      setLinkUserModal(null);
      setLinkMode("existing");
      setNewTenantFullName("");
      setNewTenantPhone("");
      setNewTenantIdNumber("");
      setNewTenantAddress("");
      setNewTenantEmail("");
      load();
      loadTenants();
    } catch (err: any) {
      const text =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo khách thuê thất bại";
      setNewTenantError(text);
      notify(text, "error");
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditFullName("");
    setEditPhone("");
    setEditTenantId("");
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
                <button
                  className="btn"
                  onClick={() => {
                    setShowCreate(true);
                    loadTenants();
                  }}
                >
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
              {
                header: "Họ tên",
                render: (u) => {
                  const linked = tenants.find((t) => t.user?.id === u.id);
                  return linked?.fullName ?? u.fullName ?? "—";
                },
              },
              {
                header: "SĐT",
                render: (u) => {
                  const linked = tenants.find((t) => t.user?.id === u.id);
                  return linked?.phone ?? "—";
                },
              },
              {
                header: "CCCD",
                render: (u) => {
                  const linked = tenants.find((t) => t.user?.id === u.id);
                  return linked?.idNumber ?? "—";
                },
              },
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
                            onClick={() => openLinkModal(u)}
                            title="Gắn tài khoản với khách thuê"
                          >
                            Gắn người dùng
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
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
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
                <div className="form-span-2">
                  <label className="field-label">Chức vụ (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (e.target.value !== "TENANT") setTenantId("");
                    }}
                  >
                    <option value="ADMIN">Quản trị</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="TENANT">Khách thuê</option>
                  </select>
                </div>
                {role === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">
                      Gắn với khách thuê (người được thuê)
                    </label>
                    <select
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                    >
                      <option value="">— Không gắn / Tạo mới —</option>
                      {tenants
                        .filter((t) => !t.user)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} (ID: {t.id})
                          </option>
                        ))}
                    </select>
                    <p className="card-subtitle" style={{ marginTop: 4 }}>
                      Chọn khách thuê có sẵn trong hệ thống để tài khoản đăng
                      nhập được gắn với hồ sơ đó.
                    </p>
                  </div>
                )}
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

        {linkUserModal && (
          <div className="modal-backdrop">
            <div className="modal-card form-card link-tenant-modal">
              <div className="card-header">
                <div>
                  <h3>Gắn người dùng với khách thuê</h3>
                  <p className="card-subtitle">
                    Tài khoản: <strong>{linkUserModal.username}</strong>
                  </p>
                </div>
              </div>
              <div className="link-mode-radios">
                <label className="link-mode-radio">
                  <input
                    type="radio"
                    name="linkMode"
                    checked={linkMode === "existing"}
                    onChange={() => setLinkMode("existing")}
                  />
                  <span>Chọn khách thuê có sẵn</span>
                </label>
                <label className="link-mode-radio">
                  <input
                    type="radio"
                    name="linkMode"
                    checked={linkMode === "new"}
                    onChange={() => setLinkMode("new")}
                  />
                  <span>Tạo khách thuê mới</span>
                </label>
              </div>

              {linkMode === "existing" ? (
                <>
                  <div className="form-grid">
                    <div className="form-span-2">
                      <label className="field-label">Khách thuê</label>
                      <select
                        value={linkTenantId}
                        onChange={(e) => setLinkTenantId(e.target.value)}
                      >
                        <option value="">— Không gắn —</option>
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} (ID: {t.id})
                            {t.user?.id === linkUserModal.id
                              ? " ✓ đang gắn"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {linkError && (
                      <div className="form-error form-span-2">{linkError}</div>
                    )}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 16 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setLinkUserModal(null);
                        setLinkTenantId("");
                        setLinkError("");
                      }}
                    >
                      Hủy
                    </button>
                    <button className="btn" onClick={saveLinkTenant}>
                      Lưu
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={createAndLinkTenant}
                  className="form-grid"
                  style={{ marginTop: 8 }}
                >
                  <div>
                    <label className="field-label">Họ tên</label>
                    <input
                      placeholder="Họ tên"
                      value={newTenantFullName}
                      onChange={(e) => setNewTenantFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">SĐT</label>
                    <input
                      placeholder="SĐT 9–11 số"
                      value={newTenantPhone}
                      onChange={(e) => setNewTenantPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">CCCD/CMND</label>
                    <input
                      placeholder="CCCD/CMND"
                      value={newTenantIdNumber}
                      onChange={(e) => setNewTenantIdNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Địa chỉ</label>
                    <input
                      placeholder="Địa chỉ"
                      value={newTenantAddress}
                      onChange={(e) => setNewTenantAddress(e.target.value)}
                    />
                  </div>
                  <div className="form-span-2">
                    <label className="field-label">Email</label>
                    <input
                      placeholder="Email (không bắt buộc)"
                      value={newTenantEmail}
                      onChange={(e) => setNewTenantEmail(e.target.value)}
                    />
                  </div>
                  {newTenantError && (
                    <div className="form-error form-span-2">
                      {newTenantError}
                    </div>
                  )}
                  <div
                    className="form-actions form-span-2"
                    style={{ marginTop: 8 }}
                  >
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => {
                        setLinkUserModal(null);
                        setLinkMode("existing");
                        setNewTenantError("");
                      }}
                    >
                      Hủy
                    </button>
                    <button className="btn" type="submit">
                      Tạo khách thuê và gắn
                    </button>
                  </div>
                </form>
              )}
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
                  <label className="field-label">Chức vụ</label>
                  <div className="readonly-field">
                    {editing ? roleLabel(editing.role) : "—"}
                  </div>
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
                {editing?.role === "TENANT" && (
                  <div className="form-span-2">
                    <label className="field-label">
                      Gắn với khách thuê (người được thuê)
                    </label>
                    <select
                      value={editTenantId}
                      onChange={(e) => setEditTenantId(e.target.value)}
                    >
                      <option value="">— Không gắn —</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} (ID: {t.id})
                          {t.user?.id === editing?.id ? " ✓ đang gắn" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
