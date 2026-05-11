"use client";

import React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAvailablePropertiesWithUnits } from "@/lib/services/properties";
import { Calendar, Mail, Phone, User, X } from "lucide-react";

interface AddTenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TenantFormData) => void;
}

interface TenantFormData {
  name: string;
  email: string;
  phone: string;
  tenantType: "residential" | "commercial" | "mixed";
  propertyId: string;
  unitNumber: string;
  leaseStartDate: string;
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

export default function AddTenantForm({
  isOpen,
  onClose,
  onSubmit,
}: AddTenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    email: "",
    phone: "",
    tenantType: "residential",
    propertyId: "",
    unitNumber: "",
    leaseStartDate: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      tenantType: "residential",
      propertyId: "",
      unitNumber: "",
      leaseStartDate: "",
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
                Add New Tenant
              </h2>
              <p className="text-sm text-muted-foreground">
                Register a new tenant to a property
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
                  {availableProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address}, {property.city} (
                      {property.availableUnits.length} units available)
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
                    availableProperties
                      .find((p) => p.id === formData.propertyId)
                      ?.availableUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Lease Dates and Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center gap-2">
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
                  <option value="half_year">Half Year</option>
                  <option value="full_year">Full Year</option>
                </select>
              </div>
              <div>
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
                placeholder="Add any additional information..."
                className="h-20"
              />
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
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                Add Tenant
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
