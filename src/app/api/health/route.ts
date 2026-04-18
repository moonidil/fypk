import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { NextResponse } from 'next/server'

//checks that the api route is working and that the database can be reached.
export async function GET() {
  try {
    //runs a very small test query against the database.
    await prisma.$queryRaw`SELECT 1`

    //returns a success response if the database connection works.
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch {
    //returns an error response if the database cannot be reached.
    return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 500 })
  }
}