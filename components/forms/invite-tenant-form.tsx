"use client";

import React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTenantApi } from "@/lib/services/tenants";
import { acceptTenantInvite } from "@/lib/services/tenant-invites";
import { useAuth } from "@/lib/auth-context";
import { Calendar, Mail, Phone, User, Lock, AlertCircle } from "lucide-react";

interface InviteTenantFormProps {
  invite: any;
  property: any;
  onSuccess: () => void;
}

interface InviteTenantFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseType: string;
  emergencyContact: string;
  notes: string;
}

export default function InviteTenantForm({
  invite,
  property,
  onSuccess,
}: InviteTenantFormProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState<InviteTenantFormData>({
    name: "",
    email: invite.email || "",
    phone: "",
    password: "",
    confirmPassword: "",
    leaseStartDate: "",
    leaseEndDate: "",
    leaseType: "monthly",
    emergencyContact: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the tenant via API so the server provides the canonical id
      const tenant = await createTenantApi({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        tenantType: "residential", // Default for invite, can be changed later
        unitNumber: invite.unitNumber || "",
        propertyId: invite.propertyId,
        rentAmount: 0, // Will be set by admin later
        leaseType: formData.leaseType,
        leaseStartDate: formData.leaseStartDate,
        leaseEndDate: formData.leaseEndDate,
        leaseTerms: "",
        preferredContactMethod: "email",
        applicationDate: new Date().toISOString().split("T")[0],
        moveInDate: formData.leaseStartDate,
        emergencyContactName: formData.emergencyContact,
        emergencyContactPhone: "",
        emergencyContactEmail: "",
        status: "pending",
      });

      // Accept the invite
      acceptTenantInvite(invite.token);

      // Log the tenant in
      const loginResult = await login(formData.email, formData.password);
      if (loginResult) {
        onSuccess();
      } else {
        setError(
          "Account created but login failed. Please try logging in manually.",
        );
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
      console.error("Tenant creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Property Info (readonly) */}
      <div className="bg-secondary/50 p-4 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Property Details</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Property:</strong> {property.name}
          </p>
          <p>
            <strong>Address:</strong> {property.address}, {property.city},{" "}
            {property.state}
          </p>
          {invite.unitNumber && (
            <p>
              <strong>Unit:</strong> {invite.unitNumber}
            </p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Personal Information
        </h3>

        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Full Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Jane Smith"
          />
        </div>
      </div>

      {/* Lease Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Lease Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="leaseStartDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Lease Start Date *
            </Label>
            <Input
              id="leaseStartDate"
              type="date"
              name="leaseStartDate"
              value={formData.leaseStartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="leaseEndDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Lease End Date *
            </Label>
            <Input
              id="leaseEndDate"
              type="date"
              name="leaseEndDate"
              value={formData.leaseEndDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="leaseType">Lease Type</Label>
            <Select
              value={formData.leaseType}
              onValueChange={(value) => handleSelectChange("leaseType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="3mnths">3 Months</SelectItem>
                <SelectItem value="6mnths">6 Months</SelectItem>
                <SelectItem value="full year">Full Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Account Setup */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Account Setup</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
