import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "CatFact_id_seq" RESTART WITH 1;`
  await db.catFact.createMany({
    data: [
      {
        text: "On average, cats spend 2/3 of every day sleeping"
      },
      {
        text: "Unlike dogs, cats do not have a sweet tooth"
      }
    ]
  })
})

afterEach(async () => {
  const catFacts = db.catFact.deleteMany()

  await db.$transaction([catFacts])
  await db.$disconnect()
})

describe("[GET] /cat-facts", () => {
  it("should return all cat facts", async () => {
    const response = await server.inject({
      url: "/cat-facts",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].text).toBe("On average, cats spend 2/3 of every day sleeping")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].text).toBe("Unlike dogs, cats do not have a sweet tooth")
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

  it("should return all cat facts with sort", async () => {
    const response = await server.inject({
      url: "/cat-facts?sort=text&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].text).toBe("Unlike dogs, cats do not have a sweet tooth")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].text).toBe("On average, cats spend 2/3 of every day sleeping")
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

  it("should return all cat facts with pagination", async () => {
    const response = await server.inject({
      url: "/cat-facts?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].text).toBe("On average, cats spend 2/3 of every day sleeping")
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
