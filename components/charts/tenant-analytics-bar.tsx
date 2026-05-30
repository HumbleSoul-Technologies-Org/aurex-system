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

type Props = {
  payments: Array<{
    id: string;
    tenantId?: string;
    paidOn?: string;
    date?: string;
    amount?: number;
    status?: string;
  }>;
  tenants: Array<{
    id: string;
    name: string;
    rentAmount?: number;
  }>;
};

const PAYMENT_COLORS = {
  onTime: "#10b981",
  late: "#f59e0b",
  chronic: "#ef4444",
};

export default function TenantAnalyticsBar({ payments, tenants }: Props) {
  const data = useMemo(() => {
    // Classify payments by tenant: on-time, late, chronic defaulters
    const tenantPayments: Record<
      string,
      {
        onTime: number;
        late: number;
        all: Array<any>;
      }
    > = {};

    payments.forEach((payment) => {
      const tenantId = payment.tenantId;
      if (!tenantId) return;

      if (!tenantPayments[tenantId]) {
        tenantPayments[tenantId] = { onTime: 0, late: 0, all: [] };
      }

      tenantPayments[tenantId].all.push(payment);

      // Simple heuristic: if status is 'complete' or 'recorded', assume on-time
      // Otherwise if status is 'balance', 'pending', or 'failed', count as late
      if (
        ["complete", "recorded", "confirmed"].includes(payment.status || "")
      ) {
        tenantPayments[tenantId].onTime += 1;
      } else if (
        ["balance", "pending", "failed", "refunded"].includes(
          payment.status || "",
        )
      ) {
        tenantPayments[tenantId].late += 1;
      }
    });

    // Build chart data
    const chartData = tenants
      .map((tenant) => {
        const stats = tenantPayments[tenant.id] || {
          onTime: 0,
          late: 0,
          all: [],
        };
        const total = stats.onTime + stats.late;
        const isChronicDefaulter =
          stats.late > 0 && stats.late >= Math.ceil(stats.all.length * 0.3); // 30% or more late

        return {
          tenantId: tenant.id,
          tenant: tenant.name || "Unknown",
          onTime: stats.onTime,
          late: stats.late,
          total,
          isChronicDefaulter,
        };
      })
      .filter((t) => t.total > 0) // Only show tenants with payments
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 tenants by payment count

    return chartData;
  }, [payments, tenants]);

  const stats = useMemo(() => {
    const total = data.reduce((sum, t) => sum + t.total, 0);
    const onTime = data.reduce((sum, t) => sum + t.onTime, 0);
    const late = data.reduce((sum, t) => sum + t.late, 0);
    const chronic = data.filter((t) => t.isChronicDefaulter).length;

    return {
      total,
      onTime,
      late,
      chronic,
      onTimeRate: total > 0 ? Math.round((onTime / total) * 100) : 0,
    };
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { tenant, onTime, late, isChronicDefaulter } = payload[0].payload;
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
          <p className="font-semibold">{tenant}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            On-time: {onTime}
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Late: {late}
          </p>
          {isChronicDefaulter && (
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
              ⚠️ Chronic Defaulter
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
          <p>No tenant payment data available</p>
          <p className="text-sm">Record payments to see tenant analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Payments
          </p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 mb-1">
            On-time
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.onTime}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400 mb-1">
            Late
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.late}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-red-700 dark:text-red-400 mb-1">
            Chronic
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.chronic}
          </p>
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
              dataKey="tenant"
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 10,
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
            <Bar
              dataKey="onTime"
              name="On-time"
              fill={PAYMENT_COLORS.onTime}
              radius={[8, 0, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="late"
              name="Late"
              fill={PAYMENT_COLORS.late}
              radius={[0, 8, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
