"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import { IconEye, IconCheck, IconSend, IconTimes } from "@/components/Icons";
import api from "@/lib/api";
import { useToast } from "@/components/NhaCungCapToast";
import { chuanHoaYeuCau, type YeuCauHang } from "@/lib/chuanHoaYeuCau";

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
  const [danhSach, setDanhSach] = useState<YeuCauHang[]>([]);
  const [idDangChon, setIdDangChon] = useState("");
  const [trangThai, setTrangThai] = useState("OPEN");
  const [chiTiet, setChiTiet] = useState<YeuCauHang | null>(null);
  const { notify } = useToast();

  const tai = async () => {
    try {
      const phanHoi = await api.get("/yeu-cau-ho-tro");
      const duLieu = Array.isArray(phanHoi.data) ? phanHoi.data : [];
      setDanhSach(duLieu.map(chuanHoaYeuCau));
    } catch {
      setDanhSach([]);
      notify("Không tải được danh sách yêu cầu.", "error");
    }
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
        trangThai,
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

  const danhDauDaXuLy = async (yeuCau: YeuCauHang) => {
    await api.put(`/yeu-cau-ho-tro/${yeuCau.id}`, {
      trangThai: "RESOLVED",
      tieuDe: yeuCau.tieuDe,
      moTa: yeuCau.moTa,
    });
    notify("Đã cập nhật trạng thái xử lý", "success");
    tai();
  };

  const guiEmail = (yeuCau: YeuCauHang) => {
    const email = yeuCau.khachEmail;
    if (!email) {
      notify("Thiếu email khách thuê", "error");
      return;
    }
    const subject = `Phản hồi sự cố #${yeuCau.id}`;
    const body =
      `Xin chào ${yeuCau.khachTen || ""},%0D%0A%0D%0A` +
      `Chúng tôi đã tiếp nhận sự cố: ${yeuCau.tieuDe}.%0D%0A` +
      `Mô tả: ${yeuCau.moTa || ""}%0D%0A%0D%0A` +
      `Hướng xử lý: ...%0D%0A%0D%0ATrân trọng.`;
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>Yêu cầu hỗ trợ</h2>
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
              { header: "Tiêu đề", render: (r) => r.tieuDe },
              { header: "Khách", render: (r) => r.khachTen ?? "—" },
              { header: "Phòng", render: (r) => r.maPhong ?? "—" },
              {
                header: "Trạng thái",
                render: (r) => (
                  <span className={`status-badge ${statusClass(r.trangThai)}`}>
                    {statusLabel(r.trangThai)}
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
                      className={`btn btn-secondary ${!r.khachEmail ? "btn-disabled" : ""}`}
                      onClick={() => guiEmail(r)}
                      aria-disabled={!r.khachEmail}
                      title={
                        !r.khachEmail ? "Thiếu email khách thuê" : undefined
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
                <strong>{chiTiet.tieuDe}</strong>
              </p>
              <p>{chiTiet.moTa || "Không có mô tả."}</p>
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
