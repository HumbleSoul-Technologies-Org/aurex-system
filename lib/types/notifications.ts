export type NotificationCategory =
  | "sys"
  | "message"
  | "payment"
  | "creation"
  | "update"
  | "delete"
  | "approval"
  | "rejected";

export type NotificationResourceType =
  | "property"
  | "tenant"
  | "payment"
  | "maintenance"
  | "message"
  | "announcement"
  | "expense"
  | "settings"
  | "general";

export interface NotificationPayload {
  title: string;
  body?: string;
  category: NotificationCategory;
  resourceType: NotificationResourceType;
  resourceId?: string;
  tenantId?: string;
  targetTenantIds?: string[];
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationRecord extends NotificationPayload {
  id: string;
  read: boolean;
  createdAt: string;
  hiddenFor?: string[];
}
