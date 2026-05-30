"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

type Props = {
  maintenanceRequests: Array<{
    id: string;
    createdDate: Date | string;
    status: string;
    cost?: number;
  }>;
};

export default function MaintenanceTrendsLine({ maintenanceRequests }: Props) {
  const data = useMemo(() => {
    // Build monthly counts and identify trend
    const monthMap: Record<string, number> = {};
    const monthCostMap: Record<string, number> = {};

    maintenanceRequests.forEach((req) => {
      const d = new Date(req.createdDate);
      if (isNaN(d.getTime())) return;

      const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      monthCostMap[monthKey] = (monthCostMap[monthKey] || 0) + (req.cost || 0);
    });

    if (Object.keys(monthMap).length === 0) {
      return [];
    }

    // Sort keys and create data array
    const sortedKeys = Object.keys(monthMap).sort();
    const chartData = sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const label = new Date(`${year}-${month}-01`).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      return {
        month: label,
        requests: monthMap[key],
        cost: Math.round(monthCostMap[key]),
      };
    });

    return chartData;
  }, [maintenanceRequests]);

  const averageRequests = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + d.requests, 0);
    return Math.round(sum / data.length);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 12,
            color: "var(--foreground)",
          }}
        >
          <p className="font-semibold">{payload[0].payload.month}</p>
          <p className="text-sm text-muted-foreground">
            Requests: {payload[0].value}
          </p>
          {payload[0].payload.cost > 0 && (
            <p className="text-sm text-muted-foreground">
              Cost: ${payload[0].payload.cost.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        <div className="text-center">
          <p>No maintenance trends available</p>
          <p className="text-sm">Create maintenance requests to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Average Monthly Requests
          </p>
          <p className="text-2xl font-bold text-foreground">
            {averageRequests}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Requests
          </p>
          <p className="text-2xl font-bold text-foreground">
            {maintenanceRequests.length}
          </p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
            <ReferenceLine
              y={averageRequests}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{
                value: "Average",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#3b82f6"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
