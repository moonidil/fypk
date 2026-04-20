import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"





type PageProps = {
  params: Promise<{ slug: string; projectId: string }>
}

const SECTIONS: Array<{
  key: "problem" | "approach" | "outcome" | "reflection"
  label: string
}> = [
  { key: "problem", label: "Problem & context" },
  { key: "approach", label: "Approach & constraints" },
  { key: "outcome", label: "Outcomes & impact" },
  { key: "reflection", label: "Reflection" },
]



export default async function PublicProjectPage({ params }: PageProps) {
  const { slug, projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: { select: { profile: { select: { slug: true, displayName: true } } } },
      artefacts: { orderBy: { createdAt: "asc" } },
    },
  })

  if (
    !project ||
    project.visibility !== "PUBLIC" ||
    project.user.profile?.slug !== slug
  ) {
    notFound()
  }

  const hasNarrative = SECTIONS.some(
    (s) => (project[s.key] ?? "").trim().length > 0
  )

  return (
    <main className="min-h-screen bg-[#f6f6f3] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${slug}`}
          className="inline-block text-sm text-gray-500 transition hover:text-gray-800"
        >
          ← {project.user.profile?.displayName ?? slug}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <article className="rounded-[28px] bg-white/70 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-3 text-base leading-7 text-gray-600">
                {project.description}
              </p>
            )}

            {hasNarrative ? (
              <div className="mt-8 space-y-8">
                {SECTIONS.map((section) => {
                  const value = (project[section.key] ?? "").trim()
                  if (value.length === 0) return null

                  return (
                    <section key={section.key}>
                      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                        {section.label}
                      </h2>
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-gray-800">
                        {value}
                      </p>
                    </section>
                  )
                })}
              </div>
            ) : (
              <p className="mt-8 text-sm text-gray-400">
                No narrative has been written yet.
              </p>
            )}
          </article>

          <aside className="space-y-3">
            <h2 className="px-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Evidence
            </h2>

            {project.artefacts.length === 0 ? (
              <p className="px-1 text-sm text-gray-400">
                No evidence attached yet.
              </p>
            ) : (
              project.artefacts.map((artefact) => (
                <ArtefactCard key={artefact.id} artefact={artefact} />
              ))
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}




type ArtefactCardProps = {
  artefact: {
    id: string
    type: string
    url: string | null
    content: string | null
    label: string | null
  }
}




function ArtefactCard({ artefact }: ArtefactCardProps) {
  return (
    <div className="rounded-[20px] bg-white/70 p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
        {artefact.type}
        {artefact.label ? ` · ${artefact.label}` : ""}
      </p>

      {artefact.type === "link" && artefact.url && (
        <a>
          href={artefact.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block truncate text-sm text-blue-600 hover:underline"
          {artefact.url}
        </a>
      )}

      {artefact.type === "image" && artefact.url && (
        //eslint-disable-next-line @next/next/no-img-element  
        <img
          src={artefact.url}
          alt={artefact.label || "Artefact"}
          className="mt-2 w-full rounded-xl object-cover"
        />
      )}

      {artefact.type === "text" && artefact.content && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {artefact.content}
        </p>
      )}
    </div>
  )
}

