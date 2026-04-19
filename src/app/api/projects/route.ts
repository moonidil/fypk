//
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

//returns all projects owned by logged in user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//creates a new draft project for logged in user
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const rawTitle = typeof body?.title === "string" ? body.title.trim() : ""
    const title = rawTitle.length > 0 ? rawTitle : "Untitled project"

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title,
      },
      select: {
        id: true,
        title: true,
        visibility: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}