import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "STUDENT" | "MENTOR" | "ADMIN" | "TGN_TEAM_LEADER" | "TGN_EXECUTIVE";
    };
  }

  interface User {
    id: string;
    role: "STUDENT" | "MENTOR" | "ADMIN" | "TGN_TEAM_LEADER" | "TGN_EXECUTIVE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "STUDENT" | "MENTOR" | "ADMIN" | "TGN_TEAM_LEADER" | "TGN_EXECUTIVE";
  }
}