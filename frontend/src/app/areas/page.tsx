"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Area = {
  id: number;
  name: string;
  address?: string;
  description?: string;
};

export default function AreasPage() {
  const [data, setData] = useState<Area[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Area | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const role = getRole();
  const isAdmin = role === "ADMIN";
  const { notify } = useToast();

  const load = async () => {
    const res = await api.get("/areas");
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedAddress || !trimmedDescription) {
      setError("Vui lòng nhập đầy đủ Tên khu, Địa chỉ, Mô tả");
      return;
    }
    setError("");
    try {
      await api.post("/areas", {
        name: trimmedName,
        address: trimmedAddress,
        description: trimmedDescription,
      });
      notify("Thêm khu thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm khu thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setName("");
    setAddress("");
    setDescription("");
    setShowCreate(false);
    load();
  };

  const askRemove = (area: Area) => {
    setConfirmId(area.id);
    setConfirmName(area.name);
  };

  const startEdit = (area: Area) => {
    setEditing(area);
    setEditName(area.name || "");
    setEditAddress(area.address || "");
    setEditDescription(area.description || "");
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editing) {
      return;
    }
    const trimmedName = editName.trim();
    const trimmedAddress = editAddress.trim();
    const trimmedDescription = editDescription.trim();
    if (!trimmedName || !trimmedAddress || !trimmedDescription) {
      setEditError("Vui lòng nhập đầy đủ Tên khu, Địa chỉ, Mô tả");
      return;
    }
    setEditError("");
    try {
      await api.put(`/areas/${editing.id}`, {
        name: trimmedName,
        address: trimmedAddress,
        description: trimmedDescription,
      });
      notify("Cập nhật khu thành công", "success");
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
    setEditName("");
    setEditAddress("");
    setEditDescription("");
    load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditName("");
    setEditAddress("");
    setEditDescription("");
    setEditError("");
  };

  const confirmRemove = async () => {
    if (confirmId == null) {
      return;
    }
    try {
      await api.delete(`/areas/${confirmId}`);
      notify("Xóa khu thành công", "success");
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

  const filtered = data.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return (
      item.name?.toLowerCase().includes(q) ||
      item.address?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý khu</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder="Tìm kiếm theo tên, địa chỉ, mô tả..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Thêm khu mới
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
              { header: "ID", render: (r) => r.id },
              { header: "Tên", render: (r) => r.name },
              { header: "Địa chỉ", render: (r) => r.address },
              { header: "Mô tả", render: (r) => r.description },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (r: Area) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => startEdit(r)}>
                            Sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => askRemove(r)}
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

        {confirmId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa khu <strong>{confirmName || "này"}</strong>
                ?
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

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa khu</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    Tên khu <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Tên khu"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
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
                  <label className="field-label">
                    Mô tả <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Mô tả"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
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

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm khu mới</h3>
                  <p className="card-subtitle">Điền thông tin cơ bản của khu</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    Tên khu <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: Khu A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Số nhà, đường, phường..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Mô tả <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ghi chú thêm về khu"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
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
                    Thêm khu
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
