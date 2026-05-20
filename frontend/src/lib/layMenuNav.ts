import type { Dict } from "@/lib/i18n";

export type MucMenu = { label: string; href: string };
export type NhomMenu = { label: string; href?: string; items?: MucMenu[] };

export function layMenuNav(vaiTro: string, m: Dict["menu"]): NhomMenu[] {
  switch (vaiTro) {
    case "ADMIN":
      return [
        { label: m.overview, href: "/tong-quan" },
        {
          label: m.motel,
          items: [
            { href: "/khu-vuc", label: m.areas },
            { href: "/phong", label: m.rooms },
            { href: "/khach-thue", label: m.tenants },
            { href: "/hop-dong", label: m.contracts },
            { href: "/nguoi-dung", label: m.users },
          ],
        },
        {
          label: m.finance,
          items: [
            { href: "/bang-gia-dich-vu", label: m.pricing },
            { href: "/chi-so-dien-nuoc", label: m.utilities },
            { href: "/hoa-don", label: m.invoices },
            { href: "/thanh-toan", label: m.payments },
            { href: "/bao-cao", label: m.reports },
          ],
        },
        {
          label: m.support,
          items: [
            { href: "/yeu-cau-ho-tro", label: m.requests },
            { href: "/thong-bao", label: m.notifications },
            { href: "/tin-nhan", label: m.messages },
          ],
        },
      ];
    case "STAFF":
      return [
        { label: m.overview, href: "/tong-quan" },
        {
          label: m.motel,
          items: [
            { href: "/phong", label: m.rooms },
            { href: "/hop-dong", label: m.contracts },
          ],
        },
        {
          label: m.finance,
          items: [
            { href: "/chi-so-dien-nuoc", label: m.utilities },
            { href: "/hoa-don", label: m.invoices },
            { href: "/thanh-toan", label: m.payments },
            { href: "/bao-cao", label: m.reports },
          ],
        },
        {
          label: m.support,
          items: [
            { href: "/yeu-cau-ho-tro", label: m.requests },
            { href: "/thong-bao", label: m.notifications },
            { href: "/tin-nhan", label: m.messages },
          ],
        },
      ];
    case "TENANT":
      return [
        { label: m.overview, href: "/tong-quan" },
        {
          label: m.account,
          items: [
            { href: "/hop-dong-cua-toi", label: m.myContracts },
            { href: "/hoa-don-cua-toi", label: m.myInvoices },
            { href: "/thanh-toan-cua-toi", label: m.myPayments },
            { href: "/tai-khoan", label: m.myProfile },
          ],
        },
        {
          label: m.support,
          items: [
            { href: "/yeu-cau", label: m.requests },
            { href: "/thong-bao", label: m.notifications },
            { href: "/tin-nhan", label: m.messages },
          ],
        },
      ];
    default:
      return [];
  }
}
