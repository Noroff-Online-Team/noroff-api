import buildServer, { type ServerType } from "@/server"

export let server: ServerType

beforeAll(async () => {
  server = buildServer()
  await server.ready()
})

afterAll(async () => {
  await server.close()
})
