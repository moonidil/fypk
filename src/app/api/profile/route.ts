//the profile creation endpoint. a protected route that requires authentication. It validates the input and checks for existing profiles before creating a new one. It also includes a GET handler to fetch the current user's profile
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

//validates that a slug only contains lowercase letters, numbers and hyphens
const slugRegex = /^[a-z0-9-]+$/

export async function POST(req: Request) {
  try {
    const session = await auth()

    //reject unauthenticated requests right away
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { displayName, slug, bio } = await req.json()

    //validate required fields
    if (!displayName?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "Display name and slug are required" },
        { status: 400 }
      )
    }

    // enforce slug format
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers and hyphens" },
        { status: 400 }
      )
    }

    // enforce slug length
    if (slug.length < 3 || slug.length > 30) {
      return NextResponse.json(
        { error: "Slug must be between 3 and 30 characters" },
        { status: 400 }
      )
    }

    //check the slug is not already taken
    const existing = await prisma.profile.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: "That slug is already taken" },
        { status: 409 }
      )
    }

    //check the user doesn't already have a profile.
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      )
    }

    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        displayName: displayName.trim(),
        slug: slug.trim().toLowerCase(),
        bio: bio?.trim() || null,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

//fetches the current users profile.
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}