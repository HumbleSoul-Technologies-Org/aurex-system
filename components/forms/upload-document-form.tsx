'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, FileText, Calendar } from 'lucide-react'

interface UploadDocumentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: DocumentFormData) => void
}

interface DocumentFormData {
  name: string
  type: string
  property: string
  expiryDate: string
  file?: string
}

export default function UploadDocumentForm({ isOpen, onClose, onSubmit }: UploadDocumentFormProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    type: 'lease',
    property: '',
    expiryDate: '',
    file: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({
      name: '',
      type: 'lease',
      property: '',
      expiryDate: '',
      file: '',
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
              <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
              <p className="text-sm text-muted-foreground">Add a new document to your collection</p>
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
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Document Name
                </div>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Lease Agreement 2024"
                required
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="lease">Lease Agreement</option>
                <option value="inspection">Inspection Report</option>
                <option value="insurance">Insurance Policy</option>
                <option value="tax">Tax Document</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Property */}
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

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Expiry Date (Optional)
                </div>
              </label>
              <Input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Select File
                </div>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG up to 50MB</p>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
              </div>
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
                Upload Document
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
