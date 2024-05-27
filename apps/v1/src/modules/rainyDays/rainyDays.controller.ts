import type { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getRainyDaysProduct, getRainyDaysProducts } from "./rainyDays.service"

export async function getRainyDaysProductsHandler() {
  const products = await getRainyDaysProducts()
  return products
}

export async function getRainyDaysProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = request.params
  const product = await getRainyDaysProduct(id)

  if (!product) {
    throw new NotFound("No product with such ID")
  }

  return product
}
