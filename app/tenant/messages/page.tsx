'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {mockMessages} from '@/data/tenant-messages-mock'
import { useIsMobile } from '@/hooks/use-mobile'
import { User, Star, Archive, Mail, ArrowLeft, Send, X } from 'lucide-react'

type Reply = { repliedOn: string | null; reply: string | null }

type Message = {
  id: string
  name?: string
  email?: string
  phone?: string
  subject?: string
  message: string
  reply: Reply
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  fromTenant: boolean
  createdAt: string
}

export default function TenantMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'sent' | 'starred' | 'archived'>('all')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const isMobile = useIsMobile()
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false)
  const [modalMounted, setModalMounted] = useState(false)
  const [modalAnimateIn, setModalAnimateIn] = useState(false)

  useEffect(() => {
    if (showDetailsOnMobile) {
      setModalMounted(true)
      // trigger animation on next frame
      requestAnimationFrame(() => setModalAnimateIn(true))
    } else if (modalMounted) {
      // trigger exit animation, then unmount
      setModalAnimateIn(false)
      const t = setTimeout(() => setModalMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [showDetailsOnMobile])

  // Filter chips drag-to-scroll
  const chipsRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    const el = chipsRef.current
    if (!el) return

    let pointerDown = false
    const onPointerDown = (e: PointerEvent) => {
      pointerDown = true
      startX.current = e.clientX
      scrollLeft.current = el.scrollLeft
      isDragging.current = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return
      const dx = e.clientX - startX.current
      if (!isDragging.current && Math.abs(dx) > 6) {
        isDragging.current = true
      }
      if (isDragging.current) {
        el.scrollLeft = scrollLeft.current - dx
        e.preventDefault()
      }
    }

    const onPointerUp = () => {
      pointerDown = false
      // leave isDragging state for one tick so click handlers can check it
      setTimeout(() => (isDragging.current = false), 0)
    }

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Use mock data for local/dev preview
      const data = (mockMessages as Message[])
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      setMessages(data)
      if (!selectedId && data.length > 0) setSelectedId(data[data.length - 1].id)
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim()) return
    try {
      // Append locally using mock data (no server persistence in mock mode)
      const message: Message = {
        id: Date.now().toString(),
        name: 'You',
        email: '',
        phone: '',
        subject: '',
        message: text.trim(),
        reply: { repliedOn: null, reply: null },
        isRead: true,
        isStarred: false,
        isArchived: false,
        fromTenant: true,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, message])
      setText('')
      setSelectedId(message.id)
    } catch (err) {
      // ignore
    }
  }

  const simulateManagementMessage = async () => {
    // Append a management message locally
    const message: Message = {
      id: Date.now().toString(),
      name: 'Management',
      email: '',
      phone: '',
      subject: 'Notice',
      message: 'Message from management',
      reply: { repliedOn: null, reply: null },
      isRead: false,
      isStarred: false,
      isArchived: false,
      fromTenant: false,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, message])
    setSelectedId(message.id)
  }

  // Derived list after applying filter
  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === 'all') return true
      if (filter === 'new') return !m.isRead
      if (filter === 'read') return m.isRead
      if (filter === 'sent') return !!m.fromTenant
      if (filter === 'starred') return !!m.isStarred
      if (filter === 'archived') return !!m.isArchived
      return true
    })
  }, [messages, filter])

  const selected = messages.find((m) => m.id === selectedId) ?? null

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <header className="sticky top-4 z-20 bg-background/60 backdrop-blur-sm rounded-md p-3 sm:p-4 mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Conversation with management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={simulateManagementMessage} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            <Mail className="w-4 h-4" /> Simulate
          </button>
          <button onClick={() => { setFilter('new'); }} className="  items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm hidden sm:inline-flex">
            <Send className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Left: message list + send form */}
        {/* On small screens show list or details depending on selection */}
        <div className={`flex flex-col ${isMobile ? 'min-h-[60vh]' : 'h-[70vh]'} border rounded-md overflow-hidden bg-white`}>
          <div className="p-3 border-b flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a quick message..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button onClick={send} className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white">
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 border-b">
            <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x -mx-2 px-2">
              {[
                ['all', 'All'],
                ['new', 'New'],
                ['read', 'Read'],
                ['sent', 'Sent'],
                ['starred', 'Starred'],
                ['archived', 'Archived'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isDragging.current) return
                    setFilter(key as any)
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm ${filter === key ? 'bg-primary text-white' : 'bg-gray-100 text-sm'} animate-[--tw-duration:200ms]`}
                  style={{ cursor: 'grab' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {loading && <div className="text-gray-500">Loading...</div>}
            {!loading && filtered.length === 0 && <div className="text-gray-500">No messages.</div>}
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)))
                  setSelectedId(m.id)
                  if (isMobile) setShowDetailsOnMobile(true)
                }}
                className={`w-full cursor-pointer p-3 rounded-lg shadow-sm border flex items-start gap-3 transition-opacity motion-safe:animate-fade-in ${m.id === selectedId ? 'bg-primary/5 border-primary' : 'bg-white'}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium truncate">{m.subject || m.message}</div>
                    <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: details pane */}
        <div className={`border rounded-md p-4 ${isMobile ? 'min-h-[60vh]' : 'h-[70vh]'} overflow-auto bg-white ${isMobile ? 'hidden' : ''}`}>
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
          {!selected && <div className="text-muted-foreground">Select a message to view details.</div>}
          {selected && (
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{selected.name || (selected.fromTenant ? 'You' : 'Management')}</div>
                      <div className="text-sm text-muted-foreground">{selected.email || '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded-md bg-gray-100"><Star className="w-4 h-4" /></button>
                    <button className="px-2 py-1 rounded-md bg-gray-100"><Archive className="w-4 h-4" /></button>
                    <div className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Subject</div>
                    <div className="text-sm">{selected.subject || '—'}</div>
                  </div>

                  <div>
                    <div className="font-medium">Message</div>
                    <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50 mt-2">{selected.message}</div>
                  </div>

                  {selected.reply?.reply && (
                    <div>
                      <div className="font-medium">Reply <span className="text-xs text-muted-foreground">{selected.reply.repliedOn ? `(${new Date(selected.reply.repliedOn).toLocaleString()})` : ''}</span></div>
                      <div className="flex justify-end mt-2">
                        <div className="whitespace-pre-wrap text-sm text-gray-800 p-3 rounded-md border bg-blue-50 max-w-[80%] text-right">{selected.reply.reply}</div>
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
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${modalAnimateIn ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
              onClick={() => setShowDetailsOnMobile(false)}
            />
            <div className={`relative w-full h-[85vh] sm:h-[80vh] bg-white rounded-t-xl sm:rounded-xl shadow-lg overflow-auto p-4 transform transition-all duration-300 ${modalAnimateIn ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 scale-95'}`}>
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
                    <div className="text-lg font-semibold">{selected.name || (selected.fromTenant ? 'You' : 'Management')}</div>
                    <div className="text-sm text-muted-foreground">{selected.email || '—'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-md bg-gray-100"><Star className="w-4 h-4" /></button>
                  <button className="px-2 py-1 rounded-md bg-gray-100"><Archive className="w-4 h-4" /></button>
                  <div className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-medium">Subject</div>
                  <div className="text-sm">{selected.subject || '—'}</div>
                </div>

                <div>
                  <div className="font-medium">Message</div>
                  <div className="whitespace-pre-wrap text-sm text-gray-800 p-4 rounded-md border bg-gray-50 mt-2">{selected.message}</div>
                </div>

                {selected.reply?.reply && (
                  <div>
                    <div className="font-medium">Reply <span className="text-xs text-muted-foreground">{selected.reply.repliedOn ? `(${new Date(selected.reply.repliedOn).toLocaleString()})` : ''}</span></div>
                    <div className="flex justify-end mt-2">
                      <div className="whitespace-pre-wrap text-sm text-gray-800 p-3 rounded-md border bg-blue-50 max-w-[80%] text-right">{selected.reply.reply}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
