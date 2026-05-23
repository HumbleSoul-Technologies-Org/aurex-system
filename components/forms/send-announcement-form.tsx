"use client";

import React from "react";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Bell, Users, Calendar } from "lucide-react";
import { useAppData } from "@/lib/data-context";

interface SendAnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AnnouncementFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<AnnouncementFormData>;
}

export interface AnnouncementFormData {
  title: string;
  announcementType: string;
  message: string;
  recipients: string;
  priority: string;
  scheduledDate?: string;
  propertyId?: string;
  tenantSelectionMode?: string;
  tenantTypeFilter?: "all" | "residential" | "commercial" | "mixed";
  tenantIds?: string[];
}

export default function SendAnnouncementForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: SendAnnouncementFormProps) {
  const defaultAnnouncementFormData: AnnouncementFormData = {
    title: "",
    announcementType: "general",
    message: "",
    recipients: "all",
    priority: "normal",
    scheduledDate: "",
    propertyId: "",
    tenantSelectionMode: "all",
    tenantTypeFilter: "all",
    tenantIds: [],
  };

  const [formData, setFormData] = useState<AnnouncementFormData>({
    ...defaultAnnouncementFormData,
    ...initialData,
  } as AnnouncementFormData);

  useEffect(() => {
    setFormData({
      ...defaultAnnouncementFormData,
      ...initialData,
    } as AnnouncementFormData);
  }, [initialData]);

  const { properties, tenants } = useAppData();
  const tenantsForSelectedProperty = useMemo(
    () =>
      formData.propertyId
        ? tenants.filter((t) => t.propertyId === formData.propertyId)
        : [],
    [formData.propertyId, tenants],
  );
  const tenantsWithDueDate = useMemo(
    () =>
      tenantsForSelectedProperty.filter(
        (t) => t.rentAmount && t.rentAmount > 0,
      ),
    [tenantsForSelectedProperty],
  );

  const selectedTenantIds = useMemo(() => {
    if (!formData.propertyId) return [];
    if (formData.tenantSelectionMode === "withDueDate") {
      return tenantsWithDueDate.map((t) => t.id);
    }
    if (formData.tenantSelectionMode === "custom") {
      return formData.tenantIds ?? [];
    }
    return tenantsForSelectedProperty.map((t) => t.id);
  }, [
    formData.propertyId,
    formData.tenantSelectionMode,
    tenantsForSelectedProperty,
    tenantsWithDueDate,
    formData.tenantIds,
  ]);

  const arraysEqual = (a: string[] = [], b: string[] = []) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

  useEffect(() => {
    if (formData.tenantSelectionMode === "custom") {
      return;
    }
    setFormData((prev) => {
      if (arraysEqual(prev.tenantIds ?? [], selectedTenantIds)) {
        return prev;
      }
      return {
        ...prev,
        tenantIds: selectedTenantIds,
      };
    });
  }, [selectedTenantIds, formData.tenantSelectionMode]);

  useEffect(() => {
    if (formData.tenantSelectionMode !== "custom") return;
    setFormData((prev) => {
      const filteredTenantIds = (prev.tenantIds ?? []).filter((id) =>
        tenantsForSelectedProperty.some((t) => t.id === id),
      );
      if (arraysEqual(filteredTenantIds, prev.tenantIds ?? [])) {
        return prev;
      }
      return {
        ...prev,
        tenantIds: filteredTenantIds,
      };
    });
  }, [
    formData.propertyId,
    tenantsForSelectedProperty,
    formData.tenantSelectionMode,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData({
      title: "",
      announcementType: "general",
      message: "",
      recipients: "all",
      priority: "normal",
      scheduledDate: "",
      propertyId: "",
      tenantSelectionMode: "all",
      tenantTypeFilter: "all",
      tenantIds: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Send Announcement
              </h2>
              <p className="text-sm text-muted-foreground">
                Communicate with tenants and managers
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Announcement Title
                </div>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Announcement Type
              </label>
              <select
                name="announcementType"
                value={formData.announcementType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="maintenance">Maintenance</option>
                <option value="commercial">Commercial Update</option>
                <option value="lease">Lease Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your announcement message..."
                className="h-32"
                required
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Recipients
                </div>
              </label>
              <select
                name="recipients"
                value={formData.recipients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="all">All Tenants</option>
                <option value="property">By Property</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Property
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.recipients === "all" && formData.propertyId && (
              <div className="text-sm text-muted-foreground">
                This announcement will be sent to all{" "}
                {tenantsForSelectedProperty.length} tenants in the selected
                property.
              </div>
            )}

            {formData.recipients === "property" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tenants
                  </label>
                  <select
                    name="tenantSelectionMode"
                    value={formData.tenantSelectionMode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="all">All Tenants in Property</option>
                    <option value="withDueDate">Tenants with Due Date</option>
                    <option value="custom">Custom Tenants</option>
                  </select>
                </div>
                {formData.tenantSelectionMode === "all" && (
                  <div className="text-sm text-muted-foreground">
                    All {tenantsForSelectedProperty.length} tenants in this
                    property will receive the announcement.
                  </div>
                )}
                {formData.tenantSelectionMode === "withDueDate" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tenants with outstanding rent:
                    </p>
                    <div className="max-h-32 overflow-y-auto border border-input rounded-md p-2 bg-muted">
                      {tenantsWithDueDate.length > 0 ? (
                        tenantsWithDueDate.map((t) => (
                          <div key={t.id} className="text-sm">
                            {t.name}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No tenants with due dates
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {formData.tenantSelectionMode === "custom" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select one or more tenants:
                    </p>
                    <div className="max-h-64 overflow-y-auto border border-input rounded-md p-2 bg-muted">
                      {tenantsForSelectedProperty.length > 0 ? (
                        tenantsForSelectedProperty.map((t) => (
                          <label
                            key={t.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100"
                          >
                            <input
                              type="checkbox"
                              checked={
                                formData.tenantIds?.includes(t.id) ?? false
                              }
                              onChange={() => {
                                setFormData((prev) => {
                                  const existing = prev.tenantIds ?? [];
                                  const nextIds = existing.includes(t.id)
                                    ? existing.filter((id) => id !== t.id)
                                    : [...existing, t.id];
                                  return {
                                    ...prev,
                                    tenantIds: nextIds,
                                  };
                                });
                              }}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">
                              {t.name}
                              {t.unitNumber ? ` — Unit ${t.unitNumber}` : ""}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No tenants found for this property.
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {formData.tenantIds?.length ?? 0} tenant(s) selected.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Schedule for Later (Optional)
                </div>
              </label>
              <Input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to send immediately
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-border text-foreground bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading ? "Sending..." : "Send Announcement"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
