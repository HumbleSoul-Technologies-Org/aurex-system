import { TenantRecord } from "@/lib/services/tenants";
import { createNotification } from "@/lib/services/notifications";
import { NotificationPayload } from "@/lib/types/notifications";

export type NotificationDispatchType =
  | "paymentReminder"
  | "paymentReceived"
  | "maintenanceScheduled"
  | "maintenanceCompleted"
  | "messages";

const notificationTypeMap: Record<NotificationDispatchType, string> = {
  paymentReminder: "payment.reminder",
  paymentReceived: "payment.received",
  maintenanceScheduled: "maintenance.scheduled",
  maintenanceCompleted: "maintenance.completed",
  messages: "message.new",
};

export interface DispatchOptions {
  type: NotificationDispatchType;
  tenant: TenantRecord;
  data: Record<string, any>;
}

function getCanonicalNotificationType(type: NotificationDispatchType) {
  return notificationTypeMap[type] || type;
}

export interface DispatchResult {
  success: boolean;
  inApp: boolean;
  email: boolean;
  errors: string[];
}

/**
 * Log notification dispatch for debugging
 */
function logDispatch(type: string, tenantId: string, result: DispatchResult) {
  const status = result.success ? "✓" : "✗";
  const channels = [];
  if (result.inApp) channels.push("in-app");
  if (result.email) channels.push("email");

  console.log(
    `[NotificationDispatcher] ${status} ${type} sent to tenant ${tenantId} via ${channels.join(", ") || "none"}${
      result.errors.length > 0 ? ` - Errors: ${result.errors.join("; ")}` : ""
    }`,
  );
}

/**
 * Dispatch a tenant notification based on preferences
 * Checks tenant.notificationPreferences to determine which channels to use
 * Always sends in-app notifications if not explicitly disabled
 * Sends email/SMS only if enabled in preferences
 */
export async function dispatchTenantNotification(
  options: DispatchOptions,
): Promise<DispatchResult> {
  const { type, tenant, data } = options;
  const result: DispatchResult = {
    success: false,
    inApp: false,
    email: false,
    errors: [],
  };

  // Validate tenant and email
  if (!tenant || !tenant.id) {
    result.errors.push("Invalid tenant");
    logDispatch(type, "unknown", result);
    return result;
  }

  // Get notification preferences
  const prefs = tenant.notificationPreferences?.[type as any];
  if (!prefs) {
    result.errors.push(`No preferences found for notification type: ${type}`);
    logDispatch(type, tenant.id, result);
    return result;
  }

  // Always send in-app notification (can be hidden by user later)
  try {
    const notificationData = getNotificationPayload(type, tenant, data);
    await createNotification(notificationData);
    result.inApp = true;
    result.success = true;
  } catch (error) {
    result.errors.push(
      `Failed to send in-app notification: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  // Send email if enabled in preferences
  if (prefs.email && tenant.email) {
    try {
      const emailSent = await sendTenantEmail(type, tenant, data);
      if (emailSent) {
        result.email = true;
        result.success = true;
      } else {
        result.errors.push("Email failed to send (returned false)");
      }
    } catch (error) {
      result.errors.push(
        `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  logDispatch(type, tenant.id, result);
  return result;
}

/**
 * Send email based on notification type
 */
const EMAIL_API_ENDPOINT = "/api/notifications/email";

async function sendTenantEmail(
  type: NotificationDispatchType,
  tenant: TenantRecord,
  data: Record<string, any>,
): Promise<boolean> {
  if (!tenant.email) {
    return false;
  }

  try {
    const response = await fetch(EMAIL_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        tenant,
        data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email API request failed:", response.status, errorText);
      return false;
    }

    const result = await response.json();
    return result?.success === true;
  } catch (error) {
    console.error("Failed to send tenant email via API:", error);
    return false;
  }
}

/**
 * Generate notification payload for in-app display
 */
function getNotificationPayload(
  type: NotificationDispatchType,
  tenant: TenantRecord,
  data: Record<string, any>,
): NotificationPayload {
  const canonicalType = getCanonicalNotificationType(type);

  switch (type) {
    case "paymentReminder":
      return {
        type: canonicalType,
        title: "Payment Reminder",
        body: `Your rent payment of ${data.currency || "USD"} ${data.amount || 0} is due on ${data.dueDate}`,
        category: "payment" as const,
        resourceType: "payment" as const,
        resourceId: data.paymentId || tenant.id,
        tenantId: tenant.id,
        metadata: {
          amount: data.amount,
          dueDate: data.dueDate,
          currency: data.currency,
        },
      };

    case "paymentReceived":
      return {
        type: canonicalType,
        title: "Payment Received",
        body: `Your payment of ${data.currency || "USD"} ${data.amount || 0} has been received. Transaction ID: ${data.transactionId}`,
        category: "payment" as const,
        resourceType: "payment" as const,
        resourceId: data.paymentId || tenant.id,
        tenantId: tenant.id,
        metadata: {
          amount: data.amount,
          transactionId: data.transactionId,
          paymentDate: data.paymentDate,
        },
      };

    case "maintenanceScheduled":
      return {
        type: canonicalType,
        title: "Maintenance Scheduled",
        body: `Maintenance has been scheduled for ${data.scheduledDate}: ${data.description}`,
        category: "maintenance" as const,
        resourceType: "maintenance" as const,
        resourceId: data.maintenanceId || tenant.id,
        tenantId: tenant.id,
        metadata: {
          description: data.description,
          scheduledDate: data.scheduledDate,
          propertyName: data.propertyName,
        },
      };

    case "maintenanceCompleted":
      return {
        type: canonicalType,
        title: "Maintenance Completed",
        body: `Maintenance work has been completed: ${data.description}`,
        category: "maintenance" as const,
        resourceType: "maintenance" as const,
        resourceId: data.maintenanceId || tenant.id,
        tenantId: tenant.id,
        metadata: {
          description: data.description,
          completedDate: data.completedDate,
          propertyName: data.propertyName,
        },
      };

    case "messages":
      return {
        type: canonicalType,
        title: "New Message",
        body: data.preview || "You have a new message",
        category: "message" as const,
        resourceType: "message" as const,
        resourceId: data.messageId || tenant.id,
        tenantId: tenant.id,
        metadata: {
          senderName: data.senderName,
          preview: data.preview,
        },
      };

    default:
      return {
        type: "notification.general",
        title: "Notification",
        body: "You have a new notification",
        category: "general" as const,
        resourceType: "general" as const,
        resourceId: tenant.id,
        tenantId: tenant.id,
      };
  }
}
