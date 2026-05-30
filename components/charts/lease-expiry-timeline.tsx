"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";

type Props = {
  tenants: Array<{
    id: string;
    name: string;
    propertyId?: string;
    leaseEndDate?: string;
    leaseStartDate?: string;
    leaseType?: string;
  }>;
  properties: Array<{
    id: string;
    name: string;
  }>;
};

const LEASE_STATUS_COLORS = {
  expired: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  expiringSoon:
    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  upcoming:
    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  safe: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
};

const LEASE_STATUS_TEXT = {
  expired: "text-red-700 dark:text-red-400",
  expiringSoon: "text-amber-700 dark:text-amber-400",
  upcoming: "text-blue-700 dark:text-blue-400",
  safe: "text-green-700 dark:text-green-400",
};

export default function LeaseExpiryTimeline({ tenants, properties }: Props) {
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  const calculateLeaseEndDate = (
    tenant: any,
  ): { date: Date; status: string } | null => {
    if (tenant.leaseEndDate) {
      const endDate = new Date(tenant.leaseEndDate);
      if (!isNaN(endDate.getTime())) {
        return { date: endDate, status: "provided" };
      }
    }

    // Fallback: calculate from leaseStartDate + leaseType
    if (tenant.leaseStartDate && tenant.leaseType) {
      const startDate = new Date(tenant.leaseStartDate);
      if (isNaN(startDate.getTime())) return null;

      const leaseTypeMonths: Record<string, number> = {
        "month-to-month": 1,
        monthly: 1,
        "three-month": 3,
        quarterly: 3,
        "six-month": 6,
        semi_annual: 6,
        annual: 12,
        yearly: 12,
        "one-year": 12,
        "two-year": 24,
        "three-year": 36,
      };

      const months = leaseTypeMonths[tenant.leaseType.toLowerCase()] || 12;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);

      return { date: endDate, status: "calculated" };
    }

    return null;
  };

  const leaseData = useMemo(() => {
    const now = new Date();

    const leases = tenants
      .map((tenant) => {
        const leaseInfo = calculateLeaseEndDate(tenant);
        if (!leaseInfo) return null;

        const { date: endDate } = leaseInfo;
        const daysUntilExpiry = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        let status = "safe";
        if (daysUntilExpiry < 0) status = "expired";
        else if (daysUntilExpiry <= 30) status = "expiringSoon";
        else if (daysUntilExpiry <= 90) status = "upcoming";

        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          propertyId: tenant.propertyId,
          propertyName:
            properties.find((p) => p.id === tenant.propertyId)?.name ||
            "Unknown",
          endDate,
          daysUntilExpiry,
          status,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a?.status === "expired" && b?.status !== "expired") return -1;
        if (a?.status !== "expired" && b?.status === "expired") return 1;
        return (a?.daysUntilExpiry || 0) - (b?.daysUntilExpiry || 0);
      });

    return leases;
  }, [tenants, properties]);

  const stats = useMemo(() => {
    return {
      total: leaseData.length,
      expired: leaseData.filter((l) => l.status === "expired").length,
      expiringSoon: leaseData.filter((l) => l.status === "expiringSoon").length,
      upcoming: leaseData.filter((l) => l.status === "upcoming").length,
      safe: leaseData.filter((l) => l.status === "safe").length,
    };
  }, [leaseData]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      expired: "Expired",
      expiringSoon: "Expiring Soon",
      upcoming: "Upcoming",
      safe: "Safe",
    };
    return labels[status] || status;
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    if (days <= 30) return `Expires in ${days} days`;
    return `Expires ${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
  };

  if (leaseData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        <div className="text-center">
          <p>No lease expiry data available</p>
          <p className="text-sm">
            Add tenants with lease dates to see timeline
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-red-700 dark:text-red-400 mb-1">
            Expired
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.expired}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400 mb-1">
            Soon
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.expiringSoon}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-400 mb-1">
            Upcoming
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.upcoming}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-xs md:text-sm text-green-700 dark:text-green-400 mb-1">
            Safe
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.safe}
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "timeline" ? undefined : "outline"}
          size="sm"
          onClick={() => setViewMode("timeline")}
          className="gap-2"
        >
          <List className="w-4 h-4" />
          Timeline View
        </Button>
        <Button
          variant={viewMode === "calendar" ? undefined : "outline"}
          size="sm"
          onClick={() => setViewMode("calendar")}
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Calendar View
        </Button>
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaseData.map((lease, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-3 ${
                LEASE_STATUS_COLORS[
                  lease.status as keyof typeof LEASE_STATUS_COLORS
                ]
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {lease.tenantName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lease.propertyName}
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      LEASE_STATUS_TEXT[
                        lease.status as keyof typeof LEASE_STATUS_TEXT
                      ]
                    }`}
                  >
                    {getDaysLabel(lease.daysUntilExpiry)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {lease.endDate.toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      LEASE_STATUS_TEXT[
                        lease.status as keyof typeof LEASE_STATUS_TEXT
                      ]
                    }`}
                  >
                    {getStatusLabel(lease.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View (simplified month grid) */}
      {viewMode === "calendar" && (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() + i);
            const monthKey = monthDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });

            const monthLeases = leaseData.filter((lease) => {
              return (
                lease.endDate.getMonth() === monthDate.getMonth() &&
                lease.endDate.getFullYear() === monthDate.getFullYear()
              );
            });

            if (monthLeases.length === 0) return null;

            return (
              <Card key={monthKey} className="border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  {monthKey}
                </h4>
                <div className="space-y-2">
                  {monthLeases.map((lease, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">
                        {lease.tenantName}
                      </span>
                      <span
                        className={`font-medium ${
                          LEASE_STATUS_TEXT[
                            lease.status as keyof typeof LEASE_STATUS_TEXT
                          ]
                        }`}
                      >
                        {lease.endDate.getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          }).filter(Boolean)}
        </div>
      )}
    </div>
  );
}
