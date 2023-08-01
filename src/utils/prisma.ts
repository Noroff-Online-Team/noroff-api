// https://github.com/prisma/prisma/issues/2443#issuecomment-1542990881
import { PrismaClient as PrismaClientV1 } from "@prisma-api-v1/client"
import { PrismaClient as PrismaClientV2 } from "@prisma-api-v2/client"
import pagination from "prisma-extension-pagination"

// Prisma client for API v1
export const prisma = new PrismaClientV1()

// Prisma client for API v2
export const db = new PrismaClientV2().$extends(
  pagination({
    pages: {
      limit: 100,
      includePageCount: true
    }
  })
)
