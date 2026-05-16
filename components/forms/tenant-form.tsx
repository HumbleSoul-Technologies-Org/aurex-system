"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAvailablePropertiesWithUnits } from "@/lib/services/properties";
import { Calendar, Mail, Phone, User, X } from "lucide-react";

interface TenantFormData {
  name: string;
  email: string;
  phone: string;
  tenantType: "residential" | "commercial" | "mixed";
  propertyId: string;
  unitNumber: string;
  leaseStartDate: string;
  leaseRenewDate: string;
  leaseEndDate: string;
  leaseType: string;
  leaseTerms: string;
  preferredContactMethod: "email" | "phone" | "sms";
  applicationDate: string;
  moveInDate: string;
  password: string;
  monthlyRent: number;
  emergencyContact: string;
  notes: string;
  dateOfBirth: string;
  employmentInfo: string;
  previousAddresses: string;
  coSigner: string;
  pets: string;
  vehicles: string;
  businessInfo: string;
  businessContacts: string;
  financialInfo: string;
  securityDeposit: string;
}

interface TenantFormProps {
  mode: "create" | "edit";
  initialData?: Partial<TenantFormData>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TenantFormData) => void;
  renewalDateHint?: string;
}

export default function TenantForm({
  mode,
  initialData,
  isOpen,
  onClose,
  onSubmit,
  renewalDateHint,
}: TenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    email: "",
    phone: "",
    tenantType: "residential",
    propertyId: "",
    unitNumber: "",
    leaseStartDate: "",
    leaseRenewDate: "",
    leaseEndDate: "",
    leaseType: "monthly",
    leaseTerms: "",
    preferredContactMethod: "email",
    applicationDate: "",
    moveInDate: "",
    password: "",
    monthlyRent: 0,
    emergencyContact: "",
    notes: "",
    dateOfBirth: "",
    employmentInfo: "",
    previousAddresses: "",
    coSigner: "",
    pets: "",
    vehicles: "",
    businessInfo: "",
    businessContacts: "",
    financialInfo: "",
    securityDeposit: "",
  });

  const [availableProperties, setAvailableProperties] = useState(() =>
    getAvailablePropertiesWithUnits(),
  );

  useEffect(() => {
    if (isOpen) {
      setAvailableProperties(getAvailablePropertiesWithUnits());
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          tenantType: initialData.tenantType || "residential",
          propertyId: initialData.propertyId || "",
          unitNumber: initialData.unitNumber || "",
          leaseStartDate: initialData.leaseStartDate || "",
          leaseRenewDate: initialData.leaseRenewDate || "",
          leaseEndDate: initialData.leaseEndDate || "",
          leaseType: initialData.leaseType || "monthly",
          leaseTerms: initialData.leaseTerms || "",
          preferredContactMethod: initialData.preferredContactMethod || "email",
          applicationDate: initialData.applicationDate || "",
          moveInDate: initialData.moveInDate || "",
          password: initialData.password || "",
          monthlyRent: initialData.monthlyRent || 0,
          emergencyContact: initialData.emergencyContact || "",
          notes: initialData.notes || "",
          dateOfBirth: initialData.dateOfBirth || "",
          employmentInfo: initialData.employmentInfo || "",
          previousAddresses: initialData.previousAddresses || "",
          coSigner: initialData.coSigner || "",
          pets: initialData.pets || "",
          vehicles: initialData.vehicles || "",
          businessInfo: initialData.businessInfo || "",
          businessContacts: initialData.businessContacts || "",
          financialInfo: initialData.financialInfo || "",
          securityDeposit: initialData.securityDeposit || "",
        });
      } else if (mode === "create") {
        // Reset form for create mode
        setFormData({
          name: "",
          email: "",
          phone: "",
          tenantType: "residential",
          propertyId: "",
          unitNumber: "",
          leaseStartDate: "",
          leaseRenewDate: "",
          leaseEndDate: "",
          leaseType: "monthly",
          leaseTerms: "",
          preferredContactMethod: "email",
          applicationDate: "",
          moveInDate: "",
          password: "",
          monthlyRent: 0,
          emergencyContact: "",
          notes: "",
          dateOfBirth: "",
          employmentInfo: "",
          previousAddresses: "",
          coSigner: "",
          pets: "",
          vehicles: "",
          businessInfo: "",
          businessContacts: "",
          financialInfo: "",
          securityDeposit: "",
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const generatePassword = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pw = "";
    for (let i = 0; i < length; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monthlyRent" ? Number(value) : value,
    }));
  };

  const calculateLeaseEndDate = (dateString: string, leaseType: string) => {
    if (!dateString) return "";
    const start = new Date(dateString);
    if (Number.isNaN(start.getTime())) return "";

    let months = 1;
    switch (leaseType) {
      case "monthly":
      case "month-to-month":
        months = 1;
        break;
      case "3_months":
      case "3 months":
        months = 3;
        break;
      case "half_year":
      case "6mnths":
        months = 6;
        break;
      case "full_year":
      case "annual":
      case "yearly":
        months = 12;
        break;
      default:
        months = 1;
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const baseDate = formData.leaseRenewDate || formData.leaseStartDate;
    if (!baseDate) return;
    const calculatedEnd = calculateLeaseEndDate(baseDate, formData.leaseType);
    if (calculatedEnd && calculatedEnd !== formData.leaseEndDate) {
      setFormData((prev) => ({ ...prev, leaseEndDate: calculatedEnd }));
    }
  }, [formData.leaseStartDate, formData.leaseRenewDate, formData.leaseType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    if (mode === "create") {
      // setFormData({
      //   name: "",
      //   email: "",
      //   phone: "",
      //   tenantType: "residential",
      //   propertyId: "",
      //   unitNumber: "",
      //   leaseStartDate: "",
      //   leaseRenewDate: "",
      //   leaseEndDate: "",
      //   leaseType: "monthly",
      //   leaseTerms: "",
      //   preferredContactMethod: "email",
      //   applicationDate: "",
      //   moveInDate: "",
      //   password: "",
      //   monthlyRent: 0,
      //   emergencyContact: "",
      //   notes: "",
      //   dateOfBirth: "",
      //   employmentInfo: "",
      //   previousAddresses: "",
      //   coSigner: "",
      //   pets: "",
      //   vehicles: "",
      //   businessInfo: "",
      //   businessContacts: "",
      //   financialInfo: "",
      //   securityDeposit: "",
      // });
      // onClose();
    }
  };

  const selectedProperty = availableProperties.find(
    (p) => p.id === formData.propertyId,
  );

  const unitOptions = selectedProperty?.availableUnits ?? [];
  const unitSelectOptions = formData.unitNumber
    ? Array.from(new Set([formData.unitNumber, ...unitOptions]))
    : unitOptions;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "create" ? "Add New Tenant" : "Edit Tenant"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? "Register a new tenant to a property"
                  : "Update tenant information"}
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
            {/* Tenant Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </div>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
              />
            </div>

            {/* Email, Phone, and Tenant Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </div>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </div>
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tenant Type
                </label>
                <select
                  name="tenantType"
                  value={formData.tenantType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* Preferred contact and dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Contact
                </label>
                <select
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Application Date
                </label>
                <Input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Move-in Date
                </label>
                <Input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="flex gap-2">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Auto-generate or enter manually"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        password: generatePassword(8),
                      }))
                    }
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div />
            </div>

            {/* Property and Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option value="">Select Property</option>
                  {availableProperties.length === 0 && (
                    <option value="" disabled>
                      No properties found
                    </option>
                  )}
                  {availableProperties.map((property) => (
                    <option
                      key={property.id}
                      value={property.id}
                      disabled={property.availableUnits.length === 0}
                    >
                      {property.name} - {property.address}, {property.city} (
                      {property.availableUnits.length === 0
                        ? "No units available"
                        : `${property.availableUnits.length} units available`}
                      )
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unit Number
                </label>
                <select
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={!formData.propertyId}
                >
                  <option value="">Select Unit</option>
                  {formData.propertyId &&
                    (unitSelectOptions.length ? (
                      unitSelectOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))
                    ) : (
                      <option key="none" value="" disabled>
                        No units available
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Lease Dates and Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center text-xs gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Lease Start Date
                  </div>
                </label>
                <Input
                  type="date"
                  name="leaseStartDate"
                  value={formData.leaseStartDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center text-xs gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Lease Renewal Date
                  </div>
                </label>
                <Input
                  type="date"
                  name="leaseRenewDate"
                  value={formData.leaseRenewDate}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {renewalDateHint ||
                    "Use the latest rent payment date as renewal date."}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  Lease End Date
                </label>
                <Input
                  type="date"
                  name="leaseEndDate"
                  value={formData.leaseEndDate}
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Calculated from lease start/renewal date and lease type.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  Lease Type
                </label>
                <select
                  name="leaseType"
                  value={formData.leaseType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="3_months">3 Months</option>
                  <option value="half_year">6 Months</option>
                  <option value="full_year">12 Months</option>
                  <option value="month-to-month">Month-to-Month</option>
                </select>
              </div>
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lease Terms
                </label>
                <Input
                  name="leaseTerms"
                  value={formData.leaseTerms}
                  onChange={handleChange}
                  placeholder="e.g., 12-month fixed"
                />
              </div>
            </div>

            {/* Monthly Rent and Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Rent
                </label>
                <Input
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  placeholder="2500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Emergency Contact
                </label>
                <Input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Contact name or number"
                />
              </div>
            </div>

            {/* Residential Fields */}
            {(formData.tenantType === "residential" ||
              formData.tenantType === "mixed") && (
              <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary">
                <p className="text-sm font-semibold text-foreground">
                  Residential Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Co-signer
                    </label>
                    <Input
                      name="coSigner"
                      value={formData.coSigner}
                      onChange={handleChange}
                      placeholder="Co-signer name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Employment Info
                    </label>
                    <Textarea
                      name="employmentInfo"
                      value={formData.employmentInfo}
                      onChange={handleChange}
                      placeholder="Employer, income, position"
                      className="h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Previous Addresses
                    </label>
                    <Textarea
                      name="previousAddresses"
                      value={formData.previousAddresses}
                      onChange={handleChange}
                      placeholder="List prior addresses"
                      className="h-24"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pets
                    </label>
                    <Input
                      name="pets"
                      value={formData.pets}
                      onChange={handleChange}
                      placeholder="Pet details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Vehicles
                    </label>
                    <Input
                      name="vehicles"
                      value={formData.vehicles}
                      onChange={handleChange}
                      placeholder="Vehicle make/model"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Fields */}
            {(formData.tenantType === "commercial" ||
              formData.tenantType === "mixed") && (
              <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary">
                <p className="text-sm font-semibold text-foreground">
                  Commercial Details
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Info
                  </label>
                  <Textarea
                    name="businessInfo"
                    value={formData.businessInfo}
                    onChange={handleChange}
                    placeholder="Company name, registration, industry"
                    className="h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Contacts
                  </label>
                  <Textarea
                    name="businessContacts"
                    value={formData.businessContacts}
                    onChange={handleChange}
                    placeholder="Primary contact, phone, email"
                    className="h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Financial Info
                  </label>
                  <Textarea
                    name="financialInfo"
                    value={formData.financialInfo}
                    onChange={handleChange}
                    placeholder="Revenue, credit terms, guarantees"
                    className="h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Security Deposit Details
                  </label>
                  <Input
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="Deposit terms"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the tenant"
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Add Tenant" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
