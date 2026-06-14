"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  Lock,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  getSystemSettings,
  initializeSystemSettings,
  updateSystemSettings,
} from "@/lib/services/settings";
import {
  addAuditLog,
  AuditLogEntry,
  listAuditLogs,
} from "@/lib/services/audit";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [testEmailStatus, setTestEmailStatus] = useState<string>("");

  // General Settings
  const [organizationName, setOrganizationName] = useState("My Organization");
  const [adminEmail, setAdminEmail] = useState("admin@example.com");

  // Email Settings
  const [emailProvider, setEmailProvider] = useState<
    "smtp" | "sendgrid" | "mailgun"
  >("smtp");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  // Notification Settings
  const [enableEmailNotifications, setEnableEmailNotifications] =
    useState(true);
  const [enableInviteEmails, setEnableInviteEmails] = useState(true);
  const [enableWelcomeEmails, setEnableWelcomeEmails] = useState(true);
  const [enablePasswordResetEmails, setEnablePasswordResetEmails] =
    useState(true);

  useEffect(() => {
    async function loadSettingsAndAudit() {
      const settings = getSystemSettings() || initializeSystemSettings();
      setOrganizationName(settings.companyInfo?.name || "My Organization");
      setAdminEmail(settings.companyInfo?.email || "admin@example.com");

      const emailCfg = settings.emailSettings || {};
      setEmailProvider(emailCfg.provider || "smtp");
      setSmtpHost(emailCfg.host || "smtp.gmail.com");
      setSmtpPort(String(emailCfg.port || 587));
      setSmtpUser(emailCfg.user || "");
      setSmtpPassword(emailCfg.password || "");
      setEnableEmailNotifications(emailCfg.enableEmailNotifications ?? true);
      setEnableInviteEmails(emailCfg.enableInviteEmails ?? true);
      setEnableWelcomeEmails(emailCfg.enableWelcomeEmails ?? true);
      setEnablePasswordResetEmails(emailCfg.enablePasswordResetEmails ?? true);

      const auditEntries = await listAuditLogs();
      setAuditLogs(auditEntries || []);
    }

    loadSettingsAndAudit();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const currentSettings = getSystemSettings() || initializeSystemSettings();
      const updated = updateSystemSettings({
        companyInfo: {
          name: organizationName,
          email: adminEmail,
        },
        emailSettings: {
          provider: emailProvider,
          host: smtpHost,
          port: Number(smtpPort) || 587,
          user: smtpUser,
          password: smtpPassword,
          enableEmailNotifications,
          enableInviteEmails,
          enableWelcomeEmails,
          enablePasswordResetEmails,
        },
        systemFeatures: {
          ...currentSettings.systemFeatures,
          auditing: true,
        },
      });

      if (!updated) {
        throw new Error("Unable to persist settings.");
      }

      await addAuditLog({
        action: "Admin settings updated",
        actor: "admin",
        details: `Saved settings for ${organizationName}`,
      });
      const refreshedLogs = await listAuditLogs();
      setAuditLogs(refreshedLogs || []);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSaving(true);
    setTestEmailStatus("");
    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "paymentReminder",
          tenant: {
            name: organizationName,
            email: adminEmail,
          },
          data: {
            amount: 250,
            dueDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString(),
            currency: "USD",
          },
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        await addAuditLog({
          action: "Test email sent",
          actor: "admin",
          details: `Sent test payment reminder to ${adminEmail}`,
        });
        setTestEmailStatus("Email sent successfully.");
      } else {
        setTestEmailStatus(
          result.error ||
            "Failed to send test email. Check your configuration.",
        );
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setTestEmailStatus("Failed to send test email.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Admin Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex gap-2 text-green-700 items-center">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">Settings saved successfully</p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              General Settings
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Organization Name"
                />
              </div>

              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Email Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="provider">Email Provider</Label>
                <select
                  id="provider"
                  value={emailProvider}
                  onChange={(e) =>
                    setEmailProvider(
                      e.target.value as "smtp" | "sendgrid" | "mailgun",
                    )
                  }
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>

              {emailProvider === "smtp" && (
                <>
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpUser">Username</Label>
                    <Input
                      id="smtpUser"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-700 font-medium">💡 Tip</p>
                <p className="text-xs text-blue-600 mt-1">
                  For Gmail, you may need to use an App Password instead of your
                  regular password.
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving}
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleSendTestEmail}
                    variant="outline"
                    disabled={saving || !adminEmail}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Test Email
                  </Button>
                </div>
                {testEmailStatus && (
                  <p className="text-sm text-muted-foreground">
                    {testEmailStatus}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotif" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable all email notifications
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={enableEmailNotifications}
                  onCheckedChange={setEnableEmailNotifications}
                />
              </div>

              {enableEmailNotifications && (
                <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inviteEmails" className="text-sm">
                      Invite Emails
                    </Label>
                    <Switch
                      id="inviteEmails"
                      checked={enableInviteEmails}
                      onCheckedChange={setEnableInviteEmails}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="welcomeEmails" className="text-sm">
                      Welcome Emails
                    </Label>
                    <Switch
                      id="welcomeEmails"
                      checked={enableWelcomeEmails}
                      onCheckedChange={setEnableWelcomeEmails}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="resetEmails" className="text-sm">
                      Password Reset Emails
                    </Label>
                    <Switch
                      id="resetEmails"
                      checked={enablePasswordResetEmails}
                      onCheckedChange={setEnablePasswordResetEmails}
                    />
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Security Settings
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">
                  Account Lockout
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Max 5 failed login attempts</li>
                  <li>• Account locked for 2 minutes</li>
                  <li>• JWT token expiry: 7 days</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-900 mb-2">
                  Password Policy
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Minimum 8 characters</li>
                  <li>• Uppercase letters required</li>
                  <li>• Lowercase letters required</li>
                  <li>• Numbers required</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Security policies are managed from the backend configuration.
                  Contact support to modify these settings.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Audit Logs
                </h2>
                <p className="text-sm text-muted-foreground">
                  Recent admin activity and system events.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const refreshedLogs = await listAuditLogs();
                  setAuditLogs(refreshedLogs || []);
                }}
              >
                Refresh Logs
              </Button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-muted-foreground">
                No audit entries found yet. Actions such as saving settings or
                creating invites will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-slate-200 rounded-md p-4 bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {entry.action}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {entry.details}
                    </p>
                    {entry.actor && (
                      <p className="mt-2 text-xs text-slate-500">
                        Actor: {entry.actor}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
