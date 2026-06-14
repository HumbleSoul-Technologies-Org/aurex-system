import { getAuthToken } from "@/lib/token-manager";

export interface AuditLogEntry {
  id: string;
  action: string;
  actor?: string;
  actorRole?: string;
  actorName?: string;
  details?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: "info" | "warning" | "error";
  createdAt: string;
}

const SERVER_ROOT =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5454";
const SERVER_API_BASE = `${SERVER_ROOT}/api`;

async function serverFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${SERVER_API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  const response = await serverFetch("/admin/audit", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to load audit logs");
  }

  const json = await response.json();
  return json.data ?? [];
}

export async function addAuditLog(
  entry: Omit<AuditLogEntry, "id" | "createdAt">,
): Promise<AuditLogEntry> {
  const response = await serverFetch("/admin/audit", {
    method: "POST",
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to save audit log");
  }

  const json = await response.json();
  return json.data;
}
