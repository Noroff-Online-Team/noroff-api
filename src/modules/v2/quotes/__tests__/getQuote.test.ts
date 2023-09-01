import { server } from "@/test-utils"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "Quote_id_seq" RESTART WITH 1;`
  await db.quote.createMany({
    data: [
      {
        content: "The Superior Man is aware of Righteousness, the inferior man is aware of advantage.",
        author: "Confucius",
        tags: ["famous-quotes"],
        authorId: "ropvZKOXYhLr",
        authorSlug: "confucius",
        length: 83
      },
      {
        content:
          "America's freedom of religion, and freedom from religion, offers every wisdom tradition an opportunity to address our soul-deep needs: Christianity, Judaism, Islam, Buddhism, Hinduism, secular humanism, agnosticism and atheism among others.",
        author: "Parker Palmer",
        tags: ["wisdom"],
        authorId: "XPDojD6THK",
        authorSlug: "parker-palmer",
        length: 240
      }
    ]
  })

  // Register user
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })

  // Login user
  const user = await server.inject({
    url: "/api/v2/auth/login",
    method: "POST",
    payload: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })
  const bearerToken = user.json().data.accessToken

  // Create API key
  const apiKey = await server.inject({
    url: "/api/v2/auth/create-api-key",
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey.json().data.key
})

afterEach(async () => {
  const quotes = db.quote.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([quotes, apiKey, users])
  await db.$disconnect()
})

describe("[GET] /v2/quotes/:id", () => {
  it("should return single quote based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/quotes/1",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return 404 if quote not found", async () => {
    const response = await server.inject({
      url: "/api/v2/quotes/3",
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
    expect(res.errors[0].message).toBe("No quote with such ID")
  })

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/api/v2/quotes/invalid_id",
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
    expect(res.errors[0].message).toBe("ID must be a number")
  })
})
