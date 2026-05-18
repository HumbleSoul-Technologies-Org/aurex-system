"use client";

import { useState, useRef, useEffect } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddTenantForm from "@/components/forms/add-tenant-form";
import PropertyFormDialog from "@/components/forms/property-form-dialog";
import {
  createTenantApi,
  deleteTenant,
  TenantRecord,
} from "@/lib/services/tenants";
import { useAppData } from "@/lib/data-context";
import { updateProperty } from "@/lib/services/properties";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Settings,
  Edit,
  Home,
  ImagePlus,
  Copy,
  Check,
  Loader2,
  Trash,
  X,
  MapPinOff,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { listTransactions } from "@/app/lib/transactions-client";
import { deleteMessage } from "@/lib/services/messages";
import { createTenantInvite } from "@/lib/services/tenant-invites";
import {
  getSpecificationsForType,
  getCategoryForType,
  createSpecificationValues,
} from "@/lib/constants/property-types";
import { deleteProperty } from "@/lib/services/properties";
import { apiRequest } from "@/lib/query-client";
import { url } from "inspector";

interface SpecificationRow {
  title: string;
  value: string;
}

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = use(params);
  const { properties, tenants } = useAppData();
  const [property, setProperty] = useState<any>(() =>
    properties.find((item) => item.id === id),
  );
  const refreshProperty = () => {
    const updated = properties.find((item) => item.id === id);
    setProperty(updated);
    setImages(updated?.images || []);
    return updated;
  };

  useEffect(() => {
    refreshProperty();
  }, [id, properties]);

  const propertyTenants = tenants.filter((t) => t.propertyId === id);
  const initialPropertyType =
    property?.propertyType || property?.type || "apartment";
  const initialSpecificationValues = getSpecificationsForType(
    initialPropertyType,
  ).reduce(
    (acc, spec) => {
      const existingSpec = (property?.specifications || []).find(
        (item: any) => item.title === spec.label,
      );
      acc[spec.key] = existingSpec?.value ?? "";
      return acc;
    },
    {} as Record<string, string>,
  );
  const initialCustomSpecifications = (property?.specifications || []).filter(
    (item: any) =>
      !getSpecificationsForType(initialPropertyType).some(
        (spec) => spec.label === item.title,
      ),
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<any[]>(property?.images || []);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUnit, setInviteUnit] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const list = listTransactions();
    if (!mounted) return;
    const tenantIds = propertyTenants.map((t: any) => t.id);
    const filtered = list.filter(
      (tx: any) =>
        tx.propertyId === property?.id ||
        (tx.tenantId && tenantIds.includes(tx.tenantId)),
    );
    setTransactions(filtered);
    return () => {
      mounted = false;
    };
  }, [property?.id]);

  // Income Calculations
  const tenantMonthly = propertyTenants.reduce(
    (sum, tenant) => sum + (tenant.rentAmount || 0),
    0,
  );
  let totalMonthlyIncome = tenantMonthly;
  // If property has units and a price per unit, use that to calculate income
  if (property?.units_available && property?.price_per_unit) {
    totalMonthlyIncome = property?.price_per_unit * property?.units_available;
  }
  const totalAnnualIncome = totalMonthlyIncome * 12;
  const occupiedUnits = propertyTenants.length;
  const averageIncomePerUnit =
    occupiedUnits > 0 ? Math.round(totalMonthlyIncome / occupiedUnits) : 0;
  const potentialMonthlyIncome = property?.price_per_unit
    ? property?.price_per_unit * property?.units_available
    : 0;
  const occupancyPercentage =
    property?.units_available > 0
      ? Math.round((occupiedUnits / property?.units_available) * 100)
      : 0;
  const incomeUtilization =
    potentialMonthlyIncome > 0
      ? Math.round((totalMonthlyIncome / potentialMonthlyIncome) * 100)
      : 0;

  function formatCompactNumber(value: number | null | undefined) {
    const n = Number(value) || 0;
    const abs = Math.abs(n);
    if (abs >= 1_000_000) {
      const v = n / 1_000_000;
      return (Number.isInteger(v) ? String(v) : v.toFixed(1)) + "M";
    }
    if (abs >= 1_000) {
      const v = n / 1_000;
      return (Number.isInteger(v) ? String(v) : v.toFixed(1)) + "K";
    }
    return String(n);
  }

  // Tenant-collected rent for this property (completed rent transactions)
  const tenantCollected = transactions
    .filter((t) => t.type === "rent" && t.status === "completed")
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // revenue lost compared to potential monthly income
  const revenueLost = Math.max(0, potentialMonthlyIncome - tenantCollected);
  const avgRevenueLostPerUnit = property?.units_available
    ? Math.round(revenueLost / property?.units_available)
    : 0;

  const handleGenerateInvite = () => {
    const invite = createTenantInvite({
      propertyId: property.id,
      unitNumber: inviteUnit || undefined,
      email: inviteEmail || undefined,
      createdBy: "admin", // TODO: get from auth context
      notes: `Invite for property ${property.name}`,
    });
    const inviteUrl = `${window.location.origin}/auth/invite?token=${invite.token}`;
    setGeneratedInviteLink(inviteUrl);
  };

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(generatedInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="flex pb-2 items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <Link
              href="/dashboard/properties"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card className="border border-border p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/no-property.png"
              alt="Property not found"
              className="mx-auto mb-4 w-32 h-32"
            />
            <p className="text-muted-foreground mb-5">Property not found</p>
          </div>
        </Card>
      </div>
    );
  }

  const hundlePropertyDelete = async (id: any) => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProperty(id, adminPassword);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleteOpen(false);
      window.location.href = "/dashboard/properties";
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              This will permanently delete the property and all associated
              tenant profiles. Please enter the admin password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={isDeleting}
            />
            {deleteError && (
              <div className="text-red-600 text-sm">{deleteError}</div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting || !adminPassword}
                onClick={() => hundlePropertyDelete(property.id)}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {property ? (
        <div>
          {/* Header */}
          <div className="flex pb-2 items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <Link
                href="/dashboard/properties"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <span className="flex-1 w-full"></span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Property
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Property
            </Button>

            <PropertyFormDialog
              mode="edit"
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              initialData={property}
              onSubmit={async (data: any) => {
                try {
                  setIsUpdatingProperty(true);
                  const updated: any = {};

                  if (data.name !== "") updated.name = data.name;
                  if (data.address !== "") updated.address = data.address;
                  if (data.city !== "") updated.city = data.city;
                  if (data.country !== "") updated.country = data.country;
                  if (data.estate !== "") updated.estate = data.estate;
                  updated.price_per_unit = data.pricePerUnit;
                  updated.units_available = data.units;
                  if (data.category !== "") updated.category = data.category;
                  if (data.propertyType !== "")
                    updated.propertyType = data.propertyType;
                  if (data.geography !== "") updated.geography = data.geography;

                  const cleanedFeatures = data.features
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                  if (cleanedFeatures.length > 0) {
                    updated.features = cleanedFeatures;
                  }

                  if (data.location.lat !== "" && data.location.lng !== "") {
                    updated.location = {
                      lat: Number(data.location.lat),
                      lng: Number(data.location.lng),
                    };
                  }

                  const dynamicSpecifications = Object.entries(
                    data.specificationValues || {},
                  ).flatMap(([key, value]) => {
                    const label = getSpecificationsForType(
                      data.propertyType,
                    ).find((spec) => spec.key === key)?.label;
                    const trimmed = value?.toString().trim();
                    return trimmed && label
                      ? [{ title: label, value: trimmed }]
                      : [];
                  });

                  const customSpecifications = (
                    data.customSpecifications || []
                  ).filter(
                    (spec: any) =>
                      spec.title?.trim() !== "" || spec.value?.trim() !== "",
                  );

                  const specifications = [
                    ...dynamicSpecifications,
                    ...customSpecifications,
                  ];

                  if (specifications.length > 0) {
                    updated.specifications = specifications;
                  }

                  if (data.zoning !== "") updated.zoning = data.zoning;
                  if (data.permittedUses !== "") {
                    const cleanedPermittedUses = data.permittedUses
                      .split("\n")
                      .map((s: string) => s.trim())
                      .filter(Boolean);
                    if (cleanedPermittedUses.length > 0) {
                      updated.permittedUses = cleanedPermittedUses;
                    }
                  }
                  if (data.annualPropertyTaxes !== "")
                    updated.annualPropertyTaxes = Number(
                      data.annualPropertyTaxes,
                    );
                  if (data.annualInsurance !== "")
                    updated.annualInsurance = Number(data.annualInsurance);
                  if (data.appraisedValue !== "")
                    updated.appraisedValue = Number(data.appraisedValue);
                  if (data.lastAppraisalDate !== "")
                    updated.lastAppraisalDate = data.lastAppraisalDate;
                  if (data.noi !== "") updated.noi = Number(data.noi);
                  if (data.capRate !== "")
                    updated.capRate = Number(data.capRate);
                  if (data.description !== "")
                    updated.description = data.description;
                  if (data.imageUrl !== "") updated.images = [data.imageUrl];

                  await updateProperty(property?.id, updated);
                  refreshProperty();
                } catch (e) {
                  console.error("Failed to update property", e);
                  alert("Update failed");
                } finally {
                  setIsUpdatingProperty(false);
                }
              }}
              isLoading={isUpdatingProperty}
            />
          </div>

          {/* Property Hero */}
          <Card className="border border-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* Image Gallery */}
              <div className="md:col-span-1 space-y-3">
                {/* Main Image */}
                <div className="relative h-64 bg-secondary overflow-hidden rounded-lg">
                  <img
                    src={images?.[0]?.url || "/placeholder.svg"}
                    alt={property?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images &&
                    images.length > 0 &&
                    images.map((image: any, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <button
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? "border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={image?.url}
                            alt={`${property?.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete image ${index + 1}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const next = images.filter((_, i) => i !== index);
                            setImages(next);
                            try {
                              const res = await apiRequest(
                                "POST",
                                `/property/${property?.id}/delete-image`,
                                { public_id: image.public_id },
                              );

                              if (!res.ok) {
                                throw new Error(
                                  `Failed to delete image: ${await res.text()}`,
                                );
                                return;
                              }
                              await updateProperty(property?.id, {
                                images: next.map((u: any) =>
                                  typeof u === "string"
                                    ? { url: u, public_id: "" }
                                    : u,
                                ),
                              });
                              refreshProperty();
                            } catch (err) {
                              console.error(
                                "Failed to persist image deletion",
                                err,
                              );
                            }
                            setSelectedImageIndex((prev) =>
                              Math.max(0, Math.min(prev, next.length - 1)),
                            );
                          }}
                          className="absolute top-0 right-0 m-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/90 hover:bg-red-600 hover:text-white text-xs"
                        >
                          <X className="w-3 font-bold h-3" />
                        </button>
                      </div>
                    ))}

                  {/* Small add button always visible when under limit */}
                  {images.length < 6 && (
                    <div>
                      <Button
                        size="sm"
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-transparent w-16 h-16 border-dashed border-2 border-border hover:border-white hover:text-primary hover:bg-primary p-3"
                      >
                        <ImagePlus className="w-5 h-5 text-gray-200" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Property Image</DialogTitle>
                      <DialogDescription>
                        Add a title and upload an image for this property
                        gallery.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Title
                        </label>
                        <Input
                          name="uploadTitle"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="Image title (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Image
                        </label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            if (!f) {
                              setUploadFile(null);
                              setUploadPreview(null);
                              return;
                            }
                            setUploadFile(f);
                            const url = URL.createObjectURL(f);
                            setUploadPreview(url);
                          }}
                          className="hidden"
                        />

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const f = e.dataTransfer.files?.[0] ?? null;
                            if (!f) return;
                            setUploadFile(f);
                            const url = URL.createObjectURL(f);
                            setUploadPreview(url);
                          }}
                          className={`flex items-center justify-center flex-col gap-2 rounded-md border-2 p-6 text-center cursor-pointer ${
                            dragActive
                              ? "border-primary bg-primary/5"
                              : "border-dashed border-border bg-transparent"
                          }`}
                        >
                          <ImagePlus className="w-8 h-8 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">
                            <div>
                              Drag & drop an image here, or click to browse
                            </div>
                            <div className="text-xs text-muted-foreground/80">
                              PNG, JPG, GIF up to 10MB
                            </div>
                          </div>
                        </div>

                        {uploadPreview && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Preview
                            </p>
                            <img
                              src={uploadPreview}
                              alt="Upload preview"
                              className="max-h-40 w-auto rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // cancel
                            if (uploadPreview) {
                              URL.revokeObjectURL(uploadPreview);
                            }
                            setUploadFile(null);
                            setUploadPreview(null);
                            setUploadTitle("");
                            setIsUploadOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isUploading}
                          onClick={async () => {
                            setIsUploading(true);
                            try {
                              if (uploadFile) {
                                const res =
                                  await uploadToCloudinary(uploadFile);
                                const next = [
                                  ...images,
                                  {
                                    url: res.secure_url,
                                    public_id: res.public_id,
                                  },
                                ];
                                setImages(next);
                                setSelectedImageIndex(next.length - 1);

                                try {
                                  const resp = await apiRequest(
                                    "POST",
                                    `/property/${property?.id}/add-image`,
                                    {
                                      url: res.secure_url,
                                      public_id: res.public_id,
                                    },
                                  );

                                  if (!resp.ok) {
                                    console.error(
                                      "Failed to persist property image",
                                      await resp.text(),
                                    );
                                    return;
                                  }
                                  await updateProperty(property?.id, {
                                    images: next.map((u: any) =>
                                      typeof u === "string"
                                        ? { url: u, public_id: "" }
                                        : u,
                                    ),
                                  });
                                  refreshProperty();
                                } catch (e) {
                                  console.error(
                                    "Failed to persist property images",
                                    e,
                                  );
                                }

                                console.log("Cloudinary upload result", res);
                              } else if (uploadPreview) {
                                setImages((prev) => {
                                  const next = [...prev, uploadPreview];
                                  setSelectedImageIndex(next.length - 1);
                                  return next;
                                });
                              }
                            } catch (err) {
                              console.error("Upload failed", err);
                            } finally {
                              setIsUploading(false);
                              if (uploadPreview)
                                URL.revokeObjectURL(uploadPreview);
                              setUploadFile(null);
                              setUploadPreview(null);
                              setUploadTitle("");
                              setIsUploadOpen(false);
                            }
                          }}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Add Image"
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Info */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {property?.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property?.address}, {property?.city}, {property?.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    Property ID:
                    <span className="underline">{property?.id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(String(property?.id));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (e) {
                          // ignore
                        }
                      }}
                      aria-label="Copy property id"
                      className="ml-1 p-1 rounded hover:bg-secondary"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                      Active Property
                    </div>
                    <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold capitalize">
                      {property?.type}
                    </div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Available Units
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {property?.units.length - property?.tenants.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tenants
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {propertyTenants.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Occupancy
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {occupancyPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Income
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${formatCompactNumber(totalMonthlyIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Annual Income
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${formatCompactNumber(totalAnnualIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="border border-border">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="units"
                  className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Units & Tenants
                </TabsTrigger>
                <TabsTrigger
                  value="financials"
                  className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financials
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Property Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Property Type
                      </p>
                      <p className="font-semibold text-foreground capitalize">
                        {property?.type || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Available Units
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.units !== undefined &&
                        property?.units.length > 0 &&
                        property?.tenants !== undefined ? (
                          property?.units.length - property?.tenants.length || 0
                        ) : (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Address
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.address || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">City</p>
                      <p className="font-semibold text-foreground">
                        {property?.city || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Country
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.country || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Square Meters
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.sq_mtrs !== undefined &&
                        property?.sq_mtrs !== null ? (
                          property?.sq_mtrs
                        ) : (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Features & Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Geography
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.geography || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Occupancy Status
                      </p>
                      <p className="font-semibold text-foreground">
                        {property?.occupancy || (
                          <span className="text-muted-foreground">
                            No details found
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Property Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(property?.features) &&
                      property?.features.length > 0 ? (
                        property?.features.map(
                          (feature: any, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full"
                            >
                              {feature}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          No details found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Specifications */}
                {property?.specifications &&
                  property.specifications.length > 0 && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-bold text-foreground mb-4">
                        Property Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.specifications
                          .filter(
                            (spec: any) =>
                              spec.title?.trim() && spec.value?.trim(),
                          )
                          .map((spec: any, index: number) => (
                            <div key={index} className="flex flex-col">
                              <p className="text-sm text-muted-foreground mb-1">
                                {spec.title}
                              </p>
                              <p className="font-semibold text-foreground">
                                {spec.value}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Rental Details
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Price Per Unit
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${property?.price_per_unit.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Tenants
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {propertyTenants.length}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Occupancy
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {property?.occupancy}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Units & Tenants Tab */}
              <TabsContent value="units" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">
                      Tenants ({propertyTenants.length})
                    </h3>
                    <AddTenantForm
                      isOpen={showAddTenant}
                      onClose={() => setShowAddTenant(false)}
                      onSubmit={async (data: any) => {
                        try {
                          const payload: Partial<TenantRecord> = {
                            name: data.name,
                            email: data.email,
                            tenantType: data.tenantType,
                            unitNumber: data.unitNumber,
                            propertyId: property?.id,
                            rentAmount: data.monthlyRent,
                            leaseType: data.leaseType,
                            leaseStartDate: data.leaseStartDate,
                            leaseEndDate: data.leaseEndDate,
                            leaseTerms: data.leaseTerms,
                            preferredContactMethod: data.preferredContactMethod,
                            applicationDate: data.applicationDate,
                            moveInDate: data.moveInDate,
                            dateOfBirth: data.dateOfBirth,
                            employmentInfo: data.employmentInfo,
                            previousAddresses: data.previousAddresses
                              ? data.previousAddresses
                                  .split("\n")
                                  .filter(Boolean)
                              : undefined,
                            coSigner: data.coSigner,
                            pets: data.pets,
                            vehicles: data.vehicles,
                            businessInfo: data.businessInfo,
                            businessContacts: data.businessContacts,
                            financialInfo: data.financialInfo,
                            securityDeposit: data.securityDeposit,
                            status: "due",
                          };

                          await createTenantApi(payload);
                          refreshProperty();
                          setShowAddTenant(false);
                        } catch (e) {
                          console.error("Add tenant failed", e);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => setShowAddTenant(true)}>
                      Add Tenant
                    </Button>
                    <Dialog
                      open={showInviteDialog}
                      onOpenChange={setShowInviteDialog}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Generate Invite Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate Tenant Invite Link</DialogTitle>
                          <DialogDescription>
                            Create a secure link for tenants to sign up for this
                            property.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Unit Number (optional)
                            </label>
                            <Input
                              placeholder="e.g. 101"
                              value={inviteUnit}
                              onChange={(e) => setInviteUnit(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Expected Email (optional)
                            </label>
                            <Input
                              type="email"
                              placeholder="tenant@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          {generatedInviteLink && (
                            <div>
                              <label className="text-sm font-medium">
                                Invite Link
                              </label>
                              <div className="flex gap-2">
                                <Input value={generatedInviteLink} readOnly />
                                <Button size="sm" onClick={copyInviteLink}>
                                  {copied ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowInviteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleGenerateInvite}>
                            Generate Link
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {propertyTenants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Unit
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Avatar
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Tenant
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Monthly Rent
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Lease Type
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyTenants.map((tenant) => (
                            <tr
                              key={tenant.id}
                              className="border-b border-border hover:bg-secondary"
                            >
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {tenant.unitNumber}
                              </td>
                              <td className="px-4 py-3">
                                <Image
                                  src={
                                    tenant?.image ||
                                    "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                                  }
                                  alt={tenant?.name || "Tenant"}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              </td>
                              <td className="px-4 py-3 text-foreground">
                                <Link
                                  href={`/dashboard/tenants/${tenant.id}`}
                                  className="font-semibold text-blue-600 hover:underline"
                                >
                                  {tenant.name}
                                </Link>
                              </td>
                              <td className="px-4 py-3 font-semibold text-foreground">
                                ${(tenant.rentAmount ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    tenant.status === "paid"
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                      : tenant.status === "due"
                                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                        : tenant.status === "moving out"
                                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  }`}
                                >
                                  {tenant.status === "paid"
                                    ? "Paid"
                                    : tenant.status === "due"
                                      ? "Due"
                                      : (tenant.status ?? "").replace("-", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-foreground capitalize">
                                {tenant.leaseType}
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href={`/dashboard/tenants/${tenant.id}`}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Card className="border border-border p-8 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        No tenants in this property
                      </p>
                      <Button size="sm">Add First Tenant</Button>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="p-6">
                {/* Income Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Income Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border border-border p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Monthly Income
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${formatCompactNumber(totalMonthlyIncome)}
                      </p>
                    </Card>
                    <Card className="border border-border p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Annual Income
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${formatCompactNumber(totalAnnualIncome)}
                      </p>
                    </Card>
                    <Card className="border border-border p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Occupied Units
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {occupiedUnits}/{property?.units_available}
                      </p>
                    </Card>
                    <Card className="border border-border p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Occupancy Rate
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {occupancyPercentage}%
                      </p>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Price per Unit
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${property?.price_per_unit.toLocaleString()}
                    </p>
                  </Card>
                  <Card className="border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Average Income per Unit
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${averageIncomePerUnit.toLocaleString()}
                    </p>
                  </Card>
                  <Card className="border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Total Units Available
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {property?.units_available}
                    </p>
                  </Card>
                </div>

                {/* Tenant Monthly Rent Breakdown */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Tenant Monthly Rent Breakdown
                  </h3>
                  {propertyTenants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Unit
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Tenant
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Monthly Rent
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Annual Income
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                              Lease Type
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyTenants.map((tenant) => (
                            <tr
                              key={tenant.id}
                              className="border-b border-border hover:bg-secondary"
                            >
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {tenant.unitNumber}
                              </td>
                              <td className="px-4 py-3 text-foreground">
                                {tenant.name}
                              </td>
                              <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                                ${(tenant.rentAmount ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 font-semibold text-foreground">
                                $
                                {(
                                  (tenant.rentAmount ?? 0) * 12
                                ).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-foreground capitalize">
                                {tenant.leaseType}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-border bg-secondary">
                            <td
                              colSpan={2}
                              className="px-4 py-3 font-bold text-foreground"
                            >
                              TOTAL
                            </td>
                            <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">
                              ${formatCompactNumber(tenantCollected)}
                            </td>
                            <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">
                              ${formatCompactNumber(tenantCollected * 12)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Card className="border border-border p-8 text-center">
                      <p className="text-muted-foreground">
                        No tenants to display
                      </p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="p-6">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No documents uploaded yet
                  </p>
                  <Button>Upload Document</Button>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      Property Settings
                    </h3>
                    <Button variant="outline">Edit Property Details</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <MapPinOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Property not found. It may have been deleted or you may not have
            access to it.
          </p>
          {/* <Button onClick={() => router.push('/dashboard/properties')}>Back to Properties</Button>   */}
        </div>
      )}
    </div>
  );
}
