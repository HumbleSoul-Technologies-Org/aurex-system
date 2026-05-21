"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InviteTenantForm from "@/components/forms/invite-tenant-form";
import { validateTenantInvite } from "@/lib/services/tenant-invites";
import { useAppData } from "@/lib/data-context";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const { properties } = useAppData();
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");
    setToken(token || "");
    if (!token) {
      setError("No invite token provided");
      setIsValidating(false);
      return;
    }

    const validateInvite = async () => {
      try {
        const validation = await validateTenantInvite(token);
        if (!validation.valid) {
          setError(validation.error || "Invalid invite");
          setIsValidating(false);
          return;
        }

        const inviteData = validation.invite;
        if (!inviteData?.propertyId) {
          setError("Invalid invite payload.");
          setIsValidating(false);
          return;
        }

        const prop = properties.find(
          (item) => item.id === inviteData.propertyId,
        );
        if (!prop) {
          setError("The invited property is not available.");
          setIsValidating(false);
          return;
        }

        setInvite(inviteData);
        setProperty(prop);
        setIsValid(true);
        setIsValidating(false);
      } catch (err: any) {
        setError(err?.message || "Failed to validate invite");
        setIsValidating(false);
      }
    };

    validateInvite();
  }, [properties]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating invite...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isValid || !invite || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Invalid Invite
              </h2>
              <p className="text-muted-foreground mb-4">
                {error || "This invite link is not valid or has expired."}
              </p>
            </div>
            <Button asChild>
              <Link href="/auth/login" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join {property.name}
          </h1>
          <p className="text-muted-foreground">
            Complete your tenant registration to get started
          </p>
          {invite.email && (
            <p className="text-sm text-primary mt-2">
              Invited email: {invite.email}
            </p>
          )}
          {invite.unitNumber && (
            <p className="text-sm text-primary mt-2">
              Unit: {invite.unitNumber}
            </p>
          )}
        </div>

        <InviteTenantForm
          invite={invite}
          property={property}
          onSuccess={() => {
            router.push("/auth/invite-submitted");
          }}
        />
      </Card>
    </div>
  );
}
