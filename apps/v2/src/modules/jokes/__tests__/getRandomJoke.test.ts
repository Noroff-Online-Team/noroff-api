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

describe("[GET] /jokes/random", () => {
  it("should return random joke", async () => {
    const response = await server.inject({
      url: "/jokes/random",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.setup).toBeDefined()
    expect(res.data.punchline).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })
})
