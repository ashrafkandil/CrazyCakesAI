import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name: string; eventType: string; eventDate: string } | null = null;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || !body.name || !body.eventType || !body.eventDate) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if SMS notifications are enabled
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM content WHERE key = 'settings.sms_notifications' LIMIT 1")
    .get() as { value: string } | undefined;
  const smsEnabled = row?.value === "1";

  if (!smsEnabled) {
    return Response.json({ ok: true, message: "SMS notifications disabled" });
  }

  // Check if Twilio is configured
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromPhone = process.env["TWILIO_PHONE"];
  const toPhone = process.env["ADMIN_PHONE"]; // Admin phone number to notify

  if (!accountSid || !authToken || !fromPhone || !toPhone) {
    return Response.json({ ok: true, message: "Twilio not configured" });
  }

  try {
    // Dynamic import to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = await import("twilio");
    const client = twilio(accountSid, authToken);

    const message = `New custom quote inquiry: ${body.name} - ${body.eventType} on ${body.eventDate}. Check email for details.`;

    await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhone,
    });

    return Response.json({ ok: true, message: "SMS sent" });
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    return Response.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}