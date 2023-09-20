import { server } from "@/test-utils"

describe("[GET] /status", () => {
  it("should return 200 OK", async () => {
    const response = await server.inject({ url: "/status" })
    expect(response.statusCode).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({ status: "OK" })
  })
})
