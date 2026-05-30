"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/currency";

type Props = {
  maintenanceRequests: Array<{
    id: string;
    propertyId?: string;
    propertyName?: string;
    cost?: number;
  }>;
  properties: Array<{
    id: string;
    name: string;
  }>;
  activeCurrency?: string;
};

const COST_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function MaintenanceCostBar({
  maintenanceRequests,
  properties,
  activeCurrency = "USD",
}: Props) {
  const data = useMemo(() => {
    // Group maintenance costs by property
    const costByProperty: Record<string, { cost: number; count: number }> = {};

    maintenanceRequests.forEach((req) => {
      const propId = req.propertyId || "unknown";
      const propName = req.propertyName || "Unknown Property";

      if (!costByProperty[propId]) {
        costByProperty[propId] = { cost: 0, count: 0 };
      }

      costByProperty[propId].cost += req.cost || 0;
      costByProperty[propId].count += 1;
    });

    // Build chart data
    const chartData = Object.entries(costByProperty).map(
      ([propId, info], idx) => ({
        propertyId: propId,
        property:
          properties.find((p) => p.id === propId)?.name ||
          `Property ${idx + 1}`,
        cost: Math.round(info.cost),
        count: info.count,
        fill: COST_COLORS[idx % COST_COLORS.length],
      }),
    );

    // Sort by cost descending
    return chartData.sort((a, b) => b.cost - a.cost);
  }, [maintenanceRequests, properties]);

  const totalCost = useMemo(() => {
    return data.reduce((sum, item) => sum + item.cost, 0);
  }, [data]);

  const averageCostPerRequest = useMemo(() => {
    const totalRequests = maintenanceRequests.length;
    return totalRequests > 0 ? Math.round(totalCost / totalRequests) : 0;
  }, [totalCost, maintenanceRequests.length]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { property, cost, count } = payload[0].payload;
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
          <p className="font-semibold">{property}</p>
          <p className="text-sm text-muted-foreground">
            Total Cost: {formatCurrency(cost, activeCurrency)}
          </p>
          <p className="text-sm text-muted-foreground">Requests: {count}</p>
          <p className="text-sm text-muted-foreground">
            Avg per Request:{" "}
            {formatCurrency(Math.round(cost / count), activeCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        <div className="text-center">
          <p>No maintenance cost data available</p>
          <p className="text-sm">
            Add maintenance requests with costs to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Cost
          </p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totalCost, activeCurrency)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Avg Cost/Request
          </p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(averageCostPerRequest, activeCurrency)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Properties
          </p>
          <p className="text-2xl font-bold text-foreground">{data.length}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis
              dataKey="property"
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
              tickFormatter={(value) =>
                `${formatCurrency(value, activeCurrency)}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
            <Bar dataKey="cost" name="Total Cost" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
