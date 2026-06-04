import {
  sendPaymentReminderEmail,
  sendPaymentConfirmationEmail,
  sendMaintenanceScheduledEmail,
  sendMaintenanceCompletedEmail,
} from "@/lib/services/email-service";

type NotificationDispatchType =
  | "paymentReminder"
  | "paymentReceived"
  | "maintenanceScheduled"
  | "maintenanceCompleted"
  | "messages";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, tenant, data } = payload as {
      type: NotificationDispatchType;
      tenant: { name?: string; email?: string };
      data?: Record<string, any>;
    };

    if (!type || !tenant?.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing type or tenant email",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const email = tenant.email;
    const name = tenant.name || "";
    const payloadData = data || {};
    let success = false;

    switch (type) {
      case "paymentReminder":
        success = await sendPaymentReminderEmail(
          email,
          name,
          payloadData.amount || 0,
          payloadData.dueDate || new Date().toLocaleDateString(),
          payloadData.currency,
        );
        break;
      case "paymentReceived":
        success = await sendPaymentConfirmationEmail(
          email,
          name,
          payloadData.amount || 0,
          payloadData.paymentDate || new Date().toLocaleDateString(),
          payloadData.transactionId || "N/A",
          payloadData.currency,
        );
        break;
      case "maintenanceScheduled":
        success = await sendMaintenanceScheduledEmail(
          email,
          name,
          payloadData.description || "Maintenance",
          payloadData.scheduledDate || new Date().toLocaleDateString(),
          payloadData.propertyName || "Your Property",
        );
        break;
      case "maintenanceCompleted":
        success = await sendMaintenanceCompletedEmail(
          email,
          name,
          payloadData.description || "Maintenance",
          payloadData.completedDate || new Date().toLocaleDateString(),
          payloadData.propertyName || "Your Property",
          payloadData.notes,
        );
        break;
      case "messages":
        success = false;
        break;
      default:
        success = false;
        break;
    }

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/notifications/email error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
