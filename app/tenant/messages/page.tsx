"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createConversationMessage,
  markConversationMessageSeen,
} from "@/lib/services/messages";
import { markAnnouncementRead } from "@/lib/services/announcements";
import { useAuth } from "@/lib/auth-context";
import { useTenantContext } from "@/lib/tenant-context";
import { useFeatureEnabled } from "@/lib/hooks/use-tenant-portal-features";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MessagesSkeleton from "@/components/ui/messages-skeleton";
import { useToast } from "@/hooks/use-toast";
import AnnouncementCard from "@/components/announcement-card";

interface Message {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  toUserName?: string;
  sender: string;
  senderType: "tenant" | "manager";
  content: string;
  timestamp: string;
  isRead: boolean;
  sent?: boolean;
  replied?: boolean;
  subject?: string;
  isStarred?: boolean;
  isArchived?: boolean;
  type?: "message" | "announcement";
  originalId?: string; // _id or id from server
  message?: string;
  sentAt?: string;
  seenBy?: string[];
  replies?: any[];
  category?: string;
  propertyId?: string; // track source property
}

interface AnnouncementUI {
  id: string;
  title?: string;
  message: string;
  sentAt?: string;
  readBy?: string[];
  isRead?: boolean;
  propertyId?: string;
  raw?: any;
}

export default function TenantMessagesPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const { enabled: messagesEnabled, isLoaded: featuresLoaded } =
    useFeatureEnabled("messages");
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "inbox" | "sent" | "starred" | "archived"
  >("inbox");
  const [messageFlags, setMessageFlags] = useState<
    Record<string, { isStarred?: boolean; isArchived?: boolean }>
  >({});

  // quick message input state
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [modalMounted, setModalMounted] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
  const isMobile = useIsMobile();
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  // Drag-to-scroll for filter chips
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const {
    currentTenant,
    currentProperty,
    messages,
    announcements,
    loading,
    loadMessages,
    loadAnnouncements,
  } = useTenantContext();

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

  const getPropertyOwnerId = (property: any) => {
    if (!property) return null;
    return (
      property.owner ||
      property.ownerId ||
      property.owner?._id ||
      property.owner?.id ||
      null
    );
  };

  const getUserReferenceId = (ref: any): string => {
    if (!ref) return "";
    return typeof ref === "string" ? ref : ref.id || ref._id || "";
  };

  const getUserReferenceName = (ref: any): string => {
    if (!ref) return "";
    if (typeof ref === "string") return "";
    return ref.name || ref.email || ref.id || ref._id || "";
  };

  const normalizeRecipientId = (value: any): string => {
    if (!value) return "";
    if (Array.isArray(value)) {
      const first = value.find((item) => !!item);
      return first ? getUserReferenceId(first) : "";
    }
    return getUserReferenceId(value);
  };

  const normalizeTimestamp = (message: any): string => {
    return (
      message.sentAt ||
      message.sent_at ||
      message.createdAt ||
      message.created_at ||
      message.timestamp ||
      message.date ||
      ""
    );
  };

  const normalizeContent = (message: any): string => {
    return message.message || message.content || message.body || "";
  };

  const normalizeReadState = (message: any): boolean => {
    const seenByIds = Array.isArray(message.seenBy)
      ? message.seenBy
          .map((entry: any) => getUserReferenceId(entry))
          .filter(Boolean)
      : [];
    const readByIds = Array.isArray(message.readBy)
      ? message.readBy
          .map((entry: any) => getUserReferenceId(entry))
          .filter(Boolean)
      : [];

    return !!(
      message.isRead ||
      (currentTenant?.id && seenByIds.includes(currentTenant.id)) ||
      (currentTenant?.id && readByIds.includes(currentTenant.id))
    );
  };

  const getPropertyId = (property: any): string => {
    if (!property) return "";
    if (typeof property === "string") return property;
    return property.id || property._id || property.propertyId || "";
  };

  const flattenConversationMessages = (items: any[]): any[] => {
    const output: any[] = [];
    const visit = (item: any) => {
      if (!item) return;
      if (Array.isArray(item)) {
        item.forEach(visit);
        return;
      }

      if (item.conversations && Array.isArray(item.conversations)) {
        item.conversations.forEach((conversation: any) => {
          const propId = getPropertyId(conversation.propertyId);
          if (Array.isArray(conversation.messages)) {
            conversation.messages.forEach((message: any) => {
              output.push({ ...message, _propertyId: propId });
            });
          } else {
            visit(conversation);
          }
        });
        return;
      }

      if (Array.isArray(item.messages)) {
        const propId = getPropertyId(item.propertyId);
        item.messages.forEach((message: any) => {
          output.push({ ...message, _propertyId: propId });
        });
        return;
      }

      if (item.message || item.content || item.category || item.type) {
        output.push(item);
      }
    };

    visit(items);

    return output;
  };

  // Call all hooks BEFORE any conditional early returns
  useEffect(() => {
    if (!currentTenant?.id || !currentProperty?.id) return;
    loadMessages();
  }, [currentTenant?.id, currentProperty?.id, loadMessages]);

  useEffect(() => {
    if (!featuresLoaded) return;
    if (!messagesEnabled) {
      router.replace("/tenant/feature-disabled?feature=messages");
    }
  }, [featuresLoaded, messagesEnabled, router]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowInitialSkeleton(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedId(null);
  }, [filter]);

  // Filter messages - MUST be called before early returns
  const mergedMessages = useMemo(() => {
    const rawMessages = flattenConversationMessages(messages || []);

    const normalizeIncoming = (m: any): Message => {
      const id = m._id || m.id || m.originalId || "";
      const rawFromUserId = getUserReferenceId(m.fromUserId || m.from || "");
      const toUserId = normalizeRecipientId(m.toUserId || m.to);
      const toUserName = getUserReferenceName(m.toUserId || m.to);
      const timestamp = normalizeTimestamp(m);
      const content = normalizeContent(m);
      const category = m.category || m.type || "message";
      const isRead = normalizeReadState(m);
      const ownerId = getPropertyOwnerId(currentProperty);

      const inferredFromTenant =
        !rawFromUserId && ownerId && toUserId === ownerId && currentTenant?.id;
      const inferredFromManager =
        !rawFromUserId && ownerId && toUserId === currentTenant?.id;
      const fromUserId = rawFromUserId
        ? rawFromUserId
        : inferredFromTenant
          ? currentTenant?.id || ""
          : inferredFromManager
            ? ownerId
            : "";

      const isTenantSender = currentTenant
        ? fromUserId === currentTenant.id
        : !!m.sent;
      const senderType: "tenant" | "manager" = isTenantSender
        ? "tenant"
        : "manager";

      return {
        id,
        fromUserId,
        toUserId,
        toUserName,
        timestamp,
        isRead,
        sent: isTenantSender,
        senderType,
        replied: Array.isArray(m.replies) && m.replies.length > 0,
        subject:
          m.subject ||
          (category === "announcement" ? "Announcement" : undefined),
        isStarred: !!m.isStarred,
        isArchived: !!m.isArchived,
        type: category === "announcement" ? "announcement" : "message",
        originalId: id,
        content,
        message: content,
        sentAt: m.sentAt,
        seenBy: Array.isArray(m.seenBy) ? m.seenBy : [],
        replies: Array.isArray(m.replies) ? m.replies : [],
        category,
        propertyId: m._propertyId || "",
      } as Message;
    };

    const tenantMessageShapes: Message[] = rawMessages.map(normalizeIncoming);
    return tenantMessageShapes
      .map((message) => ({
        ...message,
        ...messageFlags[message.id],
      }))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }, [currentTenant?.id, messageFlags, messages]);

  // Derive announcements and conversation messages separately (do not merge shapes)
  const { announcementItems, conversationItems } = useMemo(() => {
    const rawMessages = flattenConversationMessages(messages || []);
    const annMap = new Map<string, AnnouncementUI>();
    const conv: Message[] = [];

    const addAnnouncement = (announcement: AnnouncementUI) => {
      if (!announcement.id) return;
      if (!annMap.has(announcement.id)) {
        annMap.set(announcement.id, announcement);
      }
    };

    announcements?.forEach((m) => {
      const readBy = Array.isArray(m.readBy)
        ? m.readBy
            .map((entry: any) => getUserReferenceId(entry))
            .filter(Boolean)
        : [];

      addAnnouncement({
        id: m.id,
        title: m.title || "Announcement",
        message: m.message || "",
        sentAt: m.sentAt || m.createdAt || "",
        readBy,
        isRead:
          currentTenant?.id && Array.isArray(readBy)
            ? readBy.includes(currentTenant.id)
            : false,
        propertyId: m.propertyId || "",
        raw: m,
      });
    });

    rawMessages.forEach((m: any) => {
      const category = m.category || m.type || "message";
      const propId = m._propertyId || m.propertyId || "";
      if (category === "announcement") {
        const readBy = Array.isArray(m.seenBy)
          ? m.seenBy
              .map((entry: any) => getUserReferenceId(entry))
              .filter(Boolean)
          : Array.isArray(m.readBy)
            ? m.readBy
                .map((entry: any) => getUserReferenceId(entry))
                .filter(Boolean)
            : [];
        addAnnouncement({
          id: m._id || m.id || "",
          title:
            m.subject ||
            m.title ||
            (m.category === "announcement" ? "Announcement" : undefined),
          message: m.message || m.content || "",
          sentAt: m.sentAt || m.sent_at || m.createdAt || "",
          readBy,
          isRead:
            currentTenant?.id && Array.isArray(readBy)
              ? readBy.includes(currentTenant.id)
              : false,
          propertyId: propId,
          raw: m,
        });
      } else {
        // reuse existing normalization used above by finding normalized item
        const normalized = mergedMessages.find(
          (mm) => mm.originalId === (m._id || m.id),
        );
        if (normalized) conv.push(normalized);
      }
    });

    return {
      announcementItems: Array.from(annMap.values()),
      conversationItems: conv,
    };
  }, [messages, mergedMessages, announcements, currentTenant?.id]);

  // Filtered view: apply filters separately then combine for rendering
  const combinedForRender = useMemo(() => {
    const currentId = currentTenant?.id || currentTenant?._id || user?.id;
    const currentPropId = currentProperty?.id || currentProperty?._id || "";

    // filter announcements by property (allow if no propertyId meaning global)
    const filteredAnnouncements = announcementItems.filter((a) => {
      if (!currentPropId) return true;
      if (!a.propertyId) return true; // global announcement
      return a.propertyId === currentPropId;
    });

    // filter conversations using existing rules
    const filteredConversations = conversationItems.filter((m) => {
      const fromId = m.fromUserId || "";
      const toId = normalizeRecipientId(
        (m as any).toUserId || (m as any).to || "",
      );
      const isBroadcastMessage = !toId && m.senderType === "manager";

      if (!currentId) return true;

      const msgPropertyId = m.propertyId || "";
      if (currentPropId && msgPropertyId && msgPropertyId !== currentPropId)
        return false;

      if (filter === "inbox") {
        return isBroadcastMessage || toId === currentId;
      }
      if (filter === "sent") return m.sent === true;

      return true;
    });

    // only include announcements in 'inbox' filter
    const annsToShow = filter === "inbox" ? filteredAnnouncements : [];

    // combine and sort by timestamp
    const combined: Array<{
      kind: "announcement" | "message";
      ts: string;
      data: any;
    }> = [];
    annsToShow.forEach((a) =>
      combined.push({ kind: "announcement", ts: a.sentAt || "", data: a }),
    );
    filteredConversations.forEach((m) =>
      combined.push({
        kind: "message",
        ts: m.timestamp || m.sentAt || "",
        data: m,
      }),
    );

    combined.sort(
      (x, y) => new Date(y.ts).getTime() - new Date(x.ts).getTime(),
    );
    return combined;
  }, [
    announcementItems,
    conversationItems,
    filter,
    currentTenant?.id,
    currentProperty?.id,
  ]);

  // Send message
  const send = async (e?: any) => {
    try {
      if (e?.preventDefault) {
        e.preventDefault();
      }

      if (!messageText.trim()) return;

      setIsSending(true);

      const tenant = currentTenant;
      const prop = currentProperty;
      const ownerId = getPropertyOwnerId(prop);

      if (!tenant?.id || !prop?.id || !ownerId) {
        console.warn("Missing tenant, property, or owner data", {
          tenantId: tenant?.id,
          propertyId: prop,
          ownerId,
        });
        toast({
          title: "Error",
          description: "Unable to determine property or owner",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      // Send message to property owner as admin
      await createConversationMessage(
        ownerId,
        prop.id,
        {
          category: "message",
          fromUserId: tenant.id,
          toUserId: ownerId,
          message: messageText.trim(),
        },
        token,
      );

      setMessageText("");
      toast({
        title: "Success",
        description: "Message sent to management",
      });

      await loadMessages();
      setIsSending(false);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsSending(false);
    }
  };

  // Mark message as read
  const markMessageRead = async (messageId: string) => {
    try {
      const ownerId = getPropertyOwnerId(currentProperty);

      if (!currentTenant?.id || !currentProperty?.id || !ownerId) return;

      await markConversationMessageSeen(
        ownerId,
        currentProperty.id,
        messageId,
        currentTenant.id,
        token,
      );

      await loadMessages();
    } catch (e) {
      console.error("Failed to mark message as read:", e);
    }
  };

  // Early returns - after all hooks have been called
  if (!featuresLoaded) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Loading portal settings...
      </div>
    );
  }

  if (!messagesEnabled) {
    return null;
  }

  const selectedMessageItem =
    mergedMessages.find((m) => m.id === selectedId) ?? null;
  const selectedAnnouncementItem =
    (announcementItems || []).find((a: any) => a.id === selectedId) ?? null;
  const selected = selectedMessageItem || selectedAnnouncementItem || null;
  const isSelectedAnnouncement = selected && !(selected as any).senderType;

  // Get property owner name
  const getPropertyOwnerName = () => {
    return currentProperty?.name || "Management";
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <header className="sticky top-4 z-20 bg-background/60 backdrop-blur-sm rounded-md p-3 sm:p-4 mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Conversation with {getPropertyOwnerName()}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Left: message list + send form */}
        <div
          className={`flex flex-col ${isMobile ? "min-h-[60vh]" : "h-[70vh]"} border border-border rounded-xl overflow-hidden bg-card shadow-sm`}
        >
          {/* Send message form */}
          <div className="p-3 border-b flex items-center gap-2">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Write a quick message..."
              className="flex-1 border border-border rounded-md bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                send();
              }}
              disabled={isSending || !messageText.trim()}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-all"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Filter chips */}
          <div className="p-2 border-b">
            <div
              ref={chipsRef}
              className="flex gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x -mx-2 px-2"
            >
              {[
                ["inbox", "Inbox"],
                ["sent", "Sent"],
                // ["starred", "Starred"],
                // ["archived", "Archived"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isDragging.current) return;
                    setFilter(key as any);
                  }}
                  className={`flex-shrink-0 cursor-pointer px-3 py-1.5 rounded-full text-sm ${
                    filter === key
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {loading.messages && showInitialSkeleton ? (
              <MessagesSkeleton />
            ) : loading.messages && !showInitialSkeleton ? (
              <div className="text-muted-foreground text-center py-8">
                Loading...
              </div>
            ) : null}
            {!loading.messages && combinedForRender.length === 0 && (
              <div className="text-muted-foreground flex flex-col items-center justify-center pt-16 text-center">
                <span>No messages.</span>
                <img
                  src="/no-message2.avif"
                  className="w-32 h-32 mt-4"
                  alt="No messages"
                />
              </div>
            )}
            {combinedForRender.map((entry, idx) => {
              if (entry.kind === "announcement") {
                const a = entry.data as AnnouncementUI;
                return (
                  <div
                    key={a.id || idx}
                    onClick={async () => {
                      setSelectedId(a.id);
                      const tenantId = currentTenant?.id;
                      if (!a.isRead && tenantId) {
                        try {
                          await markAnnouncementRead(
                            a.id,
                            tenantId as string,
                            token ?? undefined,
                          );
                          await loadAnnouncements();
                        } catch (err) {
                          console.error(
                            "Failed to mark announcement read:",
                            err,
                          );
                        }
                      }
                      if (isMobile) setShowDetailsOnMobile(true);
                    }}
                  >
                    <AnnouncementCard announcement={a} />
                  </div>
                );
              }
              const m = entry.data as Message;
              const isMessageRead = Array.isArray(m.seenBy)
                ? m.seenBy
                    .map((entry: any) => getUserReferenceId(entry))
                    .filter(Boolean)
                    .includes(currentTenant?.id ? currentTenant.id : "")
                : false;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isMessageRead && m.senderType === "manager") {
                      markMessageRead(m.originalId || m.id);
                    }
                    setSelectedId(m.id);
                    if (isMobile) setShowDetailsOnMobile(true);
                  }}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedId === m.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : !isMessageRead && m.senderType === "manager"
                        ? "bg-orange-50 border-orange-200 shadow-sm"
                        : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {m.senderType === "manager" ? "Management" : "You"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        To:{" "}
                        {m.toUserName ||
                          (m.toUserId === currentTenant?.id
                            ? "You"
                            : "Management")}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {m.subject || m.content.substring(0, 50)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isMessageRead ? (
                        <MailOpen className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Mail className="w-4 h-4 text-orange-600" />
                      )}
                      {m.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(m.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: message details (desktop) or modal (mobile) */}
        {selected ? (
          <div
            className={`${
              isMobile
                ? `fixed inset-0 z-50 bg-black/50 flex items-end transition-opacity duration-300 ${
                    modalAnimateIn ? "opacity-100" : "opacity-0"
                  }`
                : "flex flex-col border border-border rounded-xl overflow-hidden bg-card shadow-sm"
            }`}
            onClick={() => isMobile && setShowDetailsOnMobile(false)}
          >
            <div
              className={`${isMobile ? "bg-card rounded-t-lg max-h-[90vh]" : ""} flex flex-col h-full`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {isSelectedAnnouncement
                      ? (selected as any).title || "Announcement"
                      : (selected as any).senderType === "manager"
                        ? "Management"
                        : "Your Message"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isSelectedAnnouncement
                      ? new Date(
                          (selected as any).sentAt || "",
                        ).toLocaleString()
                      : new Date((selected as any).timestamp).toLocaleString()}
                  </p>
                </div>
                {isMobile && (
                  <button
                    onClick={() => setShowDetailsOnMobile(false)}
                    className="p-1 hover:bg-secondary rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                {!isSelectedAnnouncement && (
                  <div className="space-y-1 text-xs text-muted-foreground mb-4">
                    <div>
                      From:{" "}
                      {(selected as any).senderType === "manager"
                        ? "Management"
                        : "You"}
                    </div>
                    <div>
                      To:{" "}
                      {(selected as any).toUserName
                        ? (selected as any).toUserName
                        : (selected as any).toUserId === currentTenant?.id
                          ? "You"
                          : "Management"}
                    </div>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm text-foreground">
                  {isSelectedAnnouncement
                    ? (selected as any).message
                    : (selected as any).content}
                </div>
                {!isSelectedAnnouncement && (selected as any).subject && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Subject: {(selected as any).subject}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isSelectedAnnouncement && (
                <div className="p-4 border-t flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!selectedId) return;
                      setMessageFlags((prev) => ({
                        ...prev,
                        [selectedId]: {
                          ...prev[selectedId],
                          isStarred: !prev[selectedId]?.isStarred,
                        },
                      }));
                    }}
                    className="p-2 hover:bg-secondary rounded"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        (selected as any).isStarred
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedId) return;
                      setMessageFlags((prev) => ({
                        ...prev,
                        [selectedId]: {
                          ...prev[selectedId],
                          isArchived: !prev[selectedId]?.isArchived,
                        },
                      }));
                    }}
                    className="p-2 hover:bg-secondary rounded"
                  >
                    <Archive
                      className={`w-4 h-4 ${
                        (selected as any).isArchived
                          ? "fill-muted-foreground text-muted-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-border rounded-xl bg-card">
            <div className="text-center">
              <MailOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Select a message
              </h2>
              <p className="text-muted-foreground">
                Click on a message to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
