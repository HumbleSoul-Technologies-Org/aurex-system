'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  MessageSquare,
  BookOpen,
  Play,
  Mail,
  Phone,
  ChevronDown,
  Plus,
  ExternalLink,
} from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const faqs = [
    {
      question: 'How do I add a new property?',
      answer:
        'To add a new property, navigate to the Properties section and click the "Add Property" button. Fill in the property details including address, number of units, rent amount, and other relevant information.',
    },
    {
      question: 'How can I invite tenants to the portal?',
      answer:
        'Go to the Tenant Portal section, click "Send New Invitation", enter the tenant\'s email address, and they will receive an invitation to access the portal where they can pay rent and submit maintenance requests.',
    },
    {
      question: 'What payment methods do tenants have access to?',
      answer:
        'Tenants can pay rent through credit/debit cards, bank transfers, and digital wallets. All payments are processed securely through our payment gateway.',
    },
    {
      question: 'How do I generate financial reports?',
      answer:
        'Visit the Reports section, select your desired report type (Income, Expense, Tax Preparation, or Occupancy), choose the time period, and click "Generate Report" or "Export" to download.',
    },
    {
      question: 'Can I set up automatic rent reminders?',
      answer:
        'Yes, in Settings you can enable automatic rent reminders for tenants. You can customize the reminder dates and messages to send to your tenants.',
    },
    {
      question: 'How do I track maintenance requests?',
      answer:
        'All maintenance requests appear in the Maintenance section with a Kanban board view. You can track requests through stages: Requested, Assigned, In Progress, and Completed.',
    },
  ]

  const resources = [
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Browse our comprehensive documentation and guides',
      link: '#',
    },
    {
      icon: Play,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides for all features',
      link: '#',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Reach out to our support team via email',
      link: 'mailto:support@propmanager.app',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us at +1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Find answers and get support from our team</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-border bg-background text-foreground"
        />
      </div>

      {/* Support Resources */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Get Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <a key={resource.title} href={resource.link} target="_blank" rel="noreferrer">
                <Card className="border border-border p-4 md:p-6 hover:border-primary/50 cursor-pointer transition-all h-full">
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground text-sm md:text-base">{resource.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">{resource.description}</p>
                  <ExternalLink className="w-4 h-4 text-primary mt-4" />
                </Card>
              </a>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <Card
                key={idx}
                className="border border-border p-0 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary transition-colors"
                >
                  <h3 className="font-medium text-foreground text-left text-sm md:text-base">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-4 transition-transform ${
                      expandedFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-border">
                    <p className="text-muted-foreground text-sm md:text-base">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="border border-border p-6 text-center">
              <p className="text-muted-foreground">No results found. Try a different search.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Form */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Contact Our Team
        </h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Name</label>
              <Input placeholder="Your name" className="border-border bg-background text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                className="border-border bg-background text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Subject</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option>General Inquiry</option>
              <option>Technical Issue</option>
              <option>Feature Request</option>
              <option>Billing Question</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Message</label>
            <textarea
              placeholder="Tell us how we can help..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </form>
      </Card>

      {/* Quick Links */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Getting Started Guide', link: '#' },
            { label: 'Feature Documentation', link: '#' },
            { label: 'API Reference', link: '#' },
            { label: 'System Status', link: '#' },
            { label: 'Security Center', link: '#' },
            { label: 'Terms & Privacy', link: '#' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.link}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
