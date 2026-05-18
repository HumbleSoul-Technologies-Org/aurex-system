"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Wrench,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/data-context";
import { listTransactions } from "@/app/lib/transactions-client";
import { getMaintenanceRequests } from "@/lib/services/maintenance";

export default function TenantDashboard() {
  const { user } = useAuth();

  const { tenants, properties } = useAppData();

  // Find the tenant record for the current user
  const tenant = user ? tenants.find((t) => t.email === user.email) : null;

  // Get property info
  const propertyInfo = tenant?.propertyId
    ? properties.find((p) => p.id === tenant.propertyId)
    : null;

  // Get payment history (transactions)
  const paymentHistory = tenant ? listTransactions(tenant.id, "rent") : [];

  // Get maintenance requests
  const allMaintenance = getMaintenanceRequests();
  const tenantMaintenance = tenant
    ? allMaintenance.filter((m) => m.tenantId === tenant.id)
    : [];

  const latestPayment =
    paymentHistory.length > 0
      ? paymentHistory[paymentHistory.length - 1]
      : null;
  const pendingMaintenance = tenantMaintenance.filter(
    (r) => r.status !== "completed",
  );

  // Calculate lease expiration date
  const getLeaseExpiration = () => {
    const leaseStart = tenant?.leaseStartDate;
    if (!leaseStart) return null;

    const startDate = new Date(leaseStart);
    const leaseType = tenant?.leaseType || "month-to-month";

    if (leaseType === "month-to-month" || leaseType === "monthly") {
      // For monthly leases, add exactly one month to the start date
      return new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
      );
    } else if (leaseType.includes("month")) {
      // Parse "6-month", "12-month", etc.
      const months = parseInt(leaseType.split("-")[0]);
      if (!isNaN(months)) {
        return new Date(
          startDate.getFullYear(),
          startDate.getMonth() + months,
          startDate.getDate(),
        );
      }
    } else if (leaseType.includes("year")) {
      // Parse "1-year", "2-year", etc.
      const years = parseInt(leaseType.split("-")[0]);
      if (!isNaN(years)) {
        return new Date(
          startDate.getFullYear() + years,
          startDate.getMonth(),
          startDate.getDate(),
        );
      }
    }

    return null;
  };

  const leaseExpiration = getLeaseExpiration();

  // Calculate days remaining in lease
  const getDaysRemaining = () => {
    if (!leaseExpiration) return null;
    const today = new Date();
    const timeDiff = leaseExpiration.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysRemaining = getDaysRemaining();

  // Calculate months remaining for display
  const getMonthsRemaining = () => {
    if (!daysRemaining) return null;
    return Math.floor(daysRemaining / 30);
  };

  const monthsRemaining = getMonthsRemaining();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome, {tenant?.name || user?.name || "Tenant"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Unit {tenant?.unit || "N/A"} • {propertyInfo?.name || "Property"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Current Rent */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Monthly Rent
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                ${tenant?.rentAmount || "0"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Lease Started on:{" "}
                {tenant?.leaseStartDate
                  ? new Date(tenant?.leaseStartDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Last Payment
              </p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {latestPayment?.status === "completed" ? "Paid" : "Pending"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {latestPayment?.status === "completed"
                  ? `Paid on: ${new Date(latestPayment.date).toLocaleDateString()}`
                  : `Due: ${tenant?.leaseStartDate ? new Date(new Date(tenant?.leaseStartDate).getFullYear(), new Date(tenant?.leaseStartDate).getMonth() + 1, new Date(tenant?.leaseStartDate).getDate()).toLocaleDateString() : "N/A"}`}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Lease Status */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Lease Expires
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {leaseExpiration ? leaseExpiration.toLocaleDateString() : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {tenant?.leaseType || "Month-to-month"}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Open Maintenance */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                Open Requests
              </p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                {pendingMaintenance.length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {pendingMaintenance.filter((r) => r.priority === "high").length}{" "}
                urgent
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-white h-14 md:h-12"
        >
          <Link href="/tenant/make-payment" className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Make Payment
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>

        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-white h-14 md:h-12"
        >
          <Link href="/tenant/maintenance" className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Report Maintenance
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Recent Payments */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Recent Payments
            </h2>
            <Button
              variant="ghost"
              asChild
              className="text-primary hover:text-primary/90"
            >
              <Link href="/tenant/payments">View All</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {paymentHistory
              .slice(-3)
              .reverse()
              .map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.status === "completed"
                        ? payment.type
                        : "Pending"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-foreground">
                      ${payment.amount}
                    </p>
                    <Badge
                      className={
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }
                    >
                      {payment.status === "completed" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Open Maintenance Requests */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Maintenance Requests
            </h2>
            <Button
              variant="ghost"
              asChild
              className="text-primary hover:text-primary/90"
            >
              <Link href="/tenant/maintenance">View All</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {pendingMaintenance.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="p-3 bg-secondary rounded-lg border border-border"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      request.priority === "high"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}
                  >
                    {request.status === "assigned" ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {request.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </p>
                  </div>
                  <Badge className="text-xs whitespace-nowrap">
                    {request.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 p-4 md:p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200">
              Lease Status
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
              {leaseExpiration ? (
                <>
                  Your {tenant?.leaseType || "month-to-month"} lease expires on{" "}
                  <span className="font-semibold">
                    {leaseExpiration.toLocaleDateString()}
                  </span>
                  {daysRemaining &&
                    monthsRemaining !== null &&
                    daysRemaining > 0 && (
                      <>
                        {" "}
                        — {monthsRemaining} months and {daysRemaining % 30} days
                        remaining
                      </>
                    )}
                  {daysRemaining && daysRemaining <= 0 && (
                    <> — Your lease has expired</>
                  )}
                  . Please contact management if you have any questions about
                  renewal or modifications.
                </>
              ) : (
                "Please contact management for information about your lease status."
              )}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-3 border-yellow-600 text-yellow-600 hover:bg-yellow-100 bg-transparent"
            >
              <Link href="/tenant/contact">Contact Management</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
