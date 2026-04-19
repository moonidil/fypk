//[slug]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { BlockContent, BlockType } from "@/types"

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
  if (type === "text") {
    return content.text ? (
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800">
        {content.text}
      </p>
    ) : (
      <p className="text-sm text-gray-400">No text added yet.</p>
    )
  }

  if (type === "link") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-900">
          {content.title || content.linkLabel || "Link"}
        </p>

        {content.description && (
          <p className="text-sm leading-6 text-gray-600">
            {content.description}
          </p>
        )}

        {content.linkUrl ? (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="block break-words text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            {content.linkUrl}
          </a>
        ) : (
          <p className="text-sm text-gray-400">No link added yet.</p>
        )}
      </div>
    )
  }

  if (type === "skills") {
    const skills = Array.isArray(content.skills) ? content.skills : []

    return skills.length > 0 ? (
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {skills.map((skill) => (
          <span key={skill} className="text-sm font-medium text-gray-700">
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400">No skills added yet.</p>
    )
  }

  if (type === "image") {
    return (
      <div className="h-full">
        {content.title && (
          <p className="mb-2 text-sm font-medium text-gray-900">{content.title}</p>
        )}

        {content.imageUrl ? (
          //eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt={content.title || "Canvas image"}
            className="h-[calc(100%-1.75rem)] w-full rounded-[24px] object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] bg-white text-sm text-gray-400 ring-1 ring-dashed ring-gray-200">
            No image added yet
          </div>
        )}
      </div>
    )
  }

  if (type === "project") {
    return (
      <div className="h-full">
        <p className="text-sm font-medium text-gray-900">
          {content.title || "Untitled project"}
        </p>

        {content.text ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {content.text}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No project summary added yet.</p>
        )}

        {content.linkUrl && (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            {content.linkLabel || "Open project"}
          </a>
        )}
      </div>
    )
  }

  if (type === "education") {
    return (
      <div className="h-full">
        <p className="text-sm font-medium text-gray-900">
          {content.title || "Education"}
        </p>

        {content.text ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {content.text}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No education details added yet.</p>
        )}
      </div>
    )
  }

  return (
    <p className="text-sm text-gray-400">
      This block type does not have a public renderer yet.
    </p>
  )
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
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-6">
      <div className="relative min-h-[calc(100vh-3rem)] overflow-auto rounded-[32px] bg-white/65 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm">
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
              className="relative rounded-[28px]"
              style={{
                width: gridWidth,
                height: gridHeight,
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
                backgroundSize: `${CELL_SIZE + GAP}px ${CELL_SIZE + GAP}px`,
                backgroundPosition: "0 0",
              }}
            >
                <div
                className="absolute rounded-[28px] bg-transparent px-1 py-1"
                style={{
                    left: 0,
                    top: 0,
                    width: 5 * CELL_SIZE + 4 * GAP,
                }}
                >
                <p className="text-[clamp(2rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-gray-950">
                  {profile.displayName}
                </p>

                <div className="mt-2 text-sm text-gray-500">
                  koda.app/{profile.slug}
                </div>

                {profile.bio && (
                  <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">
                    {profile.bio}
                  </p>
                )}
              </div>

              {publicBlocks.map((block) => (
                <article
                  key={block.id}
                  style={getBlockStyle(block.x, block.y, block.width, block.height)}
                  className="absolute overflow-hidden rounded-[20px] bg-transparent p-3"
                >
                  {renderBlockContent(block.type, block.content)}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}