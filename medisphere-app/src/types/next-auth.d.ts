// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "ADMIN" | "DOCTOR" | "PATIENT";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "DOCTOR" | "PATIENT";
    } & DefaultSession["user"];
  }
}
