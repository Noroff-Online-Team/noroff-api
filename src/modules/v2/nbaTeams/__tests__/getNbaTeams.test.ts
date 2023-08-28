import { server } from "@/tests/server"
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

describe("[GET] /v2/nba-teams", () => {
  it("should return all NBA teams", async () => {
    const response = await server.inject({
      url: "/api/v2/nba-teams",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].city).toBe("Atlanta")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].city).toBe("Boston")
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

  // TODO: Need to implement support for pagination.
  it.skip("should return all NBA teams with pagination", async () => {
    const response = await server.inject({
      url: "/api/v2/nba-teams?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].city).toBe("Atlanta")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 2,
      totalCount: 2
    })
  })
})
