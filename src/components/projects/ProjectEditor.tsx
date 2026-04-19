"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type ArtefactType = "text" | "link" | "image"

type Artefact = {
  id: string
  type: string
  url: string | null
  content: string | null
  label: string | null
}

type ProjectInput = {
  id: string
  title: string
  description: string
  visibility: string
  problem: string
  approach: string
  outcome: string
  reflection: string
  artefacts: Artefact[]
}

type Props = {
  project: ProjectInput
}

const VISIBILITY_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PRIVATE", label: "Private" },
  { value: "PUBLIC", label: "Public" },
]

const SECTIONS: Array<{
  key: "problem" | "approach" | "outcome" | "reflection"
  label: string
  placeholder: string
}> = [
  {
    key: "problem",
    label: "Problem & context",
    placeholder: "What problem were you trying to solve? What was the context?",
  },
  {
    key: "approach",
    label: "Approach & constraints",
    placeholder: "How did you approach it? What constraints shaped your decisions?",
  },
  {
    key: "outcome",
    label: "Outcomes & impact",
    placeholder: "What did you build or ship? What impact did it have?",
  },
  {
    key: "reflection",
    label: "Reflection",
    placeholder: "What did you learn? What was hard? What would you do differently?",
  },
]

export default function ProjectEditor({ project }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState(project.title)
  const [visibility, setVisibility] = useState(project.visibility)
  const [problem, setProblem] = useState(project.problem)
  const [approach, setApproach] = useState(project.approach)
  const [outcome, setOutcome] = useState(project.outcome)
  const [reflection, setReflection] = useState(project.reflection)
  const [artefacts, setArtefacts] = useState(project.artefacts)

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [error, setError] = useState("")

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lastSavedRef = useRef({
    title: project.title,
    visibility: project.visibility,
    problem: project.problem,
    approach: project.approach,
    outcome: project.outcome,
    reflection: project.reflection,
  })

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  async function patchProject(partial: Record<string, string>) {
    setSaveState("saving")
    setError("")

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Failed to save")
        setSaveState("error")
        return
      }

      setSaveState("saved")

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaveState("idle"), 1500)
    } catch {
      setError("Failed to save")
      setSaveState("error")
    }
  }

  async function handleBlurTitle() {
    const next = title.trim()
    if (next.length === 0) {
      setTitle(lastSavedRef.current.title)
      return
    }
    if (next === lastSavedRef.current.title) return
    lastSavedRef.current.title = next
    await patchProject({ title: next })
  }

  async function handleVisibilityChange(next: string) {
    setVisibility(next)
    lastSavedRef.current.visibility = next
    await patchProject({ visibility: next })
  }

  async function handleBlurSection(
    key: "problem" | "approach" | "outcome" | "reflection",
    value: string
  ) {
    if (value === lastSavedRef.current[key]) return
    lastSavedRef.current[key] = value
    await patchProject({ [key]: value })
  }

  async function handleDeleteProject() {
    if (!confirm("Delete this project? This cannot be undone.")) return

    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" })

    if (res.ok) {
      router.push("/projects")
    } else {
      setError("Failed to delete project")
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/projects"
            className="text-sm text-gray-500 transition hover:text-gray-800"
          >
            ← All projects
          </Link>

          <div className="flex items-center gap-3">
            <SaveIndicator state={saveState} />

            <select
              value={visibility}
              onChange={(e) => void handleVisibilityChange(e.target.value)}
              className="rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm outline-none ring-1 ring-gray-200 focus:ring-gray-300"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleDeleteProject()}
              className="rounded-full bg-white px-3 py-1.5 text-sm text-red-600 shadow-sm transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] bg-white/70 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlurTitle}
              placeholder="Untitled project"
              className="w-full bg-transparent text-3xl font-semibold tracking-tight text-gray-950 outline-none"
            />

            <div className="mt-8 space-y-8">
              {SECTIONS.map((section) => (
                <NarrativeSection
                  key={section.key}
                  label={section.label}
                  placeholder={section.placeholder}
                  value={
                    section.key === "problem"
                      ? problem
                      : section.key === "approach"
                        ? approach
                        : section.key === "outcome"
                          ? outcome
                          : reflection
                  }
                  onChange={(v) => {
                    if (section.key === "problem") setProblem(v)
                    if (section.key === "approach") setApproach(v)
                    if (section.key === "outcome") setOutcome(v)
                    if (section.key === "reflection") setReflection(v)
                  }}
                  onBlur={(v) => void handleBlurSection(section.key, v)}
                />
              ))}
            </div>
          </div>

          <ArtefactsPanel
            projectId={project.id}
            artefacts={artefacts}
            onChange={setArtefacts}
            onError={setError}
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </main>
  )
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null

  const map = {
    saving: { text: "Saving...", className: "text-gray-400" },
    saved: { text: "Saved", className: "text-gray-400" },
    error: { text: "Save failed", className: "text-red-500" },
  } as const

  const { text, className } = map[state]

  return <span className={`text-xs ${className}`}>{text}</span>
}

type NarrativeSectionProps = {
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
  onBlur: (next: string) => void
}

function NarrativeSection({ label, placeholder, value, onChange, onBlur }: NarrativeSectionProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur(value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-2xl bg-white/60 px-4 py-3 text-[15px] leading-7 text-gray-800 outline-none ring-1 ring-gray-200 transition focus:bg-white focus:ring-gray-300"
      />
    </div>
  )
}

type ArtefactsPanelProps = {
  projectId: string
  artefacts: Artefact[]
  onChange: (next: Artefact[]) => void
  onError: (message: string) => void
}

function ArtefactsPanel({ projectId, artefacts, onChange, onError }: ArtefactsPanelProps) {
  const [adding, setAdding] = useState<ArtefactType | null>(null)
  const [draftUrl, setDraftUrl] = useState("")
  const [draftContent, setDraftContent] = useState("")
  const [draftLabel, setDraftLabel] = useState("")

  function resetDraft() {
    setAdding(null)
    setDraftUrl("")
    setDraftContent("")
    setDraftLabel("")
  }

  async function handleAdd() {
    if (!adding) return

    const payload = {
      type: adding,
      url: adding === "text" ? null : draftUrl.trim(),
      content: adding === "text" ? draftContent.trim() : null,
      label: draftLabel.trim() || null,
    }

    if (adding === "text" && !payload.content) {
      resetDraft()
      return
    }
    if (adding !== "text" && !payload.url) {
      resetDraft()
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/artefacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        onError(data?.error || "Failed to add artefact")
        return
      }

      onChange([...artefacts, data])
      resetDraft()
    } catch {
      onError("Failed to add artefact")
    }
  }

  async function handleDelete(artefactId: string) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artefacts?artefactId=${artefactId}`,
        { method: "DELETE" }
      )

      if (!res.ok) {
        onError("Failed to remove artefact")
        return
      }

      onChange(artefacts.filter((a) => a.id !== artefactId))
    } catch {
      onError("Failed to remove artefact")
    }
  }

  return (
    <aside className="rounded-[28px] bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
        Evidence
      </h2>

      <div className="mt-4 space-y-3">
        {artefacts.length === 0 && !adding && (
          <p className="text-sm text-gray-400">
            Add links, images or short notes as evidence for this project.
          </p>
        )}

        {artefacts.map((artefact) => (
          <ArtefactRow
            key={artefact.id}
            artefact={artefact}
            onDelete={() => void handleDelete(artefact.id)}
          />
        ))}

        {adding && (
          <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-200">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
              New {adding}
            </p>

            {adding === "text" ? (
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="A short note or quote"
                rows={3}
                className="w-full resize-none rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none ring-1 ring-gray-200 focus:ring-gray-300"
              />
            ) : (
              <input
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder={adding === "image" ? "Image URL" : "https://..."}
                className="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none ring-1 ring-gray-200 focus:ring-gray-300"
              />
            )}

            <input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="Label (optional)"
              className="mt-2 w-full rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none ring-1 ring-gray-200 focus:ring-gray-300"
            />

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleAdd()}
                className="rounded-full bg-black px-3 py-1.5 text-xs text-white transition hover:opacity-90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <div className="mt-4 flex flex-wrap gap-2">
          <AddArtefactButton label="+ Link" onClick={() => setAdding("link")} />
          <AddArtefactButton label="+ Image" onClick={() => setAdding("image")} />
          <AddArtefactButton label="+ Note" onClick={() => setAdding("text")} />
        </div> 
      )}
    </aside>
  )
}

function AddArtefactButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
    >
      {label}
    </button>
  )
}

function ArtefactRow({
    artefact,
    onDelete,
  }: {
    artefact: Artefact
    onDelete: () => void
  }) {
    return (
      <div className="group flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
            {artefact.type}
            {artefact.label ? ` · ${artefact.label}` : ""}
          </p>
  
          {artefact.type === "link" && artefact.url && (
            <a
                href={artefact.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm text-blue-600 hover:underline"
            >
                {artefact.url}
            </a>
            )}
  
          {artefact.type === "image" && artefact.url && (
            //eslint-disable-next-line @next/next/no-img-element
            <img
              src={artefact.url}
              alt={artefact.label || "Artefact"}
              className="mt-2 w-full rounded-xl object-cover"
            />
          )}
  
          {artefact.type === "text" && artefact.content && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {artefact.content}
            </p>
          )}
        </div>
  
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remove artefact"
          className="mt-1 text-xs text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
        >
          ✕
        </button>
      </div>
    )
  }