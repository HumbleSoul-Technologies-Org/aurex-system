"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminSkeletonHeader,
  AdminTableSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";
import {
  getPendingTenants,
  approvePendingTenant,
  rejectPendingTenant,
  PendingTenant,
} from "@/lib/services/pending-tenants";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  Download,
  MoreVertical,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import RecordPaymentModal from "@/components/modals/record-payment-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function PendingTenantsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [pendingTenants, setPendingTenants] = useState<PendingTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<PendingTenant | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const activeCurrency = useActiveCurrency();

  // Check authorization
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch pending tenants
  useEffect(() => {
    const fetchPendingTenants = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getPendingTenants(token || null);
        setPendingTenants(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load pending tenants");
        console.error("Error fetching pending tenants:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingTenants();
  }, []);

  const handleApprove = async (tenant: PendingTenant) => {
    if (!window.confirm(`Approve tenant ${tenant.name}?`)) return;

    setIsProcessing(true);
    try {
      await approvePendingTenant(tenant._id, token || undefined);
      setPendingTenants(pendingTenants.filter((t) => t._id !== tenant._id));
      setError("");
      toast({
        title: "Tenant approved",
        description: `${tenant.name} has been approved.`,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to approve tenant");
      toast({
        title: "Approve failed",
        description: err?.message || "Failed to approve tenant",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTenant) return;

    setIsProcessing(true);
    try {
      await rejectPendingTenant(
        selectedTenant._id,
        rejectReason,
        token || undefined,
      );
      setPendingTenants(
        pendingTenants.filter((t) => t._id !== selectedTenant._id),
      );
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedTenant(null);
      setError("");
      toast({
        title: "Tenant rejected",
        description: `${selectedTenant.name} has been rejected.`,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to reject tenant");
      toast({
        title: "Reject failed",
        description: err?.message || "Failed to reject tenant",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTenants = pendingTenants.filter((tenant) => {
    if (approvalFilter === "all") return true;
    return tenant.status === approvalFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <AdminSkeletonHeader />

          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
              <div className="flex-1" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            <AdminTableSkeleton rowCount={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Pending Tenant Approvals
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve new tenant registrations from invites
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (filter) => (
                <Button
                  key={filter}
                  variant={approvalFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApprovalFilter(filter)}
                  className="capitalize"
                >
                  {filter === "all" ? "All" : filter}
                </Button>
              ),
            )}
          </div>
          <div className="flex-1" />
          <p className="text-sm text-muted-foreground">
            {filteredTenants.length}{" "}
            {approvalFilter === "all" ? "total" : approvalFilter} tenant
            {filteredTenants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No {approvalFilter === "all" ? "" : approvalFilter + " "} pending
              tenants
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tenant Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant._id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-sm">{tenant.email}</TableCell>
                    <TableCell className="text-sm">{tenant.phone}</TableCell>
                    <TableCell className="capitalize text-sm">
                      {tenant.tenantType}
                    </TableCell>
                    <TableCell>
                      {tenant.status === "pending" && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {tenant.status === "approved" && (
                        <Badge className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {tenant.status === "rejected" && (
                        <Badge
                          variant="destructive"
                          className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowActionsDialog(true);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl h-[700px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tenant Application Details</DialogTitle>
            <DialogDescription>
              Review all information provided during registration
            </DialogDescription>
          </DialogHeader>

          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedTenant.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedTenant.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedTenant.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tenant Type
                  </Label>
                  <p className="font-medium capitalize">
                    {selectedTenant.tenantType}
                  </p>
                </div>
                {selectedTenant.dateOfBirth && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Date of Birth
                    </Label>
                    <p className="font-medium">
                      {new Date(
                        selectedTenant.dateOfBirth,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedTenant.emergencyContact && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Emergency Contact
                    </Label>
                    <p className="font-medium">
                      {selectedTenant.emergencyContact}
                    </p>
                  </div>
                )}
              </div>

              {selectedTenant.leaseStartDate && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Lease Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTenant.leaseStartDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Start Date
                        </Label>
                        <p className="font-medium">
                          {new Date(
                            selectedTenant.leaseStartDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedTenant.leaseEndDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          End Date
                        </Label>
                        <p className="font-medium">
                          {new Date(
                            selectedTenant.leaseEndDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedTenant.leaseType && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Lease Type
                        </Label>
                        <p className="font-medium capitalize">
                          {selectedTenant.leaseType}
                        </p>
                      </div>
                    )}
                    {selectedTenant.rentAmount && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Monthly Rent
                        </Label>
                        <p className="font-medium">
                          {formatCurrency(
                            selectedTenant.rentAmount ?? 0,
                            activeCurrency,
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTenant.employmentInfo ||
              selectedTenant.financialInfo ||
              selectedTenant.previousAddresses ? (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Additional Information</h4>
                  <div className="space-y-3">
                    {selectedTenant.employmentInfo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Employment
                        </Label>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTenant.employmentInfo}
                        </p>
                      </div>
                    )}
                    {selectedTenant.financialInfo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Financial Information
                        </Label>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTenant.financialInfo}
                        </p>
                      </div>
                    )}
                    {selectedTenant.previousAddresses && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Previous Addresses
                        </Label>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTenant.previousAddresses}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {selectedTenant.notes && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedTenant.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Actions Dialog (fallback) */}
      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Actions</DialogTitle>
            <DialogDescription>
              Choose an action for {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowActionsDialog(false);
                setShowDetailsDialog(true);
              }}
            >
              View Details
            </Button>
            {selectedTenant?.status === "pending" && (
              <>
                <Button
                  variant="default"
                  disabled={isProcessing}
                  onClick={async () => {
                    if (selectedTenant) await handleApprove(selectedTenant);
                    setShowActionsDialog(false);
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isProcessing}
                  onClick={() => {
                    setShowActionsDialog(false);
                    setShowRejectDialog(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowRecordPayment(true);
                setShowActionsDialog(false);
              }}
            >
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={showRecordPayment}
        onOpenChange={setShowRecordPayment}
        propertyId={selectedTenant?.propertyId}
      />

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Reject Tenant Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject {selectedTenant?.name}'s
            application? They will be notified via email.
          </AlertDialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Rejection Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for rejection (optional)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
