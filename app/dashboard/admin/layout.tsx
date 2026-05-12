"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Mail,
  Settings,
  LayoutDashboard,
  LogOut,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking admin access...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-6 flex flex-col">
        <Link href="/dashboard" className="mb-8">
          <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
        </Link>

        <nav className="space-y-2 flex-1">
          <Link href="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          <Link href="/dashboard/admin/users">
            <Button
              variant={isActive("/dashboard/admin/users") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
          </Link>

          <Link href="/dashboard/admin/approvals">
            <Button
              variant={
                isActive("/dashboard/admin/approvals") ? "default" : "ghost"
              }
              className="w-full justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approvals
            </Button>
          </Link>

          <Link href="/dashboard/admin/roles">
            <Button
              variant={isActive("/dashboard/admin/roles") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              Roles
            </Button>
          </Link>

          <Link href="/dashboard/admin/invite">
            <Button
              variant={
                isActive("/dashboard/admin/invite") ? "default" : "ghost"
              }
              className="w-full justify-start"
            >
              <Mail className="w-4 h-4 mr-2" />
              Invites
            </Button>
          </Link>

          <Link href="/dashboard/admin/settings">
            <Button
              variant={
                isActive("/dashboard/admin/settings") ? "default" : "ghost"
              }
              className="w-full justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>

        {/* User Info and Logout */}
        <div className="border-t pt-4 space-y-3">
          <div className="text-sm">
            <p className="text-muted-foreground">Logged in as</p>
            <p className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
