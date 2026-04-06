import { PrismaClient } from '@prisma/client'

//extend the global object so Prisma can be cached during development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

//reuse the existing prisma client if it exists. prevents multiple Prisma instances from being created during hot reloads in development
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

//store the prisma client globally in non-production environments only.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma