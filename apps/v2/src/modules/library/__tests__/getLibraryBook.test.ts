import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "6d366279-e68b-4331-a31f-dc1575acd34e"
const NONEXISTENT_BOOK_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
let USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
  alt: "The Great Gatsby book cover"
}

const DEFAULT_METADATA = {
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

beforeEach(async () => {
  const { name } = await registerUser()
  const { bearerToken, apiKey } = await getAuthCredentials()

  USER_NAME = name
  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.libraryBook.create({
    data: {
      id: BOOK_ID,
      title: "The Great Gatsby",
      description:
        "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      metadata: DEFAULT_METADATA,
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

describe("[GET] /library/:id", () => {
  it("should return single library book based on id", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: BOOK_ID,
      title: "The Great Gatsby",
      description:
        "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
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
      },
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      },
      owner: {
        name: USER_NAME
      },
      reviews: []
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should include reviews when present", async () => {
    await db.libraryBookReview.create({
      data: {
        rating: 5,
        comment: "An absolute masterpiece!",
        bookId: BOOK_ID,
        reviewerName: USER_NAME
      }
    })

    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.reviews).toHaveLength(1)
    expect(res.data.reviews[0]).toMatchObject({
      id: expect.any(String),
      rating: 5,
      comment: "An absolute masterpiece!",
      reviewer: {
        name: USER_NAME
      }
    })
  })

  it("should return 404 if library book not found", async () => {
    const response = await server.inject({
      url: `/library/${NONEXISTENT_BOOK_ID}`,
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

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/library/invalid_id",
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
      url: `/library/${BOOK_ID}`,
      method: "GET",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
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
