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

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your canvas</h1>
          <p className="mt-1 text-sm text-gray-500">
            koda.app/{profile.slug} · {session.user.email}
          </p>
        </div>

        <CanvasGrid />
      </div>
    </main>
  )
}