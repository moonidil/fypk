"use client"

import { useEffect, useState } from "react"

export type PickerProject = {
  id: string
  title: string
  description: string | null
  visibility: string
}

type Props = {
  x: number
  y: number
  onSelect: (projectId: string) => void
  onCreateNew: () => void
  onClose: () => void
}

//shows a small picker of the user's projects plus a create new option
export default function ProjectPicker({ x, y, onSelect, onCreateNew, onClose }: Props) {
  const [projects, setProjects] = useState<PickerProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects")
        const data = await res.json()

        if (res.ok && Array.isArray(data)) {
          setProjects(data)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div
      className="absolute z-40 w-64 rounded-[24px] bg-white/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-md"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mb-1 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
        Pick a project
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto">
        {loading && (
          <p className="px-3 py-2 text-sm text-gray-400">Loading...</p>
        )}

        {!loading && projects.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-400">
            You don&apos;t have any projects yet.
          </p>
        )}

        {!loading &&
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelect(project.id)}
              className="block w-full rounded-2xl px-3 py-2.5 text-left transition hover:bg-gray-50"
            >
              <p className="truncate text-sm text-gray-800">{project.title}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-gray-400">
                {project.visibility.toLowerCase()}
              </p>
            </button>
          ))}
      </div>

      <div className="mt-1 border-t border-gray-100 pt-1">
        <button
          onClick={onCreateNew}
          className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
        >
          + New project
        </button>

        <button
          onClick={onClose}
          className="mt-1 block w-full rounded-2xl px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}