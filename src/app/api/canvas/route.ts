import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { BlockType } from "@/types"

//allowed block types that can be created on the canvas.
const allowedTypes: BlockType[] = [
  "text",
  "project",
  "skills",
  "image",
  "education",
  "link",
]

//fetches all canvas blocks for the logged in user.
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const blocks = await prisma.canvasBlock.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(blocks)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//creates a new canvas block for the logged in user.
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { type, x, y, width, height, content } = await req.json()

    //checks that the required fields are present.
    if (type === undefined || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: "type, x and y are required" },
        { status: 400 }
      )
    }

    //checks that the block type is valid.
    if (!allowedTypes.includes(type as BlockType)) {
      return NextResponse.json({ error: "Invalid block type" }, { status: 400 })
    }

    //checks that the grid values are valid numbers.
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof (width ?? 1) !== "number" ||
      typeof (height ?? 1) !== "number"
    ) {
      return NextResponse.json(
        { error: "x, y, width and height must be numbers" },
        { status: 400 }
      )
    }

    const safeWidth = width ?? 1
    const safeHeight = height ?? 1

    //checks that the block size is valid.
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      !Number.isInteger(safeWidth) ||
      !Number.isInteger(safeHeight) ||
      safeWidth < 1 ||
      safeHeight < 1
    ) {
      return NextResponse.json(
        { error: "x, y, width and height must be positive integers" },
        { status: 400 }
      )
    }

    const block = await prisma.canvasBlock.create({
      data: {
        userId: session.user.id,
        type,
        x,
        y,
        width: safeWidth,
        height: safeHeight,
        content: content ?? {},
      },
    })

    return NextResponse.json(block, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//updates an existing canvas block if it belongs to the current user.
export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id, x, y, width, height, content } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 })
    }

    const block = await prisma.canvasBlock.findUnique({
      where: { id },
    })

    if (!block || block.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updateData: Prisma.CanvasBlockUpdateInput = {}

    //updates position only if valid values were provided.
    if (x !== undefined) {
      if (typeof x !== "number" || !Number.isInteger(x) || x < 0) {
        return NextResponse.json({ error: "Invalid x value" }, { status: 400 })
      }
      updateData.x = x
    }

    if (y !== undefined) {
      if (typeof y !== "number" || !Number.isInteger(y) || y < 0) {
        return NextResponse.json({ error: "Invalid y value" }, { status: 400 })
      }
      updateData.y = y
    }

    if (width !== undefined) {
      if (typeof width !== "number" || !Number.isInteger(width) || width < 1) {
        return NextResponse.json({ error: "Invalid width value" }, { status: 400 })
      }
      updateData.width = width
    }

    if (height !== undefined) {
      if (
        typeof height !== "number" ||
        !Number.isInteger(height) ||
        height < 1
      ) {
        return NextResponse.json(
          { error: "Invalid height value" },
          { status: 400 }
        )
      }
      updateData.height = height
    }

    if (content !== undefined) {
      updateData.content =
        content === null
          ? Prisma.JsonNull
          : (content as Prisma.InputJsonValue)
    }

    const updatedBlock = await prisma.canvasBlock.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedBlock)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}