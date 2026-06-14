"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Lock,
  Unlock,
  CheckSquare,
  Square,
} from "lucide-react";
import { AdminTableSkeleton, Skeleton } from "@/components/ui/skeleton";
import { listAdminUsers, AdminUser } from "@/lib/services/adminApi";
import UserDetailModal from "./components/user-detail-modal";
import CreateUserModal from "./components/create-user-modal";
import EditUserModal from "./components/edit-user-modal";
import BulkRoleAssignmentModal from "./components/bulk-role-assignment-modal";
import LockUnlockModal from "./components/lock-unlock-modal";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const {
    data: usersData,
    isLoading,
    isError,
    error: queryError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      "adminUsers",
      searchQuery,
      roleFilter,
      statusFilter,
      currentPage,
      pageSize,
    ],
    queryFn: async () =>
      listAdminUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: Boolean(user),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  const users = usersData?.data.users ?? [];
  const totalUsers = usersData?.data.total ?? users.length;
  const totalPages = usersData?.data.pages ?? 1;
  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load users"
    : null;
  const loading = isLoading;

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showLockUnlockModal, setShowLockUnlockModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listAdminUsers({
          role: roleFilter === "all" ? undefined : roleFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: searchQuery || undefined,
          limit: 100,
        });

        if (response.success) {
          setUsers(response.data.users);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-50";
      case "property_manager":
        return "text-blue-600 bg-blue-50";
      case "tenant":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      case "locked":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const getSelectedUsersData = () => {
    return users.filter((u) => selectedUsers.has(u.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <p className="font-medium text-blue-900">
              {selectedUsers.size} user(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkRoleModal(true)}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Assign Role
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUsers(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="property_manager">Property Manager</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-12 rounded-full w-full" />
              <Skeleton className="h-12 rounded-full w-full" />
              <Skeleton className="h-12 rounded-full w-full" />
            </div>
            <AdminTableSkeleton rowCount={6} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-12">
                    <button
                      onClick={toggleAllSelection}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {selectedUsers.size === filteredUsers.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b hover:bg-muted/50">
                    <TableCell>
                      <button
                        onClick={() => toggleUserSelection(u.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {selectedUsers.has(u.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          u.role,
                        )}`}
                      >
                        {u.role === "property_manager"
                          ? "Property Manager"
                          : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          u.status,
                        )}`}
                      >
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDetailModal(true);
                          }}
                          title="View user details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowLockUnlockModal(true);
                          }}
                          title={
                            u.status === "locked"
                              ? "Unlock account"
                              : "Lock account"
                          }
                        >
                          {u.status === "locked" ? (
                            <Unlock className="w-4 h-4 text-green-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowEditModal(true);
                          }}
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Result Count */}
      {!loading && (
        <div className="flex flex-col gap-3 sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} users on page {currentPage} of {totalPages}{" "}
            (total {totalUsers})
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            >
              Next
            </Button>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <>
          {showDetailModal && (
            <UserDetailModal
              user={selectedUser}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedUser(null);
              }}
            />
          )}
          {showEditModal && (
            <EditUserModal
              user={selectedUser}
              onClose={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              onSave={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                refetchUsers();
              }}
            />
          )}
          {showLockUnlockModal && (
            <LockUnlockModal
              user={selectedUser}
              onClose={() => {
                setShowLockUnlockModal(false);
                setSelectedUser(null);
              }}
              onSuccess={() => {
                setShowLockUnlockModal(false);
                setSelectedUser(null);
                refetchUsers();
              }}
            />
          )}
        </>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedUsers(new Set());
            refetchUsers();
          }}
        />
      )}

      {showBulkRoleModal && selectedUsers.size > 0 && (
        <BulkRoleAssignmentModal
          users={getSelectedUsersData()}
          onClose={() => setShowBulkRoleModal(false)}
          onSuccess={() => {
            setShowBulkRoleModal(false);
            setSelectedUsers(new Set());
            refetchUsers();
          }}
        />
      )}
    </div>
  );
}
