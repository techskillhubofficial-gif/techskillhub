import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const SETUP_TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBaseUrl() {
  return "https://techskillhub.online";
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password || !Number.isFinite(port)) {
    throw new Error("TGN account setup SMTP is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function createAccountSetupToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() + SETUP_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    await tx.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  });

  return rawToken;
}

export async function sendTgnAccountSetupEmail(
  email: string,
  name: string,
  roleLabel: string,
  setupUrl: string,
) {
  const transporter = getTransporter();

  const from =
    process.env.SMTP_FROM ||
    "TechSkillHub <noreply@techskillhub.online>";

  const replyTo =
    process.env.SMTP_REPLY_TO ||
    "support@techskillhub.online";

  const firstName = name.trim().split(/\s+/)[0] || "there";

  const loginUrl = `${getBaseUrl()}/login`;

  const info = await transporter.sendMail({
    from,
    to: email,
    replyTo,
    subject: "Welcome to TechSkillHub Growth Network — Activate Your Account",
    text: `Hi ${firstName},

Welcome to the TechSkillHub Growth Network.

Your TechSkillHub account has been created successfully.

Role: ${roleLabel}

STEP 1 — ACTIVATE YOUR ACCOUNT

Set your password using your secure activation link:

${setupUrl}

This activation link expires in ${SETUP_TOKEN_EXPIRY_HOURS} hours and can only be used for your account.

STEP 2 — SIGN IN

After setting your password, sign in through the TechSkillHub Login Portal:

${loginUrl}

Please do not forward this email because the activation link is unique to your account.

If you did not apply to the TechSkillHub Growth Network, you can safely ignore this email.

TechSkillHub
support@techskillhub.online`,
  });

  console.info(
    "[TGN] Account setup email SMTP result " +
      JSON.stringify({
        to: email,
        from,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      }),
  );
}

export function getAccountSetupUrl(rawToken: string) {
  return `${getBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
}
