"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import { useAppData } from "@/lib/data-context";

const AnalyticsCharts = dynamic(
  () => import("@/components/charts/dashboard-analytics-charts"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] flex items-center justify-center text-muted-foreground">
        Loading chart...
      </div>
    ),
  },
);

function parseAmount(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value: any): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildMonthlySeries(payments: any[], expenses: any[], months: number) {
  const now = new Date();
  const monthKeys = Array.from({ length: months }).map((_, index) => {
    const d = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - (months - 1 - index),
        1,
      ),
    );
    return {
      key: getMonthKey(d),
      month: d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
    };
  });

  const map: Record<string, { revenue: number; expenses: number }> = {};
  monthKeys.forEach((month) => {
    map[month.key] = { revenue: 0, expenses: 0 };
  });

  payments.forEach((payment) => {
    const date = normalizeDate(
      payment.paidOn ||
        payment.paymentDate ||
        payment.date ||
        payment.createdAt,
    );
    if (!date) return;
    const key = getMonthKey(date);
    if (!map[key]) return;
    const status = String(payment.status || "").toLowerCase();
    const completedStatuses = [
      "complete",
      "completed",
      "paid",
      "recorded",
      "confirmed",
      "settled",
      "success",
    ];
    if (!completedStatuses.includes(status)) return;
    map[key].revenue += parseAmount(payment.amount);
  });

  expenses.forEach((expense) => {
    const date = normalizeDate(
      expense.date ||
        expense.createdAt ||
        expense.transactionDate ||
        expense.postedAt ||
        expense.entryDate,
    );
    if (!date) return;
    const key = getMonthKey(date);
    if (!map[key]) return;
    map[key].expenses += parseAmount(expense.amount);
  });

  return monthKeys.map((month) => ({
    month: month.month,
    revenue: Math.round(map[month.key].revenue),
    expenses: Math.round(map[month.key].expenses),
  }));
}

function buildPropertyPerformance(
  properties: any[],
  payments: any[],
  tenants: any[],
) {
  return properties.map((property) => {
    const propertyId = property.id || property._id;
    if (!propertyId) {
      return {
        property: property.name || "Unknown",
        revenue: 0,
        occupancy: 0,
        roi: "0%",
        status: "N/A",
      };
    }

    const propertyTenants = tenants.filter(
      (tenant) => tenant.propertyId === propertyId,
    );
    const units =
      Number(property.units_available ?? property.units?.length ?? 0) || 1;
    const completedPayments = payments.filter(
      (payment) =>
        payment.propertyId === propertyId &&
        [
          "complete",
          "completed",
          "paid",
          "recorded",
          "confirmed",
          "settled",
          "success",
        ].includes(String(payment.status || "").toLowerCase()),
    );
    const revenue = completedPayments.reduce(
      (sum, payment) => sum + parseAmount(payment.amount),
      0,
    );
    const occupancy = Math.round((propertyTenants.length / units) * 100 || 0);
    const performance = units > 0 ? Math.round(revenue / units) : 0;
    const roi =
      units > 0
        ? `${Math.round((performance / Math.max(1, Number(property.rent ?? property.price_per_unit ?? 1))) * 100)}%`
        : "0%";

    let status = "Good";
    if (occupancy >= 90 && revenue > 0) status = "Excellent";
    else if (occupancy < 70) status = "Needs Work";

    return {
      property: property.name || "Unknown Property",
      revenue,
      occupancy: `${occupancy}%`,
      roi,
      status,
    };
  });
}

export default function AnalyticsPage() {
  const activeCurrency = useActiveCurrency();
  const { properties, tenants, payments, expenses, isLoading, isFetching } =
    useAppData();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isPageLoading = !isHydrated || isLoading || isFetching;

  const chartData = useMemo(
    () => buildMonthlySeries(payments, expenses, 6),
    [payments, expenses],
  );

  const totalProperties = properties.length;
  const totalUnits = properties.reduce(
    (sum, property) =>
      sum + Number(property.units?.length ?? property.units_available ?? 0),
    0,
  );
  const occupancyRate =
    totalUnits > 0 ? Math.round((tenants.length / totalUnits) * 100) : 0;
  const completedPayments = payments.filter((payment) =>
    [
      "complete",
      "completed",
      "paid",
      "recorded",
      "confirmed",
      "settled",
      "success",
    ].includes(String(payment.status || "").toLowerCase()),
  );
  const totalRevenue = completedPayments.reduce(
    (sum, payment) => sum + parseAmount(payment.amount),
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseAmount(expense.amount),
    0,
  );
  const pendingPayments = payments.filter(
    (payment) => String(payment.status || "").toLowerCase() === "pending",
  ).length;
  const averageRent =
    properties.length > 0 ? Math.round(totalRevenue / properties.length) : 0;
  const ytdProfit = totalRevenue - totalExpenses;

  const propertyPerformance = useMemo(
    () => buildPropertyPerformance(properties, payments, tenants),
    [properties, payments, tenants],
  );

  const topProperties = propertyPerformance
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-72 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={idx}
              className="border border-border p-4 md:p-6 animate-pulse bg-slate-50"
            >
              <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
              <div className="h-10 w-32 bg-slate-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your portfolio performance in real-time.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Last 6 Months</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue, activeCurrency),
            subtitle: "Completed collections",
            trend: "up",
            color: "text-green-600",
          },
          {
            label: "Avg Revenue / Property",
            value: formatCurrency(averageRent, activeCurrency),
            subtitle: `${totalProperties} properties`,
            trend: totalProperties > 0 ? "up" : "down",
            color: "text-blue-600",
          },
          {
            label: "Pending Payments",
            value: pendingPayments.toString(),
            subtitle: "Awaiting collection",
            trend: pendingPayments > 0 ? "down" : "up",
            color: pendingPayments > 0 ? "text-red-600" : "text-green-600",
          },
          {
            label: "Occupancy Rate",
            value: `${occupancyRate}%`,
            subtitle: `${totalUnits} total units`,
            trend: occupancyRate >= 80 ? "up" : "down",
            color: occupancyRate >= 80 ? "text-green-600" : "text-orange-600",
          },
        ].map((metric) => (
          <Card key={metric.label} className="border border-border p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.subtitle}
                </p>
              </div>
              <div className={`text-xs font-semibold ${metric.color}`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="inline w-4 h-4" />
                ) : (
                  <TrendingDown className="inline w-4 h-4" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnalyticsCharts chartData={chartData} activeCurrency={activeCurrency} />

      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Property Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                  Property
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">
                  Revenue
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">
                  Occupancy
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">
                  ROI
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {topProperties.length > 0 ? (
                topProperties.map((property) => (
                  <tr
                    key={property.property}
                    className="border-b border-border hover:bg-secondary"
                  >
                    <td className="py-3 px-2 text-foreground font-medium">
                      {property.property}
                    </td>
                    <td className="py-3 px-2 text-foreground hidden sm:table-cell">
                      {formatCurrency(property.revenue, activeCurrency)}
                    </td>
                    <td className="py-3 px-2 text-foreground hidden md:table-cell">
                      {property.occupancy}
                    </td>
                    <td className="py-3 px-2 text-foreground hidden lg:table-cell">
                      {property.roi}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${property.status === "Excellent" ? "bg-green-100 text-green-800" : property.status === "Needs Work" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {property.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No property performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Top Performing Property
          </h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {topProperties[0]?.property || "No property data"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {topProperties[0]
                    ? formatCurrency(topProperties[0].revenue, activeCurrency)
                    : "No revenue data"}
                </p>
              </div>
              <span className="text-green-600 font-bold">
                {topProperties[0] ? "+15%" : ""}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground">
              {topProperties[0]?.occupancy
                ? `${topProperties[0].occupancy} occupancy`
                : "Awaiting data"}
            </p>
          </div>
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {topProperties[topProperties.length - 1]?.property ||
                    "No property data"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {topProperties[topProperties.length - 1]
                    ? formatCurrency(
                        topProperties[topProperties.length - 1].revenue,
                        activeCurrency,
                      )
                    : "No revenue data"}
                </p>
              </div>
              <span className="text-orange-600 font-bold">-8%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-5/12 bg-orange-500 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground">
              {topProperties[topProperties.length - 1]
                ? `${topProperties[topProperties.length - 1].occupancy} occupancy`
                : "Awaiting data"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
