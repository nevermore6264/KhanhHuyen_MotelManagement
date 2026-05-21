const CO_SO = "status-badge";

/** Phòng: trống / đang thuê / bảo trì */
export function classBadgePhong(value?: string): string {
  switch (value) {
    case "AVAILABLE":
      return `${CO_SO} badge--success`;
    case "OCCUPIED":
      return `${CO_SO} badge--info`;
    case "MAINTENANCE":
      return `${CO_SO} badge--warning`;
    default:
      return `${CO_SO} badge--neutral`;
  }
}

/** Hóa đơn: đã TT / một phần / chưa TT */
export function classBadgeHoaDon(value?: string): string {
  switch (value) {
    case "PAID":
      return `${CO_SO} badge--success`;
    case "PARTIAL":
      return `${CO_SO} badge--warning`;
    case "UNPAID":
      return `${CO_SO} badge--danger`;
    default:
      return `${CO_SO} badge--neutral`;
  }
}

/** Hợp đồng */
export function classBadgeHopDong(value?: string): string {
  switch (value) {
    case "ACTIVE":
      return `${CO_SO} badge--success`;
    case "ENDED":
      return `${CO_SO} badge--neutral`;
    case "TERMINATED":
      return `${CO_SO} badge--danger`;
    default:
      return `${CO_SO} badge--neutral`;
  }
}

/** Yêu cầu / hỗ trợ */
export function classBadgeYeuCau(value?: string): string {
  switch (value) {
    case "OPEN":
      return `${CO_SO} badge--info`;
    case "IN_PROGRESS":
      return `${CO_SO} badge--warning`;
    case "RESOLVED":
      return `${CO_SO} badge--success`;
    case "CLOSED":
      return `${CO_SO} badge--neutral`;
    default:
      return `${CO_SO} badge--neutral`;
  }
}

export function classBadgeNguoiDungActive(active: boolean): string {
  return active ? `${CO_SO} badge--success` : `${CO_SO} badge--neutral`;
}

export function classBadgeVaiTro(value?: string): string {
  switch (value) {
    case "ADMIN":
      return `${CO_SO} badge--purple`;
    case "STAFF":
      return `${CO_SO} badge--teal`;
    case "TENANT":
      return `${CO_SO} badge--info`;
    default:
      return `${CO_SO} badge--neutral`;
  }
}
