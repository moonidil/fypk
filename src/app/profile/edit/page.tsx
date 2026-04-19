"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type FormState = {
  displayName: string
  slug: string
  bio: string
  error: string
  success: string
  loading: boolean
  saving: boolean
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

export default function EditProfilePage() {
  const router = useRouter()

  const [state, setState] = useState<FormState>({
    displayName: "",
    slug: "",
    bio: "",
    error: "",
    success: "",
    loading: true,
    saving: false,
    slugManuallyEdited: false,
  })

  const slugIsValid = useMemo(() => {
    if (!state.slug) return true

    return (
      /^[a-z0-9-]+$/.test(state.slug) &&
      state.slug.length >= 3 &&
      state.slug.length <= 30
    )
  }, [state.slug])

  const formIsValid =
    state.displayName.trim().length > 0 &&
    state.slug.length >= 3 &&
    slugIsValid

  //loads the users current profile values on mount.
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json()

        if (!res.ok) {
          setState((s) => ({
            ...s,
            error: data.error || "Failed to load profile",
            loading: false,
          }))
          return
        }

        setState((s) => ({
          ...s,
          displayName: data.displayName || "",
          slug: data.slug || "",
          bio: data.bio || "",
          loading: false,
        }))
      } catch {
        setState((s) => ({
          ...s,
          error: "Failed to load profile",
          loading: false,
        }))
      }
    }

    loadProfile()
  }, [])

  //auto gens a slug from the display name unless user has manually edited it
  function handleDisplayNameChange(value: string) {
    setState((s) => ({
      ...s,
      displayName: value,
      slug: s.slugManuallyEdited ? s.slug : toSlug(value),
      success: "",
    }))
  }

  function handleSlugChange(value: string) {
    setState((s) => ({
      ...s,
      slug: value.toLowerCase(),
      slugManuallyEdited: true,
      success: "",
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!formIsValid) {
      setState((s) => ({ ...s, error: "Please fix the errors above" }))
      return
    }

    setState((s) => ({
      ...s,
      saving: true,
      error: "",
      success: "",
    }))

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
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
          saving: false,
        }))
        return
      }

      setState((s) => ({
        ...s,
        saving: false,
        success: "Profile updated.",
      }))

      router.refresh()
    } catch {
      setState((s) => ({
        ...s,
        error: "Something went wrong. Please try again.",
        saving: false,
      }))
    }
  }

  if (state.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edit profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Update how your page appears on Koda.
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
              disabled={state.saving}
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              Your public URL
            </label>
            <div className="flex items-center overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-black">
              <span className="select-none border-r bg-gray-50 px-3 py-2 text-sm text-gray-400">
                koda.app/
              </span>
              <input
                id="slug"
                type="text"
                value={state.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="your-name"
                disabled={state.saving}
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
            <label htmlFor="bio" className="mb-1 block text-sm font-medium">
              Bio <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={state.bio}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  bio: e.target.value,
                  success: "",
                }))
              }
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="A short line about you"
              rows={3}
              disabled={state.saving}
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {state.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-sm text-green-700">{state.success}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              disabled={state.saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={state.saving || !formIsValid}
              className="flex-1 rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}