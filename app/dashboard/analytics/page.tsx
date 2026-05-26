"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Share2 } from "lucide-react";
import { chartData } from "@/app/lib/sample-data";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";

export default function AnalyticsPage() {
  const activeCurrency = useActiveCurrency();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your portfolio performance in real-time
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Last 30 Days</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(127500, activeCurrency),
            change: "+12.5%",
            trend: "up",
            color: "text-green-600",
          },
          {
            label: "Avg Rent/Property",
            value: formatCurrency(2550, activeCurrency),
            change: "+5.2%",
            trend: "up",
            color: "text-green-600",
          },
          {
            label: "Vacancy Loss",
            value: formatCurrency(7650, activeCurrency),
            change: "-2.3%",
            trend: "down",
            color: "text-red-600",
          },
          {
            label: "ROI",
            value: "18.5%",
            change: "+3.1%",
            trend: "up",
            color: "text-green-600",
          },
        ].map((metric) => (
          <Card key={metric.label} className="border border-border p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {metric.label}
            </p>
            <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
              {metric.value}
            </p>
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${metric.color}`}
            >
              {metric.trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {metric.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Revenue Trend
          </h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Comparison */}
        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Monthly Comparison
          </h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" />
                <Bar dataKey="expenses" fill="var(--destructive)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Property Performance */}
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
              {[
                {
                  name: "Sunset Apartments",
                  revenue: formatCurrency(18500, activeCurrency),
                  occupancy: "95%",
                  roi: "22%",
                  status: "Excellent",
                },
                {
                  name: "Downtown Office",
                  revenue: formatCurrency(15200, activeCurrency),
                  occupancy: "88%",
                  roi: "18%",
                  status: "Good",
                },
                {
                  name: "Beachside Villa",
                  revenue: formatCurrency(12800, activeCurrency),
                  occupancy: "100%",
                  roi: "25%",
                  status: "Excellent",
                },
                {
                  name: "Mountain Lodge",
                  revenue: formatCurrency(11500, activeCurrency),
                  occupancy: "85%",
                  roi: "16%",
                  status: "Good",
                },
                {
                  name: "Urban Lofts",
                  revenue: formatCurrency(9800, activeCurrency),
                  occupancy: "92%",
                  roi: "20%",
                  status: "Good",
                },
              ].map((property, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border hover:bg-secondary"
                >
                  <td className="py-3 px-2 text-foreground font-medium">
                    {property.name}
                  </td>
                  <td className="py-3 px-2 text-foreground hidden sm:table-cell">
                    {property.revenue}
                  </td>
                  <td className="py-3 px-2 text-foreground hidden md:table-cell">
                    {property.occupancy}
                  </td>
                  <td className="py-3 px-2 text-foreground hidden lg:table-cell">
                    {property.roi}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        property.status === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Top Performing Property
          </h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">Beachside Villa</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(12800, activeCurrency)} monthly revenue
                </p>
              </div>
              <span className="text-green-600 font-bold">+25%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-muted-foreground">100% occupancy rate</p>
          </div>
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">Mountain Lodge</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(11500, activeCurrency)} monthly revenue
                </p>
              </div>
              <span className="text-orange-600 font-bold">-8%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-5/12 bg-orange-500 rounded-full"></div>
            </div>
            <p className="text-xs text-muted-foreground">
              85% occupancy - 3 units vacant
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
