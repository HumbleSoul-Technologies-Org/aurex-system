"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { verifyEmail } from "@/lib/services/authApi";

export function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get("token") || "";

  useEffect(() => {
    setError(null);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    handleVerify();
  }, [token]);

  const handleVerify = async () => {
    if (!token) {
      setError("Verification token is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyEmail(token);
      if (response.success) {
        router.push("/onboarding");
        return;
      }

      setError(response.message || "Verification failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendEmail) {
      setResendMessage("Please enter your email address.");
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      // For now, show a message that resend requires admin assistance
      setResendMessage(
        "Please contact your administrator to resend the verification email.",
      );
    } catch (err) {
      setResendMessage("Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="p-8">
            {/* Logo/Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PM</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  PropManager
                </span>
              </div>
            </div>

            <>
              {/* Message */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Verify your email
                </h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to your email. Click the button
                  below to verify your account.
                </p>
              </div>

              {/* Verification Button */}
              <Button
                onClick={handleVerify}
                disabled={isLoading || !token}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mb-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify my email
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Help Text */}
              <div className="text-center">
                {token ? (
                  <p className="text-xs text-muted-foreground mb-2">
                    If verification still fails, please contact support.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      Enter your email address to resend the verification link.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div>
                        <Label
                          htmlFor="resend-email"
                          className="text-sm font-medium"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="resend-email"
                          type="email"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="mt-1"
                        />
                      </div>
                      {resendMessage && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                          {resendMessage}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleResend}
                      disabled={isResending}
                      variant="outline"
                      className="w-full border-border text-foreground bg-transparent"
                    >
                      {isResending ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Resend verification link
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 PropManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
