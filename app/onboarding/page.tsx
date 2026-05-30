"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/lib/settings-context";
import {
  convertPayloadToTenantPortalSettings,
  convertToSettingsPayload,
  createSettingsOnApi,
  updateSettingsOnApi,
} from "@/lib/services/settings";

const defaultFeatureToggles = {
  paymentPortal: true,
  maintenanceRequests: true,
  messages: true,
  documentAccess: true,
};

const defaultSecuritySettings = {
  autoLogoutEnabled: true,
  autoLogoutInactivityMinutes: 30,
  autoLockEnabled: false,
  failedLoginThreshold: 5,
  allowProfileEditing: true,
};

const currencyOptions = [
  { value: "USD", label: "USD - United States Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "KES", label: "KES - Kenyan Shilling" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
    licenseNumber: "",
  });
  const [financeSettings, setFinanceSettings] = useState({ currency: "USD" });
  const [featureToggles, setFeatureToggles] = useState(defaultFeatureToggles);
  const [securitySettings, setSecuritySettings] = useState(
    defaultSecuritySettings,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const { settings, settingsId, isLoaded, refresh } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !settings) {
      return;
    }

    setCompanyInfo({
      name: settings.companyInfo?.name ?? "",
      address: settings.companyInfo?.address?.street ?? "",
      city: settings.companyInfo?.address?.city ?? "",
      state: settings.companyInfo?.address?.state ?? "",
      country: settings.companyInfo?.address?.country ?? "",
      phone: settings.companyInfo?.phone ?? "",
      email: settings.companyInfo?.email ?? "",
      licenseNumber: settings.companyInfo?.licenseNumber ?? "",
    });

    setFinanceSettings({
      currency: settings.finance?.currency?.code ?? "USD",
    });

    const portalSettings = convertPayloadToTenantPortalSettings(settings);
    setFeatureToggles({
      paymentPortal: portalSettings.featureToggles.paymentPortal,
      maintenanceRequests: portalSettings.featureToggles.maintenanceRequests,
      messages: portalSettings.featureToggles.messages,
      documentAccess: portalSettings.featureToggles.documentAccess,
    });

    setSecuritySettings({
      autoLogoutEnabled: portalSettings.securitySettings.autoLogoutEnabled,
      autoLogoutInactivityMinutes:
        portalSettings.securitySettings.autoLogoutInactivityMinutes ?? 30,
      autoLockEnabled: portalSettings.securitySettings.autoLockEnabled,
      failedLoginThreshold:
        portalSettings.securitySettings.failedLoginThreshold ?? 5,
      allowProfileEditing: portalSettings.securitySettings.allowProfileEditing,
    });
  }, [isLoaded, settings]);

  const steps = [
    {
      number: 1,
      title: "Company Profile",
      description: "Start by creating your company profile",
      icon: Building2,
    },
    {
      number: 2,
      title: "Financial Settings",
      description: "Choose your preferred currency for transactions",
      icon: CreditCard,
    },
    {
      number: 3,
      title: "Tenant Portal Settings",
      description: "Select which tenant portal features to enable",
      icon: Users,
    },
    {
      number: 4,
      title: "Security Settings",
      description: "Configure key tenant security options",
      icon: ShieldCheck,
    },
  ];

  const activeStep = steps[currentStep - 1];
  const ActiveIcon = activeStep.icon;

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!companyInfo.name.trim()) {
        return "Company name is required.";
      }
      if (!companyInfo.address.trim()) {
        return "Address is required.";
      }
      if (!companyInfo.city.trim()) {
        return "City is required.";
      }
      if (!companyInfo.state.trim()) {
        return "State is required.";
      }
      if (!companyInfo.country.trim()) {
        return "Country is required.";
      }
    }

    if (currentStep === 2) {
      if (!financeSettings.currency.trim()) {
        return "Please select a currency.";
      }
    }

    return "";
  };

  const saveSettingsAsync = async () => {
    const payload = convertToSettingsPayload({
      companyInfo: {
        name: companyInfo.name,
        address: {
          street: companyInfo.address,
          city: companyInfo.city,
          state: companyInfo.state,
          country: companyInfo.country,
        },
        phone: companyInfo.phone,
        email: companyInfo.email,
        licenseNumber: companyInfo.licenseNumber,
      },
      financeSettings,
      featureToggles,
      securitySettings,
    });

    // Persist settings via admin-linked system settings API
    if (settingsId) {
      return updateSettingsOnApi(settingsId, payload);
    }

    return createSettingsOnApi(payload);
  };

  const handleNext = async () => {
    setError("");
    const validationMessage = validateCurrentStep();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveSettingsAsync();
      if (!result) {
        setError("Failed to save settings. Please try again.");
        setIsSaving(false);
        return;
      }

      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError("Unexpected error while saving settings.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PM</span>
          </div>
          <span className="text-xl font-bold text-foreground">PropManager</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step.number
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 transition-all ${
                      currentStep > step.number ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ActiveIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  {activeStep.title}
                </h1>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description} to start managing your rental
                  properties.
                </p>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name
                    </label>
                    <Input
                      placeholder="e.g., Sunset Apartments"
                      value={companyInfo.name}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address
                    </label>
                    <Input
                      placeholder="Street address"
                      value={companyInfo.address}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City
                      </label>
                      <Input
                        placeholder="City"
                        value={companyInfo.city}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State
                      </label>
                      <Input
                        placeholder="State"
                        value={companyInfo.state}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country
                      </label>
                      <Input
                        placeholder="Country"
                        value={companyInfo.country}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            country: e.target.value,
                          })
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
                        placeholder="Company phone"
                        value={companyInfo.phone}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            phone: e.target.value,
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
                        placeholder="support@example.com"
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      License / Registration Number
                    </label>
                    <Input
                      placeholder="Optional"
                      value={companyInfo.licenseNumber}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          licenseNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. Configure the system currency used
                  for rent and financial reports.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Default Currency
                    </label>
                    <Select
                      value={financeSettings.currency}
                      onValueChange={(value) =>
                        setFinanceSettings({
                          ...financeSettings,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Finance Contact Email
                    </label>
                    <Input
                      type="email"
                      placeholder="finance@example.com"
                      value={companyInfo.email}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. Choose which tenant portal features
                  should be available immediately.
                </p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Payments</p>
                      <p className="text-sm text-muted-foreground">
                        Allow tenants to view balances and make payments.
                      </p>
                    </div>
                    <Switch
                      checked={featureToggles.paymentPortal}
                      onCheckedChange={(checked) =>
                        setFeatureToggles({
                          ...featureToggles,
                          paymentPortal: checked,
                        })
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Maintenance Requests
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Let tenants submit and track maintenance issues.
                      </p>
                    </div>
                    <Switch
                      checked={featureToggles.maintenanceRequests}
                      onCheckedChange={(checked) =>
                        setFeatureToggles({
                          ...featureToggles,
                          maintenanceRequests: checked,
                        })
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Messages</p>
                      <p className="text-sm text-muted-foreground">
                        Enable tenant-to-manager messaging.
                      </p>
                    </div>
                    <Switch
                      checked={featureToggles.messages}
                      onCheckedChange={(checked) =>
                        setFeatureToggles({
                          ...featureToggles,
                          messages: checked,
                        })
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Documents</p>
                      <p className="text-sm text-muted-foreground">
                        Allow tenants to view important documents online.
                      </p>
                    </div>
                    <Switch
                      checked={featureToggles.documentAccess}
                      onCheckedChange={(checked) =>
                        setFeatureToggles({
                          ...featureToggles,
                          documentAccess: checked,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. Use these settings to protect tenant
                  access and secure the system.
                </p>

                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-foreground">
                          Auto Logout
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Automatically log users out after inactivity.
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.autoLogoutEnabled}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            autoLogoutEnabled: checked,
                          })
                        }
                      />
                    </div>
                    {securitySettings.autoLogoutEnabled && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground">
                          Inactivity timeout
                        </label>
                        <Select
                          value={securitySettings.autoLogoutInactivityMinutes.toString()}
                          onValueChange={(value) =>
                            setSecuritySettings({
                              ...securitySettings,
                              autoLogoutInactivityMinutes: Number(value),
                            })
                          }
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
                      </div>
                    )}
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-foreground">
                          Auto Lockout
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Lock accounts after repeated failed login attempts.
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.autoLockEnabled}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            autoLockEnabled: checked,
                          })
                        }
                      />
                    </div>
                    {securitySettings.autoLockEnabled && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground">
                          Failed attempts before lockout
                        </label>
                        <Select
                          value={securitySettings.failedLoginThreshold.toString()}
                          onValueChange={(value) =>
                            setSecuritySettings({
                              ...securitySettings,
                              failedLoginThreshold: Number(value),
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 attempts</SelectItem>
                            <SelectItem value="5">5 attempts</SelectItem>
                            <SelectItem value="7">7 attempts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Allow Profile Editing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Allow tenants to update their own profile information.
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.allowProfileEditing}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          allowProfileEditing: checked,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8 pt-8 border-t border-border">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1 || isSaving}
                variant="outline"
                className="flex-1 border-border text-foreground bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {currentStep === 4 ? (
                  <>
                    {isSaving ? "Saving..." : "Complete Setup"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
