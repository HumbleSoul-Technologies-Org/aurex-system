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
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Props = {
  maintenanceByStatus: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#3b82f6",
  completed: "#10b981",
  rejected: "#ef4444",
  on_hold: "#8b5cf6",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  on_hold: "On Hold",
};

const STATUS_ICONS: Record<string, any> = {
  pending: AlertCircle,
  approved: Clock,
  completed: CheckCircle2,
  rejected: AlertCircle,
  on_hold: Clock,
};

export default function MaintenanceAnalyticsRing({
  maintenanceByStatus,
}: Props) {
  const data = useMemo(() => {
    return Object.entries(maintenanceByStatus)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        fill: STATUS_COLORS[status] || "#9ca3af",
        status,
      }));
  }, [maintenanceByStatus]);

  const totalRequests = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const completionRate = useMemo(() => {
    if (totalRequests === 0) return 0;
    const completed = maintenanceByStatus.completed || 0;
    return Math.round((completed / totalRequests) * 100);
  }, [maintenanceByStatus, totalRequests]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = ((value / totalRequests) * 100).toFixed(1);
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
            {value} request{value !== 1 ? "s" : ""} ({percentage}%)
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
          <p>No maintenance requests</p>
          <p className="text-sm">
            Create maintenance requests to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Requests
          </p>
          <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {maintenanceByStatus.completed || 0}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-400 mb-1">
            Approved
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {maintenanceByStatus.approved || 0}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400 mb-1">
            Completion Rate
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {completionRate}%
          </p>
        </div>
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

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item, index) => {
          const IconComponent = STATUS_ICONS[item.status] || AlertCircle;
          return (
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
                {((item.value / totalRequests) * 100).toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
