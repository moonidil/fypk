import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const ALLOWED_TYPES = ["text", "link", "image"] as const
type AllowedType = (typeof ALLOWED_TYPES)[number]

function isAllowedType(value: unknown): value is AllowedType {
  return typeof value === "string" && ALLOWED_TYPES.includes(value as AllowedType)
}

type Params = { params: Promise<{ id: string }> }

//creates an artefact on a project the current user owns.
export async function POST(req: Request, { params }: Params) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id: projectId } = await params
    const body = await req.json()

    const project = await prisma.project.findUnique({ where: { id: projectId } })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (!isAllowedType(body.type)) {
      return NextResponse.json({ error: "Invalid artefact type" }, { status: 400 })
    }

    const artefact = await prisma.artefact.create({
      data: {
        projectId,
        type: body.type,
        url: typeof body.url === "string" ? body.url : null,
        content: typeof body.content === "string" ? body.content : null,
        label: typeof body.label === "string" ? body.label : null,
      },
    })

    return NextResponse.json(artefact, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//deletes an artefact if it belongs to a project owned by the current user.
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id: projectId } = await params
    const url = new URL(req.url)
    const artefactId = url.searchParams.get("artefactId")

    if (!artefactId) {
      return NextResponse.json({ error: "artefactId is required" }, { status: 400 })
    }

    const artefact = await prisma.artefact.findUnique({
      where: { id: artefactId },
      include: { project: true },
    })

    if (
      !artefact ||
      artefact.projectId !== projectId ||
      artefact.project.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.artefact.delete({ where: { id: artefactId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}