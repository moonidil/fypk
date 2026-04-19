import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CanvasGrid from "@/components/blocks/CanvasGrid"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      slug: true,
      bio: true,
      heroX: true,
      heroY: true,
      heroWidth: true,
    },
  })

  if (!profile) {
    redirect("/onboarding")
  }

  
  return (
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-end gap-2">
        <Link
          href="/profile/edit"
          className="rounded-full bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-white"
        >
          Edit profile
        </Link>

        <Link
          href={`/${profile.slug}`}
          className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          View page
        </Link>
      </div>

      <CanvasGrid
        hero={{
          displayName: profile.displayName,
          slug: profile.slug,
          bio: profile.bio,
          x: profile.heroX,
          y: profile.heroY,
          width: profile.heroWidth,
        }}
      />
    </main>
  )
}