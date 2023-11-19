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

describe("[GET] /nba-teams/random", () => {
  it("should return random NBA team", async () => {
    const response = await server.inject({
      url: "/nba-teams/random",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.city).toBeDefined()
    expect(res.data.abbreviation).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })
})
