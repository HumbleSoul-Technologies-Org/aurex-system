"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  FileText,
  MessageSquare,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Copy,
  Users,
  Link as LinkIcon,
  MoreHorizontal,
  Ban,
  Mail,
  User,
} from "lucide-react";
import { useAppData } from "@/lib/data-context";
import { listPayments } from "@/lib/services/payments";
import {
  getTenantPortalSettings,
  initializeSystemSettings,
  updateFeatureToggles,
} from "@/lib/services/settings";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import Link from "next/link";

const featureToggleMap: Record<string, string> = {
  "rent-payment": "paymentPortal",
  messaging: "messages",
  maintenance: "maintenanceRequests",
  documents: "documentAccess",
};

export default function TenantPortalPage() {
  const activeCurrency = useActiveCurrency();
  const [portalFeatures, setPortalFeatures] = useState([
    {
      id: "rent-payment",
      icon: DollarSign,
      title: "Rent Payment",
      description: "Pay rent online with multiple payment options",
      enabled: true,
    },
    {
      id: "messaging",
      icon: MessageSquare,
      title: "Messaging",
      description: "Communicate directly with property managers",
      enabled: true,
    },
    {
      id: "maintenance",
      icon: Wrench,
      title: "Maintenance Requests",
      description: "Submit and track maintenance issues",
      enabled: true,
    },
    {
      id: "documents",
      icon: FileText,
      title: "Documents",
      description: "Access lease and important documents",
      enabled: true,
    },
  ]);

  const { tenants, properties } = useAppData();
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<string>("");

  // Load tenants, properties, and payments data on mount
  useEffect(() => {
    setPayments(listPayments());
    const onPaymentsUpdated = () => setPayments(listPayments());
    if (typeof window !== "undefined")
      window.addEventListener("paymentsUpdated", onPaymentsUpdated);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("paymentsUpdated", onPaymentsUpdated);
    };
  }, []);

  // Calculate statistics from real tenant and payment data
  const tenantStats = useMemo(() => {
    const totalTenants = tenants.length;
    const activePortals = tenants.filter((t) => t.status === "active").length;
    const pendingAccess = totalTenants - activePortals;

    // Calculate payment success rate from actual payment data
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(
      (p) => p.status === "completed",
    ).length;
    const paymentSuccessRate =
      totalPayments > 0
        ? `${Math.round((successfulPayments / totalPayments) * 100)}%`
        : "0%";

    return {
      totalTenants: totalTenants.toString(),
      activePortals: activePortals.toString(),
      pendingAccess: pendingAccess.toString(),
      paymentSuccessRate,
    };
  }, [tenants, payments]);

  // Create mock invitations based on real tenants
  const tenantInvitations = useMemo(() => {
    return tenants.slice(0, 5).map((tenant, idx) => {
      const statuses = ["Sent", "Accepted", "Pending"];
      const dates = [
        "2024-02-05",
        "2024-02-03",
        "2024-02-01",
        "2024-01-28",
        "2024-01-25",
      ];
      return {
        id: tenant.id,
        tenant: tenant.name,
        email: tenant.email,
        date: dates[idx % dates.length],
        status: statuses[idx % statuses.length],
      };
    });
  }, [tenants]);

  // Enrich tenants with property names and additional data
  const enrichedTenants = useMemo(() => {
    return tenants.map((tenant) => {
      const property = properties.find((p) => p.id === tenant.propertyId);
      return {
        ...tenant,
        propertyName: property?.name || "Unknown Property",
        lastActive: "Never",
        portalStatus: tenant.status === "active" ? "Active" : "Inactive",
      };
    });
  }, [tenants, properties]);

  const handleTenantAction = (
    tenant: any & {
      propertyName: string;
      lastActive: string;
      portalStatus: string;
    },
    action: string,
  ) => {
    setSelectedTenant(tenant);
    setDialogAction(action);
    setTenantDialogOpen(true);
  };

  const handleConfirmAction = () => {
    switch (dialogAction) {
      case "ban":
        console.log("Banning tenant:", selectedTenant?.name);
        alert(
          `Tenant ${selectedTenant?.name} has been banned from the portal.`,
        );
        break;
      case "message":
        console.log("Opening message for tenant:", selectedTenant?.name);
        alert(`Opening message composer for ${selectedTenant?.name}`);
        // Here you could navigate to messages or open a message dialog
        break;
      case "profile":
        console.log("Viewing profile for tenant:", selectedTenant?.name);
        alert(`Opening profile for ${selectedTenant?.name}`);
        // Here you could navigate to tenant profile page
        break;
    }
    setTenantDialogOpen(false);
    setSelectedTenant(null);
    setDialogAction("");
  };

  const updatePortalFeaturesFromSettings = () => {
    const tenantSettings =
      getTenantPortalSettings() ??
      initializeSystemSettings().tenantPortalSettings;

    if (tenantSettings?.featureToggles) {
      setPortalFeatures((prev) =>
        prev.map((feature) => ({
          ...feature,
          enabled:
            tenantSettings.featureToggles[
              featureToggleMap[feature.id] ?? feature.id
            ] ?? feature.enabled,
        })),
      );
    }
  };

  useEffect(() => {
    updatePortalFeaturesFromSettings();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "propman:v1") {
        updatePortalFeaturesFromSettings();
      }
    };

    const handleSettingsChanged = () => {
      updatePortalFeaturesFromSettings();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "system-settings-changed",
      handleSettingsChanged as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "system-settings-changed",
        handleSettingsChanged as EventListener,
      );
    };
  }, []);

  const handleFeatureToggle = (featureId: string) => {
    setPortalFeatures((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature,
      ),
    );
  };

  const handleSaveSettings = () => {
    const settingsUpdates = portalFeatures.reduce(
      (acc, feature) => {
        const settingKey = featureToggleMap[feature.id];
        if (settingKey) {
          acc[settingKey] = feature.enabled;
        }
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const updatedSettings = updateFeatureToggles(settingsUpdates);
    if (updatedSettings) {
      alert("Settings saved successfully!");
    } else {
      alert("Failed to save tenant portal settings.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Tenant Portal
        </h1>
        <p className="text-muted-foreground">
          Manage tenant access and portal features
        </p>
      </div>

      {/* Portal Features */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Available Features
          </h2>
          <Button
            onClick={handleSaveSettings}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portalFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`border p-4 ${
                  feature.enabled
                    ? "border-primary/30 bg-primary/5"
                    : "border-border opacity-50"
                }`}
              >
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-foreground text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  {feature.description}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {feature.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Tenants */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Tenant Portal Access
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                  Tenant Name
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">
                  Property
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">
                  Last Active
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedTenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No tenants found
                  </td>
                </tr>
              ) : (
                enrichedTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-b border-border hover:bg-secondary"
                  >
                    <td className="py-3 px-2 text-foreground font-medium">
                      {tenant.name}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                      {tenant.propertyName}
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tenant.portalStatus === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tenant.portalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell text-xs">
                      {tenant.lastActive}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/dashboard/communications`}
                              className="flex items-center"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Message
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleTenantAction(tenant, "profile")
                            }
                          >
                            <User className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTenantAction(tenant, "ban")}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban from Portal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Portal Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tenants",
            value: tenantStats.totalTenants,
            icon: Users,
          },
          {
            label: "Active Portals",
            value: tenantStats.activePortals,
            icon: CheckCircle,
          },
          {
            label: "Pending Access",
            value: tenantStats.pendingAccess,
            icon: Clock,
          },
          {
            label: "Payment Success Rate",
            value: tenantStats.paymentSuccessRate,
            icon: DollarSign,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-border p-4">
              <Icon className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs md:text-sm text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Invitations */}
      <Card className="border border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-foreground">
            Send Invitations
          </h3>
          <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Send New</span>
          </Button>
        </div>

        <div className="space-y-3">
          {tenantInvitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invitations sent yet
            </div>
          ) : (
            tenantInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="mb-3 sm:mb-0">
                  <p className="font-medium text-foreground text-sm md:text-base">
                    {invitation.tenant}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {invitation.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground">
                    {invitation.date}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      invitation.status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : invitation.status === "Sent"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {invitation.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Tenant Action Dialog */}
      <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "ban" && "Ban Tenant from Portal"}
              {dialogAction === "message" && "Send Message"}
              {dialogAction === "profile" && "View Tenant Profile"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "ban" &&
                `Are you sure you want to ban ${selectedTenant?.name} from accessing the tenant portal? This action cannot be undone.`}
              {dialogAction === "message" &&
                `Send a message to ${selectedTenant?.name}.`}
              {dialogAction === "profile" &&
                `View detailed profile information for ${selectedTenant?.name}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTenantDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                dialogAction === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              }
            >
              {dialogAction === "ban" && "Ban Tenant"}
              {dialogAction === "message" && "Send Message"}
              {dialogAction === "profile" && "View Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
