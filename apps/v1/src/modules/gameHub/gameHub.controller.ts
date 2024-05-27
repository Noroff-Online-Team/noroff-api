import type { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getGameHubProduct, getGameHubProducts } from "./gameHub.service"

export async function getGameHubProductsHandler() {
  const products = await getGameHubProducts()
  return products
}

export async function getGameHubProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = request.params
  const product = await getGameHubProduct(id)

  if (!product) {
    throw new NotFound("No product with such ID")
  }

  return product
}
