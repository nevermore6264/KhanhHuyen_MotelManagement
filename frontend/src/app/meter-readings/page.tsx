"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";

type Area = { id: number; name: string };
type Room = { id: number; code: string };
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

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }
    setRoomId(String(selectedRoom.id));
    const now = new Date();
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    const roomReadings = readings
      .filter((r) => r.room?.id === selectedRoom.id)
      .sort((a, b) =>
        a.year === b.year ? b.month - a.month : b.year - a.year,
      );
    const latest = roomReadings[0];
    setOldElectric(latest ? String(latest.newElectric ?? 0) : "");
    setOldWater(latest ? String(latest.newWater ?? 0) : "");
    setNewElectric("");
    setNewWater("");
    setError("");
  }, [selectedRoom, readings]);

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
    setError("");
    await api.post("/meter-readings", {
      room: roomId ? { id: Number(roomId) } : null,
      month: Number(month),
      year: Number(year),
      oldElectric: Number(oldElectric || 0),
      newElectric: Number(newElectric || 0),
      oldWater: Number(oldWater || 0),
      newWater: Number(newWater || 0),
    });
    setRoomId("");
    setMonth("");
    setYear("");
    setOldElectric("");
    setNewElectric("");
    setOldWater("");
    setNewWater("");
    setSelectedRoom(null);
    load();
  };

  const roomsByArea = useMemo(() => {
    if (!areaId) return rooms;
    return rooms.filter((r: any) => String(r.area?.id) === areaId);
  }, [rooms, areaId]);

  const roomHistory = useMemo(() => {
    if (!selectedRoom) return [];
    return readings
      .filter((r) => r.room?.id === selectedRoom.id)
      .sort((a, b) =>
        a.year === b.year ? b.month - a.month : b.year - a.year,
      );
  }, [readings, selectedRoom]);

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
                        Tổng: {r.totalCost ?? 0}
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
          <SimpleTable
            data={readings}
            columns={[
              { header: "ID", render: (r) => r.id },
              { header: "Phòng", render: (r) => r.room?.code },
              { header: "Tháng/Năm", render: (r) => `${r.month}/${r.year}` },
              {
                header: "Điện",
                render: (r) => `${r.oldElectric}-${r.newElectric}`,
              },
              { header: "Nước", render: (r) => `${r.oldWater}-${r.newWater}` },
              { header: "Tổng", render: (r) => r.totalCost },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
