'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SendAnnouncementForm from '@/components/forms/send-announcement-form'
import { MessageSquare, Plus, Send, Bell, Archive, Paperclip, Search } from 'lucide-react'

interface Message {
  id: string
  sender: string
  senderType: 'tenant' | 'manager'
  content: string
  timestamp: string
  isRead: boolean
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

  const conversations: Conversation[] = [
    {
      id: '1',
      participant: 'John Smith',
      lastMessage: 'Is there a maintenance team available to check the kitchen sink?',
      timestamp: '2024-02-05 10:30 AM',
      unreadCount: 1,
      messages: [
        {
          id: '1',
          sender: 'John Smith',
          senderType: 'tenant',
          content: 'Is there a maintenance team available to check the kitchen sink?',
          timestamp: '2024-02-05 10:30 AM',
          isRead: false,
        },
      ],
    },
    {
      id: '2',
      participant: 'Sarah Johnson',
      lastMessage: 'Thank you for the reminder, I will pay rent today.',
      timestamp: '2024-02-04 02:15 PM',
      unreadCount: 0,
      messages: [
        {
          id: '1',
          sender: 'You',
          senderType: 'manager',
          content: 'Hello Sarah, your rent is due today. Please process the payment.',
          timestamp: '2024-02-04 01:00 PM',
          isRead: true,
        },
        {
          id: '2',
          sender: 'Sarah Johnson',
          senderType: 'tenant',
          content: 'Thank you for the reminder, I will pay rent today.',
          timestamp: '2024-02-04 02:15 PM',
          isRead: true,
        },
      ],
    },
  ]

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      // Handle send message
      setMessageText('')
    }
  }

  const handleSendAnnouncement = (data: any) => {
    console.log('New announcement:', data)
  }

  return (
    <div className="space-y-6">
      <SendAnnouncementForm 
        isOpen={showAnnouncementForm}
        onClose={() => setShowAnnouncementForm(false)}
        onSubmit={handleSendAnnouncement}
      />
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
                {conversations.map((conversation) => (
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
                    <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                  </button>
                ))}
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
                        <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
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
