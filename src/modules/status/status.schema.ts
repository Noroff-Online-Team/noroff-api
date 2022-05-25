import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const statusSchema = z.object({
  status: z.string()
})

export type StatusSchema = z.infer<typeof statusSchema>

export const { schemas: statusSchemas, $ref } = buildJsonSchemas({
  statusSchema
})
