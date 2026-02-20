"use client";

type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

export default function SimpleTable<T>({
  columns,
  data,
  className,
}: {
  columns: Column<T>[];
  data: T[];
  className?: string;
}) {
  return (
    <div className={`table-wrap ${className ?? ""}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col, cIdx) => (
                <td key={cIdx}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
