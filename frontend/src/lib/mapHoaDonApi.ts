/**
 * Chuẩn hóa JSON hóa đơn từ Spring (phong, khachThue, thang, nam, trangThai, …)
 * sang shape dùng trên UI (room, tenant, month, year, status, …).
 */

export type RawJson = Record<string, unknown>;

export type Room = { id: number; code: string };

export type Tenant = {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  idNumber?: string;
};

export type InvoiceLineItem = {
  id?: string;
  tenKhoan: string;
  soTien: number;
};

export type Invoice = {
  id: string;
  room?: Room;
  tenant?: Tenant;
  tenants?: Tenant[];
  month: number;
  year: number;
  roomCost?: number;
  electricityCost?: number;
  waterCost?: number;
  /** Chỉ số công tơ cùng kỳ (nếu có bản ghi chỉ số). */
  electricOld?: number;
  electricNew?: number;
  waterOld?: number;
  waterNew?: number;
  /** Các khoản phụ (giữ xe, wifi, …) */
  lineItems?: InvoiceLineItem[];
  total?: number;
  status?: string;
  lastReminderEmailAt?: string | null;
  reminderEmailCount?: number;
  lastReminderEmailMessage?: string | null;
};

function soTienTuApi(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function soNguyenTuApi(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/** Jackson có thể trả LocalDateTime dạng chuỗi ISO hoặc mảng [y,M,d,h,m,s]. */
function ngayRaChuoiIso(v: unknown): string | null | undefined {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const y = Number(v[0]);
    const M = Number(v[1]) || 1;
    const d = Number(v[2]) || 1;
    const h = Number(v[3]) || 0;
    const m = Number(v[4]) || 0;
    const s = Number(v[5]) || 0;
    if (!y) return undefined;
    return new Date(y, M - 1, d, h, m, s).toISOString();
  }
  return undefined;
}

export function chuanHoaPhongTuApi(raw: RawJson): Room {
  return {
    id: Number(raw.id),
    code: String(raw.maPhong ?? raw.ma_phong ?? raw.code ?? "").trim(),
  };
}

export function chuanHoaKhachThueTuApi(raw: RawJson): Tenant {
  return {
    id: Number(raw.id),
    fullName: String(raw.hoTen ?? raw.fullName ?? "").trim(),
    email: raw.email != null ? String(raw.email) : undefined,
    phone:
      raw.soDienThoai != null
        ? String(raw.soDienThoai)
        : raw.phone != null
          ? String(raw.phone)
          : undefined,
    idNumber:
      raw.soGiayTo != null
        ? String(raw.soGiayTo)
        : raw.idNumber != null
          ? String(raw.idNumber)
          : undefined,
  };
}

export function mapHoaDonFromApi(raw: RawJson): Invoice {
  const phongRaw = raw.phong ?? raw.room;
  const khachRaw = raw.khachThue ?? raw.tenant;
  const dsKhachRaw = raw.danhSachKhachThue;
  const tt = raw.trangThai ?? raw.status;
  let status = "";
  if (typeof tt === "string") status = tt;
  else if (tt && typeof tt === "object" && "name" in tt) {
    status = String((tt as { name?: string }).name ?? "");
  } else if (tt != null) status = String(tt);

  let tenants: Tenant[] | undefined;
  if (Array.isArray(dsKhachRaw)) {
    tenants = dsKhachRaw
      .filter((x) => x && typeof x === "object")
      .map((x) => chuanHoaKhachThueTuApi(x as RawJson));
    if (tenants.length === 0) tenants = undefined;
  }

  const chiTietRaw = raw.chiTiet;
  let lineItems: InvoiceLineItem[] | undefined;
  if (Array.isArray(chiTietRaw)) {
    const mapped = chiTietRaw
      .filter((x) => x && typeof x === "object")
      .map((x) => {
        const o = x as RawJson;
        return {
          id: o.id != null ? String(o.id) : undefined,
          tenKhoan: String(o.tenKhoan ?? "").trim(),
          soTien: soTienTuApi(o.soTien) ?? 0,
        };
      });
    if (mapped.length > 0) lineItems = mapped;
  }

  return {
    id: raw.id != null ? String(raw.id) : "",
    room:
      phongRaw && typeof phongRaw === "object"
        ? chuanHoaPhongTuApi(phongRaw as RawJson)
        : undefined,
    tenant:
      khachRaw && typeof khachRaw === "object"
        ? chuanHoaKhachThueTuApi(khachRaw as RawJson)
        : undefined,
    tenants,
    month: Number(raw.thang ?? raw.month ?? 0),
    year: Number(raw.nam ?? raw.year ?? 0),
    roomCost: soTienTuApi(raw.tienPhong ?? raw.roomCost),
    electricityCost: soTienTuApi(raw.tienDien ?? raw.electricityCost),
    waterCost: soTienTuApi(raw.tienNuoc ?? raw.waterCost),
    electricOld: soNguyenTuApi(raw.chiSoDienCu),
    electricNew: soNguyenTuApi(raw.chiSoDienMoi),
    waterOld: soNguyenTuApi(raw.chiSoNuocCu),
    waterNew: soNguyenTuApi(raw.chiSoNuocMoi),
    lineItems,
    total: soTienTuApi(raw.tongTien ?? raw.total),
    status: status || undefined,
    lastReminderEmailAt: (() => {
      const iso = ngayRaChuoiIso(raw.nhacNoEmailLanCuoi);
      if (iso) return iso;
      if (raw.lastReminderEmailAt != null)
        return String(raw.lastReminderEmailAt);
      return null;
    })(),
    reminderEmailCount: Number(
      raw.soLanNhacNoEmail ?? raw.reminderEmailCount ?? 0,
    ),
    lastReminderEmailMessage:
      raw.noiDungEmailCuoi != null
        ? String(raw.noiDungEmailCuoi)
        : raw.lastReminderEmailMessage != null
          ? String(raw.lastReminderEmailMessage)
          : null,
  };
}

/** Khách hiển thị: ưu tiên danh sách hợp đồng, không thì khách trên hóa đơn. */
export function khachCuaHoaDon(i: Invoice): Tenant[] {
  if (i.tenants && i.tenants.length > 0) return i.tenants;
  if (i.tenant) return [i.tenant];
  return [];
}
