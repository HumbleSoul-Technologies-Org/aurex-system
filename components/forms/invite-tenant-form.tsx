"use client";

import React, { useState } from "react";
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
  preferredName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "non-binary" | "other";
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated";
  nationality: string;
  placeOfOrigin: string;
  password: string;
  confirmPassword: string;
  preferredContactMethod: "email" | "phone" | "sms";
  hasFamily: "yes" | "no";
  householdMembers: string;
  cohabitantName: string;
  cohabitantRelationship: string;
  occupation: string;
  employerName: string;
  position: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
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
    preferredName: "",
    middleName: "",
    email: invite.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    maritalStatus: "single",
    nationality: "",
    placeOfOrigin: "",
    password: "",
    confirmPassword: "",
    preferredContactMethod: "email",
    hasFamily: "yes",
    householdMembers: "",
    cohabitantName: "",
    cohabitantRelationship: "",
    occupation: "",
    employerName: "",
    position: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",
    nextOfKinEmail: "",
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
          preferredName: formData.preferredName,
          middleName: formData.middleName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          nationality: formData.nationality,
          placeOfOrigin: formData.placeOfOrigin,
          preferredContactMethod: formData.preferredContactMethod,
          hasFamily: formData.hasFamily === "yes",
          householdMembers: formData.householdMembers,
          cohabitant: {
            name: formData.cohabitantName,
            relationship: formData.cohabitantRelationship,
          },
          occupation: formData.occupation,
          employerName: formData.employerName,
          position: formData.position,
          nextOfKin: {
            name: formData.nextOfKinName,
            relationship: formData.nextOfKinRelationship,
            phone: formData.nextOfKinPhone,
            email: formData.nextOfKinEmail,
          },
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

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <Label htmlFor="preferredName">Preferred Name</Label>
            <Input
              id="preferredName"
              name="preferredName"
              value={formData.preferredName}
              onChange={handleChange}
              placeholder="Johnny"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="A."
            />
          </div>
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select
              value={formData.maritalStatus}
              onValueChange={(value) =>
                handleSelectChange("maritalStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="Kenyan"
            />
          </div>
          <div>
            <Label htmlFor="placeOfOrigin">Place of Origin</Label>
            <Input
              id="placeOfOrigin"
              name="placeOfOrigin"
              value={formData.placeOfOrigin}
              onChange={handleChange}
              placeholder="Nairobi"
            />
          </div>
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

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Tenancy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Software developer"
            />
          </div>
          <div>
            <Label htmlFor="employerName">Employer</Label>
            <Input
              id="employerName"
              name="employerName"
              value={formData.employerName}
              onChange={handleChange}
              placeholder="Company or organization"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Job title"
            />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hasFamily">Family status</Label>
            <Select
              value={formData.hasFamily}
              onValueChange={(value) => handleSelectChange("hasFamily", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Has family</SelectItem>
                <SelectItem value="no">Living with another person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="placeOfOrigin">Place of Origin</Label>
            <Input
              id="placeOfOrigin"
              name="placeOfOrigin"
              value={formData.placeOfOrigin}
              onChange={handleChange}
              placeholder="Area or town"
            />
          </div>
        </div>
        {formData.hasFamily === "yes" ? (
          <div>
            <Label htmlFor="householdMembers">Household Members</Label>
            <Textarea
              id="householdMembers"
              name="householdMembers"
              value={formData.householdMembers}
              onChange={handleChange}
              placeholder="List family members who will live with you, and their relationship"
              rows={3}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cohabitantName">Cohabitant Name</Label>
              <Input
                id="cohabitantName"
                name="cohabitantName"
                value={formData.cohabitantName}
                onChange={handleChange}
                placeholder="Name of the person"
              />
            </div>
            <div>
              <Label htmlFor="cohabitantRelationship">Relationship</Label>
              <Input
                id="cohabitantRelationship"
                name="cohabitantRelationship"
                value={formData.cohabitantRelationship}
                onChange={handleChange}
                placeholder="Relationship to tenant"
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextOfKinName">Next of Kin Name</Label>
            <Input
              id="nextOfKinName"
              name="nextOfKinName"
              value={formData.nextOfKinName}
              onChange={handleChange}
              placeholder="Name"
            />
          </div>
          <div>
            <Label htmlFor="nextOfKinRelationship">Relationship</Label>
            <Input
              id="nextOfKinRelationship"
              name="nextOfKinRelationship"
              value={formData.nextOfKinRelationship}
              onChange={handleChange}
              placeholder="Relationship to tenant"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
            <Input
              id="nextOfKinPhone"
              name="nextOfKinPhone"
              value={formData.nextOfKinPhone}
              onChange={handleChange}
              placeholder="(555) 987-6543"
            />
          </div>
          <div>
            <Label htmlFor="nextOfKinEmail">Next of Kin Email</Label>
            <Input
              id="nextOfKinEmail"
              name="nextOfKinEmail"
              type="email"
              value={formData.nextOfKinEmail}
              onChange={handleChange}
              placeholder="kin@example.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Policies</h3>
        <div className="bg-secondary/50 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
          <p>
            By submitting this information, you confirm that you understand and
            agree to the tenant policies and house rules for this property.
          </p>
          {invite.leaseTerms ? (
            <div className="rounded-lg border border-border p-4 bg-background">
              <p className="font-medium text-foreground mb-2">Invite Terms</p>
              <p className="text-sm text-muted-foreground">
                {invite.leaseTerms}
              </p>
            </div>
          ) : (
            <p>
              Standard tenancy and conduct policies will apply once your
              registration is approved.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Financials</h3>
        <div>
          <Label htmlFor="financialInfo">Financial Information</Label>
          <Textarea
            id="financialInfo"
            name="financialInfo"
            value={formData.financialInfo}
            onChange={handleChange}
            placeholder="Income, bank details, credit score, or other financial notes"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting registration..." : "Submit registration"}
      </Button>
    </form>
  );
}
