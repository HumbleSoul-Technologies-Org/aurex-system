"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminUser,
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "@/lib/services/adminApi";
import { listProperties, PropertyRecord } from "@/lib/services/properties";
import {
  AlertCircle,
  Edit,
  Loader2,
  Lock,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const statusOptions = ["all", "active", "inactive", "locked"] as const;

type UserStatusFilter = (typeof statusOptions)[number];

function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  showPasswordField,
  properties,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status?: "active" | "inactive" | "locked";
    password?: string;
    propertyId?: string;
  }) => Promise<void>;
  initialData?: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: "active" | "inactive" | "locked";
    propertyId: string;
  }>;
  title: string;
  showPasswordField?: boolean;
  properties?: PropertyRecord[];
}) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [status, setStatus] = useState<"active" | "inactive" | "locked">(
    initialData?.status || "active",
  );
  const [propertyId, setPropertyId] = useState(initialData?.propertyId || "");
  const [propertySearch, setPropertySearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(initialData?.firstName || "");
    setLastName(initialData?.lastName || "");
    setEmail(initialData?.email || "");
    setPhone(initialData?.phone || "");
    setStatus(initialData?.status || "active");
    setPropertyId(initialData?.propertyId || "");
    setPropertySearch("");
    setPassword("");
    setError(null);
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email) {
      setError("Please fill in the required fields.");
      return;
    }

    if (showPasswordField && !password) {
      setError("Please enter a password for the new security guard.");
      return;
    }

    if (!propertyId) {
      setError("Please select a property for the security guard.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        status,
        password: showPasswordField ? password : undefined,
        propertyId,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProperties = (properties || []).filter((prop) =>
    (prop.name || "").toLowerCase().includes(propertySearch.toLowerCase()),
  );
  const selectedProperty = (properties || []).find(
    (p) => (p.id || p._id) === propertyId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Manage security guard profile information for login access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guard-first-name">First Name</Label>
              <Input
                id="guard-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <Label htmlFor="guard-last-name">Last Name</Label>
              <Input
                id="guard-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guard-email">Email</Label>
              <Input
                id="guard-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="security@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="guard-phone">Phone</Label>
              <Input
                id="guard-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional phone number"
              />
            </div>
          </div>
          {showPasswordField && (
            <div>
              <Label htmlFor="guard-password">Password</Label>
              <Input
                id="guard-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Password must be at least 8 characters and include uppercase,
                lowercase, and a number.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="guard-property">Assigned Property</Label>
            <div className="space-y-2">
              <Input
                id="guard-property-search"
                type="text"
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                placeholder="Search properties..."
                className="mb-2"
              />
              {propertySearch || propertyId ? (
                <div className="border rounded-md bg-muted max-h-48 overflow-y-auto">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((prop, index) => (
                      <div
                        key={prop.id || prop._id || `${prop.name}-${index}`}
                        className={`px-3 py-2 cursor-pointer hover:bg-accent ${
                          (prop.id || prop._id) === propertyId
                            ? "bg-primary/20 border-l-2 border-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setPropertyId(prop.id || prop._id || "");
                          setPropertySearch("");
                        }}
                      >
                        <div className="font-medium">{prop.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {prop.city || prop.address}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No properties found
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md bg-muted max-h-48 overflow-y-auto">
                  {(properties || []).length > 0 ? (
                    (properties || []).map((prop, index) => (
                      <div
                        key={prop.id || prop._id || `${prop.name}-${index}`}
                        className="px-3 py-2 cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setPropertyId(prop.id || prop._id || "");
                          setPropertySearch("");
                        }}
                      >
                        <div className="font-medium">{prop.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {prop.city || prop.address}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No properties available
                    </div>
                  )}
                </div>
              )}
              {selectedProperty && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-sm text-blue-700">
                  <strong>Selected:</strong> {selectedProperty.name}
                </div>
              )}
            </div>
          </div>

          <div className="w-64">
            <Label htmlFor="guard-status">Account Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as any)}
            >
              <SelectTrigger id="guard-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-white"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Guard"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const resolveUserId = (user: AdminUser | { _id?: string } | null) =>
    user?.id || (user as any)?._id || "";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [usersResponse, loadedProperties] = await Promise.all([
          listAdminUsers({
            role: "security_guard",
            status: statusFilter === "all" ? undefined : statusFilter,
            search: search || undefined,
            limit: 100,
          }),
          Promise.resolve(listProperties()),
        ]);
        setUsers(usersResponse.data.users || []);
        setProperties(loadedProperties);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [search, statusFilter, refreshIndex]);

  const refreshUsers = () => setRefreshIndex((value) => value + 1);

  const handleCreate = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status?: "active" | "inactive" | "locked";
    password?: string;
    propertyId?: string;
  }) => {
    await createAdminUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      role: "security_guard",
      password: payload.password,
      propertyId: payload.propertyId,
    });
    refreshUsers();
  };

  const handleEdit = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status?: "active" | "inactive" | "locked";
    propertyId?: string;
  }) => {
    if (!editingUser) return;
    const userId = resolveUserId(editingUser);
    if (!userId) {
      throw new Error("Unable to update user: missing user ID.");
    }

    await updateAdminUser(userId, payload);
    refreshUsers();
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    const userId = resolveUserId(user);
    setActionInProgress(userId);
    try {
      await deleteAdminUser(userId);
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleLock = async (user: AdminUser) => {
    const userId = resolveUserId(user);
    setActionInProgress(userId);
    try {
      await updateAdminUser(userId, {
        status: user.status === "locked" ? "active" : "locked",
      });
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Security Guards
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Create and manage security guard user accounts. You can update their
            profile, ban or unban access, and remove accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Guard
          </Button>
          <Button variant="outline" onClick={refreshUsers} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border border-border p-4">
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]">
          <div>
            <Label htmlFor="guard-search">Search Guards</Label>
            <div className="relative">
              <Input
                id="guard-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="pr-10"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div>
            <Label htmlFor="guard-status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as UserStatusFilter)
              }
            >
              <SelectTrigger id="guard-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-border overflow-x-auto">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="min-h-[240px]">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            {users.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No security guards found. Use the button above to add a new
                guard.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Property
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user, index) => (
                    <tr key={user.id || `${user.email}-${index}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.role.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phone || "—"}</td>
                      <td className="px-4 py-3">
                        {user.assignedProperty?.name ||
                          properties.find(
                            (p) => (p.id || p._id) === user.propertyId,
                          )?.name ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : user.status === "locked"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setEditingUser({
                                ...user,
                                id: resolveUserId(user),
                              } as AdminUser)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleLock(user)}
                            disabled={actionInProgress === resolveUserId(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            disabled={actionInProgress === resolveUserId(user)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      <UserFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Security Guard"
        onSubmit={handleCreate}
        showPasswordField={true}
        properties={properties}
      />

      <UserFormDialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        title="Edit Security Guard"
        initialData={
          editingUser
            ? {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                email: editingUser.email,
                phone: editingUser.phone || "",
                status: editingUser.status,
                propertyId:
                  editingUser.propertyId ||
                  editingUser.assignedProperty?.id ||
                  editingUser.assignedProperty?._id ||
                  "",
              }
            : undefined
        }
        onSubmit={handleEdit}
        properties={properties}
      />
    </div>
  );
}
