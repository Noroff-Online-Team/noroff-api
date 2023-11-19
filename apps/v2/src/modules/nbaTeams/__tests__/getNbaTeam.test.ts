import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "NbaTeam_id_seq" RESTART WITH 1;`
  await db.nbaTeam.createMany({
    data: [
      {
        city: "Atlanta",
        abbreviation: "ATL",
        conference: "East",
        division: "Southeast",
        full_name: "Atlanta Hawks",
        name: "Hawks"
      },
      {
        city: "Boston",
        abbreviation: "BOS",
        conference: "East",
        division: "Atlantic",
        full_name: "Boston Celtics",
        name: "Celtics"
      }
    ]
  })
})

afterEach(async () => {
  const nbaTeam = db.nbaTeam.deleteMany()

  await db.$transaction([nbaTeam])
  await db.$disconnect()
})

describe("[GET] /nba-teams/:id", () => {
  it("should return single NBA team based on id", async () => {
    const response = await server.inject({
      url: "/nba-teams/1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.city).toBe("Atlanta")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if NBA team not found", async () => {
    const response = await server.inject({
      url: "/nba-teams/3",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No NBA team with such ID"
    })
  })

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/nba-teams/invalid_id",
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
