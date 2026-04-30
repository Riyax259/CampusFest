import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
    }
    return session;
  },
}
});