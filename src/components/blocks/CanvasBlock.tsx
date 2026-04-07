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
  onDelete: (id: string) => void
}

//maps block types to a background colour so they are visually distinct.
const blockColours: Record<BlockType, string> = {
  text: "bg-white border",
  project: "bg-blue-50 border border-blue-200",
  skills: "bg-green-50 border border-green-200",
  image: "bg-yellow-50 border border-yellow-200",
  education: "bg-purple-50 border border-purple-200",
  link: "bg-orange-50 border border-orange-200",
}

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
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
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
            className="mt-2 block text-sm font-medium text-blue-600 hover:underline break-words"
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
                className="rounded-full bg-white px-2 py-1 text-xs text-gray-700 border"
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
          <p className="mt-1 text-sm text-gray-700 line-clamp-4">
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
  onDelete,
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
      className={`group relative overflow-hidden rounded-xl p-3 ${blockColours[type]}`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {blockLabels[type]}
      </span>

      <div className="h-[calc(100%-1.5rem)] overflow-hidden">
        {renderBlockContent(type, content)}
      </div>

      {/*delete button appears on hover.*/}
      <button
        onClick={() => onDelete(id)}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-500 hover:bg-red-200 group-hover:flex"
        aria-label="Delete block"
      >
        ✕
      </button>
    </div>
  )
}