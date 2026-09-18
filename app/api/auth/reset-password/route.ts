import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 8;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeToken(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePassword(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const token = normalizeToken(body?.token);
    const password = normalizePassword(body?.password);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "This password reset link is invalid.",
        },
        { status: 400 },
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 },
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is too long.",
        },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt !== null ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: passwordHash,
        },
      });

      await tx.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: now,
        },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: {
            not: resetToken.id,
          },
        },
        data: {
          usedAt: now,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset your password right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
