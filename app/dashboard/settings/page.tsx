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
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getSystemSettings,
  initializeSystemSettings,
  updateSystemSettings,
  getTenantPortalSettings,
  updateTenantPortalSettings,
  fetchSettingsFromApi,
  fetchSettingsByIdFromApi,
  createSettingsOnApi,
  updateSettingsOnApi,
  convertToFlatSettings,
  convertToNestedSettings,
  createFieldUpdateHandler,
  FieldStatus,
  debounce,
} from "@/lib/services/settings";
import { SystemSettings, clearDB } from "@/lib/local-store";
import { currencies } from "@/lib/data/currencies";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

function PasswordChangeForm({ settings, updateSettings }: any) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleChange = () => {
    if (!newPw || newPw !== confirm) {
      alert("New password and confirmation must match");
      return;
    }
    // Note: real deployments should send this to the server. We store locally for development convenience.
    updateSettings({ adminAuth: { password: newPw } });
    setCurrent("");
    setNewPw("");
    setConfirm("");
    alert("Admin password updated (local only)");
  };

  return (
    <div className="space-y-3">
      <Input
        type="password"
        placeholder="Current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Input
        type="password"
        placeholder="New password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={handleChange} className="bg-primary text-white">
          Change Password
        </Button>
      </div>
    </div>
  );
}

function AccountDeletionCard() {
  const [password, setPassword] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) return;
    const id = setInterval(
      () => setCountdown((c) => (c !== null ? c - 1 : null)),
      1000,
    );
    return () => clearInterval(id);
  }, [countdown]);

  const startDeletion = () => {
    if (!password) {
      alert("Enter admin password to confirm");
      return;
    }
    setCountdown(10);
    setInProgress(true);
  };

  const confirmDelete = () => {
    // perform local clear (dangerous) - this clears localStorage DB
    clearDB();
    alert("Local data cleared. Reloading...");
    window.location.href = "/";
  };

  return (
    <div className="space-y-3">
      <Input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {!inProgress && (
        <Button className="bg-red-600 text-white" onClick={startDeletion}>
          Delete All Local Data
        </Button>
      )}
      {inProgress && (
        <div>
          <p className="text-sm text-muted-foreground">
            Confirm deletion in: {countdown}s
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              onClick={() => {
                setInProgress(false);
                setCountdown(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={(countdown ?? 0) > 0}
            >
              Confirm Delete Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * UI component to show field save status
 * Displays spinner while saving, checkmark after success, error icon on failure
 */
function FieldSaveIndicator({ status }: { status: FieldStatus }) {
  if (status === "saving") {
    return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
  }
  if (status === "saved") {
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  }
  if (status === "error") {
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  }
  return null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Per-field status tracking: { 'companyInfo_name': 'saving', ... }
  const [fieldStatus, setFieldStatus] = useState<Record<string, FieldStatus>>(
    {},
  );

  // Per-field error tracking
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper to mark field as saving/saved/error
  const markFieldStatus = (flatKey: string, status: FieldStatus) => {
    setFieldStatus((prev) => ({ ...prev, [flatKey]: status }));
  };

  const markFieldError = (flatKey: string, error: string) => {
    setFieldErrors((prev) => ({ ...prev, [flatKey]: error }));
    markFieldStatus(flatKey, "error");
  };

  const clearFieldError = (flatKey: string) => {
    setFieldErrors((prev) => ({ ...prev, [flatKey]: "" }));
  };

  // Factory to create debounced field update handlers
  const createIndependentFieldHandler = (
    flatKey: string,
    setter: (value: any) => void,
  ) => {
    const debouncedUpdate = debounce(
      async (value: any) => {
        clearFieldError(flatKey);
        markFieldStatus(flatKey, "saving");

        try {
          // Auto-create settings on first change
          if (!settingsId) {
            const created = await createSettingsOnApi({ [flatKey]: value });
            if (created?._id) {
              setSettingsId(created._id);
            }
          } else {
            // Update existing settings
            const updated = await updateSettingsOnApi(settingsId, {
              [flatKey]: value,
            });
            if (!updated) {
              throw new Error("Failed to save to server");
            }
          }

          // Update local state
          setter(value);
          markFieldStatus(flatKey, "saved");

          // Clear "saved" indicator after 2 seconds
          setTimeout(() => markFieldStatus(flatKey, "idle"), 2000);
        } catch (error) {
          console.error(`Error updating field ${flatKey}:`, error);
          markFieldError(
            flatKey,
            error instanceof Error ? error.message : "Save failed",
          );
        }
      },
      500, // 500ms debounce
    );

    return async (value: any) => {
      await debouncedUpdate(value);
    };
  };

  // Wrapper for onChange handlers
  const handleFieldChange =
    (flatKey: string, setter: (value: any) => void) => (e: any) => {
      const value = e.target?.value ?? e.target?.checked ?? e;
      setter(value);
      createIndependentFieldHandler(flatKey, setter)(value);
    };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from API first
        const apiSettings = await fetchSettingsFromApi();

        if (apiSettings) {
          // Successfully loaded from API
          setSettingsId(apiSettings._id || null);
          const nestedSettings = convertToNestedSettings(apiSettings);
          const localSettings =
            getSystemSettings() ?? initializeSystemSettings();
          // Merge API settings with local defaults
          const merged = {
            ...localSettings,
            tenantPortalSettings: nestedSettings,
          };
          setSettings(merged);
        } else {
          // Fallback to localStorage
          const localSettings =
            getSystemSettings() ?? initializeSystemSettings();
          setSettings(localSettings);
          setApiError("Using local storage - API unavailable");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Fallback to localStorage on any error
        const localSettings = getSystemSettings() ?? initializeSystemSettings();
        setSettings(localSettings);
        setApiError("Error loading from API, using local storage");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
          <div className="text-right">
            {apiError ? (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                ⚠️ {apiError}
              </div>
            ) : settingsId ? (
              <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded border border-green-200">
                ✓ API Connected
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="profile"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Building className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="portal"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Portal
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              Finance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Shield className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Personal Profile
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your personal account information used for administrative
                actions.
              </p>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={(settings as any).adminProfile?.name || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            adminProfile: {
                              ...((settings as any).adminProfile || {}),
                              name: value,
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_adminName",
                            (v) =>
                              updateSettings({
                                adminProfile: {
                                  ...((settings as any).adminProfile || {}),
                                  name: v,
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_adminName"] || "idle"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={(settings as any).adminProfile?.phone || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            adminProfile: {
                              ...((settings as any).adminProfile || {}),
                              phone: value,
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_adminPhone",
                            (v) =>
                              updateSettings({
                                adminProfile: {
                                  ...((settings as any).adminProfile || {}),
                                  phone: v,
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_adminPhone"] || "idle"}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={(settings as any).adminProfile?.email || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSettings({
                          adminProfile: {
                            ...((settings as any).adminProfile || {}),
                            email: value,
                          },
                        });
                        createIndependentFieldHandler(
                          "companyInfo_adminEmail",
                          (v) =>
                            updateSettings({
                              adminProfile: {
                                ...((settings as any).adminProfile || {}),
                                email: v,
                              },
                            }),
                        )(value);
                      }}
                    />
                    <FieldSaveIndicator
                      status={fieldStatus["companyInfo_adminEmail"] || "idle"}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-4">
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.companyInfo?.name || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSettings({
                          companyInfo: {
                            ...settings.companyInfo,
                            name: value,
                          },
                        });
                        createIndependentFieldHandler("companyInfo_name", (v) =>
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              name: v,
                            },
                          }),
                        )(value);
                      }}
                    />
                    <FieldSaveIndicator
                      status={fieldStatus["companyInfo_name"] || "idle"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Street / Address"
                        value={settings.companyInfo?.address?.address || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              address: {
                                ...(settings.companyInfo?.address || {}),
                                address: value,
                              },
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_address",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  address: {
                                    ...(settings.companyInfo?.address || {}),
                                    address: v,
                                  },
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_address"] || "idle"}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Estate / Area"
                        value={settings.companyInfo?.address?.estate || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              address: {
                                ...(settings.companyInfo?.address || {}),
                                estate: value,
                              },
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_estate",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  address: {
                                    ...(settings.companyInfo?.address || {}),
                                    estate: v,
                                  },
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_estate"] || "idle"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="City"
                        value={settings.companyInfo?.address?.city || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              address: {
                                ...(settings.companyInfo?.address || {}),
                                city: value,
                              },
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_city",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  address: {
                                    ...(settings.companyInfo?.address || {}),
                                    city: v,
                                  },
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_city"] || "idle"}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Country"
                        value={settings.companyInfo?.address?.country || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              address: {
                                ...(settings.companyInfo?.address || {}),
                                country: value,
                              },
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_country",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  address: {
                                    ...(settings.companyInfo?.address || {}),
                                    country: v,
                                  },
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_country"] || "idle"}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={settings.companyInfo?.phone || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              phone: value,
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_phone",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  phone: v,
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_phone"] || "idle"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={settings.companyInfo?.email || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSettings({
                            companyInfo: {
                              ...settings.companyInfo,
                              email: value,
                            },
                          });
                          createIndependentFieldHandler(
                            "companyInfo_email",
                            (v) =>
                              updateSettings({
                                companyInfo: {
                                  ...settings.companyInfo,
                                  email: v,
                                },
                              }),
                          )(value);
                        }}
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_email"] || "idle"}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Logo URL
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="https://.../logo.png"
                      value={settings.companyInfo?.logo?.url || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSettings({
                          companyInfo: {
                            ...settings.companyInfo,
                            logo: {
                              ...(settings.companyInfo?.logo || {}),
                              url: value,
                            },
                          },
                        });
                        createIndependentFieldHandler(
                          "companyInfo_logoUrl",
                          (v) =>
                            updateSettings({
                              companyInfo: {
                                ...settings.companyInfo,
                                logo: {
                                  ...(settings.companyInfo?.logo || {}),
                                  url: v,
                                },
                              },
                            }),
                        )(value);
                      }}
                    />
                    <FieldSaveIndicator
                      status={fieldStatus["companyInfo_logoUrl"] || "idle"}
                    />
                  </div>
                  {settings.companyInfo?.logo?.url && (
                    <div className="mt-3">
                      <img
                        src={settings.companyInfo.logo.url}
                        alt="Company logo preview"
                        className="h-16 w-16 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    License Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.companyInfo?.licenseNumber || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSettings({
                          companyInfo: {
                            ...settings.companyInfo,
                            licenseNumber: value,
                          },
                        });
                        createIndependentFieldHandler(
                          "companyInfo_licenseNumber",
                          (v) =>
                            updateSettings({
                              companyInfo: {
                                ...settings.companyInfo,
                                licenseNumber: v,
                              },
                            }),
                        )(value);
                      }}
                    />
                    <FieldSaveIndicator
                      status={
                        fieldStatus["companyInfo_licenseNumber"] || "idle"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Finance Tab (placeholder) */}
          <TabsContent value="finance" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Finance Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Currency and payment method configuration.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Default Currency
                </label>
                <div className="w-64">
                  <Command>
                    <CommandInput placeholder="Search currency or country..." />
                    <CommandList>
                      {currencies.length === 0 && (
                        <CommandEmpty>No currencies</CommandEmpty>
                      )}
                      {currencies.map((c) => (
                        <CommandItem
                          key={`${c.country}-${c.code}`}
                          onSelect={() => {
                            const value = c.code;
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                financeSettings: {
                                  ...settings.tenantPortalSettings
                                    ?.financeSettings,
                                  currency: value,
                                },
                              },
                            });
                            // persist independently
                            createIndependentFieldHandler(
                              "financeSettings_currency",
                              (v) =>
                                updateSettings({
                                  tenantPortalSettings: {
                                    ...settings.tenantPortalSettings,
                                    financeSettings: {
                                      ...settings.tenantPortalSettings
                                        ?.financeSettings,
                                      currency: v,
                                    },
                                  },
                                }),
                            )(value);
                          }}
                        >
                          <div className="flex justify-between w-full">
                            <div>
                              <div className="font-medium">
                                {c.code} — {c.currency}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {c.country}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <div>
                      Selected:{" "}
                      {settings.tenantPortalSettings?.financeSettings
                        ?.currency || "USD"}
                    </div>
                    <FieldSaveIndicator
                      status={fieldStatus["financeSettings_currency"] || "idle"}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Methods
                </label>
                <div className="space-y-2">
                  {(
                    settings.tenantPortalSettings?.financeSettings
                      ?.paymentMethods || ([] as any[])
                  ).map((method: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-muted p-2 rounded"
                    >
                      <div className="text-sm capitalize">{method.type}</div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={method.enabled}
                          disabled={
                            !(
                              settings.tenantPortalSettings?.featureToggles
                                ?.paymentPortal ?? true
                            )
                          }
                          onCheckedChange={(checked) => {
                            const updatedMethods = [
                              ...(
                                settings.tenantPortalSettings?.financeSettings
                                  ?.paymentMethods || []
                              ).slice(0, idx),
                              { ...method, enabled: checked },
                              ...(
                                settings.tenantPortalSettings?.financeSettings
                                  ?.paymentMethods || []
                              ).slice(idx + 1),
                            ];

                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                financeSettings: {
                                  ...settings.tenantPortalSettings
                                    ?.financeSettings,
                                  paymentMethods: updatedMethods,
                                },
                              },
                            });

                            createIndependentFieldHandler(
                              "financeSettings_paymentMethods",
                              (v) =>
                                updateSettings({
                                  tenantPortalSettings: {
                                    ...settings.tenantPortalSettings,
                                    financeSettings: {
                                      ...settings.tenantPortalSettings
                                        ?.financeSettings,
                                      paymentMethods: v,
                                    },
                                  },
                                }),
                            )(updatedMethods);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features Tab (placeholder) */}
          <TabsContent value="features" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                System Features
              </h3>
              <p className="text-sm text-muted-foreground">
                Enable or disable platform-wide features.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Map
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.systemFeatures?.map ?? true}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        systemFeatures: {
                          ...(settings.systemFeatures || {}),
                          map: checked,
                        },
                      });

                      createIndependentFieldHandler("systemFeatures_map", (v) =>
                        updateSettings({
                          systemFeatures: {
                            ...(settings.systemFeatures || {}),
                            map: v,
                          },
                        }),
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_map"] || "idle"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Messaging
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.systemFeatures?.messaging ?? true}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        systemFeatures: {
                          ...(settings.systemFeatures || {}),
                          messaging: checked,
                        },
                      });

                      createIndependentFieldHandler(
                        "systemFeatures_messaging",
                        (v) =>
                          updateSettings({
                            systemFeatures: {
                              ...(settings.systemFeatures || {}),
                              messaging: v,
                            },
                          }),
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_messaging"] || "idle"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Analytics
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.systemFeatures?.analytics ?? false}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        systemFeatures: {
                          ...(settings.systemFeatures || {}),
                          analytics: checked,
                        },
                      });

                      createIndependentFieldHandler(
                        "systemFeatures_analytics",
                        (v) =>
                          updateSettings({
                            systemFeatures: {
                              ...(settings.systemFeatures || {}),
                              analytics: v,
                            },
                          }),
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_analytics"] || "idle"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Reporting
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.systemFeatures?.reporting ?? false}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        systemFeatures: {
                          ...(settings.systemFeatures || {}),
                          reporting: checked,
                        },
                      });

                      createIndependentFieldHandler(
                        "systemFeatures_reporting",
                        (v) =>
                          updateSettings({
                            systemFeatures: {
                              ...(settings.systemFeatures || {}),
                              reporting: v,
                            },
                          }),
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_reporting"] || "idle"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Auditing
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.systemFeatures?.auditing ?? false}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        systemFeatures: {
                          ...(settings.systemFeatures || {}),
                          auditing: checked,
                        },
                      });

                      createIndependentFieldHandler(
                        "systemFeatures_auditing",
                        (v) =>
                          updateSettings({
                            systemFeatures: {
                              ...(settings.systemFeatures || {}),
                              auditing: v,
                            },
                          }),
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_auditing"] || "idle"}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab (placeholder) */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Security Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Admin password, auto-logout, account lockout and deletion.
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border border-border">
                  <h4 className="font-semibold mb-2">Admin Password</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Change the administrator password (local only).
                  </p>
                  <PasswordChangeForm
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                </Card>

                <Card className="p-4 border border-border">
                  <h4 className="font-semibold mb-2">Auto Logout</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically log out tenants after inactivity.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          !!settings.tenantPortalSettings?.securitySettings
                            ?.autoLogoutInactivityMinutes
                        }
                        onCheckedChange={(checked) => {
                          const newVal = checked
                            ? settings.tenantPortalSettings?.securitySettings
                                ?.autoLogoutInactivityMinutes || 30
                            : undefined;

                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              securitySettings: {
                                ...settings.tenantPortalSettings
                                  ?.securitySettings,
                                autoLogoutInactivityMinutes: newVal,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalSecurity_autoLogoutInactivityMinutes",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  securitySettings: {
                                    ...settings.tenantPortalSettings
                                      ?.securitySettings,
                                    autoLogoutInactivityMinutes: v,
                                  },
                                },
                              }),
                          )(newVal);
                        }}
                      />
                      <label className="text-sm">Enable Auto Logout</label>
                      <FieldSaveIndicator
                        status={
                          fieldStatus[
                            "tenantPortalSecurity_autoLogoutInactivityMinutes"
                          ] || "idle"
                        }
                      />
                    </div>
                  </div>
                  {settings.tenantPortalSettings?.securitySettings
                    ?.autoLogoutInactivityMinutes !== undefined && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Inactivity (minutes)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={
                            settings.tenantPortalSettings?.securitySettings
                              ?.autoLogoutInactivityMinutes || 30
                          }
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                securitySettings: {
                                  ...settings.tenantPortalSettings
                                    ?.securitySettings,
                                  autoLogoutInactivityMinutes: value,
                                },
                              },
                            });

                            createIndependentFieldHandler(
                              "tenantPortalSecurity_autoLogoutInactivityMinutes",
                              (v) =>
                                updateSettings({
                                  tenantPortalSettings: {
                                    ...settings.tenantPortalSettings,
                                    securitySettings: {
                                      ...settings.tenantPortalSettings
                                        ?.securitySettings,
                                      autoLogoutInactivityMinutes: v,
                                    },
                                  },
                                }),
                            )(value);
                          }}
                        />
                        <FieldSaveIndicator
                          status={
                            fieldStatus[
                              "tenantPortalSecurity_autoLogoutInactivityMinutes"
                            ] || "idle"
                          }
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border border-border">
                  <h4 className="font-semibold mb-2">Tenant Account Lockout</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically lock tenant accounts after repeated failed
                    login attempts.
                  </p>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Enable Auto Lock</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          !!settings.tenantPortalSettings?.securitySettings
                            ?.autoLockEnabled
                        }
                        onCheckedChange={(checked) => {
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              securitySettings: {
                                ...settings.tenantPortalSettings
                                  ?.securitySettings,
                                autoLockEnabled: checked,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalSecurity_autoLockEnabled",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  securitySettings: {
                                    ...settings.tenantPortalSettings
                                      ?.securitySettings,
                                    autoLockEnabled: v,
                                  },
                                },
                              }),
                          )(checked);
                        }}
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus["tenantPortalSecurity_autoLockEnabled"] ||
                          "idle"
                        }
                      />
                    </div>
                  </div>
                  {settings.tenantPortalSettings?.securitySettings
                    ?.autoLockEnabled && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Failed Login Threshold
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={
                            settings.tenantPortalSettings?.securitySettings
                              ?.failedLoginThreshold || 5
                          }
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                securitySettings: {
                                  ...settings.tenantPortalSettings
                                    ?.securitySettings,
                                  failedLoginThreshold: value,
                                },
                              },
                            });

                            createIndependentFieldHandler(
                              "tenantPortalSecurity_failedLoginThreshold",
                              (v) =>
                                updateSettings({
                                  tenantPortalSettings: {
                                    ...settings.tenantPortalSettings,
                                    securitySettings: {
                                      ...settings.tenantPortalSettings
                                        ?.securitySettings,
                                      failedLoginThreshold: v,
                                    },
                                  },
                                }),
                            )(value);
                          }}
                        />
                        <FieldSaveIndicator
                          status={
                            fieldStatus[
                              "tenantPortalSecurity_failedLoginThreshold"
                            ] || "idle"
                          }
                        />
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-4 border border-red-400 bg-red-50">
                  <h4 className="font-semibold mb-2 text-red-700">
                    Account Deletion
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete all local data. This action cannot be
                    undone.
                  </p>
                  <AccountDeletionCard />
                </Card>
              </div>
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
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Notification Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "rentDue",
                    title: "Rent Due",
                    description: "Notify tenants when rent is due.",
                  },
                  {
                    key: "messages",
                    title: "Messages",
                    description: "Notify users of new messages.",
                  },
                  {
                    key: "failedLogin",
                    title: "Failed Login Attempt",
                    description:
                      "Alert admins/tenants on failed login attempts.",
                  },
                  {
                    key: "rentPayments",
                    title: "Rent Payments",
                    description:
                      "Notify when rent payments are received or fail.",
                  },
                  {
                    key: "tenantProfile",
                    title: "Tenant Profile Change",
                    description: "Tenant creation, update & deletion events.",
                  },
                  {
                    key: "propertyProfile",
                    title: "Property Profile Update",
                    description: "Property creation, update & deletion events.",
                  },
                  {
                    key: "maintenance",
                    title: "Maintenance",
                    description: "Maintenance request creation and approvals.",
                  },
                  {
                    key: "expenses",
                    title: "Expenses",
                    description: "Expense records created or updated.",
                  },
                ].map((n) => {
                  const channelPref = settings.notifications?.templates?.[
                    n.key
                  ] ?? { channels: ["email", "in_app"] };
                  const emailEnabled = (channelPref.channels || []).includes(
                    "email",
                  );
                  const inAppEnabled = (channelPref.channels || []).includes(
                    "in_app",
                  );
                  return (
                    <Card key={n.key} className="border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            {n.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {n.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm">Email</label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={emailEnabled}
                                onCheckedChange={(checked) => {
                                  const existing =
                                    settings.notifications?.templates || {};
                                  const tmpl = existing[n.key] || {
                                    subject: "",
                                    body: "",
                                    channels: [],
                                  };
                                  const channels = new Set(tmpl.channels || []);
                                  if (checked) channels.add("email");
                                  else channels.delete("email");
                                  const updated = {
                                    ...existing,
                                    [n.key]: {
                                      ...tmpl,
                                      channels: Array.from(channels),
                                    },
                                  };
                                  updateSettings({
                                    notifications: {
                                      ...settings.notifications,
                                      templates: updated,
                                    },
                                  });

                                  createIndependentFieldHandler(
                                    `notifications_templates_${n.key}`,
                                    (v) =>
                                      updateSettings({
                                        notifications: {
                                          ...settings.notifications,
                                          templates: v,
                                        },
                                      }),
                                  )(updated);
                                }}
                              />
                              <FieldSaveIndicator
                                status={
                                  fieldStatus[
                                    `notifications_templates_${n.key}`
                                  ] || "idle"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm">In-app</label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={inAppEnabled}
                                onCheckedChange={(checked) => {
                                  const existing =
                                    settings.notifications?.templates || {};
                                  const tmpl = existing[n.key] || {
                                    subject: "",
                                    body: "",
                                    channels: [],
                                  };
                                  const channels = new Set(tmpl.channels || []);
                                  if (checked) channels.add("in_app");
                                  else channels.delete("in_app");
                                  const updated = {
                                    ...existing,
                                    [n.key]: {
                                      ...tmpl,
                                      channels: Array.from(channels),
                                    },
                                  };
                                  updateSettings({
                                    notifications: {
                                      ...settings.notifications,
                                      templates: updated,
                                    },
                                  });

                                  createIndependentFieldHandler(
                                    `notifications_templates_${n.key}`,
                                    (v) =>
                                      updateSettings({
                                        notifications: {
                                          ...settings.notifications,
                                          templates: v,
                                        },
                                      }),
                                  )(updated);
                                }}
                              />
                              <FieldSaveIndicator
                                status={
                                  fieldStatus[
                                    `notifications_templates_${n.key}`
                                  ] || "idle"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Portal Tab with simplified sections per text.txt */}
          <TabsContent value="portal" className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Tenant Portal Settings
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Configure portal features and security for tenants
              </p>
            </div>

            {/* Portal Features Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-teal-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-4 h-4" />
                    <span>Portal Features</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Rent Payment
                    </label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.tenantPortalSettings?.featureToggles
                            ?.paymentPortal ?? true
                        }
                        onCheckedChange={(checked) => {
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              featureToggles: {
                                ...settings.tenantPortalSettings
                                  ?.featureToggles,
                                paymentPortal: checked,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalFeatures_rentPayment",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  featureToggles: {
                                    ...settings.tenantPortalSettings
                                      ?.featureToggles,
                                    paymentPortal: v,
                                  },
                                },
                              }),
                          )(checked);
                        }}
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus["tenantPortalFeatures_rentPayment"] ||
                          "idle"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Messaging
                    </label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.tenantPortalSettings?.featureToggles
                            ?.messages ?? true
                        }
                        onCheckedChange={(checked) => {
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              featureToggles: {
                                ...settings.tenantPortalSettings
                                  ?.featureToggles,
                                messages: checked,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalFeatures_messages",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  featureToggles: {
                                    ...settings.tenantPortalSettings
                                      ?.featureToggles,
                                    messages: v,
                                  },
                                },
                              }),
                          )(checked);
                        }}
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus["tenantPortalFeatures_messages"] || "idle"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Maintenance Requests
                    </label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.tenantPortalSettings?.featureToggles
                            ?.maintenanceRequests ?? true
                        }
                        onCheckedChange={(checked) => {
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              featureToggles: {
                                ...settings.tenantPortalSettings
                                  ?.featureToggles,
                                maintenanceRequests: checked,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalFeatures_maintenanceRequests",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  featureToggles: {
                                    ...settings.tenantPortalSettings
                                      ?.featureToggles,
                                    maintenanceRequests: v,
                                  },
                                },
                              }),
                          )(checked);
                        }}
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus[
                            "tenantPortalFeatures_maintenanceRequests"
                          ] || "idle"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Enable Eviction Notice
                    </label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.tenantPortalSettings?.featureToggles
                            ?.evictionNotice ?? false
                        }
                        onCheckedChange={(checked) => {
                          updateSettings({
                            tenantPortalSettings: {
                              ...settings.tenantPortalSettings,
                              featureToggles: {
                                ...settings.tenantPortalSettings
                                  ?.featureToggles,
                                evictionNotice: checked,
                              },
                            },
                          });

                          createIndependentFieldHandler(
                            "tenantPortalFeatures_evictionNotice",
                            (v) =>
                              updateSettings({
                                tenantPortalSettings: {
                                  ...settings.tenantPortalSettings,
                                  featureToggles: {
                                    ...settings.tenantPortalSettings
                                      ?.featureToggles,
                                    evictionNotice: v,
                                  },
                                },
                              }),
                          )(checked);
                        }}
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus["tenantPortalFeatures_evictionNotice"] ||
                          "idle"
                        }
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Portal Security Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-l-4 border-l-slate-500 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <LockIcon className="w-4 h-4" />
                    <span>Portal Security</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pl-4 border-l-2 border-border space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Enable Password Change
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Enable Profile Editing
                    </label>
                    <Switch
                      checked={
                        settings.tenantPortalSettings?.securitySettings
                          ?.allowProfileEditing ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateSettings({
                          tenantPortalSettings: {
                            ...settings.tenantPortalSettings,
                            securitySettings: {
                              ...settings.tenantPortalSettings
                                ?.securitySettings,
                              allowProfileEditing: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
