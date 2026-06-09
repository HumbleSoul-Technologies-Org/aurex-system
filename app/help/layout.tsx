"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Users,
  DollarSign,
  Wrench,
  FileText,
  HelpCircle,
} from "lucide-react";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/help", label: "Help Center", icon: HelpCircle },
    { href: "/help/admin", label: "Admin Guide", icon: BookOpen },
    { href: "/help/tenant", label: "Tenant Guide", icon: Users },
    { href: "/help/docs/finance", label: "Finance", icon: DollarSign },
    { href: "/help/docs/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/help/docs/USER_GUIDE", label: "Getting Started", icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === "/help") return pathname === "/help";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-lg text-foreground">Help Center</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-0 md:gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-0 top-16 md:top-0 z-30 w-64 md:w-56 ${
            sidebarOpen ? "block" : "hidden md:block"
          } bg-background md:sticky md:h-screen md:top-0 border-r border-border md:border-r`}
        >
          <nav className="space-y-1 p-4 overflow-y-auto h-full">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Documentation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 md:py-8 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
