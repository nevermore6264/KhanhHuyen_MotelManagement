"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type SupportRequest = {
  id: number;
  title: string;
  description?: string;
  status: string;
  tenant?: { fullName: string; email?: string };
  room?: { code: string };
};

const statusLabel = (value?: string) => {
  switch (value) {
    case "OPEN":
      return "Mới";
    case "IN_PROGRESS":
      return "Đang xử lý";
    case "RESOLVED":
      return "Đã xử lý";
    case "CLOSED":
      return "Đã đóng";
    default:
      return value || "-";
  }
};

const statusClass = (value?: string) => {
  switch (value) {
    case "OPEN":
      return "status-occupied";
    case "IN_PROGRESS":
      return "status-maintenance";
    case "RESOLVED":
      return "status-available";
    case "CLOSED":
      return "status-unknown";
    default:
      return "status-unknown";
  }
};

export default function SupportRequestsPage() {
  const [items, setItems] = useState<SupportRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [detail, setDetail] = useState<SupportRequest | null>(null);
  const { notify } = useToast();

  const load = async () => {
    const res = await api.get("/support-requests");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    await api.put(`/support-requests/${selectedId}`, { status });
    setSelectedId("");
    setStatus("OPEN");
    load();
  };

  const markResolved = async (req: SupportRequest) => {
    await api.put(`/support-requests/${req.id}`, {
      status: "RESOLVED",
      title: req.title,
      description: req.description,
    });
    notify("Đã cập nhật trạng thái xử lý", "success");
    load();
  };

  const sendMail = (req: SupportRequest) => {
    const email = req.tenant?.email;
    if (!email) {
      notify("Thiếu email khách thuê", "error");
      return;
    }
    const subject = `Phản hồi sự cố #${req.id}`;
    const body =
      `Xin chào ${req.tenant?.fullName || ""},%0D%0A%0D%0A` +
      `Chúng tôi đã tiếp nhận sự cố: ${req.title}.%0D%0A` +
      `Mô tả: ${req.description || ""}%0D%0A%0D%0A` +
      `Hướng xử lý: ...%0D%0A%0D%0ATrân trọng.`;
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý sự cố</h2>
        <div className="card">
          <form onSubmit={updateStatus} className="grid grid-3">
            <input
              placeholder="ID yêu cầu"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">Mới</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <button className="btn" type="submit">
              Cập nhật
            </button>
          </form>
        </div>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (r) => r.id },
              { header: "Tiêu đề", render: (r) => r.title },
              { header: "Khách", render: (r) => r.tenant?.fullName },
              { header: "Phòng", render: (r) => r.room?.code },
              {
                header: "Trạng thái",
                render: (r) => (
                  <span className={`status-badge ${statusClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                ),
              },
              {
                header: "Thao tác",
                render: (r) => (
                  <div className="table-actions">
                    <button className="btn" onClick={() => setDetail(r)}>
                      Xem mô tả
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => markResolved(r)}
                    >
                      Đã xử lý
                    </button>
                    <button
                      className={`btn btn-secondary ${!r.tenant?.email ? "btn-disabled" : ""}`}
                      onClick={() => sendMail(r)}
                      aria-disabled={!r.tenant?.email}
                      title={
                        !r.tenant?.email ? "Thiếu email khách thuê" : undefined
                      }
                    >
                      Gửi mail
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {detail && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Mô tả sự cố</h3>
              <p>
                <strong>{detail.title}</strong>
              </p>
              <p>{detail.description || "Không có mô tả."}</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDetail(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
