"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  listMessages,
  createMessage,
  markMessageSeen,
  MessageRecord,
} from "@/lib/services/messages";
import {
  listAnnouncements,
  markAnnouncementRead,
} from "@/lib/services/announcements";
import { listTenants } from "@/lib/services/tenants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  User,
  Star,
  Archive,
  Mail,
  MailOpen,
  ArrowLeft,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Reply = { repliedOn: string | null; reply: string | null };

// align with dashboard communications message schema
// duplicates the interface defined there for consistency
// fields are minimal and shared between tenant and management views
interface Message {
  id: string;
  sender: string;
  senderType: "tenant" | "manager";
  content: string;
  timestamp: string;
  isRead: boolean;
  sent?: boolean; // true if authored by current user
  replied?: boolean; // true if there is a reply record
  subject?: string; // optional subject field
  isStarred?: boolean;
  isArchived?: boolean;
  type?: "message" | "announcement";
}

export default function TenantMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "inbox" | "sent" | "starred" | "archived"
  >("inbox");

  // quick message input state
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);

  // quick‑send input state remains in `text`

  useEffect(() => {
    if (showDetailsOnMobile) {
      setModalMounted(true);
      // trigger animation on next frame
      requestAnimationFrame(() => setModalAnimateIn(true));
    } else if (modalMounted) {
      // trigger exit animation, then unmount
      setModalAnimateIn(false);
      const t = setTimeout(() => setModalMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [showDetailsOnMobile]);

  // Filter chips drag-to-scroll
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    let pointerDown = false;
    const onPointerDown = (e: PointerEvent) => {
      pointerDown = true;
      startX.current = e.clientX;
      scrollLeft.current = el.scrollLeft;
      isDragging.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return;
      const dx = e.clientX - startX.current;
      if (!isDragging.current && Math.abs(dx) > 6) {
        isDragging.current = true;
      }
      if (isDragging.current) {
        el.scrollLeft = scrollLeft.current - dx;
        e.preventDefault();
      }
    };

    const onPointerUp = () => {
      pointerDown = false;
      // leave isDragging state for one tick so click handlers can check it
      setTimeout(() => (isDragging.current = false), 0);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Get messages from database scoped to this user
      // only keep messages where the current user is either sender or recipient
      const dbMessages = listMessages().filter(
        (msg) => msg.from === user?.email || msg.to === user?.email,
      );

      // Get tenant record for announcements
      const tenant = listTenants().find((t) => t.email === user?.email);
      const tenantId = tenant?.id;

      // Get announcements for this tenant
      const tenantAnnouncements = listAnnouncements()
        .filter((ann) => {
          if (ann.recipients === "all") return true;
          return tenantId && ann.tenantIds.includes(tenantId);
        })
        .map((ann) => ({
          id: ann.id,
          sender: "management",
          senderType: "manager" as const,
          content: ann.message,
          timestamp: ann.sentAt || ann.createdAt,
          isRead: tenantId ? ann.readBy.includes(tenantId) : false,
          sent: false,
          replied: false,
          subject: ann.title,
          isStarred: false,
          isArchived: false,
          type: "announcement" as const,
        }));

      // Map to local Message type using shared schema
      const tenantMessages = dbMessages.map(
        (msg): Message => ({
          id: msg.id,
          sender: msg.from,
          senderType: msg.from === "management" ? "manager" : "tenant",
          content: msg.message,
          timestamp: msg.createdAt,
          isRead: !!msg.seen,
          sent: msg.from === user?.email,
          replied: !!msg.replyId,
          subject: msg.subject || undefined,
          isStarred: false,
          isArchived: false,
          type: "message",
        }),
      );

      // Combine messages and announcements
      const allItems = [...tenantMessages, ...tenantAnnouncements];

      // Sort by date
      const sorted = allItems.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      setMessages(sorted);
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  // reset selection when filter changes so details pane only shows items in current view
  useEffect(() => {
    setSelectedId(null);
  }, [filter]);

  // send immediately using quick message field
  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      // all metadata hard-coded; only `message` is dynamic
      // `from` uses current user's email for tracking
      const newMsg = createMessage({
        from: user?.name || "tenant",
        to: "You", // manager's inbox uses 'You'
        message: messageText.trim(),
        seen: false,
      });

      setMessageText("");
      await fetchMessages();
      setSelectedId(newMsg.id);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const simulateManagementMessage = async () => {
    // Create a management message in database (for testing)
    try {
      const newMsg = createMessage({
        from: "management",
        to: user?.name || "tenant",
        message: "Message from management",
        subject: "Notice",
      });
      // Refresh messages from database
      await fetchMessages();
      setSelectedId(newMsg.id);
    } catch (err) {
      console.error("Failed to create management message:", err);
    }
  };

  // Derived list after applying filter
  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === "inbox") {
        // messages received from management (including announcements)
        return m.senderType === "manager";
      }
      if (filter === "sent") {
        // messages sent by tenant
        return m.senderType === "tenant";
      }
      if (filter === "starred") return !!m.isStarred;
      if (filter === "archived") return !!m.isArchived;
      return true;
    });
  }, [messages, filter]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <header className="sticky top-4 z-20 bg-background/60 backdrop-blur-sm rounded-md p-3 sm:p-4 mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Conversation with management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={simulateManagementMessage}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
          >
            <Mail className="w-4 h-4" /> Simulate
          </button>
          <button
            onClick={simulateManagementMessage}
            className="hidden items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm sm:inline-flex"
          >
            <Mail className="w-4 h-4" /> Test
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Left: message list + send form */}
        {/* On small screens show list or details depending on selection */}
        <div
          className={`flex flex-col ${isMobile ? "min-h-[60vh]" : "h-[70vh]"} border rounded-md overflow-hidden bg-white`}
        >
          <div className="p-3 border-b flex items-center gap-2">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write a quick message..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={send}
              disabled={isSending}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 border-b">
            <div
              ref={chipsRef}
              className="flex gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x -mx-2 px-2"
            >
              {[
                ["inbox", "Inbox"],
                ["sent", "Sent"],
                ["starred", "Starred"],
                ["archived", "Archived"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isDragging.current) return;
                    setFilter(key as any);
                  }}
                  className={`flex-shrink-0 cursor-pointer px-3 py-1.5 rounded-full text-sm ${filter === key ? "bg-primary text-white" : "bg-gray-100 text-sm"} animate-[--tw-duration:200ms]`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {loading && <div className="text-gray-500">Loading...</div>}
            {!loading && filtered.length === 0 && (
              <div className="text-gray-500 flex-1 flex relative w-full pt-[50%] items-center justify-center text-center">
                <span>
                  No messages.
                  <img
                    src="/no-message2.avif"
                    className="w-34 h-34"
                    alt="No messages"
                  />
                </span>
              </div>
            )}
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  if (m.senderType === "manager" && !m.isRead) {
                    if (m.type === "announcement") {
                      const tenant = listTenants().find(
                        (t) => t.email === user?.email,
                      );
                      if (tenant) markAnnouncementRead(m.id, tenant.id);
                    } else {
                      markMessageSeen(m.id);
                    }
                  }
                  setMessages((prev) =>
                    prev.map((x) =>
                      x.id === m.id ? { ...x, isRead: true } : x,
                    ),
                  );
                  setSelectedId(m.id);
                  if (isMobile) setShowDetailsOnMobile(true);
                }}
                className={`w-full cursor-pointer p-3 rounded-lg shadow-sm border flex items-start gap-3 transition-all motion-safe:animate-fade-in ${
                  m.id === selectedId
                    ? "bg-primary/5 border-primary"
                    : "bg-white"
                } ${
                  !m.isRead
                    ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                    : "hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    !m.isRead ? "text-blue-600" : "text-muted-foreground"
                  }`}
                >
                  {!m.isRead ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <MailOpen className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`text-sm truncate ${
                        !m.isRead
                          ? "font-semibold text-foreground"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {m.senderType === "manager" ? "Management" : "You"}
                    </div>
                    <div
                      className={`text-xs whitespace-nowrap ${
                        !m.isRead
                          ? "text-blue-600 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div
                    className={`text-sm mt-1 line-clamp-2 ${
                      !m.isRead
                        ? "text-gray-700 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: details pane */}
        <div
          className={`border rounded-md p-4 ${isMobile ? "min-h-[60vh]" : "h-[70vh]"} overflow-auto bg-white ${isMobile ? "hidden" : ""}`}
        >
          {isMobile && showDetailsOnMobile && (
            <div className="mb-3">
              <button
                onClick={() => setShowDetailsOnMobile(false)}
                className="p-2 rounded-md bg-gray-100 text-sm inline-flex items-center justify-center"
                aria-label="Close message"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          )}
          {!selected && (
            <div className="text-muted-foreground flex-1 flex flex-col items-center justify-center gap-3">
              Select a message to view details.
              <MailOpen className="w-10 h-10" />
            </div>
          )}
          {selected && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {selected.senderType === "manager" ? "Management" : "You"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selected.senderType === "manager"
                        ? "management@company.com"
                        : user?.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-md bg-gray-100">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="px-2 py-1 rounded-md bg-gray-100">
                    <Archive className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selected.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selected.subject && (
                  <div>
                    <div className="font-medium">Subject</div>
                    <div className="text-sm">{selected.subject}</div>
                  </div>
                )}

                <div>
                  <div className="font-medium">Message</div>
                  <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50 mt-2">
                    {selected.content}
                  </div>
                </div>

                {selected.replied && (
                  <div>
                    <div className="font-medium">Reply</div>
                    <div className="flex justify-end mt-2">
                      <div className="whitespace-pre-wrap text-sm text-gray-800 p-3 rounded-md border bg-blue-50 max-w-[80%] text-right">
                        (see reply)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Mobile modal for details */}
        {isMobile && modalMounted && selected && (
          <div className="fixed shadow-md inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none border-t-2 border-primary">
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${modalAnimateIn ? "opacity-100 pointer-events-auto" : "opacity-0"}`}
              onClick={() => setShowDetailsOnMobile(false)}
            />
            <div
              className={`relative w-full h-[85vh] sm:h-[80vh] bg-white rounded-t-xl sm:rounded-xl shadow-lg overflow-auto p-4 transform transition-all duration-300 ${modalAnimateIn ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-6 scale-95"}`}
            >
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => setShowDetailsOnMobile(false)}
                  className="p-2 rounded-md bg-gray-100 text-sm inline-flex items-center justify-center"
                  aria-label="Close message"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {selected.senderType === "manager" ? "Management" : "You"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selected.senderType === "manager"
                        ? "management@company.com"
                        : user?.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-md bg-gray-100">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="px-2 py-1 rounded-md bg-gray-100">
                    <Archive className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selected.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selected.subject && (
                  <div>
                    <div className="font-medium">Subject</div>
                    <div className="text-sm">{selected.subject}</div>
                  </div>
                )}

                <div>
                  <div className="font-medium">Message</div>
                  <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50 mt-2">
                    {selected.content}
                  </div>
                </div>

                {selected.replied && (
                  <div>
                    <div className="font-medium">Reply</div>
                    <div className="flex justify-end mt-2">
                      <div className="whitespace-pre-wrap text-sm text-gray-800 p-3 rounded-md border bg-blue-50 max-w-[80%] text-right">
                        (see reply)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
