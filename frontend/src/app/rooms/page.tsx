"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";

type Area = { id: number; name: string };
type Room = {
  id: number;
  code: string;
  floor?: string;
  status: string;
  area?: Area;
  currentPrice?: number;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [code, setCode] = useState("");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [areaId, setAreaId] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState("AVAILABLE");
  const [editAreaId, setEditAreaId] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const role = getRole();
  const isAdmin = role === "ADMIN";

  const load = async () => {
    const [roomRes, areaRes] = await Promise.all([
      api.get("/rooms"),
      api.get("/areas"),
    ]);
    setRooms(roomRes.data);
    setAreas(areaRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode || !areaId || !price) {
      setError("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setError("");
    try {
      await api.post("/rooms", {
        code: trimmedCode,
        floor: floor.trim() || null,
        status,
        currentPrice: price ? Number(price) : null,
        area: areaId ? { id: Number(areaId) } : null,
      });
    } catch (err: any) {
      setError(
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm phòng thất bại",
      );
      return;
    }
    setCode("");
    setFloor("");
    setPrice("");
    setShowCreate(false);
    load();
  };

  const startEdit = (room: Room) => {
    setEditing(room);
    setEditCode(room.code || "");
    setEditFloor(room.floor || "");
    setEditStatus(room.status || "AVAILABLE");
    setEditAreaId(room.area?.id ? String(room.area.id) : "");
    setEditPrice(room.currentPrice != null ? String(room.currentPrice) : "");
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const trimmedCode = editCode.trim();
    if (!trimmedCode || !editAreaId || !editPrice) {
      setEditError("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setEditError("");
    try {
      await api.put(`/rooms/${editing.id}`, {
        code: trimmedCode,
        floor: editFloor.trim() || null,
        status: editStatus,
        currentPrice: editPrice ? Number(editPrice) : null,
        area: editAreaId ? { id: Number(editAreaId) } : null,
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
    setEditCode("");
    setEditFloor("");
    setEditPrice("");
    setEditAreaId("");
    load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditCode("");
    setEditFloor("");
    setEditPrice("");
    setEditAreaId("");
    setEditError("");
  };

  const askRemove = (room: Room) => {
    setConfirmId(room.id);
    setConfirmName(room.code);
  };

  const confirmRemove = async () => {
    if (confirmId == null) return;
    try {
      await api.delete(`/rooms/${confirmId}`);
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

  const filtered = rooms.filter((room) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      room.code?.toLowerCase().includes(q) ||
      room.floor?.toLowerCase().includes(q) ||
      room.status?.toLowerCase().includes(q) ||
      room.area?.name?.toLowerCase().includes(q)
    );
  });

  const formatNumber = (value?: number) =>
    value == null ? "" : new Intl.NumberFormat("vi-VN").format(value);

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý phòng</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder="Tìm kiếm theo mã, tầng, khu, trạng thái..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Thêm phòng mới
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
              { header: "Mã", render: (r) => r.code },
              { header: "Tầng", render: (r) => r.floor },
              { header: "Trạng thái", render: (r) => r.status },
              { header: "Khu", render: (r) => r.area?.name },
              { header: "Giá", render: (r) => formatNumber(r.currentPrice) },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (r: Room) => (
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

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm phòng mới</h3>
                  <p className="card-subtitle">Điền thông tin phòng</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: P101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Ví dụ: Tầng 1"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                  >
                    <option value="">Chọn khu</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: 2500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                    Thêm phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa phòng</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Mã phòng"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Tầng"
                    value={editFloor}
                    onChange={(e) => setEditFloor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                  >
                    <option value="">Chọn khu</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Giá phòng"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
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

        {confirmId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa phòng{" "}
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
