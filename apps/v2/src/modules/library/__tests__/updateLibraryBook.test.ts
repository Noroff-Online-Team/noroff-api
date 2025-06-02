import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOK_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
  alt: "The Great Gatsby book cover"
}

const originalData = {
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

const updateData = {
  title: "The Great Gatsby (Revised Edition)",
  description:
    "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
  metadata: {
    publisher: "Scribner",
    pageCount: 200,
    genres: ["Fiction", "Classic Literature", "American Literature"],
    price: 15.99
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
      ...originalData,
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

describe("[PUT] /library/:id", () => {
  it("should return 200 when successfully updated a library book", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
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

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: BOOK_ID,
      title: "The Great Gatsby (Revised Edition)",
      description:
        "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      metadata: {
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        publicationDate: "1925-04-10T00:00:00.000Z",
        publisher: "Scribner",
        pageCount: 200,
        language: "English",
        genres: ["Fiction", "Classic Literature", "American Literature"],
        format: "Hardcover",
        price: 15.99
      },
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      },
      owner: {
        name: USER_NAME
      }
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should update only provided fields", async () => {
    const partialUpdate = {
      title: "Updated Title Only"
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: partialUpdate
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.title).toBe("Updated Title Only")
    expect(res.data.description).toBe(originalData.description)
    expect(res.data.metadata.author).toBe(originalData.metadata.author)
  })

  it("should update metadata fields independently", async () => {
    const metadataUpdate = {
      metadata: {
        pageCount: 250
      }
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: metadataUpdate
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.metadata.pageCount).toBe(250)
    expect(res.data.metadata.author).toBe(originalData.metadata.author)
    expect(res.data.metadata.isbn).toBe(originalData.metadata.isbn)
  })

  it("should return 404 if library book does not exist", async () => {
    const response = await server.inject({
      url: "/library/a9f8e5d4-3c2b-1f0e-9d8c-7b6a5e4d3c2b",
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

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No library book with such ID"
    })
  })

  it("should throw 403 if trying to update someone else's book", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
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

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to update this library book"
    })
  })

  it("should throw validation error if update data is invalid", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        metadata: {
          pageCount: -5
        }
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual(
      expect.objectContaining({
        message: "Page count must be at least 1"
      })
    )
  })

  it("should throw error if no fields are provided to update", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
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

  it("should validate image URL when updating", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        image: {
          url: "invalid-url",
          alt: "Invalid URL test"
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "Image URL must be valid URL",
      path: ["image", "url"]
    })
  })

  it("should validate ISBN format when updating", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        metadata: {
          isbn: "invalid-isbn"
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_string",
      message: "ISBN must be a valid 10 or 13 digit ISBN",
      path: ["metadata", "isbn"]
    })
  })

  it("should validate format enum when updating", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        metadata: {
          format: "InvalidFormat"
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_enum_value",
      message: "Format must be one of: Hardcover, Paperback, eBook, Audiobook",
      path: ["metadata", "format"]
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        title: "Updated Title"
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        title: "Updated Title"
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

  it("should validate price is not negative when updating", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        metadata: {
          price: -5.99
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_small",
      message: "Price cannot be negative",
      path: ["metadata", "price"]
    })
  })

  it("should validate price does not exceed maximum when updating", async () => {
    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        metadata: {
          price: 100000
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_big",
      message: "Price cannot exceed $99,999.99",
      path: ["metadata", "price"]
    })
  })

  it("should update metadata price independently", async () => {
    const priceUpdate = {
      metadata: {
        price: 25.99
      }
    }

    const response = await server.inject({
      url: `/library/${BOOK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: priceUpdate
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.metadata.price).toBe(25.99)
    expect(res.data.metadata.author).toBe(originalData.metadata.author)
    expect(res.data.metadata.isbn).toBe(originalData.metadata.isbn)
  })
})
