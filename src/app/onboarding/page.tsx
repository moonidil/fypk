"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type FormState = {
  displayName: string
  slug: string
  bio: string
  error: string
  loading: boolean
  slugManuallyEdited: boolean
}

//converts a display name into a valid slug suggestion
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30)
}

export default function OnboardingPage() {
  const router = useRouter()

  const [state, setState] = useState<FormState>({
    displayName: "",
    slug: "",
    bio: "",
    error: "",
    loading: false,
    slugManuallyEdited: false,
  })

  const slugIsValid = useMemo(() => {
    if (!state.slug) return true
    return /^[a-z0-9-]+$/.test(state.slug) &&
      state.slug.length >= 3 &&
      state.slug.length <= 30
  }, [state.slug])

  const formIsValid =
    state.displayName.trim().length > 0 &&
    state.slug.length >= 3 &&
    slugIsValid

  //auto gens a slug from the display name unless  user has manually edited it
  function handleDisplayNameChange(value: string) {
    setState((s) => ({
      ...s,
      displayName: value,
      slug: s.slugManuallyEdited ? s.slug : toSlug(value),
    }))
  }

  function handleSlugChange(value: string) {
    setState((s) => ({
      ...s,
      slug: value.toLowerCase(),
      slugManuallyEdited: true,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!formIsValid) {
      setState((s) => ({ ...s, error: "Please fix the errors above" }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: "" }))

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: state.displayName,
          slug: state.slug,
          bio: state.bio,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState((s) => ({
          ...s,
          error: data.error || "Something went wrong",
          loading: false,
        }))
        return
      }

      router.push("/dashboard")
    } catch {
      setState((s) => ({
        ...s,
        error: "Something went wrong. Please try again.",
        loading: false,
      }))
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-green-500">
            This is how others will find and see you on Koda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium"
            >
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={state.displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your name or alias"
              disabled={state.loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-1 block text-sm font-medium"
            >
              Your public URL
            </label>
            <div className="flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-black overflow-hidden">
              <span className="bg-gray-50 px-3 py-2 text-sm text-gray-400 border-r select-none">
                koda.app/
              </span>
              <input
                id="slug"
                type="text"
                value={state.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="your-name"
                disabled={state.loading}
                required
              />
            </div>
            {state.slug && !slugIsValid && (
              <p className="mt-1 text-sm text-red-500">
                Only lowercase letters, numbers and hyphens. 3–30 characters.
              </p>
            )}
            {state.slug && slugIsValid && (
              <p className="mt-1 text-sm text-gray-400">
                koda.app/{state.slug}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium"
            >
              Bio{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={state.bio}
              onChange={(e) =>
                setState((s) => ({ ...s, bio: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="A bit about you..."
              rows={3}
              disabled={state.loading}
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state.loading || !formIsValid}
            className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.loading ? "Creating profile..." : "Create profile"}
          </button>
        </form>
      </div>
    </main>
  )
}