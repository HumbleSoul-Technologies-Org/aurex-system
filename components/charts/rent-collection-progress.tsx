"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

type Props = {
  expectedRent: number;
  collectedRent: number;
};

export default function RentCollectionProgress({
  expectedRent,
  collectedRent,
}: Props) {
  const activeCurrency = useActiveCurrency();
  const currencySymbol = getCurrencySymbol(activeCurrency);

  const pendingRent = Math.max(0, expectedRent - collectedRent);

  const chartData = useMemo(
    () => [
      {
        name: "Collected Rent",
        value: collectedRent,
        color: "#16a34a",
      },
      {
        name: "Remaining Rent",
        value: Math.max(0, expectedRent - collectedRent),
        color: "#94a3b8",
      },
    ],
    [collectedRent, expectedRent],
  );

  const collectionRate = useMemo(() => {
    if (expectedRent === 0) return 0;
    return Math.round((collectedRent / expectedRent) * 100);
  }, [expectedRent, collectedRent]);

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
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color }}>
              <strong>{entry.name}:</strong>{" "}
              {formatCurrency(entry.value, activeCurrency)}
            </div>
          ))}
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

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Expected Rent
          </p>
          <p className="text-lg md:text-xl font-bold text-foreground">
            {currencySymbol}
            {expectedRent.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs md:text-sm text-green-700 dark:text-green-400 mb-1">
            Collected
          </p>
          <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
            {currencySymbol}
            {collectedRent.toLocaleString()}
          </p>
        </div>
        <div
          className={`${
            collectionRate >= 80
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              : collectionRate >= 50
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          } border rounded-lg p-4`}
        >
          <p
            className={`text-xs md:text-sm ${
              collectionRate >= 80
                ? "text-blue-700 dark:text-blue-400"
                : collectionRate >= 50
                  ? "text-yellow-700 dark:text-yellow-400"
                  : "text-red-700 dark:text-red-400"
            } mb-1`}
          >
            Collection Rate
          </p>
          <p
            className={`text-lg md:text-xl font-bold ${
              collectionRate >= 80
                ? "text-blue-600 dark:text-blue-400"
                : collectionRate >= 50
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {collectionRate}%
          </p>
        </div>
      </div>

      {/* Rent Collection Ring */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              paddingAngle={3}
              cornerRadius={20}
              labelLine={{ stroke: "var(--border)" }}
              label={renderPieLabel}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Amount */}
      {expectedRent > collectedRent && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
            Pending Collection
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {currencySymbol}
            {(expectedRent - collectedRent).toLocaleString()}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">
            {(((expectedRent - collectedRent) / expectedRent) * 100).toFixed(1)}
            % of expected rent remains unpaid
          </p>
        </div>
      )}
    </div>
  );
}
