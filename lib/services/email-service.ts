import nodemailer from "nodemailer";

type EmailServiceConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

let emailTransporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter with Nodemailer configuration
 * Reads from environment variables:
 * - EMAIL_HOST
 * - EMAIL_PORT
 * - EMAIL_SECURE (true/false)
 * - EMAIL_USER
 * - EMAIL_PASS
 * - EMAIL_FROM (default sender)
 */
export function initializeEmailService(): nodemailer.Transporter {
  if (emailTransporter) {
    return emailTransporter;
  }

  const config: EmailServiceConfig = {
    host: process.env.EMAIL_HOST || "localhost",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  };

  emailTransporter = nodemailer.createTransport(config);

  // Verify connection on initialization
  emailTransporter
    .verify()
    .then(() => {
      console.log("[Email Service] SMTP connection verified");
    })
    .catch((err) => {
      console.error("[Email Service] SMTP connection failed:", err);
    });

  return emailTransporter;
}

/**
 * Get the email transporter, initializing if necessary
 */
function getTransporter(): nodemailer.Transporter {
  if (!emailTransporter) {
    return initializeEmailService();
  }
  return emailTransporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send a plain email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    if (!from) {
      console.error("[Email Service] No EMAIL_FROM configured");
      return false;
    }

    const info = await transporter.sendMail({
      from,
      ...options,
    });

    console.log(`[Email Service] Email sent to ${options.to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(
      `[Email Service] Failed to send email to ${options.to}:`,
      error,
    );
    return false;
  }
}

/**
 * Email template for payment reminder
 */
export function getPaymentReminderTemplate(
  tenantName: string,
  amount: number,
  dueDate: string,
  currency: string = "USD",
): string {
  const currencySymbol = currency === "USD" ? "$" : currency;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .amount { font-size: 32px; font-weight: bold; color: #0066cc; }
          .due-date { color: #666; margin-top: 10px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Payment Reminder</h2>
          <p>Hello ${tenantName},</p>
          <p>This is a reminder that your rent payment is due.</p>
          <div class="header">
            <div class="amount">${currencySymbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="due-date">Due: ${dueDate}</div>
          </div>
          <p>Please make your payment on time to avoid late fees.</p>
          <p>Thank you,<br/>Your Property Manager</p>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for payment confirmation
 */
export function getPaymentConfirmationTemplate(
  tenantName: string,
  amount: number,
  paymentDate: string,
  transactionId: string,
  currency: string = "USD",
): string {
  const currencySymbol = currency === "USD" ? "$" : currency;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { color: #228B22; font-weight: bold; font-size: 18px; }
          .header { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #228B22; }
          .amount { font-size: 28px; font-weight: bold; color: #228B22; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <p class="success">✓ Payment Received</p>
          <p>Hello ${tenantName},</p>
          <p>Thank you for your payment. Here's your receipt:</p>
          <div class="header">
            <div class="amount">${currencySymbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="details">
            <div class="detail-row">
              <span>Payment Date:</span>
              <span>${paymentDate}</span>
            </div>
            <div class="detail-row">
              <span>Transaction ID:</span>
              <span>${transactionId}</span>
            </div>
          </div>
          <p>Your payment has been successfully processed. Thank you!</p>
          <p>Best regards,<br/>Your Property Manager</p>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for maintenance scheduled
 */
export function getMaintenanceScheduledTemplate(
  tenantName: string,
  description: string,
  scheduledDate: string,
  propertyName: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Maintenance Scheduled</h2>
          <p>Hello ${tenantName},</p>
          <p>A maintenance request has been scheduled for your unit.</p>
          <div class="header">
            <h3 style="margin-top: 0;">${description}</h3>
            <p>at ${propertyName}</p>
          </div>
          <div class="details">
            <div class="detail-row"><strong>Scheduled Date:</strong> ${scheduledDate}</div>
            <div class="detail-row"><strong>Description:</strong> ${description}</div>
          </div>
          <p>Please ensure someone is available at the scheduled time. If you need to reschedule, please contact management.</p>
          <p>Thank you,<br/>Your Property Manager</p>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for maintenance completed
 */
export function getMaintenanceCompletedTemplate(
  tenantName: string,
  description: string,
  completedDate: string,
  propertyName: string,
  notes?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { color: #228B22; font-weight: bold; font-size: 18px; }
          .header { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #228B22; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <p class="success">✓ Maintenance Completed</p>
          <p>Hello ${tenantName},</p>
          <p>The maintenance work on your unit has been completed.</p>
          <div class="header">
            <h3 style="margin-top: 0;">${description}</h3>
            <p>at ${propertyName}</p>
          </div>
          <div class="details">
            <div class="detail-row"><strong>Completed Date:</strong> ${completedDate}</div>
            <div class="detail-row"><strong>Work Description:</strong> ${description}</div>
            ${notes ? `<div class="detail-row"><strong>Notes:</strong> ${notes}</div>` : ""}
          </div>
          <p>If you have any concerns about the work performed, please contact management.</p>
          <p>Thank you,<br/>Your Property Manager</p>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send a payment reminder email to tenant
 */
export async function sendPaymentReminderEmail(
  tenantEmail: string,
  tenantName: string,
  amount: number,
  dueDate: string,
  currency?: string,
): Promise<boolean> {
  const html = getPaymentReminderTemplate(
    tenantName,
    amount,
    dueDate,
    currency,
  );
  return sendEmail({
    to: tenantEmail,
    subject: `Payment Reminder: ${currency || "USD"} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} Due`,
    html,
  });
}

/**
 * Send a payment confirmation email to tenant
 */
export async function sendPaymentConfirmationEmail(
  tenantEmail: string,
  tenantName: string,
  amount: number,
  paymentDate: string,
  transactionId: string,
  currency?: string,
): Promise<boolean> {
  const html = getPaymentConfirmationTemplate(
    tenantName,
    amount,
    paymentDate,
    transactionId,
    currency,
  );
  return sendEmail({
    to: tenantEmail,
    subject: `Payment Confirmation: ${currency || "USD"} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    html,
  });
}

/**
 * Send maintenance scheduled email to tenant
 */
export async function sendMaintenanceScheduledEmail(
  tenantEmail: string,
  tenantName: string,
  description: string,
  scheduledDate: string,
  propertyName: string,
): Promise<boolean> {
  const html = getMaintenanceScheduledTemplate(
    tenantName,
    description,
    scheduledDate,
    propertyName,
  );
  return sendEmail({
    to: tenantEmail,
    subject: `Maintenance Scheduled: ${description}`,
    html,
  });
}

/**
 * Send maintenance completed email to tenant
 */
export async function sendMaintenanceCompletedEmail(
  tenantEmail: string,
  tenantName: string,
  description: string,
  completedDate: string,
  propertyName: string,
  notes?: string,
): Promise<boolean> {
  const html = getMaintenanceCompletedTemplate(
    tenantName,
    description,
    completedDate,
    propertyName,
    notes,
  );
  return sendEmail({
    to: tenantEmail,
    subject: `Maintenance Completed: ${description}`,
    html,
  });
}
