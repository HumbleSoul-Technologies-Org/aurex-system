'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  MapPin,
} from 'lucide-react'
import { managementContacts, propertyInfo, currentTenant } from '@/app/lib/tenant-data'

export default function ContactManagementPage() {
  const [selectedContact, setSelectedContact] = useState(0)
  const [message, setMessage] = useState('')

  const contact = managementContacts[selectedContact]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Contact Management
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Reach out to your property management team
        </p>
      </div>

      {/* Property Info */}
      <Card className="border border-border p-4 md:p-6 bg-secondary/50">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-foreground">
                  {propertyInfo.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unit {currentTenant.unit} • {propertyInfo.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {propertyInfo.city}, {propertyInfo.state} {propertyInfo.zip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Selection */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Management Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {managementContacts.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setSelectedContact(index)}
              className={`p-4 md:p-6 rounded-lg border-2 transition-all text-left ${
                selectedContact === index
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                {c.name}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                {c.title}
              </p>

              <div className="space-y-2 text-xs md:text-sm">
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{c.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{c.hours}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Details & Message Form */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6">
          {contact.name}
        </h2>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
          {contact.phone && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Phone
              </h3>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-foreground hover:text-primary font-medium"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {contact.email && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Email
              </h3>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-foreground hover:text-primary font-medium"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Availability
            </h3>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <p className="text-foreground">{contact.hours}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Role
            </h3>
            <p className="text-foreground font-medium">{contact.title}</p>
          </div>
        </div>

        {/* Send Message */}
        <div className="space-y-4">
          <h3 className="font-bold text-foreground">Send a Message</h3>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Message
            </label>
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
              rows={5}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setMessage('')}
              className="border-border text-foreground flex-1"
            >
              Clear
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white flex-1 gap-2 h-10 md:h-auto"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="border border-border p-4 md:p-6 bg-secondary/50">
        <h3 className="font-bold text-foreground mb-4">Quick Links</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground justify-start gap-2 h-10 bg-transparent"
            asChild
          >
            <a href="/tenant/maintenance">
              <MessageSquare className="w-4 h-4" />
              Report Maintenance
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground justify-start gap-2 h-10 bg-transparent"
            asChild
          >
            <a href="/tenant/payments">
              <Phone className="w-4 h-4" />
              Payment Questions
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground justify-start gap-2 h-10 bg-transparent"
            asChild
          >
            <a href="/tenant">
              <Mail className="w-4 h-4" />
              Dashboard
            </a>
          </Button>
        </div>
      </Card>
    </div>
  )
}
