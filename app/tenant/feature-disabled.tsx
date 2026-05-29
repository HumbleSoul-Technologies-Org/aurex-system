"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";

const FEATURE_NAMES: Record<string, string> = {
  payments: "Payments",
  "make-payment": "Make Payment",
  maintenance: "Maintenance Requests",
  messages: "Messages",
  documents: "Documents",
  announcements: "Announcements",
  "lease-info": "Lease Information",
  "eviction-notice": "Eviction Notice",
};

export default function FeatureDisabledPage() {
  const searchParams = useSearchParams();
  const featureName = searchParams.get("feature") || "Feature";
  const displayName = FEATURE_NAMES[featureName] || featureName;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50" />
            <div className="relative bg-red-50 p-4 rounded-full border border-red-200">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Feature Not Available
            </h1>
            <p className="text-muted-foreground">
              {displayName} is currently disabled in your tenant portal.
            </p>
          </div>

          {/* Description */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                This feature has been disabled by your property manager. If you
                believe this is an error, please contact support.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full pt-4">
            <Link href="/tenant" className="block">
              <Button className="w-full bg-primary text-white hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
