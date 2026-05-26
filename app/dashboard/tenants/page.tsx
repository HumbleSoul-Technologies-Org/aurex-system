"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddTenantForm from "@/components/forms/add-tenant-form";
import { createTenantApi, TenantRecord } from "@/lib/services/tenants";
import { useAppData } from "@/lib/data-context";
import { queryClient } from "@/lib/query-client";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  ArrowRight,
  MoreVertical,
  Eye,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "due" | "moving-out"
  >("all");

  const activeCurrency = useActiveCurrency();

  const [showAddForm, setShowAddForm] = useState(false);

  const { tenants, properties } = useAppData();
  const { token } = useAuth();

  const enrichedTenants = tenants.map((tenant) => {
    const property =
      properties.find(
        (p) => p.id === tenant.propertyId || p._id === tenant.propertyId,
      ) || null;
    return {
      ...tenant,
      property,
    };
  });

  const filteredTenants = enrichedTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "paid") {
      matchesStatus = tenant.status === "paid";
    } else if (filterStatus === "due") {
      matchesStatus = tenant.status === "due";
    } else if (filterStatus === "moving-out") {
      matchesStatus = tenant.status === "moving out";
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (tenant: (typeof enrichedTenants)[number]) => {
    if (tenant.status === "moving out")
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    if (tenant.status === "due")
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
  };

  const getStatusLabel = (tenant: (typeof enrichedTenants)[number]) => {
    if (tenant.status === "moving out") return "leaving";
    if (tenant.status === "due") return "Due";
    return "Paid";
  };

  const calculateLeaseEnd = (leaseStart: string, leaseType: string) => {
    const startDate = new Date(leaseStart);
    let months = 1;

    if (leaseType === "full year") {
      months = 12;
    } else if (leaseType === "6mnths") {
      months = 6;
    } else if (leaseType === "3mnths") {
      months = 3;
    } else if (leaseType === "monthly") {
      months = 1;
    }

    const leaseEnd = new Date(startDate);
    leaseEnd.setMonth(leaseEnd.getMonth() + months);
    return leaseEnd;
  };

  const handleAddTenant = async (data: any) => {
    try {
      const payload: Partial<TenantRecord> = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        tenantType: data.tenantType,
        unitNumber: data.unitNumber,
        propertyId: data.propertyId,
        rentAmount: data.monthlyRent,
        leaseType: data.leaseType,
        leaseStartDate: data.leaseStartDate,
        leaseRenewDate: data.leaseRenewDate,
        leaseEndDate: data.leaseEndDate,
        leaseTerms: data.leaseTerms,
        preferredContactMethod: data.preferredContactMethod,
        applicationDate: data.applicationDate,
        moveInDate: data.moveInDate,
        dateOfBirth: data.dateOfBirth,
        employmentInfo: data.employmentInfo,
        previousAddresses: data.previousAddresses
          ? data.previousAddresses.split("\n").filter(Boolean)
          : undefined,
        coSigner: data.coSigner,
        pets: data.pets,
        vehicles: data.vehicles,
        businessInfo: data.businessInfo,
        businessContacts: data.businessContacts,
        financialInfo: data.financialInfo,
        securityDeposit: data.securityDeposit,
        emergencyContact: data.emergencyContact,
        notes: data.notes,
        status: "due",
      };
      const tenant = await createTenantApi(payload, token || undefined);
      queryClient.invalidateQueries({
        queryKey: ["tenants"] as const,
      });
      console.log("New tenant created:", tenant);
    } catch (error) {
      console.error("Failed to create tenant:", error);
      alert("Failed to create tenant. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <AddTenantForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTenant}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Tenants</h1>
          <p className="text-muted-foreground">
            Manage tenant information, leases, and communications
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border  border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="paid">Rent Paid</option>
              <option value="due">Payment Due</option>
              <option value="moving-out">Moving Out</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card className="border  border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Monthly Rent
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Lease Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Lease Start
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Lease End
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant, index) => (
                <tr
                  key={tenant.id || index}
                  className="border-b border-border hover:bg-secondary transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {tenant.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-blue-600">
                    <Link
                      className="hover:underline"
                      href={
                        tenant.property
                          ? `/dashboard/properties/${tenant.property.id || tenant.property._id}`
                          : "#"
                      }
                    >
                      {tenant.property ? tenant.property.name : "N/A"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {tenant.unitNumber || "--"}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <a
                      href={`mailto:${tenant.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {tenant.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <a
                      href={`tel:${tenant.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {tenant.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatCurrency(tenant.rentAmount ?? 0, activeCurrency)}
                  </td>
                  <td className="px-6 py-4 text-xs text-foreground capitalize">
                    {(tenant.leaseType || "").replace("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant)}`}
                    >
                      {getStatusLabel(tenant)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {tenant.leaseStartDate
                      ? new Date(tenant.leaseStartDate).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {tenant.leaseEndDate
                      ? new Date(tenant.leaseEndDate).toLocaleDateString()
                      : tenant.leaseStartDate
                        ? calculateLeaseEnd(
                            tenant.leaseStartDate || "",
                            tenant.leaseType || "",
                          ).toLocaleDateString()
                        : "--"}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/tenants/${tenant.id || tenant._id}`}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border bg-transparent"
                      >
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <Card className="border flex justify-center items-center border-border flex-1 h-screen p-12 text-center">
          <span>
            <img
              src="/no-user.webp"
              alt="No tenants found"
              className="w-96 h-96 text-muted-foreground mx-auto mb-4 opacity-50"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tenants found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </span>
        </Card>
      )}
    </div>
  );
}
