"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminPaymentMethod,
  BankDetails,
  PaymentMethodType,
  MpesaDetails,
} from "@/lib/services/settings";

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: AdminPaymentMethod) => void;
  onDelete?: (methodId: string) => void;
  editingMethod?: AdminPaymentMethod;
  isSaving?: boolean;
  isDeleting?: boolean;
}

const PAYMENT_METHOD_TYPES: PaymentMethodType[] = [
  "MTN_MoMo",
  "Airtel_Money",
  "M-Pesa",
  "Orange_Money",
  "Visa_Mastercard",
  "Bank_Transfer",
];

const MOBILE_MONEY_TYPES: PaymentMethodType[] = [
  "MTN_MoMo",
  "Airtel_Money",
  "M-Pesa",
  "Orange_Money",
];

const BANK_PAYMENT_TYPES: PaymentMethodType[] = [
  "Visa_Mastercard",
  "Bank_Transfer",
];

const getDisplayName = (type: PaymentMethodType): string => {
  const names: Record<PaymentMethodType, string> = {
    MTN_MoMo: "MTN MoMo",
    Airtel_Money: "Airtel Money",
    "M-Pesa": "M-Pesa",
    Orange_Money: "Orange Money",
    Visa_Mastercard: "Visa/Mastercard",
    Bank_Transfer: "Bank Transfer",
  };
  return names[type];
};

export function PaymentMethodsModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingMethod,
  isSaving,
  isDeleting,
}: PaymentMethodsModalProps) {
  const [formData, setFormData] = useState<AdminPaymentMethod>({
    type: "MTN_MoMo",
    enabled: false,
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({});
  const [mpesaDetails, setMpesaDetails] = useState<MpesaDetails>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingMethod) {
      setFormData(editingMethod);
      setBankDetails(editingMethod.bankDetails || {});
      setMpesaDetails((editingMethod as any).mpesa || {});
    } else {
      setFormData({ type: "MTN_MoMo", enabled: false });
      setBankDetails({});
      setMpesaDetails({});
    }
    setErrors({});
  }, [editingMethod, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (MOBILE_MONEY_TYPES.includes(formData.type)) {
      if (!formData.transactionNumber?.trim()) {
        newErrors.transactionNumber =
          "Transaction number is required for mobile money";
      }
    }

    if (BANK_PAYMENT_TYPES.includes(formData.type)) {
      if (!bankDetails.accountNumber?.trim()) {
        newErrors.accountNumber = "Account number is required";
      }
      if (!bankDetails.accountHolder?.trim()) {
        newErrors.accountHolder = "Account holder is required";
      }
      if (!bankDetails.bankName?.trim()) {
        newErrors.bankName = "Bank name is required";
      }
    }

    // M-Pesa specific validation when enabling
    if (formData.type === "M-Pesa") {
      const mp = mpesaDetails || {};
      const requires = mp.is_active === true || formData.enabled === true;
      if (requires) {
        if (!mp.shortcode || !String(mp.shortcode).trim()) {
          newErrors.shortcode = "Shortcode is required for M-Pesa when enabled";
        }
        if (!mp.consumerKey || !String(mp.consumerKey).trim()) {
          newErrors.consumerKey =
            "Consumer key is required for M-Pesa when enabled";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const method: AdminPaymentMethod = {
      ...formData,
      bankDetails: BANK_PAYMENT_TYPES.includes(formData.type)
        ? bankDetails
        : undefined,
      transactionNumber: MOBILE_MONEY_TYPES.includes(formData.type)
        ? formData.transactionNumber
        : undefined,
    };

    if (formData.type === "M-Pesa") {
      // Only include secrets if admin entered them (empty means keep existing)
      const mp: any = { ...mpesaDetails };
      if (!mp.consumerSecret) delete mp.consumerSecret;
      if (!mp.passkey) delete mp.passkey;
      method.mpesa = mp;
    }

    onSave(method);
    onClose();
  };

  const handleDelete = () => {
    if (editingMethod?._id && onDelete) {
      onDelete(editingMethod._id);
      onClose();
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value as PaymentMethodType,
    });
    setErrors({});
  };

  const handleTransactionNumberChange = (value: string) => {
    setFormData({
      ...formData,
      transactionNumber: value,
    });
  };

  const handleBankDetailChange = (field: keyof BankDetails, value: string) => {
    setBankDetails({
      ...bankDetails,
      [field]: value,
    });
  };

  const handleMpesaChange = (field: keyof MpesaDetails, value: any) => {
    setMpesaDetails({
      ...mpesaDetails,
      [field]: value,
    });
  };

  const isMobileMoneyType = MOBILE_MONEY_TYPES.includes(formData.type);
  const isBankType = BANK_PAYMENT_TYPES.includes(formData.type);

  const isMpesaType = formData.type === "M-Pesa";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
          </DialogTitle>
          <DialogDescription>
            Configure payment method details and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Method Type Select */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Method</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="payment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Number - Mobile Money Only */}
          {isMobileMoneyType && (
            <div className="space-y-2">
              <Label htmlFor="transaction-number">
                Transaction Number / Business Short Code
              </Label>
              <Input
                id="transaction-number"
                placeholder="e.g., 123456 or +256700000000"
                value={formData.transactionNumber || ""}
                onChange={(e) => handleTransactionNumberChange(e.target.value)}
                className={errors.transactionNumber ? "border-red-500" : ""}
              />
              {errors.transactionNumber && (
                <p className="text-sm text-red-500">
                  {errors.transactionNumber}
                </p>
              )}
              <p className="text-xs text-gray-500">
                For {getDisplayName(formData.type)}, provide the business short
                code or till number
              </p>
            </div>
          )}

          {/* Bank Details - Bank Transfer & Visa Only */}
          {isBankType && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Bank Details</h3>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name</Label>
                <Input
                  id="account-holder"
                  placeholder="Full name on account"
                  value={bankDetails.accountHolder || ""}
                  onChange={(e) =>
                    handleBankDetailChange("accountHolder", e.target.value)
                  }
                  className={errors.accountHolder ? "border-red-500" : ""}
                />
                {errors.accountHolder && (
                  <p className="text-sm text-red-500">{errors.accountHolder}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  placeholder="Account number"
                  value={bankDetails.accountNumber || ""}
                  onChange={(e) =>
                    handleBankDetailChange("accountNumber", e.target.value)
                  }
                  className={errors.accountNumber ? "border-red-500" : ""}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">{errors.accountNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  placeholder="Name of bank or financial institution"
                  value={bankDetails.bankName || ""}
                  onChange={(e) =>
                    handleBankDetailChange("bankName", e.target.value)
                  }
                  className={errors.bankName ? "border-red-500" : ""}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="swift-code">SWIFT Code</Label>
                  <Input
                    id="swift-code"
                    placeholder="Optional"
                    value={bankDetails.swiftCode || ""}
                    onChange={(e) =>
                      handleBankDetailChange("swiftCode", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500">
                    International transfers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routing-number">Routing Number</Label>
                  <Input
                    id="routing-number"
                    placeholder="Optional"
                    value={bankDetails.routingNumber || ""}
                    onChange={(e) =>
                      handleBankDetailChange("routingNumber", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500">US transfers</p>
                </div>
              </div>
            </div>
          )}

          {/* M-Pesa Specific Fields */}
          {isMpesaType && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">M-Pesa Configuration</h3>

              <div className="space-y-2">
                <Label htmlFor="mpesa-shortcode">Shortcode</Label>
                <Input
                  id="mpesa-shortcode"
                  placeholder="Shortcode / Till number"
                  value={mpesaDetails.shortcode || ""}
                  onChange={(e) =>
                    handleMpesaChange("shortcode", e.target.value)
                  }
                  className={errors.shortcode ? "border-red-500" : ""}
                />
                {errors.shortcode && (
                  <p className="text-sm text-red-500">{errors.shortcode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa-consumer-key">Consumer Key</Label>
                <Input
                  id="mpesa-consumer-key"
                  placeholder="Consumer Key"
                  value={mpesaDetails.consumerKey || ""}
                  onChange={(e) =>
                    handleMpesaChange("consumerKey", e.target.value)
                  }
                  className={errors.consumerKey ? "border-red-500" : ""}
                />
                {errors.consumerKey && (
                  <p className="text-sm text-red-500">{errors.consumerKey}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mpesa-consumer-secret">Consumer Secret</Label>
                  <Input
                    id="mpesa-consumer-secret"
                    type="password"
                    placeholder={
                      mpesaDetails.consumerSecret
                        ? "****** (configured)"
                        : "Consumer Secret"
                    }
                    value={mpesaDetails.consumerSecret || ""}
                    onChange={(e) =>
                      handleMpesaChange("consumerSecret", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesa-passkey">Passkey</Label>
                  <Input
                    id="mpesa-passkey"
                    type="password"
                    placeholder={
                      mpesaDetails.passkey ? "****** (configured)" : "Passkey"
                    }
                    value={mpesaDetails.passkey || ""}
                    onChange={(e) =>
                      handleMpesaChange("passkey", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor="mpesa-environment">Environment</Label>
                  <Select
                    value={mpesaDetails.environment || "sandbox"}
                    onValueChange={(v) => handleMpesaChange("environment", v)}
                  >
                    <SelectTrigger id="mpesa-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mpesa-active"
                    checked={Boolean(mpesaDetails.is_active)}
                    onCheckedChange={(c) =>
                      handleMpesaChange("is_active", Boolean(c))
                    }
                  />
                  <Label htmlFor="mpesa-active" className="cursor-pointer">
                    M-Pesa Active
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center space-x-2 border-t pt-4">
            <Checkbox
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  enabled: Boolean(checked),
                })
              }
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enable this payment method for tenants
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {editingMethod?._id && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                type="button"
                disabled={Boolean(isDeleting)}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={Boolean(isSaving)}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingMethod ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{editingMethod ? "Update" : "Add"} Method</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
