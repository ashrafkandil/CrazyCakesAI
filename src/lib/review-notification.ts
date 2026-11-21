import { getDb, getWritableDb } from "./db";
import { getContent } from "./data";

export type ContactInfo = {
  email: string;
  phone: string;
};

export function getContactInfo(): ContactInfo {
  const content = getContent();
  return {
    email: content["contact.email"] ?? "",
    phone: content["contact.phoneHref"] ?? content["contact.phone"] ?? "",
  };
}

/**
 * Format the review notification email.
 */
export function formatNotificationEmail(data: {
  author: string;
  rating: number;
  quote: string;
  reviewId: number;
}): string {
  const stars = "★".repeat(data.rating);
  const message = `New review submitted for approval

Review Details:
- Author: ${data.author}
- Rating: ${stars}
- Review ID: ${data.reviewId}
- Quote: "${data.quote}"

Approve this review at: /admin/reviews
(Enter password: crazycakes13)

---
Marwa Crazy Cakes Review Notification`;
  return message;
}

/**
 * Format the review notification SMS.
 */
export function formatNotificationSMS(data: { author: string; reviewId: number }): string {
  return `New review: "${data.author}" (ID: ${data.reviewId}). Visit /admin/reviews to approve.`;
}

/**
 * Check if SMS notifications are enabled in settings.
 */
export function shouldSendSms(): boolean {
  const db = getDb();
  try {
    const row = db
      .prepare(
        "SELECT value FROM content WHERE key = 'settings.sms_notifications' LIMIT 1",
      )
      .get() as { value: string } | undefined;
    return row?.value === "1";
  } catch {
    return true; // Default to true for safety
  }
}

/**
 * Check if Email notifications are enabled in settings.
 */
export function shouldSendEmail(): boolean {
  const db = getDb();
  try {
    const row = db
      .prepare(
        "SELECT value FROM content WHERE key = 'settings.email_notifications' LIMIT 1",
      )
      .get() as { value: string } | undefined;
    return row?.value === "1";
  } catch {
    return true; // Default to true for safety
  }
}

/**
 * Send notification via email and SMS when a new review is submitted.
 * This uses environment variables for:
 * - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (SMTP)
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE (for SMS)
 * If these are not configured, notifications are logged to console.
 *
 * Install dependencies if needed:
 * - npm install nodemailer twilio
 */
export async function notifyNewReview(data: {
  author: string;
  rating: number;
  quote: string;
  reviewId: number;
}): Promise<void> {
  const contact = getContactInfo();
  const email = formatNotificationEmail(data);
  const sms = formatNotificationSMS(data);
  const smsEnabled = shouldSendSms();
  const emailEnabled = shouldSendEmail();

  // Send email via SMTP (if configured and email notifications enabled)
  const emailHost = process.env["EMAIL_HOST"];
  if (emailHost && contact.email && emailEnabled) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore - nodemailer is an optional dependency
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: Number(process.env["EMAIL_PORT"]) || 587,
        secure: process.env["EMAIL_PORT"] === "465",
        auth: {
          user: process.env["EMAIL_USER"],
          pass: process.env["EMAIL_PASS"],
        },
      });
      await transporter.sendMail({
        from: process.env["EMAIL_USER"],
        to: contact.email,
        subject: "New Review Submitted - Marwa Crazy Cakes",
        text: email,
      });
    } catch (error) {
      console.error("Failed to send review notification email:", error);
    }
  }

  // Send SMS via Twilio (if configured and SMS notifications enabled)
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  if (accountSid && contact.phone && smsEnabled) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore - twilio is an optional dependency
      const twilio = await import("twilio");
      const client = twilio(accountSid, process.env["TWILIO_AUTH_TOKEN"]);
      await client.messages.create({
        body: sms,
        from: process.env["TWILIO_PHONE"],
        to: contact.phone,
      });
    } catch (error) {
      console.error("Failed to send review notification SMS:", error);
    }
  }

  // Fallback: log to console if no notification method configured
  if (!emailHost || !accountSid || (!smsEnabled && !emailEnabled)) {
    console.log("=== New Review Notification ===");
    console.log(email);
    if (accountSid && smsEnabled) {
      console.log("SMS: " + sms);
    } else if (!smsEnabled) {
      console.log("(SMS disabled via settings)");
    } else {
      console.log("(SMS not configured)");
    }
    if (!emailEnabled) {
      console.log("(Email disabled via settings)");
    } else if (!emailHost) {
      console.log("(Email not configured)");
    }
    console.log("===============================");
  }
}

/**
 * Get pending (unpublished) reviews.
 */
export function getPendingReviews(): Array<{
  id: number;
  author: string;
  initials: string;
  review_date: string;
  quote: string;
  rating: number;
  sort: number;
}> {
  const db = getDb();
  return db
    .prepare(
      "SELECT id, author, initials, review_date, quote, rating, sort FROM testimonials WHERE published = 0 ORDER BY id",
    )
    .all() as Array<{
      id: number;
      author: string;
      initials: string;
      review_date: string;
      quote: string;
      rating: number;
      sort: number;
    }>;
}

/**
 * Approve a pending review by setting published = 1.
 */
export function approveReview(id: number): boolean {
  const db = getWritableDb();
  try {
    const info = db.prepare("UPDATE testimonials SET published = 1 WHERE id = ?").run(id);
    return info.changes > 0;
  } catch {
    return false;
  }
}

/**
 * Delete a review permanently.
 */
export function deleteReview(id: number): boolean {
  const db = getWritableDb();
  try {
    const info = db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);
    return info.changes > 0;
  } catch {
    return false;
  }
}

/**
 * Admin page password for review approval.
 * In production, this should come from a secure environment variable.
 */
export const ADMIN_PASSWORD = "crazycakes13";