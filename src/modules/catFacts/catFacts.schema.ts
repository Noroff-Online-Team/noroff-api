import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const catFactSchema = z.object({
  id: z.number().int(),
  text: z.string()
})

export type CatFactSchema = z.infer<typeof catFactSchema>

export const { schemas: catFactSchemas, $ref } = buildJsonSchemas(
  { catFactSchema },
  { $id: "CatFacts" }
)
