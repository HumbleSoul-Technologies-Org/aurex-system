"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import * as authApi from "@/lib/services/authApi";

export default function ProductKeyPage() {
  const search = useSearchParams();
  const router = useRouter();
  const queryEmail = search.get("email") || "";

  const [email, setEmail] = useState(queryEmail);
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !key) {
      setError("Please provide both email and product key");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyProductKey(email, key);
      setInfo("Product key verified. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 900);
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
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-3 p-3 bg-secondary/10 rounded-lg text-sm text-foreground">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product / Demo Key
              </label>
              <Input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
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
