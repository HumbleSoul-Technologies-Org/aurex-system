"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  Bell,
  CreditCard,
  Users,
  Eye,
  Building,
  Settings as SettingsIcon,
  Shield,
  FileText,
  ChevronDown,
  DollarSign,
  Wrench,
  ToggleLeft,
  MessageSquare,
  Lock as LockIcon,
} from "lucide-react";
import {
  getSystemSettings,
  initializeSystemSettings,
  updateSystemSettings,
  getTenantPortalSettings,
  updateTenantPortalSettings,
} from "@/lib/services/settings";
import { SystemSettings } from "@/lib/local-store";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const systemSettings =
          getSystemSettings() ?? initializeSystemSettings();
        setSettings(systemSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = updateSystemSettings(settings);
      if (updated) {
        setSettings(updated);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("system-settings-changed"));
        }
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: any) => {
    setSettings((prev: SystemSettings | null) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted-foreground">
          Failed to load settings
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <Card className="border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="company"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Building className="w-4 h-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger
              value="properties"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="tenants"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Shield className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="portal"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Portal
            </TabsTrigger>
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <Input
                    value={settings.companyInfo?.name || ""}
                    onChange={(e) =>
                      updateSettings({
                        companyInfo: {
                          ...settings.companyInfo,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <Input
                    value={settings.companyInfo?.address || ""}
                    onChange={(e) =>
                      updateSettings({
                        companyInfo: {
                          ...settings.companyInfo,
                          address: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input
                      value={settings.companyInfo?.phone || ""}
                      onChange={(e) =>
                        updateSettings({
                          companyInfo: {
                            ...settings.companyInfo,
                            phone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={settings.companyInfo?.email || ""}
                      onChange={(e) =>
                        updateSettings({
                          companyInfo: {
                            ...settings.companyInfo,
                            email: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    License Number
                  </label>
                  <Input
                    value={settings.companyInfo?.licenseNumber || ""}
                    onChange={(e) =>
                      updateSettings({
                        companyInfo: {
                          ...settings.companyInfo,
                          licenseNumber: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Company Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Property Type Defaults
              </h3>
              {Object.entries(settings.propertyTypeDefaults).map(
                ([type, config]: [string, any]) => (
                  <Card key={type} className="border border-border p-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-3 capitalize">
                      {type} Properties
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Default Lease Duration
                        </label>
                        <Input
                          value={config.defaultLeaseTerms?.duration || ""}
                          onChange={(e) =>
                            updateSettings({
                              propertyTypeDefaults: {
                                ...settings.propertyTypeDefaults,
                                [type]: {
                                  ...config,
                                  defaultLeaseTerms: {
                                    ...config.defaultLeaseTerms,
                                    duration: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Security Deposit
                          </label>
                          <Input
                            value={config.financialRules?.securityDeposit || ""}
                            onChange={(e) =>
                              updateSettings({
                                propertyTypeDefaults: {
                                  ...settings.propertyTypeDefaults,
                                  [type]: {
                                    ...config,
                                    financialRules: {
                                      ...config.financialRules,
                                      securityDeposit: e.target.value,
                                    },
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Late Fee
                          </label>
                          <Input
                            value={config.financialRules?.lateFee || ""}
                            onChange={(e) =>
                              updateSettings({
                                propertyTypeDefaults: {
                                  ...settings.propertyTypeDefaults,
                                  [type]: {
                                    ...config,
                                    financialRules: {
                                      ...config.financialRules,
                                      lateFee: e.target.value,
                                    },
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Property Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Tenant Type Configurations
              </h3>
              {Object.entries(settings.tenantTypeConfigurations).map(
                ([type, config]: [string, any]) => (
                  <Card key={type} className="border border-border p-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-3 capitalize">
                      {type} Tenants
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Application Fee
                        </label>
                        <Input
                          type="number"
                          value={config.defaultSettings?.applicationFee || 0}
                          onChange={(e) =>
                            updateSettings({
                              tenantTypeConfigurations: {
                                ...settings.tenantTypeConfigurations,
                                [type]: {
                                  ...config,
                                  defaultSettings: {
                                    ...config.defaultSettings,
                                    applicationFee: Number(e.target.value),
                                  },
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Preferred Contact Method
                        </label>
                        <select
                          value={
                            config.defaultSettings?.preferredContactMethod ||
                            "email"
                          }
                          onChange={(e) =>
                            updateSettings({
                              tenantTypeConfigurations: {
                                ...settings.tenantTypeConfigurations,
                                [type]: {
                                  ...config,
                                  defaultSettings: {
                                    ...config.defaultSettings,
                                    preferredContactMethod: e.target.value as
                                      | "email"
                                      | "phone"
                                      | "sms",
                                  },
                                },
                              },
                            })
                          }
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Tenant Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Compliance Settings
              </h3>
              <Card className="border border-border p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Default Requirements
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reporting Frequency
                    </label>
                    <select
                      value={
                        settings.complianceSettings?.default
                          ?.reportingRequirements?.frequency || "monthly"
                      }
                      onChange={(e) =>
                        updateSettings({
                          complianceSettings: {
                            default: {
                              ...settings.complianceSettings?.default,
                              reportingRequirements: {
                                ...settings.complianceSettings?.default
                                  ?.reportingRequirements,
                                frequency: e.target.value,
                              },
                            },
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.complianceSettings?.default
                            ?.reportingRequirements?.includeFinancials || false
                        }
                        onCheckedChange={(checked) =>
                          updateSettings({
                            complianceSettings: {
                              default: {
                                ...settings.complianceSettings?.default,
                                reportingRequirements: {
                                  ...settings.complianceSettings?.default
                                    ?.reportingRequirements,
                                  includeFinancials: checked,
                                },
                              },
                            },
                          })
                        }
                      />
                      <label className="text-sm font-medium text-foreground">
                        Include Financials in Reports
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.complianceSettings?.default
                            ?.reportingRequirements?.includeOccupancy || false
                        }
                        onCheckedChange={(checked) =>
                          updateSettings({
                            complianceSettings: {
                              default: {
                                ...settings.complianceSettings?.default,
                                reportingRequirements: {
                                  ...settings.complianceSettings?.default
                                    ?.reportingRequirements,
                                  includeOccupancy: checked,
                                },
                              },
                            },
                          })
                        }
                      />
                      <label className="text-sm font-medium text-foreground">
                        Include Occupancy in Reports
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Compliance Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Notification Templates
              </h3>
              {settings.notifications?.templates &&
                Object.entries(settings.notifications.templates).map(
                  ([key, template]: [string, any]) => (
                    <Card key={key} className="border border-border p-4 mb-4">
                      <h4 className="font-semibold text-foreground mb-3 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Subject
                          </label>
                          <Input
                            value={template.subject}
                            onChange={(e) =>
                              updateSettings({
                                notifications: {
                                  ...settings.notifications,
                                  templates: {
                                    ...settings.notifications?.templates,
                                    [key]: {
                                      ...template,
                                      subject: e.target.value,
                                    },
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Body
                          </label>
                          <textarea
                            value={template.body}
                            onChange={(e) =>
                              updateSettings({
                                notifications: {
                                  ...settings.notifications,
                                  templates: {
                                    ...settings.notifications?.templates,
                                    [key]: {
                                      ...template,
                                      body: e.target.value,
                                    },
                                  },
                                },
                              })
                            }
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ),
                )}
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Portal Tab with Collapsible Sections */}
          <TabsContent value="portal" className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Tenant Portal Settings
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Configure portal features, security, and notification
                preferences for tenants
              </p>
            </div>

            {/* Notification Preferences Collapsible */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-blue-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Notification Preferences</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Email Notifications
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.notificationPreferences
                          ?.email ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            notificationPreferences: {
                              ...settings.tenantPortalSettings
                                ?.notificationPreferences,
                              email: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      SMS Notifications
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.notificationPreferences
                          ?.sms ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            notificationPreferences: {
                              ...settings.tenantPortalSettings
                                ?.notificationPreferences,
                              sms: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      In-App Notifications
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.notificationPreferences
                          ?.inApp ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            notificationPreferences: {
                              ...settings.tenantPortalSettings
                                ?.notificationPreferences,
                              inApp: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Payment Settings Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-green-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4" />
                    <span>Payment Settings</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Enable Autopay
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.paymentSettings
                          ?.enableAutopay ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            paymentSettings: {
                              ...settings.tenantPortalSettings?.paymentSettings,
                              enableAutopay: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  {settings.tenantPortalSettings?.paymentSettings
                    ?.enableAutopay && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Autopay Threshold ($)
                      </label>
                      <Input
                        type="number"
                        value={
                          settings.tenantPortalSettings?.paymentSettings
                            ?.autopayThreshold || 0
                        }
                        onChange={(e) =>
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              paymentSettings: {
                                ...settings.tenantPortalSettings
                                  ?.paymentSettings,
                                autopayThreshold: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Accepted Payment Methods
                    </label>
                    {settings.tenantPortalSettings?.paymentSettings?.acceptedMethods?.map(
                      (method, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <span className="text-sm capitalize">
                            {method.type}
                          </span>
                          <Switch
                            checked={method.enabled}
                            onCheckedChange={(checked) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  paymentSettings: {
                                    ...settings.tenantPortalSettings
                                      ?.paymentSettings,
                                    acceptedMethods: [
                                      ...(
                                        settings.tenantPortalSettings
                                          ?.paymentSettings?.acceptedMethods ??
                                        []
                                      ).slice(0, idx),
                                      { ...method, enabled: checked },
                                      ...(
                                        settings.tenantPortalSettings
                                          ?.paymentSettings?.acceptedMethods ??
                                        []
                                      ).slice(idx + 1),
                                    ],
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Document Access Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-purple-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span>Document Access</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Allow Document Uploads
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.documentAccess
                          ?.allowUploads ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            documentAccess: {
                              ...settings.tenantPortalSettings?.documentAccess,
                              allowUploads: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Require Approval
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.documentAccess
                          ?.requireApproval ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            documentAccess: {
                              ...settings.tenantPortalSettings?.documentAccess,
                              requireApproval: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Retention Days
                    </label>
                    <Input
                      type="number"
                      value={
                        settings.tenantPortalSettings?.documentAccess
                          ?.retentionDays || 365
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            documentAccess: {
                              ...settings.tenantPortalSettings?.documentAccess,
                              retentionDays: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Maintenance Preferences Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-orange-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4" />
                    <span>Maintenance Preferences</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Enable Maintenance Requests
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.maintenancePreferences
                          ?.enableRequests ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            maintenancePreferences: {
                              ...settings.tenantPortalSettings
                                ?.maintenancePreferences,
                              enableRequests: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Allow Emergency After Hours
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.maintenancePreferences
                          ?.allowEmergencyAfterHours ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            maintenancePreferences: {
                              ...settings.tenantPortalSettings
                                ?.maintenancePreferences,
                              allowEmergencyAfterHours: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estimated Response Time (hours)
                    </label>
                    <Input
                      type="number"
                      value={
                        settings.tenantPortalSettings?.maintenancePreferences
                          ?.estimatedResponseTime || 48
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            maintenancePreferences: {
                              ...settings.tenantPortalSettings
                                ?.maintenancePreferences,
                              estimatedResponseTime: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Feature Toggles Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-yellow-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-4 h-4" />
                    <span>Feature Toggles</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  {Object.entries(
                    settings.tenantPortalSettings?.featureToggles || {},
                  ).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No tenant portal feature toggles are configured.
                    </div>
                  ) : (
                    Object.entries(
                      settings.tenantPortalSettings?.featureToggles || {},
                    ).map(([feature, enabled]) => (
                      <div
                        key={feature}
                        className="flex items-center justify-between"
                      >
                        <label className="text-sm font-medium text-foreground capitalize">
                          {feature.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <Switch
                          checked={enabled as boolean}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                featureToggles: {
                                  ...settings.tenantPortalSettings
                                    ?.featureToggles,
                                  [feature]: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Communication Preferences Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-cyan-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    <span>Communication Preferences</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      value={
                        settings.tenantPortalSettings?.communicationPreferences
                          ?.preferredContactMethod || "email"
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            communicationPreferences: {
                              ...settings.tenantPortalSettings
                                ?.communicationPreferences,
                              preferredContactMethod: e.target.value as any,
                            },
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in-app">In-App</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Timezone
                    </label>
                    <Input
                      value={
                        settings.tenantPortalSettings?.communicationPreferences
                          ?.timezone || "UTC"
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            communicationPreferences: {
                              ...settings.tenantPortalSettings
                                ?.communicationPreferences,
                              timezone: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Security Settings Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-red-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <LockIcon className="w-4 h-4" />
                    <span>Security Settings</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Allow Password Change
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.securitySettings
                          ?.allowPasswordChange ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            securitySettings: {
                              ...settings.tenantPortalSettings
                                ?.securitySettings,
                              allowPasswordChange: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Auto-Logout Inactivity (minutes)
                    </label>
                    <Input
                      type="number"
                      value={
                        settings.tenantPortalSettings?.securitySettings
                          ?.autoLogoutInactivityMinutes || 30
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            securitySettings: {
                              ...settings.tenantPortalSettings
                                ?.securitySettings,
                              autoLogoutInactivityMinutes: Number(
                                e.target.value,
                              ),
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Allow Account Deletion
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.securitySettings
                          ?.allowAccountDeletion ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            securitySettings: {
                              ...settings.tenantPortalSettings
                                ?.securitySettings,
                              allowAccountDeletion: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Expiration (days)
                    </label>
                    <Input
                      type="number"
                      value={
                        settings.tenantPortalSettings?.securitySettings
                          ?.passwordExpirationDays || 90
                      }
                      onChange={(e) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            securitySettings: {
                              ...settings.tenantPortalSettings
                                ?.securitySettings,
                              passwordExpirationDays: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t border-border pt-6 flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : "Save Portal Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
