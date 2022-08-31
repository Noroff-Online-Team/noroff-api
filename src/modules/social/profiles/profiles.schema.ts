import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"
import { postSchema } from "../posts/posts.schema"

export const profileSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  posts: postSchema.array().optional()
})

export type ProfileSchema = z.infer<typeof profileSchema>

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { profileSchema },
  { $id: "Profiles" }
)
