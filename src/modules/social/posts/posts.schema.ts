import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

export const postSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
  tags: z.string().array().optional(),
  media: z.string().optional(),
  userId: z.number().int().optional(),
})

export type PostSchema = z.infer<typeof postSchema>

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  { postSchema },
  { $id: "Posts" }
)
