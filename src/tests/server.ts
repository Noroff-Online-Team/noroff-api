import buildServer, { type ServerType } from "@/server"

export let server: ServerType

beforeAll(() => {
  server = buildServer()
})

afterAll(async () => {
  await server.close()
})
