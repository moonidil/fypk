"use client"

import { useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type LoginState = {
  email: string
  password: string
  error: string
  loading: boolean
  showPassword: boolean
}

export default function LoginPage() {
  const router = useRouter()

  const [state, setState] = useState<LoginState>({
    email: "",
    password: "",
    error: "",
    loading: false,
    showPassword: false,
  })

  const emailIsValid = useMemo(() => {
    if (!state.email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())
  }, [state.email])

  const formIsValid =
    state.email.trim().length > 0 &&
    state.password.length > 0 &&
    emailIsValid

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!formIsValid) {
      setState((s) => ({
        ...s,
        error: "Please enter a valid email and password",
      }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: "" }))

    try {
      const res = await signIn("credentials", {
        email: state.email.trim().toLowerCase(),
        password: state.password,
        redirect: false,
      })

      if (!res || res.error) {
        setState((s) => ({
          ...s,
          error: "Invalid email or password",
          loading: false,
        }))
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setState((s) => ({
        ...s,
        error: "Something went wrong. Please try again.",
        loading: false,
      }))
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Log in to Koda</h1>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Manage your identity with ease.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={state.email}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  email: e.target.value,
                  error: "",
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
              aria-invalid={!emailIsValid}
              disabled={state.loading}
              required
            />
            {state.email && !emailIsValid && (
              <p className="mt-1 text-sm text-red-500">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-500 hover:text-black hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={state.showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={state.password}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    password: e.target.value,
                    error: "",
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                disabled={state.loading}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    showPassword: !s.showPassword,
                  }))
                }
                className="absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-black"
                disabled={state.loading}
              >
                {state.showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state.loading || !formIsValid}
            className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-black hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}