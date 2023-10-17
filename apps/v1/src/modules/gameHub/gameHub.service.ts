import { prisma } from "@/utils"

export async function getGameHubProducts() {
  return await prisma.gameHubProducts.findMany()
}

export async function getGameHubProduct(id: string) {
  return await prisma.gameHubProducts.findUnique({
    where: { id }
  })
}
