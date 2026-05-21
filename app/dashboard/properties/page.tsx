"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyFormDialog from "@/components/forms/property-form-dialog";
import { createProperty, PropertyRecord } from "@/lib/services/properties";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getSpecificationsForType } from "@/lib/constants/property-types";
import { useAppData } from "@/lib/data-context";
import { queryClient } from "@/lib/query-client";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  Home,
  MapPin,
  Users,
  DollarSign,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const { user, token } = useAuth();
  const { properties } = useAppData();

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddProperty = async (data: any, file?: File | null) => {
    setIsCreatingProperty(true);
    try {
      const typeSpecs = getSpecificationsForType(
        data.propertyType || "apartment",
      );
      const dynamicSpecifications = Object.entries(
        data.specificationValues || {},
      ).flatMap(([key, value]) => {
        const label = typeSpecs.find((spec) => spec.key === key)?.label ?? key;
        const trimmed = value?.toString().trim();
        return trimmed ? [{ title: label, value: trimmed }] : [];
      });
      const customSpecifications = data.customSpecifications?.filter(
        (spec: any) => spec.title?.trim() !== "" || spec.value?.trim() !== "",
      );

      const payload: Partial<PropertyRecord> = {
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        category: data.category,
        geography: data.geography,
        units_available: data.units,
        price_per_unit: data.pricePerUnit,
        propertyType: data.propertyType,
        features: data.features
          ? data.features
              .split("\n")
              .map((f: string) => f.trim())
              .filter(Boolean)
          : [],
        specifications: [
          ...dynamicSpecifications,
          ...(customSpecifications ?? []),
        ],
        description: data.description,
        zoning: data.zoning,
        permittedUses: data.permittedUses
          ? data.permittedUses
              .split("\n")
              .map((f: string) => f.trim())
              .filter(Boolean)
          : undefined,
        annualPropertyTaxes: data.annualPropertyTaxes
          ? Number(data.annualPropertyTaxes)
          : undefined,
        annualInsurance: data.annualInsurance
          ? Number(data.annualInsurance)
          : undefined,
        appraisedValue: data.appraisedValue
          ? Number(data.appraisedValue)
          : undefined,
        lastAppraisalDate: data.lastAppraisalDate,
        noi: data.noi ? Number(data.noi) : undefined,
        capRate: data.capRate ? Number(data.capRate) : undefined,
        estate: data.estate,
        location:
          data.location.lat.trim() !== "" && data.location.lng.trim() !== ""
            ? { lat: Number(data.location.lat), lng: Number(data.location.lng) }
            : undefined,
      };

      if (data.imageUrl) payload.images = [data.imageUrl];
      if (file) {
        try {
          const res = await uploadToCloudinary(file);

          if (res.secure_url && res.public_id) {
            payload.images = [
              ...(payload.images || []),
              {
                url: res.secure_url || data.imageUrl,
                public_id: res.public_id,
              },
            ];
          }
        } catch (e) {
          console.error("Image upload failed", e);
        }
      }

      // Simulate 3-second delay for property creation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await createProperty(payload, token ? token : null, user);
      queryClient.invalidateQueries({
        queryKey: ["properties"] as const,
      });
    } catch (e) {
      console.error("Create property failed", e);
    } finally {
      setIsCreatingProperty(false);
    }
  };

  return (
    <div className="space-y-6">
      <PropertyFormDialog
        mode="create"
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddProperty}
        isLoading={isCreatingProperty}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Properties
          </h1>
          <p className="text-muted-foreground">
            Manage and organize all your rental properties
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by name, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-background text-foreground" : "text-muted-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => {
            const imageUrl =
              typeof property.images?.[0] === "string"
                ? property.images[0]
                : property.images?.[0]?.url || "/placeholder.svg";
            return (
              <Card
                key={index}
                className="border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full"
              >
                {/* Property Image */}
                <div className="relative h-96 bg-secondary overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {(property.tenants?.length ?? 0) !== 1 ? (
                      <span className="flex items-center justify-center gap-2">
                        {property?.tenants?.length || 0}{" "}
                        <Users className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {property?.tenants?.length || 0}{" "}
                        <User className="w-4 h-4" />
                      </span>
                    )}{" "}
                  </div>
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                    {property.propertyType}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.city}, {property.country}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Available Units
                      </span>
                      <span className="font-semibold text-foreground">
                        {Math.max(
                          0,
                          (property.units?.length ?? 0) -
                            (property.tenants?.length ?? 0),
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price per Unit
                      </span>
                      <span className="font-semibold text-foreground">
                        $
                        {property.price_per_unit
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Tenants
                      </span>
                      <span className="font-semibold text-foreground">
                        {property.tenants?.length ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-border text-foreground group bg-transparent"
                  >
                    <Link
                      href={`/dashboard/properties/${property.id || property._id}`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Available Units
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Price per Unit
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Tenants
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-border hover:bg-secondary transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {property.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {property.city}, {property.country}
                    </td>
                    <td className="px-6 py-4 text-foreground capitalize text-sm">
                      {property.type}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {Math.max(
                        0,
                        (property.units?.length ?? 0) -
                          (property.tenants?.length ?? 0),
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                        {property.occupancy ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      $
                      {property.price_per_unit
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                        {property.tenants?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/properties/${property.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border bg-transparent"
                        >
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <Card className="border border-border p-12 text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          {properties.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No properties yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Click "Add Property" to get started
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
