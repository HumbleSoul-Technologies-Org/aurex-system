'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, MapPin, Home, DollarSign } from 'lucide-react'

interface AddPropertyFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: PropertyFormData) => void
}

interface PropertyFormData {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  units: number
  rentPerUnit: number
  propertyType: string
  description: string
}

export default function AddPropertyForm({ isOpen, onClose, onSubmit }: AddPropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    units: 1,
    rentPerUnit: 0,
    propertyType: 'apartment',
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'units' || name === 'rentPerUnit' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      units: 1,
      rentPerUnit: 0,
      propertyType: 'apartment',
      description: '',
    })
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

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="12345"
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

            {/* Units and Rent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Units</label>
                <Input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Rent Per Unit
                  </div>
                </label>
                <Input
                  type="number"
                  name="rentPerUnit"
                  value={formData.rentPerUnit}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="100"
                  required
                />
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
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
                Add Property
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
