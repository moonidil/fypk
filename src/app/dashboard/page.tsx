import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Logged in as {session.user.email}
        </p>
      </div>
    </main>
  )
}