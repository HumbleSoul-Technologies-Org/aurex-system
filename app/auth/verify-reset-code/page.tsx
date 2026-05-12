"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function VerifyResetCodePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/forgot-password");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="p-8">
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

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Password reset updated
              </h1>
              <p className="text-sm text-muted-foreground">
                The code-based reset flow is no longer used. Please request a
                password reset link instead.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm"
              >
                Request reset link
              </Link>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 PropManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
