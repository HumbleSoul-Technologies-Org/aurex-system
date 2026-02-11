'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Lock,
  Mail,
  User,
  LogOut,
  Save,
  Check,
} from 'lucide-react'
import { currentTenant } from '@/app/lib/tenant-data'

export default function TenantSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    maintenanceUpdates: true,
    announcementEmails: false,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Profile Information */}
      <Card className="border border-border p-4 md:p-6">
        <div className="flex items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl md:text-3xl">
              SA
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              {currentTenant.name}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3">
              Unit {currentTenant.unit}
            </p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Active Tenant
            </Badge>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="font-bold text-foreground">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={currentTenant.name}
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                disabled
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <input
                type="email"
                defaultValue={currentTenant.email}
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                disabled
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={currentTenant.phone}
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                disabled
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Lease Start
              </label>
              <input
                type="text"
                defaultValue={new Date(
                  currentTenant.leaseStart
                ).toLocaleDateString()}
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                disabled
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>

        <div className="space-y-4">
          {[
            {
              id: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive important updates via email',
            },
            {
              id: 'smsNotifications',
              label: 'SMS Notifications',
              description: 'Receive urgent updates via text message',
            },
            {
              id: 'paymentReminders',
              label: 'Payment Reminders',
              description: 'Get reminded when rent is due',
            },
            {
              id: 'maintenanceUpdates',
              label: 'Maintenance Updates',
              description: 'Updates on your maintenance requests',
            },
            {
              id: 'announcementEmails',
              label: 'Announcement Emails',
              description: 'Receive community announcements',
            },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-3 md:p-4 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={settings[item.id as keyof typeof settings]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [item.id]: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm md:text-base">
                  {item.label}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="pt-6 border-t border-border mt-6">
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-white gap-2 w-full sm:w-auto"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="border border-border p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h2>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start h-10 md:h-auto bg-transparent"
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>

          <Button
            variant="outline"
            className="w-full border-border text-foreground justify-start h-10 md:h-auto bg-transparent"
          >
            <User className="w-4 h-4 mr-2" />
            Two-Factor Authentication
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-red-900 dark:text-red-200 mb-4">
          Danger Zone
        </h2>

        <p className="text-sm md:text-base text-red-800 dark:text-red-300 mb-4">
          These actions are permanent and cannot be undone.
        </p>

        <Button
          variant="outline"
          className="w-full border-red-600 text-red-600 hover:bg-red-100 h-10 md:h-auto bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out All Sessions
        </Button>
      </Card>

      {/* Help */}
      <Card className="border border-border p-4 md:p-6 bg-secondary/50">
        <h3 className="font-bold text-foreground mb-3">Need Help?</h3>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          Can't find what you're looking for? Contact management for support.
        </p>
        <Button
          variant="outline"
          className="border-border text-foreground w-full sm:w-auto gap-2 bg-transparent"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </Button>
      </Card>
    </div>
  )
}
