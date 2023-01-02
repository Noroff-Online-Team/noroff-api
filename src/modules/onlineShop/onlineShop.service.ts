import { prisma } from "../../utils"

export async function getOnlineShopProducts() {
  return await prisma.onlineShopProduct.findMany({
    include: {
      reviews: true
    }
  })
}

export async function getOnlineShopProduct(id: string) {
  return await prisma.onlineShopProduct.findUnique({
    where: { id },
    include: {
      reviews: true
    }
  })
}
