import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import NewProjectButton from "@/components/projects/NewProjectButton"

export default async function ProjectsListPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
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

  return (
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your structured project narratives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-white"
            >
              Back to canvas
            </Link>
            <NewProjectButton />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[28px] bg-white/70 p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm">
            <p className="text-sm text-gray-500">
              You don&apos;t have any projects yet.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Create your first project to start writing its narrative.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/edit`}
                className="flex items-center justify-between rounded-[24px] bg-white/70 px-5 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm transition hover:bg-white"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-gray-900">
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {project.description}
                    </p>
                  )}
                </div>

                <VisibilityPill visibility={project.visibility} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function VisibilityPill({ visibility }: { visibility: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PRIVATE: "bg-amber-50 text-amber-700",
    PUBLIC: "bg-emerald-50 text-emerald-700",
  }

  const label = visibility.charAt(0) + visibility.slice(1).toLowerCase()

  return (
    <span
      className={`ml-4 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        styles[visibility] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  )
}