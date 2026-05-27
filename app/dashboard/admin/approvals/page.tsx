"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  listApprovalRequests,
  approveApprovalRequest,
  rejectApprovalRequest,
  ApprovalRequest,
} from "@/lib/services/admin-approval";
import { createAdminUser } from "@/lib/services/adminApi";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import {
  AdminCardListSkeleton,
  AdminSkeletonHeader,
  Skeleton,
} from "@/components/ui/skeleton";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check authorization
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load approvals
  useEffect(() => {
    try {
      const requests = listApprovalRequests();
      setApprovals(requests);
    } catch (err) {
      setErrorMessage("Failed to load approval requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Create the user via admin API
      const response = await createAdminUser({
        firstName: selectedApproval.firstName,
        lastName: selectedApproval.lastName,
        email: selectedApproval.email,
        role: selectedApproval.role,
      });

      if (!response.success) {
        setErrorMessage(response.error || "Failed to create user");
        setIsProcessing(false);
        return;
      }

      // Mark approval as approved
      const userId = user?.id || "system";
      approveApprovalRequest(selectedApproval.id, userId);

      // Update state
      setApprovals(
        approvals.map((a) =>
          a.id === selectedApproval.id
            ? {
                ...a,
                status: "approved",
                approvedBy: userId,
                approvedAt: Date.now(),
              }
            : a,
        ),
      );

      setSuccessMessage(
        `Approved! User has been created and a verification email has been sent.`,
      );
      setSelectedApproval(null);
      setAction(null);

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to approve request",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (!selectedApproval) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      rejectApprovalRequest(selectedApproval.id, rejectionReason);

      setApprovals(
        approvals.map((a) =>
          a.id === selectedApproval.id
            ? { ...a, status: "rejected", rejectionReason }
            : a,
        ),
      );

      setSuccessMessage("Request rejected.");
      setSelectedApproval(null);
      setAction(null);
      setRejectionReason("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to reject request",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRequests = approvals.filter((a) => a.status === "pending");
  const approvedRequests = approvals.filter((a) => a.status === "approved");
  const rejectedRequests = approvals.filter((a) => a.status === "rejected");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <AdminSkeletonHeader />
          <AdminCardListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            User Approval Requests
          </h1>
          <p className="text-muted-foreground">
            Review and approve new administrator and property manager
            registrations
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-300 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pending Requests */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Pending Approvals
            </h2>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No pending approval requests
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {request.firstName} {request.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {request.role.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedApproval(request);
                        setAction("approve");
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApproval(request);
                        setAction("reject");
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Approved
              </h2>
              <Badge className="bg-green-600">{approvedRequests.length}</Badge>
            </div>
            <div className="grid gap-4">
              {approvedRequests.map((request) => (
                <Card key={request.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {request.firstName} {request.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.email}
                      </p>
                    </div>
                    <Badge className="bg-green-600">Approved</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Approved on{" "}
                    {new Date(request.approvedAt || 0).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Rejected
              </h2>
              <Badge variant="destructive">{rejectedRequests.length}</Badge>
            </div>
            <div className="grid gap-4">
              {rejectedRequests.map((request) => (
                <Card key={request.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {request.firstName} {request.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.email}
                      </p>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog
        open={action === "approve"}
        onOpenChange={() => action !== null && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User Registration</DialogTitle>
            <DialogDescription>
              Create an account for {selectedApproval?.firstName}{" "}
              {selectedApproval?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Name:</strong> {selectedApproval?.firstName}{" "}
                {selectedApproval?.lastName}
              </p>
              <p className="text-sm mt-1">
                <strong>Email:</strong> {selectedApproval?.email}
              </p>
              <p className="text-sm mt-1">
                <strong>Role:</strong>{" "}
                {selectedApproval?.role.replace("_", " ")}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                A verification email will be sent to the new user after
                approval.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Processing..." : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={action === "reject"}
        onOpenChange={() => action !== null && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Reject the registration for {selectedApproval?.firstName}{" "}
              {selectedApproval?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Name:</strong> {selectedApproval?.firstName}{" "}
                {selectedApproval?.lastName}
              </p>
              <p className="text-sm mt-1">
                <strong>Email:</strong> {selectedApproval?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting this registration?"
                className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="destructive"
              >
                {isProcessing ? "Processing..." : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
