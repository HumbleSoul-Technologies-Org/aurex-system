"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import React, { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  ChevronDown,
  BarChart3,
  ItalicIcon as AnalyticsIcon,
  HelpCircle,
  Home,
  MapPin,
} from "lucide-react";
import { getNotifications, markAsRead, getUnreadCount } from "@/lib/services/notifications";
import { getMaintenanceRequests } from "@/lib/services/maintenance";
import { listMessages } from "@/lib/services/messages";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingMaintenanceCount, setPendingMaintenanceCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const user = { name: "Alex Johnson", email: "alex@example.com" };

  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  // Load notifications
  React.useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  // Load maintenance and messages counts
  React.useEffect(() => {
    const maintenanceRequests = getMaintenanceRequests();
    const pendingCount = maintenanceRequests.filter(req => req.status === 'pending').length;
    setPendingMaintenanceCount(pendingCount);

    const messages = listMessages();
    const unreadCount = messages.filter(msg => !msg.seen && msg.from !== 'management').length;
    setUnreadMessagesCount(unreadCount);
  }, []);

  const refreshNotifications = () => {
    setNotifications(getNotifications());
  };

  // Make refreshNotifications available globally for other components
  React.useEffect(() => {
    (window as any).refreshNotifications = refreshNotifications;
    return () => {
      delete (window as any).refreshNotifications;
    };
  }, []);

  React.useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (authUser?.role !== "admin") {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, authUser, router]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const navGroups: Array<{ label?: string; items: NavItem[] }> = [
    {
      label: undefined,
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Property Management",
      items: [
        {
          label: "Properties",
          href: "/dashboard/properties",
          icon: <Building2 className="w-4 h-4" />,
        },
        {
          label: "Tenants",
          href: "/dashboard/tenants",
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Maintenance",
          href: "/dashboard/maintenance",
          icon: <Wrench className="w-4 h-4" />,
          badge: pendingMaintenanceCount,
        },
        {
          label: "Map",
          href: "/dashboard/map",
          icon: <MapPin className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Finances",
      items: [
        {
          label: "Finances",
          href: "/dashboard/finances",
          icon: <DollarSign className="w-4 h-4" />,
          badge: 0,
        },
      ],
    },
    {
      label: "Communications",
      items: [
        {
          label: "Communications",
          href: "/dashboard/communications",
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadMessagesCount,
        },
        // {
        //   label: "Documents",
        //   href: "/dashboard/documents",
        //   icon: <FileText className="w-4 h-4" />,
        // },
      ],
    },
    {
      label: undefined,
      items: [
        // {
        //   label: "Analytics",
        //   href: "/dashboard/analytics",
        //   icon: <BarChart3 className="w-4 h-4" />,
        // },
        {
          label: "Tenant Portal",
          href: "/dashboard/tenant-portal",
          icon: <Home className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          label: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="w-4 h-4" />,
        },
        {
          label: "Help & Support",
          href: "/dashboard/help",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Determine the best matching nav item for the current pathname.
  // We prefer an exact match, otherwise the longest prefix match so deeper routes activate their specific item.
  const flatItems = navGroups.flatMap((g) => g.items);
  const activeHref = flatItems.reduce((best: string, item) => {
    if (!pathname) return best;
    if (pathname === item.href) return item.href;
    if (
      pathname.startsWith(item.href) &&
      item.href.length > (best?.length || 0)
    )
      return item.href;
    return best;
  }, "");

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen bg-background text-foreground">
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform z-30 md:z-0 ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold">
                    PM
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sidebar-foreground">
                    PropManager
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    Property Management
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              {navGroups.map((group, gi) => (
                <div key={gi} className="mb-4">
                  {group.label && (
                    <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                      {group.label}
                    </div>
                  )}
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isActive = item.href === activeHref;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <span
                            className={`${isActive ? "text-accent-foreground" : "text-sidebar-foreground/70"} group-hover:text-sidebar-accent-foreground`}
                          >
                            {item.icon}
                          </span>
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          {/* {item?.badge > 0 && (
                            <span className="px-2 py-1 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full">
                              {item.badge}
                            </span>
                          )} */}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-sidebar-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <header className="bg-card border-b border-border h-16 flex items-center px-4 md:px-6 gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-secondary rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex items-center flex-1 gap-2 bg-secondary rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search properties, tenants..."
                  className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4 ml-auto">
                {/* Notifications */}
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* User Menu */}
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0] ?? "U"}
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-4 md:p-6">{children}</div>
            </main>
          </div>

          {/* Notifications Sidebar - Right */}
          {notificationsOpen && (
            <>
              {/* Desktop sidebar */}
              <div className="hidden md:fixed md:right-0 md:top-16 md:h-[calc(100vh-64px)] md:w-80 md:border-l md:border-border md:bg-background md:flex md:flex-col md:z-40 md:shadow-lg">
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
                <div className="flex-1 overflow-y-auto space-y-2 p-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.actionUrl}
                        onClick={() => {
                          if (!notif.read) {
                            markAsRead(notif.id);
                            setNotifications(prev => prev.map(n => 
                              n.id === notif.id ? { ...n, read: true } : n
                            ));
                          }
                          setNotificationsOpen(false);
                        }}
                      >
                        <Card
                          className={`p-3 cursor-pointer mt-1 mb-1 hover:bg-secondary transition-colors border ${
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
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                                  {notif.type}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notif.date).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Mobile overlay */}
              <div className="md:hidden fixed right-0 top-16 h-[calc(100vh-64px)] z-40 w-full sm:w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
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
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.actionUrl}
                        onClick={() => {
                          if (!notif.read) {
                            markAsRead(notif.id);
                            setNotifications(prev => prev.map(n => 
                              n.id === notif.id ? { ...n, read: true } : n
                            ));
                          }
                          setNotificationsOpen(false);
                        }}
                      >
                        <Card
                          className={`p-3 cursor-pointer mt-1 mb-1 hover:bg-secondary transition-colors border ${
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
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                                  {notif.type}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notif.date).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-black/20 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
            </>
          )}
        </div>
      </Suspense>
    </div>
  );
}
