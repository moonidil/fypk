import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug)
}

//gets the current users editable profile fields.
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      bio: true,
      slug: true,
    },
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}

//updates a few core profile fields for the logged in user.
export async function PATCH(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : ""
    const bio =
      typeof body.bio === "string" ? body.bio.trim() : ""
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      )
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Public link is required" },
        { status: 400 }
      )
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Public link can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      )
    }

    const existingSlug = await prisma.profile.findFirst({
      where: {
        slug,
        NOT: {
          userId: session.user.id,
        },
      },
      select: { id: true },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: "That public link is already taken" },
        { status: 409 }
      )
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName,
        bio: bio || null,
        slug,
      },
      select: {
        displayName: true,
        bio: true,
        slug: true,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}