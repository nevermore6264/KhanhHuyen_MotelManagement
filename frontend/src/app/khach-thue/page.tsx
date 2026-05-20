"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconTimes,
  IconCheck,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole, getToken } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

type Tenant = {
  id: string;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  email?: string;
  portraitImagePath?: string;
  idCardImagePath?: string;
  user?: { id: string; username: string };
};
type User = { id: string; username: string; role: string };
type TenantApi = Record<string, unknown>;

const API_ORIGIN = "http://localhost:8080";

const toAbsoluteFileUrl = (filePath?: string | null) => {
  if (!filePath) return undefined;
  const path = filePath.trim();
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
};

const normalizeTenant = (item: TenantApi): Tenant => ({
  id: item.id != null ? String(item.id) : "",
  fullName: String(item.fullName ?? item.hoTen ?? ""),
  phone: (item.phone as string) ?? (item.soDienThoai as string) ?? undefined,
  idNumber: (item.idNumber as string) ?? (item.soGiayTo as string) ?? undefined,
  address: (item.address as string) ?? (item.diaChi as string) ?? undefined,
  email: (item.email as string) ?? undefined,
  portraitImagePath: toAbsoluteFileUrl(
    (item.portraitImagePath as string) ?? (item.anhChanDung as string),
  ),
  idCardImagePath: toAbsoluteFileUrl(
    (item.idCardImagePath as string) ?? (item.anhGiayTo as string),
  ),
  user:
    ((item.user as { id?: string | number; username?: string }) ??
      (item.nguoiDung as { id?: string | number; tenDangNhap?: string })) &&
    (item.user || item.nguoiDung)
      ? {
          id: String(
            (item.user as { id?: string | number })?.id ??
              (item.nguoiDung as { id?: string | number })?.id ??
              "",
          ),
          username: String(
            (item.user as { username?: string })?.username ??
              (item.nguoiDung as { tenDangNhap?: string })?.tenDangNhap ??
              "",
          ),
        }
      : undefined,
});

type TenantValidateMsg = {
  errFullName: string;
  errPhone: string;
  errPhoneInvalid: string;
  errIdNumber: string;
  errIdNumberInvalid: string;
  errAddress: string;
  errEmailInvalid: string;
};

const validateTenant = (
  m: TenantValidateMsg,
  data: {
    fullName: string;
    phone: string;
    idNumber: string;
    address: string;
    email: string;
  },
) => {
  if (!data.fullName.trim()) return m.errFullName;
  if (!data.phone.trim()) return m.errPhone;
  if (!/^\d{9,11}$/.test(data.phone.trim())) return m.errPhoneInvalid;
  if (!data.idNumber.trim()) return m.errIdNumber;
  if (!/^\d{9,12}$/.test(data.idNumber.trim())) return m.errIdNumberInvalid;
  if (!data.address.trim()) return m.errAddress;
  if (
    data.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return m.errEmailInvalid;
  }
  return "";
};

type LoaiAnhKhachThue = "portrait" | "idCard";

type TrangThaiXemAnh = {
  tenant: Tenant;
  kind: LoaiAnhKhachThue;
};

function KhoiZoomMotAnh({
  imageUrl,
  title,
  labels,
}: {
  imageUrl: string;
  title: string;
  labels: {
    zoomOutAria: string;
    zoomInAria: string;
    zoomReset: string;
    zoomHint: string;
  };
}) {
  const [scalePct, setScalePct] = useState(100);

  return (
    <div className="tenant-rzp-block">
      <TransformWrapper
        key={imageUrl}
        initialScale={1}
        minScale={0.35}
        maxScale={5}
        centerOnInit
        limitToBounds
        wheel={{ step: 0.12 }}
        pinch={{ step: 0.08 }}
        doubleClick={{ mode: "zoomIn", step: 0.7 }}
        panning={{ velocityDisabled: false }}
        onTransform={(_ref, state) => {
          setScalePct(Math.round(state.scale * 100));
        }}
      >
        {(api) => (
          <>
            <div className="tenant-zoom-toolbar">
              <button
                type="button"
                className="btn btn-sm tenant-zoom-btn tenant-zoom-out"
                aria-label={labels.zoomOutAria}
                onClick={() => api.zoomOut(0.15)}
              >
                −
              </button>
              <span className="tenant-zoom-value">{scalePct}%</span>
              <button
                type="button"
                className="btn btn-sm tenant-zoom-btn tenant-zoom-in"
                aria-label={labels.zoomInAria}
                onClick={() => api.zoomIn(0.15)}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-sm tenant-zoom-btn tenant-zoom-reset"
                onClick={() => api.resetTransform(200)}
              >
                {labels.zoomReset}
              </button>
            </div>
            <div className="tenant-rzp-viewport">
              <TransformComponent
                wrapperClass="tenant-rzp-wrapper"
                contentClass="tenant-rzp-content"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="tenant-rzp-img"
                  draggable={false}
                />
              </TransformComponent>
            </div>
            <p className="tenant-zoom-hint">{labels.zoomHint}</p>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default function TrangKhachThue() {
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
  const [confirmId, setConfirmId] = useState<string | null>(null);
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
  const [editPortraitFile, setEditPortraitFile] = useState<File | null>(null);
  const [editIdCardFile, setEditIdCardFile] = useState<File | null>(null);
  const [editPortraitPreview, setEditPortraitPreview] = useState<string | null>(
    null,
  );
  const [editIdCardPreview, setEditIdCardPreview] = useState<string | null>(
    null,
  );
  const [anhPreview, setAnhPreview] = useState<TrangThaiXemAnh | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const isTenant = role === "TENANT";
  const isRoleReady = role !== null;
  const { notify } = useToast();
  const { t: tr } = useCaiDat();
  const p = tr.pages.khachThue;
  const s = tr.pages.shared;
  const c = tr.common;
  const valMsg: TenantValidateMsg = {
    errFullName: s.errFullName,
    errPhone: s.errPhone,
    errPhoneInvalid: s.errPhoneInvalid,
    errIdNumber: s.errIdNumber,
    errIdNumberInvalid: s.errIdNumberInvalid,
    errAddress: s.errAddress,
    errEmailInvalid: s.errEmailInvalid,
  };

  const load = async () => {
    const token = getToken();
    if (!token) {
      return;
    }
    const authHeader = { Authorization: `Bearer ${token}` };
    try {
      if (isTenant) {
        const res = await api.get("/khach-thue/cua-toi", {
          headers: authHeader,
        });
        setTenants(res.data ? [normalizeTenant(res.data as TenantApi)] : []);
        setUsers([]);
        return;
      }
      const [tRes, uRes] = await Promise.all([
        api.get("/khach-thue", { headers: authHeader }),
        api.get("/nguoi-dung", { headers: authHeader }),
      ]);
      setTenants(((tRes.data as TenantApi[]) || []).map(normalizeTenant));
      setUsers(uRes.data.filter((u: User) => u.role === "TENANT"));
    } catch (err: any) {
      if (err?.response?.status === 403) {
        try {
          const res = await api.get("/khach-thue/cua-toi", {
            headers: authHeader,
          });
          if (res.data) {
            setTenants([normalizeTenant(res.data as TenantApi)]);
            setUsers([]);
            notify(s.viewOwnOnly, "info");
            return;
          }
        } catch {

        }
      }
      const message =
        err?.response?.status === 403 ? p.errLoadList : p.errLoad;
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
    const message = validateTenant(valMsg, {
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


        await api.post("/khach-thue", formData);
      } else {
        await api.post("/khach-thue", {
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          idNumber: idNumber.trim() || null,
          address: address.trim() || null,
          email: email.trim() || null,
          userId: userId.trim() ? userId.trim() : null,
        });
      }
      notify(p.okAdd, "success");
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        err?.response?.status === 403
          ? s.noPermission
          : typeof data === "string"
            ? data
            : p.errAdd;
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
    if (editPortraitPreview) URL.revokeObjectURL(editPortraitPreview);
    if (editIdCardPreview) URL.revokeObjectURL(editIdCardPreview);
    setEditPortraitFile(null);
    setEditIdCardFile(null);
    setEditPortraitPreview(null);
    setEditIdCardPreview(null);
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
    const message = validateTenant(valMsg, {
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
      const hasEditFiles = !!(editPortraitFile || editIdCardFile);
      if (hasEditFiles) {
        const formData = new FormData();
        formData.append("fullName", editFullName.trim());
        formData.append("phone", editPhone.trim() || "");
        formData.append("idNumber", editIdNumber.trim() || "");
        formData.append("address", editAddress.trim() || "");
        formData.append("email", editEmail.trim() || "");
        formData.append("userId", editUserId || "");
        if (editPortraitFile) formData.append("portrait", editPortraitFile);
        if (editIdCardFile) formData.append("idCard", editIdCardFile);
        await api.put(`/khach-thue/${editing.id}`, formData);
      } else {
        await api.put(`/khach-thue/${editing.id}`, {
          fullName: editFullName.trim(),
          phone: editPhone.trim() || null,
          idNumber: editIdNumber.trim() || null,
          address: editAddress.trim() || null,
          email: editEmail.trim() || null,
          user: editUserId.trim() ? { id: editUserId.trim() } : null,
        });
      }
      notify(p.okUpdate, "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? s.noPermission : p.errUpdate;
      setEditError(message);
      notify(message, "error");
      return;
    }
    if (editPortraitPreview) URL.revokeObjectURL(editPortraitPreview);
    if (editIdCardPreview) URL.revokeObjectURL(editIdCardPreview);
    setEditPortraitFile(null);
    setEditIdCardFile(null);
    setEditPortraitPreview(null);
    setEditIdCardPreview(null);
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
    if (editPortraitPreview) URL.revokeObjectURL(editPortraitPreview);
    if (editIdCardPreview) URL.revokeObjectURL(editIdCardPreview);
    setEditPortraitFile(null);
    setEditIdCardFile(null);
    setEditPortraitPreview(null);
    setEditIdCardPreview(null);
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

  const onEditPortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (editPortraitPreview) URL.revokeObjectURL(editPortraitPreview);
      setEditPortraitFile(file);
      setEditPortraitPreview(URL.createObjectURL(file));
    } else {
      if (editPortraitPreview) URL.revokeObjectURL(editPortraitPreview);
      setEditPortraitFile(null);
      setEditPortraitPreview(null);
    }
  };
  const onEditIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (editIdCardPreview) URL.revokeObjectURL(editIdCardPreview);
      setEditIdCardFile(file);
      setEditIdCardPreview(URL.createObjectURL(file));
    } else {
      if (editIdCardPreview) URL.revokeObjectURL(editIdCardPreview);
      setEditIdCardFile(null);
      setEditIdCardPreview(null);
    }
  };

  const askRemove = (tenant: Tenant) => {
    setConfirmId(tenant.id);
    setConfirmName(tenant.fullName);
  };

  const confirmRemove = async () => {
    if (confirmId == null) return;
    try {
      await api.delete(`/khach-thue/${confirmId}`);
      notify(p.okDelete, "success");
    } catch (err: any) {
      setConfirmId(null);
      setConfirmName("");
      const message =
        err?.response?.status === 403 ? s.noPermission : p.errDelete;
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
      setNewUserError(s.errUsername);
      return;
    }
    if (!newPassword.trim()) {
      setNewUserError(s.errPassword);
      return;
    }
    setNewUserError("");
    try {
      const res = await api.post("/nguoi-dung", {
        tenDangNhap: trimmedUsername,
        matKhau: newPassword,
        vaiTro: "TENANT",
        kichHoat: true,
        hoTen: "",
        maKhachThue:
          createUserForPicker === "edit" && editing?.id != null
            ? editing.id
            : null,
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
      notify(p.okAccount, "success");
      closeCreateUserForm();
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message =
        status === 403
          ? s.noPermission
          : typeof data === "string"
            ? data
            : typeof data?.message === "string"
              ? data.message
              : s.errCreateAccount;
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
    tenants.map((t) => t.user?.id).filter((id): id is string => id != null),
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
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder={p.searchPh}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  <IconPlus /> {p.addNew}
                </button>
              </div>
            )}
          </div>
          {isRoleReady && !isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant ? s.viewOwnOnly : s.viewOnly}
            </div>
          )}
        </div>
        <div className="card">
          <BangDonGian
            data={filtered}
            columns={[
              { header: s.id, render: (t) => t.id },
              { header: s.fullName, render: (t) => t.fullName },
              { header: s.phone, render: (t) => t.phone },
              { header: s.idNumber, render: (t) => t.idNumber },
              {
                header: p.portrait,
                render: (t) =>
                  t.portraitImagePath ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm table-link-xem"
                      onClick={() =>
                        setAnhPreview({ tenant: t, kind: "portrait" })
                      }
                    >
                      {s.view}
                    </button>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  ),
              },
              {
                header: p.idCardCol,
                render: (t) =>
                  t.idCardImagePath ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm table-link-xem"
                      onClick={() =>
                        setAnhPreview({ tenant: t, kind: "idCard" })
                      }
                    >
                      {s.view}
                    </button>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  ),
              },
              { header: s.account, render: (t) => t.user?.username },
              ...(isAdmin
                ? [
                    {
                      header: s.actions,
                      render: (t: Tenant) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => startEdit(t)}>
                            <IconPencil /> {s.edit}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => askRemove(t)}
                          >
                            <IconTrash /> {s.delete}
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {anhPreview && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => setAnhPreview(null)}
          >
            <div
              className="modal-card form-card tenant-view-modal tenant-view-modal-single"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tenant-view-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header tenant-view-header-only">
                <h3 id="tenant-view-title">
                  {anhPreview.kind === "portrait"
                    ? p.portraitPhoto
                    : p.idCardPhoto}
                </h3>
              </div>
              {anhPreview.kind === "portrait" ? (
                anhPreview.tenant.portraitImagePath ? (
                  <KhoiZoomMotAnh
                    imageUrl={anhPreview.tenant.portraitImagePath}
                    title={p.portraitPhoto}
                    labels={{
                      zoomOutAria: p.zoomOutAria,
                      zoomInAria: p.zoomInAria,
                      zoomReset: p.zoomReset,
                      zoomHint: p.zoomHint,
                    }}
                  />
                ) : (
                  <p className="tenant-view-empty">{p.noPhoto}</p>
                )
              ) : anhPreview.tenant.idCardImagePath ? (
                <KhoiZoomMotAnh
                  imageUrl={anhPreview.tenant.idCardImagePath}
                  title={p.idCardPhoto}
                  labels={{
                    zoomOutAria: p.zoomOutAria,
                    zoomInAria: p.zoomInAria,
                    zoomReset: p.zoomReset,
                    zoomHint: p.zoomHint,
                  }}
                />
              ) : (
                <p className="tenant-view-empty">{p.noPhoto}</p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAnhPreview(null)}
                >
                  <IconTimes /> {c.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>{p.addTitle}</h3>
                  <p className="card-subtitle">{p.addSub}</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    {s.fullName} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.fullNamePh}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.phone} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.phonePh}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.idNumber} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.idNumberPh}
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">{s.email}</label>
                  <input
                    placeholder={p.emailPh}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    {s.address} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.addressPh}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">{p.portraitPhoto}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onPortraitChange}
                    className="file-input"
                  />
                  {portraitPreview && (
                    <div className="upload-preview">
                      <img src={portraitPreview} alt={p.portrait} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="field-label">{p.idCardPhoto}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onIdCardChange}
                    className="file-input"
                  />
                  {idCardPreview && (
                    <div className="upload-preview">
                      <img src={idCardPreview} alt={s.idNumber} />
                    </div>
                  )}
                </div>
                <div className="form-span-2">
                  <label className="field-label">{p.assignAccount}</label>
                  <div className="account-picker">
                    <div className="account-chip">
                      {selectedUser?.username || p.notAssigned}
                    </div>
                    <div className="picker-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setShowUserPicker(true)}
                      >
                        {p.selectAccount}
                      </button>
                      {userId && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => setUserId("")}
                        >
                          {p.clearSelection}
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
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn" type="submit">
                    <IconPlus /> {p.addNew}
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
                  <h3>{p.pickAccount}</h3>
                  <p className="card-subtitle">{p.pickAccountSub}</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="picker-search-row">
                  <input
                    placeholder={p.searchAccountPh}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openCreateUserForm("create")}
                  >
                    {p.createAccount}
                  </button>
                </div>
                <div className="picker-list">
                  {filteredUsers.length === 0 && (
                    <div className="empty-state">{p.noMatchingAccounts}</div>
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
                  {c.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>{p.editTitle}</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    {s.fullName} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.fullName}
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.phone} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.phone}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.idNumber} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={s.idNumber}
                    value={editIdNumber}
                    onChange={(e) => setEditIdNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">{s.email}</label>
                  <input
                    placeholder={s.email}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    {s.address} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.addressPh}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">{p.portraitPhoto}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onEditPortraitChange}
                    className="file-input"
                  />
                  <div className="upload-preview">
                    {(editPortraitPreview || editing.portraitImagePath) && (
                      <img
                        key={
                          editPortraitPreview ??
                          editing.portraitImagePath ??
                          "portrait"
                        }
                        src={
                          editPortraitPreview ?? editing.portraitImagePath ?? ""
                        }
                        alt={p.portrait}
                      />
                    )}
                    {!editPortraitPreview && !editing.portraitImagePath && (
                      <span style={{ opacity: 0.75, fontSize: "0.9rem" }}>
                        {p.noPhotoHint}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="field-label">{p.idCardPhoto}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onEditIdCardChange}
                    className="file-input"
                  />
                  <div className="upload-preview">
                    {(editIdCardPreview || editing.idCardImagePath) && (
                      <img
                        key={
                          editIdCardPreview ?? editing.idCardImagePath ?? "id"
                        }
                        src={editIdCardPreview ?? editing.idCardImagePath ?? ""}
                        alt={p.idCardPhoto}
                      />
                    )}
                    {!editIdCardPreview && !editing.idCardImagePath && (
                      <span style={{ opacity: 0.75, fontSize: "0.9rem" }}>
                        {p.noPhotoHint}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-span-2">
                  <label className="field-label">{p.assignAccount}</label>
                  <div className="account-picker">
                    <div className="account-chip">
                      {selectedEditUser?.username || p.notAssigned}
                    </div>
                    <div className="picker-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setShowEditUserPicker(true)}
                      >
                        {p.selectAccount}
                      </button>
                      {editUserId && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => setEditUserId("")}
                        >
                          {p.clearSelection}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {editError && <div className="form-error">{editError}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={saveEdit}>
                  <IconCheck /> {c.save}
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
                  <h3>{p.pickAccount}</h3>
                  <p className="card-subtitle">{p.pickAccountSub}</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="picker-search-row">
                  <input
                    placeholder={p.searchAccountPh}
                    value={editUserQuery}
                    onChange={(e) => setEditUserQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openCreateUserForm("edit")}
                  >
                    <IconPlus /> {p.createAccount}
                  </button>
                </div>
                <div className="picker-list">
                  {filteredEditUsers.length === 0 && (
                    <div className="empty-state">{p.noMatchingAccounts}</div>
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
                  <IconTimes /> {c.close}
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
                  <h3>{p.createAccount}</h3>
                  <p className="card-subtitle">{p.createAccountSub}</p>
                </div>
              </div>
              <form onSubmit={submitCreateUser} className="form-grid">
                <div>
                  <label className="field-label">
                    {s.username} <span className="required">*</span>
                  </label>
                  <input
                    placeholder={p.usernamePh}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="field-label">
                    {s.password} <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={p.passwordPh}
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
                    <IconTimes /> {c.cancel}
                  </button>
                  <button type="submit" className="btn">
                    <IconPlus /> {p.createAccount}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>{s.confirmDelete}</h3>
              <p>
                {p.confirmDelete}{" "}
                <strong>{confirmName || s.thisItem}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelRemove}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={confirmRemove}>
                  <IconTrash /> {s.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
