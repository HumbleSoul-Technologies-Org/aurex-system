"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

type Props = {
  categories: Record<string, number>;
};

const CATEGORY_COLORS: Record<string, string> = {
  residential: "#3b82f6",
  commercial: "#10b981",
  mixed_use: "#f59e0b",
  industrial: "#ef4444",
  retail: "#8b5cf6",
  office: "#06b6d4",
  other: "#6b7280",
};

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  industrial: "Industrial",
  retail: "Retail",
  office: "Office",
  other: "Other",
};

export default function PropertyCategoryDistributionRing({
  categories,
}: Props) {
  const data = useMemo(() => {
    return Object.entries(categories)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({
        name: CATEGORY_LABELS[category] || category,
        value: count,
        fill: CATEGORY_COLORS[category] || "#9ca3af",
      }));
  }, [categories]);

  const totalItems = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = ((value / totalItems) * 100).toFixed(1);
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
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">
            {value} {value !== 1 ? "properties" : "property"} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieLabel = ({ name, percent, x, y }: any) => (
    <text
      x={x}
      y={y}
      fill="var(--foreground)"
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${name}: ${Math.round((percent || 0) * 100)}%`}
    </text>
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <p>No property data available</p>
          <p className="text-sm">Add properties to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Properties Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs md:text-sm text-muted-foreground mb-1">
          Total Properties
        </p>
        <p className="text-2xl md:text-3xl font-bold text-foreground">
          {totalItems}
        </p>
      </div>

      {/* Ring Chart */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              label={renderPieLabel}
              labelLine={{ stroke: "var(--border)" }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              ></div>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {item.name}
              </p>
            </div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">
              {((item.value / totalItems) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
