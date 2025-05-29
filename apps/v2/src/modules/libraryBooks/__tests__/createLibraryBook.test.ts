import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
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
    format: "Hardcover"
  },
  image: {
    url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
    alt: "The Great Gatsby book cover"
  }
}

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
})

afterEach(async () => {
  const libraryBooks = db.libraryBook.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([libraryBooks, users, media])
  await db.$disconnect()
})

describe("[POST] /library-books", () => {
  it("should return 201 when successfully created a library book", async () => {
    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
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
        format: "Hardcover"
      },
      image: {
        url: createData.image.url,
        alt: createData.image.alt
      },
      owner: {
        name: USER_NAME
      },
      reviews: []
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should create book with minimal required data", async () => {
    const minimalData = {
      title: "1984",
      description: "A dystopian social science fiction novel.",
      metadata: {
        author: "George Orwell",
        publicationDate: "1949-06-08T00:00:00.000Z"
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: minimalData
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      title: "1984",
      description: "A dystopian social science fiction novel.",
      metadata: {
        author: "George Orwell",
        publicationDate: "1949-06-08T00:00:00.000Z",
        language: "English",
        format: "Paperback"
      },
      owner: {
        name: USER_NAME
      }
    })
  })

  it("should throw zod errors if required data is missing", async () => {
    const { title, ...rest } = createData
    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...rest
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors.length).toBeGreaterThan(0)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Title is required",
      path: ["title"]
    })
  })

  it("should throw zod errors if metadata is missing required fields", async () => {
    const invalidData = {
      ...createData,
      metadata: {
        isbn: "9780743273565"
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidData
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Author is required",
      path: ["metadata", "author"]
    })
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Publication date is required",
      path: ["metadata", "publicationDate"]
    })
  })

  it("should validate ISBN format", async () => {
    const invalidData = {
      ...createData,
      metadata: {
        ...createData.metadata,
        isbn: "invalid-isbn"
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidData
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_string",
      message: "ISBN must be a valid 10 or 13 digit ISBN",
      path: ["metadata", "isbn"]
    })
  })

  it("should validate format enum", async () => {
    const invalidData = {
      ...createData,
      metadata: {
        ...createData.metadata,
        format: "InvalidFormat"
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidData
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_enum_value",
      message: "Format must be one of: Hardcover, Paperback, eBook, Audiobook",
      path: ["metadata", "format"]
    })
  })

  it("should validate page count range", async () => {
    const invalidData = {
      ...createData,
      metadata: {
        ...createData.metadata,
        pageCount: -5
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidData
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_small",
      message: "Page count must be at least 1",
      path: ["metadata", "pageCount"]
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...createData
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

  it("should validate image URL", async () => {
    const { image, ...rest } = createData
    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...rest,
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

  it("should validate genres array length", async () => {
    const invalidData = {
      ...createData,
      metadata: {
        ...createData.metadata,
        genres: Array(10).fill("Genre")
      }
    }

    const response = await server.inject({
      url: "/library-books",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: invalidData
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "too_big",
      message: "Array must contain at most 8 element(s)",
      path: ["metadata", "genres"]
    })
  })
})
