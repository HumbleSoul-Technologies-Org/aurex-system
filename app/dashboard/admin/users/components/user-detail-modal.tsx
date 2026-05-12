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
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { AdminUser, resendVerificationEmail } from "@/lib/services/adminApi";

interface UserDetailModalProps {
  user: AdminUser;
  onClose: () => void;
}

export default function UserDetailModal({
  user,
  onClose,
}: UserDetailModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendResult, setResendResult] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const getRoleLabel = (role: string) => {
    return role === "property_manager" ? "Property Manager" : role;
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canResendVerification =
    ["admin", "property_manager"].includes(user.role) && !user.emailVerified;

  const handleResendVerification = async () => {
    setResendError(null);
    setResendResult(null);
    setIsResending(true);

    try {
      const response = await resendVerificationEmail(user.id);
      if (response.success) {
        setResendResult(
          response.message || "Verification email resent successfully.",
        );
      } else {
        setResendError(
          response.error || "Failed to resend verification email.",
        );
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View user information and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className={getRoleColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Badge className={getStatusColor(user.status)}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
              {user.emailVerified && (
                <Badge className="bg-blue-100 text-blue-800">
                  Email Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-foreground">Account Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm text-foreground">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {user.lastLoginAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Last Login
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Login Attempts
                </span>
                <span className="text-sm text-foreground">
                  {user.loginAttempts}
                </span>
              </div>
            </div>
          </div>

          {canResendVerification && (
            <div className="space-y-3 border-t pt-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  This user's email has not been verified yet. You can resend
                  the verification email.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? "Resending..." : "Resend Verification"}
                  </Button>
                  {resendResult && (
                    <span className="text-sm text-green-700">
                      {resendResult}
                    </span>
                  )}
                  {resendError && (
                    <span className="text-sm text-red-700">{resendError}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
