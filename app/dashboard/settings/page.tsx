'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { User, Lock, Bell, CreditCard, Users, Eye } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    maintenanceAlerts: true,
    paymentReminders: true,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <Card className="border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="profile"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <Input defaultValue="John Property Manager" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input type="email" defaultValue="john@propmanager.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <Input type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <Input defaultValue="John's Property Management" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Profile Picture</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  JP
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  Upload Photo
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button variant="outline" className="border-border bg-transparent">
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                  <Input type="password" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Two-Factor Authentication</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline" className="border-border bg-transparent">
                Enable 2FA
              </Button>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Active Sessions</h3>
              <Card className="border border-border p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Chrome on macOS</p>
                    <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-destructive text-destructive bg-transparent">
                    Sign out
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Update Security
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'emailNotifications',
                    title: 'All Notifications',
                    description: 'Receive email for all property alerts',
                  },
                  {
                    key: 'weeklyReports',
                    title: 'Weekly Reports',
                    description: 'Receive weekly property performance reports',
                  },
                  {
                    key: 'maintenanceAlerts',
                    title: 'Maintenance Alerts',
                    description: 'Get notified about maintenance requests',
                  },
                  {
                    key: 'paymentReminders',
                    title: 'Payment Reminders',
                    description: 'Reminders for upcoming rent payments',
                  },
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch
                      checked={settings[notification.key as keyof typeof settings]}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          [notification.key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Quiet Hours</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch defaultChecked />
                  <div>
                    <p className="font-semibold text-foreground">Enable Quiet Hours</p>
                    <p className="text-sm text-muted-foreground">Don't send notifications during these hours</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">From</label>
                    <Input type="time" defaultValue="22:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">To</label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Subscription Plan</h3>
              <Card className="border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg text-foreground">Professional Plan</p>
                    <p className="text-sm text-muted-foreground">$29/month</p>
                  </div>
                  <Button variant="outline" className="border-border bg-transparent">
                    Manage
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Your next billing date is March 5, 2024
                </p>
              </Card>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
              <Card className="border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-border bg-transparent">
                    Update
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Billing History</h3>
              <Card className="border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3">Feb 5, 2024</td>
                      <td className="px-4 py-3">$29.00</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="border-border bg-transparent">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Team Members</h3>
                <Button size="sm">
                  Invite Member
                </Button>
              </div>
              <Card className="border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-semibold text-foreground">You</td>
                      <td className="px-4 py-3 text-muted-foreground">john@propmanager.com</td>
                      <td className="px-4 py-3 text-foreground">Owner</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
