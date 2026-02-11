'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Bell, Users, Calendar } from 'lucide-react'

interface SendAnnouncementFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: AnnouncementFormData) => void
}

interface AnnouncementFormData {
  title: string
  message: string
  recipients: string
  priority: string
  scheduledDate?: string
}

export default function SendAnnouncementForm({ isOpen, onClose, onSubmit }: SendAnnouncementFormProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    recipients: 'all',
    priority: 'normal',
    scheduledDate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      title: '',
      message: '',
      recipients: 'all',
      priority: 'normal',
      scheduledDate: '',
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
              <h2 className="text-2xl font-bold text-foreground">Send Announcement</h2>
              <p className="text-sm text-muted-foreground">Communicate with tenants and managers</p>
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Announcement Title
                </div>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Scheduled Maintenance Update"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your announcement message..."
                className="h-32"
                required
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Recipients
                </div>
              </label>
              <select
                name="recipients"
                value={formData.recipients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="all">All Tenants</option>
                <option value="property">By Property</option>
                <option value="custom">Custom List</option>
                <option value="managers">Managers Only</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Schedule for Later (Optional)
                </div>
              </label>
              <Input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to send immediately</p>
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
                Send Announcement
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
