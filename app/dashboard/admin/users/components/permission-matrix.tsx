"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PermissionMatrixProps {
  selectedRole?: string;
}

const rolePermissions: Record<string, Record<string, boolean>> = {
  admin: {
    "View Dashboard": true,
    "Manage Users": true,
    "Create Users": true,
    "Edit Users": true,
    "Delete Users": true,
    "Manage Roles": true,
    "View Reports": true,
    "Edit Settings": true,
    "Manage Properties": true,
    "Manage Tenants": true,
    "View Audit Logs": true,
    "Send Announcements": true,
  },
  property_manager: {
    "View Dashboard": true,
    "Manage Users": false,
    "Create Users": false,
    "Edit Users": false,
    "Delete Users": false,
    "Manage Roles": false,
    "View Reports": true,
    "Edit Settings": false,
    "Manage Properties": true,
    "Manage Tenants": true,
    "View Audit Logs": false,
    "Send Announcements": true,
  },
  tenant: {
    "View Dashboard": true,
    "Manage Users": false,
    "Create Users": false,
    "Edit Users": false,
    "Delete Users": false,
    "Manage Roles": false,
    "View Reports": false,
    "Edit Settings": false,
    "Manage Properties": false,
    "Manage Tenants": false,
    "View Audit Logs": false,
    "Send Announcements": false,
  },
};

export default function PermissionMatrix({
  selectedRole,
}: PermissionMatrixProps) {
  const roles = Object.keys(rolePermissions);
  const permissions = Object.keys(rolePermissions.admin);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "property_manager":
        return "bg-blue-100 text-blue-800";
      case "tenant":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Permission Matrix
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2">
              <th className="text-left p-2 font-semibold text-foreground">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role} className="text-center p-2 font-semibold">
                  <Badge className={getRoleColor(role)}>
                    {role === "property_manager" ? "Manager" : role}
                  </Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium text-foreground">
                  {permission}
                </td>
                {roles.map((role) => {
                  const hasPermission =
                    rolePermissions[role]?.[permission] || false;
                  return (
                    <td
                      key={`${role}-${permission}`}
                      className="text-center p-2"
                    >
                      {hasPermission ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <X className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const permissionCount = Object.values(rolePermissions[role]).filter(
            (v) => v,
          ).length;
          return (
            <div key={role} className="p-3 bg-muted/50 rounded-md border">
              <Badge className={`${getRoleColor(role)} mb-2`}>
                {role === "property_manager" ? "Manager" : role}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {permissionCount} of {permissions.length} permissions
              </p>
              {role === "admin" && (
                <p className="text-xs text-foreground font-medium mt-2">
                  Full system access
                </p>
              )}
              {role === "property_manager" && (
                <p className="text-xs text-foreground font-medium mt-2">
                  Manage properties and tenants
                </p>
              )}
              {role === "tenant" && (
                <p className="text-xs text-foreground font-medium mt-2">
                  View personal information
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
