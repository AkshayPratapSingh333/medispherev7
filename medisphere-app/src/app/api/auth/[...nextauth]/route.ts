import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Email + Password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // Return a plain object (not Prisma model proxy)
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? null,
          role: user.role,
        } as any;
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // Runs on sign-in and on every request to refresh token
    async jwt({ token, user, account, profile }) {
      // On first sign in (user present)
      if (user) {
        // Ensure DB has a user with a role (Google users may not exist yet)
        const dbUser =
          (await prisma.user.findUnique({ where: { email: user.email! } })) ??
          (await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name ?? "",
              image: (user as any).image ?? null,
              role: (user as any).role ?? "PATIENT", // default
            },
          }));

        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
      } else if (token?.email && !token?.role) {
        // Harden: ensure role is present if token came from older session
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name ?? token.name;
        }
      }
      return token;
    },

    // Controls what ends up in useSession()
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "DOCTOR" | "PATIENT") ?? "PATIENT";
        session.user.name = (token.name as string) ?? session.user.name ?? "";
        session.user.email = (token.email as string) ?? session.user.email ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
