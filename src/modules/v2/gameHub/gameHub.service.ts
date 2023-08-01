import { db } from "@/utils"

export async function getGameHubProducts() {
  const [data, meta] = await db.gameHubProducts.paginate().withPages()

  return { data, meta }
}

export async function getGameHubProduct(id: string) {
  const [data, meta] = await db.gameHubProducts
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
