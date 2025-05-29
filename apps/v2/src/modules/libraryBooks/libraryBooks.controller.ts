import { mediaGuard } from "@noroff/api-utils"
import type { LibraryBook, LibraryBookReview } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Conflict, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type CreateLibraryBookReviewSchema,
  type CreateLibraryBookSchema,
  type UpdateLibraryBookReviewSchema,
  type UpdateLibraryBookSchema,
  createLibraryBookReviewSchema,
  createLibraryBookSchema,
  libraryBookParamsSchema,
  libraryBookReviewParamsSchema,
  libraryBookReviewsQuerySchema,
  libraryBooksQuerySchema,
  updateLibraryBookReviewSchema,
  updateLibraryBookSchema
} from "./libraryBooks.schema"

import {
  createLibraryBook,
  createLibraryBookReview,
  deleteLibraryBook,
  deleteLibraryBookReview,
  getLibraryBook,
  getLibraryBookReview,
  getLibraryBookReviews,
  getLibraryBooks,
  updateLibraryBook,
  updateLibraryBookReview
} from "./libraryBooks.service"

export async function getLibraryBooksHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof LibraryBook
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await libraryBooksQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const libraryBooks = await getLibraryBooks(sort, sortOrder, limit, page)

  return libraryBooks
}

export async function getLibraryBookHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = await libraryBookParamsSchema.parseAsync(request.params)

  const libraryBook = await getLibraryBook(id)

  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  return libraryBook
}

export async function createLibraryBookHandler(
  request: FastifyRequest<{
    Body: CreateLibraryBookSchema
  }>,
  reply: FastifyReply
) {
  const data = await createLibraryBookSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser
  const { image } = data

  if (image?.url) {
    await mediaGuard(image.url)
  }

  const libraryBook = await createLibraryBook(name, data)

  reply.code(201).send(libraryBook)
}

export async function updateLibraryBookHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateLibraryBookSchema
  }>
) {
  const { id } = await libraryBookParamsSchema.parseAsync(request.params)
  const data = await updateLibraryBookSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser
  const { image } = data

  const libraryBook = await getLibraryBook(id)

  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  if (name.toLowerCase() !== libraryBook.data.ownerName.toLowerCase()) {
    throw new Forbidden(
      "You do not have permission to update this library book"
    )
  }

  if (image?.url) {
    await mediaGuard(image.url)
  }

  const updatedLibraryBook = await updateLibraryBook(id, data)

  return updatedLibraryBook
}

export async function deleteLibraryBookHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await libraryBookParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const libraryBook = await getLibraryBook(id)

  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  if (name.toLowerCase() !== libraryBook.data.ownerName.toLowerCase()) {
    throw new Forbidden(
      "You do not have permission to delete this library book"
    )
  }

  await deleteLibraryBook(id)

  reply.code(204)
}

export async function getLibraryBookReviewsHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof LibraryBookReview
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  const { id } = await libraryBookParamsSchema.parseAsync(request.params)
  await libraryBookReviewsQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const libraryBook = await getLibraryBook(id)
  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  const reviews = await getLibraryBookReviews(id, sort, sortOrder, limit, page)

  return reviews
}

export async function getLibraryBookReviewHandler(
  request: FastifyRequest<{
    Params: { id: string; reviewId: string }
  }>
) {
  const { id, reviewId } = await libraryBookReviewParamsSchema.parseAsync(
    request.params
  )

  const libraryBook = await getLibraryBook(id)
  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  const review = await getLibraryBookReview(reviewId)

  if (!review.data) {
    throw new NotFound("No review with such ID")
  }

  if (review.data.bookId.toLowerCase() !== id.toLowerCase()) {
    throw new NotFound("No review with such ID")
  }

  return review
}

export async function createLibraryBookReviewHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: CreateLibraryBookReviewSchema
  }>,
  reply: FastifyReply
) {
  const { id } = await libraryBookParamsSchema.parseAsync(request.params)
  const data = await createLibraryBookReviewSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const libraryBook = await getLibraryBook(id)

  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  const reviews = await getLibraryBookReviews(id)

  if (
    reviews.data?.some(
      r => r?.reviewerName.toLowerCase() === name.toLowerCase()
    )
  ) {
    throw new Conflict("You have already reviewed this book")
  }

  const review = await createLibraryBookReview(id, name, data)

  if (libraryBook.data.ownerName.toLowerCase() === name.toLowerCase()) {
    throw new Forbidden("You cannot review your own book")
  }

  reply.code(201).send(review)
}

export async function updateLibraryBookReviewHandler(
  request: FastifyRequest<{
    Params: { id: string; reviewId: string }
    Body: UpdateLibraryBookReviewSchema
  }>
) {
  const { id, reviewId } = await libraryBookReviewParamsSchema.parseAsync(
    request.params
  )
  const data = await updateLibraryBookReviewSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const libraryBook = await getLibraryBook(id)
  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  const review = await getLibraryBookReview(reviewId)

  if (!review.data) {
    throw new NotFound("No review with such ID")
  }

  if (name.toLowerCase() !== review.data.reviewerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this review")
  }

  const updatedReview = await updateLibraryBookReview(reviewId, data)

  return updatedReview
}

export async function deleteLibraryBookReviewHandler(
  request: FastifyRequest<{
    Params: { id: string; reviewId: string }
  }>,
  reply: FastifyReply
) {
  const { id, reviewId } = await libraryBookReviewParamsSchema.parseAsync(
    request.params
  )
  const { name } = request.user as RequestUser

  const libraryBook = await getLibraryBook(id)
  if (!libraryBook.data) {
    throw new NotFound("No library book with such ID")
  }

  const review = await getLibraryBookReview(reviewId)

  if (!review.data) {
    throw new NotFound("No review with such ID")
  }

  const isBookOwner =
    name.toLowerCase() === libraryBook.data.ownerName.toLowerCase()
  const isReviewer =
    name.toLowerCase() === review.data.reviewerName.toLowerCase()

  if (!isReviewer && !isBookOwner) {
    throw new Forbidden("You do not have permission to delete this review")
  }

  await deleteLibraryBookReview(reviewId)

  reply.code(204)
}
