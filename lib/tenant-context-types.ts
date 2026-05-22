import { TenantRecord } from "./services/tenants";
import { PropertyRecord } from "./services/properties";
import { MaintenanceRequest } from "./services/maintenance";
import { AnnouncementRecord } from "./services/announcements";
import { PaymentRecord } from "./services/payments";
import { Notification } from "./services/notifications";
import { DocumentRecord } from "./services/documents";

export type TenantDataType =
  | "messages"
  | "maintenance"
  | "announcements"
  | "payments"
  | "notifications"
  | "documents";

export interface TenantMessage {
  id: string;
  sender: string;
  senderType: "tenant" | "manager";
  content: string;
  timestamp: string;
  isRead: boolean;
  sent?: boolean;
  subject?: string;
  type?: "message" | "announcement";
  originalId?: string;
}

export interface TenantLoadingState {
  tenantProfile: boolean;
  tenantProperty: boolean;
  messages: boolean;
  maintenance: boolean;
  announcements: boolean;
  payments: boolean;
  notifications: boolean;
  documents: boolean;
}

export interface TenantErrorState {
  tenantProfile: string | null;
  tenantProperty: string | null;
  messages: string | null;
  maintenance: string | null;
  announcements: string | null;
  payments: string | null;
  notifications: string | null;
  documents: string | null;
}

export interface TenantContextValue {
  currentTenant: TenantRecord | null;
  currentProperty: PropertyRecord | null;
  messages: TenantMessage[];
  maintenanceRequests: MaintenanceRequest[];
  announcements: AnnouncementRecord[];
  payments: PaymentRecord[];
  notifications: Notification[];
  documents: DocumentRecord[];
  loading: TenantLoadingState;
  errors: TenantErrorState;
  isReady: boolean;
  loadMessages: () => Promise<void>;
  loadMaintenance: () => Promise<void>;
  loadAnnouncements: () => Promise<void>;
  loadPayments: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadDocuments: () => Promise<void>;
  refetch: (dataType: TenantDataType) => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: (dataType: TenantDataType) => void;
}
