import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const oldGameSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  released: z.string(),
  image: z.string(),
  genre: z.string().array()
})

export type OldGameSchema = z.infer<typeof oldGameSchema>

export const { schemas: oldGameSchemas, $ref } = buildJsonSchemas(
  { oldGameSchema },
  { $id: "OldGames" }
)
