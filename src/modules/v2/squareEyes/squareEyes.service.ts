import { db } from "@/utils"

export async function getSquareEyesProducts() {
  const [data, meta] = await db.squareEyesProduct.paginate().withPages()

  return { data, meta }
}

export async function getSquareEyesProduct(id: string) {
  const [data, meta] = await db.squareEyesProduct
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
