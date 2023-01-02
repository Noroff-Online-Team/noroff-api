import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getOnlineShopProducts, getOnlineShopProduct } from "./onlineShop.service"

export async function getOnlineShopProductsHandler() {
  const products = await getOnlineShopProducts()
  return products
}

export async function getOnlineShopProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = request.params
  const product = await getOnlineShopProduct(id)

  if (!product) {
    throw new NotFound("No product with such ID")
  }

  return product
}
