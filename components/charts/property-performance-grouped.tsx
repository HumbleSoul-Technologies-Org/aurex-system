"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import { formatCurrency } from "@/lib/currency";

type Item = {
  property: string;
  occupancy: number;
  performance: number;
};

type Props = {
  data: Item[];
};

export default function PropertyPerformanceGrouped({ data }: Props) {
  const activeCurrency = useActiveCurrency();

  const prepared = useMemo(
    () =>
      data.map((d) => ({
        property: d.property,
        occupancy: d.occupancy,
        performanceRaw: d.performance,
      })),
    [data],
  );

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={prepared}
          margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
          <XAxis
            dataKey="property"
            stroke="var(--border)"
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
            stroke="var(--border)"
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => formatCurrency(value, activeCurrency)}
            stroke="var(--border)"
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "Performance") {
                return [formatCurrency(Number(value), activeCurrency), name];
              }
              return [`${value}%`, name];
            }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ color: "var(--muted-foreground)" }}
          />
          <Bar
            yAxisId="left"
            dataKey="occupancy"
            name="Occupancy"
            fill="#2563eb"
            barSize={18}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="performanceRaw"
            name="Performance"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
