"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppData } from "@/lib/data-context";
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
import { listPayments } from "@/lib/services/payments";
import { getMaintenanceRequests } from "@/lib/services/maintenance";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
export default function DashboardPage() {
  const router = useRouter();

  // State for real data
  const { properties, tenants } = useAppData();
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const activeCurrency = useActiveCurrency();

  // Load real data on mount
  useEffect(() => {
    setIsHydrated(true);
    setPayments(listPayments());
    const onPaymentsUpdated = () => setPayments(listPayments());
    if (typeof window !== "undefined")
      window.addEventListener("paymentsUpdated", onPaymentsUpdated);
    setMaintenanceRequests(getMaintenanceRequests());
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("paymentsUpdated", onPaymentsUpdated);
    };
  }, []);

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
    const successfulPayments = payments.filter((p) => p.status === "completed");
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
    };
  }, [properties, tenants, payments, maintenanceRequests]);

  // Prepare chart data from real data
  const chartData = useMemo(() => {
    // Group payments by month for revenue trend
    const monthlyData: {
      [key: string]: { revenue: number; expenses: number };
    } = {};

    payments.forEach((payment) => {
      try {
        const date = new Date(payment.date);
        if (isNaN(date.getTime())) {
          console.warn("Invalid payment date:", payment.date);
          return;
        }
        const monthKey = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0 };
        }

        if (payment.status === "completed") {
          monthlyData[monthKey].revenue += payment.amount;
          // Assume 30% of revenue goes to expenses
          monthlyData[monthKey].expenses += payment.amount * 0.3;
        }
      } catch (error) {
        console.warn("Error processing payment:", payment, error);
      }
    });

    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        expenses: Math.round(data.expenses),
      }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.month + " 1");
        const dateB = new Date(b.month + " 1");
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Last 6 months

    return result;
  }, [payments]);

  // Prepare occupancy data for chart
  const occupancyData = useMemo(() => {
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

      return {
        property: property.name,
        occupancy: occupancyRate,
      };
    });
  }, [properties, tenants]);

  // Prepare expense breakdown (simplified categories)
  const expenseBreakdown = useMemo(() => {
    const totalExpenses = payments
      .filter((p) => p.status === "completed")
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
              <p className="text-2xl md:text-3xl font-bold text-foreground">
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
              <p className="text-2xl md:text-3xl font-bold text-foreground">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">
              Revenue Trend
            </h2>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No payment data available</p>
                  <p className="text-sm">Add payments to see revenue trends</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--destructive)"
                    dot={{ fill: "var(--destructive)", r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      {/* Occupancy & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy by Property */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Occupancy by Property
            </h2>
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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="property"
                    stroke="var(--muted-foreground)"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="occupancy"
                    fill="var(--primary)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border border-border p-6 h-full">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
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
                  {getCurrencySymbol(activeCurrency)}
                  {activity.amount}
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
