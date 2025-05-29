import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
const NONEXISTENT_BOOK_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
  alt: "The Great Gatsby book cover"
}

const testData = {
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
  const { bearerToken: secondBearerToken } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  BEARER_TOKEN = bearerToken
  SECOND_BEARER_TOKEN = secondBearerToken
  API_KEY = apiKey

  await db.libraryBook.create({
    data: {
      id: BOOK_ID,
      ...testData,
      image: { create: DEFAULT_IMAGE },
      ownerName: USER_NAME
    }
  })
})

afterEach(async () => {
  const libraryBooks = db.libraryBook.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([libraryBooks, users, media])
  await db.$disconnect()
})

describe("[DELETE] /library-books/:id", () => {
  it("should return 204 when successfully deleted a library book", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)
    expect(response.payload).toBe("")

    const checkResponse = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    expect(checkResponse.statusCode).toBe(404)
  })

  it("should delete associated reviews when deleting a book", async () => {
    await db.libraryBookReview.create({
      data: {
        rating: 5,
        comment: "Great book!",
        bookId: BOOK_ID,
        reviewerName: USER_NAME
      }
    })

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    const reviews = await db.libraryBookReview.findMany({
      where: { bookId: BOOK_ID }
    })
    expect(reviews).toHaveLength(0)
  })

  it("should delete associated image when deleting a book", async () => {
    const book = await db.libraryBook.findUnique({
      where: { id: BOOK_ID },
      include: { image: true }
    })
    const imageId = book?.image?.id

    const response = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    if (imageId) {
      const image = await db.media.findUnique({
        where: { id: imageId }
      })
      expect(image).toBeNull()
    }
  })

  it("should return 404 if library book does not exist", async () => {
    const response = await server.inject({
      url: `/library-books/${NONEXISTENT_BOOK_ID}`,
      method: "DELETE",
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

  it("should throw 403 if trying to delete someone else's book", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to delete this library book"
    })
  })

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/library-books/invalid_id",
      method: "DELETE",
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
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library-books/${BOOK_ID}`,
      method: "DELETE",
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
