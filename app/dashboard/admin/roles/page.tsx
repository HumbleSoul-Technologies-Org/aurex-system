"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Crown,
  Building,
  User,
  Check,
  X,
  ArrowRight,
  Info,
} from "lucide-react";
import PermissionMatrix from "../users/components/permission-matrix";

export default function AdminRolesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const roles = [
    {
      id: "admin",
      name: "Administrator",
      icon: Crown,
      description: "Full system access with all administrative privileges",
      color: "text-red-600",
      bgColor: "bg-red-50",
      badgeColor: "bg-red-100 text-red-800",
      permissions: [
        "View Dashboard",
        "Manage Users",
        "Create Users",
        "Edit Users",
        "Delete Users",
        "Manage Roles",
        "View Reports",
        "Edit Settings",
        "View Audit Logs",
      ],
    },
    {
      id: "property_manager",
      name: "Property Manager",
      icon: Building,
      description: "Manage properties, tenants, and generate reports",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-800",
      permissions: [
        "View Dashboard",
        "View Reports",
        "Manage Properties",
        "Manage Tenants",
        "Send Announcements",
      ],
    },
    {
      id: "tenant",
      name: "Tenant",
      icon: User,
      description: "View personal information and submit requests",
      color: "text-green-600",
      bgColor: "bg-green-50",
      badgeColor: "bg-green-100 text-green-800",
      permissions: [
        "View Dashboard",
        "View Personal Lease",
        "View Payment History",
        "Submit Maintenance Request",
        "Send Messages",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Roles & Permissions
        </h1>
        <p className="text-muted-foreground">
          View and manage system roles and their permissions
        </p>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 text-sm">About Roles</p>
            <p className="text-xs text-blue-700 mt-1">
              Roles determine what features and data users can access in the
              system. Each role has a predefined set of permissions that cannot
              be customized. To assign roles to users, go to the User Management
              page.
            </p>
          </div>
        </div>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card key={role.id} className={`p-6 ${role.bgColor} border-l-4`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.bgColor}`}>
                    <Icon className={`w-5 h-5 ${role.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {role.name}
                    </h3>
                  </div>
                </div>
                <Badge className={role.badgeColor}>{role.id}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {role.description}
              </p>

              {/* Permissions List */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-foreground">
                  Key Permissions:
                </p>
                <ul className="space-y-1">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-xs">
                      <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Users Count */}
              <div className="pt-4 border-t border-current border-opacity-10">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm h-auto p-0"
                  onClick={() =>
                    router.push(`/dashboard/admin/users?role=${role.id}`)
                  }
                >
                  <span className="text-muted-foreground">View users</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix />

      {/* Role Assignment Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Assigning Roles
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="font-medium text-foreground mb-2">Single User</p>
            <p className="text-sm text-muted-foreground">
              Go to the User Management page, find the user, click Edit, and
              select a new role from the dropdown menu.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="font-medium text-foreground mb-2">Multiple Users</p>
            <p className="text-sm text-muted-foreground">
              In the User Management page, select multiple users using the
              checkboxes, then click the "Assign Role" button to bulk update
              their roles.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-medium text-yellow-900 mb-2">⚠️ Important</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Changing a user's role immediately affects what they can
                access
              </li>
              <li>
                • Admins can assign roles, but be careful not to remove your own
                admin access
              </li>
              <li>
                • Custom roles are not supported; all roles are system-defined
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={() => router.push("/dashboard/admin/users")}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Users className="w-4 h-4" />
          Go to User Management
        </Button>
      </div>
    </div>
  );
}
