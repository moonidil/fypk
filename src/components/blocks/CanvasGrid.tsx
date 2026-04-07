"use client"

import { useEffect, useState } from "react"
import CanvasBlock from "./CanvasBlock"
import type { BlockContent, BlockType } from "@/types"

type Block = {
  id: string
  type: BlockType
  x: number
  y: number
  width: number
  height: number
  content: BlockContent
}

const CELL_SIZE = 120
const GAP = 12
const GRID_COLS = 8
const GRID_ROWS = 6

const BLOCK_TYPES: BlockType[] = [
  "text",
  "project",
  "skills",
  "image",
  "education",
  "link",
]

const BLOCK_SIZES = [
  { label: "Small", width: 1, height: 1 },
  { label: "Wide", width: 2, height: 1 },
  { label: "Tall", width: 1, height: 2 },
  { label: "Large", width: 2, height: 2 },
]

//checks whether two block rectangles overlap.
function rectanglesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  )
}

export default function CanvasGrid() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedType, setSelectedType] = useState<BlockType>("text")
  const [selectedSize, setSelectedSize] = useState({ width: 1, height: 1 })
  const [error, setError] = useState("")

  //loads existing blocks on mount.
  useEffect(() => {
    async function loadBlocks() {
      try {
        const res = await fetch("/api/canvas")
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Failed to load canvas")
          return
        }

        setBlocks(data)
      } catch {
        setError("Failed to load canvas")
      } finally {
        setLoading(false)
      }
    }

    loadBlocks()
  }, [])

  //checks whether a block can fit at a given position without overlapping.
  function canPlaceBlock(x: number, y: number, width: number, height: number): boolean {
    //checks that the block stays inside the grid.
    if (x < 0 || y < 0 || x + width > GRID_COLS || y + height > GRID_ROWS) {
      return false
    }

    const candidate = { x, y, width, height }

    return !blocks.some((block) =>
      rectanglesOverlap(candidate, {
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
      })
    )
  }

  //finds the next available position for a block of a given size.
  function getNextPosition(
    width: number,
    height: number
  ): { x: number; y: number } | null {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (canPlaceBlock(col, row, width, height)) {
          return { x: col, y: row }
        }
      }
    }

    return null
  }

  //creates starter content based on the selected block type.
  function getDefaultContent(type: BlockType): BlockContent {
    if (type === "text") {
      return { title: "Text block", text: "Add some text here." }
    }

    if (type === "image") {
      return {
        title: "Image block",
        imageUrl: "https://placehold.co/600x400?text=Image",
      }
    }

    if (type === "link") {
      return {
        title: "Link block",
        linkUrl: "https://example.com",
        linkLabel: "Visit link",
      }
    }

    if (type === "skills") {
      return {
        title: "Skills block",
        skills: ["React", "TypeScript"],
      }
    }

    if (type === "project") {
      return {
        title: "Project block",
        text: "Project summary goes here.",
      }
    }

    return {
      title: "Education block",
      text: "Education details go here.",
    }
  }

  async function handleAddBlock() {
    setAdding(true)
    setError("")

    const position = getNextPosition(selectedSize.width, selectedSize.height)

    if (!position) {
      setError("No space available for that block size")
      setAdding(false)
      return
    }

    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          x: position.x,
          y: position.y,
          width: selectedSize.width,
          height: selectedSize.height,
          content: getDefaultContent(selectedType),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add block")
        return
      }

      setBlocks((prev) => [...prev, data])
    } catch {
      setError("Failed to add block")
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteBlock(id: string) {
    setError("")

    try {
      const res = await fetch("/api/canvas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Failed to delete block")
        return
      }

      setBlocks((prev) => prev.filter((block) => block.id !== id))
    } catch {
      setError("Failed to delete block")
    }
  }

  const gridWidth = GRID_COLS * (CELL_SIZE + GAP) - GAP
  const gridHeight = GRID_ROWS * (CELL_SIZE + GAP) - GAP

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading canvas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/*toolbar*/}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Add block:</span>

        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`rounded-lg border px-3 py-1 text-sm capitalize transition-colors ${
              selectedType === type
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-black"
            }`}
          >
            {type}
          </button>
        ))}

        <span className="ml-2 text-sm font-medium text-gray-600">Size:</span>

        {BLOCK_SIZES.map((size) => {
          const isSelected =
            selectedSize.width === size.width &&
            selectedSize.height === size.height

          return (
            <button
              key={size.label}
              onClick={() =>
                setSelectedSize({ width: size.width, height: size.height })
              }
              className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-black"
              }`}
            >
              {size.label}
            </button>
          )
        })}

        <button
          onClick={handleAddBlock}
          disabled={adding}
          className="rounded-lg bg-black px-4 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {adding ? "Adding..." : "+ Add"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/*grid*/}
      <div
        className="relative overflow-auto rounded-2xl bg-gray-100"
        style={{ width: gridWidth, height: gridHeight }}
      >
        {/*grid background dots*/}
        {Array.from({ length: GRID_ROWS }).map((_, row) =>
          Array.from({ length: GRID_COLS }).map((_, col) => (
            <div
              key={`${col}-${row}`}
              className="absolute h-1 w-1 rounded-full bg-gray-300"
              style={{
                left: col * (CELL_SIZE + GAP) + CELL_SIZE / 2,
                top: row * (CELL_SIZE + GAP) + CELL_SIZE / 2,
              }}
            />
          ))
        )}

        {/*blocks*/}
        {blocks.map((block) => (
          <CanvasBlock key={block.id} {...block} onDelete={handleDeleteBlock} />
        ))}

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-gray-400">
              Your canvas is empty. Add a block to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}