import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      role: "ADMIN" | "DOCTOR" | "PATIENT";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    role: "ADMIN" | "DOCTOR" | "PATIENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    role: "ADMIN" | "DOCTOR" | "PATIENT";
  }
}
