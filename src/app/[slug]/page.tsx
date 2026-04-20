import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { BlockContent } from "@/types"
import { blockStyleClasses } from "@/lib/blockStyle"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type PublicBlock = {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  content: BlockContent
}

const CELL_SIZE = 80
const GAP = 6
const GRID_COLS = 12
const GRID_ROWS = 12

function getBlockStyle(x: number, y: number, width: number, height: number) {
  return {
    position: "absolute" as const,
    left: x * (CELL_SIZE + GAP),
    top: y * (CELL_SIZE + GAP),
    width: width * CELL_SIZE + (width - 1) * GAP,
    height: height * CELL_SIZE + (height - 1) * GAP,
  }
}

function normaliseContent(value: unknown): BlockContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return value as BlockContent
}

function renderBlockContent(type: string, content: BlockContent) {
  const styled = blockStyleClasses(content.style)

  if (type === "text") {
    return content.text ? (
      <p className={`whitespace-pre-wrap text-gray-800 ${styled}`}>
        {content.text}
      </p>
    ) : null
  }

  if (type === "link") {
    return (
      <div>
        {(content.title || content.linkLabel) && (
          <p className="text-sm font-medium text-gray-900">
            {content.title || content.linkLabel}
          </p>
        )}

        {content.description && (
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {content.description}
          </p>
        )}

        {content.linkUrl && (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-words text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            {content.linkLabel || content.linkUrl}
          </a>
        )}
      </div>
    )
  }

  if (type === "skills") {
    const skills = Array.isArray(content.skills) ? content.skills : []
    const pillClasses = `rounded-full bg-white px-2.5 py-1 text-gray-700 shadow-sm ${styled}`

    if (skills.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className={pillClasses}>
            {skill}
          </span>
        ))}
      </div>
    )
  }

  if (type === "image") {
    return (
      <div className="flex h-full w-full flex-col">
        {content.title && (
          <p className="mb-1.5 text-sm font-medium text-gray-900">
            {content.title}
          </p>
        )}

        {content.imageUrl && (
          //eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt={content.title || "Canvas image"}
            className="min-h-0 flex-1 w-full rounded-[16px] object-cover"
            draggable={false}
          />
        )}
      </div>
    )
  }

  if (type === "project") {
    return (
      <div>
        {content.title && (
          <p className="text-base font-medium text-gray-900">{content.title}</p>
        )}

        {content.text && (
          <p className={`mt-1 whitespace-pre-wrap text-gray-700 ${styled}`}>
            {content.text}
          </p>
        )}

        {content.linkUrl && (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            {content.linkLabel || "Open project"}
          </a>
        )}
      </div>
    )
  }

  if (type === "education") {
    return (
      <div>
        {content.title && (
          <p className="text-sm font-medium text-gray-900">{content.title}</p>
        )}

        {content.text && (
          <p className={`mt-1 whitespace-pre-wrap text-gray-700 ${styled}`}>
            {content.text}
          </p>
        )}
      </div>
    )
  }

  return null
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: {
      displayName: true,
      slug: true,
      bio: true,
      userId: true,
      isPublic: true,
    },
  })

  if (!profile) {
    notFound()
  }

  const blocks = await prisma.canvasBlock.findMany({
    where: { userId: profile.userId },
    select: {
      id: true,
      type: true,
      x: true,
      y: true,
      width: true,
      height: true,
      content: true,
    },
    orderBy: [{ y: "asc" }, { x: "asc" }],
  })

  const gridWidth = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * GAP
  const gridHeight = GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * GAP

  const publicBlocks: PublicBlock[] = blocks.map((block) => ({
    id: block.id,
    type: block.type,
    x: block.x,
    y: block.y,
    width: block.width,
    height: block.height,
    content: normaliseContent(block.content),
  }))

  return (
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-8">
      <div className="relative mx-auto max-w-[1200px] overflow-auto rounded-[32px] bg-white/65 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:p-10">
        <div
          className="relative rounded-[28px]"
          style={{
            width: gridWidth,
            height: gridHeight,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)",
            backgroundSize: `${CELL_SIZE + GAP}px ${CELL_SIZE + GAP}px`,
            backgroundPosition: "0 0",
          }}
        >
          <div
            className="absolute"
            style={{
              left: 1 * (CELL_SIZE + GAP),
              top: 1 * (CELL_SIZE + GAP),
              width: 3 * CELL_SIZE + 2 * GAP,
            }}
          >
            <p className="break-words text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-gray-950">
              {profile.displayName}
            </p>

            <p className="mt-2 text-sm text-gray-500">koda.app/{profile.slug}</p>

            {profile.bio && (
              <p className="mt-4 max-w-md text-sm leading-7 text-gray-600">
                {profile.bio}
              </p>
            )}
          </div>

          {publicBlocks.map((block) => {
            const inner = renderBlockContent(block.type, block.content)
            if (inner === null) return null

            return (
              <article
                key={block.id}
                style={getBlockStyle(block.x, block.y, block.width, block.height)}
                className="absolute overflow-hidden rounded-[20px] bg-white/50 p-3 ring-1 ring-black/5 backdrop-blur-sm"
              >
                {inner}
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}