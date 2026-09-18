import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const RESET_TOKEN_EXPIRY_HOURS = 1;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

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

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password || !Number.isFinite(port)) {
    throw new Error("Password reset SMTP service is not configured.");
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

async function sendResetEmail(
  email: string,
  name: string,
  resetUrl: string,
) {
  const from =
    process.env.SMTP_FROM ||
    "TechSkillHub <noreply@techskillhub.online>";
  const replyTo =
    process.env.SMTP_REPLY_TO || "support@techskillhub.online";

  const transporter = getSmtpTransporter();

  const firstName = name.trim().split(/\s+/)[0] || "there";
  const safeFirstName = escapeHtml(firstName);
  const safeResetUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from,
    to: email,
    replyTo,
    subject: "Reset your TechSkillHub password",
    text: `Hi ${firstName},

We received a request to reset your TechSkillHub account password.

Reset your password here:
${resetUrl}

This link will expire in ${RESET_TOKEN_EXPIRY_HOURS} hour.

If you did not request a password reset, you can safely ignore this email. Your password will not change.

TechSkillHub
Learn. Build. Earn.`,
    html: `
      <div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:40px">
          <div style="margin-bottom:28px">
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#2563eb">
              TechSkillHub
            </div>
          </div>

          <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;color:#0f172a">
            Reset your password
          </h1>

          <p style="font-size:16px;line-height:1.7;margin:0 0 14px;color:#475569">
            Hi ${safeFirstName},
          </p>

          <p style="font-size:16px;line-height:1.7;margin:0 0 28px;color:#475569">
            We received a request to reset your TechSkillHub account password.
            Click the button below to create a new password.
          </p>

          <a
            href="${safeResetUrl}"
            style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 24px;border-radius:12px"
          >
            Reset Password
          </a>

          <p style="font-size:14px;line-height:1.6;margin:28px 0 8px;color:#64748b">
            This link will expire in ${RESET_TOKEN_EXPIRY_HOURS} hour.
          </p>

          <p style="font-size:14px;line-height:1.6;margin:0;color:#64748b">
            If you did not request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0">
            <p style="font-size:12px;line-height:1.5;margin:0;color:#94a3b8">
              TechSkillHub · Learn. Build. Earn.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);

    if (!email || !email.includes("@") || email.length > 320) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const genericMessage =
      "If an account exists with that email address, a password reset link has been sent.";

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: genericMessage,
      });
    }

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;

    try {
      await sendResetEmail(user.email, user.name, resetUrl);
    } catch (emailError) {
      console.error("Password reset SMTP email error:", emailError);

      await prisma.passwordResetToken.updateMany({
        where: {
          tokenHash,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "We couldn't send the password reset email right now. Please try again later.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process the password reset request right now.",
      },
      { status: 500 },
    );
  }
}
