"use client";

import { useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });
  const [tenantData, setTenantData] = useState({
    importMethod: "manual",
  });
  const [paymentData, setPaymentData] = useState({
    currency: "USD",
    paymentMethod: "stripe",
    email: "",
  });
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Company Name & Property",
      description: "Start by creating your company profile",
      icon: Building2,
    },
    {
      number: 2,
      title: "Set up Your Currency",
      description: "Choose your preferred currency for transactions",
      icon: CreditCard,
    },
    {
      number: 3,
      title: "Set up Tenant's Portal",
      description: "Select which features you want to enable for your tenants",
      icon: Users,
    },
    {
      number: 4,
      title: "Security Settings",
      description: "Configure security preferences for your account and system",
      icon: ShieldCheck,
    },
  ];

  const activeStep = steps[currentStep - 1];
  const ActiveIcon = activeStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PM</span>
          </div>
          <span className="text-xl font-bold text-foreground">PropManager</span>
        </div>

        {/* Progress Indicator */}
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

        {/* Content Card */}
        <Card className="border-0 shadow-lg">
          <div className="p-8">
            {/* Step Header */}
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

            {/* Step 1: Property Setup */}
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
                      value={propertyData.name}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address
                    </label>
                    <Input
                      placeholder="Street address"
                      value={propertyData.address}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
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
                        value={propertyData.city}
                        onChange={(e) =>
                          setPropertyData({
                            ...propertyData,
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
                        value={propertyData.state}
                        onChange={(e) =>
                          setPropertyData({
                            ...propertyData,
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
                        value={propertyData.country}
                        onChange={(e) =>
                          setPropertyData({
                            ...propertyData,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tenant Import */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. You can add tenants manually now or
                  import them later.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      How would you like to add tenants?
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="radio"
                          name="import"
                          value="manual"
                          checked={tenantData.importMethod === "manual"}
                          onChange={(e) =>
                            setTenantData({
                              ...tenantData,
                              importMethod: e.target.value,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">
                            Add manually
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Add tenants one by one
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="radio"
                          name="import"
                          value="csv"
                          checked={tenantData.importMethod === "csv"}
                          onChange={(e) =>
                            setTenantData({
                              ...tenantData,
                              importMethod: e.target.value,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">
                            Import from CSV
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Upload a CSV file with tenant data
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="radio"
                          name="import"
                          value="skip"
                          checked={tenantData.importMethod === "skip"}
                          onChange={(e) =>
                            setTenantData({
                              ...tenantData,
                              importMethod: e.target.value,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">
                            Skip for now
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Add tenants later from the dashboard
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Setup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. This allows your tenants to pay rent
                  online.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      Payment Gateway
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-primary rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="stripe"
                          checked={paymentData.paymentMethod === "stripe"}
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">Stripe</p>
                          <p className="text-sm text-muted-foreground">
                            2.2% + $0.30 per transaction
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">PayPal</p>
                          <p className="text-sm text-muted-foreground">
                            2.2% + $0.30 per transaction
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email for Payments
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={paymentData.email}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      You'll complete the payment setup in your dashboard after
                      onboarding.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Step 4: Review and Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  {activeStep.description}. This allows you to manage your
                  account security and system preferences.
                </p>

                <div className="space-y-4">
                  <div>
                    <Card className="p-4 border border-border">
                      <h4 className="font-semibold mb-2">Auto Logout</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatically logs you out after a period of
                        inactivity to protect your account from unauthorized access.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={false} />
                          <label className="text-sm">Enable Auto Logout</label>
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Inactivity Timeout
                            </label>
                            <div className="flex items-center gap-2">
                              <Select>
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
                          </div>
                        </div>
                      </div>
                    </Card>
                    <span className="flex text-sm gap-2 text-foreground mb-4">
                      <label className="block text-sm font-medium text-foreground ">
                        Automatic Lockout
                      </label>
                      <p className="text-sm text-muted-foreground">
                        (Automatically locks out tenants after multiple failed
                        login attempts)
                      </p>
                    </span>
                    {/* <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-primary rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="stripe"
                          checked={paymentData.paymentMethod === "stripe"}
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">Stripe</p>
                          <p className="text-sm text-muted-foreground">
                            2.2% + $0.30 per transaction
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          className="w-4 h-4"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-foreground">PayPal</p>
                          <p className="text-sm text-muted-foreground">
                            2.2% + $0.30 per transaction
                          </p>
                        </div>
                      </label>
                    </div> */}
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email for Payments
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={paymentData.email}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div> */}

                  {/* <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      You'll complete the payment setup in your dashboard after
                      onboarding.
                    </p>
                  </div> */}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-8 border-t border-border">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="outline"
                className="flex-1 border-border text-foreground bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {currentStep === 4 ? (
                  <>
                    Complete Setup
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
