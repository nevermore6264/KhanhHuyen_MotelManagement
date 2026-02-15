"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type Area = { id: number; name: string };
type Room = { id: number; code: string; area?: Area };
type MeterReading = {
  id: number;
  room?: Room;
  month: number;
  year: number;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  totalCost?: number;
};

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

/** Chỉ cho phép tháng hiện tại hoặc tháng trước đó */
const isMonthAllowed = (month: number, year: number): boolean => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (year === currentYear && month === currentMonth) return true;
  if (currentMonth === 1) {
    return year === currentYear - 1 && month === 12;
  }
  return year === currentYear && month === currentMonth - 1;
};

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaId, setAreaId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomId, setRoomId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [oldElectric, setOldElectric] = useState("");
  const [newElectric, setNewElectric] = useState("");
  const [oldWater, setOldWater] = useState("");
  const [newWater, setNewWater] = useState("");
  const [error, setError] = useState("");
  const [filterAreaId, setFilterAreaId] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const { notify } = useToast();

  const load = async () => {
    const [rRes, rmRes, aRes] = await Promise.all([
      api.get("/meter-readings"),
      api.get("/rooms"),
      api.get("/areas"),
    ]);
    setReadings(rRes.data);
    setRooms(rmRes.data);
    setAreas(aRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const roomsByArea = useMemo(() => {
    if (!areaId) return rooms;
    return rooms.filter((r) => String(r.area?.id) === areaId);
  }, [rooms, areaId]);

  const roomHistory = useMemo(() => {
    if (!selectedRoom) return [];
    return readings
      .filter((r) => r.room?.id === selectedRoom.id)
      .sort((a, b) =>
        a.year === b.year ? b.month - a.month : b.year - a.year,
      );
  }, [readings, selectedRoom]);

  const filteredReadings = useMemo(() => {
    if (!filterRoomId) return readings;
    return readings.filter((r) => String(r.room?.id) === filterRoomId);
  }, [readings, filterRoomId]);

  const roomsByFilterArea = useMemo(() => {
    if (!filterAreaId) return rooms;
    return rooms.filter((r) => String(r.area?.id) === filterAreaId);
  }, [rooms, filterAreaId]);

  useEffect(() => {
    if (!selectedRoom) return;
    setRoomId(String(selectedRoom.id));
    const now = new Date();
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    const latest = roomHistory[0];
    setOldElectric(latest ? String(latest.newElectric ?? 0) : "");
    setOldWater(latest ? String(latest.newWater ?? 0) : "");
    setNewElectric("");
    setNewWater("");
    setError("");
  }, [selectedRoom, roomHistory]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      setError("Vui lòng chọn phòng");
      return;
    }
    if (!month || !year) {
      setError("Vui lòng nhập tháng và năm");
      return;
    }
    const m = Number(month);
    const y = Number(year);
    if (!isMonthAllowed(m, y)) {
      setError("Chỉ được nhập chỉ số cho tháng hiện tại hoặc tháng trước đó.");
      return;
    }
    setError("");
    try {
      await api.post("/meter-readings", {
        room: { id: Number(roomId) },
        month: Number(month),
        year: Number(year),
        oldElectric: Number(oldElectric || 0),
        newElectric: Number(newElectric || 0),
        oldWater: Number(oldWater || 0),
        newWater: Number(newWater || 0),
      });
      notify("Lưu chỉ số thành công", "success");
      setRoomId("");
      setMonth("");
      setYear("");
      setOldElectric("");
      setNewElectric("");
      setOldWater("");
      setNewWater("");
      setSelectedRoom(null);
      load();
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const status = ax?.response?.status;
      const message =
        status === 403
          ? "Bạn không có quyền thao tác"
          : status === 400
            ? "Chỉ được nhập chỉ số cho tháng hiện tại hoặc tháng trước đó."
            : "Lưu chỉ số thất bại";
      setError(message);
      notify(message, "error");
    }
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Nhập chỉ số điện nước</h2>
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Chọn khu & phòng</h3>
              <p className="card-subtitle">Chọn khu để xem danh sách phòng</p>
            </div>
          </div>
          <div className="area-selector">
            <button
              className={`area-pill ${areaId === "" ? "active" : ""}`}
              onClick={() => setAreaId("")}
            >
              Tất cả
            </button>
            {areas.map((a) => (
              <button
                key={a.id}
                className={`area-pill ${String(a.id) === areaId ? "active" : ""}`}
                onClick={() => setAreaId(String(a.id))}
              >
                {a.name}
              </button>
            ))}
          </div>
          <div className="room-list">
            {roomsByArea.map((r) => (
              <button
                key={r.id}
                className={`room-row ${selectedRoom?.id === r.id ? "active" : ""}`}
                onClick={() => setSelectedRoom(r)}
              >
                <span>{r.code}</span>
                <span className="room-sub">Xem chỉ số</span>
              </button>
            ))}
            {roomsByArea.length === 0 && (
              <div className="room-empty">Không có phòng trong khu này.</div>
            )}
          </div>
        </div>

        {selectedRoom && (
          <div className="card meter-panel">
            <div className="card-header">
              <div>
                <h3>Phòng {selectedRoom.code}</h3>
                <p className="card-subtitle">
                  Xem lịch sử và nhập chỉ số tháng hiện tại
                </p>
              </div>
            </div>
            <div className="meter-grid">
              <div className="meter-history">
                <div className="chart-title">Các tháng trước</div>
                <div className="history-list">
                  {roomHistory.length === 0 && (
                    <div className="history-empty">Chưa có dữ liệu.</div>
                  )}
                  {roomHistory.map((r) => (
                    <div key={r.id} className="history-row">
                      <div className="history-title">
                        {r.month}/{r.year}
                      </div>
                      <div className="history-meta">
                        Điện: {r.oldElectric}-{r.newElectric} • Nước:{" "}
                        {r.oldWater}-{r.newWater}
                      </div>
                      <div className="history-total">
                        Tổng: {formatMoney(r.totalCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">Tháng</label>
                  <input
                    placeholder="Tháng"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Năm</label>
                  <input
                    placeholder="Năm"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số điện cũ</label>
                  <input
                    placeholder="Số điện cũ"
                    value={oldElectric}
                    onChange={(e) => setOldElectric(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số điện mới</label>
                  <input
                    placeholder="Số điện mới"
                    value={newElectric}
                    onChange={(e) => setNewElectric(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số nước cũ</label>
                  <input
                    placeholder="Số nước cũ"
                    value={oldWater}
                    onChange={(e) => setOldWater(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Số nước mới</label>
                  <input
                    placeholder="Số nước mới"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                  />
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                  <button className="btn" type="submit">
                    Lưu chỉ số
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div
            className="form-grid"
            style={{ marginBottom: 16, maxWidth: 400 }}
          >
            <div>
              <label className="field-label">Lọc theo khu</label>
              <select
                value={filterAreaId}
                onChange={(e) => {
                  setFilterAreaId(e.target.value);
                  setFilterRoomId("");
                }}
              >
                <option value="">Tất cả khu</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Lọc theo phòng</label>
              <select
                value={filterRoomId}
                onChange={(e) => setFilterRoomId(e.target.value)}
              >
                <option value="">Tất cả phòng</option>
                {roomsByFilterArea.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}
                    {r.area?.name ? ` (${r.area.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SimpleTable
            data={filteredReadings}
            columns={[
              { header: "ID", render: (r: MeterReading) => r.id },
              {
                header: "Phòng",
                render: (r: MeterReading) => r.room?.code ?? "—",
              },
              {
                header: "Tháng/Năm",
                render: (r: MeterReading) => `${r.month}/${r.year}`,
              },
              {
                header: "Điện (cũ → mới)",
                render: (r: MeterReading) =>
                  `${r.oldElectric} → ${r.newElectric}`,
              },
              {
                header: "Nước (cũ → mới)",
                render: (r: MeterReading) => `${r.oldWater} → ${r.newWater}`,
              },
              {
                header: "Tổng tiền",
                render: (r: MeterReading) => formatMoney(r.totalCost),
              },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
