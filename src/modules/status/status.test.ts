import { test } from "tap"
import buildServer from "../../server"

test("requests the `/status` route", async t => {
  const server = buildServer()

  t.teardown(() => {
    server.close()
  })

  const res = await server.inject({
    method: "GET",
    url: "/status"
  })

  t.equal(res.statusCode, 200, "returns status code of 200")
  t.same(res.json(), { status: "OK" }, 'returns correct "OK" response')
  t.equal(res.headers["content-type"], "application/json; charset=utf-8", "returns application/json content-type")
})
