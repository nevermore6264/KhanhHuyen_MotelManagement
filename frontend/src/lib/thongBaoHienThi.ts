import type { ThongBaoUi } from "@/lib/mapThongBaoApi";

export type BoLocThongBao = "all" | "unread" | "read";

export function dinhDangThoiGian(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function thoiGianTuongDoi(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const phut = Math.floor(diff / 60000);
  if (phut < 1) return "Vừa xong";
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.floor(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  const ngay = Math.floor(gio / 24);
  if (ngay === 1) return "Hôm qua";
  if (ngay < 7) return `${ngay} ngày trước`;
  return dinhDangThoiGian(iso);
}

function cungNgay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function nhanNhomNgay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Khác";
  const homNay = new Date();
  if (cungNgay(d, homNay)) return "Hôm nay";
  const homQua = new Date();
  homQua.setDate(homQua.getDate() - 1);
  if (cungNgay(d, homQua)) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function locThongBao(ds: ThongBaoUi[], boLoc: BoLocThongBao): ThongBaoUi[] {
  if (boLoc === "unread") return ds.filter((n) => !n.readFlag);
  if (boLoc === "read") return ds.filter((n) => n.readFlag);
  return ds;
}

export function nhomTheoNgay(ds: ThongBaoUi[]): { nhan: string; items: ThongBaoUi[] }[] {
  const map = new Map<string, ThongBaoUi[]>();
  const thuTu: string[] = [];
  for (const item of ds) {
    const nhan = nhanNhomNgay(item.sentAt);
    if (!map.has(nhan)) {
      map.set(nhan, []);
      thuTu.push(nhan);
    }
    map.get(nhan)!.push(item);
  }
  return thuTu.map((nhan) => ({ nhan, items: map.get(nhan)! }));
}
