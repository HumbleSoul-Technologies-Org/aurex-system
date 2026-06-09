"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "security_guard") {
      router.push("/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "security_guard") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          Loading security guard access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
