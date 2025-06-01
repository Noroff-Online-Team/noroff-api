import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "6d366279-e68b-4331-a31f-dc1575acd34e"
const REVIEW_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
const NONEXISTENT_BOOK_ID = "c013320c-27c6-4c6b-a799-9ee346be2020"
const NONEXISTENT_REVIEW_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
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
    format: "Hardcover",
    price: 12.99
  }
}

const originalReviewData = {
  rating: 4,
  comment: "A good book with interesting themes."
}

const updateData = {
  rating: 5,
  comment:
    "After re-reading this, I have to say it's an absolute masterpiece! The symbolism and character development are incredible."
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

  await db.libraryBookReview.create({
    data: {
      id: REVIEW_ID,
      ...originalReviewData,
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

describe("[PUT] /library/:id/reviews/:reviewId", () => {
  it("should return 200 when successfully updated a review", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: REVIEW_ID,
      rating: 5,
      comment:
        "After re-reading this, I have to say it's an absolute masterpiece! The symbolism and character development are incredible.",
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

  it("should update only provided fields", async () => {
    const partialUpdate = {
      rating: 3
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: partialUpdate
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.rating).toBe(3)
    expect(res.data.comment).toBe(originalReviewData.comment)
  })

  it("should update only comment", async () => {
    const commentUpdate = {
      comment: "Updated my thoughts on this book."
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: commentUpdate
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.comment).toBe("Updated my thoughts on this book.")
    expect(res.data.rating).toBe(originalReviewData.rating)
  })

  it("should return 404 if review does not exist", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${NONEXISTENT_REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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
      url: `/library/${NONEXISTENT_BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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

  it("should throw 403 if trying to update someone else's review", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to update this review"
    })
  })

  it("should validate rating range (too high)", async () => {
    const invalidUpdate = {
      rating: 6,
      comment: "Rating too high"
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidUpdate
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

  it("should validate rating range (too low)", async () => {
    const invalidUpdate = {
      rating: 0,
      comment: "Rating too low"
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidUpdate
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
    const invalidUpdate = {
      rating: 5,
      comment: "a".repeat(1001)
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidUpdate
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

  it("should throw error if no fields are provided to update", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toStrictEqual([
      {
        code: "custom",
        message: "You must provide at least one field to update",
        path: []
      }
    ])
  })

  it("should throw zod error if reviewId is not a valid UUID", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/invalid_id`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        rating: 5
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
      url: `/library/invalid_id/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        rating: 5
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
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        rating: 5
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}/reviews/${REVIEW_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`
      },
      payload: {
        rating: 5
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
