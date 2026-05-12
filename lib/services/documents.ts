import { getCollection, insertIntoCollection, updateInCollection, removeFromCollection, generateId } from '@/lib/local-store'

export interface DocumentRecord {
  id: string
  title: string
  type: string
  ownerType: 'tenant' | 'property' | 'organization'
  ownerId?: string
  fileUrl?: string
  fileType?: string
  description?: string
  visibility?: 'private' | 'property' | 'unit' | 'tenant-specific'
  shareWith?: string[]
  createdBy?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  status?: 'active' | 'archived' | 'deleted'
}

export function listDocuments(): DocumentRecord[] {
  return getCollection<DocumentRecord>('documents')
}

export function getDocument(id: string): DocumentRecord | null {
  return listDocuments().find((document) => document.id === id) ?? null
}

export function createDocument(payload: Partial<DocumentRecord>): DocumentRecord {
  const now = new Date().toISOString()
  const document: DocumentRecord = {
    id: generateId('doc'),
    title: payload.title || 'Untitled Document',
    type: payload.type || 'lease',
    ownerType: payload.ownerType || 'organization',
    ownerId: payload.ownerId,
    fileUrl: payload.fileUrl,
    fileType: payload.fileType,
    description: payload.description,
    visibility: payload.visibility || 'private',
    shareWith: payload.shareWith || [],
    createdBy: payload.createdBy,
    createdAt: now,
    updatedAt: now,
    tags: payload.tags || [],
    status: payload.status || 'active',
  }

  insertIntoCollection('documents', document)
  return document
}

export function updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | null {
  return updateInCollection<DocumentRecord>('documents', id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export function deleteDocument(id: string): boolean {
  return removeFromCollection('documents', id)
}
