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

const blockBase = "bg-white/85 backdrop-blur-sm border border-gray-200"


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
        className="flex min-h-full flex-col gap-2 overflow-y-auto pr-1"
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
          className="min-h-[140px] flex-1 resize-none rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-gray-300"
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
      className="block w-full rounded-lg text-left transition hover:bg-gray-50/80"
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
        className="mt-2 flex min-h-full flex-col gap-2 overflow-y-auto pr-1"
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

function ImageBlockContent({
  content,
  isEditing,
  onStartEditing,
  onStopEditing,
  onSave,
}: EditableContentProps) {
  const [title, setTitle] = useState(content.title ?? "")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setTitle(content.title ?? "")
  }, [content.title])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json().catch(() => null)

      if (!uploadRes.ok) {
        setUploadError(uploadData?.error || "Failed to upload image")
        return
      }

      await onSave({
        ...content,
        title: title.trim(),
        imageUrl: uploadData.url,
      })

      onStopEditing()
    } catch {
      setUploadError("Failed to upload image")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  async function handleRemoveImage() {
    await onSave({
      ...content,
      title: title.trim(),
      imageUrl: "",
    })

    onStopEditing()
  }

  async function handleBlurSave(e: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = e.relatedTarget as Node | null

    if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
      return
    }

    if (title !== (content.title ?? "")) {
      await onSave({
        ...content,
        title: title.trim(),
      })
    }

    onStopEditing()
  }

  if (isEditing) {
    return (
      <div
        ref={wrapperRef}
        className="mt-2 flex min-h-full flex-col gap-2 overflow-y-auto pr-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onBlurCapture={handleBlurSave}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-800 outline-none focus:border-gray-300"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : content.imageUrl ? "Replace image" : "Choose image"}
          </button>

          {content.imageUrl && (
            <button
              type="button"
              onClick={() => void handleRemoveImage()}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              disabled={isUploading}
            >
              Remove image
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />

        {uploadError && <p className="text-[11px] text-red-500">{uploadError}</p>}

        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={title || "Canvas image"}
            className="min-h-0 max-h-[320px] w-full flex-1 rounded-lg object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex min-h-[120px] flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            No image selected
          </div>
        )}
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
      className="mt-2 block h-[calc(100%-0.5rem)] w-full rounded-lg text-left transition hover:bg-gray-50/40"
    >
      {content.title ? (
        <p className="text-sm font-medium text-gray-800">{content.title}</p>
      ) : (
        <p className="text-sm font-medium text-gray-400">Untitled image block</p>
      )}

      {content.imageUrl ? (
        <img
          src={content.imageUrl}
          alt={content.title || "Canvas image"}
          className="mt-2 h-[calc(100%-1.75rem)] w-full rounded-lg object-cover"
          draggable={false}
        />
      ) : (
        <div className="mt-2 flex h-[calc(100%-1.75rem)] items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Click to add an image
        </div>
      )}
    </button>
  )
}

function renderBlockView(type: BlockType, content: BlockContent) {
  if (type === "skills") {
    return (
      <>
        {content.title && (
          <p className="text-sm font-medium text-gray-800">
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
          <p className="text-sm text-gray-500">No skills added yet.</p>
        )}
      </>
    )
  }

  if (type === "project" || type === "education") {
    return (
      <>
        {content.title && (
          <p className="text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}

        {content.text && (
          <p className="mt-1 line-clamp-4 text-sm text-gray-700">
            {content.text}
          </p>
        )}

        {!content.title && !content.text && (
          <p className="text-sm text-gray-500">No content added yet.</p>
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
  const CELL_SIZE = 96
  const GAP = 8

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

    if (type === "image") {
      return (
        <ImageBlockContent
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
      className={`group relative rounded-2xl p-3 transition-shadow ${
        isDragging || isResizing
          ? "shadow-lg"
          : isSelected
            ? "shadow-sm"
            : "hover:shadow-sm"
      } ${isDragging ? "opacity-80" : ""} ${isResizing ? "opacity-90" : ""} ${
        blockBase
      } ${isSelected ? "ring-2 ring-black" : ""} ${
        isEditing ? "z-30 overflow-visible shadow-xl" : "overflow-hidden"
      }`}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onDragStart(id, e)
        }}
        className={`-mx-3 -mt-3 mb-0 flex h-5 items-start justify-end px-3 pt-2 ${
          isEditing ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
      </div>

      <div className={`h-full ${isEditing ? "overflow-y-auto pr-1" : "overflow-hidden"}`}>{renderContent()}</div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute right-3 top-3 z-10 h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs text-red-500 transition hover:bg-red-200 ${
          isEditing ? "hidden" : isSelected ? "flex" : "hidden group-hover:flex"
        }`}
        aria-label="Delete block"
      >
        ✕
      </button>

      <button
        type="button"
        aria-label="Resize block"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart(id, e)
        }}
        className={`absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-gray-300 bg-white/90 transition ${
          isEditing ? "opacity-0 pointer-events-none" : isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } ${isResizing ? "cursor-se-resize" : "cursor-se-resize hover:bg-gray-50"}`}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] text-gray-400">
          ↘
        </span>
      </button>
    </div>
  )
}