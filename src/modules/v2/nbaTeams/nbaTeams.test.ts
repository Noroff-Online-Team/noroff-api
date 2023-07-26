import { test } from "tap"
import buildServer from "../../../server"

test("NBA teams endpoints", async t => {
  const server = buildServer()

  t.teardown(() => {
    server.close()
  })

  t.test("GET /api/v2/nba-teams", async t => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v2/nba-teams"
    })

    t.equal(res.statusCode, 200, "returns status code of 200")
    t.equal(res.headers["content-type"], "application/json; charset=utf-8", "returns application/json content-type")
  })
})
