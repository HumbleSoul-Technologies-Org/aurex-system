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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, CheckCircle, Lock, Unlock } from "lucide-react";
import { AdminUser, updateAdminUser } from "@/lib/services/adminApi";

interface LockUnlockModalProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LockUnlockModal({
  user,
  onClose,
  onSuccess,
}: LockUnlockModalProps) {
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "locked">(
    user.status,
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLocking = newStatus === "locked" && user.status !== "locked";
  const isUnlocking = newStatus !== "locked" && user.status === "locked";

  const handleUpdateStatus = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await updateAdminUser(user.id, {
        status: newStatus,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(response.error || "Failed to update user status");
      }
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
            <DialogTitle>Status Updated</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-foreground">
                User status updated successfully
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {user.firstName} {user.lastName}'s account is now{" "}
                <span className="font-medium">{newStatus}</span>.
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
          <DialogTitle>
            {isLocking && (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                Lock Account
              </div>
            )}
            {isUnlocking && (
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-600" />
                Unlock Account
              </div>
            )}
            {!isLocking && !isUnlocking && "Update Account Status"}
          </DialogTitle>
          <DialogDescription>
            {user.firstName} {user.lastName} ({user.email})
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

          {/* Current Status */}
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Current Status</p>
            <p className="text-sm font-medium text-foreground capitalize">
              {user.status}
            </p>
          </div>

          {/* Status Selection */}
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as any)}
              disabled={loading}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Descriptions */}
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex gap-2">
              <span>✓</span>
              <div>
                <p className="font-medium text-foreground">Active</p>
                <p>User can login and use all features</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span>−</span>
              <div>
                <p className="font-medium text-foreground">Inactive</p>
                <p>User can login but account is not active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span>✕</span>
              <div>
                <p className="font-medium text-foreground">Locked</p>
                <p>User cannot login (usually after failed attempts)</p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {isLocking && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-700 font-medium">
                ⚠️ Locking Account
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                The user will not be able to login until you unlock their
                account.
              </p>
            </div>
          )}

          {isUnlocking && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-green-700 font-medium">
                ✓ Unlocking Account
              </p>
              <p className="text-xs text-green-600 mt-1">
                The user will be able to login again.
              </p>
            </div>
          )}

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
              className={`flex-1 ${
                isLocking
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
              onClick={handleUpdateStatus}
              disabled={loading || newStatus === user.status}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading
                ? "Updating..."
                : isLocking
                  ? "Lock Account"
                  : isUnlocking
                    ? "Unlock Account"
                    : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
