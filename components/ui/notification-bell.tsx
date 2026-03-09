'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { fetchNotifications, markNotificationRead } from '@/app/lib/notifications-client'
import { Button } from '@/components/ui/button'

export default function NotificationBell({ tenantId }: { tenantId?: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetchNotifications(tenantId).then((list) => {
      if (!mounted) return
      setNotifications(list)
    })
    return () => { mounted = false }
  }, [tenantId])

  const unreadCount = notifications.filter((n) => !n.read).length

  const refresh = async () => {
    const list = await fetchNotifications(tenantId)
    setNotifications(list)
  }

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    refresh()
  }

  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => { setOpen(!open); if (!open) refresh() }}>
        <Bell />
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-red-600 text-white">{unreadCount}</span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-2 max-h-64 overflow-auto">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications</p>}
            {notifications.map((n) => (
            {[...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((n) => (
                <div>
                  <p className="font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!n.read && <button className="text-sm text-primary" onClick={() => handleMarkRead(n.id)} aria-label="Mark read"><Check /></button>}
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
  )
}
