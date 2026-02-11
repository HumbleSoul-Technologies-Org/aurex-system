'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, User, Mail, Phone, Calendar } from 'lucide-react'

interface AddTenantFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: TenantFormData) => void
}

interface TenantFormData {
  name: string
  email: string
  phone: string
  property: string
  unitNumber: string
  leaseStartDate: string
  leaseEndDate: string
  monthlyRent: number
  emergencyContact: string
  notes: string
}

export default function AddTenantForm({ isOpen, onClose, onSubmit }: AddTenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    email: '',
    phone: '',
    property: '',
    unitNumber: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: 0,
    emergencyContact: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthlyRent' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({
      name: '',
      email: '',
      phone: '',
      property: '',
      unitNumber: '',
      leaseStartDate: '',
      leaseEndDate: '',
      monthlyRent: 0,
      emergencyContact: '',
      notes: '',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Add New Tenant</h2>
              <p className="text-sm text-muted-foreground">Register a new tenant to a property</p>
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

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Property and Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Property</label>
                <select
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Property</option>
                  <option value="sunset">Sunset Apartments</option>
                  <option value="downtown">Downtown Office</option>
                  <option value="beachside">Beachside Villa</option>
                  <option value="mountain">Mountain Lodge</option>
                  <option value="urban">Urban Lofts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Unit Number</label>
                <Input
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  placeholder="e.g., 301"
                  required
                />
              </div>
            </div>

            {/* Lease Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Lease End Date</label>
                <Input
                  type="date"
                  name="leaseEndDate"
                  value={formData.leaseEndDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Monthly Rent and Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Monthly Rent</label>
                <Input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Emergency Contact</label>
                <Input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Contact name or number"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
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
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
                Add Tenant
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
