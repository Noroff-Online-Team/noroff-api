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

describe("[GET] /cat-facts/random", () => {
  it("should return random cat fact", async () => {
    const response = await server.inject({
      url: "/cat-facts/random",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.text).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })
})
