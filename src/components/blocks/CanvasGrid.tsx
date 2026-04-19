"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import CanvasBlock from "./CanvasBlock"
import CanvasAddMenu from "./CanvasAddMenu"
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

type HeroLayer = {
  displayName: string
  slug: string
  bio: string | null
  x: number
  y: number
  width: number
}

type Props = {
  hero: HeroLayer
}

type DragState = {
  id: string
  offsetX: number
  offsetY: number
  originalX: number
  originalY: number
} | null

type ResizeState = {
  id: string
  originalWidth: number
  originalHeight: number
} | null

const CELL_SIZE = 80
const GAP = 6
const GRID_COLS = 12
const GRID_ROWS = 12

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

export default function CanvasGrid({ hero }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dragState, setDragState] = useState<DragState>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState>(null)
  const [resizePreview, setResizePreview] = useState<{
    width: number
    height: number
  } | null>(null)

  const gridRef = useRef<HTMLDivElement | null>(null)

  const heroRect = useMemo(() => {
    return {
      x: hero.x,
      y: hero.y,
      width: hero.width,
      height: 2,
    }
  }, [hero.width, hero.x, hero.y])

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

  const displayedBlocks = useMemo(() => {
    return blocks.map((block) => {
      if (dragState && dragPreview && block.id === dragState.id) {
        return { ...block, x: dragPreview.x, y: dragPreview.y }
      }

      if (resizeState && resizePreview && block.id === resizeState.id) {
        return {
          ...block,
          width: resizePreview.width,
          height: resizePreview.height,
        }
      }

      return block
    })
  }, [blocks, dragPreview, dragState, resizePreview, resizeState])

  function canPlaceBlockAt(
    x: number,
    y: number,
    width: number,
    height: number,
    ignoreBlockId?: string
  ): boolean {
    if (x < 0 || y < 0 || x + width > GRID_COLS || y + height > GRID_ROWS) {
      return false
    }

    const candidate = { x, y, width, height }

    if (rectanglesOverlap(candidate, heroRect)) {
      return false
    }

    return !blocks.some((block) => {
      if (block.id === ignoreBlockId) return false

      return rectanglesOverlap(candidate, {
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
      })
    })
  }

  function getBlockAtCell(x: number, y: number): Block | null {
    return (
      blocks.find((block) =>
        rectanglesOverlap(
          { x, y, width: 1, height: 1 },
          {
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
          }
        )
      ) || null
    )
  }

  function getSnappedBlockPosition(
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ) {
    const grid = gridRef.current
    if (!grid) return null

    const rect = grid.getBoundingClientRect()
    const rawLeft = clientX - rect.left - offsetX
    const rawTop = clientY - rect.top - offsetY

    return {
      x: Math.round(rawLeft / (CELL_SIZE + GAP)),
      y: Math.round(rawTop / (CELL_SIZE + GAP)),
    }
  }

  function getSnappedBlockSize(
    block: Block,
    clientX: number,
    clientY: number
  ) {
    const grid = gridRef.current
    if (!grid) return null

    const rect = grid.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top

    const blockLeft = block.x * (CELL_SIZE + GAP)
    const blockTop = block.y * (CELL_SIZE + GAP)

    const rawWidth = Math.round((localX - blockLeft + GAP) / (CELL_SIZE + GAP))
    const rawHeight = Math.round((localY - blockTop + GAP) / (CELL_SIZE + GAP))

    const width = Math.max(1, Math.min(5, rawWidth))
    const height = Math.max(1, Math.min(5, rawHeight))

    return { width, height }
  }

  function getDefaultContent(type: BlockType): BlockContent {
    if (type === "text") {
      return { title: "Text", text: "Add some text here." }
    }

    if (type === "image") {
      return {
        title: "Image",
        imageUrl: "",
      }
    }

    if (type === "link") {
      return {
        title: "Link",
        linkUrl: "https://example.com",
        linkLabel: "Visit link",
      }
    }

    if (type === "skills") {
      return {
        title: "Skills",
        skills: ["React", "TypeScript"],
      }
    }

    if (type === "project") {
      return {
        title: "Project",
        text: "Project summary goes here.",
        linkUrl: "https://github.com/",
        linkLabel: "Repository",
      }
    }

    return {
      title: "Education",
      text: "Education details go here.",
    }
  }

  function getInitialSize(type: BlockType) {
    if (type === "skills") {
      return { width: 2, height: 1 }
    }

    if (type === "link") {
      return { width: 2, height: 1 }
    }

    if (type === "image") {
      return { width: 2, height: 2 }
    }

    if (type === "project") {
      return { width: 2, height: 2 }
    }

    if (type === "education") {
      return { width: 2, height: 2 }
    }

    return { width: 2, height: 2 }
  }

  function findFirstAvailablePosition(width: number, height: number) {
    for (let row = 0; row <= GRID_ROWS - height; row += 1) {
      for (let col = 0; col <= GRID_COLS - width; col += 1) {
        if (canPlaceBlockAt(col, row, width, height)) {
          return { x: col, y: row }
        }
      }
    }

    return null
  }

  function handleSurfaceClick() {
    if (dragState || resizeState) return
    setSelectedBlockId(null)
    setMenuOpen(false)
  }

  async function handleAddBlock(type: BlockType) {
    const size = getInitialSize(type)
    const position = findFirstAvailablePosition(size.width, size.height)

    if (!position) {
      setError("No space left on the canvas for that block.")
      setMenuOpen(false)
      return
    }

    setError("")

    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          content: getDefaultContent(type),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add block")
        return
      }

      setBlocks((prev) => [...prev, data])
      setSelectedBlockId(data.id)
      setEditingBlockId(data.id)
      setMenuOpen(false)
    } catch {
      setError("Failed to add block")
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

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Failed to delete block")
        return
      }

      setBlocks((prev) => prev.filter((block) => block.id !== id))
      setSelectedBlockId((current) => (current === id ? null : current))
      setEditingBlockId((current) => (current === id ? null : current))
    } catch {
      setError("Failed to delete block")
    }
  }

  async function handleSaveContent(id: string, content: BlockContent) {
    setError("")

    const previousBlocks = blocks
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    )

    try {
      const res = await fetch("/api/canvas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setBlocks(previousBlocks)
        setError(data?.error || "Failed to save block")
      }
    } catch {
      setBlocks(previousBlocks)
      setError("Failed to save block")
    }
  }

  function handleDragStart(id: string, e: React.MouseEvent<HTMLDivElement>) {
    if (editingBlockId) return

    const block = blocks.find((item) => item.id === id)
    const grid = gridRef.current

    if (!block || !grid) return

    const rect = grid.getBoundingClientRect()
    const blockLeft = block.x * (CELL_SIZE + GAP)
    const blockTop = block.y * (CELL_SIZE + GAP)

    setDragState({
      id,
      offsetX: e.clientX - rect.left - blockLeft,
      offsetY: e.clientY - rect.top - blockTop,
      originalX: block.x,
      originalY: block.y,
    })

    setSelectedBlockId(id)
    setMenuOpen(false)
  }

  function handleResizeStart(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (editingBlockId) return

    const block = blocks.find((item) => item.id === id)
    if (!block) return

    setResizeState({
      id,
      originalWidth: block.width,
      originalHeight: block.height,
    })

    setSelectedBlockId(id)
    setMenuOpen(false)
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (dragState) {
        const block = blocks.find((item) => item.id === dragState.id)
        if (!block) return

        const nextPosition = getSnappedBlockPosition(
          e.clientX,
          e.clientY,
          dragState.offsetX,
          dragState.offsetY
        )

        if (!nextPosition) return

        if (
          canPlaceBlockAt(
            nextPosition.x,
            nextPosition.y,
            block.width,
            block.height,
            dragState.id
          )
        ) {
          setDragPreview(nextPosition)
        }

        return
      }

      if (resizeState) {
        const block = blocks.find((item) => item.id === resizeState.id)
        if (!block) return

        const nextSize = getSnappedBlockSize(block, e.clientX, e.clientY)
        if (!nextSize) return

        if (
          canPlaceBlockAt(
            block.x,
            block.y,
            nextSize.width,
            nextSize.height,
            block.id
          )
        ) {
          setResizePreview(nextSize)
        }
      }
    }

    async function handleMouseUp() {
      if (dragState) {
        const block = blocks.find((item) => item.id === dragState.id)

        if (block && dragPreview) {
          const nextX = dragPreview.x
          const nextY = dragPreview.y

          if (
            (nextX !== dragState.originalX || nextY !== dragState.originalY) &&
            canPlaceBlockAt(nextX, nextY, block.width, block.height, block.id)
          ) {
            const previousBlocks = blocks

            setBlocks((prev) =>
              prev.map((item) =>
                item.id === block.id ? { ...item, x: nextX, y: nextY } : item
              )
            )

            try {
              const res = await fetch("/api/canvas", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: block.id,
                  x: nextX,
                  y: nextY,
                }),
              })

              if (!res.ok) {
                setBlocks(previousBlocks)
                setError("Failed to move block")
              }
            } catch {
              setBlocks(previousBlocks)
              setError("Failed to move block")
            }
          }
        }

        setDragState(null)
        setDragPreview(null)
      }

      if (resizeState) {
        const block = blocks.find((item) => item.id === resizeState.id)

        if (block && resizePreview) {
          const nextWidth = resizePreview.width
          const nextHeight = resizePreview.height

          if (
            (nextWidth !== resizeState.originalWidth ||
              nextHeight !== resizeState.originalHeight) &&
            canPlaceBlockAt(
              block.x,
              block.y,
              nextWidth,
              nextHeight,
              block.id
            )
          ) {
            const previousBlocks = blocks

            setBlocks((prev) =>
              prev.map((item) =>
                item.id === block.id
                  ? { ...item, width: nextWidth, height: nextHeight }
                  : item
              )
            )

            try {
              const res = await fetch("/api/canvas", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: block.id,
                  width: nextWidth,
                  height: nextHeight,
                }),
              })

              if (!res.ok) {
                setBlocks(previousBlocks)
                setError("Failed to resize block")
              }
            } catch {
              setBlocks(previousBlocks)
              setError("Failed to resize block")
            }
          }
        }

        setResizeState(null)
        setResizePreview(null)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [blocks, dragPreview, dragState, resizePreview, resizeState, heroRect])

  const gridWidth = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * GAP
  const gridHeight = GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * GAP

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center rounded-[32px] bg-white/70">
        <p className="text-sm text-gray-500">Loading canvas...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-auto rounded-[32px] bg-white/65 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 w-[92px] bg-white/45 backdrop-blur-sm" />

      <div className="absolute left-0 top-0 z-10 flex w-[92px] flex-col items-center gap-3 p-4">
        <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
          Koda
        </div>
        <div className="h-10 w-10 rounded-full bg-black/90" />
        <div className="h-2 w-2 rounded-full bg-gray-300" />
        <div className="h-2 w-2 rounded-full bg-gray-300" />
        <div className="h-2 w-2 rounded-full bg-gray-300" />
      </div>

      <div className="pl-[92px]">
        <div className="p-6">
          <div
            ref={gridRef}
            className="relative rounded-[28px]"
            style={{
              width: gridWidth,
              height: gridHeight,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
              backgroundSize: `${CELL_SIZE + GAP}px ${CELL_SIZE + GAP}px`,
              backgroundPosition: "0 0",
            }}
            onClick={handleSurfaceClick}
          >
            <div
              className="absolute rounded-[28px] bg-transparent px-1 py-1 transition-transform duration-300 hover:scale-[1.01]"
              style={{
                left: hero.x * (CELL_SIZE + GAP),
                top: hero.y * (CELL_SIZE + GAP),
                width: hero.width * CELL_SIZE + (hero.width - 1) * GAP,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[clamp(2rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-gray-950">
                {hero.displayName}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>koda.app/{hero.slug}</span>
                <Link
                  href="/profile/edit"
                  className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Edit identity
                </Link>
              </div>

              {hero.bio && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">
                  {hero.bio}
                </p>
              )}
            </div>

            {displayedBlocks.map((block) => (
              <CanvasBlock
                key={block.id}
                id={block.id}
                type={block.type}
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                content={block.content}
                isSelected={selectedBlockId === block.id}
                isDragging={dragState?.id === block.id}
                isResizing={resizeState?.id === block.id}
                isEditing={editingBlockId === block.id}
                onDelete={handleDeleteBlock}
                onSelect={(id) => {
                  setSelectedBlockId(id)
                  setMenuOpen(false)
                }}
                onStartEditing={(id) => {
                  setSelectedBlockId(id)
                  setEditingBlockId(id)
                  setMenuOpen(false)
                }}
                onStopEditing={() => setEditingBlockId(null)}
                onSaveContent={handleSaveContent}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
              />
            ))}

            {menuOpen && (
              <CanvasAddMenu
                x={gridWidth - 300}
                y={gridHeight / 2 - 180}
                onSelect={handleAddBlock}
                onClose={() => setMenuOpen(false)}
              />
            )}

            {blocks.length === 0 && !error && (
              <div className="absolute bottom-4 right-24 max-w-sm rounded-[24px] bg-white/80 px-4 py-3 text-sm text-gray-500 shadow-sm backdrop-blur-sm">
                Use the side + button to add something to the canvas.
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedBlockId(null)
                setMenuOpen((open) => !open)
              }}
              className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black text-2xl text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:scale-[1.03] hover:opacity-95"
              aria-label="Add block"
            >
              +
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}