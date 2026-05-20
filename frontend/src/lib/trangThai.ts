import type { Dict } from "./i18n";

export function nhanTrangThaiHopDong(t: Dict, value?: string): string {
  switch (value) {
    case "ACTIVE":
      return t.status.contract.ACTIVE;
    case "ENDED":
      return t.status.contract.ENDED;
    case "TERMINATED":
      return t.status.contract.TERMINATED;
    default:
      return value || "—";
  }
}

export function nhanPhuongThucThanhToan(t: Dict, value?: string): string {
  switch (value) {
    case "CASH":
      return t.status.payment.CASH;
    case "TRANSFER":
      return t.status.payment.TRANSFER;
    default:
      return value || "—";
  }
}

export function nhanVaiTro(t: Dict, value?: string): string {
  switch (value) {
    case "ADMIN":
      return t.roles.ADMIN;
    case "STAFF":
      return t.roles.STAFF;
    case "TENANT":
      return t.roles.TENANT;
    default:
      return value || "—";
  }
}

export function nhanTrangThaiPhong(t: Dict, value?: string): string {
  switch (value) {
    case "AVAILABLE":
      return t.status.room.AVAILABLE;
    case "OCCUPIED":
      return t.status.room.OCCUPIED;
    case "MAINTENANCE":
      return t.status.room.MAINTENANCE;
    default:
      return value || "—";
  }
}

export function nhanTrangThaiYeuCau(t: Dict, value?: string): string {
  switch (value) {
    case "OPEN":
      return t.status.request.OPEN;
    case "IN_PROGRESS":
      return t.status.request.IN_PROGRESS;
    case "RESOLVED":
      return t.status.request.RESOLVED;
    case "CLOSED":
      return t.status.request.CLOSED;
    default:
      return value || "—";
  }
}

export function nhanTrangThaiHoaDon(t: Dict, value?: string): string {
  switch (value) {
    case "UNPAID":
      return t.status.invoice.UNPAID;
    case "PARTIAL":
      return t.status.invoice.PARTIAL;
    case "PAID":
      return t.status.invoice.PAID;
    default:
      return value || "—";
  }
}
