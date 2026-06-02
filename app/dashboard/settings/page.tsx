"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CreditCardIcon,
  ShieldAlert,
} from "lucide-react";
import {
  getSystemSettings,
  initializeSystemSettings,
  createSettingsOnApi,
  updateSettingsOnApi,
  convertPayloadToTenantPortalSettings,
  updateTenantPortalSettings,
  FieldStatus,
  debounce,
} from "@/lib/services/settings";
import { SystemSettings, clearDB } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
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
  const { user, changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [localProfile, setLocalProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    setLocalProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const handleChange = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!current || !newPw || !confirm) {
      setError("All fields are required");
      return;
    }

    if (newPw.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPw !== confirm) {
      setError("New password and confirmation do not match");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(current, newPw);
      setSuccess(true);
      setCurrent("");
      setNewPw("");
      setConfirm("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMsg =
        err.message ||
        err.response?.data?.message ||
        "Failed to change password. Please check your current password.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded border border-green-200">
          ✓ Password changed successfully!
        </div>
      )}
      <Input
        type="password"
        placeholder="Current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        disabled={isLoading}
      />
      <Input
        type="password"
        placeholder="New password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        disabled={isLoading}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleChange}
          disabled={isLoading}
          className="bg-primary text-white"
        >
          {isLoading ? "Changing..." : "Change Password"}
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
  const {
    user,
    updateProfile,
    isLoading: authLoading,
    error: authError,
    token,
  } = useAuth();
  const {
    settings: apiSettings,
    settingsId,
    isLoading: settingsLoading,
    error: settingsError,
    refresh: refreshSettings,
  } = useSettings();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Profile edit state
  const [localProfile, setLocalProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  type LocalCompanyInfo = {
    name: string;
    address: {
      street: string;
      state: string;
      city: string;
      country: string;
    };
    phone: string;
    email: string;
    logo: {
      url: string;
      public_id: string;
    };
    licenseNumber: string;
  };

  const defaultLocalCompanyInfo: LocalCompanyInfo = {
    name: "",
    address: { street: "", state: "", city: "", country: "" },
    phone: "",
    email: "",
    logo: { url: "", public_id: "" },
    licenseNumber: "",
  };

  // Company info edit state
  const [localCompanyInfo, setLocalCompanyInfo] = useState<LocalCompanyInfo>(
    defaultLocalCompanyInfo,
  );

  const [companyInfoSaving, setCompanyInfoSaving] = useState(false);
  const [companyInfoError, setCompanyInfoError] = useState<string | null>(null);

  useEffect(() => {
    setLocalProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
  }, [user]);

  useEffect(() => {
    if (settings?.companyInfo) {
      const companyAddress = settings.companyInfo.address ?? {
        address: "",
        estate: "",
        city: "",
        country: "",
      };
      const companyLogo = settings.companyInfo.logo ?? {
        url: "",
        public_id: "",
      };

      setLocalCompanyInfo({
        name: settings.companyInfo.name || "",
        address: {
          street: companyAddress.address || "",
          state: companyAddress.estate || "",
          city: companyAddress.city || "",
          country: companyAddress.country || "",
        },
        phone: settings.companyInfo.phone || "",
        email: settings.companyInfo.email || "",
        logo: {
          url: companyLogo.url || "",
          public_id: companyLogo.public_id || "",
        },
        licenseNumber: settings.companyInfo.licenseNumber || "",
      });
    }
  }, [settings?.companyInfo]);

  const buildPayloadForField = (flatKey: string, value: any) => {
    const existingSecurity = settings?.tenantPortalSettings?.securitySettings;
    const securityPayload = {
      autoLogout: {
        enabled:
          existingSecurity?.autoLogoutEnabled ??
          (existingSecurity?.autoLogoutInactivityMinutes !== undefined
            ? existingSecurity.autoLogoutInactivityMinutes > 0
            : true),
        durationMinutes:
          flatKey === "tenantPortalSecurity_autoLogoutInactivityMinutes"
            ? value
            : (existingSecurity?.autoLogoutInactivityMinutes ?? 30),
      },
      autoLockout: {
        enabled: existingSecurity?.autoLockEnabled ?? false,
        threshold: existingSecurity?.failedLoginThreshold ?? 5,
      },
      allowProfileEditing: existingSecurity?.allowProfileEditing ?? true,
    };

    switch (flatKey) {
      case "companyInfo_name":
        return { companyInfo: { name: value } };
      case "companyInfo_phone":
        return { companyInfo: { phone: value } };
      case "companyInfo_email":
        return { companyInfo: { email: value } };
      case "companyInfo_licenseNumber":
        return { companyInfo: { licenseNumber: value } };
      case "tenantPortalFeatures_rentPayment":
        return { tenantPortal: { portalFeatures: { rentPayment: value } } };
      case "tenantPortalFeatures_maintenanceRequests":
        return {
          tenantPortal: { portalFeatures: { maintenanceRequests: value } },
        };
      case "tenantPortalFeatures_documentAccess":
        return {
          tenantPortal: { portalFeatures: { documentAccess: value } },
        };
      case "tenantPortalFeatures_messages":
        return { tenantPortal: { portalFeatures: { messages: value } } };
      case "tenantPortalFeatures_announcements":
        return {
          tenantPortal: { portalFeatures: { announcements: value } },
        };
      case "tenantPortalFeatures_evictionNotice":
        return {
          tenantPortal: { portalFeatures: { evictionNotice: value } },
        };
      case "financeSettings_currency":
        return { finance: { currency: { code: value } } };
      case "systemFeatures_map":
        return { features: { map: value } };
      case "systemFeatures_messaging":
        return { features: { messaging: value } };
      case "systemFeatures_analytics":
        return { features: { analytics: value } };
      case "systemFeatures_reporting":
        return { features: { reporting: value } };
      case "systemFeatures_auditing":
        return { features: { auditing: value } };
      case "tenantPortalSecurity_autoLogoutInactivityMinutes":
        return {
          security: {
            ...securityPayload,
            autoLogout: {
              ...securityPayload.autoLogout,
              enabled: value !== undefined,
              durationMinutes: value,
            },
          },
        };
      case "tenantPortalSecurity_allowProfileEditing":
        return {
          security: {
            ...securityPayload,
            allowProfileEditing: value,
          },
        };
      case "tenantPortalSecurity_autoLockEnabled":
        return {
          security: {
            ...securityPayload,
            autoLockout: {
              ...securityPayload.autoLockout,
              enabled: value,
            },
          },
        };
      case "tenantPortalSecurity_failedLoginThreshold":
        return {
          security: {
            ...securityPayload,
            autoLockout: {
              ...securityPayload.autoLockout,
              threshold: value,
            },
          },
        };
      default:
        return undefined;
    }
  };

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

  const dispatchSystemSettingsChange = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("system-settings-changed"));
    localStorage.setItem(
      "propman:v1",
      JSON.stringify({ updatedAt: Date.now() }),
    );
  };

  const portalFeatureFieldKeys = [
    "tenantPortalFeatures_rentPayment",
    "tenantPortalFeatures_messages",
    "tenantPortalFeatures_maintenanceRequests",
    "tenantPortalFeatures_evictionNotice",
  ];

  const isAnyPortalFeatureSaving = () =>
    portalFeatureFieldKeys.some((key) => fieldStatus[key] === "saving");

  const buildTenantPortalFeaturePayload = (
    localFeatureKey: string,
    checked: boolean,
  ) => {
    const current =
      (settings?.tenantPortalSettings?.featureToggles as any) || {};

    return {
      tenantPortal: {
        portalFeatures: {
          rentPayment:
            localFeatureKey === "paymentPortal"
              ? checked
              : (current.paymentPortal ?? true),
          messages:
            localFeatureKey === "messages"
              ? checked
              : (current.messages ?? true),
          maintenanceRequests:
            localFeatureKey === "maintenanceRequests"
              ? checked
              : (current.maintenanceRequests ?? true),
          evictionNotice:
            localFeatureKey === "evictionNotice"
              ? checked
              : (current.evictionNotice ?? false),
        },
      },
    };
  };

  const updateTenantPortalToggle = (
    fieldKey: string,
    featureKey: string,
    checked: boolean,
  ) => {
    updateSettings((prev: SystemSettings | null) => ({
      ...prev,
      tenantPortalSettings: {
        ...prev?.tenantPortalSettings,
        featureToggles: {
          ...prev?.tenantPortalSettings?.featureToggles,
          [featureKey]: checked,
        },
      },
    }));

    createIndependentFieldHandler(
      fieldKey,
      (v: any) =>
        updateSettings((prev: SystemSettings | null) => ({
          ...prev,
          tenantPortalSettings: {
            ...prev?.tenantPortalSettings,
            featureToggles: {
              ...prev?.tenantPortalSettings?.featureToggles,
              [featureKey]: v,
            },
          },
        })),
      buildTenantPortalFeaturePayload(featureKey, checked),
    )(checked);
  };

  // Factory to create debounced field update handlers
  const createIndependentFieldHandler = (
    flatKey: string,
    setter: (value: any) => void,
    payload?: Record<string, any>,
  ) => {
    const debouncedUpdate = debounce(
      async (value: any) => {
        clearFieldError(flatKey);
        markFieldStatus(flatKey, "saving");

        try {
          const payloadToSend = payload ?? buildPayloadForField(flatKey, value);

          // Debug logs to trace what is being sent when updating settings
          // Helps diagnose currency save issues where USD is persisted unexpectedly
          // eslint-disable-next-line no-console
          console.debug(
            "[Settings] Saving field",
            flatKey,
            "value:",
            value,
            "payload:",
            payloadToSend,
          );

          if (payloadToSend) {
            if (!settingsId) {
              const created = await createSettingsOnApi(payloadToSend, token);
              // eslint-disable-next-line no-console
              console.debug("[Settings] createSettingsOnApi result:", created);
              // After creating settings, refresh the context to pick up the new settingsId
              if (created?._id) {
                await refreshSettings();
                dispatchSystemSettingsChange();
              }
            } else {
              const updated = await updateSettingsOnApi(
                settingsId,
                payloadToSend,
                token,
              );
              // eslint-disable-next-line no-console
              console.debug("[Settings] updateSettingsOnApi result:", updated);
              if (!updated) {
                throw new Error("Failed to save to server");
              }
              // Refresh shared settings so other pages use the updated currency value
              await refreshSettings();
              dispatchSystemSettingsChange();
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
        // Settings now come from SettingsContext (apiSettings)
        if (apiSettings) {
          // Convert API settings to TenantPortalSettings format
          const nestedSettings =
            convertPayloadToTenantPortalSettings(apiSettings);
          const localSettings =
            getSystemSettings() ?? initializeSystemSettings();
          // Merge API settings with local defaults
          const merged = {
            ...localSettings,
            tenantPortalSettings: nestedSettings,
            companyInfo: apiSettings.companyInfo,
          };
          setSettings(merged);
          setApiError(null);
        } else if (settingsLoading) {
          // Still loading from context
          setApiError(null);
        } else {
          // Fallback to localStorage
          const localSettings =
            getSystemSettings() ?? initializeSystemSettings();
          setSettings(localSettings);
          if (settingsError) {
            setApiError(settingsError);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        const localSettings = getSystemSettings() ?? initializeSystemSettings();
        setSettings(localSettings);
        setApiError("Error loading from API, using local storage");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [apiSettings, settingsLoading, settingsError]);

  const updateSettings = (
    updates: any | ((prev: SystemSettings | null) => SystemSettings | null),
  ) => {
    setSettings((prev: SystemSettings | null) => {
      if (!prev) return null;
      return typeof updates === "function"
        ? updates(prev)
        : { ...prev, ...updates };
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
              <Users className="w-4 h-4 mr-2" />
              Portal
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Finances
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            {/* <TabsTrigger
              value="features"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger> */}
            <TabsTrigger
              value="security"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
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
                      First Name
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={localProfile.firstName}
                        onChange={(e) =>
                          setLocalProfile((p) => ({
                            ...p,
                            firstName: e.target.value,
                          }))
                        }
                      />
                      <FieldSaveIndicator
                        status={fieldStatus["companyInfo_adminName"] || "idle"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={localProfile.lastName}
                        onChange={(e) =>
                          setLocalProfile((p) => ({
                            ...p,
                            lastName: e.target.value,
                          }))
                        }
                      />
                      <FieldSaveIndicator
                        status={
                          fieldStatus["companyInfo_adminLastName"] || "idle"
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={localProfile.phone}
                      onChange={(e) =>
                        setLocalProfile((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                    />
                    <FieldSaveIndicator
                      status={fieldStatus["companyInfo_adminPhone"] || "idle"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="email" value={user?.email || ""} readOnly />
                    <Button
                      onClick={async () => {
                        try {
                          await updateProfile({
                            firstName: localProfile.firstName,
                            lastName: localProfile.lastName,
                            phone: localProfile.phone,
                          });
                          alert("Profile updated successfully");
                        } catch (err) {
                          console.error("Failed to update profile", err);
                          alert("Failed to update profile");
                        }
                      }}
                      disabled={authLoading}
                    >
                      {authLoading ? "Saving..." : "Save"}
                    </Button>
                    {authError && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
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
                  <Input
                    value={localCompanyInfo.name}
                    onChange={(e) =>
                      setLocalCompanyInfo((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Street / Address"
                      value={localCompanyInfo.address.street}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          address: {
                            ...p.address,
                            street: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      placeholder="State / Province"
                      value={localCompanyInfo.address.state}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          address: {
                            ...p.address,
                            state: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <Input
                      placeholder="City"
                      value={localCompanyInfo.address.city}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          address: {
                            ...p.address,
                            city: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      placeholder="Country"
                      value={localCompanyInfo.address.country}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          address: {
                            ...p.address,
                            country: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input
                      value={localCompanyInfo.phone}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={localCompanyInfo.email}
                      onChange={(e) =>
                        setLocalCompanyInfo((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Logo URL
                  </label>
                  <Input
                    placeholder="https://.../logo.png"
                    value={localCompanyInfo.logo.url}
                    onChange={(e) =>
                      setLocalCompanyInfo((p) => ({
                        ...p,
                        logo: {
                          ...p.logo,
                          url: e.target.value,
                        },
                      }))
                    }
                  />
                  {localCompanyInfo.logo.url && (
                    <div className="mt-3">
                      <img
                        src={localCompanyInfo.logo.url}
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
                  <Input
                    value={localCompanyInfo.licenseNumber}
                    onChange={(e) =>
                      setLocalCompanyInfo((p) => ({
                        ...p,
                        licenseNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={async () => {
                    setCompanyInfoSaving(true);
                    setCompanyInfoError(null);
                    try {
                      if (!settingsId) {
                        alert(
                          "Settings not initialized. Please refresh and try again.",
                        );
                        return;
                      }
                      await updateSettingsOnApi(settingsId, {
                        companyInfo: {
                          ...localCompanyInfo,
                          address: {
                            street: localCompanyInfo.address.street,
                            state: localCompanyInfo.address.state,
                            city: localCompanyInfo.address.city,
                            country: localCompanyInfo.address.country,
                          },
                          owner: user?.id,
                        },
                      });
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              companyInfo: localCompanyInfo,
                            }
                          : null,
                      );
                      alert("Company information saved successfully");
                    } catch (err) {
                      console.error("Failed to save company info", err);
                      setCompanyInfoError(
                        err instanceof Error ? err.message : "Save failed",
                      );
                      alert("Failed to save company information");
                    } finally {
                      setCompanyInfoSaving(false);
                    }
                  }}
                  disabled={companyInfoSaving}
                >
                  {companyInfoSaving ? "Saving..." : "Save Company Info"}
                </Button>
                {companyInfoError && (
                  <div className="text-sm text-red-600">{companyInfoError}</div>
                )}
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
                            // Also update local system-settings immediately so UI reflects choice
                            try {
                              updateTenantPortalSettings({
                                financeSettings: { currency: value },
                              });
                              // notify other parts of app
                              dispatchSystemSettingsChange();
                              // refresh context to pick up local change if API is unreachable
                              refreshSettings();
                            } catch (e) {
                              // ignore local persistence failures
                              // eslint-disable-next-line no-console
                              console.warn(
                                "Local updateTenantPortalSettings failed",
                                e,
                              );
                            }

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
                              {
                                finance: {
                                  currency: {
                                    code: value,
                                  },
                                },
                              },
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
          {/* <TabsContent value="features" className="p-6 space-y-6">
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

                      createIndependentFieldHandler(
                        "systemFeatures_map",
                        (v) =>
                          updateSettings({
                            systemFeatures: {
                              ...(settings.systemFeatures || {}),
                              map: v,
                            },
                          }),
                        {
                          features: {
                            map: checked,
                          },
                        },
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
                        {
                          features: {
                            messaging: checked,
                          },
                        },
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
                        {
                          features: {
                            analytics: checked,
                          },
                        },
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
                        {
                          features: {
                            reporting: checked,
                          },
                        },
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
                        {
                          features: {
                            auditing: checked,
                          },
                        },
                      )(checked);
                    }}
                  />
                  <FieldSaveIndicator
                    status={fieldStatus["systemFeatures_auditing"] || "idle"}
                  />
                </div>
              </div>
            </div>
          </TabsContent> */}

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
                          settings.tenantPortalSettings?.securitySettings
                            ?.autoLogoutEnabled ??
                          settings.tenantPortalSettings?.securitySettings
                            ?.autoLogoutInactivityMinutes !== undefined
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
                                autoLogoutEnabled: checked,
                              },
                            },
                          });

                          const existingSecurity =
                            settings.tenantPortalSettings?.securitySettings;
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
                            {
                              security: {
                                autoLogout: {
                                  enabled: checked,
                                  durationMinutes: newVal,
                                },
                                autoLockout: {
                                  enabled:
                                    existingSecurity?.autoLockEnabled ?? false,
                                  threshold:
                                    existingSecurity?.failedLoginThreshold ?? 5,
                                },
                                allowProfileEditing:
                                  existingSecurity?.allowProfileEditing ?? true,
                              },
                            },
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
                    ?.autoLogoutEnabled && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Inactivity Timeout
                      </label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(
                            settings.tenantPortalSettings?.securitySettings
                              ?.autoLogoutInactivityMinutes ?? 30,
                          )}
                          onValueChange={(value) => {
                            const numValue = Number(value);
                            updateSettings({
                              tenantPortalSettings: {
                                ...settings.tenantPortalSettings,
                                securitySettings: {
                                  ...settings.tenantPortalSettings
                                    ?.securitySettings,
                                  autoLogoutInactivityMinutes: numValue,
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
                            )(numValue);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
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
                            {
                              security: {
                                autoLockout: {
                                  enabled: checked,
                                },
                              },
                            },
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
                              {
                                security: {
                                  autoLockout: {
                                    threshold: value,
                                  },
                                },
                              },
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
                        disabled={
                          isAnyPortalFeatureSaving() ||
                          fieldStatus["tenantPortalFeatures_rentPayment"] ===
                            "saving"
                        }
                        onCheckedChange={(checked) => {
                          updateTenantPortalToggle(
                            "tenantPortalFeatures_rentPayment",
                            "paymentPortal",
                            checked,
                          );
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
                        disabled={
                          isAnyPortalFeatureSaving() ||
                          fieldStatus["tenantPortalFeatures_messages"] ===
                            "saving"
                        }
                        onCheckedChange={(checked) => {
                          updateTenantPortalToggle(
                            "tenantPortalFeatures_messages",
                            "messages",
                            checked,
                          );
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
                        disabled={
                          isAnyPortalFeatureSaving() ||
                          fieldStatus[
                            "tenantPortalFeatures_maintenanceRequests"
                          ] === "saving"
                        }
                        onCheckedChange={(checked) => {
                          updateTenantPortalToggle(
                            "tenantPortalFeatures_maintenanceRequests",
                            "maintenanceRequests",
                            checked,
                          );
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
                        disabled={
                          isAnyPortalFeatureSaving() ||
                          fieldStatus["tenantPortalFeatures_evictionNotice"] ===
                            "saving"
                        }
                        onCheckedChange={(checked) => {
                          updateTenantPortalToggle(
                            "tenantPortalFeatures_evictionNotice",
                            "evictionNotice",
                            checked,
                          );
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
