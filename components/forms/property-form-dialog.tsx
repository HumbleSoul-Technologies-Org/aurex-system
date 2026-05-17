"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, MapPin, Home, DollarSign, Loader2, ChevronDown } from "lucide-react";
import {
  PROPERTY_CATEGORIES,
  getSpecificationsForType,
  PropertyCategory,
} from "@/lib/constants/property-types";

interface SpecificationRow {
  title: string;
  value: string;
}

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  country: string;
  category: PropertyCategory;
  propertyType: string;
  geography: string;
  location: {
    lat: string;
    lng: string;
  };
  units: number;
  pricePerUnit: number;
  features: string;
  specificationValues: Record<string, string>;
  customSpecifications: SpecificationRow[];
  zoning: string;
  permittedUses: string;
  annualPropertyTaxes: string;
  annualInsurance: string;
  appraisedValue: string;
  lastAppraisalDate: string;
  noi: string;
  capRate: string;
  imageUrl?: string;
  description: string;
  estate: string;
}

interface PropertyFormDialogProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: PropertyFormData, file?: File | null) => void;
  isLoading?: boolean;
  initialData?: Partial<PropertyFormData>;
}

const defaultPropertyType =
  Object.keys(PROPERTY_CATEGORIES.residential.types)[0] || "apartment";

const createSpecificationValues = (
  propertyType: string,
  currentValues: Record<string, string> = {},
) => {
  return getSpecificationsForType(propertyType).reduce(
    (acc, spec) => {
      acc[spec.key] = currentValues[spec.key] ?? "";
      return acc;
    },
    {} as Record<string, string>,
  );
};

const getDefaultFormData = (): PropertyFormData => ({
  name: "",
  address: "",
  city: "",
  country: "",
  category: "residential",
  propertyType: defaultPropertyType,
  geography: "",
  location: { lat: "", lng: "" },
  units: 1,
  pricePerUnit: 0,
  features: "",
  specificationValues: createSpecificationValues(defaultPropertyType),
  customSpecifications: [],
  zoning: "",
  permittedUses: "",
  annualPropertyTaxes: "",
  annualInsurance: "",
  appraisedValue: "",
  lastAppraisalDate: "",
  noi: "",
  capRate: "",
  imageUrl: "",
  description: "",
  estate: "",
});

export default function PropertyFormDialog({
  mode,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: PropertyFormDialogProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    getDefaultFormData(),
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAdvancedSection, setShowAdvancedSection] = useState(false);

  // Initialize form data based on mode and initialData
  useEffect(() => {
    if (mode === "create") {
      setFormData(getDefaultFormData());
      setSelectedImage(null);
      setShowAdvancedSection(false);
    } else if (mode === "edit" && initialData) {
      const initialFormData: PropertyFormData = {
        name: initialData.name ?? "",
        address: initialData.address ?? "",
        city: initialData.city ?? "",
        country: initialData.country ?? "",
        category: (initialData.category as PropertyCategory) ?? "residential",
        propertyType: initialData.propertyType ?? defaultPropertyType,
        geography: initialData.geography ?? "",
        location: {
          lat: initialData.location?.lat?.toString() ?? "",
          lng: initialData.location?.lng?.toString() ?? "",
        },
        units: initialData.units ?? 1,
        pricePerUnit: initialData.pricePerUnit ?? 0,
        features: Array.isArray(initialData.features)
          ? initialData.features.join("\n")
          : initialData.features ?? "",
        specificationValues: initialData.specificationValues ?? {},
        customSpecifications: initialData.customSpecifications ?? [],
        zoning: initialData.zoning ?? "",
        permittedUses: Array.isArray(initialData.permittedUses)
          ? initialData.permittedUses.join("\n")
          : initialData.permittedUses ?? "",
        annualPropertyTaxes:
          initialData.annualPropertyTaxes?.toString() ?? "",
        annualInsurance: initialData.annualInsurance?.toString() ?? "",
        appraisedValue: initialData.appraisedValue?.toString() ?? "",
        lastAppraisalDate: initialData.lastAppraisalDate ?? "",
        noi: initialData.noi?.toString() ?? "",
        capRate: initialData.capRate?.toString() ?? "",
        imageUrl: Array.isArray(initialData.imageUrl)
          ? (initialData.imageUrl as any)[0]?.url ?? ""
          : initialData.imageUrl ?? "",
        description: initialData.description ?? "",
        estate: initialData.estate ?? "",
      };
      setFormData(initialFormData);
      setSelectedImage(null);
    }
  }, [mode, isOpen, initialData]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
      return;
    }

    if (name === "units" || name === "pricePerUnit") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    if (name === "category") {
      const nextCategory = value as PropertyCategory;
      const nextType =
        Object.keys(PROPERTY_CATEGORIES[nextCategory].types)[0] ||
        formData.propertyType;
      setFormData((prev) => ({
        ...prev,
        category: nextCategory,
        propertyType: nextType,
        specificationValues: createSpecificationValues(
          nextType,
          prev.specificationValues,
        ),
      }));
      return;
    }

    if (name === "propertyType") {
      const nextType = value;
      setFormData((prev) => ({
        ...prev,
        propertyType: nextType,
        specificationValues: createSpecificationValues(
          nextType,
          prev.specificationValues,
        ),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecificationValueChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specificationValues: {
        ...prev.specificationValues,
        [key]: value,
      },
    }));
  };

  const handleCustomSpecificationChange = (
    index: number,
    field: keyof SpecificationRow,
    value: string,
  ) => {
    setFormData((prev) => {
      const nextCustom = [...prev.customSpecifications];
      nextCustom[index] = {
        ...nextCustom[index],
        [field]: value,
      };
      return {
        ...prev,
        customSpecifications: nextCustom,
      };
    });
  };

  const addCustomSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      customSpecifications: [
        ...prev.customSpecifications,
        { title: "", value: "" },
      ],
    }));
  };

  const removeCustomSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customSpecifications: prev.customSpecifications.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedImage(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData, mode === "create" ? selectedImage : undefined);
    onClose();
  };

  if (!isOpen) return null;

  const typeSpecifications = getSpecificationsForType(formData.propertyType);
  const isEditMode = mode === "edit";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isEditMode ? "Edit Property" : "Add New Property"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Update property details and save"
                  : "Create a new rental property"}
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-primary" />
                  Property Name
                </div>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Sunset Apartments"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Street Address
                </div>
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country
                </label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estate
              </label>
              <Input
                name="estate"
                value={formData.estate}
                onChange={handleChange}
                placeholder="e.g., Riverside Estate"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(PROPERTY_CATEGORIES).map(
                    ([key, category]) => (
                      <option key={key} value={key}>
                        {category.label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(
                    PROPERTY_CATEGORIES[formData.category].types,
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Type-Specific Fields
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {typeSpecifications.map((spec) => (
                  <div key={spec.key}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {spec.label}
                    </label>
                    {spec.type === "textarea" ? (
                      <Textarea
                        name={`specificationValues.${spec.key}`}
                        value={formData.specificationValues[spec.key] ?? ""}
                        onChange={(event) =>
                          handleSpecificationValueChange(
                            spec.key,
                            event.target.value,
                          )
                        }
                        placeholder={spec.placeholder}
                        className="h-24"
                      />
                    ) : (
                      <Input
                        type={spec.type === "number" ? "number" : "text"}
                        name={`specificationValues.${spec.key}`}
                        value={formData.specificationValues[spec.key] ?? ""}
                        onChange={(event) =>
                          handleSpecificationValueChange(
                            spec.key,
                            event.target.value,
                          )
                        }
                        placeholder={spec.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Custom Specifications
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSpecification}
                >
                  Add Specification
                </Button>
              </div>
              {formData.customSpecifications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add any extra title/value specification pairs here.
                </p>
              )}
              <div className="space-y-3">
                {formData.customSpecifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1.4fr_auto]"
                  >
                    <Input
                      value={spec.title}
                      placeholder="Specification title"
                      onChange={(event) =>
                        handleCustomSpecificationChange(
                          index,
                          "title",
                          event.target.value,
                        )
                      }
                    />
                    <Input
                      value={spec.value}
                      placeholder="Specification value"
                      onChange={(event) =>
                        handleCustomSpecificationChange(
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCustomSpecification(index)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Units
                </label>
                <Input
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Price Per Unit
                  </div>
                </label>
                <Input
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="2500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Geography
              </label>
              <Input
                name="geography"
                value={formData.geography}
                onChange={handleChange}
                placeholder="e.g., urban, suburban, rural"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Latitude
                </label>
                <Input
                  type="text"
                  name="location.lat"
                  value={formData.location.lat}
                  onChange={handleChange}
                  placeholder="e.g., 37.7749"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Longitude
                </label>
                <Input
                  type="text"
                  name="location.lng"
                  value={formData.location.lng}
                  onChange={handleChange}
                  placeholder="e.g., -122.4194"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Features
              </label>
              <Textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder="List key property features..."
                className="h-20"
              />
            </div>

            <div className="border border-border rounded-lg bg-secondary">
              <button
                type="button"
                onClick={() => setShowAdvancedSection((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-border transition-colors"
                aria-expanded={showAdvancedSection}
              >
                <span>Financial & Legal Details (Optional)</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAdvancedSection ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showAdvancedSection && (
                <div className="grid grid-cols-1 gap-4 p-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Zoning
                    </label>
                    <Input
                      name="zoning"
                      value={formData.zoning}
                      onChange={handleChange}
                      placeholder="e.g., residential, mixed-use"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Permitted Uses
                    </label>
                    <Input
                      name="permittedUses"
                      value={formData.permittedUses}
                      onChange={handleChange}
                      placeholder="e.g., retail, office, multifamily"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Annual Property Taxes
                      </label>
                      <Input
                        type="number"
                        name="annualPropertyTaxes"
                        value={formData.annualPropertyTaxes}
                        onChange={handleChange}
                        placeholder="e.g., 18000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Annual Insurance
                      </label>
                      <Input
                        type="number"
                        name="annualInsurance"
                        value={formData.annualInsurance}
                        onChange={handleChange}
                        placeholder="e.g., 12000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Appraised Value
                      </label>
                      <Input
                        type="number"
                        name="appraisedValue"
                        value={formData.appraisedValue}
                        onChange={handleChange}
                        placeholder="e.g., 2500000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Appraisal Date
                      </label>
                      <Input
                        type="date"
                        name="lastAppraisalDate"
                        value={formData.lastAppraisalDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Net Operating Income (NOI)
                      </label>
                      <Input
                        type="number"
                        name="noi"
                        value={formData.noi}
                        onChange={handleChange}
                        placeholder="e.g., 145000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Capitalization Rate (Cap Rate)
                      </label>
                      <Input
                        type="number"
                        name="capRate"
                        value={formData.capRate}
                        onChange={handleChange}
                        placeholder="e.g., 5.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL
              </label>
              <Input
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />

              {!isEditMode && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Or upload from your computer
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileSelect}
                      className="px-3"
                    >
                      Upload Image
                    </Button>
                    <span className="text-sm text-foreground">
                      {selectedImage ? selectedImage.name : "No file selected"}
                    </span>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedImage(null)}
                        className="text-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Preview
                      </p>
                      <img
                        src={previewUrl}
                        alt="Selected preview"
                        className="max-h-40 w-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about the property..."
                className="h-24"
              />
            </div>

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Add Property"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
