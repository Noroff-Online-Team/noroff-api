import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""
let SECOND_USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&fit=crop",
  alt: "Book cover"
}

const BOOK_UUIDS = [
  "f229424c-da96-4725-b112-4a880cc7f2e0",
  "f65d389d-694a-4d7e-b6bf-d27229c28848",
  "b6e9956f-f257-4bbf-be3f-c4ea710e68f3"
]

beforeEach(async () => {
  const { name } = await registerUser()
  const { name: secondName } = await registerUser({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })
  const { bearerToken, apiKey } = await getAuthCredentials()

  USER_NAME = name
  SECOND_USER_NAME = secondName
  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.libraryBook.createMany({
    data: [
      {
        id: BOOK_UUIDS[0],
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
        },
        ownerName: USER_NAME
      },
      {
        id: BOOK_UUIDS[1],
        title: "1984",
        description: "A dystopian social science fiction novel.",
        metadata: {
          author: "George Orwell",
          isbn: "9780451524935",
          publicationDate: "1949-06-08T00:00:00.000Z",
          publisher: "Secker & Warburg",
          pageCount: 328,
          language: "English",
          genres: ["Science Fiction", "Dystopian"],
          format: "Paperback"
        },
        ownerName: SECOND_USER_NAME
      },
      {
        id: BOOK_UUIDS[2],
        title: "To Kill a Mockingbird",
        description: "A novel about racial injustice and loss of innocence.",
        metadata: {
          author: "Harper Lee",
          isbn: "9780061120084",
          publicationDate: "1960-07-11T00:00:00.000Z",
          publisher: "J.B. Lippincott & Co.",
          pageCount: 281,
          language: "English",
          genres: ["Fiction", "Drama"],
          format: "Paperback"
        },
        ownerName: USER_NAME
      }
    ]
  })

  for (let i = 1; i <= 3; i++) {
    await db.media.create({
      data: {
        ...DEFAULT_IMAGE,
        libraryBookId: BOOK_UUIDS[i - 1]
      }
    })
  }
})

afterEach(async () => {
  const libraryBooks = db.libraryBook.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([libraryBooks, users, media])
  await db.$disconnect()
})

describe("[GET] /library", () => {
  it("should return all library books", async () => {
    const response = await server.inject({
      url: "/library",
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
      title: expect.any(String),
      description: expect.any(String),
      metadata: expect.objectContaining({
        author: expect.any(String),
        publicationDate: expect.any(String)
      }),
      owner: {
        name: expect.any(String)
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
      url: "/library?limit=2&page=1",
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

  it("should support sorting by title", async () => {
    const response = await server.inject({
      url: "/library?sort=title&sortOrder=desc",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(3)
    expect(res.data[0].title).toBe("To Kill a Mockingbird")
    expect(res.data[1].title).toBe("The Great Gatsby")
    expect(res.data[2].title).toBe("1984")
  })

  it("should validate pagination parameters", async () => {
    const response = await server.inject({
      url: "/library?page=0",
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

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/library",
      method: "GET",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: "/library",
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
