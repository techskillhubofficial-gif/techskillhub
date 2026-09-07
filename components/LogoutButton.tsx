"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        width: "100%",
        marginTop: "20px",
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        background: "#ef4444",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}