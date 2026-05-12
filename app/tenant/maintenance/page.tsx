"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  User,
  DollarSign,
  Calendar,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listTenants } from "@/lib/services/tenants";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  deleteMaintenanceRequest,
} from "@/lib/services/maintenance";
import { getProperty } from "@/lib/services/properties";

export default function MaintenancePage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Find the tenant record for the current user
  const tenant = user
    ? listTenants().find((t) => t.email === user.email)
    : null;
  const propertyInfo = tenant?.propertyId
    ? getProperty(tenant.propertyId)
    : null;

  // Get maintenance requests for this tenant (reactive to refreshTrigger)
  const allMaintenance = useMemo(
    () => getMaintenanceRequests(),
    [refreshTrigger],
  );
  const tenantMaintenance = tenant
    ? allMaintenance.filter((m) => m.tenantId === tenant.id)
    : [];

  const [formData, setFormData] = useState({
    description: "",
    category: "plumbing",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    location: "",
    contactMethod: "email",
    urgency: "normal",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRequests =
    filter === "all"
      ? tenantMaintenance
      : tenantMaintenance.filter((r) => r.status === filter);

  const statusCounts = {
    pending: tenantMaintenance.filter((r) => r.status === "pending").length,
    assigned: tenantMaintenance.filter((r) => r.status === "assigned").length,
    completed: tenantMaintenance.filter((r) => r.status === "completed").length,
  };

  const handleSubmit = async () => {
    if (!tenant || !formData.description.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const newRequest = createMaintenanceRequest({
        propertyId: tenant.propertyId || "",
        propertyName: propertyInfo?.name || "Unknown Property",
        unit: tenant.unit || "Unknown Unit",
        tenantId: tenant.id,
        tenantName: tenant.name,
        description: formData.description,
        category: formData.category,
        ...(formData.location && { location: formData.location }),
        contactMethod: formData.contactMethod,
        priority: formData.priority,
      });

      // Reset form
      setFormData({
        description: "",
        category: "plumbing",
        priority: "medium",
        location: "",
        contactMethod: "email",
        urgency: "normal",
      });

      setSubmitSuccess(true);
      setShowForm(false);

      // Trigger a re-render to show the new request
      setRefreshTrigger((prev) => prev + 1);

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      setSubmitError("Failed to submit maintenance request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this maintenance request? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingId(requestId);
    try {
      const success = deleteMaintenanceRequest(requestId);
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
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "assigned":
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "";
    }
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

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Maintenance Requests
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track and manage maintenance issues
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 md:h-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">Report Issue</span>
        </Button>
      </div>

      {/* New Request Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report New Maintenance Issue</DialogTitle>
            <DialogDescription>
              Please provide details about the maintenance issue. We'll get it
              resolved as quickly as possible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="locks">Locks & Security</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="pest">Pest Control</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description *
              </label>
              <Textarea
                placeholder="Describe the issue in detail (what's wrong, when it started, any unusual sounds/smells, etc.)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Specific Location
              </label>
              <Input
                placeholder="e.g., Kitchen sink, Bedroom 2, Living room ceiling"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            {/* Priority and Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Priority *
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(
                    value: "low" | "medium" | "high" | "critical",
                  ) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low - Minor inconvenience
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Needs attention soon
                    </SelectItem>
                    <SelectItem value="high">
                      High - Urgent but not emergency
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical - Emergency situation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contact Method
                </label>
                <Select
                  value={formData.contactMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contactMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How to contact you" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Info (read-only) */}
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Request will be submitted for:
              </p>
              <p className="text-sm font-medium">
                {propertyInfo?.name || "Property"} - Unit{" "}
                {tenant?.unit || "N/A"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3">
            {submitError && (
              <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            )}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.description.trim() || isSubmitting}
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Maintenance request submitted successfully! We'll get back to you
              soon.
            </p>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            label: "Pending",
            value: statusCounts.pending,
            color: "bg-yellow-100 dark:bg-yellow-900/30",
          },
          {
            label: "Assigned",
            value: statusCounts.assigned,
            color: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Completed",
            value: statusCounts.completed,
            color: "bg-green-100 dark:bg-green-900/30",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className={`border border-border p-3 md:p-4 ${item.color}`}
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-1">
              {item.label}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "assigned", label: "Assigned" },
          { value: "completed", label: "Completed" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap text-xs md:text-sm ${
              filter === f.value
                ? "bg-primary text-white"
                : "border-border text-foreground"
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Maintenance Requests List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredRequests.length === 0 ? (
          <Card className="border  border-border p-8 text-center col-span-full">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No maintenance requests found
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="border relative border-border p-4 md:p-6 hover:bg-secondary/50 transition-colors"
            >
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(request.id)}
                  disabled={deletingId === request.id}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3 w-3" />
                </Button> */}
              </div>
              <div className="flex flex-col gap-3 pr-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">
                      Category
                    </p>
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {request.category.charAt(0).toUpperCase() +
                        request.category.slice(1)}
                    </p>
                  </div>
                  {/* <span className={`px-2 py-1 mr-12 -mt-4 text-xs font-semibold rounded capitalize whitespace-nowrap ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span> */}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 break-words leading-relaxed">
                    {request.description}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Submitted:{" "}
                    {new Date(request.createdDate).toLocaleDateString()}
                  </p>
                  {request.location && (
                    <p className="text-xs text-muted-foreground">
                      Location: {request.location}
                    </p>
                  )}
                  {request.status === "assigned" && request.assignedTo && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Assigned to: {request.assignedTo}
                    </p>
                  )}
                  {request.status === "assigned" && request.cost && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Mantainance cost: ${request.cost}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
