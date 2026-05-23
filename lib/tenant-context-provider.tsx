"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { apiRequest } from "./query-client";
import { getValue, setValue } from "./local-store";
import {
  TenantContextValue,
  TenantDataType,
  TenantLoadingState,
  TenantErrorState,
  TenantMessage,
} from "./tenant-context-types";
import { TenantRecord, getTenant } from "./services/tenants";
import { PropertyRecord, getProperty } from "./services/properties";
import {
  MaintenanceRequest,
  fetchMaintenanceRequestsByTenant,
} from "./services/maintenance";
import {
  AnnouncementRecord,
  getAnnouncementsByProperty,
} from "./services/announcements";
import { PaymentRecord, listPayments } from "./services/payments";
import { Notification, getNotifications } from "./services/notifications";
import { DocumentRecord, listDocuments } from "./services/documents";
import { getTenantPropertyMessagesForUI } from "./services/messages";
import TenantContext from "./tenant-context";

interface TenantContextProviderProps {
  children: ReactNode;
}

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_KEYS = {
  tenantProfile: "tenant-context-tenant-profile",
  tenantProperty: "tenant-context-property",
  messages: "tenant-context-messages",
  maintenance: "tenant-context-maintenance",
  announcements: "tenant-context-announcements",
  payments: "tenant-context-payments",
  notifications: "tenant-context-notifications",
  documents: "tenant-context-documents",
};

function readCache<T>(key: string): T | null {
  try {
    const raw = getValue<{ ts: number; data: T }>(key);
    if (!raw) return null;
    if (Date.now() - raw.ts > CACHE_TTL) return null;
    return raw.data;
  } catch (error) {
    console.error("TenantContext cache read failed", error);
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    setValue(key, { ts: Date.now(), data });
  } catch (error) {
    console.error("TenantContext cache write failed", error);
  }
}

function getPropertyOwnerId(property: any): string | null {
  if (!property) return null;
  return (
    property.owner ||
    property.ownerId ||
    property.owner?._id ||
    property.owner?.id ||
    null
  );
}

export function TenantContextProvider({
  children,
}: TenantContextProviderProps) {
  const { user, token, isAuthenticated } = useAuth();

  const [currentTenant, setCurrentTenant] = useState<TenantRecord | null>(null);
  const [currentProperty, setCurrentProperty] = useState<PropertyRecord | null>(
    null,
  );
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState<TenantLoadingState>({
    tenantProfile: false,
    tenantProperty: false,
    messages: false,
    maintenance: false,
    announcements: false,
    payments: false,
    notifications: false,
    documents: false,
  });

  const [errors, setErrors] = useState<TenantErrorState>({
    tenantProfile: null,
    tenantProperty: null,
    messages: null,
    maintenance: null,
    announcements: null,
    payments: null,
    notifications: null,
    documents: null,
  });

  const isReady = Boolean(currentTenant && currentProperty);

  const setLoadingState = useCallback(
    (
      key: TenantDataType | "tenantProfile" | "tenantProperty",
      value: boolean,
    ) => {
      setLoading((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setErrorState = useCallback(
    (key: keyof TenantErrorState, value: string | null) => {
      setErrors((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const loadTenantProfile = useCallback(async () => {
    if (!user?.id || !token || !isAuthenticated) return;
    setLoadingState("tenantProfile", true);
    try {
      const res = await apiRequest(
        "GET",
        `/tenants/${user.id}/self`,
        undefined,
        token,
      );
      const data = await res.json();
      const tenant = {
        ...data,
        id: data.id || data._id || user.id,
      } as TenantRecord;
      setCurrentTenant(tenant);
      writeCache(CACHE_KEYS.tenantProfile, tenant);
      setErrorState("tenantProfile", null);
    } catch (error: any) {
      console.error("Failed to load tenant profile", error);
      setErrorState(
        "tenantProfile",
        error?.message || "Failed to load tenant profile",
      );
      const cached = readCache<TenantRecord>(CACHE_KEYS.tenantProfile);
      if (cached) {
        setCurrentTenant(cached);
      }
    } finally {
      setLoadingState("tenantProfile", false);
    }
  }, [isAuthenticated, setErrorState, setLoadingState, token, user?.id]);

  const loadProperty = useCallback(
    async (propertyId?: string) => {
      if (!propertyId || !token || !isAuthenticated) return;
      setLoadingState("tenantProperty", true);
      try {
        const res = await apiRequest(
          "GET",
          `/property/${propertyId}/self`,
          undefined,
          token,
        );
        const data = await res.json();
        const property = {
          ...data,
          id: data.id || data._id || propertyId,
        } as PropertyRecord;
        setCurrentProperty(property);
        writeCache(CACHE_KEYS.tenantProperty, property);
        setErrorState("tenantProperty", null);
      } catch (error: any) {
        console.error("Failed to load tenant property", error);
        setErrorState(
          "tenantProperty",
          error?.message || "Failed to load tenant property",
        );
        const cached = readCache<PropertyRecord>(CACHE_KEYS.tenantProperty);
        if (cached) {
          setCurrentProperty(cached);
        }
      } finally {
        setLoadingState("tenantProperty", false);
      }
    },
    [isAuthenticated, setErrorState, setLoadingState, token],
  );

  const loadMessages = useCallback(async () => {
    if (!currentTenant?.id || !currentProperty?.id) return;
    setLoadingState("messages", true);
    try {
      const ownerId = getPropertyOwnerId(currentProperty);
      if (!ownerId) {
        throw new Error("Property owner information is missing");
      }
      const tenantMessages = await getTenantPropertyMessagesForUI(
        currentTenant.id,
        ownerId,
        currentProperty.id,
        token,
      );

      setMessages(tenantMessages);
      writeCache(CACHE_KEYS.messages, tenantMessages);
      setErrorState("messages", null);
    } catch (error: any) {
      console.error("Failed to load tenant messages", error);
      setErrorState(
        "messages",
        error?.message || "Failed to load tenant messages",
      );
      const cached = readCache<TenantMessage[]>(CACHE_KEYS.messages);
      if (cached) setMessages(cached);
    } finally {
      setLoadingState("messages", false);
    }
  }, [
    currentProperty?.id,
    currentTenant?.id,
    setErrorState,
    setLoadingState,
    token,
  ]);

  const loadMaintenance = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoadingState("maintenance", true);
    try {
      const maintenance = await fetchMaintenanceRequestsByTenant(
        currentTenant.id,
      );
      setMaintenanceRequests(maintenance);
      writeCache(CACHE_KEYS.maintenance, maintenance);
      setErrorState("maintenance", null);
    } catch (error: any) {
      console.error("Failed to load tenant maintenance requests", error);
      setErrorState(
        "maintenance",
        error?.message || "Failed to load maintenance requests",
      );
      const cached = readCache<MaintenanceRequest[]>(CACHE_KEYS.maintenance);
      if (cached) setMaintenanceRequests(cached);
    } finally {
      setLoadingState("maintenance", false);
    }
  }, [currentTenant?.id, setErrorState, setLoadingState]);

  const loadAnnouncements = useCallback(async () => {
    if (!currentProperty?.id) return;
    setLoadingState("announcements", true);
    try {
      const announcements = await getAnnouncementsByProperty(
        currentProperty.id,
        token,
      );
      setAnnouncements(announcements);
      writeCache(CACHE_KEYS.announcements, announcements);
      setErrorState("announcements", null);
    } catch (error: any) {
      console.error("Failed to load announcements", error);
      setErrorState(
        "announcements",
        error?.message || "Failed to load announcements",
      );
      const cached = readCache<AnnouncementRecord[]>(CACHE_KEYS.announcements);
      if (cached) setAnnouncements(cached);
    } finally {
      setLoadingState("announcements", false);
    }
  }, [currentProperty?.id, setErrorState, setLoadingState, token]);

  const loadPayments = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoadingState("payments", true);
    try {
      const payments = listPayments().filter(
        (payment) => payment.tenantId === currentTenant.id,
      );
      setPayments(payments);
      writeCache(CACHE_KEYS.payments, payments);
      setErrorState("payments", null);
    } catch (error: any) {
      console.error("Failed to load payments", error);
      setErrorState("payments", error?.message || "Failed to load payments");
      const cached = readCache<PaymentRecord[]>(CACHE_KEYS.payments);
      if (cached) setPayments(cached);
    } finally {
      setLoadingState("payments", false);
    }
  }, [currentTenant?.id, setErrorState, setLoadingState]);

  const loadNotifications = useCallback(async () => {
    setLoadingState("notifications", true);
    try {
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      writeCache(CACHE_KEYS.notifications, allNotifications);
      setErrorState("notifications", null);
    } catch (error: any) {
      console.error("Failed to load notifications", error);
      setErrorState(
        "notifications",
        error?.message || "Failed to load notifications",
      );
      const cached = readCache<Notification[]>(CACHE_KEYS.notifications);
      if (cached) setNotifications(cached);
    } finally {
      setLoadingState("notifications", false);
    }
  }, [setErrorState, setLoadingState]);

  const loadDocuments = useCallback(async () => {
    if (!currentTenant && !currentProperty) return;
    setLoadingState("documents", true);
    try {
      const allDocuments = listDocuments();
      const filtered = allDocuments.filter((doc) => {
        const matchesTenant = currentTenant
          ? doc.ownerType === "tenant" && doc.ownerId === currentTenant.id
          : false;
        const matchesProperty = currentProperty
          ? doc.ownerType === "property" && doc.ownerId === currentProperty.id
          : false;
        const tenantVisible =
          doc.visibility === "tenant-specific" || doc.visibility === "private";
        return matchesTenant || matchesProperty || tenantVisible;
      });
      setDocuments(filtered);
      writeCache(CACHE_KEYS.documents, filtered);
      setErrorState("documents", null);
    } catch (error: any) {
      console.error("Failed to load documents", error);
      setErrorState("documents", error?.message || "Failed to load documents");
      const cached = readCache<DocumentRecord[]>(CACHE_KEYS.documents);
      if (cached) setDocuments(cached);
    } finally {
      setLoadingState("documents", false);
    }
  }, [currentProperty, currentTenant, setErrorState, setLoadingState]);

  const refetch = useCallback(
    async (dataType: TenantDataType) => {
      switch (dataType) {
        case "messages":
          await loadMessages();
          break;
        case "maintenance":
          await loadMaintenance();
          break;
        case "announcements":
          await loadAnnouncements();
          break;
        case "payments":
          await loadPayments();
          break;
        case "notifications":
          await loadNotifications();
          break;
        case "documents":
          await loadDocuments();
          break;
      }
    },
    [
      loadAnnouncements,
      loadDocuments,
      loadMaintenance,
      loadMessages,
      loadNotifications,
      loadPayments,
    ],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadMessages(),
      loadMaintenance(),
      loadAnnouncements(),
      loadPayments(),
      loadNotifications(),
      loadDocuments(),
    ]);
  }, [
    loadAnnouncements,
    loadDocuments,
    loadMaintenance,
    loadMessages,
    loadNotifications,
    loadPayments,
  ]);

  const clearError = useCallback(
    (dataType: TenantDataType) => {
      setErrorState(dataType, null);
    },
    [setErrorState],
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    loadTenantProfile();
  }, [isAuthenticated, loadTenantProfile, user?.id]);

  useEffect(() => {
    if (!currentTenant?.propertyId) return;
    loadProperty(currentTenant.propertyId);
  }, [currentTenant?.propertyId, loadProperty]);

  useEffect(() => {
    if (!currentTenant?.id) return;
    loadMaintenance();
    loadPayments();
    loadNotifications();
    loadDocuments();
  }, [
    currentTenant?.id,
    loadDocuments,
    loadMaintenance,
    loadNotifications,
    loadPayments,
  ]);

  useEffect(() => {
    if (!currentTenant?.id || !currentProperty?.id) return;
    loadMessages();
    loadAnnouncements();
  }, [currentTenant?.id, currentProperty?.id, loadAnnouncements, loadMessages]);

  const value = useMemo<TenantContextValue>(
    () => ({
      currentTenant,
      currentProperty,
      messages,
      maintenanceRequests,
      announcements,
      payments,
      notifications,
      documents,
      loading,
      errors,
      isReady,
      loadMessages,
      loadMaintenance,
      loadAnnouncements,
      loadPayments,
      loadNotifications,
      loadDocuments,
      refetch,
      refreshAll,
      clearError,
    }),
    [
      currentProperty,
      currentTenant,
      documents,
      errors,
      loading,
      maintenanceRequests,
      messages,
      announcements,
      notifications,
      payments,
      loadAnnouncements,
      loadDocuments,
      loadMaintenance,
      loadMessages,
      loadNotifications,
      loadPayments,
      refetch,
      refreshAll,
      clearError,
    ],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
