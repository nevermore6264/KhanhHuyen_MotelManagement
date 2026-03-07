"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconEye, IconCheck, IconSend, IconTimes } from "@/components/Icons";
import api from "@/lib/api";
import { useToast } from "@/components/NhaCungCapToast";

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

export default function TrangYeuCauHoTro() {
  const [danhSach, setDanhSach] = useState<SupportRequest[]>([]);
  const [idDangChon, setIdDangChon] = useState("");
  const [trangThai, setTrangThai] = useState("OPEN");
  const [chiTiet, setChiTiet] = useState<SupportRequest | null>(null);
  const { notify } = useToast();

  const tai = async () => {
    const phanHoi = await api.get("/yeu-cau-ho-tro");
    setDanhSach(phanHoi.data);
  };

  useEffect(() => {
    tai();
  }, []);

  const capNhatTrangThai = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDangChon?.trim()) {
      notify("Vui lòng nhập ID yêu cầu", "error");
      return;
    }
    try {
      await api.put(`/yeu-cau-ho-tro/${idDangChon.trim()}`, {
        status: trangThai,
      });
      notify("Đã cập nhật trạng thái", "success");
      setIdDangChon("");
      setTrangThai("OPEN");
      tai();
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const thongBao =
        ax?.response?.status === 404
          ? "Không tìm thấy yêu cầu với ID này"
          : "Cập nhật thất bại";
      notify(thongBao, "error");
    }
  };

  const danhDauDaXuLy = async (yeuCau: SupportRequest) => {
    await api.put(`/yeu-cau-ho-tro/${yeuCau.id}`, {
      status: "RESOLVED",
      title: yeuCau.title,
      description: yeuCau.description,
    });
    notify("Đã cập nhật trạng thái xử lý", "success");
    tai();
  };

  const guiEmail = (yeuCau: SupportRequest) => {
    const email = yeuCau.tenant?.email;
    if (!email) {
      notify("Thiếu email khách thuê", "error");
      return;
    }
    const subject = `Phản hồi sự cố #${yeuCau.id}`;
    const body =
      `Xin chào ${yeuCau.tenant?.fullName || ""},%0D%0A%0D%0A` +
      `Chúng tôi đã tiếp nhận sự cố: ${yeuCau.title}.%0D%0A` +
      `Mô tả: ${yeuCau.description || ""}%0D%0A%0D%0A` +
      `Hướng xử lý: ...%0D%0A%0D%0ATrân trọng.`;
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Quản lý sự cố</h2>
        <div className="card">
          <form onSubmit={capNhatTrangThai} className="grid grid-3">
            <input
              placeholder="ID yêu cầu"
              value={idDangChon}
              onChange={(e) => setIdDangChon(e.target.value)}
            />
            <select
              value={trangThai}
              onChange={(e) => setTrangThai(e.target.value)}
            >
              <option value="OPEN">Mới</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <button className="btn" type="submit">
              <IconCheck /> Cập nhật
            </button>
          </form>
        </div>
        <div className="card">
          <BangDonGian
            data={danhSach}
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
                    <button className="btn" onClick={() => setChiTiet(r)}>
                      <IconEye /> Xem mô tả
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => danhDauDaXuLy(r)}
                    >
                      <IconCheck /> Đã xử lý
                    </button>
                    <button
                      className={`btn btn-secondary ${!r.tenant?.email ? "btn-disabled" : ""}`}
                      onClick={() => guiEmail(r)}
                      aria-disabled={!r.tenant?.email}
                      title={
                        !r.tenant?.email ? "Thiếu email khách thuê" : undefined
                      }
                    >
                      <IconSend /> Gửi mail
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {chiTiet && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Mô tả sự cố</h3>
              <p>
                <strong>{chiTiet.title}</strong>
              </p>
              <p>{chiTiet.description || "Không có mô tả."}</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setChiTiet(null)}
                >
                  <IconTimes /> Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
