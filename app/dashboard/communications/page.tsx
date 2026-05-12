"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import SendAnnouncementForm, {
  AnnouncementFormData,
} from "@/components/forms/send-announcement-form";
import {
  listMessages,
  createMessage,
  deleteMessage,
  createReply,
  listReplies,
  markMessageSeen,
  MessageRecord,
} from "@/lib/services/messages";
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  AnnouncementRecord,
} from "@/lib/services/announcements";
import { listProperties } from "@/lib/services/properties";
import { listTenants } from "@/lib/services/tenants";
import {
  MessageSquare,
  Plus,
  Send,
  Bell,
  Archive,
  Paperclip,
  Search,
  Check,
  Eye,
  User,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  senderType: "tenant" | "manager";
  content: string;
  timestamp: string;
  isRead: boolean;
  sent?: boolean; // whether the message was sent by the current user
  replied?: boolean; // whether this message has been replied to
}

interface Conversation {
  id: string;
  participant: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

interface AnnouncementTemplate {
  id: string;
  title: string;
  description: string;
  data: Partial<AnnouncementFormData>;
}

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [selectedAnnouncementForViews, setSelectedAnnouncementForViews] =
    useState<string | null>(null);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcementTemplate, setAnnouncementTemplate] =
    useState<Partial<AnnouncementFormData> | null>(null);
  const [messagesData, setMessagesData] = useState<MessageRecord[]>(() =>
    listMessages(),
  );
  const [announcementsData, setAnnouncementsData] = useState<
    AnnouncementRecord[]
  >([]);

  const announcementTemplates: AnnouncementTemplate[] = [
    {
      id: "rent-reminder",
      title: "Rent Reminder",
      description: "Standard message reminder for upcoming rent payment",
      data: {
        title: "Rent Reminder",
        message:
          "Dear tenant,\n\nThis is a friendly reminder that your rent payment of $[amount] is due on [due_date]. Please ensure payment is made by the due date to avoid any late fees.\n\nIf you have already made the payment, please disregard this message.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nProperty Management Team",
        priority: "normal",
      },
    },
    {
      id: "maintenance-notice",
      title: "Maintenance Notice",
      description: "Template for scheduled maintenance updates",
      data: {
        title: "Scheduled Maintenance",
        message:
          "Dear tenants,\n\nWe will be conducting scheduled maintenance on [date] from [start_time] to [end_time]. During this time, there may be [describe any disruptions, e.g., water outage, noise, etc.].\n\nWe apologize for any inconvenience this may cause and appreciate your understanding.\n\nIf you have any questions, please contact us at [contact_info].\n\nThank you,\nProperty Management Team",
        priority: "normal",
      },
    },
    {
      id: "lease-renewal",
      title: "Lease Renewal",
      description: "Notice about upcoming lease renewal",
      data: {
        title: "Lease Renewal Notice",
        message:
          "Dear tenant,\n\nYour current lease is set to expire on [expiration_date]. We would like to discuss the possibility of renewing your lease.\n\nPlease contact us at your earliest convenience to discuss renewal terms and any changes you would like to make.\n\nWe value you as a tenant and hope to continue our partnership.\n\nBest regards,\nProperty Management Team",
        priority: "normal",
      },
    },
    {
      id: "eviction-notice",
      title: "Eviction Notice",
      description: "Formal notice for lease violations",
      data: {
        title: "Eviction Notice",
        message:
          "Dear tenant,\n\nThis letter serves as formal notice that due to [reason for eviction, e.g., non-payment of rent, lease violations], your tenancy at [property_address] will be terminated effective [termination_date].\n\nYou have [number] days to vacate the premises. Failure to do so may result in legal action.\n\nPlease contact us immediately to discuss this matter.\n\nSincerely,\nProperty Management Team",
        priority: "urgent",
      },
    },
    {
      id: "community-event",
      title: "Community Event",
      description: "Announcement for community gatherings",
      data: {
        title: "Community Event",
        message:
          "Dear tenants,\n\nWe are excited to announce a community event: [event_name] on [date] at [time] in [location].\n\n[Brief description of the event and what to expect]\n\nWe hope to see you there! This is a great opportunity to meet your neighbors and enjoy some community spirit.\n\nRSVP by [rsvp_date] to [contact_info].\n\nBest regards,\nProperty Management Team",
        priority: "low",
      },
    },
    {
      id: "policy-update",
      title: "Policy Update",
      description: "Changes to property policies or rules",
      data: {
        title: "Policy Update",
        message:
          "Dear tenants,\n\nWe are updating our property policies effective [effective_date]. The following changes will be implemented:\n\n[Describe the policy changes clearly]\n\nThese changes are designed to [explain the purpose/benefit of the changes].\n\nIf you have any questions or concerns, please contact us.\n\nThank you for your understanding and cooperation.\n\nSincerely,\nProperty Management Team",
        priority: "normal",
      },
    },
    {
      id: "holiday-notice",
      title: "Holiday Notice",
      description: "Information about holiday schedules",
      data: {
        title: "Holiday Notice",
        message:
          "Dear tenants,\n\nPlease be advised that our office will be closed on [holiday_dates] in observance of [holiday_name].\n\nDuring this time, emergency maintenance requests can be reported to [emergency_contact].\n\nNormal business hours will resume on [return_date].\n\nWe wish you a happy holiday season!\n\nBest regards,\nProperty Management Team",
        priority: "low",
      },
    },
    {
      id: "utility-update",
      title: "Utility Update",
      description: "Information about utility changes",
      data: {
        title: "Utility Update",
        message:
          "Dear tenants,\n\nWe wanted to inform you about upcoming changes to utility services:\n\n[Describe the utility changes, e.g., rate increases, service interruptions, new providers]\n\nThese changes will take effect on [effective_date].\n\nIf you have any questions about how this affects your tenancy, please contact us.\n\nThank you,\nProperty Management Team",
        priority: "normal",
      },
    },
    {
      id: "security-alert",
      title: "Security Alert",
      description: "Important security information",
      data: {
        title: "Security Alert",
        message:
          "Dear tenants,\n\nFor your safety and security, we wanted to inform you about [describe the security concern or incident].\n\n[Provide specific details and any safety instructions]\n\nPlease take the following precautions:\n- [List safety measures]\n\nIf you notice anything suspicious, please contact [security_contact] immediately.\n\nYour safety is our top priority.\n\nSincerely,\nProperty Management Team",
        priority: "urgent",
      },
    },
    {
      id: "general-announcement",
      title: "General Announcement",
      description: "Blank template for custom announcements",
      data: {
        title: "General Announcement",
        message:
          "Dear tenants,\n\n[Your message here]\n\nBest regards,\nProperty Management Team",
        priority: "normal",
      },
    },
  ];

  useEffect(() => {
    setAnnouncementsData(listAnnouncements());
  }, []);

  // new message dialog state
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendPropertyId, setSendPropertyId] = useState("");
  const [sendTenantId, setSendTenantId] = useState("");
  const [sendMessageText, setSendMessageText] = useState("");
  const [isSendingNew, setIsSendingNew] = useState(false);

  const properties = useMemo(() => listProperties(), []);
  const tenantsForSelected = useMemo(
    () =>
      sendPropertyId
        ? listTenants().filter((t) => t.propertyId === sendPropertyId)
        : [],
    [sendPropertyId],
  );

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // derive counts for each tab to display total items
  const inboxCount = useMemo(
    () =>
      messagesData.filter(
        (msg) => msg.to === "You" && msg.from !== "management",
      ).length,
    [messagesData],
  );
  const sentCount = useMemo(
    () => messagesData.filter((msg) => msg.from === "management").length,
    [messagesData],
  );
  const repliedCount = useMemo(
    () => messagesData.filter((msg) => msg.replyId).length,
    [messagesData],
  );

  const conversations: Conversation[] = useMemo(() => {
    let filteredMessages = messagesData;
    if (activeTab === "inbox") {
      filteredMessages = messagesData.filter(
        (msg) => msg.to === "You" && msg.from !== "management",
      );
    } else if (activeTab === "sent") {
      filteredMessages = messagesData.filter(
        (msg) => msg.from === "management",
      );
    } else if (activeTab === "replied") {
      filteredMessages = messagesData.filter((msg) => msg.replyId);
    }
    const map = new Map<string, Conversation>();
    filteredMessages.forEach((msg) => {
      const other = msg.from === "management" ? msg.to : msg.from;
      if (!other) return;
      let conv = map.get(other);
      if (!conv) {
        conv = {
          id: other,
          participant: other,
          lastMessage: "",
          timestamp: "",
          unreadCount: 0,
          messages: [],
        };
        map.set(other, conv);
      }
      conv.messages.push({
        id: msg.id,
        sender: msg.from,
        senderType: msg.from === "management" ? "manager" : "tenant",
        content: msg.message,
        timestamp: msg.createdAt,
        isRead: !!msg.seen,
        sent: msg.from === "management",
        replied: !!msg.replyId,
      });
      conv.lastMessage = msg.message;
      conv.timestamp = msg.createdAt;
      if (!msg.seen && msg.to === "You") {
        conv.unreadCount += 1;
      }
    });
    return Array.from(map.values());
  }, [messagesData, activeTab]);

  const renderConversationList = () => {
    if (conversations.length === 0) {
      return (
        <div
          id="no-messages"
          className="p-4 text-center text-sm text-muted-foreground"
        >
          No messages
        </div>
      );
    }
    return conversations.map((conversation) => (
      <button
        key={conversation.id}
        onClick={() => {
          // mark all unread tenant messages in this conversation as seen
          conversation.messages.forEach((msg) => {
            if (!msg.isRead && msg.senderType === "tenant") {
              markMessageSeen(msg.id);
            }
          });
          // refresh data to update counts/icons
          setMessagesData(listMessages());
          setSelectedConversation(conversation);
        }}
        className={`w-full flex gap-3 text-left p-4 border-b border-border hover:bg-secondary transition-colors ${
          selectedConversation?.id === conversation.id ? "bg-secondary" : ""
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="w-5 h-5" />
        </div>
        <div>
          {" "}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm">
              {conversation.participant}
            </h3>
            {conversation.unreadCount > 0 && (
              <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
            {conversation.lastMessage}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(conversation.timestamp)}
          </p>
        </div>
      </button>
    ));
  };

  const deleteMsg = (id: string) => {
    // remove from database then refresh local state
    deleteMessage(id);
    setMessagesData(listMessages());
    setSelectedConversation((prev) =>
      prev
        ? { ...prev, messages: prev.messages.filter((m) => m.id !== id) }
        : prev,
    );
  };

  const deleteAnnouncement = (id: string) => {
    // remove from database then refresh local state
    deleteAnnouncement(id);
    setAnnouncementsData(listAnnouncements());
  };

  const deleteAllInboxMessages = () => {
    const inboxMessages = messagesData.filter(
      (msg) => msg.to === "You" && msg.from !== "management",
    );
    inboxMessages.forEach((msg) => deleteMessage(msg.id));
    setMessagesData(listMessages());
    setSelectedConversation(null);
  };

  const deleteAllSentMessages = () => {
    const sentMessages = messagesData.filter(
      (msg) => msg.from === "management",
    );
    sentMessages.forEach((msg) => deleteMessage(msg.id));
    setMessagesData(listMessages());
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      const newMsg = createMessage({
        from: "management",
        to: selectedConversation.participant, // should be tenant email under universal scheme
        message: messageText,
      });
      // optionally create a reply to last message
      const last =
        selectedConversation.messages[selectedConversation.messages.length - 1];
      if (last) {
        createReply({ reply: messageText, msgId: last.id });
      }
      setMessagesData(listMessages());
      setMessageText("");
    }
  };

  const handleSendAnnouncement = (data: any) => {
    setIsSendingAnnouncement(true);
    // Simulate sending delay
    setTimeout(() => {
      createAnnouncement(data);
      setAnnouncementsData(listAnnouncements());
      setIsSendingAnnouncement(false);
    }, 2000);
  };

  const handleCreateNewMessage = () => {
    if (sendPropertyId && sendTenantId && sendMessageText.trim()) {
      setIsSendingNew(true);
      setTimeout(() => {
        const tenant = listTenants().find((t) => t.id === sendTenantId);
        createMessage({
          from: "management",
          to: tenant?.email || tenant?.name || "",
          message: sendMessageText,
        });
        setMessagesData(listMessages());
        setIsSendingNew(false);
        setIsSendDialogOpen(false);
        setSendPropertyId("");
        setSendTenantId("");
        setSendMessageText("");
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      <SendAnnouncementForm
        isOpen={showAnnouncementForm}
        onClose={() => {
          setShowAnnouncementForm(false);
          setAnnouncementTemplate(null);
        }}
        onSubmit={handleSendAnnouncement}
        isLoading={isSendingAnnouncement}
        initialData={announcementTemplate || undefined}
      />

      {/* New message dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Choose tenant and send your message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Property
              </label>
              <select
                value={sendPropertyId}
                onChange={(e) => {
                  setSendPropertyId(e.target.value);
                  setSendTenantId("");
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tenant
              </label>
              <select
                value={sendTenantId}
                onChange={(e) => setSendTenantId(e.target.value)}
                disabled={!sendPropertyId}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select tenant</option>
                {tenantsForSelected.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Message
              </label>
              <Textarea
                value={sendMessageText}
                onChange={(e) => setSendMessageText(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsSendDialogOpen(false)}
              disabled={isSendingNew}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNewMessage} disabled={isSendingNew}>
              {isSendingNew ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Communications
          </h1>
          <p className="text-muted-foreground">
            Message tenants and manage announcements
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setShowAnnouncementForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Main Content */}
      <Card className="border border-border overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="inbox"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
              onClick={() => setSelectedConversation(null)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Inbox ({inboxCount})
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
              onClick={() => setSelectedConversation(null)}
            >
              <Send className="w-4 h-4 mr-2" />
              Sent ({sentCount})
            </TabsTrigger>
            <TabsTrigger
              value="replied"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
              onClick={() => setSelectedConversation(null)}
            >
              <Archive className="w-4 h-4 mr-2" />
              Replied ({repliedCount})
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Announcements ({announcementsData.length})
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent
            value="inbox"
            className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0"
          >
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={deleteAllInboxMessages}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete All
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {renderConversationList()}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="md:col-span-2 flex flex-col">
                {/* Chat Header */}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {message.senderType === "manager"
                                ? "Management"
                                : selectedConversation.participant}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.senderType === "manager"
                                ? "management@company.com"
                                : `${selectedConversation.participant.toLowerCase()}@tenant.com`}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              From: {selectedConversation.participant}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(message.timestamp)}
                          </div>
                          <button
                            onClick={() => deleteMsg(message.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {message.sent && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              <Check className="w-3 h-3 -ml-1" />
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-xs text-blue-600 font-medium">
                              Replied
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-13">
                        <div className="font-medium text-sm mb-2">Message</div>
                        <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 flex items-center justify-center p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent
            value="sent"
            className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0"
          >
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b gap-2 border-border flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={deleteAllSentMessages}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete All
                </Button>
                <Button size="sm" onClick={() => setIsSendDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Message
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {renderConversationList()}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="md:col-span-2 flex flex-col">
                {/* Chat Header */}
                {/* <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold text-foreground">{selectedConversation.participant}</h2>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div> */}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {message.senderType === "manager"
                                ? "Management"
                                : selectedConversation.participant}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.senderType === "manager"
                                ? "management@company.com"
                                : `${selectedConversation.participant.toLowerCase()}@tenant.com`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div className="text-xs text-muted-foreground">
                                Sent to: {selectedConversation.participant}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(message.timestamp)}
                          </div>
                          <button
                            onClick={() => deleteMsg(message.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {message.sent && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              <Check className="w-3 h-3 -ml-1" />
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-xs text-blue-600 font-medium">
                              Replied
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-13">
                        <div className="font-medium text-sm mb-2">Message</div>
                        <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 flex items-center justify-center p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </TabsContent>

          {/* Replied Tab */}
          <TabsContent
            value="replied"
            className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0"
          >
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {renderConversationList()}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="md:col-span-2 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold text-foreground">
                    {selectedConversation.participant}
                  </h2>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {message.senderType === "manager"
                                ? "Management"
                                : selectedConversation.participant}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.senderType === "manager"
                                ? "management@company.com"
                                : `${selectedConversation.participant.toLowerCase()}@tenant.com`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(message.timestamp)}
                          </div>
                          <button
                            onClick={() => deleteMsg(message.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {message.sent && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              <Check className="w-3 h-3 -ml-1" />
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-xs text-blue-600 font-medium">
                              Replied
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-13">
                        <div className="font-medium text-sm mb-2">Message</div>
                        <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 flex items-center justify-center p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Recent Announcements
                </h3>
                <div className="space-y-3">
                  {announcementsData.length === 0 ? (
                    <Card className="border border-border p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        No announcements yet
                      </p>
                    </Card>
                  ) : (
                    announcementsData.map((announcement) => {
                      const readTenants = listTenants().filter((t) =>
                        announcement.readBy.includes(t.id),
                      );
                      return (
                        <Card
                          key={announcement.id}
                          className="border border-border p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-foreground">
                              {announcement.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedAnnouncementForViews(
                                    selectedAnnouncementForViews ===
                                      announcement.id
                                      ? null
                                      : announcement.id,
                                  )
                                }
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="w-4 h-4" />
                                {announcement.readBy.length}
                              </button>
                              <button
                                onClick={() =>
                                  deleteAnnouncement(announcement.id)
                                }
                                className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                                aria-label="Delete announcement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(
                                  announcement.sentAt || announcement.createdAt,
                                )}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {announcement.message}
                          </p>
                          {selectedAnnouncementForViews === announcement.id && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium mb-2">
                                Seen by:
                              </p>
                              {readTenants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No one yet
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {readTenants.map((tenant) => {
                                    const property = listProperties().find(
                                      (p) => p.id === tenant.propertyId,
                                    );
                                    return (
                                      <div key={tenant.id} className="text-sm">
                                        {tenant.name} -{" "}
                                        {property?.name || "Unknown Property"}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="p-6">
            <div className="space-y-4">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcementTemplates.map((template) => (
                  <Card key={template.id} className="border border-border p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border bg-transparent w-full"
                      onClick={() => {
                        setAnnouncementTemplate(template.data);
                        setShowAnnouncementForm(true);
                        setActiveTab("announcements");
                      }}
                    >
                      Use Template
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
