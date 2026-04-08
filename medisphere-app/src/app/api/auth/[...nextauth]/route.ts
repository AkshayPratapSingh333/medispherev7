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
      try {
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
      } catch (error) {
        console.error("NextAuth credentials authorize failed:", error);
        return null;
      }
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
    // Keep jwt callback read-only: adapter handles user/account creation.
    async jwt({ token, user }) {
      if (user) {
        token.id = (user.id as string | undefined) ?? (token.sub as string | undefined) ?? token.id;
      }

      if (token?.email && (!token?.role || !token?.id)) {
        try {
          // Read role/id from DB without creating users here.
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true, name: true, email: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name ?? token.name;
            token.email = dbUser.email;
          }
        } catch (error) {
          // Avoid throwing from auth callbacks; NextAuth converts throws to error=Callback redirects.
          console.error("NextAuth jwt callback DB lookup failed:", error);
        }
      }

      token.role = (token.role as "ADMIN" | "DOCTOR" | "PATIENT" | undefined) ?? "PATIENT";
      return token;
    },

    // Controls what ends up in useSession()
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string) ?? "";
        session.user.role = (token.role as "ADMIN" | "DOCTOR" | "PATIENT") ?? "PATIENT";
        session.user.name = (token.name as string) ?? session.user.name ?? "";
        session.user.email = (token.email as string) ?? session.user.email ?? "";
      }
      return session;
    },

    // Keep redirects on same-origin paths to avoid callback URL validation failures.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        // Fall back to base URL when callback URL is malformed.
      }

      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
