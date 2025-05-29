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

const reviewData = {
  rating: 5,
  comment:
    "An absolute masterpiece! Fitzgerald's writing is beautiful and the story is timeless."
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
})

afterEach(async () => {
  const reviews = db.libraryBookReview.deleteMany()
  const libraryBooks = db.libraryBook.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([reviews, libraryBooks, users, media])
  await db.$disconnect()
})

describe("[POST] /library-books/:id/reviews", () => {
  it("should return 201 when successfully created a review", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      rating: 5,
      comment:
        "An absolute masterpiece! Fitzgerald's writing is beautiful and the story is timeless.",
      reviewer: {
        name: SECOND_USER_NAME
      },
      book: {
        id: BOOK_ID,
        title: "The Great Gatsby"
      }
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if book does not exist", async () => {
    const response = await server.inject({
      url: `/library-books/${NONEXISTENT_BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
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

  it("should prevent duplicate reviews from the same user", async () => {
    await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
      }
    })

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        rating: 3,
        comment: "Changed my mind"
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(409)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You have already reviewed this book"
    })
  })

  it("should prevent book owner from reviewing their own book", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You cannot review your own book"
    })
  })

  it("should validate rating range", async () => {
    const invalidReview = {
      rating: 6,
      comment: "Rating too high"
    }

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidReview
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_big",
      message: "Rating cannot be greater than 5",
      path: ["rating"]
    })
  })

  it("should validate minimum rating", async () => {
    const invalidReview = {
      rating: 0,
      comment: "Rating too low"
    }

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidReview
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_small",
      message: "Rating cannot be less than 1",
      path: ["rating"]
    })
  })

  it("should validate comment length", async () => {
    const invalidReview = {
      rating: 5,
      comment: "a".repeat(1001)
    }

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidReview
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_big",
      message: "Comment cannot be greater than 280 characters",
      path: ["comment"]
    })
  })

  it("should require rating field", async () => {
    const invalidReview = {
      comment: "Great book but missing rating"
    }

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidReview
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Rating is required",
      path: ["rating"]
    })
  })

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/library-books/invalid_id/reviews",
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
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
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...reviewData
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}/reviews`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`
      },
      payload: {
        ...reviewData
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
