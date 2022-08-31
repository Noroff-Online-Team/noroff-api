import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const profileSchema = z.object({
  id: z.number().int(),
  name: z.string()
})

export type ProfileSchema = z.infer<typeof profileSchema>

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { profileSchema },
  { $id: "Profiles" }
)
