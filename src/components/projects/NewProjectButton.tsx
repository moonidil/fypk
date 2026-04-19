"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

//creates a draft project then redirects to editor
export default function NewProjectButton() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  async function handleClick() {
    setIsCreating(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled project" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setIsCreating(false)
        return
      }

      router.push(`/projects/${data.id}/edit`)
    } catch {
      setIsCreating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCreating}
      className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {isCreating ? "Creating..." : "New project"}
    </button>
  )
}