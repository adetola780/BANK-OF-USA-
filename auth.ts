import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;

      const googleProfile = profile as {
        email?: string;
        email_verified?: boolean;
      };

      return Boolean(googleProfile.email && googleProfile.email_verified);
    },
  },
});
