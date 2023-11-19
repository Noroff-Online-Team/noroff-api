import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "Joke_id_seq" RESTART WITH 1;`
  await db.joke.createMany({
    data: [
      {
        type: "general",
        setup: "What did the fish say when it hit the wall?",
        punchline: "Dam."
      },
      {
        type: "general",
        setup: "How do you make a tissue dance?",
        punchline: "You put a little boogie on it."
      }
    ]
  })
})

afterEach(async () => {
  const jokes = db.joke.deleteMany()

  await db.$transaction([jokes])
  await db.$disconnect()
})

describe("[GET] /jokes/:id", () => {
  it("should return single joke based on id", async () => {
    const response = await server.inject({
      url: "/jokes/1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.setup).toBe("What did the fish say when it hit the wall?")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if joke not found", async () => {
    const response = await server.inject({
      url: "/jokes/3",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No joke with such ID"
    })
  })

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/jokes/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_type",
      message: "ID must be a number",
      path: ["id"]
    })
  })
})
