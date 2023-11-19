import { OnlineShopProduct } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getOnlineShopProducts(
  sort: keyof OnlineShopProduct = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.onlineShopProduct
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        reviews: true,
        image: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getOnlineShopProduct(id: string) {
  const [data] = await db.onlineShopProduct
    .paginate({
      where: { id },
      include: {
        reviews: true,
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
