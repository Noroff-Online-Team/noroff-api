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

describe("[GET] /jokes", () => {
  it("should return all jokes", async () => {
    const response = await server.inject({
      url: "/jokes",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].setup).toBe("What did the fish say when it hit the wall?")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].setup).toBe("How do you make a tissue dance?")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all jokes with sort", async () => {
    const response = await server.inject({
      url: "/jokes?sort=setup&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].setup).toBe("What did the fish say when it hit the wall?")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].setup).toBe("How do you make a tissue dance?")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all jokes with pagination", async () => {
    const response = await server.inject({
      url: "/jokes?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].setup).toBe("What did the fish say when it hit the wall?")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: false,
      currentPage: 1,
      previousPage: null,
      nextPage: 2,
      pageCount: 2,
      totalCount: 2
    })
  })
})
