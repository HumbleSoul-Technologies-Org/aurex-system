"use client";

import React, { useEffect, useState } from "react";
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
import { apiRequest } from "@/lib/query-client";
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
  dateOfBirth: string;
  tenantType: "residential" | "commercial" | "mixed";
  password: string;
  confirmPassword: string;
  leaseStartDate: string;
  leaseRenewDate: string;
  leaseEndDate: string;
  leaseType: string;
  leaseTerms: string;
  preferredContactMethod: "email" | "phone" | "sms";
  applicationDate: string;
  moveInDate: string;
  monthlyRent: string;
  securityDeposit: string;
  emergencyContact: string;
  employmentInfo: string;
  previousAddresses: string;
  coSigner: string;
  pets: string;
  vehicles: string;
  businessInfo: string;
  businessContacts: string;
  financialInfo: string;
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
    dateOfBirth: "",
    tenantType: "residential",
    password: "",
    confirmPassword: "",
    leaseStartDate: "",
    leaseRenewDate: "",
    leaseEndDate: "",
    leaseType: "monthly",
    leaseTerms: "",
    preferredContactMethod: "email",
    applicationDate: new Date().toISOString().split("T")[0],
    moveInDate: "",
    monthlyRent: "0",
    securityDeposit: "",
    emergencyContact: "",
    employmentInfo: "",
    previousAddresses: "",
    coSigner: "",
    pets: "",
    vehicles: "",
    businessInfo: "",
    businessContacts: "",
    financialInfo: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formData.leaseStartDate) {
      return;
    }

    const start = new Date(formData.leaseStartDate);
    if (Number.isNaN(start.getTime())) {
      return;
    }

    let months = 1;
    switch (formData.leaseType) {
      case "3_months":
        months = 3;
        break;
      case "half_year":
        months = 6;
        break;
      case "full_year":
        months = 12;
        break;
      case "month-to-month":
        months = 1;
        break;
      default:
        months = 1;
    }

    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + months);

    setFormData((prev) => ({
      ...prev,
      leaseEndDate: endDate.toISOString().split("T")[0],
    }));
  }, [formData.leaseStartDate, formData.leaseType]);

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
      console.log("Submitting tenant registration with data:", invite);
      const response = await apiRequest(
        "POST",
        `/pending-tenants/create-from-invite`,
        {
          inviteToken: invite.token,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          tenantType: formData.tenantType,
          leaseStartDate: formData.leaseStartDate,
          leaseRenewDate: formData.leaseRenewDate,
          leaseEndDate: formData.leaseEndDate,
          leaseType: formData.leaseType,
          leaseTerms: formData.leaseTerms,
          preferredContactMethod: formData.preferredContactMethod,
          applicationDate: formData.applicationDate,
          moveInDate: formData.moveInDate,
          rentAmount: Number(formData.monthlyRent) || 0,
          securityDeposit: formData.securityDeposit,
          emergencyContact: formData.emergencyContact,
          employmentInfo: formData.employmentInfo,
          previousAddresses: formData.previousAddresses,
          coSigner: formData.coSigner,
          pets: formData.pets,
          vehicles: formData.vehicles,
          businessInfo: formData.businessInfo,
          businessContacts: formData.businessContacts,
          financialInfo: formData.financialInfo,
          notes: formData.notes,
        },
      );

      const responseData: any = await response.json();

      if (!responseData.pendingTenant) {
        throw new Error(
          responseData.message || "Failed to submit registration",
        );
      }

      onSuccess();
    } catch (err: any) {
      setError(
        err?.message || "Failed to submit registration. Please try again.",
      );
      console.error("Tenant registration failed:", err);
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
              disabled={Boolean(invite.email)}
            />
            {invite.email && (
              <p className="text-xs text-muted-foreground mt-1">
                This invite is linked to {invite.email}
              </p>
            )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="tenantType">Tenant Type</Label>
            <Select
              value={formData.tenantType}
              onValueChange={(value) => handleSelectChange("tenantType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Lease Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="leaseStartDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Lease Start Date
            </Label>
            <Input
              id="leaseStartDate"
              type="date"
              name="leaseStartDate"
              value={formData.leaseStartDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="leaseRenewDate">Lease Renew Date</Label>
            <Input
              id="leaseRenewDate"
              type="date"
              name="leaseRenewDate"
              value={formData.leaseRenewDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="leaseEndDate">Lease End Date</Label>
            <Input
              id="leaseEndDate"
              type="date"
              name="leaseEndDate"
              value={formData.leaseEndDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <SelectItem value="3_months">3 Months</SelectItem>
                <SelectItem value="half_year">6 Months</SelectItem>
                <SelectItem value="full_year">Full Year</SelectItem>
                <SelectItem value="month-to-month">Month-to-month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="preferredContactMethod">
              Preferred Contact Method
            </Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) =>
                handleSelectChange("preferredContactMethod", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="leaseTerms">Lease Terms</Label>
          <Textarea
            id="leaseTerms"
            name="leaseTerms"
            value={formData.leaseTerms}
            onChange={handleChange}
            placeholder="Describe any special lease terms or conditions"
            rows={3}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="applicationDate">Application Date</Label>
          <Input
            id="applicationDate"
            type="date"
            name="applicationDate"
            value={formData.applicationDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="moveInDate">Move-In Date</Label>
          <Input
            id="moveInDate"
            type="date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Financial Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent</Label>
            <Input
              id="monthlyRent"
              type="number"
              name="monthlyRent"
              value={formData.monthlyRent}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <Input
              id="securityDeposit"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              placeholder="Deposit amount or notes"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="financialInfo">Financial Information</Label>
          <Textarea
            id="financialInfo"
            name="financialInfo"
            value={formData.financialInfo}
            onChange={handleChange}
            placeholder="Income, bank details, credit score, or other financial notes"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Additional Information
        </h3>
        <div>
          <Label htmlFor="employmentInfo">Employment Information</Label>
          <Textarea
            id="employmentInfo"
            name="employmentInfo"
            value={formData.employmentInfo}
            onChange={handleChange}
            placeholder="Current employer, position, and work details"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="previousAddresses">Previous Addresses</Label>
          <Textarea
            id="previousAddresses"
            name="previousAddresses"
            value={formData.previousAddresses}
            onChange={handleChange}
            placeholder="List previous addresses separated by commas"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coSigner">Co-Signer</Label>
            <Input
              id="coSigner"
              name="coSigner"
              value={formData.coSigner}
              onChange={handleChange}
              placeholder="Co-signer name/details"
            />
          </div>
          <div>
            <Label htmlFor="pets">Pets</Label>
            <Input
              id="pets"
              name="pets"
              value={formData.pets}
              onChange={handleChange}
              placeholder="Pet details"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicles">Vehicles</Label>
            <Input
              id="vehicles"
              name="vehicles"
              value={formData.vehicles}
              onChange={handleChange}
              placeholder="Vehicle make/model/license"
            />
          </div>
          <div>
            <Label htmlFor="businessInfo">Business Information</Label>
            <Input
              id="businessInfo"
              name="businessInfo"
              value={formData.businessInfo}
              onChange={handleChange}
              placeholder="Business name or company details"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="businessContacts">Business Contacts</Label>
          <Input
            id="businessContacts"
            name="businessContacts"
            value={formData.businessContacts}
            onChange={handleChange}
            placeholder="Business contact details"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Other details to share with the administrator"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting registration..." : "Submit registration"}
      </Button>
    </form>
  );
}
