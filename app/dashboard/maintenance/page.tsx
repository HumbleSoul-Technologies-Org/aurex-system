"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getMaintenanceRequests,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  type MaintenanceRequest,
} from "@/lib/services/maintenance";
import { useAppData } from "@/lib/data-context";
import { createTransaction } from "@/app/lib/transactions-client";
import Link from "next/link";
import {
  Plus,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  DollarSign,
  Calendar,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface MaintenanceRequestDisplay {
  id: string;
  propertyId: string;
  propertyName: string;
  unit: string;
  tenantId: string;
  tenantName: string;
  description: string;
  category: string;
  location?: string;
  contactMethod?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "completed";
  createdDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  cost?: number;
  transactionId?: string;
}

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { tenants: allTenants, properties: allProperties } = useAppData();

  // Get real maintenance requests and enrich with tenant and property data (reactive)
  const rawRequests = useMemo(() => getMaintenanceRequests(), [refreshTrigger]);
  const enrichedRequests: MaintenanceRequestDisplay[] = useMemo(
    () =>
      rawRequests.map((req) => {
        const tenant = req.tenantId
          ? allTenants.find((t) => t.id === req.tenantId)
          : null;
        const property = req.propertyId
          ? allProperties.find((p) => p.id === req.propertyId)
          : null;

        return {
          id: req.id,
          propertyId: req.propertyId,
          propertyName:
            property?.name || req.propertyName || "Unknown Property",
          unit: req.unit,
          tenantId: req.tenantId || "",
          tenantName: tenant?.name || req.tenantName || "Unknown Tenant",
          description: req.description,
          category: req.category,
          location: req.location,
          contactMethod: req.contactMethod,
          priority: req.priority,
          status: req.status,
          createdDate: req.createdDate,
          completedDate: req.completedDate,
          assignedTo: req.assignedTo,
          cost: req.cost,
          transactionId: req.transactionId,
        };
      }),
    [rawRequests, allTenants],
  );

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    maintenanceId: "",
    expense: "",
    expenseType: "",
    description: "",
    tenantId: "",
    price: "",
    paymentMethod: "",
    companyAssigned: "",
    propertyId: "",
    unit: "",
    date: "",
    receiptReference: "",
  });

  // Get the selected property for conditional unit display
  const selectedProperty = useMemo(() => {
    return expenseForm.propertyId
      ? allProperties.find((p) => p.id === expenseForm.propertyId)
      : null;
  }, [expenseForm.propertyId, allProperties]);

  const openExpenseDialog = (requestId: string) => {
    const req = enrichedRequests.find((r) => r.id === requestId);
    setSelectedRequestId(requestId);
    setExpenseForm({
      maintenanceId: req?.id || requestId,
      expense: req?.category || "",
      expenseType: "",
      description: `Maintenance: ${req?.description || ""}`,
      tenantId: req?.tenantId || "",
      price:
        req?.cost !== null && req?.cost !== undefined ? String(req.cost) : "",
      paymentMethod: "",
      companyAssigned: req?.assignedTo || "",
      propertyId: req?.propertyId || "",
      unit: req?.unit || "",
      date: new Date().toISOString().split("T")[0],
      receiptReference: "",
    });
    setExpenseDialogOpen(true);
  };

  const handleExpenseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "propertyId") {
      const property = allProperties.find((p) => p.id === value);
      if (property && property.units.length === 1) {
        // Auto-populate unit if property has only one unit
        setExpenseForm((prev) => ({
          ...prev,
          propertyId: value,
          unit: property.units[0],
        }));
      } else {
        // Clear unit if property has multiple units or none
        setExpenseForm((prev) => ({ ...prev, propertyId: value, unit: "" }));
      }
    } else {
      setExpenseForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleExpenseSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedRequestId) return;

    setIsSavingExpense(true);
    const price = parseFloat(expenseForm.price || "0") || 0;

    try {
      // Update the maintenance request in the database
      const updates: Partial<MaintenanceRequest> = {
        cost: price,
        assignedTo: expenseForm.companyAssigned || undefined,
        status: "assigned",
      };
      updateMaintenanceRequest(selectedRequestId, updates);

      // Trigger a refresh so enrichedRequests re-calculates from the service
      setRefreshTrigger((prev) => prev + 1);

      // Record as a transaction with expense details
      const tx = await createTransaction({
        tenantId: expenseForm.tenantId || undefined,
        propertyId: expenseForm.propertyId || undefined,
        amount: price,
        type: "expense",
        description: expenseForm.description || "Maintenance expense",
        status: "completed",
        category: expenseForm.expenseType || "maintenance",
        paymentMethod: expenseForm.paymentMethod || undefined,
        date: expenseForm.date || undefined,
        receiptReference: expenseForm.receiptReference || undefined,
        unit: expenseForm.unit || undefined,
      });

      // Update the maintenance request with the transaction ID (store the internal id)
      const finalUpdates: Partial<MaintenanceRequest> = {
        ...updates,
        transactionId: tx.id,
      };
      updateMaintenanceRequest(selectedRequestId, finalUpdates);

      // Trigger a refresh so enrichedRequests re-calculates from the service
      setRefreshTrigger((prev) => prev + 1);

      // Notify other parts of the app that transactions changed
      try {
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
      } catch (e) {
        // ignore in non-browser contexts
      }

      setExpenseForm({
        maintenanceId: "",
        expense: "",
        expenseType: "",
        description: "",
        tenantId: "",
        price: "",
        paymentMethod: "",
        companyAssigned: "",
        propertyId: "",
        unit: "",
        date: "",
        receiptReference: "",
      });
      setSelectedRequestId(null);
      setExpenseDialogOpen(false);
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequestToDelete(requestId);
    setDeleteDialogOpen(true);
  };

  const handleCompleteRequest = (requestId: string) => {
    try {
      updateMaintenanceRequest(requestId, {
        status: "completed",
        completedDate: new Date(),
      });
      // Trigger a re-render to update the UI
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error completing maintenance request:", error);
      alert("Failed to complete maintenance request. Please try again.");
    }
  };

  const confirmDeleteRequest = () => {
    if (!requestToDelete) return;

    setDeletingId(requestToDelete);
    try {
      // Delete from localStorage database
      const success = deleteMaintenanceRequest(requestToDelete);
      if (success) {
        // Trigger a re-render to update the UI
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert("Failed to delete maintenance request. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      alert("Failed to delete maintenance request. Please try again.");
    } finally {
      setDeletingId(null);
    }

    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  // Group requests by status
  const groupedRequests = {
    pending: enrichedRequests.filter((r) => r.status === "pending"),
    assigned: enrichedRequests.filter((r) => r.status === "assigned"),
    completed: enrichedRequests.filter((r) => r.status === "completed"),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300";
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "low":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "assigned":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const RequestCard = ({ request }: { request: MaintenanceRequestDisplay }) => (
    <Card className="border relative border-border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteRequest(request.id);
        }}
        disabled={deletingId === request.id}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <div className="space-y-3 pr-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2">
              {request.category}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {request.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Location: {request.location}
            </p>
          </div>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded capitalize whitespace-nowrap ${getPriorityColor(request.priority)}`}
          >
            {request.priority}
          </span>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <Link
              href={`/dashboard/tenants/${request.tenantId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {request.tenantName}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {request.propertyName} - Unit {request.unit}
          </p>
          {(request.status === "assigned" ||
            request.status === "completed") && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Mantainance costs: ${request.cost}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              Requested on:{" "}
              {new Date(request.createdDate).toLocaleDateString()}{" "}
            </span>
          </div>
          {request.assignedTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 flex-shrink-0" /> Assigned to:{" "}
              {"\n"}
              {request.assignedTo}
            </div>
          )}

          {request.completedDate && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              Completed: {new Date(request.completedDate).toLocaleDateString()}
            </div>
          )}
          {request.status === "pending" && (
            <Button
              variant="ghost"
              className="mt-2 bg-primary hover:bg-primary/90 text-white w-full"
              onClick={() => openExpenseDialog(request.id)}
            >
              Approve Maintenance
            </Button>
          )}
          {request.status === "assigned" && (
            <Button
              variant="ghost"
              className="mt-2 bg-green-600 hover:bg-green-700 text-white w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleCompleteRequest(request.id);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Set Completed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Maintenance
          </h1>
          <p className="text-muted-foreground">
            Track and manage work orders and maintenance requests
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-foreground">
                {enrichedRequests.length}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-primary/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {groupedRequests.pending.length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assigned</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {groupedRequests.assigned.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {enrichedRequests
                  .reduce((sum, r) => sum + (r.cost || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/60" />
          </div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          onClick={() => setViewMode("kanban")}
          className={
            viewMode === "kanban"
              ? "bg-primary hover:bg-primary/90"
              : "border-border"
          }
        >
          Kanban Board
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className={
            viewMode === "list"
              ? "bg-primary hover:bg-primary/90"
              : "border-border"
          }
        >
          List View
        </Button>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-foreground">Pending</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.pending.length}
              </span>
            </div>
            <div className="space-y-3 relative">
              {groupedRequests.pending.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Assigned Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-foreground">Assigned</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.assigned.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests.assigned.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-foreground">Completed</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.completed.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests.completed.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrichedRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-border hover:bg-secondary transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">
                      {request.category}
                    </td>
                    <td className="px-6 py-4   text-foreground text-sm">
                      {request.description}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {request.propertyName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {request.unit}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/tenants/${request.tenantId}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {request.tenantName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded capitalize ${getPriorityColor(request.priority)}`}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {request.status.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {request.assignedTo || "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {request.cost !== null && request.cost !== undefined
                        ? `$${request.cost.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(request.createdDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestId(null);
            setExpenseForm({
              maintenanceId: "",
              expense: "",
              expenseType: "",
              description: "",
              tenantId: "",
              price: "",
              paymentMethod: "",
              companyAssigned: "",
              propertyId: "",
              unit: "",
              date: "",
              receiptReference: "",
            });
          }
          setExpenseDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>
              Approve maintenance and record expense details.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              handleExpenseSubmit(e);
            }}
            className="p-2"
          >
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expense Category
                </label>
                <select
                  name="expenseType"
                  value={expenseForm.expenseType}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={isSavingExpense}
                >
                  <option value="">Select Category</option>
                  <option value="maintenance">Maintenance & Repairs</option>
                  <option value="utilities">Utilities</option>
                  <option value="insurance">Insurance</option>
                  <option value="property-tax">Property Tax</option>
                  <option value="cleaning">Cleaning & Services</option>
                  <option value="legal">Legal & Compliance</option>
                  <option value="management">Management Fees</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseChange}
                  placeholder="Details about the expense"
                  className="h-24"
                  disabled={isSavingExpense}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    disabled={isSavingExpense}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Receipt/Invoice Reference
                  </label>
                  <Input
                    name="receiptReference"
                    value={expenseForm.receiptReference}
                    onChange={handleExpenseChange}
                    placeholder="Reference number"
                    disabled={isSavingExpense}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tenant
                </label>
                <select
                  name="tenantId"
                  value={expenseForm.tenantId}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={isSavingExpense}
                >
                  <option value="">Select Tenant</option>
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property
                  </label>
                  <select
                    name="propertyId"
                    value={expenseForm.propertyId}
                    onChange={handleExpenseChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    disabled={isSavingExpense}
                  >
                    <option value="">Select Property</option>
                    {allProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedProperty && selectedProperty.units.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={expenseForm.unit}
                      onChange={handleExpenseChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      disabled={isSavingExpense}
                    >
                      <option value="">Select Unit</option>
                      {selectedProperty.units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price
                  </label>
                  <Input
                    type="text"
                    name="price"
                    value={expenseForm.price}
                    onChange={handleExpenseChange}
                    placeholder="0"
                    disabled={isSavingExpense}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Assigned
                  </label>
                  <Input
                    name="companyAssigned"
                    value={expenseForm.companyAssigned}
                    onChange={handleExpenseChange}
                    placeholder="Company name"
                    disabled={isSavingExpense}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={isSavingExpense}
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setExpenseDialogOpen(false);
                    setSelectedRequestId(null);
                    setExpenseForm({
                      maintenanceId: "",
                      expense: "",
                      expenseType: "",
                      description: "",
                      tenantId: "",
                      price: "",
                      paymentMethod: "",
                      companyAssigned: "",
                      propertyId: "",
                      unit: "",
                      date: "",
                      receiptReference: "",
                    });
                  }}
                  disabled={isSavingExpense}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingExpense}>
                  {isSavingExpense ? "Saving..." : "Approve"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Maintenance Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this maintenance request? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRequest}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
