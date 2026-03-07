export type CollectionName = 'users' | 'properties' | 'tenants' | 'payments' | 'messages' | 'replies'

const DB_KEY = 'propman:v1'

export interface DBSchema {
  users: any[]
  properties: any[]
  tenants: any[]
  payments: any[]
  messages: any[]
  replies: any[]
}

const defaultDB: DBSchema = {
  users: [],
  properties: [],
  tenants: [],
  payments: [],
  messages: [],
  replies: [],
}

function readRaw(): DBSchema {
  if (typeof window === 'undefined') return defaultDB
  try {
    const txt = localStorage.getItem(DB_KEY)
    if (!txt) return defaultDB
    const parsed = JSON.parse(txt)
    return { ...defaultDB, ...parsed }
  } catch (e) {
    console.error('local-store read error', e)
    return defaultDB
  }
}

function writeRaw(db: DBSchema) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('local-store write error', e)
  }
}

export function clearDB() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DB_KEY)
}

export function getCollection<T = any>(name: CollectionName): T[] {
  const db = readRaw()
  return (db as any)[name] as T[]
}

export function findInCollection<T = any>(name: CollectionName, predicate: (item: T) => boolean): T | null {
  const col = getCollection<T>(name)
  return col.find(predicate) ?? null
}

export function insertIntoCollection<T = any>(name: CollectionName, item: T): T {
  const db = readRaw()
  const col = (db as any)[name] as T[]
  col.push(item)
  writeRaw(db)
  return item
}

export function updateInCollection<T = any>(name: CollectionName, id: string, patch: Partial<T>): T | null {
  const db = readRaw()
  const col = (db as any)[name] as any[]
  const idx = col.findIndex((x) => x.id === id)
  if (idx === -1) return null
  col[idx] = { ...col[idx], ...patch }
  writeRaw(db)
  return col[idx]
}

export function removeFromCollection(name: CollectionName, id: string): boolean {
  const db = readRaw()
  const col = (db as any)[name] as any[]
  const idx = col.findIndex((x) => x.id === id)
  if (idx === -1) return false
  col.splice(idx, 1)
  writeRaw(db)
  return true
}

export function generateId(prefix = ''): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return prefix ? `${prefix}-${t}${r}` : `${t}${r}`
}

export function setValue<T = any>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('local-store setValue error', e)
  }
}

export function getValue<T = any>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const txt = localStorage.getItem(key)
    if (!txt) return null
    return JSON.parse(txt) as T
  } catch (e) {
    console.error('local-store getValue error', e)
    return null
  }
}
