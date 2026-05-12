"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { AdminUser, updateAdminUser } from "@/lib/services/adminApi";

interface BulkRoleAssignmentModalProps {
  users: AdminUser[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkRoleAssignmentModal({
  users,
  onClose,
  onSuccess,
}: BulkRoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "property_manager" | "tenant" | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleAssignRoles = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setError(null);
    setLoading(true);
    let successCount = 0;

    try {
      for (const user of users) {
        try {
          await updateAdminUser(user.id, {
            role: selectedRole as "admin" | "property_manager" | "tenant",
          });
          successCount++;
          setUpdated(successCount);
        } catch (err) {
          console.error(`Failed to update ${user.email}:`, err);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Roles Updated</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-foreground">
                Successfully updated {updated} user(s)
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                All selected users have been assigned to the{" "}
                <span className="font-medium">
                  {selectedRole?.replace(/_/g, " ")}
                </span>{" "}
                role.
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Redirecting back...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Role Assignment</DialogTitle>
          <DialogDescription>
            Assign a role to {users.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Selected Users */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700 font-medium">Selected Users</p>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {users.slice(0, 5).map((user) => (
                <p key={user.id} className="text-xs text-blue-600">
                  • {user.firstName} {user.lastName} ({user.email})
                </p>
              ))}
              {users.length > 5 && (
                <p className="text-xs text-blue-600">
                  • +{users.length - 5} more user(s)
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">New Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as any)}
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="property_manager">
                  Property Manager
                </SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-700 font-medium">⚠️ Warning</p>
            <p className="text-xs text-yellow-600 mt-1">
              This action will change the role for all {users.length} selected
              user(s). This cannot be easily undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAssignRoles}
              disabled={loading || !selectedRole}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Updating..." : "Assign Roles"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
