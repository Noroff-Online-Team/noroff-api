import { db } from "@/utils"

export async function getRainyDaysProducts() {
  const [data, meta] = await db.rainyDaysProduct.paginate().withPages()

  return { data, meta }
}

export async function getRainyDaysProduct(id: string) {
  const [data, meta] = await db.rainyDaysProduct
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
