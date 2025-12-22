"use client";

import type { DashboardPeriod } from "@/features/dashboard/model/use-dashboard-data";

type Props = {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  className?: string;
};

export function PeriodToggle({ value, onChange, className }: Props) {
  return (
    <div className={className ?? "flex gap-2"}>
      <button
        className={`rounded-xl px-3 py-2 border ${
          value === "current" ? "bg-black text-white" : ""
        }`}
        onClick={() => onChange("current")}
      >
        Этот месяц
      </button>
      <button
        className={`rounded-xl px-3 py-2 border ${
          value === "previous" ? "bg-black text-white" : ""
        }`}
        onClick={() => onChange("previous")}
      >
        Прошлый
      </button>
    </div>
  );
}
