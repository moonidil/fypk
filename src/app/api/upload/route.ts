import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 })
    }

    const maxSizeBytes = 5 * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 })
    }

    const safeName = file.name.replace(/\s+/g, "-").toLowerCase()
    const pathname = `koda/${session.user.id}/${Date.now()}-${safeName}`

    const blob = await put(pathname, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}