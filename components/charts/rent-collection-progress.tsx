"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
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

  const data = useMemo(
    () => [
      {
        name: "Rent",
        expected: expectedRent,
        collected: collectedRent,
        pending: Math.max(0, expectedRent - collectedRent),
      },
    ],
    [expectedRent, collectedRent],
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
              <strong>{entry.name}:</strong> {currencySymbol}
              {(entry.value || 0).toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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

      {/* Progress Bar Chart */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) =>
                `${currencySymbol}${(value / 1000).toFixed(0)}k`
              }
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
            <Bar
              dataKey="expected"
              name="Expected Rent"
              fill="#94a3b8"
              radius={[8, 8, 0, 0]}
              barSize={60}
            />
            <Bar
              dataKey="collected"
              name="Collected Rent"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
              barSize={60}
            />
          </BarChart>
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
