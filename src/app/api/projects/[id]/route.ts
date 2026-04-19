
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const ALLOWED_VISIBILITIES = ["DRAFT", "PRIVATE", "PUBLIC"] as const
type AllowedVisibility = (typeof ALLOWED_VISIBILITIES)[number]

function isAllowedVisibility(value: unknown): value is AllowedVisibility {
  return (
    typeof value === "string" &&
    ALLOWED_VISIBILITIES.includes(value as AllowedVisibility)
  )
}

type Params = { params: Promise<{ id: string }> }

//returns a single project if it belongs to the current user.
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        artefacts: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//updates fields on an owned project
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const project = await prisma.project.findUnique({ where: { id } })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data: Prisma.ProjectUpdateInput = {}

    if (typeof body.title === "string") {
      const nextTitle = body.title.trim()
      if (nextTitle.length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 })
      }
      data.title = nextTitle
    }

    if (typeof body.description === "string") {
      data.description = body.description
    }

    //four structured narrative fields from fr 6
    if (typeof body.problem === "string") data.problem = body.problem
    if (typeof body.approach === "string") data.approach = body.approach
    if (typeof body.outcome === "string") data.outcome = body.outcome
    if (typeof body.reflection === "string") data.reflection = body.reflection

    if (body.visibility !== undefined) {
      if (!isAllowedVisibility(body.visibility)) {
        return NextResponse.json({ error: "Invalid visibility" }, { status: 400 })
      }
      data.visibility = body.visibility
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: { artefacts: { orderBy: { createdAt: "asc" } } },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//deletes an owned project an d canvas blocks that reference it keep their row
//the foreign key will be nulled by the next canvas read (projectId
//stays but the join returns null a the UI handles as a legacy block).
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.project.findUnique({ where: { id } })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}