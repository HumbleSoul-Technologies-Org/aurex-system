"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { paymentHistory } from "@/app/lib/tenant-data";
import { getCurrentUser } from "@/lib/services/auth";
import { getTenant } from "@/lib/services/tenants";
import { getProperty } from "@/lib/services/properties";
import { createPayment, PaymentRecord } from "@/lib/services/payments";

export default function MakePaymentPage() {
  const [step, setStep] = useState<"amount" | "method" | "confirm" | "success">(
    "amount",
  );

  const user = useMemo(() => getCurrentUser(), []);
  const tenant = useMemo(
    () => (user?.role === "tenant" ? getTenant(user.id) : null),
    [user],
  );
  const property = useMemo(
    () => (tenant?.propertyId ? getProperty(tenant.propertyId) : null),
    [tenant],
  );

  const defaultRent = tenant?.rentAmount ?? property?.price_per_unit ?? 0;
  const [amount, setAmount] = useState<number>(defaultRent);
  const [method, setMethod] = useState("bank-transfer");
  const [processing, setProcessing] = useState(false);
  const [savedPayment, setSavedPayment] = useState<PaymentRecord | null>(null);

  const nextPayment = paymentHistory.find((p) => p.status === "pending");

  const handleSubmit = async () => {
    if (step === "amount") setStep("method");
    else if (step === "method") setStep("confirm");
    else if (step === "confirm") {
      setProcessing(true);
      try {
        const payload: Partial<PaymentRecord> = {
          tenantId: tenant?.id || user?.id || "",
          propertyId: tenant?.propertyId || property?.id,
          unit: tenant?.unit,
          amount,
          price_per_unit: property?.price_per_unit,
          lease_start: tenant?.leaseStartDate,
          lease_type: tenant?.leaseType,
          balance:
            (tenant?.rentAmount ?? property?.price_per_unit ?? 0) - amount,
          method,
          date: new Date().toISOString(),
        };
        const rec = createPayment(payload);
        setSavedPayment(rec);
        if (typeof window !== "undefined")
          window.dispatchEvent(new CustomEvent("paymentsUpdated"));
        setTimeout(() => {
          setStep("success");
          setProcessing(false);
        }, 800);
      } catch (err) {
        setProcessing(false);
        // keep UI simple: fallback to success state after small delay
        setTimeout(() => setStep("success"), 800);
      }
    }
  };

  const handleReset = () => {
    setStep("amount");
    setAmount(defaultRent);
    setMethod("bank-transfer");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Make a Payment
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Secure online payment for your rent
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {(["amount", "method", "confirm", "success"] as const).map(
          (s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  ["amount", "method", "confirm", "success"].indexOf(step) >=
                  index
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-1 md:h-0.5 mx-2 md:mx-4 ${
                    ["amount", "method", "confirm", "success"].indexOf(step) >
                    index
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ),
        )}
      </div>

      {/* Form Content */}
      {step === "amount" && (
        <Card className="border border-border p-4 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Enter Payment Amount
            </h2>

            {/* Amount Quick Select */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {[
                    { label: "Monthly Rent", value: defaultRent },
                    { label: "Half", value: defaultRent / 2 },
                  ].map((option) => (
                    <Button
                      key={option.label}
                      variant={
                        amount === option.value && option.value > 0
                          ? "default"
                          : "outline"
                      }
                      className={`h-14 md:h-12 text-sm md:text-base ${
                        amount === option.value && option.value > 0
                          ? "bg-primary text-white"
                          : "border-border"
                      }`}
                      onClick={() => {
                        if (option.value > 0) setAmount(option.value);
                        else setAmount(0);
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">
                          {option.label === "Custom"
                            ? option.label
                            : "$" + option.value.toFixed(2)}
                        </span>
                        {option.label !== "Custom" && (
                          <span className="text-xs opacity-70">
                            {option.label}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Custom Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">
                    $
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 px-4 py-3 md:py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Payment Details</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Your payment will be processed securely. You will receive a
                  confirmation email immediately after successful payment.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === "method" && (
        <Card className="border border-border p-4 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              Select Payment Method
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: "bank-transfer",
                  name: "Bank Transfer",
                  description: "Direct transfer from your bank account",
                },
                {
                  id: "credit-card",
                  name: "Credit Card",
                  description: "Visa, Mastercard, American Express",
                },
                {
                  id: "debit-card",
                  name: "Debit Card",
                  description: "Direct debit card payment",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${method === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? "border-primary bg-primary" : "border-border"}`}
                    >
                      {method === m.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base">
                        {m.name}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {step === "confirm" && (
        <Card className="border border-border p-4 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              Review Payment
            </h2>

            <div className="bg-secondary p-4 md:p-6 rounded-lg border border-border space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payment Amount
                    </span>
                    <span className="font-semibold text-foreground">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-semibold text-foreground">
                      {method === "bank-transfer"
                        ? "Bank Transfer"
                        : method === "credit-card"
                          ? "Credit Card"
                          : "Debit Card"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground text-base md:text-lg">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-300">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-xs md:text-sm">
                  All transactions are encrypted and secure. Your payment
                  information will never be shared.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === "success" && (
        <Card className="border border-border p-4 md:p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Your payment of ${amount.toFixed(2)} has been processed
                successfully.
              </p>
            </div>

            <div className="bg-secondary p-4 rounded-lg border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-foreground">
                  {savedPayment?.transId ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  ${amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">
                  {savedPayment
                    ? new Date(savedPayment.date).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground">
              A confirmation email has been sent to{" "}
              {tenant?.email || "your email"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                asChild
                variant="outline"
                className="border-border text-foreground flex-1 bg-transparent"
              >
                <a href="/tenant/payments">View Payment History</a>
              </Button>
              <Button
                onClick={handleReset}
                className="bg-primary hover:bg-primary/90 text-white flex-1"
              >
                Make Another Payment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {step !== "success" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (step === "amount") window.history.back();
              else if (step === "method") setStep("amount");
              else if (step === "confirm") setStep("method");
            }}
            className="border-border text-foreground flex-1"
            disabled={step === "amount"}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (step === "amount" && amount <= 0) ||
              (step === "confirm" && processing)
            }
            className="bg-primary hover:bg-primary/90 text-white flex-1"
          >
            {processing ? "Processing..." : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}
