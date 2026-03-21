"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#555]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#C05A3C] focus:ring-2 focus:ring-[#C05A3C]/20"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#555]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#C05A3C] focus:ring-2 focus:ring-[#C05A3C]/20"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#C05A3C] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a84d33] focus:outline-none focus:ring-2 focus:ring-[#C05A3C] focus:ring-offset-2 disabled:opacity-50"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}
