import type { PantryItem } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type CreatePantryItemSchema,
  type UpdatePantryItemSchema,
  createPantryItemSchema,
  pantryItemParamsSchema,
  pantryItemsQuerySchema,
  updatePantryItemSchema
} from "./pantry.schema"
import {
  createPantryItem,
  deletePantryItem,
  getPantryItem,
  getPantryItems,
  updatePantryItem
} from "./pantry.service"

export async function getPantryItemsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof PantryItem
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await pantryItemsQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query
  const { name } = request.user as RequestUser

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const pantryItems = await getPantryItems(name, sort, sortOrder, limit, page)

  return pantryItems
}

export async function createPantryItemHandler(
  request: FastifyRequest<{
    Body: CreatePantryItemSchema
  }>,
  reply: FastifyReply
) {
  const data = await createPantryItemSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const pantryItem = await createPantryItem(name, data)

  reply.code(201).send(pantryItem)
}

export async function updatePantryItemHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdatePantryItemSchema
  }>
) {
  const { id } = await pantryItemParamsSchema.parseAsync(request.params)
  const data = await updatePantryItemSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const pantryItem = await getPantryItem(id)

  if (!pantryItem.data) {
    throw new NotFound("No pantry item with such ID")
  }

  if (name.toLowerCase() !== pantryItem.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this pantry item")
  }

  const updatedPantryItem = await updatePantryItem(id, data)

  return updatedPantryItem
}

export async function deletePantryItemHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await pantryItemParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const pantryItem = await getPantryItem(id)

  if (!pantryItem.data) {
    throw new NotFound("No pantry item with such ID")
  }

  if (name.toLowerCase() !== pantryItem.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this pantry item")
  }

  await deletePantryItem(id)

  reply.code(204)
}
