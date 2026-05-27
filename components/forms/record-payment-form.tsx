"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/lib/data-context";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createManualPayment } from "@/lib/services/payments";
import { formatCurrency } from "@/lib/currency";

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
  const [currency, setCurrency] = useState<string>("USD");
  const [monthlyRent, setMonthlyRent] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("manual");
  const [status, setStatus] = useState<string>("recorded");
  const [reference, setReference] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenantId) {
      const t = tenants.find((x: any) => x.id === tenantId);
      const rent = Number(t?.rentAmount || t?.monthlyRent || 0);
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

    let uploadedReceiptUrl = receiptUrl;
    if (receiptFile) {
      try {
        setUploadingReceipt(true);
        const result = await uploadToCloudinary(receiptFile);
        uploadedReceiptUrl = result.secure_url;
      } catch (err) {
        console.error("Receipt upload failed", err);
        alert("Failed to upload receipt file. Please try again.");
        setSaving(false);
        setUploadingReceipt(false);
        return;
      } finally {
        setUploadingReceipt(false);
      }
    }

    const payload: any = {
      tenantId,
      propertyId,
      amount: Number(amount),
      currency,
      monthlyRent: monthlyRent ?? undefined,
      paymentMethod,
      paymentDate,
      reference: reference || undefined,
      receiptUrl: uploadedReceiptUrl || undefined,
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
            Currency
          </label>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Payment Date
          </label>
          <Input
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            type="datetime-local"
          />
        </div>
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
            <option value="recorded">Recorded</option>
            <option value="confirmed">Confirmed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Monthly Rent (prefill)
          </label>
          <Input
            value={monthlyRent ? String(monthlyRent) : ""}
            onChange={(e) => setMonthlyRent(Number(e.target.value || 0))}
            placeholder="Monthly rent"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Reference
        </label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Receipt Upload
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-muted-foreground"
        />
        {receiptFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {receiptFile.name}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Receipt URL (optional)
        </label>
        <Input
          value={receiptUrl}
          onChange={(e) => setReceiptUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Notes
        </label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {uploadingReceipt && (
        <p className="text-xs text-muted-foreground">Uploading receipt…</p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" type="button" onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploadingReceipt}>
          {saving ? "Saving..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
