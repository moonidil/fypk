"use client"

import type { BlockType } from "@/types"

type Props = {
  x: number
  y: number
  onSelect: (type: BlockType) => void
  onClose: () => void
}

const BLOCK_TYPES: BlockType[] = [
  "text",
  "project",
  "skills",
  "image",
  "education",
  "link",
]

//shows a small add menu at the selected grid anchor.
export default function CanvasAddMenu({ x, y, onSelect, onClose }: Props) {
  return (
    <div
      className="absolute z-40 w-56 rounded-[24px] bg-white/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-md"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mb-1 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
        Add block
      </div>

      <div className="space-y-1">
        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm capitalize text-gray-700 transition hover:bg-gray-50"
          >
            {type}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-2 w-full rounded-2xl px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  )
}