import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "6d366279-e68b-4331-a31f-dc1575acd34e"
const REVIEW_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
const NONEXISTENT_BOOK_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
const NONEXISTENT_REVIEW_ID = "a14d2ba8-4a94-47dc-9f33-6d32500cf117"
let BEARER_TOKEN = ""
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
  const { name: secondName } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  SECOND_USER_NAME = secondName
  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.libraryBook.create({
    data: {
      id: BOOK_ID,
      ...testBookData,
      image: { create: DEFAULT_IMAGE },
      ownerName: USER_NAME
    }
  })

  await db.libraryBookReview.create({
    data: {
      id: REVIEW_ID,
      rating: 5,
      comment:
        "An absolute masterpiece! This book perfectly captures the Jazz Age.",
      bookId: BOOK_ID,
      reviewerName: SECOND_USER_NAME
    }
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

describe("[GET] /library-books/:id/reviews/:reviewId", () => {
  it("should return single review based on id", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: REVIEW_ID,
      rating: 5,
      comment:
        "An absolute masterpiece! This book perfectly captures the Jazz Age.",
      reviewer: {
        name: SECOND_USER_NAME
      },
      book: {
        id: BOOK_ID,
        title: "The Great Gatsby",
        image: {
          url: DEFAULT_IMAGE.url,
          alt: DEFAULT_IMAGE.alt
        },
        owner: {
          name: USER_NAME
        }
      },
      created: expect.any(String),
      updated: expect.any(String)
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if review does not exist", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews/${NONEXISTENT_REVIEW_ID}`,
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
      message: "No review with such ID"
    })
  })

  it("should return 404 if book does not exist", async () => {
    const response = await server.inject({
      url: `/library-books/${NONEXISTENT_BOOK_ID}/reviews/${REVIEW_ID}`,
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

  it("should return 404 if review belongs to different book", async () => {
    const anotherBookId = "6ed7bf0f-6239-47eb-84ba-7b5c47c23466"
    await db.libraryBook.create({
      data: {
        id: anotherBookId,
        title: "1984",
        description: "A dystopian novel.",
        metadata: {
          author: "George Orwell",
          publicationDate: "1949-06-08T00:00:00.000Z"
        },
        ownerName: USER_NAME
      }
    })

    const response = await server.inject({
      url: `/library-books/${anotherBookId}/reviews/${REVIEW_ID}`,
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
      message: "No review with such ID"
    })
  })

  it("should throw zod error if reviewId is not a valid UUID", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews/invalid_id`,
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
      message: "Review ID must be a valid UUID",
      path: ["reviewId"]
    })
  })

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: `/library-books/invalid_id/reviews/${REVIEW_ID}`,
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
      url: `/library-books/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "GET",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews/${REVIEW_ID}`,
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
