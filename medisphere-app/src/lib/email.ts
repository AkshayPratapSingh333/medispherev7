// lib/email.ts
import sgMail from "@sendgrid/mail";

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

/**
 * Send an email via SendGrid
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_KEY) {
    console.warn("SendGrid not configured. Email skipped:", { to, subject });
    return;
  }
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM || "noreply@telemed.example",
      subject,
      html,
    });
  } catch (err) {
    console.error("sendEmail error", err);
  }
}
