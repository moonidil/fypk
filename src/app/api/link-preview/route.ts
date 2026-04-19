import { NextRequest, NextResponse } from "next/server"

function parseGitHubRepo(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname !== "github.com") {
      return null
    }

    const parts = parsed.pathname.split("/").filter(Boolean)

    if (parts.length < 2) {
      return null
    }

    const owner = parts[0]
    const repo = parts[1]

    //reject obvious non-repo paths
    if (
      ["settings", "topics", "orgs", "organizations", "explore", "marketplace"].includes(owner)
    ) {
      return null
    }

    return { owner, repo }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  const repoMatch = parseGitHubRepo(url)

  if (!repoMatch) {
    return NextResponse.json(
      { error: "Only public GitHub repository links are supported for now" },
      { status: 400 }
    )
  }

  try {
    const githubRes = await fetch(
      `https://api.github.com/repos/${repoMatch.owner}/${repoMatch.repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    )

    if (!githubRes.ok) {
      if (githubRes.status === 404) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 })
      }

      return NextResponse.json(
        { error: "Failed to fetch repository preview" },
        { status: 500 }
      )
    }

    const repo = await githubRes.json()

    const preview = {
      title: `GitHub - ${repo.full_name}`,
      linkUrl: repo.html_url as string,
      linkLabel: repo.html_url as string,
      description:
        (repo.description as string | null) ||
        "Public GitHub repository",
      siteName: "github.com",
      previewImage: `https://opengraph.githubassets.com/1/${repo.full_name}`,
      githubOwner: repo.owner?.login as string,
      githubRepo: repo.name as string,
      githubStars: repo.stargazers_count as number,
      githubLanguage: (repo.language as string | null) || "",
      githubUpdatedAt: repo.updated_at as string,
    }

    return NextResponse.json(preview)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repository preview" },
      { status: 500 }
    )
  }
}