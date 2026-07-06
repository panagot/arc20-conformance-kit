import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { categoryLabel, type CategoryStat } from "../../lib/conformance-utils";

export function CategoryBreakdown({ data }: { data: CategoryStat[] }) {
  const chartData = data.map((item) => ({
    name: categoryLabel(item.category),
    pass: item.pass,
    fail: item.fail,
    warn: item.warn,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-[color:var(--muted)]">
        No category data
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 bg-[color:var(--pass)]" /> Pass
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 bg-[color:var(--warn)]" /> Warn
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 bg-[color:var(--fail)]" /> Fail
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barCategoryGap="18%">
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <Bar dataKey="pass" stackId="a" fill="var(--pass)" />
            <Bar dataKey="warn" stackId="a" fill="var(--warn)" />
            <Bar dataKey="fail" stackId="a" fill="var(--fail)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
