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
    profile.handle || session.user.name || session.user.email || "Your canvas"

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-10 md:px-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            koda.app/{profile.slug} · {session.user.email}
          </p>
        </div>

        <CanvasGrid />
      </div>
    </main>
  )
}