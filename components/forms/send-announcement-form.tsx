"use client";

import React from "react";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Bell, Users, Calendar } from "lucide-react";
import { listProperties } from "@/lib/services/properties";
import { listTenants } from "@/lib/services/tenants";

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
  propertyTypeFilter?: string;
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
    propertyTypeFilter: "",
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

  const properties = useMemo(() => listProperties(), []);
  const tenantsForSelectedProperty = useMemo(
    () =>
      formData.propertyId
        ? listTenants().filter((t) => t.propertyId === formData.propertyId)
        : [],
    [formData.propertyId],
  );
  const tenantsWithDueDate = useMemo(
    () =>
      tenantsForSelectedProperty.filter(
        (t) => t.rentAmount && t.rentAmount > 0,
      ),
    [tenantsForSelectedProperty],
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, options } = e.target as HTMLSelectElement;
    if (name === "tenantIds" && options) {
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selected,
      }));
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };
        if (name === "recipients" && value !== "property") {
          newData.propertyId = "";
          newData.tenantSelectionMode = "all";
          newData.tenantIds = [];
        }
        if (name === "tenantSelectionMode") {
          if (value === "all") {
            newData.tenantIds = tenantsForSelectedProperty.map((t) => t.id);
          } else if (value === "withDueDate") {
            newData.tenantIds = tenantsWithDueDate.map((t) => t.id);
          } else if (value === "custom") {
            newData.tenantIds = [];
          }
        }
        return newData;
      });
    }
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
      propertyTypeFilter: "",
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
                <option value="custom">Custom List</option>
                <option value="managers">Managers Only</option>
              </select>
            </div>

            {formData.recipients === "all" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tenant Type Filter
                </label>
                <select
                  name="tenantTypeFilter"
                  value={formData.tenantTypeFilter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Tenant Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            )}

            {/* Conditional Property and Tenants */}
            {formData.recipients === "property" && (
              <>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Type Filter
                  </label>
                  <select
                    name="propertyTypeFilter"
                    value={formData.propertyTypeFilter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed_use">Mixed Use</option>
                    <option value="industrial">Industrial</option>
                    <option value="retail">Retail</option>
                    <option value="office">Office</option>
                  </select>
                </div>
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
                    <option value="custom">Custom Selection</option>
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
                    <select
                      name="tenantIds"
                      multiple
                      value={formData.tenantIds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      {tenantsForSelectedProperty.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hold Ctrl (Cmd on Mac) to select multiple tenants
                    </p>
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
