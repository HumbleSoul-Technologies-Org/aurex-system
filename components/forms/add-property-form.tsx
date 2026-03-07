'use client'

import React, { useState, useRef, useEffect } from "react"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, MapPin, Home, DollarSign, Loader2 } from 'lucide-react'

interface AddPropertyFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: PropertyFormData, file?: File | null) => void
  isLoading?: boolean
}

interface PropertyFormData {
  name: string
  address: string
  city: string
  country: string
  units: number
  pricePerUnit: number
  propertyType: string
  geography: string
  location: {
    lat: number | ''
    lng: number | ''
  }
  features: string[]
  imageUrl?: string
  description: string
}

export default function AddPropertyForm({ isOpen, onClose, onSubmit, isLoading = false }: AddPropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    city: '',
    country: '',
    units: 1,
    pricePerUnit: 0,
    propertyType: 'apartment',
    geography: '',
    location: { lat: '', lng: '' },
    features: [],
    imageUrl: '',
    description: '',
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedImage)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [selectedImage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // nested fields like location.lat
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: child === 'lat' || child === 'lng' ? (value === '' ? '' : Number(value)) : value,
        },
      }))
      return
    }

    if (name === 'units' || name === 'pricePerUnit') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
      return
    }

    if (name === 'features') {
      const arr = value.split(',').map((s) => s.trim()).filter(Boolean)
      setFormData((prev) => ({ ...prev, features: arr }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedImage(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData, selectedImage)
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      units: 1,
      pricePerUnit: 0,
      propertyType: 'apartment',
      geography: '',
      location: { lat: '', lng: '' },
      features: [],
      imageUrl: '',
      description: '',
    })
    setSelectedImage(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Add New Property</h2>
              <p className="text-sm text-muted-foreground">Create a new rental property</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Property Name */}
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

            {/* Address */}
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

            {/* City, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="apartment">Apartment Building</option>
                <option value="single-family">Single Family Home</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
                <option value="other">Other</option>
              </select>
            </div>

           

            {/* Units and Price per Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Units</label>
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

            {/* Geography */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Geography</label>
              <Input
                name="geography"
                value={formData.geography}
                onChange={handleChange}
                placeholder="e.g., urban, suburban, rural"
              />
            </div>

            {/* Location (lat, lng) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
                <Input
                  type="text"
                  name="location.lat"
                  value={formData.location.lat as any}
                  onChange={handleChange}
                  placeholder="e.g., 37.7749"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
                <Input
                  type="text"
                  name="location.lng"
                  value={formData.location.lng as any}
                  onChange={handleChange}
                  placeholder="e.g., -122.4194"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Features (comma separated)</label>
              <Textarea
                name="features"
                value={formData.features.join(', ')}
                onChange={handleChange}
                placeholder="Pool, Elevator, Parking"
                className="h-20"
              />
            </div>
            {/* Image URL or Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
              <Input
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />

              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Or upload from your computer</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button type="button" variant="outline" onClick={triggerFileSelect} className="px-3">
                    Upload Image
                  </Button>
                  <span className="text-sm text-foreground">{selectedImage ? selectedImage.name : 'No file selected'}</span>
                  {selectedImage && (
                    <Button type="button" variant="ghost" onClick={() => setSelectedImage(null)} className="text-sm">
                      Remove
                    </Button>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-2">Preview</p>
                    <img src={previewUrl} alt="Selected preview" className="max-h-40 w-auto rounded border" />
                  </div>
                )}
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about the property..."
                className="h-24"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Property'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
