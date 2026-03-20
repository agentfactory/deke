import { auth } from "@/lib/auth"

/**
 * Require authentication in API routes. Throws a Response if not authenticated.
 * Use for defense-in-depth or mixed public/private endpoints.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  return session
}
