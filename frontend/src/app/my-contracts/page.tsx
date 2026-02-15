"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";

type Contract = {
  id: number;
  room?: { code: string };
  startDate?: string;
  endDate?: string;
  status?: string;
};

const contractStatusLabel = (value?: string) => {
  switch (value) {
    case "ACTIVE":
      return "Đang hiệu lực";
    case "ENDED":
      return "Đã kết thúc";
    case "TERMINATED":
      return "Đã hủy";
    default:
      return value || "-";
  }
};
const contractStatusBadge = (value?: string) => {
  switch (value) {
    case "ACTIVE":
      return "status-available";
    case "ENDED":
      return "status-maintenance";
    case "TERMINATED":
      return "status-occupied";
    default:
      return "status-unknown";
  }
};

const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function MyContractsPage() {
  const [items, setItems] = useState<Contract[]>([]);

  useEffect(() => {
    api.get("/contracts/me").then((res) => setItems(res.data));
  }, []);

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hợp đồng của tôi</h2>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (c) => c.id },
              { header: "Phòng", render: (c) => c.room?.code },
              { header: "Bắt đầu", render: (c) => formatDateDMY(c.startDate) },
              { header: "Kết thúc", render: (c) => formatDateDMY(c.endDate) },
              {
                header: "Trạng thái",
                render: (c) => (
                  <span
                    className={`status-badge ${contractStatusBadge(c.status)}`}
                  >
                    {contractStatusLabel(c.status)}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
