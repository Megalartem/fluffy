"use client";

export function Sparkline({
  values,
  height = 44,
}: {
  values: number[];
  height?: number;
}) {
  const width = 220;
  const max = Math.max(...values, 0);

  // если всё нули — рисуем плоскую линию
  const points = values.map((v, i) => {
    const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * width;
    const y = max === 0 ? height / 2 : height - (v / max) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}
