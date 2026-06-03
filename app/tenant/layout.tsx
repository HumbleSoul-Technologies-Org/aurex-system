"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CreditCard,
  Wrench,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Bell,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTenantContext } from "@/lib/tenant-context";
import { TenantContextProvider } from "@/lib/tenant-context-provider";
import { fetchMaintenanceRequestsByTenant } from "@/lib/services/maintenance";
import { useTenantPortalFeatures } from "@/lib/hooks/use-tenant-portal-features";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

function TenantLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentTenant, notifications } = useTenantContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [completedMaintenanceCount, setCompletedMaintenanceCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const { user: authUser, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not authenticated -> send to login
      window.location.href = "/auth/login";
      return;
    }
    if (authUser?.role !== "tenant") {
      window.location.href = "/auth/login";
    }
  }, [isAuthenticated, isLoading, authUser]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // compute unread notifications after mount to avoid hydration mismatch
    if (!mounted) return;
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    if (!currentTenant?.id) return;
    (async () => {
      try {
        const list = await fetchMaintenanceRequestsByTenant(currentTenant.id);
        const completed = list.filter((m) => m.status === "completed").length;
        setCompletedMaintenanceCount(completed);
      } catch (e) {
        setCompletedMaintenanceCount(0);
      }
    })();
  }, [mounted, currentTenant?.id]);

  const unreadNotifications = mounted ? unreadCount : 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Tenant logout failed:", error);
    }
    router.push("/auth/login");
  };
  const { features, isLoaded } = useTenantPortalFeatures();
  const paymentEnabled = isLoaded && features.paymentPortal;
  const maintenanceEnabled = isLoaded && features.maintenanceRequests;
  const messagesEnabled = isLoaded && features.messages;

  // Desktop sidebar items (all navigation options)
  const allDesktopNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/tenant",
      icon: <Home className="w-4 h-4" />,
    },
    ...(paymentEnabled
      ? [
          {
            label: "Payments",
            href: "/tenant/payments",
            icon: <CreditCard className="w-4 h-4" />,
          } as NavItem,
        ]
      : []),
    ...(maintenanceEnabled
      ? [
          {
            label: "Report Maintenance",
            href: "/tenant/maintenance",
            icon: <Wrench className="w-4 h-4" />,
            // badge: completedMaintenanceCount,
          } as NavItem,
        ]
      : []),
    ...(messagesEnabled
      ? [
          {
            label: "Messages",
            href: "/tenant/messages",
            icon: <MessageSquare className="w-4 h-4" />,
            badge: unreadNotifications > 0 ? unreadNotifications : undefined,
          } as NavItem,
        ]
      : []),
    {
      label: "Settings",
      href: "/tenant/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const desktopNavItems = allDesktopNavItems;

  // Mobile bottom nav items (5 primary items)
  const allMobileNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/tenant",
      icon: <Home className="w-4 h-4" />,
    },
    ...(maintenanceEnabled
      ? [
          {
            label: "Maintenance",
            href: "/tenant/maintenance",
            icon: <Wrench className="w-4 h-4" />,
            badge: completedMaintenanceCount,
          } as NavItem,
        ]
      : []),
    ...(messagesEnabled
      ? [
          {
            label: "Messages",
            href: "/tenant/messages",
            icon: <MessageSquare className="w-4 h-4" />,
            badge: unreadNotifications > 0 ? unreadNotifications : undefined,
          } as NavItem,
        ]
      : []),
    ...(paymentEnabled
      ? [
          {
            label: "Payments",
            href: "/tenant/payments",
            icon: <CreditCard className="w-4 h-4" />,
          } as NavItem,
        ]
      : []),
    {
      label: "Settings",
      href: "/tenant/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const mobileNavItems = allMobileNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link href="/tenant" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="hidden sm:inline font-bold text-foreground">
                Tenant Portal
              </span>
            </Link>
          </div>

          {/* Right: Notifications + Dark Mode + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-foreground" />
            </button>

            {/* Profile Menu */}
            <button className="flex items-center gap-2 px-2 py-1 hover:bg-secondary rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <img
                  src={`${currentTenant?.avatar?.url}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground">
                  {mounted ? currentTenant?.name || "Tenant" : "Tenant"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Unit {mounted ? currentTenant?.unitNumber || "_ _" : "_ _"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-64px)] md:h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-secondary">
          <nav className="flex-1 p-4 space-y-2">
            {desktopNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border text-foreground bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border text-foreground bg-transparent"
              asChild
            >
              <Link href="/">
                <LogOut className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation items={mobileNavItems} />

      {/* Notifications Sidebar - Right */}
      {notificationsOpen && (
        <div className="fixed right-0 top-16 h-[calc(100vh-64px)] z-40 w-full sm:w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-background">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">Notifications</h2>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 hover:bg-secondary rounded-lg"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2 p-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No notifications
              </p>
            ) : (
              [...notifications]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.actionUrl || "#"}
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <Card
                      className={`p-3 cursor-pointer hover:bg-secondary transition-colors border ${
                        notif.read
                          ? "border-border"
                          : "border-primary bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {!notif.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {notif.title}
                            </p>
                            <Badge className="text-xs whitespace-nowrap">
                              {notif.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notif.date).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  </Link>
                ))
            )}
          </div>
        </div>
      )}

      {/* Overlay for notifications */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantContextProvider>
        <TenantLayoutContent>{children}</TenantLayoutContent>
      </TenantContextProvider>
    </Suspense>
  );
}
