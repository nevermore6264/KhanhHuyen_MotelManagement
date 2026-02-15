import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";

export type ContractForDocx = {
  id: number;
  room?: { code?: string };
  tenant?: {
    fullName?: string;
    phone?: string;
    idNumber?: string;
    address?: string;
  };
  startDate?: string;
  endDate?: string;
  deposit?: number;
  rent?: number;
};

function formatDateDMY(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMoney(n?: number | null): string {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(n))} VNĐ`;
}

export async function buildContractDocx(
  contract: ContractForDocx,
): Promise<Blob> {
  const soHD = String(contract.id || "").padStart(6, "0");
  const ngayKy =
    formatDateDMY(contract.startDate) ||
    formatDateDMY(new Date().toISOString().slice(0, 10));
  const tenant = contract.tenant;
  const roomCode = contract.room?.code || "—";
  const tienThue = formatMoney(contract.rent);
  const tienCoc = formatMoney(contract.deposit);
  const ngayBatDau = formatDateDMY(contract.startDate);
  const ngayKetThuc = formatDateDMY(contract.endDate);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Cộng hòa xã hội chủ nghĩa Việt Nam",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Độc lập – Tự do – Hạnh phúc",
                italics: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: "HỢP ĐỒNG THUÊ NHÀ TRỌ",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Số: ${soHD} / HD-TN`, size: 22 }),
              new TextRun({ text: "    ", size: 22 }),
              new TextRun({ text: `Ngày ${ngayKy}`, size: 22 }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Bên cho thuê (Bên A):",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "Ông/Bà: ………………………………………… (hoặc tên đơn vị quản lý nhà trọ)",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "Địa chỉ: …………………………………………………………………………",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: "Số điện thoại: ………………………………", size: 22 }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Bên thuê (Bên B):", bold: true, size: 22 }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Ông/Bà: ${tenant?.fullName ?? "—"}`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Số CCCD/CMND: ${tenant?.idNumber ?? "—"}`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Địa chỉ thường trú: ${tenant?.address ?? "—"}`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Số điện thoại: ${tenant?.phone ?? "—"}`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Hai bên thỏa thuận ký kết Hợp đồng thuê nhà trọ với các điều khoản sau:",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 1. Đối tượng cho thuê",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Bên A cho Bên B thuê phòng ở với mã phòng: ${roomCode}, tại địa chỉ nhà trọ do Bên A quản lý. Phòng đủ điều kiện ở, sử dụng đúng mục đích ở.`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 2. Thời hạn hợp đồng",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `Thời hạn thuê: Từ ngày ${ngayBatDau} đến hết ngày ${ngayKetThuc}. Hết hạn hai bên có thể gia hạn bằng văn bản.`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 3. Giá thuê và tiền cọc",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `3.1. Giá thuê phòng: ${tienThue}/tháng (đã bao gồm/hoặc chưa bao gồm điện, nước theo thỏa thuận).`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `3.2. Tiền cọc: ${tienCoc}. Tiền cọc được hoàn trả khi chấm dứt hợp đồng, sau khi trừ các khoản phát sinh (nếu có) theo quy định.`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 4. Phương thức thanh toán",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "Bên B thanh toán tiền thuê hàng tháng cho Bên A đúng hạn (trước ngày … hàng tháng hoặc theo thỏa thuận). Thanh toán bằng tiền mặt/chuyển khoản theo thông tin Bên A cung cấp.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 5. Quyền và nghĩa vụ các bên",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "5.1. Bên A: Bảo đảm phòng cho thuê đúng thỏa thuận; sửa chữa cơ sở vật chất chung khi cần; tạo điều kiện cho Bên B ổn định chỗ ở.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "5.2. Bên B: Thanh toán đủ, đúng hạn tiền thuê và các chi phí phát sinh; giữ gìn tài sản, vệ sinh chung; không tự ý chuyển nhượng, cho thuê lại; tuân thủ nội quy nhà trọ.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 6. Điều khoản chung",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: "Hai bên cam kết thực hiện đúng nội dung hợp đồng. Mọi tranh chấp ưu tiên giải quyết bằng thương lượng; không giải quyết được thì đưa ra cơ quan có thẩm quyền. Hợp đồng có hiệu lực từ ngày ký, làm thành 02 bản có giá trị như nhau.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Bên cho thuê (Bên A)",
                bold: true,
                italics: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", size: 20 })],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Bên thuê (Bên B)",
                bold: true,
                italics: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", size: 20 })],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
