"use client"

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
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onDragStart: (id: string, e: React.MouseEvent<HTMLDivElement>) => void
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

//renders the inside content of each block depending on its type.
function renderBlockContent(type: BlockType, content: BlockContent) {
  if (type === "text") {
    return (
      <>
        {content.title && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}
        {content.text && (
          <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-sm text-gray-700">
            {content.text}
          </p>
        )}
      </>
    )
  }

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

  if (type === "link") {
    return (
      <>
        {content.title && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {content.title}
          </p>
        )}

        {content.linkUrl ? (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-words text-sm font-medium text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {content.linkLabel || content.linkUrl}
          </a>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No link added yet.</p>
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
  onDelete,
  onSelect,
  onDragStart,
}: Props) {
  //each cell is 120px wide and 120px tall with a 12px gap.
  const CELL_SIZE = 120
  const GAP = 12

  const style: Style = {
    position: "absolute",
    left: x * (CELL_SIZE + GAP),
    top: y * (CELL_SIZE + GAP),
    width: width * CELL_SIZE + (width - 1) * GAP,
    height: height * CELL_SIZE + (height - 1) * GAP,
  }

  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        onDragStart(id, e)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect(id)
      }}
      className={`group relative overflow-hidden rounded-2xl p-3 transition-shadow ${
        isDragging ? "cursor-grabbing opacity-80 shadow-lg" : "cursor-grab"
      } ${blockBase} ${isSelected ? "ring-2 ring-black" : "hover:shadow-sm"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/[0.02] to-transparent" />

      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {blockLabels[type]}
      </span>

      <div className="h-[calc(100%-1.5rem)] overflow-hidden">
        {renderBlockContent(type, content)}
      </div>

      {/*delete button appears when the block is selected or hovered.*/}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-500 transition hover:bg-red-200 ${
          isSelected ? "flex" : "hidden group-hover:flex"
        }`}
        aria-label="Delete block"
      >
        ✕
      </button>
    </div>
  )
}