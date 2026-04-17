"use client"

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

type DragState = {
  id: string
  offsetX: number
  offsetY: number
  originalX: number
  originalY: number
} | null

type Cell = {
  x: number
  y: number
}

const CELL_SIZE = 120
const GAP = 12
const GRID_COLS = 8
const GRID_ROWS = 6

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
  const [error, setError] = useState("")
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [menuCell, setMenuCell] = useState<Cell | null>(null)
  const [menuPixelPosition, setMenuPixelPosition] = useState<{
    left: number
    top: number
  } | null>(null)
  const [hoveredAnchor, setHoveredAnchor] = useState<Cell | null>(null)
  const [dragState, setDragState] = useState<DragState>(null)
  const [dragPreview, setDragPreview] = useState<Cell | null>(null)

  const gridRef = useRef<HTMLDivElement | null>(null)

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

  const displayedBlocks = useMemo(() => {
    if (!dragState || !dragPreview) return blocks

    return blocks.map((block) =>
      block.id === dragState.id
        ? { ...block, x: dragPreview.x, y: dragPreview.y }
        : block
    )
  }, [blocks, dragPreview, dragState])

  const occupiedCells = useMemo(() => {
    const taken = new Set<string>()

    for (const block of displayedBlocks) {
      for (let row = block.y; row < block.y + block.height; row += 1) {
        for (let col = block.x; col < block.x + block.width; col += 1) {
          taken.add(`${col}-${row}`)
        }
      }
    }

    return taken
  }, [displayedBlocks])

  //checks whether a block can fit at a given position without overlapping.
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

  //finds a block that occupies the given grid cell.
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

  //converts a mouse position inside the canvas into a snapped grid cell.
  function getGridPositionFromMouse(clientX: number, clientY: number) {
    const grid = gridRef.current
    if (!grid) return null

    const rect = grid.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top

    return {
      x: Math.floor(localX / (CELL_SIZE + GAP)),
      y: Math.floor(localY / (CELL_SIZE + GAP)),
    }
  }

  function isInsideGrid(x: number, y: number) {
    return x >= 0 && y >= 0 && x < GRID_COLS && y < GRID_ROWS
  }

  function getMenuPositionForCell(x: number, y: number) {
    const baseLeft = x * (CELL_SIZE + GAP) + CELL_SIZE / 2 + 14
    const baseTop = y * (CELL_SIZE + GAP) + CELL_SIZE / 2 + 14
    const menuWidth = 220
    const menuHeight = 320
    const gridWidth = GRID_COLS * (CELL_SIZE + GAP) - GAP
    const gridHeight = GRID_ROWS * (CELL_SIZE + GAP) - GAP

    return {
      left: Math.max(12, Math.min(baseLeft, gridWidth - menuWidth - 12)),
      top: Math.max(12, Math.min(baseTop, gridHeight - menuHeight - 12)),
    }
  }

  function openMenuAtCell(x: number, y: number) {
    if (!isInsideGrid(x, y)) return
    if (getBlockAtCell(x, y)) return

    setSelectedBlockId(null)
    setMenuCell({ x, y })
    setMenuPixelPosition(getMenuPositionForCell(x, y))
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

  //blank canvas clicks should only clear selection and menus.
  function handleCanvasClick() {
    setSelectedBlockId(null)
    setMenuCell(null)
    setMenuPixelPosition(null)
  }

  //right click still works as a shortcut for empty cells.
  function handleCanvasContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()

    const position = getGridPositionFromMouse(e.clientX, e.clientY)
    if (!position) return

    const clickedBlock = getBlockAtCell(position.x, position.y)

    if (clickedBlock) {
      setSelectedBlockId(clickedBlock.id)
      setMenuCell(null)
      setMenuPixelPosition(null)
      return
    }

    openMenuAtCell(position.x, position.y)
  }

  //creates a new block at the selected empty grid cell.
  async function handleAddBlock(type: BlockType) {
    if (!menuCell) return

    setError("")

    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          x: menuCell.x,
          y: menuCell.y,
          width: 1,
          height: 1,
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
      setMenuCell(null)
      setMenuPixelPosition(null)
      setHoveredAnchor(null)
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

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Failed to delete block")
        return
      }

      setBlocks((prev) => prev.filter((block) => block.id !== id))

      if (selectedBlockId === id) {
        setSelectedBlockId(null)
      }
    } catch {
      setError("Failed to delete block")
    }
  }

  //starts dragging a block and stores the initial mouse offset from the block origin.
  function handleDragStart(id: string, e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return

    const block = blocks.find((item) => item.id === id)
    if (!block || !gridRef.current) return

    const gridRect = gridRef.current.getBoundingClientRect()
    const blockLeft = block.x * (CELL_SIZE + GAP)
    const blockTop = block.y * (CELL_SIZE + GAP)

    setSelectedBlockId(id)
    setMenuCell(null)
    setMenuPixelPosition(null)
    setHoveredAnchor(null)

    setDragState({
      id,
      offsetX: e.clientX - (gridRect.left + blockLeft),
      offsetY: e.clientY - (gridRect.top + blockTop),
      originalX: block.x,
      originalY: block.y,
    })

    setDragPreview({ x: block.x, y: block.y })
  }

  //moves the drag preview as the mouse moves and saves on mouse up.
  useEffect(() => {
    if (!dragState) return

    function handleMouseMove(e: MouseEvent) {
      const grid = gridRef.current
      if (!grid) return

      const block = blocks.find((item) => item.id === dragState.id)
      if (!block) return

      const rect = grid.getBoundingClientRect()
      const rawLeft = e.clientX - rect.left - dragState.offsetX
      const rawTop = e.clientY - rect.top - dragState.offsetY

      const candidateX = Math.round(rawLeft / (CELL_SIZE + GAP))
      const candidateY = Math.round(rawTop / (CELL_SIZE + GAP))

      if (
        canPlaceBlockAt(
          candidateX,
          candidateY,
          block.width,
          block.height,
          block.id
        )
      ) {
        setDragPreview({ x: candidateX, y: candidateY })
      }
    }

    async function handleMouseUp() {
      const block = blocks.find((item) => item.id === dragState.id)
      if (!block) {
        setDragState(null)
        setDragPreview(null)
        return
      }

      const originalX = dragState.originalX
      const originalY = dragState.originalY
      const nextX = dragPreview?.x ?? originalX
      const nextY = dragPreview?.y ?? originalY
      const moved = nextX !== originalX || nextY !== originalY

      if (!moved) {
        setDragState(null)
        setDragPreview(null)
        return
      }

      setBlocks((prev) =>
        prev.map((item) =>
          item.id === block.id ? { ...item, x: nextX, y: nextY } : item
        )
      )

      setDragState(null)
      setDragPreview(null)

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

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          setBlocks((prev) =>
            prev.map((item) =>
              item.id === block.id ? { ...item, x: originalX, y: originalY } : item
            )
          )
          setError(data?.error || "Failed to save block position")
        }
      } catch {
        setBlocks((prev) =>
          prev.map((item) =>
            item.id === block.id ? { ...item, x: originalX, y: originalY } : item
          )
        )
        setError("Failed to save block position")
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [blocks, dragPreview, dragState])

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
      <p className="text-center text-sm text-gray-500">
        Hover a plus to add a block. Click a block to select it. Drag a block to move it.
      </p>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <div className="flex justify-center">
        <div
          ref={gridRef}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          onMouseLeave={() => setHoveredAnchor(null)}
          className="relative"
          style={{ width: gridWidth, height: gridHeight }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, row) =>
            Array.from({ length: GRID_COLS }).map((_, col) => {
              const cellKey = `${col}-${row}`
              const isOccupied = occupiedCells.has(cellKey)

              if (isOccupied) return null

              const isHovered =
                hoveredAnchor?.x === col && hoveredAnchor?.y === row

              return (
                <button
                  key={cellKey}
                  type="button"
                  aria-label={`Add block at column ${col + 1}, row ${row + 1}`}
                  onMouseEnter={() => setHoveredAnchor({ x: col, y: row })}
                  onFocus={() => setHoveredAnchor({ x: col, y: row })}
                  onBlur={() => setHoveredAnchor(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    openMenuAtCell(col, row)
                  }}
                  className="absolute z-10 flex items-center justify-center rounded-full"
                  style={{
                    left: col * (CELL_SIZE + GAP) + CELL_SIZE / 2 - 18,
                    top: row * (CELL_SIZE + GAP) + CELL_SIZE / 2 - 18,
                    width: 36,
                    height: 36,
                  }}
                >
                  <span
                    className={`select-none leading-none transition-all duration-150 ${
                      isHovered
                        ? "text-[15px] text-gray-300"
                        : "text-[8px] text-gray-300/90"
                    }`}
                  >
                    {isHovered ? "+" : "•"}
                  </span>
                </button>
              )
            })
          )}

          {displayedBlocks.map((block) => (
            <CanvasBlock
              key={block.id}
              {...block}
              isSelected={selectedBlockId === block.id}
              isDragging={dragState?.id === block.id}
              onDelete={handleDeleteBlock}
              onSelect={setSelectedBlockId}
              onDragStart={handleDragStart}
            />
          ))}

          {blocks.length === 0 && !menuCell && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
              <p className="text-center text-sm text-gray-350 text-gray-400">
                Hover a dot to start building your page.
              </p>
            </div>
          )}

          {menuCell && menuPixelPosition && (
            <CanvasAddMenu
              x={menuPixelPosition.left}
              y={menuPixelPosition.top}
              onSelect={handleAddBlock}
              onClose={() => {
                setMenuCell(null)
                setMenuPixelPosition(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}