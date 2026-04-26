"use client";

/** Định nghĩa cột: tiêu đề (header) và hàm render ô (dòng) */
type Cot<T> = {
  header: string;
  render: (dong: T) => React.ReactNode;
};

/** Bảng dữ liệu đơn giản: nhận mảng cột và mảng dữ liệu, render thead + tbody. */
export default function BangDonGian<T>({
  columns: danhSachCot,
  data: duLieu,
  className: lopCss,
}: {
  columns: Cot<T>[];
  data: T[];
  className?: string;
}) {
  const cotHienThi = danhSachCot.filter(
    (cot) => cot.header.trim().toLowerCase() !== "id"
  );

  return (
    <div className={`table-wrap ${lopCss ?? ""}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {cotHienThi.map((cot, idx) => (
              <th key={idx}>{cot.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {duLieu.map((dong, idx) => (
            <tr key={idx}>
              {cotHienThi.map((cot, cIdx) => (
                <td key={cIdx}>{cot.render(dong)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
