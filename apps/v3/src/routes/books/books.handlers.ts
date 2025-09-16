import type { AppRouteHandler } from "@/types"
import type { Book } from "@prisma/v3-client"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"
import type { GetOneRoute, GetRandomRoute, ListRoute } from "./books.routes"
import { getBook, getBooks, getRandomBook } from "./books.service"

export const list: AppRouteHandler<ListRoute> = async c => {
  const query = c.req.valid("query")
  const { sort, sortOrder, limit, page } = query

  if (limit && limit > 100) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: "Limit cannot be greater than 100"
    })
  }

  const books = await getBooks(
    (sort as keyof Book) || "id",
    (sortOrder as "asc" | "desc") || "asc",
    limit,
    page
  )

  if (!books.data.length) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: "Couldn't find any books."
    })
  }

  return c.json(books, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async c => {
  const { id } = c.req.valid("param")

  const result = await getBook(id)

  if (!result.data) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: "No book with such ID"
    })
  }

  return c.json(result, HttpStatusCodes.OK)
}

export const getRandom: AppRouteHandler<GetRandomRoute> = async c => {
  const result = await getRandomBook()

  if (!result.data) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: "Couldn't find any books."
    })
  }

  return c.json(result, HttpStatusCodes.OK)
}
