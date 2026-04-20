import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProjectEditor from "@/components/projects/ProjectEditor"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectEditPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: { artefacts: { orderBy: { createdAt: "asc" } } },
  })

  if (!project || project.userId !== session.user.id) {
    notFound()
  }

  return (
    <ProjectEditor
      project={{
        id: project.id,
        title: project.title,
        description: project.description ?? "",
        visibility: project.visibility,
        problem: project.problem ?? "",
        approach: project.approach ?? "",
        outcome: project.outcome ?? "",
        reflection: project.reflection ?? "",
        artefacts: project.artefacts.map((a) => ({
          id: a.id,
          type: a.type,
          url: a.url,
          content: a.content,
          label: a.label,
        })),
      }}
    />
  )
}
