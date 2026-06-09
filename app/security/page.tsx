"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/data-context";
import {
  createVisit,
  listVisits,
  VisitRecord,
  VisitStatus,
} from "@/lib/services/visits";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Home,
  FileText,
  LogOut,
} from "lucide-react";

const visitStatuses: VisitStatus[] = [
  "scheduled",
  "checked_in",
  "checked_out",
  "cancelled",
  "completed",
];

export default function SecurityPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [hostTenantId, setHostTenantId] = useState("");
  const [hostTenantName, setHostTenantName] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [visitTime, setVisitTime] = useState("09:00");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<VisitStatus>("scheduled");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentVisits, setRecentVisits] = useState<VisitRecord[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { properties, tenants } = useAppData();

  const selectedProperty = useMemo(() => {
    const effectivePropertyId =
      propertyId || user?.propertyId || user?.assignedProperty?.id || "";

    const matchedProperty = properties.find(
      (property) =>
        property.id === effectivePropertyId ||
        property._id === effectivePropertyId,
    );

    if (matchedProperty) {
      return matchedProperty;
    }

    if (user?.assignedProperty) {
      const assignedPropertyId =
        user.assignedProperty.id || user.assignedProperty._id || "";
      if (assignedPropertyId && assignedPropertyId === effectivePropertyId) {
        return user.assignedProperty as any;
      }
    }

    return null;
  }, [properties, propertyId, user?.propertyId, user?.assignedProperty]);

  const propertyTenants = useMemo(() => {
    if (!selectedProperty) return [];
    const selectedPropertyId =
      selectedProperty.id || selectedProperty._id || "";

    const directPropertyTenants = Array.isArray(selectedProperty.tenants)
      ? selectedProperty.tenants
          .map((tenant: any) => ({
            ...tenant,
            id: tenant.id || tenant._id || "",
            propertyId: tenant.propertyId || selectedPropertyId,
          }))
          .filter((tenant: any) => Boolean(tenant.id))
      : [];

    if (directPropertyTenants.length > 0) {
      return directPropertyTenants;
    }

    const assignedPropertyTenants = Array.isArray(
      user?.assignedProperty?.tenants,
    )
      ? user.assignedProperty.tenants
          .map((tenant: any) => ({
            ...tenant,
            id: tenant.id || tenant._id || "",
            propertyId: tenant.propertyId || selectedPropertyId,
          }))
          .filter((tenant: any) => Boolean(tenant.id))
      : [];

    if (assignedPropertyTenants.length > 0) {
      return assignedPropertyTenants;
    }

    return tenants.filter((tenant) => tenant.propertyId === selectedPropertyId);
  }, [selectedProperty, tenants, user?.assignedProperty?.tenants]);

  const selectedHostTenant = useMemo(
    () =>
      propertyTenants.find(
        (tenant) => tenant.id === hostTenantId || tenant._id === hostTenantId,
      ) ?? null,
    [propertyTenants, hostTenantId],
  );

  useEffect(() => {
    if (selectedProperty && !propertyId) {
      setPropertyId(selectedProperty.id || selectedProperty._id || "");
      setPropertyName(selectedProperty.name);
      return;
    }

    if (!selectedProperty && user?.assignedProperty && !propertyId) {
      setPropertyId(user.assignedProperty.id || "");
      setPropertyName(user.assignedProperty.name || "");
    }
  }, [selectedProperty, propertyId, user?.assignedProperty]);

  useEffect(() => {
    if (selectedProperty) {
      setPropertyName(selectedProperty.name);
    } else if (user?.assignedProperty) {
      setPropertyName(user.assignedProperty.name || "");
    }
  }, [selectedProperty, user?.assignedProperty]);

  useEffect(() => {
    if (selectedHostTenant) {
      setHostTenantName(selectedHostTenant.name);
    } else {
      setHostTenantName("");
    }
  }, [selectedHostTenant]);

  useEffect(() => {
    setHostTenantId("");
  }, [selectedProperty?.id]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role !== "security_guard") {
      router.push("/auth/login");
    }
  }, [router, user, isLoading]);

  useEffect(() => {
    const loadVisits = async () => {
      if (!user) return;
      setVisitsLoading(true);
      try {
        const response = await listVisits({ guardId: user.id, limit: 10 });
        setRecentVisits(response.data.visits || []);
      } catch (err) {
        console.error("Failed to load recent visits", err);
      } finally {
        setVisitsLoading(false);
      }
    };

    loadVisits();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError("Unable to determine security guard profile.");
      return;
    }

    if (!visitorName || !visitDate || !visitTime) {
      setError("Please enter at least a visitor name, date, and time.");
      return;
    }

    setLoading(true);

    try {
      await createVisit({
        securityGuardId: user.id,
        securityGuardName: `${user.firstName} ${user.lastName}`,
        visitorName,
        visitorPhone: visitorPhone || undefined,
        propertyId:
          selectedProperty?.id ||
          propertyId ||
          user?.assignedProperty?.id ||
          undefined,
        propertyName:
          selectedProperty?.name ||
          propertyName ||
          user?.assignedProperty?.name ||
          undefined,
        hostTenantId: selectedHostTenant?.id || hostTenantId || undefined,
        hostTenantName: selectedHostTenant?.name || hostTenantName || undefined,
        visitDate,
        visitTime,
        purpose: purpose || undefined,
        notes: notes || undefined,
        status,
      });

      setSuccess(true);
      setVisitorName("");
      setVisitorPhone("");
      setPropertyId("");
      setPropertyName("");
      setHostTenantId("");
      setHostTenantName("");
      setPurpose("");
      setNotes("");
      setStatus("scheduled");

      const response = await listVisits({ guardId: user.id, limit: 10 });
      setRecentVisits(response.data.visits || []);
    } catch (err: any) {
      setError(err?.message || "Failed to create visit record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header with logout button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Security Guard Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="gap-2"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-5 h-5 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Visitor Log
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create visitor records and keep a quick log of recent entries.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="inline-block h-4 w-4 mr-2 align-text-bottom" />
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2 className="inline-block h-4 w-4 mr-2 align-text-bottom" />
                  Visit record created successfully.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input
                    id="visitorName"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="visitorPhone">Phone</Label>
                  <Input
                    id="visitorPhone"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="propertyId">Property / Location</Label>
                  {user?.propertyId ||
                  user?.assignedProperty ||
                  selectedProperty ? (
                    <Input
                      id="propertyId"
                      value={propertyName || "Loading property..."}
                      readOnly
                      placeholder="Assigned property"
                    />
                  ) : (
                    <Select value={propertyId} onValueChange={setPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="hostTenant">Host Tenant</Label>
                  <div className="mt-2">
                    <SearchableSelect
                      options={propertyTenants.map((tenant) => ({
                        value: tenant.id,
                        label: tenant.name || "Unnamed tenant",
                        description: [
                          tenant.phone ? `Phone: ${tenant.phone}` : null,
                          tenant.unitNumber
                            ? `Unit: ${tenant.unitNumber}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" • "),
                      }))}
                      value={hostTenantId || null}
                      onValueChange={(value) => {
                        setHostTenantId(value || "");
                        const tenant = propertyTenants.find(
                          (item) => item.id === value,
                        );
                        setHostTenantName(tenant?.name || "");
                      }}
                      placeholder={
                        selectedProperty
                          ? "Search tenants by name, phone, or unit"
                          : "Select a property first"
                      }
                      emptyMessage="No tenants found"
                      className="w-full"
                      disabled={
                        !selectedProperty || propertyTenants.length === 0
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="visitDate">Visit Date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="visitTime">Visit Time</Label>
                  <Input
                    id="visitTime"
                    type="time"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="relative">
                    <select
                      id="status"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as VisitStatus)}
                    >
                      {visitStatuses.map((item) => (
                        <option key={item} value={item}>
                          {item.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any extra details for the record"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Create Visit"
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Visits
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest visit records created by you.
                </p>
              </div>
            </div>

            {visitsLoading ? (
              <div className="flex min-h-[180px] items-center justify-center text-muted-foreground">
                Loading recent visits...
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent visits yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {visit.visitorName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visit.propertyName ||
                            visit.hostTenantName ||
                            "Unknown location"}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>
                          {visit.visitDate} {visit.visitTime}
                        </p>
                        <p className="capitalize">
                          {visit.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
