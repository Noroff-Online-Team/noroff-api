import { prisma } from "../../utils"

export async function getSquareEyesProducts() {
  return await prisma.squareEyesProduct.findMany()
}

export async function getSquareEyesProduct(id: string) {
  return await prisma.squareEyesProduct.findUnique({
    where: { id }
  })
}
