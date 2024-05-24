import { RainyDaysProduct } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getRainyDaysProducts(
  sort: keyof RainyDaysProduct = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.rainyDaysProduct
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        image: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getRainyDaysProduct(id: string) {
  const [data] = await db.rainyDaysProduct
    .paginate({
      where: { id },
      include: {
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
