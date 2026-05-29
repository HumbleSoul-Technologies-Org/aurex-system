"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/lib/data-context";
import { createManualPayment } from "@/lib/services/payments";

type Props = {
  tenantId?: string | null;
  propertyId?: string | null;
  onSuccess?: (payment: any) => void;
  onCancel?: () => void;
};

export default function RecordPaymentForm({
  tenantId: initialTenantId = null,
  propertyId: initialPropertyId = null,
  onSuccess,
  onCancel,
}: Props) {
  const { tenants, properties } = useAppData();

  const [tenantId, setTenantId] = useState<string | null>(initialTenantId);
  const [propertyId, setPropertyId] = useState<string | null>(
    initialPropertyId,
  );
  const [amount, setAmount] = useState<string>("");
  // `currency` removed; server will assign or infer currency
  const [monthlyRent, setMonthlyRent] = useState<number | null>(null);
  const [paidOn, setPaidOn] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("manual");
  const [status, setStatus] = useState<string>("complete");
  const [leaseType, setLeaseType] = useState<string>("monthly");
  const [paidBy, setPaidBy] = useState<string>("");
  const [reasonForPayment, setReasonForPayment] =
    useState<string>("rentPayment");
  const [balance, setBalance] = useState<string>("0");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenantId) {
      const t = tenants.find((x: any) => x.id === tenantId);
      const rent = Number(
        (t as any)?.rentAmount || (t as any)?.monthlyRent || 0,
      );
      if (rent > 0) setMonthlyRent(rent);
    }
    if (!tenantId && initialTenantId) setTenantId(initialTenantId as string);
    if (!propertyId && initialPropertyId)
      setPropertyId(initialPropertyId as string);
  }, [tenantId, initialTenantId, initialPropertyId, tenants, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return alert("Please select a tenant");
    if (!amount || Number(amount) <= 0)
      return alert("Please enter a valid amount");

    setSaving(true);

    let uploadedReceiptUrl = undefined;

    const payload: any = {
      tenantId,
      propertyId,
      amount: Number(amount),
      monthlyRent: monthlyRent ?? undefined,
      paymentMethod,
      paidOn,
      leaseType: leaseType || undefined,
      paidBy: paidBy || undefined,
      reasonForPayment,
      balance: Number(balance),
      // removed: reference and receiptUrl are handled by server
      notes: notes || undefined,
      status,
    };

    const created = await createManualPayment(payload);
    setSaving(false);

    if (created) {
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("paymentsUpdated"));
      onSuccess?.(created);
    } else {
      alert("Failed to record payment. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Tenant
          </label>
          <select
            value={tenantId || ""}
            onChange={(e) => setTenantId(e.target.value || null)}
            className="w-full border border-border rounded px-3 py-2 bg-transparent"
          >
            <option value="">Select tenant</option>
            {tenants.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.unit || t.propertyName || t.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Property
          </label>
          <select
            value={propertyId || ""}
            onChange={(e) => setPropertyId(e.target.value || null)}
            className="w-full border border-border rounded px-3 py-2 bg-transparent"
          >
            <option value="">Select property</option>
            {properties.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Amount
          </label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Paid On
          </label>
          <Input
            value={paidOn}
            onChange={(e) => setPaidOn(e.target.value)}
            type="datetime-local"
          />
        </div>

        <div />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 bg-transparent"
          >
            <option value="manual">Manual</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
            <option value="card">Card</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Payment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 bg-transparent"
          >
            <option value="complete">Complete</option>
            <option value="balance">Balance</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Reason for Payment
          </label>
          <select
            value={reasonForPayment}
            onChange={(e) => setReasonForPayment(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 bg-transparent"
          >
            <option value="rentPayment">Rent Payment</option>
            <option value="securityDeposit">Security Deposit</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Lease Type
          </label>
          <Input
            value={leaseType}
            onChange={(e) => setLeaseType(e.target.value)}
            placeholder="Monthly, annual, etc."
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Paid By
          </label>
          <Input
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            placeholder="Name of payer"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Balance
          </label>
          <Input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* reference and receipt fields removed — handled by backend */}

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Notes
        </label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" type="button" onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
