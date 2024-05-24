import { SquareEyesProduct } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getSquareEyesProducts(
  sort: keyof SquareEyesProduct = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.squareEyesProduct
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

export async function getSquareEyesProduct(id: string) {
  const [data] = await db.squareEyesProduct
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
