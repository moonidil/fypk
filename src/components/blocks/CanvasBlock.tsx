"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { BlockContent, BlockType } from "@/types"

type Props = {
  id: string
  type: BlockType
  x: number
  y: number
  width: number
  height: number
  content: BlockContent
  isSelected: boolean
  isDragging: boolean
  isResizing: boolean
  isEditing: boolean
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onStartEditing: (id: string) => void
  onStopEditing: () => void
  onSaveContent: (id: string, content: BlockContent) => Promise<void>
  onDragStart: (id: string, e: React.MouseEvent<HTMLDivElement>) => void
  onResizeStart: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void
}

//gives all blocks a clean shared base style.
const blockBase = "bg-white/85 backdrop-blur-sm border border-gray-200"

const blockLabels: Record<BlockType, string> = {
  text: "Text",
  project: "Project",
  skills: "Skills",
  image: "Image",
  education: "Education",
  link: "Link",
}

type Style = {
  position: "absolute"
  left: number
  top: number
  width: number
  height: number
}

type EditableContentProps = {
  content: BlockContent
  isEditing: boolean
  onStartEditing: () => void
  onStopEditing: () => void
  onSave: (content: BlockContent) => Promise<void>
}

function TextBlockContent({
  content,
  isEditing,
  onStartEditing,
  onStopEditing,
  onSave,
}: EditableContentProps) {
  const [title, setTitle] = useState(content.title ?? "")
  const [text, setText] = useState(content.text ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setTitle(content.title ?? "")
    setText(content.text ?? "")
  }, [content.title, content.text])

  useEffect(() => {
    if (isEditing) {
      queueMicrotask(() => {
        titleInputRef.current?.focus()
      })
    }
  }, [isEditing])

  const hasChanges = useMemo(() => {
    return title !== (content.title ?? "") || text !== (content.text ?? "")
  }, [content.title, content.text, text, title])

  async function saveIfNeeded() {
    if (!hasChanges) {
      onStopEditing()
      return
    }

    setIsSaving(true)

    try {
      await onSave({
        ...content,
        title: title.trim(),
        text: text.trim(),
      })
    } finally {
      setIsSaving(false)
      onStopEditing()
    }
  }

  if (isEditing) {
    return (
      <div
        ref={wrapperRef}
        className="mt-2 flex h-full flex-col gap-2"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onBlurCapture={(e) => {
          const nextTarget = e.relatedTarget as Node | null

          if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
            return
          }

          void saveIfNeeded()
        }}
      >
        <input
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-800 outline-none focus:border-gray-300"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something here..."
          className="min-h-[96px] flex-1 resize-none rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-gray-300"
        />

        <div className="text-[11px] text-gray-400">
          {isSaving ? "Saving..." : "Click away to save"}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onStartEditing()
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className="mt-2 block w-full rounded-lg text-left transition hover:bg-gray-50/80"
    >
      {content.title ? (
        <p className="text-sm font-medium text-gray-800">{content.title}</p>
      ) : (
        <p className="text-sm font-medium text-gray-400">Untitled text block</p>
      )}

      {content.text ? (
        <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-sm text-gray-700">
          {content.text}
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-400">Click to write.</p>
      )}
    </button>
  )
}

function LinkBlockContent({
  content,
  isEditing,
  onStartEditing,
  onStopEditing,
  onSave,
}: EditableContentProps) {
  const [title, setTitle] = useState(content.title ?? "")
  const [linkUrl, setLinkUrl] = useState(content.linkUrl ?? "")
  const [linkLabel, setLinkLabel] = useState(content.linkLabel ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setTitle(content.title ?? "")
    setLinkUrl(content.linkUrl ?? "")
    setLinkLabel(content.linkLabel ?? "")
  }, [content.linkLabel, content.linkUrl, content.title])

  useEffect(() => {
    if (isEditing) {
      queueMicrotask(() => {
        titleInputRef.current?.focus()
      })
    }
  }, [isEditing])

  const hasChanges = useMemo(() => {
    return (
      title !== (content.title ?? "") ||
      linkUrl !== (content.linkUrl ?? "") ||
      linkLabel !== (content.linkLabel ?? "")
    )
  }, [content.linkLabel, content.linkUrl, content.title, linkLabel, linkUrl, title])

  async function saveIfNeeded() {
    if (!hasChanges) {
      onStopEditing()
      return
    }

    setIsSaving(true)

    try {
      await onSave({
        ...content,
        title: title.trim(),
        linkUrl: linkUrl.trim(),
        linkLabel: linkLabel.trim(),
      })
    } finally {
      setIsSaving(false)
      onStopEditing()
    }
  }

  if (isEditing) {
    return (
      <div
        ref={wrapperRef}
        className="mt-2 flex h-full flex-col gap-2"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onBlurCapture={(e) => {
          const nextTarget = e.relatedTarget as Node | null

          if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
            return
          }

          void saveIfNeeded()
        }}
      >
        <input
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-800 outline-none focus:border-gray-300"
        />

        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com"
          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-gray-300"
        />

        <input
          value={linkLabel}
          onChange={(e) => setLinkLabel(e.target.value)}
          placeholder="Link label"
          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-gray-300"
        />

        <div className="text-[11px] text-gray-400">
          {isSaving ? "Saving..." : "Click away to save"}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onStartEditing()
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className="mt-2 block w-full rounded-lg text-left transition hover:bg-gray-50/80"
    >
      {content.title ? (
        <p className="text-sm font-medium text-gray-800">{content.title}</p>
      ) : (
        <p className="text-sm font-medium text-gray-400">Untitled link block</p>
      )}

      {content.linkUrl ? (
        <a
          href={content.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-words text-sm font-medium text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {content.linkLabel || content.linkUrl}
        </a>
      ) : (
        <p className="mt-1 text-sm text-gray-400">Click to add a link.</p>
      )}
    </button>
  )
}

//renders the inside content of each block depending on its type.
function renderBlockView(type: BlockType, content: BlockContent) {
  if (type === "image") {
    return (
      <>
        {content.title && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}

        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={content.title || "Canvas image"}
            className="mt-2 h-[calc(100%-2rem)] w-full rounded-lg object-cover"
            draggable={false}
          />
        ) : (
          <p className="mt-2 text-sm text-gray-500">No image added yet.</p>
        )}
      </>
    )
  }

  if (type === "skills") {
    return (
      <>
        {content.title && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}

        {content.skills && content.skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {content.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border bg-white px-2 py-1 text-xs text-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No skills added yet.</p>
        )}
      </>
    )
  }

  if (type === "project" || type === "education") {
    return (
      <>
        {content.title && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}

        {content.text && (
          <p className="mt-1 line-clamp-4 text-sm text-gray-700">
            {content.text}
          </p>
        )}

        {!content.title && !content.text && (
          <p className="mt-2 text-sm text-gray-500">No content added yet.</p>
        )}
      </>
    )
  }

  return null
}

export default function CanvasBlock({
  id,
  type,
  x,
  y,
  width,
  height,
  content,
  isSelected,
  isDragging,
  isResizing,
  isEditing,
  onDelete,
  onSelect,
  onStartEditing,
  onStopEditing,
  onSaveContent,
  onDragStart,
  onResizeStart,
}: Props) {
  const CELL_SIZE = 120
  const GAP = 12

  const style: Style = {
    position: "absolute",
    left: x * (CELL_SIZE + GAP),
    top: y * (CELL_SIZE + GAP),
    width: width * CELL_SIZE + (width - 1) * GAP,
    height: height * CELL_SIZE + (height - 1) * GAP,
  }

  function renderContent() {
    if (type === "text") {
      return (
        <TextBlockContent
          content={content}
          isEditing={isEditing}
          onStartEditing={() => onStartEditing(id)}
          onStopEditing={onStopEditing}
          onSave={(nextContent) => onSaveContent(id, nextContent)}
        />
      )
    }

    if (type === "link") {
      return (
        <LinkBlockContent
          content={content}
          isEditing={isEditing}
          onStartEditing={() => onStartEditing(id)}
          onStopEditing={onStopEditing}
          onSave={(nextContent) => onSaveContent(id, nextContent)}
        />
      )
    }

    return renderBlockView(type, content)
  }

  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect(id)
      }}
      className={`group relative overflow-hidden rounded-2xl p-3 transition-shadow ${
        isDragging || isResizing
          ? "shadow-lg"
          : isSelected
            ? "shadow-sm"
            : "hover:shadow-sm"
      } ${isDragging ? "opacity-80" : ""} ${isResizing ? "opacity-90" : ""} ${
        blockBase
      } ${isSelected ? "ring-2 ring-black" : ""}`}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onDragStart(id, e)
        }}
        className={`-mx-3 -mt-3 mb-2 flex h-9 items-center justify-between rounded-t-2xl px-3 ${
          isEditing ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/[0.02] to-transparent" />

        <span className="relative z-10 text-xs font-medium uppercase tracking-wide text-gray-400">
          {blockLabels[type]}
        </span>

        {(type === "text" || type === "link") && isSelected && !isEditing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onStartEditing(id)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative z-10 rounded-md px-2 py-1 text-[11px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="h-[calc(100%-2rem)] overflow-hidden">{renderContent()}</div>

      {/*delete button appears when the block is selected or hovered.*/}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute right-2 top-10 h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-500 transition hover:bg-red-200 ${
          isSelected ? "flex" : "hidden group-hover:flex"
        }`}
        aria-label="Delete block"
      >
        ✕
      </button>

      {/*resize handle lives in the bottom-right corner only.*/}
      <button
        type="button"
        aria-label="Resize block"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart(id, e)
        }}
        className={`absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-gray-300 bg-white/90 transition ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } ${isResizing ? "cursor-se-resize" : "cursor-se-resize hover:bg-gray-50"}`}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] text-gray-400">
          ↘
        </span>
      </button>
    </div>
  )
}