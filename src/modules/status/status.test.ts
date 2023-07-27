import { test } from "tap"
import buildServer from "../../server"

test("Status endpoint", async t => {
  const server = buildServer()

  t.teardown(() => {
    server.close()
  })

  t.test("GET /status", async t => {
    const res = await server.inject({
      method: "GET",
      url: "/status"
    })

    t.equal(res.statusCode, 200, "returns status code of 200")
    t.same(res.json(), { status: "OK" }, 'returns correct "OK" response')
    t.equal(res.headers["content-type"], "application/json; charset=utf-8", "returns application/json content-type")
  })

  t.test("POST /status", async t => {
    const res = await server.inject({
      method: "POST",
      url: "/status"
    })

    const expected = {
      errors: [
        {
          message: "Route POST:/status not found"
        }
      ],
      status: "Not Found",
      statusCode: 404
    }

    t.equal(res.statusCode, 404, "returns status code of 404")
    t.same(res.json(), expected, "returns correct 404 response")
    t.equal(res.headers["content-type"], "application/json; charset=utf-8", "returns application/json content-type")
  })
})
