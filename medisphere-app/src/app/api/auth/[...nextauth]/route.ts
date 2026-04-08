import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers: NextAuthOptions["providers"] = [
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
      };
    },
  }),
];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,

  callbacks: {
    // Runs on sign-in and on every request to refresh token
    async jwt({ token, user }) {
      // On first sign in (user present)
      if (user) {
        const email = typeof user.email === "string" ? user.email : null;
        const incomingRole =
          "role" in user && typeof user.role === "string" ? user.role : "PATIENT";

        // Ensure DB has a user with a role (Google users may not exist yet).
        // Guard against missing email/provider edge-cases to avoid callback crashes.
        if (email) {
          try {
            const dbUser =
              (await prisma.user.findUnique({ where: { email } })) ??
              (await prisma.user.create({
                data: {
                  email,
                  name: user.name ?? "",
                  image: user.image ?? null,
                  role: incomingRole,
                },
              }));

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email;
          } catch (e) {
            // Do not hard-fail OAuth callback; keep token populated from provider payload.
            console.error("NextAuth jwt callback DB sync failed:", e);
            token.role = incomingRole;
            token.name = user.name ?? token.name;
            token.email = email;
          }
        } else {
          token.role = incomingRole;
          token.name = user.name ?? token.name;
        }
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
