import { PrismaClient } from "@prisma/v2-client"
import pagination from "prisma-extension-pagination"

export const db = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 100,
      includePageCount: true
    }
  })
)
