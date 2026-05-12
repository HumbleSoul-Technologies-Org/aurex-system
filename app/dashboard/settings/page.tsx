"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Users,
  Eye,
  Building,
  Settings as SettingsIcon,
  Shield,
  FileText,
} from "lucide-react";
import {
  getSystemSettings,
  initializeSystemSettings,
  updateSystemSettings,
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

          {/* Portal Tab */}
          <TabsContent value="portal" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Tenant Portal Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Portal URL
                  </label>
                  <Input
                    value={settings.tenantPortalSettings?.portalUrl || ""}
                    onChange={(e) =>
                      updateSettings({
                        tenantPortalSettings: {
                          ...settings.tenantPortalSettings,
                          portalUrl: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Invitation Expiration (Days)
                  </label>
                  <Input
                    type="number"
                    value={
                      settings.tenantPortalSettings?.invitationExpirationDays ||
                      30
                    }
                    onChange={(e) =>
                      updateSettings({
                        tenantPortalSettings: {
                          ...settings.tenantPortalSettings,
                          invitationExpirationDays: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Enabled Features
                  </h4>
                  {settings.tenantPortalSettings?.enabledFeatures &&
                    Object.entries(
                      settings.tenantPortalSettings.enabledFeatures,
                    ).map(([feature, enabled]: [string, boolean]) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                enabledFeatures: {
                                  ...settings.tenantPortalSettings
                                    ?.enabledFeatures,
                                  [feature]: checked,
                                },
                              },
                            })
                          }
                        />
                        <label className="text-sm font-medium text-foreground capitalize">
                          {feature.replace(/-/g, " ")}
                        </label>
                      </div>
                    ))}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.allowDocumentUploads ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            allowDocumentUploads: checked,
                          },
                        })
                      }
                    />
                    <label className="text-sm font-medium text-foreground">
                      Allow Document Uploads
                    </label>
                  </div>
                </div>
              </div>
            </div>

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
