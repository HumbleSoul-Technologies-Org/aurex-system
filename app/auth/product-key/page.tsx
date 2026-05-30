// ProductKeyContent.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import * as authApi from "@/lib/services/authApi";

interface ProductKeyContentProps {
  initialEmail: string;
}

export default function ProductKeyContent({
  initialEmail,
}: ProductKeyContentProps) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [productKey, setProductKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setInfo("");

    if (!email.trim() || !productKey.trim()) {
      setError("Please provide both email and product key");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyProductKey(email, productKey);

      setInfo("Product key verified. Redirecting to onboarding...");

      setTimeout(() => {
        router.push("/onboarding");
      }, 900);
    } catch (err: any) {
      setError(err?.message || "Failed to verify product key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Enter Product Key</h1>

          <p className="text-sm text-muted-foreground mb-4">
            Provide the product or demo key to activate your account.
          </p>

          {error && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-3 rounded-lg bg-secondary/10 p-3 text-sm text-foreground">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product / Demo Key
              </label>

              <Input
                type="text"
                value={productKey}
                onChange={(e) => setProductKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Verifying..." : "Verify Key"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
