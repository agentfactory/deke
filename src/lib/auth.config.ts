import type { NextAuthConfig } from "next-auth"

// Edge-safe auth config (NO Node.js modules like bcrypt or prisma)
// Used by middleware for JWT token verification only
export const authConfig: NextAuthConfig = {
  providers: [], // Providers with DB/bcrypt access are added in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")

      if (isOnDashboard) {
        return isLoggedIn // Redirect to login if not authenticated
      }

      return true
    },
  },
}
