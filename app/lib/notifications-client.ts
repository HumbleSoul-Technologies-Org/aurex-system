import { apiRequest } from "@/lib/query-client";
import {
  NotificationCategory,
  NotificationPayload,
  NotificationRecord,
} from "@/lib/types/notifications";

export async function fetchNotifications(
  tenantId?: string,
  unreadOnly?: boolean,
  admin?: boolean,
  token?: string,
): Promise<NotificationRecord[]> {
  const params = new URLSearchParams();
  if (tenantId) params.set("tenantId", tenantId);
  if (admin) params.set("admin", "true");
  if (unreadOnly) params.set("unreadOnly", "true");
  const url = `/notifications${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const res = await apiRequest("GET", url, undefined, token);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error("fetchNotifications failed", error);
    return [];
  }
}

export async function createNotification(
  payload: NotificationPayload,
  token?: string,
): Promise<NotificationRecord | null> {
  try {
    const res = await apiRequest(
      "POST",
      "/notifications/create",
      payload,
      token,
    );
    const data = await res.json();
    if (data?.success && data.data) return data.data as NotificationRecord;
    if (data?.id) return data as NotificationRecord;
    return null;
  } catch (error) {
    console.error("createNotification failed", error);
    return null;
  }
}

export async function markNotificationRead(
  id: string,
  token?: string,
): Promise<NotificationRecord | null> {
  if (!id) return null;
  try {
    const res = await apiRequest(
      "PATCH",
      `/notifications/${encodeURIComponent(id)}/read`,
      undefined,
      token,
    );
    const data = await res.json();
    if (data?.success && data.data) return data.data as NotificationRecord;
    if (data?.id) return data as NotificationRecord;
    return null;
  } catch (error) {
    console.error("markNotificationRead failed", error);
    return null;
  }
}

export async function hideNotification(
  id: string,
  tenantId: string,
  token?: string,
): Promise<NotificationRecord | null> {
  if (!id || !tenantId) return null;
  try {
    const res = await apiRequest(
      "PATCH",
      `/notifications/${encodeURIComponent(id)}/hide`,
      { tenantId },
      token,
    );
    const data = await res.json();
    if (data?.success && data.data) return data.data as NotificationRecord;
    if (data?.id) return data as NotificationRecord;
    return null;
  } catch (error) {
    console.error("hideNotification failed", error);
    return null;
  }
}

export async function deleteNotification(
  id: string,
  token?: string,
): Promise<boolean> {
  if (!id) return false;
  try {
    const res = await apiRequest(
      "DELETE",
      `/notifications/${encodeURIComponent(id)}`,
      undefined,
      token,
    );
    if (res.ok) return true;
    return false;
  } catch (error) {
    console.error("deleteNotification failed", error);
    return false;
  }
}
