"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Check, Loader2 } from "lucide-react";
import { createTenantInvite } from "@/lib/services/tenant-invites";

interface PropertyInviteDialogProps {
  property: {
    id: string;
    name: string;
    units?: Array<{ unitNumber: string } | string>;
    tenants?: Array<{ unitNumber?: string }>;
  };
  createdBy?: string;
  onInviteGenerated?: (url: string) => void;
  token: string;
}

export default function PropertyInviteDialog({
  property,
  createdBy = "admin",
  onInviteGenerated,
  token,
}: PropertyInviteDialogProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUnit, setInviteUnit] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  type UnitOption = {
    unitNumber: string;
    occupied: boolean;
  };

  const availableUnits: UnitOption[] = (property.units || [])
    .map((unit): UnitOption => {
      const unitNumber =
        typeof unit === "string" ? unit : unit?.unitNumber || "";
      const occupied = !!property.tenants?.some(
        (tenant) => tenant.unitNumber === unitNumber,
      );
      return { unitNumber, occupied };
    })
    .filter((unit) => unit.unitNumber);

  const freeUnits = availableUnits.filter((unit) => !unit.occupied);
  const occupiedCount = availableUnits.filter((unit) => unit.occupied).length;

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const result = await createTenantInvite(
        {
          propertyId: property.id,
          unitNumber: inviteUnit || undefined,
          email: inviteEmail || undefined,
          createdBy,
          notes: `Invite for property ${property.name}`,
        },
        token,
      );

      if (!result || !result.invite) {
        throw new Error((result as any)?.error || "Failed to create invite");
      }

      const inviteUrl =
        (result && (result.invite.inviteUrl as string)) ||
        `${window.location.origin}/auth/invite?token=${(result.invite && result.invite.token) || ""}`;
    
      setGeneratedInviteLink(inviteUrl);
      setCopied(false);
      onInviteGenerated?.(inviteUrl);
    } catch (err: any) {
      console.error("Failed to generate invite:", err);
      alert(`Error generating invite: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedInviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  return (
    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Generate an Invite Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Tenant Invite Link</DialogTitle>
          <DialogDescription>
            Create a secure link for tenants to sign up for this property.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          
          <div>
            
            <label className="text-sm font-medium">
              
              Unit Number (optional)
            </label>
            <Select value={inviteUnit} onValueChange={setInviteUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.length > 0 ? (
                  availableUnits.map((unit) => (
                    <SelectItem
                      key={unit.unitNumber}
                      value={unit.unitNumber}
                      disabled={unit.occupied}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>Unit {unit.unitNumber}</span>
                        {unit.occupied && (
                          <span className="rounded-full bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5">
                            Occupied
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__no_units" disabled>
                    No units available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {occupiedCount > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {occupiedCount} occupied unit{occupiedCount > 1 ? "s" : ""} are
                shown but disabled.
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">
              Expected Email (optional)
            </label>
            <Input
              type="email"
              placeholder="tenant@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          {generatedInviteLink && (
            <div>
              <label className="text-sm font-medium">Invite Link</label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Copy this link and send it directly to the tenant so they can
                register using the invited property and unit.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input value={generatedInviteLink} readOnly />
                  <Button size="sm" onClick={copyInviteLink}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">
                    Link copied to clipboard.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateInvite} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
