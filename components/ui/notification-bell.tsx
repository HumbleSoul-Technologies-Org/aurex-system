"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X } from "lucide-react";
import {
  fetchNotifications,
  hideNotification,
  markNotificationRead,
} from "@/app/lib/notifications-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function NotificationBell({ tenantId }: { tenantId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetchNotifications(tenantId, undefined, undefined, token).then((list) => {
      if (!mounted) return;
      setNotifications(list);
    });
    return () => {
      mounted = false;
    };
  }, [tenantId, token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = async () => {
    const list = await fetchNotifications(
      tenantId,
      undefined,
      undefined,
      token,
    );
    setNotifications(list);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id, token);
    refresh();
  };

  const handleNavigate = async (notification: any) => {
    if (!notification?.read) {
      await markNotificationRead(notification.id, token);
    }
    if (notification?.actionUrl) {
      router.push(notification.actionUrl);
    }
    setOpen(false);
  };

  const handleHide = async (id: string) => {
    await hideNotification(id, tenantId || "", token);
    refresh();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => {
          setOpen(!open);
          if (!open) refresh();
        }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-red-600 text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-2 max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground">No notifications</p>
            )}
            {[...notifications]
              .sort(
                (a, b) =>
                  new Date(b.createdAt || b.date).getTime() -
                  new Date(a.createdAt || a.date).getTime(),
              )
              .map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigate(n)}
                  className={`flex justify-between items-start p-2 border-b last:border-b-0 cursor-pointer transition-colors ${
                    n.read
                      ? "border-border bg-card"
                      : "border-primary bg-primary/5"
                  } hover:bg-secondary`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                      )}
                      <p className="font-medium text-foreground">{n.title}</p>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        {n.category || n.type || "general"}
                      </span>
                    </div>
                    {(n.body || n.message) && (
                      <p className="text-sm text-muted-foreground">
                        {n.body || n.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt || n.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-2">
                    {!n.read && (
                      <button
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        aria-label="Mark read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {tenantId && (
                      <button
                        className="text-sm text-muted-foreground hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleHide(n.id);
                        }}
                        aria-label="Hide notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="p-2 border-t border-border flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
