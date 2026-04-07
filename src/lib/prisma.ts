import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

//stores the prisma client on the global object in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

//creates the postgres adapter using the database connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

//reuses the existing prisma client if one already exists.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

//saves the prisma client globally during development to avoid duplicates.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma