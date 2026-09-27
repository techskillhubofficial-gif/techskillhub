import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password || !Number.isFinite(port)) {
    throw new Error("Counselling notification SMTP is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatIndiaDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

export async function sendCounsellingScheduledEmail({
  recipientEmail,
  recipientName,
  leadName,
  leadEmail,
  leadPhone,
  program,
  scheduledAt,
  durationMinutes,
  mode,
  meetingLink,
  notes,
  scheduledBy,
  admissionUrl,
}: {
  recipientEmail: string;
  recipientName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  program: string;
  scheduledAt: Date;
  durationMinutes: number;
  mode: string;
  meetingLink?: string | null;
  notes?: string | null;
  scheduledBy: string;
  admissionUrl: string;
}) {
  const recipients = Array.from(
    new Set(
      [
        recipientEmail.trim().toLowerCase(),
        process.env.COUNSELLING_NOTIFICATION_EMAIL
          ?.trim()
          .toLowerCase(),
      ].filter(Boolean),
    ),
  );

  if (recipients.length === 0) {
    throw new Error("No counselling notification recipient configured.");
  }

  const transporter = getTransporter();

  const from =
    process.env.SMTP_FROM ||
    "TechSkillHub <noreply@techskillhub.online>";

  const replyTo =
    process.env.SMTP_REPLY_TO ||
    "support@techskillhub.online";

  const firstName =
    recipientName.trim().split(/\s+/)[0] || "Administrator";

  const dateText = formatIndiaDate(scheduledAt);

  const safeFirstName = escapeHtml(firstName);
  const safeLeadName = escapeHtml(leadName);
  const safeLeadEmail = escapeHtml(leadEmail);
  const safeLeadPhone = escapeHtml(leadPhone);
  const safeProgram = escapeHtml(program);
  const safeDateText = escapeHtml(dateText);
  const safeMode = escapeHtml(
    mode === "IN_PERSON" ? "In person" : "Online",
  );
  const safeMeetingLink = meetingLink
    ? escapeHtml(meetingLink)
    : "";
  const safeNotes = notes ? escapeHtml(notes) : "";
  const safeScheduledBy = escapeHtml(scheduledBy);
  const safeAdmissionUrl = escapeHtml(admissionUrl);

  await transporter.sendMail({
    from,
    to: recipients.join(", "),
    replyTo,
    subject: `New counselling scheduled — ${leadName}`,
    text: `Hi ${firstName},

A new counselling session has been scheduled with you on TechSkillHub.

Student / Lead: ${leadName}
Email: ${leadEmail}
Phone: ${leadPhone}
Program: ${program}

Scheduled for: ${dateText}
Duration: ${durationMinutes} minutes
Mode: ${mode === "IN_PERSON" ? "In person" : "Online"}

${meetingLink ? `Meeting link: ${meetingLink}\n` : ""}
${notes ? `Notes: ${notes}\n` : ""}

Scheduled by: ${scheduledBy}

Open TechSkillHub Admissions:
${admissionUrl}

TechSkillHub
support@techskillhub.online`,
    html: `
      <div style="margin:0;background:#f7f9fc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden">
          <div style="padding:28px 30px;border-bottom:1px solid #e2e8f0">
            <div style="font-size:11px;font-weight:700;letter-spacing:.16em;color:#2563eb;text-transform:uppercase">
              TechSkillHub
            </div>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2">
              New counselling scheduled
            </h1>
            <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6">
              Hi ${safeFirstName}, a counselling session has been assigned to you.
            </p>
          </div>

          <div style="padding:26px 30px">
            <div style="border:1px solid #dbeafe;background:#eff6ff;border-radius:16px;padding:18px">
              <div style="font-size:12px;color:#64748b">Student / Lead</div>
              <div style="margin-top:5px;font-size:18px;font-weight:700">${safeLeadName}</div>

              <div style="margin-top:14px;font-size:13px;color:#475569">
                ${safeLeadEmail}<br />
                ${safeLeadPhone}<br />
                ${safeProgram}
              </div>
            </div>

            <div style="margin-top:18px;display:grid;gap:10px">
              <div><strong>Scheduled:</strong> ${safeDateText}</div>
              <div><strong>Duration:</strong> ${durationMinutes} minutes</div>
              <div><strong>Mode:</strong> ${safeMode}</div>
              ${safeMeetingLink ? `<div><strong>Meeting link:</strong> <a href="${safeMeetingLink}" style="color:#2563eb">${safeMeetingLink}</a></div>` : ""}
              ${safeNotes ? `<div><strong>Notes:</strong> ${safeNotes}</div>` : ""}
              <div><strong>Scheduled by:</strong> ${safeScheduledBy}</div>
            </div>

            <a href="${safeAdmissionUrl}"
              style="display:inline-block;margin-top:22px;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:700">
              Open TechSkillHub Admissions
            </a>
          </div>

          <div style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px">
            TechSkillHub · support@techskillhub.online
          </div>
        </div>
      </div>
    `,
  });
}
