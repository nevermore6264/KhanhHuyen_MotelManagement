/**
 * Chuẩn hóa JSON từ Spring (phong, khachThue, thanhVien…) sang kiểu dùng trên UI.
 */

export type RoomHopDong = {
  id: number;
  code: string;
  currentPrice?: number;
  status?: string;
  khuVucId?: number;
};

export type TenantHopDong = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  email?: string;
};

export type ThanhVienHopDong = TenantHopDong & { laDaiDien?: boolean };

export type HopDongChuan = {
  id: number;
  room?: RoomHopDong;
  tenant?: TenantHopDong;
  coThue?: ThanhVienHopDong[];
  startDate?: string;
  endDate?: string;
  status?: string;
  deposit?: number;
  rent?: number;
};

type RawPhong = Record<string, unknown>;

export function chuanHoaPhongTuApiHopDong(r: RawPhong): RoomHopDong {
  const khu = r.khuVuc as { id?: number } | undefined;
  const gia = r.giaHienTai ?? r.currentPrice;
  const giaSo =
    typeof gia === "number"
      ? gia
      : gia != null
        ? Number(gia)
        : undefined;
  return {
    id: Number(r.id),
    code: String(r.code ?? r.maPhong ?? ""),
    currentPrice: Number.isFinite(giaSo) ? giaSo : undefined,
    status: String(r.status ?? r.trangThai ?? ""),
    khuVucId: khu?.id != null ? Number(khu.id) : undefined,
  };
}

export function chuanHoaKhachThueTuApi(
  raw: Record<string, unknown> | undefined | null,
): TenantHopDong | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    id: Number(raw.id),
    fullName: String(raw.fullName ?? raw.hoTen ?? ""),
    phone:
      raw.phone != null
        ? String(raw.phone)
        : raw.soDienThoai != null
          ? String(raw.soDienThoai)
          : undefined,
    idNumber:
      raw.idNumber != null
        ? String(raw.idNumber)
        : raw.soGiayTo != null
          ? String(raw.soGiayTo)
          : undefined,
    address:
      raw.address != null
        ? String(raw.address)
        : raw.diaChi != null
          ? String(raw.diaChi)
          : undefined,
    email: raw.email != null ? String(raw.email) : undefined,
  };
}

function formatNgayApi(d: unknown): string | undefined {
  if (d == null) return undefined;
  if (typeof d === "string") return d.length >= 10 ? d.slice(0, 10) : d;
  return undefined;
}

export function chuanHoaHopDongTuApi(raw: Record<string, unknown>): HopDongChuan {
  const phong = raw.phong as RawPhong | undefined;
  const room = phong ? chuanHoaPhongTuApiHopDong(phong) : undefined;
  const tenant = chuanHoaKhachThueTuApi(
    raw.khachThue as Record<string, unknown> | undefined,
  );
  const tvList = (raw.thanhVien as Record<string, unknown>[] | undefined) ?? [];
  let coThue: ThanhVienHopDong[] = tvList
    .map((tv) => {
      const k = chuanHoaKhachThueTuApi(
        tv.khachThue as Record<string, unknown> | undefined,
      );
      if (!k) return null;
      return { ...k, laDaiDien: Boolean(tv.laDaiDien) };
    })
    .filter((x): x is ThanhVienHopDong => x != null);
  if (coThue.length === 0 && tenant) {
    coThue = [{ ...tenant, laDaiDien: true }];
  }
  return {
    id: Number(raw.id),
    room,
    tenant,
    coThue,
    startDate: formatNgayApi(raw.ngayBatDau ?? raw.startDate),
    endDate: formatNgayApi(raw.ngayKetThuc ?? raw.endDate),
    status: String(raw.trangThai ?? raw.status ?? ""),
    deposit:
      raw.tienCoc != null
        ? Number(raw.tienCoc)
        : raw.deposit != null
          ? Number(raw.deposit)
          : undefined,
    rent:
      raw.tienThue != null
        ? Number(raw.tienThue)
        : raw.rent != null
          ? Number(raw.rent)
          : undefined,
  };
}

export function chuanHoaDanhSachHopDongTuApi(
  data: unknown,
): HopDongChuan[] {
  if (!Array.isArray(data)) return [];
  return data.map((x) =>
    chuanHoaHopDongTuApi(x as Record<string, unknown>),
  );
}
