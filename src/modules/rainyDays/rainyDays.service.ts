import { prisma } from "@/utils"

export async function getRainyDaysProducts() {
  return await prisma.rainyDaysProduct.findMany()
}

export async function getRainyDaysProduct(id: string) {
  return await prisma.rainyDaysProduct.findUnique({
    where: { id }
  })
}
