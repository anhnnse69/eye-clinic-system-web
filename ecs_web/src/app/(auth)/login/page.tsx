"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { isValidEmail } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-on-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Welcome Back</h1>
            <p className="text-on-surface-variant mt-2">
              Sign in to Eye Clinic Support System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-error text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-on-surface">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low",
                  "text-on-surface placeholder:text-on-surface-variant",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                  "transition-colors"
                )}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low",
                    "text-on-surface placeholder:text-on-surface-variant",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    "transition-colors pr-12"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-lg font-medium text-on-primary bg-primary",
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant">
            <p className="text-center text-sm text-on-surface-variant">
              Demo Accounts:
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 rounded bg-surface-container-low">
                <span className="font-medium">System Admin:</span> system@ecs.vn / admin123
              </div>
              <div className="p-2 rounded bg-surface-container-low">
                <span className="font-medium">Clinic Admin:</span> clinic@ecs.vn / admin123
              </div>
              <div className="p-2 rounded bg-surface-container-low">
                <span className="font-medium">Doctor:</span> doctor@ecs.vn / admin123
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          © 2024 Eye Clinic Support System. All rights reserved.
        </p>
      </div>
    </div>
  )
}
