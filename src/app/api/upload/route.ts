import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

//uploads a public image blob for the logged in user.
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP and GIF files are allowed" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller" },
        { status: 400 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
    const pathname = `canvas/${session.user.id}/${Date.now()}-${safeName}`

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}