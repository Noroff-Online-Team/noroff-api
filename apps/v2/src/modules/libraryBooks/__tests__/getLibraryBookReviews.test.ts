import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "6d366279-e68b-4331-a31f-dc1575acd34e"
const NONEXISTENT_BOOK_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let SECOND_USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
  alt: "The Great Gatsby book cover"
}

const testBookData = {
  title: "The Great Gatsby",
  description: "A classic American novel set in the Jazz Age.",
  metadata: {
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publicationDate: "1925-04-10T00:00:00.000Z",
    publisher: "Charles Scribner's Sons",
    pageCount: 180,
    language: "English",
    genres: ["Fiction", "Classic Literature"],
    format: "Hardcover"
  }
}

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { name: secondName, bearerToken: secondBearerToken } =
    await getAuthCredentials({
      name: "test_user_two",
      email: "test_user_two@noroff.no"
    })

  USER_NAME = name
  SECOND_USER_NAME = secondName
  BEARER_TOKEN = bearerToken
  SECOND_BEARER_TOKEN = secondBearerToken
  API_KEY = apiKey

  await db.libraryBook.create({
    data: {
      id: BOOK_ID,
      ...testBookData,
      image: { create: DEFAULT_IMAGE },
      ownerName: USER_NAME
    }
  })

  await db.libraryBookReview.createMany({
    data: [
      {
        id: "57d036c2-0494-4217-a50e-6939d679d197",
        rating: 5,
        comment: "An absolute masterpiece!",
        bookId: BOOK_ID,
        reviewerName: SECOND_USER_NAME
      },
      {
        id: "7682e5e5-f2e0-4cda-960f-84756b568fdb",
        rating: 4,
        comment: "Great book, highly recommend.",
        bookId: BOOK_ID,
        reviewerName: USER_NAME
      },
      {
        id: "ebcb62a4-7ea4-4bfd-95c5-7008ffcbcdcd",
        rating: 3,
        comment: "Good but not amazing.",
        bookId: BOOK_ID,
        reviewerName: SECOND_USER_NAME
      }
    ]
  })
})

afterEach(async () => {
  const reviews = db.libraryBookReview.deleteMany()
  const libraryBooks = db.libraryBook.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([reviews, libraryBooks, users, media])
  await db.$disconnect()
})

describe("[GET] /library-books/:id/reviews", () => {
  it("should return all reviews for a book", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(3)
    expect(res.data[0]).toMatchObject({
      id: expect.any(String),
      rating: expect.any(Number),
      comment: expect.any(String),
      reviewer: {
        name: expect.any(String)
      },
      book: {
        id: BOOK_ID,
        title: "The Great Gatsby"
      }
    })
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 3
    })
  })

  it("should support pagination", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews?limit=2&page=1`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: false,
      currentPage: 1,
      previousPage: null,
      nextPage: 2,
      pageCount: 2,
      totalCount: 3
    })
  })

  it("should return empty array when book has no reviews", async () => {
    await db.libraryBookReview.deleteMany({
      where: { bookId: BOOK_ID }
    })

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(0)
    expect(res.meta.totalCount).toBe(0)
  })

  it("should return 404 if book does not exist", async () => {
    const response = await server.inject({
      url: `/library-books/${NONEXISTENT_BOOK_ID}/reviews`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No library book with such ID"
    })
  })

  it("should validate pagination parameters", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews?page=0`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
  })

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/library-books/invalid_id/reviews",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "ID must be a valid UUID",
      path: ["id"]
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "GET",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    })

    expect(response.statusCode).toBe(401)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No API key header was found"
    })
  })
})
