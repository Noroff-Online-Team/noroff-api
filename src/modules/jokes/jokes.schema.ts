import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const jokeSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  setup: z.string(),
  punchline: z.string()
})

export type JokeSchema = z.infer<typeof jokeSchema>

export const { schemas: jokeSchemas, $ref } = buildJsonSchemas({ jokeSchema })
