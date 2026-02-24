import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import Resend from "next-auth/providers/resend";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || "noreply@cruiseconnecthub.com",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "member";
      }
      if (account?.provider === "twitter") {
        token.twitterHandle = (profile as any)?.screen_name;
        token.twitterId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).twitterHandle = token.twitterHandle;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-assign member role on creation
      console.log("New user created:", user.email);
    },
  },
});
