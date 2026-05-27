"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RecordPaymentForm from "@/components/forms/record-payment-form";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId?: string | null;
  propertyId?: string | null;
};

export default function RecordPaymentModal({
  open,
  onOpenChange,
  tenantId,
  propertyId,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Add a landlord-recorded payment for a tenant.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <RecordPaymentForm
            tenantId={tenantId}
            propertyId={propertyId}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
