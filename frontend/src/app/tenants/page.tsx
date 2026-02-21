"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole, getToken } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  email?: string;
  portraitImagePath?: string;
  idCardImagePath?: string;
  user?: { id: number; username: string };
};
type User = { id: number; username: string; role: string };

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
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showEditUserPicker, setShowEditUserPicker] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [editUserQuery, setEditUserQuery] = useState("");
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [createUserForPicker, setCreateUserForPicker] = useState<
    "create" | "edit" | null
  >(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserError, setNewUserError] = useState("");
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const isTenant = role === "TENANT";
  const isRoleReady = role !== null;
  const { notify } = useToast();

  const load = async () => {
    const token = getToken();
    if (!token) {
      return;
    }
    const authHeader = { Authorization: `Bearer ${token}` };
    try {
      if (isTenant) {
        const res = await api.get("/tenants/me", { headers: authHeader });
        setTenants(res.data ? [res.data] : []);
        setUsers([]);
        return;
      }
      const [tRes, uRes] = await Promise.all([
        api.get("/tenants", { headers: authHeader }),
        api.get("/users", { headers: authHeader }),
      ]);
      setTenants(tRes.data);
      setUsers(uRes.data.filter((u: User) => u.role === "TENANT"));
    } catch (err: any) {
      if (err?.response?.status === 403) {
        try {
          const res = await api.get("/tenants/me", { headers: authHeader });
          if (res.data) {
            setTenants([res.data]);
            setUsers([]);
            notify("Bạn chỉ có thể xem thông tin của chính mình.", "info");
            return;
          }
        } catch {
          // fall through to error message
        }
      }
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền xem danh sách khách thuê"
          : "Tải dữ liệu khách thuê thất bại";
      notify(message, "error");
    }
  };

  useEffect(() => {
    setRole(getRole());
  }, []);

  useEffect(() => {
    if (!isRoleReady) return;
    load();
  }, [isRoleReady, isTenant]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validateTenant({
      fullName,
      phone,
      idNumber,
      address,
      email,
    });
    if (message) {
      setError(message);
      return;
    }
    setError("");
    try {
      const hasFiles = portraitFile || idCardFile;
      if (hasFiles) {
        const formData = new FormData();
        formData.append("fullName", fullName.trim());
        formData.append("phone", phone.trim() || "");
        formData.append("idNumber", idNumber.trim() || "");
        formData.append("address", address.trim() || "");
        formData.append("email", email.trim() || "");
        if (userId) formData.append("userId", userId);
        if (portraitFile) formData.append("portrait", portraitFile);
        if (idCardFile) formData.append("idCard", idCardFile);
        await api.post("/tenants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/tenants", {
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          idNumber: idNumber.trim() || null,
          address: address.trim() || null,
          email: email.trim() || null,
          userId: userId ? Number(userId) : null,
        });
      }
      notify("Thêm khách thuê thành công", "success");
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : typeof data === "string"
            ? data
            : "Thêm khách thuê thất bại";
      setError(msg);
      notify(msg, "error");
      return;
    }
    setFullName("");
    setPhone("");
    setIdNumber("");
    setAddress("");
    setEmail("");
    setUserId("");
    setUserQuery("");
    setPortraitFile(null);
    setIdCardFile(null);
    setPortraitPreview(null);
    setIdCardPreview(null);
    setShowCreate(false);
    load();
  };

  const onPortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview);
      setPortraitFile(file);
      setPortraitPreview(URL.createObjectURL(file));
    } else {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview);
      setPortraitFile(null);
      setPortraitPreview(null);
    }
  };
  const onIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
    } else {
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
      setIdCardFile(null);
      setIdCardPreview(null);
    }
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
    const message = validateTenant({
      fullName: editFullName,
      phone: editPhone,
      idNumber: editIdNumber,
      address: editAddress,
      email: editEmail,
    });
    if (message) {
      setEditError(message);
      return;
    }
    setEditError("");
    try {
      await api.put(`/tenants/${editing.id}`, {
        fullName: editFullName.trim(),
        phone: editPhone.trim() || null,
        idNumber: editIdNumber.trim() || null,
        address: editAddress.trim() || null,
        email: editEmail.trim() || null,
        user: editUserId ? { id: Number(editUserId) } : null,
      });
      notify("Cập nhật khách thuê thành công", "success");
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
    setEditIdNumber("");
    setEditAddress("");
    setEditEmail("");
    setEditUserId("");
    setEditUserQuery("");
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
    setEditUserQuery("");
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
      notify("Xóa khách thuê thành công", "success");
    } catch (err: any) {
      setConfirmId(null);
      setConfirmName("");
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Xóa thất bại";
      setError(message);
      notify(message, "error");
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

  const openCreateUserForm = (forPicker: "create" | "edit") => {
    setCreateUserForPicker(forPicker);
    setNewUsername("");
    setNewPassword("");
    setNewUserError("");
    setShowCreateUserForm(true);
  };

  const closeCreateUserForm = () => {
    setShowCreateUserForm(false);
    setCreateUserForPicker(null);
    setNewUsername("");
    setNewPassword("");
    setNewUserError("");
  };

  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      setNewUserError("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!newPassword.trim()) {
      setNewUserError("Vui lòng nhập mật khẩu");
      return;
    }
    setNewUserError("");
    try {
      const res = await api.post("/users", {
        username: trimmedUsername,
        password: newPassword,
        role: "TENANT",
        active: true,
      });
      await load();
      const newId = res.data?.id;
      if (createUserForPicker === "create" && newId != null) {
        setUserId(String(newId));
        setShowUserPicker(false);
      } else if (createUserForPicker === "edit" && newId != null) {
        setEditUserId(String(newId));
        setShowEditUserPicker(false);
      }
      notify("Tạo tài khoản thành công", "success");
      closeCreateUserForm();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo tài khoản thất bại";
      setNewUserError(message);
      notify(message, "error");
    }
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

  const linkedUserIds = new Set(
    tenants.map((t) => t.user?.id).filter((id): id is number => id != null),
  );
  const availableUsers = users.filter((u) => !linkedUserIds.has(u.id));
  const availableEditUsers = users.filter(
    (u) =>
      !linkedUserIds.has(u.id) ||
      (editing != null && u.id === editing.user?.id),
  );

  const filteredUsers = availableUsers.filter((u) =>
    u.username.toLowerCase().includes(userQuery.trim().toLowerCase()),
  );
  const filteredEditUsers = availableEditUsers.filter((u) =>
    u.username.toLowerCase().includes(editUserQuery.trim().toLowerCase()),
  );
  const selectedUser = users.find((u) => String(u.id) === userId);
  const selectedEditUser = users.find((u) => String(u.id) === editUserId);

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
          {isRoleReady && !isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant
                ? "Bạn chỉ có thể xem thông tin của chính mình."
                : "Bạn chỉ có quyền xem dữ liệu."}
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
                  <label className="field-label">
                    Họ tên <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    SĐT <span className="required">*</span>
                  </label>
                  <input
                    placeholder="0987xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    CCCD/CMND <span className="required">*</span>
                  </label>
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
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Địa chỉ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Ảnh chân dung</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onPortraitChange}
                    className="file-input"
                  />
                  {portraitPreview && (
                    <div className="upload-preview">
                      <img src={portraitPreview} alt="Chân dung" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="field-label">Ảnh CCCD/CMND</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onIdCardChange}
                    className="file-input"
                  />
                  {idCardPreview && (
                    <div className="upload-preview">
                      <img src={idCardPreview} alt="CCCD" />
                    </div>
                  )}
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gán tài khoản</label>
                  <div className="account-picker">
                    <div className="account-chip">
                      {selectedUser?.username || "Chưa gán tài khoản"}
                    </div>
                    <div className="picker-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setShowUserPicker(true)}
                      >
                        Chọn tài khoản
                      </button>
                      {userId && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => setUserId("")}
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      if (portraitPreview) URL.revokeObjectURL(portraitPreview);
                      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
                      setPortraitFile(null);
                      setIdCardFile(null);
                      setPortraitPreview(null);
                      setIdCardPreview(null);
                      setShowCreate(false);
                    }}
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

        {showUserPicker && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Chọn tài khoản</h3>
                  <p className="card-subtitle">Tài khoản vai trò TENANT</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="picker-search-row">
                  <input
                    placeholder="Tìm theo tên tài khoản..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openCreateUserForm("create")}
                  >
                    Tạo tài khoản
                  </button>
                </div>
                <div className="picker-list">
                  {filteredUsers.length === 0 && (
                    <div className="empty-state">
                      Không có tài khoản phù hợp
                    </div>
                  )}
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="picker-item"
                      onClick={() => {
                        setUserId(String(u.id));
                        setShowUserPicker(false);
                      }}
                    >
                      <span>{u.username}</span>
                      <span className="picker-meta">#{u.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowUserPicker(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa khách thuê</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    Họ tên <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Họ tên"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    SĐT <span className="required">*</span>
                  </label>
                  <input
                    placeholder="SĐT"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    CCCD/CMND <span className="required">*</span>
                  </label>
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
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Địa chỉ"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">Gán tài khoản</label>
                  <div className="account-picker">
                    <div className="account-chip">
                      {selectedEditUser?.username || "Chưa gán tài khoản"}
                    </div>
                    <div className="picker-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setShowEditUserPicker(true)}
                      >
                        Chọn tài khoản
                      </button>
                      {editUserId && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => setEditUserId("")}
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                  </div>
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

        {showEditUserPicker && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Chọn tài khoản</h3>
                  <p className="card-subtitle">Tài khoản vai trò TENANT</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="picker-search-row">
                  <input
                    placeholder="Tìm theo tên tài khoản..."
                    value={editUserQuery}
                    onChange={(e) => setEditUserQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openCreateUserForm("edit")}
                  >
                    Tạo tài khoản
                  </button>
                </div>
                <div className="picker-list">
                  {filteredEditUsers.length === 0 && (
                    <div className="empty-state">
                      Không có tài khoản phù hợp
                    </div>
                  )}
                  {filteredEditUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="picker-item"
                      onClick={() => {
                        setEditUserId(String(u.id));
                        setShowEditUserPicker(false);
                      }}
                    >
                      <span>{u.username}</span>
                      <span className="picker-meta">#{u.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditUserPicker(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateUserForm && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Tạo tài khoản</h3>
                  <p className="card-subtitle">
                    Tài khoản mới với vai trò TENANT
                  </p>
                </div>
              </div>
              <form onSubmit={submitCreateUser} className="form-grid">
                <div>
                  <label className="field-label">
                    Tên đăng nhập <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: tenant2"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Mật khẩu <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                {newUserError && (
                  <div className="form-error form-span-2">{newUserError}</div>
                )}
                <div className="form-actions form-span-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeCreateUserForm}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn">
                    Tạo tài khoản
                  </button>
                </div>
              </form>
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
