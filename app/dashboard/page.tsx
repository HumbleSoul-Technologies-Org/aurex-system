"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppData } from "@/lib/data-context";
import {
  AdminSkeletonHeader,
  AdminTableSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  DollarSign,
  AlertCircle,
  Wrench,
  TrendingUp,
  ArrowRight,
  Users,
  MapPin,
} from "lucide-react";
import { createTransaction } from "@/app/lib/transactions-client";
import {
  getAllPayments,
  getPaymentsForPropertyIds,
} from "@/lib/services/payments";
import {
  getMaintenanceRequests,
  fetchAllMaintenanceRequests,
} from "@/lib/services/maintenance";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import PropertyPerformanceGrouped from "@/components/charts/property-performance-grouped";
import RentCollectionProgress from "@/components/charts/rent-collection-progress";
import TenantDistributionRing from "@/components/charts/tenant-distribution-ring";
import MaintenanceAnalyticsRing from "@/components/charts/maintenance-analytics-ring";
import MaintenanceTrendsLine from "@/components/charts/maintenance-trends-line";
import MaintenanceCostBar from "@/components/charts/maintenance-cost-bar";
import TenantAnalyticsBar from "@/components/charts/tenant-analytics-bar";
import LeaseExpiryTimeline from "@/components/charts/lease-expiry-timeline";
export default function DashboardPage() {
  const router = useRouter();

  // State for real data
  const { properties, tenants, isLoading, isFetching } = useAppData();
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const activeCurrency = useActiveCurrency();
  const [viewMode, setViewMode] = useState<"occupancy" | "performance">(
    "occupancy",
  );
  const [revenueWindow, setRevenueWindow] = useState<number>(6);
  const [revenueMode, setRevenueMode] = useState<"monthly" | "cumulative">(
    "monthly",
  );
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(true);
  const isPageLoading =
    !isHydrated || isLoading || (isFetching && properties.length === 0);

  // Load real data on mount
  useEffect(() => {
    setIsHydrated(true);

    const loadPayments = async () => {
      try {
        const propertyIds = properties
          .map((property) => property.id)
          .filter(Boolean);
        const allPayments =
          propertyIds.length > 0
            ? await getPaymentsForPropertyIds(propertyIds)
            : await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error("Failed to load payments", error);
        setPayments([]);
      }
    };

    loadPayments();

    const onPaymentsUpdated = () => {
      loadPayments();
    };

    if (typeof window !== "undefined")
      window.addEventListener("paymentsUpdated", onPaymentsUpdated);

    const loadMaintenanceRequests = async () => {
      const localRequests = getMaintenanceRequests();
      try {
        const requests = await fetchAllMaintenanceRequests();
        const mergedRequests = [...localRequests];

        requests.forEach((req) => {
          if (!mergedRequests.some((localReq) => localReq.id === req.id)) {
            mergedRequests.push(req);
          }
        });

        setMaintenanceRequests(
          mergedRequests.length > 0 ? mergedRequests : localRequests,
        );
      } catch (error) {
        console.error("Failed to load maintenance requests", error);
        setMaintenanceRequests(localRequests);
      }
    };

    loadMaintenanceRequests();

    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("paymentsUpdated", onPaymentsUpdated);
    };
  }, [properties.length]);

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const totalProperties = properties.length;
    const totalUnits = properties.reduce(
      (sum, p) => sum + (p.units.length || 0),
      0,
    );

    // Calculate monthly revenue based on properties and tenants
    const totalMonthlyRevenue = properties.reduce((sum, p) => {
      const propertyTenants = tenants.filter((t) => t.propertyId === p.id);
      return sum + propertyTenants.length * (p.price_per_unit || 0);
    }, 0);

    // Calculate occupancy rate
    const averageOccupancy =
      properties.length > 0
        ? Math.round((tenants.length / totalUnits) * 100 * 100) / 100
        : 0;

    // Count pending payments (payments with status 'pending')
    const pendingPayments = payments.filter(
      (p) => p.status === "pending",
    ).length;

    // Count open maintenance requests
    const openMaintenanceRequests = maintenanceRequests.filter(
      (req) => req.status === "pending",
    ).length;

    // Calculate YTD profit (simplified - successful payments minus some estimated expenses)
    const successfulPayments = payments.filter((p) => p.status === "complete");
    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const estimatedExpenses = totalRevenue * 0.3; // Assume 30% expenses
    const ytdProfit = totalRevenue - estimatedExpenses;

    return {
      totalProperties,
      totalUnits,
      totalMonthlyRevenue,
      averageOccupancy,
      pendingPayments,
      openMaintenanceRequests,
      ytdProfit,
      expectedRent: totalMonthlyRevenue,
      collectedRent: totalRevenue,
    };
  }, [properties, tenants, payments, maintenanceRequests]);

  // Prepare chart data from real data: monthly revenue/expenses, fill missing months
  const chartData = useMemo(() => {
    const months = revenueWindow; // last N months
    const now = new Date();

    // Build ordered month keys for the window
    const monthKeys = Array.from({ length: months }).map((_, i) => {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1),
      );
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      return { key, label, date: d };
    });

    const map: Record<string, { revenue: number; expenses: number }> = {};

    payments.forEach((payment) => {
      if (!payment || !payment.date) return;
      const d = new Date(payment.date);
      if (isNaN(d.getTime())) return;
      const k = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
        .toISOString()
        .slice(0, 7);
      if (!map[k]) map[k] = { revenue: 0, expenses: 0 };
      if (payment.status === "complete") {
        map[k].revenue += Number(payment.amount || 0);
        map[k].expenses += Number(payment.amount || 0) * 0.3;
      }
    });

    const result = monthKeys.map(({ key, label }) => ({
      month: label,
      revenue: Math.round(map[key]?.revenue || 0),
      expenses: Math.round(map[key]?.expenses || 0),
    }));

    return result;
  }, [payments, revenueWindow]);

  // Helper: moving average
  function movingAverage(values: number[], windowSize = 3) {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((s, v) => s + v, 0) / window.length;
      result.push(Math.round(avg));
    }
    return result;
  }

  const revenueSeries = useMemo(() => {
    const revenueValues = chartData.map((d) => d.revenue);
    const ma = movingAverage(revenueValues, 3);
    const cumulative = revenueValues.reduce((acc: number[], v, i) => {
      acc.push(v + (acc[i - 1] || 0));
      return acc;
    }, [] as number[]);

    return chartData.map((d, i) => ({
      month: d.month,
      revenue: d.revenue,
      revenueMA: ma[i],
      revenueCumulative: cumulative[i],
      expenses: d.expenses,
    }));
  }, [chartData]);

  // Prepare occupancy data for chart
  const occupancyData = useMemo(() => {
    const data = properties.map((property) => {
      const propertyTenants = tenants.filter(
        (t) => t.propertyId === property.id,
      );
      const occupancyRate =
        property.units_available > 0
          ? Math.round(
              (propertyTenants.length / property.units_available) * 100,
            )
          : 0;

      return {
        property: property.name || "Property",
        occupancy: occupancyRate,
      };
    });

    // If no properties, show sample data for demo
    if (data.length === 0) {
      return [
        { property: "Sunset Apartments", occupancy: 85 },
        { property: "Downtown Plaza", occupancy: 72 },
        { property: "Green Valley", occupancy: 95 },
        { property: "Riverside Complex", occupancy: 60 },
      ];
    }

    return data;
  }, [properties, tenants]);

  // Prepare combined occupancy + performance data
  const combinedData = useMemo(() => {
    return properties.map((property) => {
      const propertyTenants = tenants.filter(
        (t) => t.propertyId === property.id,
      );
      const occupancyRate =
        property.units_available > 0
          ? Math.round(
              (propertyTenants.length / property.units_available) * 100,
            )
          : 0;

      const propPayments = payments.filter(
        (p) => p.propertyId === property.id && p.status === "complete",
      );
      const revenue = propPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const units = property.units_available || property.units?.length || 1;
      const performance = units > 0 ? Math.round(revenue / units) : 0;

      return {
        property: property.name || "Unknown",
        occupancy: occupancyRate,
        performance,
      };
    });
  }, [properties, tenants, payments]);

  // Calculate tenant distribution by property category
  const tenantDistributionByCategory = useMemo(() => {
    const distribution: Record<string, number> = {};

    properties.forEach((property) => {
      const category = property.category || "other";
      const propertyTenants = tenants.filter(
        (t) => t.propertyId === property.id,
      );
      if (!distribution[category]) {
        distribution[category] = 0;
      }
      distribution[category] += propertyTenants.length;
    });

    return distribution;
  }, [properties, tenants]);

  // Calculate maintenance requests by status
  const maintenanceByStatus = useMemo(() => {
    const breakdown: Record<string, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      on_hold: 0,
    };

    maintenanceRequests.forEach((request) => {
      const status = request.status || "pending";
      if (breakdown.hasOwnProperty(status)) {
        breakdown[status]++;
      }
    });

    return breakdown;
  }, [maintenanceRequests]);

  // Prepare expense breakdown (simplified categories)
  const expenseBreakdown = useMemo(() => {
    const totalExpenses = payments
      .filter((p) => p.status === "complete")
      .reduce((sum, p) => sum + p.amount * 0.3, 0);

    // Only show data if there are actual expenses from localStorage
    if (totalExpenses === 0) {
      return [];
    }

    // Calculate based on maintenance requests
    const maintenanceCost = maintenanceRequests
      .filter((req) => req.cost)
      .reduce((sum, req) => sum + req.cost, 0);

    const maintenancePercent = Math.max(
      0,
      Math.round((maintenanceCost / totalExpenses) * 100),
    );
    const utilitiesPercent = Math.max(
      0,
      Math.round(((totalExpenses * 0.25) / totalExpenses) * 100),
    );
    const insurancePercent = Math.max(
      0,
      Math.round(((totalExpenses * 0.15) / totalExpenses) * 100),
    );
    const otherPercent = Math.max(
      0,
      100 - maintenancePercent - utilitiesPercent - insurancePercent,
    );

    return [
      { name: "Maintenance", value: maintenancePercent, fill: "#8884d8" },
      { name: "Utilities", value: utilitiesPercent, fill: "#82ca9d" },
      { name: "Insurance", value: insurancePercent, fill: "#ffc658" },
      { name: "Other", value: otherPercent, fill: "#ff7300" },
    ].filter((item) => item.value > 0); // Only show categories with values
  }, [payments, maintenanceRequests]);

  // Prepare recent activity from real payments
  const recentActivity = useMemo(() => {
    return payments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map((payment) => {
        const tenant = tenants.find((t) => t.id === payment.tenantId);
        const property = properties.find((p) => p.id === payment.propertyId);

        return {
          id: payment.id,
          type: "payment",
          tenant: tenant?.name || "Unknown Tenant",
          property: property?.name || "Unknown Property",
          amount: payment.amount,
          date: new Date(payment.date).toLocaleDateString(),
          description: payment.note || "Payment received",
        };
      });
  }, [payments, tenants, properties]);

  if (isPageLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <AdminSkeletonHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-border p-4 md:p-6">
              <Skeleton className="h-5 w-1/2 mb-4 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-7 w-3/4 rounded-xl" />
                <Skeleton className="h-5 w-1/2 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1.3fr]">
          <Card className="border border-border p-6">
            <Skeleton className="h-6 w-1/3 rounded-xl mb-4" />
            <Skeleton className="h-72 rounded-3xl" />
          </Card>
          <Card className="border border-border p-6">
            <Skeleton className="h-6 w-1/3 rounded-xl mb-4" />
            <AdminTableSkeleton rowCount={4} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening with your properties today
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {/* Total Properties */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Total Properties
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {isHydrated ? metrics.totalProperties : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {isHydrated ? `${metrics.totalUnits} units total` : "—"}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Occupancy Rate */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Occupancy Rate
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {isHydrated ? `${metrics.averageOccupancy}%` : "—"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Based on current tenants
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Monthly Revenue
              </p>
              <p className="text-lg md:text-sm font-bold text-foreground">
                {isHydrated
                  ? formatCurrency(metrics.totalMonthlyRevenue, activeCurrency)
                  : "—"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                From active tenants
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Pending Payments */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Pending Payments
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {isHydrated ? metrics.pendingPayments : "—"}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Awaiting processing
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        {/* Open Maintenance */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Open Maintenance
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {isHydrated ? metrics.openMaintenanceRequests : "—"}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Pending requests
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        {/* YTD Profit */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                YTD Profit
              </p>
              <p className="text-lg md:text-sm font-bold text-foreground">
                {isHydrated
                  ? formatCurrency(metrics.ytdProfit, activeCurrency)
                  : "—"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                After estimated expenses
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white justify-start"
            onClick={() => router.push("/dashboard/properties")}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Add Property
          </Button>
          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start bg-transparent"
            onClick={() => router.push("/dashboard/finances")}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start bg-transparent"
            onClick={() => router.push("/dashboard/maintenance")}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start bg-transparent"
            onClick={() => router.push("/dashboard/tenants")}
          >
            <Users className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start bg-transparent"
            onClick={() => router.push("/dashboard/map")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            View Properties Map
          </Button>
        </div>
      </Card>

      {/* Rent Collection Progress */}
      <Card className="border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">
          Rent Collection Status
        </h2>
        <RentCollectionProgress
          expectedRent={metrics.expectedRent}
          collectedRent={metrics.collectedRent}
        />
      </Card>

      {/* Cash Flow Trend */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
          Cash Flow Trend
        </h2>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No payment data available</p>
              <p className="text-sm">Add payments to see cash flow trends</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  stroke="var(--border)"
                  tickLine={{ stroke: "var(--border)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 10,
                  }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis
                  stroke="var(--border)"
                  tickLine={{ stroke: "var(--border)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 10,
                  }}
                  tickFormatter={(value) =>
                    `${getCurrencySymbol(activeCurrency)}${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number"
                      ? formatCurrency(value, activeCurrency)
                      : value,
                    name === "revenue" ? "Revenue" : "Expenses",
                  ]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--foreground)",
                  }}
                  cursor={{
                    stroke: "var(--border)",
                    strokeDasharray: "3 3",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: "var(--muted-foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: "#16a34a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
              Revenue Trend
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={revenueMode === "monthly" ? undefined : "outline"}
                  onClick={() => setRevenueMode("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={revenueMode === "cumulative" ? undefined : "outline"}
                  onClick={() => setRevenueMode("cumulative")}
                >
                  Cumulative
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground mr-2">
                  Show MA
                </label>
                <input
                  type="checkbox"
                  checked={showMovingAverage}
                  onChange={(e) => setShowMovingAverage(e.target.checked)}
                />
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No payment data available</p>
                  <p className="text-sm">Add payments to see revenue trends</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueSeries}
                    margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--border)"
                      tickLine={{ stroke: "var(--border)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 10,
                      }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={50}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tickLine={{ stroke: "var(--border)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === "number"
                          ? formatCurrency(value, activeCurrency)
                          : value,
                        name,
                      ]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                      }}
                      cursor={{
                        stroke: "var(--border)",
                        strokeDasharray: "3 3",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ color: "var(--muted-foreground)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey={
                        revenueMode === "monthly"
                          ? "revenue"
                          : "revenueCumulative"
                      }
                      name={
                        revenueMode === "monthly"
                          ? "Revenue"
                          : "Cumulative Revenue"
                      }
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                    {showMovingAverage && revenueMode === "monthly" && (
                      <Line
                        type="monotone"
                        dataKey="revenueMA"
                        name="Moving Average"
                        stroke="#1f9d5a"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="6 4"
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Expense Breakdown */}
        <div>
          <Card className="border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Expense Breakdown
            </h2>
            {expenseBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data available</p>
                  <p className="text-sm">
                    Complete payments to see expense breakdown
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {expenseBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ color: "var(--muted-foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Tenant Distribution by Category */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
          Tenant Distribution by Property Type
        </h2>
        <TenantDistributionRing
          tenantsByCategory={tenantDistributionByCategory}
        />
      </Card>

      {/* Maintenance Analytics */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
          Maintenance Request Analytics
        </h2>
        <MaintenanceAnalyticsRing maintenanceByStatus={maintenanceByStatus} />
      </Card>

      {/* Maintenance Trends & Cost Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
            Maintenance Trends
          </h2>
          <MaintenanceTrendsLine maintenanceRequests={maintenanceRequests} />
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
            Maintenance Cost by Property
          </h2>
          <MaintenanceCostBar
            maintenanceRequests={maintenanceRequests}
            properties={properties}
            activeCurrency={activeCurrency}
          />
        </Card>
      </div>

      {/* Tenant Payment Analytics */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
          Tenant Payment Analytics
        </h2>
        <TenantAnalyticsBar payments={payments} tenants={tenants} />
      </Card>

      {/* Lease Expiry Timeline */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
          Lease Expiry Timeline
        </h2>
        <LeaseExpiryTimeline tenants={tenants} properties={properties} />
      </Card>

      {/* Occupancy & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy by Property */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Occupancy by Property
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={viewMode === "occupancy" ? undefined : "outline"}
                onClick={() => setViewMode("occupancy")}
              >
                Occupancy
              </Button>
              <Button
                variant={viewMode === "performance" ? undefined : "outline"}
                onClick={() => setViewMode("performance")}
              >
                Occupancy + Performance
              </Button>
            </div>

            {occupancyData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No property data available</p>
                  <p className="text-sm">
                    Add properties and tenants to see occupancy rates
                  </p>
                </div>
              </div>
            ) : viewMode === "occupancy" ? (
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={occupancyData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="var(--border)"
                    />
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
                      interval={0}
                      height={80}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(tick) => `${tick}%`}
                      stroke="var(--border)"
                      tickLine={{ stroke: "var(--border)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                      }}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, "Occupancy"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                      }}
                      cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ color: "var(--muted-foreground)" }}
                    />
                    <Bar
                      dataKey="occupancy"
                      name="Occupancy %"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <PropertyPerformanceGrouped data={combinedData} />
            )}
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <Button
            variant="outline"
            className="border-border text-primary bg-transparent"
          >
            View all <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {activity.type === "payment"
                    ? `Payment from ${activity.tenant}`
                    : `Expense: ${activity.description}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.property}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${activity.type === "payment" ? "text-green-600" : "text-red-600"}`}
                >
                  {activity.type === "payment" ? "+" : "-"}
                  {getCurrencySymbol(activeCurrency)}{" "}
                  {activity.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
