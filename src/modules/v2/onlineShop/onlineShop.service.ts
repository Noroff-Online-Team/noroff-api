import { prisma } from "@/utils"

export async function getOnlineShopProducts() {
  const [data, meta] = await prisma.onlineShopProduct
    .paginate({
      include: {
        reviews: true
      }
    })
    .withPages()

  return { data, meta }
}

export async function getOnlineShopProduct(id: string) {
  const [data, meta] = await prisma.onlineShopProduct
    .paginate({
      where: { id },
      include: {
        reviews: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
