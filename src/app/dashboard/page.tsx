import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CanvasGrid from "@/components/blocks/CanvasGrid"

//shows the users dashboard and loads their canvas once onboarding is complete.
export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    redirect("/onboarding")
  }

  const displayName =
    profile.displayName || session.user.name || session.user.email || "Your canvas"

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-6 pb-12 pt-10 md:px-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            {displayName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <span>koda.app/{profile.slug}</span>
            <span className="text-gray-300">·</span>
            <span>{session.user.email}</span>

            <Link
              href="/profile/edit"
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Edit profile details"
              title="Edit profile details"
            >
              <span className="text-[13px] leading-none">✎</span>
            </Link>
          </div>
        </div>

        <CanvasGrid />
      </div>
    </main>
  )
}