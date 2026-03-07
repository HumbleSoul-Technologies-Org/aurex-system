'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import SendAnnouncementForm from '@/components/forms/send-announcement-form'
import {
  listMessages,
  createMessage,
  deleteMessage,
  createReply,
  listReplies,
  markMessageSeen,
  MessageRecord,
} from '@/lib/services/messages'
import { listProperties } from '@/lib/services/properties'
import { listTenants } from '@/lib/services/tenants'
import { MessageSquare, Plus, Send, Bell, Archive, Paperclip, Search, Check } from 'lucide-react'

interface Message {
  id: string
  sender: string
  senderType: 'tenant' | 'manager'
  content: string
  timestamp: string
  isRead: boolean
  sent?: boolean           // whether the message was sent by the current user
  replied?: boolean        // whether this message has been replied to
}

interface Conversation {
  id: string
  participant: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  messages: Message[]
}

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageText, setMessageText] = useState('')
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [messagesData, setMessagesData] = useState<MessageRecord[]>(() => listMessages())

  // new message dialog state
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [sendPropertyId, setSendPropertyId] = useState('')
  const [sendTenantId, setSendTenantId] = useState('')
  const [sendMessageText, setSendMessageText] = useState('')
  const [isSendingNew, setIsSendingNew] = useState(false)

  const properties = useMemo(() => listProperties(), [])
  const tenantsForSelected = useMemo(
    () => (sendPropertyId ? listTenants().filter(t => t.propertyId === sendPropertyId) : []),
    [sendPropertyId]
  )

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const conversations: Conversation[] = useMemo(() => {
    let filteredMessages = messagesData
    if (activeTab === 'inbox') {
      filteredMessages = messagesData.filter(msg => msg.to === 'You' && msg.from !== 'management')
    } else if (activeTab === 'sent') {
      filteredMessages = messagesData.filter(msg => msg.from === 'management')
    } else if (activeTab === 'replied') {
      filteredMessages = messagesData.filter(msg => msg.replyId)
    }
    const map = new Map<string, Conversation>()
    filteredMessages.forEach((msg) => {
      const other = msg.from === 'management' ? msg.to : msg.from
      if (!other) return
      let conv = map.get(other)
      if (!conv) {
        conv = {
          id: other,
          participant: other,
          lastMessage: '',
          timestamp: '',
          unreadCount: 0,
          messages: [],
        }
        map.set(other, conv)
      }
      conv.messages.push({
        id: msg.id,
        sender: msg.from,
        senderType: msg.from === 'management' ? 'manager' : 'tenant',
        content: msg.message,
        timestamp: msg.createdAt,
        isRead: !!msg.seen,
        sent: msg.from === 'management',
        replied: !!msg.replyId,
      })
      conv.lastMessage = msg.message
      conv.timestamp = msg.createdAt
      if (!msg.seen && msg.to === 'You') {
        conv.unreadCount += 1
      }
    })
    return Array.from(map.values())
  }, [messagesData, activeTab])

  const renderConversationList = () => {
    if (conversations.length === 0) {
      return (
        <div id="no-messages" className="p-4 text-center text-sm text-muted-foreground">
          No messages
        </div>
      )
    }
    return conversations.map((conversation) => (
      <button
        key={conversation.id}
        onClick={() => setSelectedConversation(conversation)}
        className={`w-full text-left p-4 border-b border-border hover:bg-secondary transition-colors ${
          selectedConversation?.id === conversation.id ? 'bg-secondary' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground text-sm">{conversation.participant}</h3>
          {conversation.unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
          {conversation.lastMessage}
        </p>
        <p className="text-xs text-muted-foreground">{formatDateTime(conversation.timestamp)}</p>
      </button>
    ))
  }

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      const newMsg = createMessage({
        from: 'management',
        to: selectedConversation.participant,
        message: messageText,
      })
      // optionally create a reply to last message
      const last = selectedConversation.messages[selectedConversation.messages.length - 1]
      if (last) {
        createReply({ reply: messageText, msgId: last.id })
      }
      setMessagesData(listMessages())
      setMessageText('')
    }
  }

  const handleSendAnnouncement = (data: any) => {
    console.log('New announcement:', data)
  }

  const handleCreateNewMessage = () => {
    if (sendPropertyId && sendTenantId && sendMessageText.trim()) {
      setIsSendingNew(true)
      setTimeout(() => {
        const tenant = listTenants().find(t => t.id === sendTenantId)
        createMessage({
          from: 'management',
          to: tenant?.name || '',
          message: sendMessageText,
        })
        setMessagesData(listMessages())
        setIsSendingNew(false)
        setIsSendDialogOpen(false)
        setSendPropertyId('')
        setSendTenantId('')
        setSendMessageText('')
      }, 4000)
    }
  }

  return (
    <div className="space-y-6">
      <SendAnnouncementForm 
        isOpen={showAnnouncementForm}
        onClose={() => setShowAnnouncementForm(false)}
        onSubmit={handleSendAnnouncement}
      />

      {/* New message dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Choose tenant and send your message.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Property</label>
              <select
                value={sendPropertyId}
                onChange={(e) => { setSendPropertyId(e.target.value); setSendTenantId(''); }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tenant</label>
              <select
                value={sendTenantId}
                onChange={(e) => setSendTenantId(e.target.value)}
                disabled={!sendPropertyId}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select tenant</option>
                {tenantsForSelected.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message</label>
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
            <Button variant="secondary" onClick={() => setIsSendDialogOpen(false)} disabled={isSendingNew}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewMessage} disabled={isSendingNew}>
              {isSendingNew ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Communications</h1>
          <p className="text-muted-foreground">Message tenants and manage announcements</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
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
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Send className="w-4 h-4 mr-2" />
              Sent
            </TabsTrigger>
            <TabsTrigger
              value="replied"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Archive className="w-4 h-4 mr-2" />
              Replied
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10" />
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
                  <h2 className="font-bold text-foreground">{selectedConversation.participant}</h2>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'manager' ? 'justify-end' : 'justify-start'}`}
                      onClick={() => {
                        if (activeTab === 'inbox' && message.senderType !== 'manager' && !message.isRead) {
                          markMessageSeen(message.id)
                          setMessagesData(listMessages())
                        }
                      }}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderType === 'manager'
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                          {formatDateTime(message.timestamp)}
                          {message.sent && (
                            <span className="flex items-center gap-1">
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className="text-green-500 font-medium text-[10px]">Sent</span>
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-blue-500 font-medium text-[10px]">Replied</span>
                          )}
                        </p>
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
          <TabsContent value="sent" className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
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
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold text-foreground">{selectedConversation.participant}</h2>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'manager' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderType === 'manager'
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                          {formatDateTime(message.timestamp)}
                          {message.sent && (
                            <span className="flex items-center gap-1">
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className="text-green-500 font-medium text-[10px]">Sent</span>
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-blue-500 font-medium text-[10px]">Replied</span>
                          )}
                        </p>
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
          <TabsContent value="replied" className="p-0 grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Conversation List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10" />
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
                  <h2 className="font-bold text-foreground">{selectedConversation.participant}</h2>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'manager' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderType === 'manager'
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                          {formatDateTime(message.timestamp)}
                          {message.sent && (
                            <span className="flex items-center gap-1">
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className="text-green-500 font-medium text-[10px]">Sent</span>
                            </span>
                          )}
                          {message.replied && (
                            <span className="text-blue-500 font-medium text-[10px]">Replied</span>
                          )}
                        </p>
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
                <h3 className="text-lg font-bold text-foreground mb-4">Create Announcement</h3>
                <Card className="border border-border p-4">
                  <Button 
                    onClick={() => setShowAnnouncementForm(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Announcements</h3>
                <div className="space-y-3">
                  <Card className="border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-foreground">Scheduled Maintenance</p>
                      <p className="text-xs text-muted-foreground">2024-02-03</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All properties will undergo scheduled maintenance on February 5th.
                    </p>
                  </Card>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-2">Rent Reminder</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Standard message reminder for upcoming rent payment
                  </p>
                  <Button size="sm" variant="outline" className="border-border bg-transparent">
                    Use Template
                  </Button>
                </Card>

                <Card className="border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-2">Maintenance Request</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Template for maintenance request updates
                  </p>
                  <Button size="sm" variant="outline" className="border-border bg-transparent">
                    Use Template
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
