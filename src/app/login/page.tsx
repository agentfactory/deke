import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LoginForm } from "./login-form"

export const metadata = { title: "Login" }

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="mx-auto w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold tracking-[3px] text-[#1a1a1a]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            DEKE
          </h1>
          <div className="mx-auto mt-2 h-[3px] w-8 rounded-full bg-[#C05A3C]" />
          <p className="mt-4 text-sm text-[#777]">Sign in to the dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
