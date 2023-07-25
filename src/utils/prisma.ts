import { PrismaClient } from "@prisma/client"
import { paginate } from "prisma-extension-pagination"

const prisma = new PrismaClient().$extends({
  model: {
    $allModels: {
      paginate
    }
  }
})

export default prisma
